import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const HOSPITAL_UPDATE_FIELDS = new Set([
    'name',
    'email',
    'phone',
    'about_text',
    'mission',
    'primary_color',
    'secondary_color',
    'address',
    'city',
    'state',
    'pincode',
    'map_embed_url',
])

function noStoreJson<T>(payload: T, status = 200) {
    return NextResponse.json(payload, {
        status,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'CDN-Cache-Control': 'no-store',
            'Netlify-CDN-Cache-Control': 'no-store',
            'Surrogate-Control': 'no-store',
        },
    })
}

// Returns the authenticated user's linked hospital, including pending/frozen states.
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr || !user) {
            return noStoreJson({ error: 'Unauthorized' }, 401)
        }

        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('hospital_id, role')
            .eq('id', user.id)
            .maybeSingle()

        if (profileErr) {
            return noStoreJson({ error: profileErr.message }, 500)
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
                return noStoreJson({ error: ownedErr.message }, 500)
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
                return noStoreJson({ error: linkedErr.message }, 500)
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
                    return noStoreJson({ error: ownedErr.message }, 500)
                }

                hospitalId = ownedHospital?.id || null
                await admin
                    .from('profiles')
                    .update({ hospital_id: hospitalId })
                    .eq('id', user.id)
            }
        }

        if (!hospitalId) {
            return noStoreJson(null)
        }

        const { data: hospital, error: hospitalErr } = await admin
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .maybeSingle()

        if (hospitalErr) {
            return noStoreJson({ error: hospitalErr.message }, 500)
        }

        return noStoreJson(hospital || null)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return noStoreJson({ error: message }, 500)
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr || !user) {
            return noStoreJson({ error: 'Unauthorized' }, 401)
        }

        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('hospital_id, role')
            .eq('id', user.id)
            .maybeSingle()

        if (profileErr) {
            return noStoreJson({ error: profileErr.message }, 500)
        }

        if (profile?.role !== 'hospital_admin') {
            return noStoreJson({ error: 'Only hospital admins can update hospital settings.' }, 403)
        }

        const body = (await request.json()) as Record<string, unknown>
        const requestedId = typeof body.id === 'string' ? body.id : null
        const updates: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(body)) {
            if (HOSPITAL_UPDATE_FIELDS.has(key)) {
                updates[key] = value
            }
        }

        if (Object.keys(updates).length === 0) {
            return noStoreJson({ error: 'No valid fields to update.' }, 400)
        }

        const admin = createAdminClient()

        // Resolve the hospital owned by this admin account.
        const { data: ownedHospital, error: ownedErr } = await admin
            .from('hospitals')
            .select('id')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (ownedErr) {
            return noStoreJson({ error: ownedErr.message }, 500)
        }

        const hospitalId = ownedHospital?.id || profile?.hospital_id || null
        if (!hospitalId) {
            return noStoreJson({ error: 'No hospital linked to this account.' }, 404)
        }

        if (requestedId && requestedId !== hospitalId) {
            return noStoreJson({ error: 'Hospital context mismatch. Please refresh and try again.' }, 403)
        }

        const { data: updatedHospital, error: updateErr } = await admin
            .from('hospitals')
            .update(updates)
            .eq('id', hospitalId)
            .eq('owner_id', user.id)
            .select('*')
            .single()

        if (updateErr) {
            return noStoreJson({ error: updateErr.message }, 400)
        }

        // Keep profile.hospital_id in sync for legacy accounts.
        if (profile?.hospital_id !== hospitalId) {
            await admin
                .from('profiles')
                .update({ hospital_id: hospitalId })
                .eq('id', user.id)
        }

        return noStoreJson(updatedHospital)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return noStoreJson({ error: message }, 500)
    }
}
