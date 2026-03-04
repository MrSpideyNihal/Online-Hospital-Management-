import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Admin client (service role) — bypasses RLS for role upgrades
function getAdminClient() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return null
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

function getSuperAdminEmail(): string | null {
    // Check both env var names for robustness
    return process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || null
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const redirect = searchParams.get('redirect') || '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Server component context
                        }
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const admin = getAdminClient()
                // Use admin client if available (bypasses RLS), fallback to user client
                const db = admin || supabase

                // Check if profile exists
                const { data: existingProfile } = await db
                    .from('profiles')
                    .select('id, role')
                    .eq('id', user.id)
                    .single()

                const superAdminEmail = getSuperAdminEmail()
                const isThisSuperAdmin = !!superAdminEmail && user.email === superAdminEmail

                if (!existingProfile) {
                    // First-time login — create profile
                    const newRole = isThisSuperAdmin ? 'super_admin' : 'patient'
                    await db.from('profiles').insert({
                        id: user.id,
                        email: user.email || '',
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                        avatar_url: user.user_metadata?.avatar_url || '',
                        role: newRole,
                    })

                    if (isThisSuperAdmin) {
                        return NextResponse.redirect(`${origin}/admin`)
                    }
                    return NextResponse.redirect(`${origin}/patient`)
                }

                // Determine effective role: env-var super admin OR DB role
                const effectiveRole = isThisSuperAdmin ? 'super_admin' : existingProfile.role

                // Upgrade to super_admin in DB if env var says so
                if (isThisSuperAdmin && existingProfile.role !== 'super_admin') {
                    await db.from('profiles').update({ role: 'super_admin' }).eq('id', user.id)
                }

                // Route based on effective role
                if (effectiveRole === 'super_admin') {
                    return NextResponse.redirect(`${origin}/admin`)
                }
                if (effectiveRole === 'patient') {
                    return NextResponse.redirect(`${origin}/patient`)
                }
                if (['hospital_admin', 'doctor', 'receptionist'].includes(effectiveRole)) {
                    return NextResponse.redirect(`${origin}/dashboard`)
                }
            }

            return NextResponse.redirect(`${origin}${redirect}`)
        }
    }

    // Auth error - redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
