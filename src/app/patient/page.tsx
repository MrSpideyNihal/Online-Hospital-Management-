'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ClipboardList, User, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const supabase = createClient()

export default function PatientDashboard() {
    const { user, profile, isLoading: authLoading } = useAuth()

    // Fetch patient's appointments (via their profile email across all hospitals)
    const { data: appointments = [], isLoading: loadingAppts } = useQuery({
        queryKey: ['patient-appointments', user?.id],
        queryFn: async () => {
            if (!user) return []
            // Look up patient records linked to this user
            const { data, error } = await supabase
                .from('appointments')
                .select('*, patients:patient_id(full_name), doctors:doctor_id(full_name), hospitals:hospital_id(name)')
                .or(`created_by.eq.${user.id}`)
                .order('appointment_date', { ascending: false })
                .limit(10)
            if (error) {
                // Fallback: try via patients table
                const { data: patients } = await supabase
                    .from('patients')
                    .select('id')
                    .eq('user_id', user.id)
                if (!patients?.length) return []
                const patientIds = patients.map((p: { id: string }) => p.id)
                const { data: appts } = await supabase
                    .from('appointments')
                    .select('*, patients:patient_id(full_name), doctors:doctor_id(full_name)')
                    .in('patient_id', patientIds)
                    .order('appointment_date', { ascending: false })
                    .limit(10)
                return appts || []
            }
            return data || []
        },
        enabled: !!user,
    })

    const { data: visits = [], isLoading: loadingVisits } = useQuery({
        queryKey: ['patient-visits', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data: patients } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
            if (!patients?.length) return []
            const patientIds = patients.map((p: { id: string }) => p.id)
            const { data } = await supabase
                .from('visits')
                .select('*, doctors:doctor_id(full_name)')
                .in('patient_id', patientIds)
                .order('visit_date', { ascending: false })
                .limit(5)
            return data || []
        },
        enabled: !!user,
    })

    const upcomingAppts = appointments.filter((a: Record<string, unknown>) =>
        (a.appointment_date as string) >= new Date().toISOString().split('T')[0] && a.status !== 'cancelled'
    )

    if (authLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="border-border/50 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || 'Patient'}!</h1>
                            <p className="text-muted-foreground">Manage your dental appointments and health records</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingAppts.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming Appointments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{visits.length}</p>
                            <p className="text-xs text-muted-foreground">Recent Visits</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{appointments.length}</p>
                            <p className="text-xs text-muted-foreground">Total Appointments</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                    <Link href="/patient/appointments">
                        <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {loadingAppts ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : upcomingAppts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAppts.slice(0, 5).map((apt: any) => (
                                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{apt.reason || 'Dental Appointment'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Dr. {apt.doctors?.full_name || '—'} {apt.hospitals?.name ? `• ${apt.hospitals.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{formatDate(apt.appointment_date)}</p>
                                        <p className="text-xs text-muted-foreground">{apt.appointment_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Visits */}
            <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Recent Visits</CardTitle>
                    <Link href="/patient/history">
                        <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {loadingVisits ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : visits.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No visit records found</p>
                    ) : (
                        <div className="space-y-3">
                            {visits.map((v: any) => (
                                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="text-sm font-medium">{v.chief_complaint || 'General Visit'}</p>
                                        <p className="text-xs text-muted-foreground">Dr. {v.doctors?.full_name || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">{formatDate(v.visit_date)}</p>
                                        <Badge variant="secondary" className="text-xs capitalize">{v.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
