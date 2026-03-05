/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
    UserPlus, ArrowRight, Clock, CheckCircle, Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useVisits, useCreateVisit, useUpdateVisit, usePatients, useDoctors } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    waiting: { label: 'Waiting', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ArrowRight },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
}

export default function VisitsPage() {
    const { hospitalId } = useAuth()
    const today = new Date().toISOString().split('T')[0]
    const { data: visits = [], isLoading, isError } = useVisits(hospitalId, today)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: doctors = [] } = useDoctors(hospitalId)
    const createVisit = useCreateVisit()
    const updateVisit = useUpdateVisit()

    const [isCheckInOpen, setIsCheckInOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDoctor, setFDoctor] = useState('')
    const [fComplaint, setFComplaint] = useState('')
    const [fBp, setFBp] = useState('')
    const [fTemp, setFTemp] = useState('')
    const [fWeight, setFWeight] = useState('')

    const resetForm = () => { setFPatient(''); setFDoctor(''); setFComplaint(''); setFBp(''); setFTemp(''); setFWeight('') }

    const waiting = visits.filter((q: any) => q.status === 'waiting').length
    const inProgress = visits.filter((q: any) => q.status === 'in_progress').length
    const completed = visits.filter((q: any) => q.status === 'completed').length

    const handleCheckIn = () => {
        if (!hospitalId || !fPatient || !fDoctor) { toast.error('Patient and Doctor are required'); return }
        // Validate vitals
        if (fTemp && (isNaN(Number(fTemp)) || Number(fTemp) < 90 || Number(fTemp) > 110)) { toast.error('Temperature must be between 90-110°F'); return }
        if (fWeight && (isNaN(Number(fWeight)) || Number(fWeight) < 1 || Number(fWeight) > 500)) { toast.error('Weight must be between 1-500 kg'); return }
        if (fBp && !/^\d{2,3}\/\d{2,3}$/.test(fBp)) { toast.error('BP must be in format like 120/80'); return }
        // Compute next queue number from max existing queue number (not array length)
        const maxQueue = visits.reduce((max: number, v: any) => Math.max(max, v.queue_number || 0), 0)
        const nextQueue = maxQueue + 1
        createVisit.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            doctor_id: fDoctor,
            chief_complaint: fComplaint || null,
            vitals: { bp: fBp || null, temperature: fTemp || null, weight: fWeight || null },
            queue_number: nextQueue,
            status: 'waiting',
        }, {
            onSuccess: () => { toast.success('Patient checked in'); setIsCheckInOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const handleStart = (id: string) => {
        updateVisit.mutate({ id, status: 'in_progress' }, {
            onSuccess: () => toast.success('Visit started'),
            onError: (e) => toast.error(e.message),
        })
    }
    const handleComplete = (id: string) => {
        updateVisit.mutate({ id, status: 'completed' }, {
            onSuccess: () => toast.success('Visit completed'),
            onError: (e) => toast.error(e.message),
        })
    }

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <p className="text-destructive font-medium">Failed to load visits</p>
                <p className="text-sm text-muted-foreground">Please check your connection and refresh the page.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">OPD / Visits</h1>
                    <p className="text-muted-foreground">{waiting} waiting &middot; {inProgress} in progress</p>
                </div>
                <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            <UserPlus className="w-4 h-4 mr-1.5" /> Quick Check-in
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Quick Patient Check-in</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label>Patient *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                    <option value="">Select patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id_number})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Doctor *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fDoctor} onChange={e => setFDoctor(e.target.value)}>
                                    <option value="">Select doctor</option>
                                    {doctors.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Chief Complaint</Label>
                                <Textarea placeholder="Describe the patient's chief complaint..." rows={3} value={fComplaint} onChange={e => setFComplaint(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5"><Label>BP</Label><Input placeholder="120/80" value={fBp} onChange={e => setFBp(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Temp (°F)</Label><Input placeholder="98.6" value={fTemp} onChange={e => setFTemp(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Weight (kg)</Label><Input placeholder="70" value={fWeight} onChange={e => setFWeight(e.target.value)} /></div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={handleCheckIn} disabled={createVisit.isPending}>
                                {createVisit.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin"/>Checking in...</> : 'Check In Patient'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Queue Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold">{waiting}</p>
                        <p className="text-xs text-muted-foreground">Waiting</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                            <ArrowRight className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">{inProgress}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">{completed}</p>
                        <p className="text-xs text-muted-foreground">Completed Today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Queue List */}
            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Live Queue</CardTitle></CardHeader>
                <CardContent>
                    {visits.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No visits today. Click &quot;Quick Check-in&quot; to start.</p>
                    ) : (
                    <div className="space-y-3">
                        {visits.map((item: any) => {
                            const config = statusConfig[item.status] || statusConfig.waiting
                            return (
                                <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.status === 'in_progress' ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' : 'bg-card hover:bg-muted/50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${item.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                            {item.queue_number}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{item.patients?.full_name || '—'}</p>
                                                <Badge variant="secondary" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.doctors?.full_name || '—'} &middot; {item.chief_complaint || 'General'}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Check-in: {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {item.status === 'waiting' && (
                                            <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStart(item.id)}>Start</Button>
                                        )}
                                        {item.status === 'in_progress' && (
                                            <Button size="sm" className="text-xs bg-green-600 text-white hover:bg-green-700" onClick={() => handleComplete(item.id)}>Complete</Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
