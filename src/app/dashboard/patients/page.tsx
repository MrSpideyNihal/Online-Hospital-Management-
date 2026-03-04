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
    Phone, Mail, MapPin, Filter, Download, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PatientData {
    id: string
    patient_id_number: string
    full_name: string
    email: string
    phone: string
    gender: string
    date_of_birth: string
    blood_group: string
    address: string
    city: string
    allergies: string[]
    last_visit: string | null
    created_at: string
}

const DEMO_PATIENTS: PatientData[] = [
    { id: '1', patient_id_number: 'PAT-00001', full_name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91 98765 43210', gender: 'male', date_of_birth: '1990-05-15', blood_group: 'B+', address: '123 MG Road', city: 'Mumbai', allergies: ['Penicillin'], last_visit: '2026-03-01', created_at: '2025-01-10' },
    { id: '2', patient_id_number: 'PAT-00002', full_name: 'Anita Desai', email: 'anita@gmail.com', phone: '+91 87654 32109', gender: 'female', date_of_birth: '1985-08-22', blood_group: 'O+', address: '456 Park Street', city: 'Delhi', allergies: [], last_visit: '2026-02-28', created_at: '2025-02-15' },
    { id: '3', patient_id_number: 'PAT-00003', full_name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '+91 76543 21098', gender: 'male', date_of_birth: '1978-12-03', blood_group: 'A+', address: '789 Anna Nagar', city: 'Chennai', allergies: ['Aspirin', 'Latex'], last_visit: '2026-03-03', created_at: '2025-03-01' },
    { id: '4', patient_id_number: 'PAT-00004', full_name: 'Meera Joshi', email: 'meera@gmail.com', phone: '+91 65432 10987', gender: 'female', date_of_birth: '1995-03-18', blood_group: 'AB+', address: '321 Banjara Hills', city: 'Hyderabad', allergies: [], last_visit: null, created_at: '2025-04-20' },
    { id: '5', patient_id_number: 'PAT-00005', full_name: 'Arjun Nair', email: 'arjun@gmail.com', phone: '+91 54321 09876', gender: 'male', date_of_birth: '2000-07-25', blood_group: 'B-', address: '654 MG Road', city: 'Bangalore', allergies: ['Codeine'], last_visit: '2026-02-25', created_at: '2025-05-10' },
]

export default function PatientsPage() {
    const [search, setSearch] = useState('')
    const [patients] = useState<PatientData[]>(DEMO_PATIENTS)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)

    const filtered = patients.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.patient_id_number.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )

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
                                    <Input id="full_name" placeholder="Enter full name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="patient@email.com" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" type="date" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select id="gender" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <select id="blood_group" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="Full address" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="City" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergency_name">Emergency Contact</Label>
                                    <Input id="emergency_name" placeholder="Contact name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                                    <Input id="emergency_phone" placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Input id="allergies" placeholder="Comma-separated (e.g., Penicillin, Latex)" />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="medical_history">Medical History</Label>
                                    <Textarea id="medical_history" placeholder="Any relevant medical history..." rows={3} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setIsAddOpen(false)}>
                                    Save Patient
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
                                                        {patient.allergies.length > 0 && (
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
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">
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
                                <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium block">{formatDate(selectedPatient.date_of_birth)}</span></div>
                                <div><span className="text-muted-foreground">City:</span> <span className="font-medium block">{selectedPatient.city}</span></div>
                                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium block">{selectedPatient.address}</span></div>
                                {selectedPatient.allergies.length > 0 && (
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
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
