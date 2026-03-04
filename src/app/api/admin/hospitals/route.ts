import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifySuperAdmin(request: NextRequest) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
    if (user.email !== superAdminEmail) return null
    return user
}

// GET /api/admin/hospitals?status=pending
export async function GET(request: NextRequest) {
    const user = await verifySuperAdmin(request)
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const admin = createAdminClient()
    let query = admin.from('hospitals').select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
}

// PATCH /api/admin/hospitals  body: { hospitalId, action: 'approve' | 'reject' | 'freeze' | 'unfreeze' }
export async function PATCH(request: NextRequest) {
    const user = await verifySuperAdmin(request)
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hospitalId, action } = body

    if (!hospitalId || !action) {
        return NextResponse.json({ error: 'Missing hospitalId or action' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (action === 'freeze' || action === 'unfreeze') {
        const { data, error } = await admin
            .from('hospitals')
            .update({ is_frozen: action === 'freeze' })
            .eq('id', hospitalId)
            .select()
            .single()
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json(data)
    }

    const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
    }

    const newStatus = statusMap[action]
    if (!newStatus) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await admin
        .from('hospitals')
        .update({ status: newStatus })
        .eq('id', hospitalId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
}
