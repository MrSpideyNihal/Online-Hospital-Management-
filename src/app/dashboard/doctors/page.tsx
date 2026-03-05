'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose, DialogDescription,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Stethoscope, Plus, Search, Clock, IndianRupee, Phone, Mail, Loader2, MoreHorizontal, Edit, Trash2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useDoctors, useCreateDoctor, useUpdateDoctor } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { Doctor } from '@/types/database'

export default function DoctorsPage() {
    const { hospitalId } = useAuth()
    const { data: doctors = [], isLoading, isError } = useDoctors(hospitalId)
    const createDoctor = useCreateDoctor()
    const updateDoctor = useUpdateDoctor()

    const [search, setSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

    // Form state
    const [fName, setFName] = useState('')
    const [fEmail, setFEmail] = useState('')
    const [fPhone, setFPhone] = useState('')
    const [fSpec, setFSpec] = useState('')
    const [fQual, setFQual] = useState('')
    const [fExp, setFExp] = useState('')
    const [fFee, setFFee] = useState('')

    const resetForm = () => { setFName(''); setFEmail(''); setFPhone(''); setFSpec(''); setFQual(''); setFExp(''); setFFee('') }

    const openEditDoctor = (d: Doctor) => {
        setEditingDoctor(d)
        setFName(d.full_name); setFEmail(d.email || ''); setFPhone(d.phone || '')
        setFSpec(d.specialization || ''); setFQual(d.qualification || '')
        setFExp(String(d.experience_years ?? '')); setFFee(String(d.consultation_fee ?? ''))
        setIsEditOpen(true)
    }

    const handleEditDoctor = () => {
        if (!editingDoctor) return
        if (!fName.trim()) { toast.error('Doctor name is required'); return }
        if (!fSpec) { toast.error('Specialization is required'); return }
        if (fExp && (isNaN(Number(fExp)) || Number(fExp) < 0)) { toast.error('Experience must be a positive number'); return }
        if (fFee && (isNaN(Number(fFee)) || Number(fFee) < 0)) { toast.error('Consultation fee must be a positive number'); return }
        updateDoctor.mutate({
            id: editingDoctor.id,
            full_name: fName.trim(),
            email: fEmail || null,
            phone: fPhone || null,
            specialization: fSpec || null,
            qualification: fQual || null,
            experience_years: fExp ? parseInt(fExp) : 0,
            consultation_fee: fFee ? parseInt(fFee) : 0,
        }, {
            onSuccess: () => { toast.success('Doctor updated'); setIsEditOpen(false); setEditingDoctor(null); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const handleToggleActive = (d: Doctor) => {
        updateDoctor.mutate({ id: d.id, is_active: !d.is_active }, {
            onSuccess: () => toast.success(d.is_active ? 'Doctor deactivated' : 'Doctor activated'),
            onError: (e) => toast.error(e.message),
        })
    }

    const handleCreate = () => {
        if (!hospitalId) {
            toast.error('Hospital is not linked to your account yet. Please refresh or sign in again.')
            return
        }
        if (!fName.trim()) { toast.error('Doctor name is required'); return }
        if (!fSpec) { toast.error('Specialization is required'); return }
        if (fExp && (isNaN(Number(fExp)) || Number(fExp) < 0)) { toast.error('Experience must be a positive number'); return }
        if (fFee && (isNaN(Number(fFee)) || Number(fFee) < 0)) { toast.error('Consultation fee must be a positive number'); return }
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

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <p className="text-destructive font-medium">Failed to load doctors</p>
                <p className="text-sm text-muted-foreground">Please check your connection and refresh the page.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
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
                                <div className="space-y-1.5"><Label>Full Name *</Label><Input placeholder="Dr. Name" maxLength={100} value={fName} onChange={e => setFName(e.target.value)} /></div>
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
                                        <div className="flex items-center gap-1">
                                            <Badge variant={doc.is_active ? 'default' : 'secondary'} className={`text-[10px] ${doc.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}`}>
                                                {doc.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDoctor(doc)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleActive(doc)}>
                                                        {doc.is_active ? <><Trash2 className="w-4 h-4 mr-2" /> Deactivate</> : <><Stethoscope className="w-4 h-4 mr-2" /> Activate</>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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

            {/* Edit Doctor Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingDoctor(null); resetForm() } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                        <DialogDescription>Update doctor details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><Label>Full Name *</Label><Input value={fName} onChange={e => setFName(e.target.value)} /></div>
                            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><Label>Phone</Label><Input value={fPhone} onChange={e => setFPhone(e.target.value)} /></div>
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
                            <div className="space-y-1.5"><Label>Qualification</Label><Input value={fQual} onChange={e => setFQual(e.target.value)} /></div>
                            <div className="space-y-1.5"><Label>Experience (years)</Label><Input type="number" value={fExp} onChange={e => setFExp(e.target.value)} /></div>
                        </div>
                        <div className="space-y-1.5"><Label>Consultation Fee (₹)</Label><Input type="number" value={fFee} onChange={e => setFFee(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleEditDoctor} disabled={updateDoctor.isPending}>
                            {updateDoctor.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
