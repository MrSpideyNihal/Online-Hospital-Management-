import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function applyNoStoreHeaders(response: NextResponse) {
    // Prevent stale HTML shells from being cached by browser/CDN layers.
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
}

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // If a non-callback page has a `code` param (stale OAuth code), strip it
    if (pathname !== '/auth/callback' && searchParams.has('code')) {
        const cleanUrl = request.nextUrl.clone()
        cleanUrl.searchParams.delete('code')
        cleanUrl.searchParams.delete('redirect')
        return applyNoStoreHeaders(NextResponse.redirect(cleanUrl))
    }

    // Create a response that we can modify (to set refreshed cookies)
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Update cookies on the request (for downstream server code)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Create a new response with updated request + cookies
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: This refreshes the auth token if expired.
    // Without this, the client-side auth will not detect the session.
    try {
        const { data: { user } } = await supabase.auth.getUser()

        // Route protection: redirect unauthenticated users away from protected pages
        const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/patient')
        if (isProtected && !user) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            return applyNoStoreHeaders(NextResponse.redirect(loginUrl))
        }
    } catch {
        // Auth refresh failed — redirect to login for protected routes
        const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/patient')
        if (isProtected) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            return applyNoStoreHeaders(NextResponse.redirect(loginUrl))
        }
    }

    return applyNoStoreHeaders(supabaseResponse)
}

export const config = {
    matcher: [
        // Run on all routes EXCEPT static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
