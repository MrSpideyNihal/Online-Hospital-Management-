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
            .select('hospital_id')
            .eq('id', user.id)
            .maybeSingle()

        if (profileErr) {
            return NextResponse.json({ error: profileErr.message }, { status: 500 })
        }

        if (!profile?.hospital_id) {
            return NextResponse.json(null)
        }

        const admin = createAdminClient()
        const { data: hospital, error: hospitalErr } = await admin
            .from('hospitals')
            .select('*')
            .eq('id', profile.hospital_id)
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
