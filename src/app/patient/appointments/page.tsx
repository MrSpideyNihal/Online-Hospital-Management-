/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const supabase = createClient()

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function PatientAppointmentsPage() {
    const { user } = useAuth()

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['patient-all-appointments', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data: patients } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
            if (!patients?.length) return []
            const patientIds = patients.map((p: { id: string }) => p.id)
            const { data } = await supabase
                .from('appointments')
                .select('*, doctors:doctor_id(full_name), hospitals:hospital_id(name)')
                .in('patient_id', patientIds)
                .order('appointment_date', { ascending: false })
            return data || []
        },
        enabled: !!user,
    })

    const today = new Date().toISOString().split('T')[0]
    const upcoming = appointments.filter((a: any) => a.appointment_date >= today && a.status !== 'cancelled')
    const past = appointments.filter((a: any) => a.appointment_date < today || a.status === 'cancelled')

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Appointments</h1>
                <p className="text-muted-foreground">View all your dental appointments</p>
            </div>

            {/* Upcoming */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Upcoming ({upcoming.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {upcoming.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((apt: any) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{apt.reason || 'Dental Appointment'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Dr. {apt.doctors?.full_name || '—'}
                                                {apt.hospitals?.name ? ` • ${apt.hospitals.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatDate(apt.appointment_date)}</p>
                                        <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                                        <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || ''} text-xs mt-1 capitalize`}>
                                            {(apt.status || '').replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-muted-foreground">Past Appointments ({past.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {past.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">No past appointments</p>
                    ) : (
                        <div className="space-y-2">
                            {past.map((apt: any) => (
                                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                        <p className="text-sm font-medium">{apt.reason || 'Dental Appointment'}</p>
                                        <p className="text-xs text-muted-foreground">Dr. {apt.doctors?.full_name || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">{formatDate(apt.appointment_date)}</p>
                                        <Badge variant="secondary" className={`${STATUS_COLORS[apt.status] || ''} text-xs capitalize`}>
                                            {(apt.status || '').replace('_', ' ')}
                                        </Badge>
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
