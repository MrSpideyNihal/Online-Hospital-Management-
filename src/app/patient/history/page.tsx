/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const supabase = createClient()

const STATUS_COLORS: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function PatientHistoryPage() {
    const { user } = useAuth()

    const { data: visits = [], isLoading } = useQuery({
        queryKey: ['patient-all-visits', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data: patients } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
            if (!patients?.length) return []
            const patientIds = patients.map(p => p.id)
            const { data } = await supabase
                .from('visits')
                .select('*, doctors:doctor_id(full_name)')
                .in('patient_id', patientIds)
                .order('visit_date', { ascending: false })
            return data || []
        },
        enabled: !!user,
    })

    const { data: prescriptions = [] } = useQuery({
        queryKey: ['patient-prescriptions', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data: patients } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
            if (!patients?.length) return []
            const patientIds = patients.map(p => p.id)
            const { data } = await supabase
                .from('prescriptions')
                .select('*, doctors:doctor_id(full_name)')
                .in('patient_id', patientIds)
                .order('created_at', { ascending: false })
            return data || []
        },
        enabled: !!user,
    })

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Visit History</h1>
                <p className="text-muted-foreground">View your past dental visits and prescriptions</p>
            </div>

            {/* Visits */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Visits ({visits.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Complaint</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visits.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No visits found</TableCell></TableRow>
                                ) : visits.map((v: any) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{formatDate(v.visit_date)}</TableCell>
                                        <TableCell>{v.doctors?.full_name || '—'}</TableCell>
                                        <TableCell>{v.chief_complaint || '—'}</TableCell>
                                        <TableCell className="text-sm">{v.diagnosis || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`${STATUS_COLORS[v.status] || ''} text-xs capitalize`}>
                                                {(v.status || '').replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Prescriptions ({prescriptions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Medicines</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No prescriptions found</TableCell></TableRow>
                                ) : prescriptions.map((rx: any) => (
                                    <TableRow key={rx.id}>
                                        <TableCell className="font-medium">{formatDate(rx.created_at)}</TableCell>
                                        <TableCell>{rx.doctors?.full_name || '—'}</TableCell>
                                        <TableCell>{rx.diagnosis || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{rx.medicines?.length ?? 0} items</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
