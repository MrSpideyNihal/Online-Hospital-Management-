/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    CalendarPlus, Clock, CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useAppointments, useCreateAppointment, useUpdateAppointment, usePatients, useDoctors } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

export default function AppointmentsPage() {
    const { hospitalId } = useAuth()
    const { data: appointments = [], isLoading } = useAppointments(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: doctors = [] } = useDoctors(hospitalId)
    const createAppointment = useCreateAppointment()
    const updateAppointment = useUpdateAppointment()

    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [calendarDate, setCalendarDate] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [isAddOpen, setIsAddOpen] = useState(false)
    const searchParams = useSearchParams()

    // Auto-open book dialog from quick action link
    useEffect(() => {
        if (searchParams.get('action') === 'new') setIsAddOpen(true)
    }, [searchParams])

    // Form state
    const [fPatient, setFPatient] = useState('')
    const [fDoctor, setFDoctor] = useState('')
    const [fDate, setFDate] = useState('')
    const [fTime, setFTime] = useState('')
    const [fReason, setFReason] = useState('')
    const [fNotes, setFNotes] = useState('')

    const resetForm = () => { setFPatient(''); setFDoctor(''); setFDate(''); setFTime(''); setFReason(''); setFNotes('') }

    const handleCreate = () => {
        if (!hospitalId || !fPatient || !fDoctor || !fDate || !fTime) {
            toast.error('Please fill all required fields'); return
        }
        createAppointment.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            doctor_id: fDoctor,
            appointment_date: fDate,
            appointment_time: fTime,
            reason: fReason || null,
            notes: fNotes || null,
            status: 'scheduled',
        }, {
            onSuccess: () => { toast.success('Appointment booked'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const handleStatusChange = (id: string, status: string) => {
        updateAppointment.mutate({ id, status } as any, {
            onSuccess: () => toast.success(`Appointment ${status.replace('_', ' ')}`),
            onError: (e: Error) => toast.error(e.message),
        })
    }

    const today = new Date().toISOString().split('T')[0]
    const todayAppts = appointments.filter((a: any) => a.appointment_date === today)

    const filtered = appointments.filter((a: any) => {
        const matchStatus = filter === 'all' || a.status === filter
        const pName = a.patients?.full_name || ''
        const dName = a.doctors?.full_name || ''
        const matchSearch = pName.toLowerCase().includes(search.toLowerCase()) ||
            dName.toLowerCase().includes(search.toLowerCase()) ||
            (a.reason || '').toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Appointments</h1>
                    <p className="text-muted-foreground">{todayAppts.length} appointments today</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <CalendarPlus className="w-4 h-4 mr-1.5" /> Book Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Book New Appointment</DialogTitle>
                            <DialogDescription>Schedule a new appointment for a patient.</DialogDescription>
                        </DialogHeader>
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
                                    {doctors.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.full_name} — {d.specialization || 'General'}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Time *</Label><Input type="time" value={fTime} onChange={e => setFTime(e.target.value)} /></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Reason / Procedure</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fReason} onChange={e => setFReason(e.target.value)}>
                                    <option value="">Select procedure</option>
                                    <option>Root Canal Treatment</option><option>Dental Implant</option><option>Teeth Cleaning</option>
                                    <option>Cavity Filling</option><option>Braces Adjustment</option><option>Tooth Extraction</option>
                                    <option>Dental Check-up</option><option>Smile Design</option><option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5"><Label>Notes</Label><Input placeholder="Additional notes..." value={fNotes} onChange={e => setFNotes(e.target.value)} /></div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createAppointment.isPending}>
                                {createAppointment.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Booking...</> : 'Book Appointment'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card className="border-border/50">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
                                        <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="capitalize text-xs">
                                            {s === 'all' ? 'All' : s.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No appointments found.</TableCell></TableRow>
                                        ) : filtered.map((apt: any) => {
                                            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled
                                            return (
                                                <TableRow key={apt.id}>
                                                    <TableCell className="font-medium">{apt.patients?.full_name || '—'}</TableCell>
                                                    <TableCell className="text-muted-foreground">{apt.doctors?.full_name || '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{new Date(apt.appointment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                        <div className="text-xs text-muted-foreground">{apt.appointment_time}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{apt.reason || '—'}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Badge variant="secondary" className={`${config.color} text-xs cursor-pointer hover:opacity-80`}>{config.label}</Badge>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'].filter(s => s !== apt.status).map(s => {
                                                                    const sc = STATUS_CONFIG[s]
                                                                    return (
                                                                        <DropdownMenuItem key={s} onClick={() => handleStatusChange(apt.id, s)}>
                                                                            <sc.icon className="w-4 h-4 mr-2" /> {sc.label}
                                                                        </DropdownMenuItem>
                                                                    )
                                                                })}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="today" className="space-y-4">
                    <div className="grid gap-3">
                        {todayAppts.length === 0 ? (
                            <Card className="border-border/50 p-8 text-center text-muted-foreground">No appointments scheduled for today.</Card>
                        ) : todayAppts.map((apt: any) => {
                            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled
                            return (
                                <Card key={apt.id} className="border-border/50 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{apt.patients?.full_name || '—'}</p>
                                                    <p className="text-sm text-muted-foreground">{apt.doctors?.full_name || '—'} &middot; {apt.reason || 'General'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{apt.appointment_time}</p>
                                                <Badge variant="secondary" className={`${config.color} text-xs mt-1`}>{config.label}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    <Card className="border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const [y, m] = calendarDate.split('-').map(Number)
                                    const d = new Date(y, m - 2, 1)
                                    setCalendarDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
                                }}>&lt;</Button>
                                <h3 className="font-semibold">
                                    {new Date(calendarDate + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => {
                                    const [y, m] = calendarDate.split('-').map(Number)
                                    const d = new Date(y, m, 1)
                                    setCalendarDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
                                }}>&gt;</Button>
                            </div>
                            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
                                ))}
                                {(() => {
                                    const [y, m] = calendarDate.split('-').map(Number)
                                    const firstDay = new Date(y, m - 1, 1).getDay()
                                    const daysInMonth = new Date(y, m, 0).getDate()
                                    const cells = []
                                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="bg-card p-2 min-h-[80px]" />)
                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                                        const dayAppts = appointments.filter((a: any) => a.appointment_date === dateStr)
                                        const isToday = dateStr === today
                                        cells.push(
                                            <div key={d} className={`bg-card p-1.5 min-h-[80px] ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                                                <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{d}</span>
                                                <div className="mt-1 space-y-0.5">
                                                    {dayAppts.slice(0, 3).map((apt: any) => {
                                                        const c = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled
                                                        return (
                                                            <div key={apt.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${c.color}`}>
                                                                {apt.appointment_time?.slice(0, 5)} {apt.patients?.full_name?.split(' ')[0] || ''}
                                                            </div>
                                                        )
                                                    })}
                                                    {dayAppts.length > 3 && (
                                                        <div className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 3} more</div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return cells
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
