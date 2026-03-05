import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Returns the authenticated user's linked hospital, including pending/frozen states.
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('hospital_id, role')
            .eq('id', user.id)
            .maybeSingle()

        if (profileErr) {
            return NextResponse.json({ error: profileErr.message }, { status: 500 })
        }

        const admin = createAdminClient()
        let hospitalId = profile?.hospital_id || null

        // Backfill legacy accounts where hospital_admin role exists but hospital_id was not linked.
        if (!hospitalId && profile?.role === 'hospital_admin') {
            const { data: ownedHospital, error: ownedErr } = await admin
                .from('hospitals')
                .select('id')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (ownedErr) {
                return NextResponse.json({ error: ownedErr.message }, { status: 500 })
            }

            if (ownedHospital?.id) {
                hospitalId = ownedHospital.id
                await admin
                    .from('profiles')
                    .update({ hospital_id: hospitalId })
                    .eq('id', user.id)
            }
        }

        // Prevent privilege escalation via tampered profile.hospital_id.
        if (hospitalId && profile?.role === 'hospital_admin') {
            const { data: linkedHospital, error: linkedErr } = await admin
                .from('hospitals')
                .select('id, owner_id')
                .eq('id', hospitalId)
                .maybeSingle()

            if (linkedErr) {
                return NextResponse.json({ error: linkedErr.message }, { status: 500 })
            }

            if (!linkedHospital || linkedHospital.owner_id !== user.id) {
                const { data: ownedHospital, error: ownedErr } = await admin
                    .from('hospitals')
                    .select('id')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (ownedErr) {
                    return NextResponse.json({ error: ownedErr.message }, { status: 500 })
                }

                hospitalId = ownedHospital?.id || null
                await admin
                    .from('profiles')
                    .update({ hospital_id: hospitalId })
                    .eq('id', user.id)
            }
        }

        if (!hospitalId) {
            return NextResponse.json(null)
        }

        const { data: hospital, error: hospitalErr } = await admin
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .maybeSingle()

        if (hospitalErr) {
            return NextResponse.json({ error: hospitalErr.message }, { status: 500 })
        }

        return NextResponse.json(hospital || null)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
