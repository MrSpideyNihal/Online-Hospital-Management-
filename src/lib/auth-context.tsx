'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Hospital } from '@/types/database'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    hospital: Hospital | null
    hospitalId: string | null
    role: string | null
    isLoading: boolean
    isSuperAdmin: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    hospital: null,
    hospitalId: null,
    role: null,
    isLoading: true,
    isSuperAdmin: false,
    signOut: async () => { },
    refreshProfile: async () => { },
})

export const useAuth = () => useContext(AuthContext)

// Timeout wrapper — resolves to null if a promise takes too long
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [hospital, setHospital] = useState<Hospital | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const initDone = useRef(false)

    const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: Record<string, unknown>): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // If profile doesn't exist yet (first Google login), auto-create it
            if ((error && error.code === 'PGRST116') || !data) {
                try {
                    const newProfile = {
                        id: userId,
                        email: userEmail || '',
                        full_name: (userMeta?.full_name || userMeta?.name || '') as string,
                        avatar_url: (userMeta?.avatar_url || '') as string,
                        role: 'patient' as const,
                    }
                    const { data: created, error: createErr } = await supabase
                        .from('profiles')
                        .upsert(newProfile, { onConflict: 'id' })
                        .select('*')
                        .single()
                    if (createErr) {
                        console.warn('[Auth] Profile create failed (RLS?):', createErr.message)
                        return { ...newProfile, hospital_id: null, phone: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as unknown as Profile
                    }
                    return created as Profile | null
                } catch (e) {
                    console.warn('[Auth] Profile create exception:', e)
                    return null
                }
            }

            if (error) {
                console.warn('[Auth] Profile fetch error:', error.message)
                return null
            }

            return data as Profile | null
        } catch (e) {
            console.warn('[Auth] Profile fetch exception:', e)
            return null
        }
    }, [supabase])

    const fetchHospital = useCallback(async (hospitalId: string): Promise<Hospital | null> => {
        try {
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .eq('id', hospitalId)
                .single()
            if (error) {
                console.warn('[Auth] Hospital fetch error:', error.message)
                return null
            }
            return data as Hospital | null
        } catch (e) {
            console.warn('[Auth] Hospital fetch exception:', e)
            return null
        }
    }, [supabase])

    const refreshProfile = useCallback(async () => {
        if (!user) return
        const p = await withTimeout(fetchProfile(user.id, user.email || '', user.user_metadata), 8000)
        setProfile(p)
        if (p?.hospital_id) {
            const h = await withTimeout(fetchHospital(p.hospital_id), 5000)
            setHospital(h)
        }
    }, [user, fetchProfile, fetchHospital])

    useEffect(() => {
        // ── Step 1: Read cached session from localStorage (no lock needed) ──
        // getSession() is synchronous-ish (reads storage), so it resolves fast
        // and unblocks the UI immediately. onAuthStateChange._initialize()
        // acquires a Web Lock which can stall 5+ seconds if a previous instance
        // didn't release it — so we NEVER wait for it to show the first frame.
        const bootstrap = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const currentUser = session?.user ?? null
                setUser(currentUser)
                if (currentUser) {
                    const p = await withTimeout(
                        fetchProfile(currentUser.id, currentUser.email || '', currentUser.user_metadata),
                        8000
                    )
                    setProfile(p)
                    if (p?.hospital_id) {
                        const h = await withTimeout(fetchHospital(p.hospital_id), 5000)
                        setHospital(h)
                    }
                }
            } catch (e) {
                console.warn('[Auth] Bootstrap getSession error:', e)
            } finally {
                initDone.current = true
                setIsLoading(false)
            }
        }
        bootstrap()

        // ── Step 2: Subscribe for future auth changes (tab focus, token refresh, sign-out) ──
        // This may briefly stall on the Web Lock, but the UI is already unblocked above.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, session: { user: User | null } | null) => {
                try {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    if (currentUser) {
                        const p = await withTimeout(
                            fetchProfile(currentUser.id, currentUser.email || '', currentUser.user_metadata),
                            8000
                        )
                        setProfile(p)
                        if (p?.hospital_id) {
                            const h = await withTimeout(fetchHospital(p.hospital_id), 5000)
                            setHospital(h)
                        }
                    } else {
                        setProfile(null)
                        setHospital(null)
                    }
                } catch (e) {
                    console.warn('[Auth] State change error:', e)
                } finally {
                    initDone.current = true
                    setIsLoading(false)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (e) {
            console.warn('[Auth] Sign out error:', e)
        }
        setUser(null)
        setProfile(null)
        setHospital(null)
    }

    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
    const isSuperAdmin = (!!user?.email && !!superAdminEmail && user.email === superAdminEmail) || profile?.role === 'super_admin'

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                hospital,
                hospitalId: profile?.hospital_id ?? null,
                role: profile?.role ?? null,
                isLoading,
                isSuperAdmin,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
