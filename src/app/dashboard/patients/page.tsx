'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, UserPlus, MoreHorizontal, Edit, Trash2, Eye,
    Phone, Mail, MapPin, Filter, Download, ChevronLeft, ChevronRight, Loader2, QrCode,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { usePatients, useCreatePatient, useDeletePatient } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { Patient } from '@/types/database'

export default function PatientsPage() {
    const { hospitalId } = useAuth()
    const { data: patients = [], isLoading } = usePatients(hospitalId)
    const createPatient = useCreatePatient()
    const deletePatient = useDeletePatient()

    const [search, setSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [qrPatient, setQrPatient] = useState<Patient | null>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formDob, setFormDob] = useState('')
    const [formGender, setFormGender] = useState('')
    const [formBloodGroup, setFormBloodGroup] = useState('')
    const [formAddress, setFormAddress] = useState('')
    const [formCity, setFormCity] = useState('')
    const [formEmergencyName, setFormEmergencyName] = useState('')
    const [formEmergencyPhone, setFormEmergencyPhone] = useState('')
    const [formAllergies, setFormAllergies] = useState('')
    const [formMedicalHistory, setFormMedicalHistory] = useState('')

    const resetForm = () => {
        setFormName(''); setFormEmail(''); setFormPhone(''); setFormDob(''); setFormGender('');
        setFormBloodGroup(''); setFormAddress(''); setFormCity(''); setFormEmergencyName('');
        setFormEmergencyPhone(''); setFormAllergies(''); setFormMedicalHistory('');
    }

    const handleCreatePatient = () => {
        if (!hospitalId || !formName.trim()) {
            toast.error('Please fill in required fields')
            return
        }
        createPatient.mutate({
            hospital_id: hospitalId,
            full_name: formName.trim(),
            email: formEmail || null,
            phone: formPhone || null,
            date_of_birth: formDob || null,
            gender: (formGender as 'male' | 'female' | 'other') || null,
            blood_group: formBloodGroup || null,
            address: formAddress || null,
            city: formCity || null,
            emergency_contact_name: formEmergencyName || null,
            emergency_contact_phone: formEmergencyPhone || null,
            allergies: formAllergies ? formAllergies.split(',').map(a => a.trim()) : [],
            medical_history: formMedicalHistory || null,
        }, {
            onSuccess: () => { toast.success('Patient created successfully'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const handleDelete = (id: string) => {
        if (!hospitalId) return
        deletePatient.mutate({ id, hospitalId }, {
            onSuccess: () => toast.success('Patient deleted'),
            onError: (e) => toast.error(e.message),
        })
    }

    const filtered = patients.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.patient_id_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.phone || '').includes(search) ||
        (p.email || '').toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Patients</h1>
                    <p className="text-muted-foreground">Manage all patient records</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1.5" /> Export
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <UserPlus className="w-4 h-4 mr-1.5" /> Add Patient
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Patient</DialogTitle>
                                <DialogDescription>Fill in the patient details below.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input id="full_name" placeholder="Enter full name" value={formName} onChange={(e) => setFormName(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="patient@email.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input id="phone" placeholder="+91 XXXXX XXXXX" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select id="gender" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={formGender} onChange={(e) => setFormGender(e.target.value)}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <select id="blood_group" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={formBloodGroup} onChange={(e) => setFormBloodGroup(e.target.value)}>
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="Full address" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="City" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergency_name">Emergency Contact</Label>
                                    <Input id="emergency_name" placeholder="Contact name" value={formEmergencyName} onChange={(e) => setFormEmergencyName(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                                    <Input id="emergency_phone" placeholder="+91 XXXXX XXXXX" value={formEmergencyPhone} onChange={(e) => setFormEmergencyPhone(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Input id="allergies" placeholder="Comma-separated (e.g., Penicillin, Latex)" value={formAllergies} onChange={(e) => setFormAllergies(e.target.value)} />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="medical_history">Medical History</Label>
                                    <Textarea id="medical_history" placeholder="Any relevant medical history..." rows={3} value={formMedicalHistory} onChange={(e) => setFormMedicalHistory(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreatePatient} disabled={createPatient.isPending}>
                                    {createPatient.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Save Patient'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search & Filter */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search by name, ID, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-1.5" /> Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Patient Table */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="hidden lg:table-cell">Gender / Age</TableHead>
                                    <TableHead className="hidden lg:table-cell">Blood</TableHead>
                                    <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((patient) => {
                                    const age = patient.date_of_birth
                                        ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                                        : null
                                    return (
                                        <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell className="font-mono text-xs">{patient.patient_id_number}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-primary">
                                                            {patient.full_name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{patient.full_name}</p>
                                                        {patient.allergies && patient.allergies.length > 0 && (
                                                            <div className="flex gap-1 mt-0.5">
                                                                {patient.allergies.map(a => (
                                                                    <Badge key={a} variant="destructive" className="text-[9px] px-1 py-0 h-4">{a}</Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{patient.phone}</div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{patient.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm">
                                                <span className="capitalize">{patient.gender}</span>
                                                {age && <span className="text-muted-foreground"> / {age}y</span>}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Badge variant="outline" className="text-xs">{patient.blood_group}</Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {patient.last_visit ? formatDate(patient.last_visit) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                                                            <Eye className="w-4 h-4 mr-2" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setQrPatient(patient)}>
                                                            <QrCode className="w-4 h-4 mr-2" /> QR Code
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(patient.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <p className="text-sm text-muted-foreground">Showing 1-{filtered.length} of {filtered.length}</p>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Patient Detail Dialog */}
            <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Patient Details</DialogTitle>
                    </DialogHeader>
                    {selectedPatient && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary">
                                        {selectedPatient.full_name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedPatient.full_name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.patient_id_number}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium block">{selectedPatient.email}</span></div>
                                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium block">{selectedPatient.phone}</span></div>
                                <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium block capitalize">{selectedPatient.gender}</span></div>
                                <div><span className="text-muted-foreground">Blood Group:</span> <span className="font-medium block">{selectedPatient.blood_group}</span></div>
                                <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium block">{selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : '—'}</span></div>
                                <div><span className="text-muted-foreground">City:</span> <span className="font-medium block">{selectedPatient.city}</span></div>
                                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium block">{selectedPatient.address}</span></div>
                                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Allergies:</span>
                                        <div className="flex gap-1 mt-1">{selectedPatient.allergies.map(a => <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>)}</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                Registered on {formatDate(selectedPatient.created_at)}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedPatient(null); if (selectedPatient) setQrPatient(selectedPatient) }}>
                            <QrCode className="w-4 h-4 mr-1.5" /> Show QR
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog open={!!qrPatient} onOpenChange={() => setQrPatient(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Patient QR Code</DialogTitle>
                    </DialogHeader>
                    {qrPatient && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-white rounded-xl">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${qrPatient.id}`}
                                    size={200}
                                    level="H"
                                />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">{qrPatient.full_name}</p>
                                <p className="text-sm text-muted-foreground font-mono">{qrPatient.patient_id_number}</p>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Scan this QR code to view patient information. Print and attach to patient file.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
