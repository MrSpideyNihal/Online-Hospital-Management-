'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
    Stethoscope, Plus, Search, Clock, IndianRupee, Phone, Mail, Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useDoctors, useCreateDoctor } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

export default function DoctorsPage() {
    const { hospitalId } = useAuth()
    const { data: doctors = [], isLoading } = useDoctors(hospitalId)
    const createDoctor = useCreateDoctor()

    const [search, setSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Form state
    const [fName, setFName] = useState('')
    const [fEmail, setFEmail] = useState('')
    const [fPhone, setFPhone] = useState('')
    const [fSpec, setFSpec] = useState('')
    const [fQual, setFQual] = useState('')
    const [fExp, setFExp] = useState('')
    const [fFee, setFFee] = useState('')

    const resetForm = () => { setFName(''); setFEmail(''); setFPhone(''); setFSpec(''); setFQual(''); setFExp(''); setFFee('') }

    const handleCreate = () => {
        if (!hospitalId || !fName.trim()) { toast.error('Name is required'); return }
        createDoctor.mutate({
            hospital_id: hospitalId,
            full_name: fName.trim(),
            email: fEmail || null,
            phone: fPhone || null,
            specialization: fSpec || null,
            qualification: fQual || null,
            experience_years: fExp ? parseInt(fExp) : 0,
            consultation_fee: fFee ? parseInt(fFee) : 0,
            is_active: true,
        }, {
            onSuccess: () => { toast.success('Doctor added'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const filtered = doctors.filter(d =>
        d.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (d.specialization || '').toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Doctors</h1>
                    <p className="text-muted-foreground">{doctors.filter(d => d.is_active).length} active doctors</p>
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
                                <div className="space-y-1.5"><Label>Full Name *</Label><Input placeholder="Dr. Name" value={fName} onChange={e => setFName(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="doctor@hospital.com" value={fEmail} onChange={e => setFEmail(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={fPhone} onChange={e => setFPhone(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Specialization</Label>
                                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fSpec} onChange={e => setFSpec(e.target.value)}>
                                        <option value="">Select</option>
                                        <option>General Dentistry</option><option>Endodontics</option><option>Orthodontics</option>
                                        <option>Prosthodontics</option><option>Periodontics</option><option>Oral Surgery</option>
                                        <option>Pediatric Dentistry</option><option>Cosmetic Dentistry</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>Qualification</Label><Input placeholder="BDS, MDS" value={fQual} onChange={e => setFQual(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Experience (years)</Label><Input type="number" placeholder="0" value={fExp} onChange={e => setFExp(e.target.value)} /></div>
                            </div>
                            <div className="space-y-1.5"><Label>Consultation Fee (₹)</Label><Input type="number" placeholder="500" value={fFee} onChange={e => setFFee(e.target.value)} /></div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createDoctor.isPending}>
                                {createDoctor.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Adding...</> : 'Add Doctor'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search doctors by name or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                </CardContent>
            </Card>

            {filtered.length === 0 ? (
                <Card className="border-border/50"><CardContent className="p-12 text-center text-muted-foreground">No doctors found.</CardContent></Card>
            ) : (
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
                                    <p className="text-sm text-primary font-medium">{doc.specialization || 'General'}</p>
                                    <p className="text-xs text-muted-foreground">{doc.qualification || '—'} &middot; {doc.experience_years ?? 0} years exp.</p>

                                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                                        {doc.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{doc.phone}</div>}
                                        {doc.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{doc.email}</div>}
                                        <div className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{doc.consultation_fee ?? 0}</div>
                                    </div>

                                    {doc.schedule && typeof doc.schedule === 'object' && Object.keys(doc.schedule).length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Schedule</p>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(doc.schedule as Record<string, string>).map(([day, time]) => (
                                                <Badge key={day} variant="outline" className="text-[10px] font-normal">{day}: {time}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            )}
        </div>
    )
}
