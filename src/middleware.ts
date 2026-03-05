import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Stamped at build time by next.config.ts → process.env.NEXT_PUBLIC_BUILD_ID
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev'

const STRIP_QUERY_KEYS = new Set(['redirect', 'code', '__chunkfix', '__chunkts', '_rsc'])

function getSafeReturnPath(request: NextRequest): string {
    const url = request.nextUrl.clone()
    for (const key of STRIP_QUERY_KEYS) {
        url.searchParams.delete(key)
    }
    const query = url.searchParams.toString()
    return query ? `${url.pathname}?${query}` : url.pathname
}

function applyNoStoreHeaders(response: NextResponse) {
    // Prevent stale HTML shells from being cached by browser/CDN layers.
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    // Netlify-specific: opt this response entirely out of Durable Cache storage.
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('x-middleware-cache', 'no-cache')
    // Stamp every response with the current deploy's build ID.
    // The client-side stale-chunk recovery script compares this to
    // window.__NEXT_DATA__.buildId and force-reloads if they differ.
    response.headers.set('x-build-id', BUILD_ID)
    return response
}

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // Normalize stale nested redirect query params from older flows.
    // Example bad URL: /dashboard?redirect=%2Fpatient
    // This must never render HTML at that key because it can keep serving
    // old cached shells with outdated chunk hashes.
    if (pathname !== '/login' && pathname !== '/auth/callback' && searchParams.has('redirect')) {
        const cleanUrl = request.nextUrl.clone()
        cleanUrl.searchParams.delete('redirect')
        return applyNoStoreHeaders(NextResponse.redirect(cleanUrl))
    }

    // If a non-callback page has a `code` param (stale OAuth code), strip it
    if (pathname !== '/auth/callback' && searchParams.has('code')) {
        const cleanUrl = request.nextUrl.clone()
        cleanUrl.searchParams.delete('code')
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
            loginUrl.search = ''
            loginUrl.searchParams.set('redirect', getSafeReturnPath(request))
            return applyNoStoreHeaders(NextResponse.redirect(loginUrl))
        }
    } catch {
        // Auth refresh failed — redirect to login for protected routes
        const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/patient')
        if (isProtected) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            loginUrl.search = ''
            loginUrl.searchParams.set('redirect', getSafeReturnPath(request))
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
