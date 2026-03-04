// Next.js 16 deprecated the middleware convention.
// Auth protection is handled client-side in layout components.
// This file is intentionally left minimal to avoid build errors.

import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: [],
}
