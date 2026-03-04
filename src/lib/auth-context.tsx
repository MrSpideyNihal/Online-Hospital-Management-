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

    const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: Record<string, unknown>) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        // If profile doesn't exist yet (first Google login), auto-create it
        if ((error && error.code === 'PGRST116') || !data) {
            const newProfile = {
                id: userId,
                email: userEmail || '',
                full_name: (userMeta?.full_name || userMeta?.name || '') as string,
                avatar_url: (userMeta?.avatar_url || '') as string,
                role: 'patient' as const,
            }
            const { data: created } = await supabase
                .from('profiles')
                .upsert(newProfile, { onConflict: 'id' })
                .select('*')
                .single()
            return created as Profile | null
        }

        return data as Profile | null
    }, [supabase])

    const fetchHospital = useCallback(async (hospitalId: string) => {
        const { data } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .single()
        return data as Hospital | null
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
                setIsLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase, fetchProfile, fetchHospital])

    const signOut = async () => {
        await supabase.auth.signOut()
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
