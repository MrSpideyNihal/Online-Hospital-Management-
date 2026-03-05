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

// Always use production URL for redirects, never deploy-preview URLs
function getBaseUrl(requestUrl: string): string {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
    // Fallback to request origin
    try {
        return new URL(requestUrl).origin
    } catch {
        return 'https://dentizhub.netlify.app'
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const redirect = searchParams.get('redirect') || '/dashboard'
    const registrationType = searchParams.get('type') // 'hospital' for hospital registration
    const baseUrl = getBaseUrl(request.url)

    if (!code) {
        return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
    }

    try {
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
        if (error) {
            console.error('[Callback] Code exchange failed:', error.message)
            return NextResponse.redirect(`${baseUrl}/login?error=exchange_failed`)
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('[Callback] No user after code exchange')
            return NextResponse.redirect(`${baseUrl}/login?error=no_user`)
        }

        const admin = getAdminClient()
        const db = admin || supabase

        // Check if profile exists
        const { data: existingProfile, error: profileErr } = await db
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()

        const superAdminEmail = getSuperAdminEmail()
        const isThisSuperAdmin = !!superAdminEmail && user.email === superAdminEmail

        if (profileErr || !existingProfile) {
            // First-time login — create profile
            const isHospitalReg = registrationType === 'hospital'
            const newRole = isThisSuperAdmin ? 'super_admin' : isHospitalReg ? 'hospital_admin' : 'patient'

            let hospitalId: string | null = null

            // If hospital registration, create a new hospital first
            if (isHospitalReg && !isThisSuperAdmin) {
                const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'My Hospital'
                const slug = userName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
                const { data: newHospital, error: hospErr } = await db.from('hospitals').insert({
                    name: `${userName}'s Dental Clinic`,
                    slug,
                    email: user.email || '',
                    owner_id: user.id,
                    status: 'pending',
                    subscription_plan: 'trial',
                }).select('id').single()

                if (hospErr) {
                    console.error('[Callback] Hospital creation failed:', hospErr.message)
                } else {
                    hospitalId = newHospital.id
                }
            }

            const { error: insertErr } = await db.from('profiles').upsert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                role: newRole,
                ...(hospitalId ? { hospital_id: hospitalId } : {}),
            }, { onConflict: 'id' })

            if (insertErr) {
                console.error('[Callback] Profile upsert failed:', insertErr.message)
            }

            if (isThisSuperAdmin) {
                return NextResponse.redirect(`${baseUrl}/admin`)
            }
            if (isHospitalReg) {
                return NextResponse.redirect(`${baseUrl}/dashboard`)
            }
            return NextResponse.redirect(`${baseUrl}/patient`)
        }

        // Determine effective role: env-var super admin OR DB role
        const effectiveRole = isThisSuperAdmin ? 'super_admin' : existingProfile.role

        // Upgrade to super_admin in DB if env var says so
        if (isThisSuperAdmin && existingProfile.role !== 'super_admin') {
            await db.from('profiles').update({ role: 'super_admin' }).eq('id', user.id)
        }

        // Route based on effective role
        if (effectiveRole === 'super_admin') {
            return NextResponse.redirect(`${baseUrl}/admin`)
        }
        if (effectiveRole === 'patient') {
            return NextResponse.redirect(`${baseUrl}/patient`)
        }
        if (['hospital_admin', 'doctor', 'receptionist'].includes(effectiveRole)) {
            return NextResponse.redirect(`${baseUrl}/dashboard`)
        }

        return NextResponse.redirect(`${baseUrl}${redirect}`)
    } catch (e) {
        console.error('[Callback] Unexpected error:', e)
        return NextResponse.redirect(`${baseUrl}/login?error=callback_exception`)
    }
}
