import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
            // Check if profile exists, create one if not
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
                        avatar_url: user.user_metadata?.avatar_url,
                        role: 'patient',
                    })
                    // New patient → redirect to patient portal
                    return NextResponse.redirect(`${origin}/patient`)
                }

                // Existing user — redirect based on role
                if (profile && redirect === '/dashboard') {
                    const { data: fullProfile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()
                    if (fullProfile?.role === 'patient') {
                        return NextResponse.redirect(`${origin}/patient`)
                    }
                }
            }

            return NextResponse.redirect(`${origin}${redirect}`)
        }
    }

    // Auth error - redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
