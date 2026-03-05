import { NextResponse } from 'next/server'

// Never cache this endpoint — it must always return the current deploy's build ID.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export function GET() {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev'
  return NextResponse.json(
    { buildId },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
      },
    }
  )
}
