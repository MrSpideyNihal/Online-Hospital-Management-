'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [hospital, setHospital] = useState<Hospital | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

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
                        // Return a synthetic profile so the app doesn't crash
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
        const p = await fetchProfile(user.id, user.email || '', user.user_metadata)
        setProfile(p)
        if (p?.hospital_id) {
            const h = await fetchHospital(p.hospital_id)
            setHospital(h)
        }
    }, [user, fetchProfile, fetchHospital])

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser()
                setUser(currentUser)
                if (currentUser) {
                    const p = await fetchProfile(currentUser.id, currentUser.email || '', currentUser.user_metadata)
                    setProfile(p)
                    if (p?.hospital_id) {
                        const h = await fetchHospital(p.hospital_id)
                        setHospital(h)
                    }
                }
            } catch (error) {
                console.error('Auth init error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                try {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    if (currentUser) {
                        const p = await fetchProfile(currentUser.id, currentUser.email || '', currentUser.user_metadata)
                        setProfile(p)
                        if (p?.hospital_id) {
                            const h = await fetchHospital(p.hospital_id)
                            setHospital(h)
                        }
                    } else {
                        setProfile(null)
                        setHospital(null)
                    }
                } catch (e) {
                    console.warn('[Auth] State change error:', e)
                } finally {
                    setIsLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase, fetchProfile, fetchHospital])

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

    // Super admin = either env var matches OR profile.role is 'super_admin' in DB
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
