import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ChunkDebugPayload = {
  kind?: string
  href?: string
  userAgent?: string
  timestamp?: string
  buildId?: string | null
  data?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChunkDebugPayload
    const reqUrl = new URL(request.url)
    const sourceIp = request.headers.get('x-forwarded-for') || 'unknown'
    const requestId = request.headers.get('x-nf-request-id') || 'unknown'

    // Server-side structured log for production diagnostics.
    console.error('[chunk-debug]', {
      path: reqUrl.pathname,
      requestId,
      sourceIp,
      kind: payload?.kind || 'unknown',
      href: payload?.href || '',
      buildId: payload?.buildId || null,
      timestamp: payload?.timestamp || new Date().toISOString(),
      userAgent: payload?.userAgent || '',
      data: payload?.data || {},
    })

    return NextResponse.json(
      { ok: true },
      {
        status: 202,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('[chunk-debug] failed to parse payload', error)
    return NextResponse.json(
      { ok: false },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      }
    )
  }
}
