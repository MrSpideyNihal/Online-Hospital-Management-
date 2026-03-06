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
        const status = searchParams.get('status')?.toLowerCase().trim() || null
        const VALID_STATUSES = new Set(['pending', 'approved', 'rejected'])

        const admin = createAdminClient()
        let query = admin.from('hospitals').select('*').order('created_at', { ascending: false })
        if (status && status !== 'all') {
            if (!VALID_STATUSES.has(status)) {
                return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
            }
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

        const notifyOwner = async (hospital: { id: string; name: string; owner_id: string | null }, actionType: 'approve' | 'reject' | 'freeze' | 'unfreeze') => {
            if (!hospital.owner_id) return

            const payloadMap = {
                approve: {
                    title: 'Hospital Approved',
                    message: `Your hospital "${hospital.name}" has been approved. You can now start using all services.`,
                    type: 'success',
                },
                reject: {
                    title: 'Hospital Application Rejected',
                    message: `Your hospital "${hospital.name}" was rejected. Please contact support and resubmit with payment details.`,
                    type: 'error',
                },
                freeze: {
                    title: 'Hospital Access Frozen',
                    message: `Your hospital "${hospital.name}" has been frozen by admin. Please contact support.`,
                    type: 'warning',
                },
                unfreeze: {
                    title: 'Hospital Access Restored',
                    message: `Your hospital "${hospital.name}" has been unfrozen. Access is now restored.`,
                    type: 'success',
                },
            } as const

            const payload = payloadMap[actionType]
            await admin.from('notifications').insert({
                hospital_id: hospital.id,
                user_id: hospital.owner_id,
                title: payload.title,
                message: payload.message,
                type: payload.type,
                link: '/dashboard',
                is_read: false,
            })
        }

        if (action === 'notify') {
            const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : ''
            const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
            const type = typeof body.type === 'string' && ['info', 'success', 'warning', 'error', 'payment'].includes(body.type) ? body.type : 'info'

            if (!title || !message) {
                return NextResponse.json({ error: 'Notification title and message are required.' }, { status: 400 })
            }

            // Resolve the hospital owner
            const { data: hospital, error: hospErr } = await admin
                .from('hospitals')
                .select('id, name, owner_id')
                .eq('id', hospitalId)
                .single()

            if (hospErr || !hospital) {
                return NextResponse.json({ error: 'Hospital not found.' }, { status: 404 })
            }

            if (!hospital.owner_id) {
                return NextResponse.json({ error: 'Hospital has no linked owner account.' }, { status: 400 })
            }

            const { error: notifErr } = await admin.from('notifications').insert({
                hospital_id: hospital.id,
                user_id: hospital.owner_id,
                title,
                message,
                type,
                link: '/dashboard',
                is_read: false,
            })

            if (notifErr) {
                return NextResponse.json({ error: notifErr.message }, { status: 500 })
            }

            return NextResponse.json({ success: true })
        }

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

            try {
                await notifyOwner(data, action)
            } catch {
                // Non-blocking
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

        try {
            await notifyOwner(data, action)
        } catch {
            // Non-blocking
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('Admin hospitals PATCH unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
