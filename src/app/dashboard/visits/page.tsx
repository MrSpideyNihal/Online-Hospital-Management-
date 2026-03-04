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
    UserPlus, ArrowRight, Clock, CheckCircle, User,
} from 'lucide-react'

interface QueueItem {
    id: string; queue_number: number; patient_name: string;
    doctor_name: string; chief_complaint: string;
    status: string; check_in_time: string;
}

const DEMO_QUEUE: QueueItem[] = [
    { id: '1', queue_number: 1, patient_name: 'Rahul Sharma', doctor_name: 'Dr. Priya Patel', chief_complaint: 'Severe toothache (lower right molar)', status: 'in_progress', check_in_time: '09:45 AM' },
    { id: '2', queue_number: 2, patient_name: 'Anita Desai', doctor_name: 'Dr. Amit Kumar', chief_complaint: 'Routine cleaning', status: 'waiting', check_in_time: '10:05 AM' },
    { id: '3', queue_number: 3, patient_name: 'Vikram Singh', doctor_name: 'Dr. Priya Patel', chief_complaint: 'Follow-up for implant consultation', status: 'waiting', check_in_time: '10:20 AM' },
    { id: '4', queue_number: 4, patient_name: 'Meera Joshi', doctor_name: 'Dr. Sunita Rao', chief_complaint: 'Braces tightening', status: 'waiting', check_in_time: '10:35 AM' },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    waiting: { label: 'Waiting', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ArrowRight },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
}

export default function VisitsPage() {
    const [queue] = useState<QueueItem[]>(DEMO_QUEUE)
    const [isCheckInOpen, setIsCheckInOpen] = useState(false)

    const waiting = queue.filter(q => q.status === 'waiting').length
    const inProgress = queue.filter(q => q.status === 'in_progress').length

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
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select patient</option>
                                    <option>Rahul Sharma (PAT-00001)</option>
                                    <option>Anita Desai (PAT-00002)</option>
                                    <option>Vikram Singh (PAT-00003)</option>
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
                            <div className="space-y-1.5">
                                <Label>Chief Complaint</Label>
                                <Textarea placeholder="Describe the patient's chief complaint..." rows={3} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5"><Label>BP</Label><Input placeholder="120/80" /></div>
                                <div className="space-y-1.5"><Label>Temp (°F)</Label><Input placeholder="98.6" /></div>
                                <div className="space-y-1.5"><Label>Weight (kg)</Label><Input placeholder="70" /></div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => setIsCheckInOpen(false)}>
                                Check In Patient
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
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Completed Today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Queue List */}
            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Live Queue</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {queue.map((item) => {
                            const config = statusConfig[item.status]
                            return (
                                <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.status === 'in_progress' ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' : 'bg-card hover:bg-muted/50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${item.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                            {item.queue_number}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{item.patient_name}</p>
                                                <Badge variant="secondary" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.doctor_name} &middot; {item.chief_complaint}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Check-in: {item.check_in_time}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {item.status === 'waiting' && (
                                            <Button size="sm" variant="outline" className="text-xs">Start</Button>
                                        )}
                                        {item.status === 'in_progress' && (
                                            <Button size="sm" className="text-xs bg-green-600 text-white hover:bg-green-700">Complete</Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
