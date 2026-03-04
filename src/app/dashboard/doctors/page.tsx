'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Stethoscope, Plus, Search, Clock, IndianRupee, Phone, Mail,
} from 'lucide-react'

interface DoctorData {
    id: string; full_name: string; email: string; phone: string;
    specialization: string; qualification: string; experience_years: number;
    consultation_fee: number; is_active: boolean;
    schedule: Record<string, string>
}

const DEMO_DOCTORS: DoctorData[] = [
    { id: '1', full_name: 'Dr. Priya Patel', email: 'priya@smilecare.com', phone: '+91 99887 76655', specialization: 'Endodontics', qualification: 'BDS, MDS', experience_years: 12, consultation_fee: 500, is_active: true, schedule: { Mon: '9:00-17:00', Tue: '9:00-17:00', Wed: '9:00-13:00', Thu: '9:00-17:00', Fri: '9:00-17:00' } },
    { id: '2', full_name: 'Dr. Amit Kumar', email: 'amit@smilecare.com', phone: '+91 88776 65544', specialization: 'Orthodontics', qualification: 'BDS, MDS (Ortho)', experience_years: 8, consultation_fee: 600, is_active: true, schedule: { Mon: '10:00-18:00', Tue: '10:00-18:00', Wed: '10:00-18:00', Thu: '10:00-18:00', Sat: '9:00-14:00' } },
    { id: '3', full_name: 'Dr. Sunita Rao', email: 'sunita@smilecare.com', phone: '+91 77665 54433', specialization: 'Prosthodontics', qualification: 'BDS, MDS, FICOI', experience_years: 15, consultation_fee: 800, is_active: true, schedule: { Mon: '9:00-16:00', Wed: '9:00-16:00', Fri: '9:00-16:00' } },
    { id: '4', full_name: 'Dr. Rajesh Menon', email: 'rajesh@smilecare.com', phone: '+91 66554 43322', specialization: 'Pediatric Dentistry', qualification: 'BDS, MDS (Pedo)', experience_years: 6, consultation_fee: 400, is_active: false, schedule: { Tue: '10:00-17:00', Thu: '10:00-17:00', Sat: '10:00-14:00' } },
]

export default function DoctorsPage() {
    const [search, setSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)

    const filtered = DEMO_DOCTORS.filter(d =>
        d.full_name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Doctors</h1>
                    <p className="text-muted-foreground">{DEMO_DOCTORS.filter(d => d.is_active).length} active doctors</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Full Name *</Label><Input placeholder="Dr. Name" /></div>
                                <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="doctor@hospital.com" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 XXXXX XXXXX" /></div>
                                <div className="space-y-1.5"><Label>Specialization</Label>
                                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">Select</option>
                                        <option>General Dentistry</option><option>Endodontics</option><option>Orthodontics</option>
                                        <option>Prosthodontics</option><option>Periodontics</option><option>Oral Surgery</option>
                                        <option>Pediatric Dentistry</option><option>Cosmetic Dentistry</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Qualification</Label><Input placeholder="BDS, MDS" /></div>
                                <div className="space-y-1.5"><Label>Experience (years)</Label><Input type="number" placeholder="0" /></div>
                            </div>
                            <div className="space-y-1.5"><Label>Consultation Fee (₹)</Label><Input type="number" placeholder="500" /></div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setIsAddOpen(false)}>Add Doctor</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search doctors by name or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                </CardContent>
            </Card>

            {/* Doctor Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((doc) => (
                    <Card key={doc.id} className="border-border/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{doc.full_name}</h3>
                                        <Badge variant={doc.is_active ? 'default' : 'secondary'} className={`text-[10px] ${doc.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}`}>
                                            {doc.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-primary font-medium">{doc.specialization}</p>
                                    <p className="text-xs text-muted-foreground">{doc.qualification} &middot; {doc.experience_years} years exp.</p>

                                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{doc.phone}</div>
                                        <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{doc.email}</div>
                                        <div className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{doc.consultation_fee}</div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Schedule</p>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(doc.schedule).map(([day, time]) => (
                                                <Badge key={day} variant="outline" className="text-[10px] font-normal">{day}: {time}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
