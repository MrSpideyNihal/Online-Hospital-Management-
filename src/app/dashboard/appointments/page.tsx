'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    CalendarPlus, Filter, Clock, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react'

interface AppointmentData {
    id: string
    patient_name: string
    doctor_name: string
    date: string
    time: string
    reason: string
    status: string
}

const DEMO: AppointmentData[] = [
    { id: '1', patient_name: 'Rahul Sharma', doctor_name: 'Dr. Priya Patel', date: '2026-03-04', time: '10:00', reason: 'Root Canal Treatment', status: 'confirmed' },
    { id: '2', patient_name: 'Anita Desai', doctor_name: 'Dr. Amit Kumar', date: '2026-03-04', time: '10:30', reason: 'Teeth Cleaning', status: 'scheduled' },
    { id: '3', patient_name: 'Vikram Singh', doctor_name: 'Dr. Priya Patel', date: '2026-03-04', time: '11:00', reason: 'Dental Implant Consultation', status: 'in_progress' },
    { id: '4', patient_name: 'Meera Joshi', doctor_name: 'Dr. Sunita Rao', date: '2026-03-04', time: '11:30', reason: 'Braces Adjustment', status: 'scheduled' },
    { id: '5', patient_name: 'Arjun Nair', doctor_name: 'Dr. Amit Kumar', date: '2026-03-04', time: '14:00', reason: 'Cavity Filling', status: 'cancelled' },
    { id: '6', patient_name: 'Priya Menon', doctor_name: 'Dr. Sunita Rao', date: '2026-03-04', time: '14:30', reason: 'Wisdom Tooth Extraction', status: 'confirmed' },
    { id: '7', patient_name: 'Karan Malhotra', doctor_name: 'Dr. Priya Patel', date: '2026-03-05', time: '09:00', reason: 'Crown Replacement', status: 'scheduled' },
    { id: '8', patient_name: 'Sanya Gupta', doctor_name: 'Dr. Amit Kumar', date: '2026-03-05', time: '09:30', reason: 'Dental Check-up', status: 'scheduled' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

export default function AppointmentsPage() {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const todayAppts = DEMO.filter(a => a.date === today)

    const filtered = DEMO.filter(a => {
        const matchStatus = filter === 'all' || a.status === filter
        const matchSearch = a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
            a.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
            a.reason.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
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
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select patient</option>
                                    <option>Rahul Sharma</option>
                                    <option>Anita Desai</option>
                                    <option>Vikram Singh</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Doctor *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select doctor</option>
                                    <option>Dr. Priya Patel</option>
                                    <option>Dr. Amit Kumar</option>
                                    <option>Dr. Sunita Rao</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Date *</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Time *</Label>
                                    <Input type="time" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Reason / Procedure</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select procedure</option>
                                    <option>Root Canal Treatment</option>
                                    <option>Dental Implant</option>
                                    <option>Teeth Cleaning</option>
                                    <option>Cavity Filling</option>
                                    <option>Braces Adjustment</option>
                                    <option>Tooth Extraction</option>
                                    <option>Dental Check-up</option>
                                    <option>Smile Design</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Notes</Label>
                                <Input placeholder="Additional notes..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setIsAddOpen(false)}>
                                Book Appointment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    {/* Filters */}
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

                    {/* Table */}
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
                                        {filtered.map((apt) => {
                                            const config = STATUS_CONFIG[apt.status]
                                            return (
                                                <TableRow key={apt.id}>
                                                    <TableCell className="font-medium">{apt.patient_name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{apt.doctor_name}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{new Date(apt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                        <div className="text-xs text-muted-foreground">{apt.time}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{apt.reason}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={`${config.color} text-xs`}>
                                                            {config.label}
                                                        </Badge>
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
                            <Card className="border-border/50 p-8 text-center text-muted-foreground">
                                No appointments scheduled for today.
                            </Card>
                        ) : (
                            todayAppts.map((apt) => {
                                const config = STATUS_CONFIG[apt.status]
                                return (
                                    <Card key={apt.id} className="border-border/50 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{apt.patient_name}</p>
                                                        <p className="text-sm text-muted-foreground">{apt.doctor_name} &middot; {apt.reason}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{apt.time}</p>
                                                    <Badge variant="secondary" className={`${config.color} text-xs mt-1`}>
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
