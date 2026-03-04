import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifySuperAdmin() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return null
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL
        if (!superAdminEmail || user.email !== superAdminEmail) return null
        return user
    } catch {
        return null
    }
}

// GET /api/admin/hospitals?status=pending
export async function GET(request: NextRequest) {
    try {
        const user = await verifySuperAdmin()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check service role key exists
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
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
            console.error('Admin hospitals GET error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json(data || [])
    } catch (err) {
        console.error('Admin hospitals GET unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/admin/hospitals  body: { hospitalId, action: 'approve' | 'reject' | 'freeze' | 'unfreeze' }
export async function PATCH(request: NextRequest) {
    try {
        const user = await verifySuperAdmin()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
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
    } catch (err) {
        console.error('Admin hospitals PATCH unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
