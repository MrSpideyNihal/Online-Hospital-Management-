/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Plus, Loader2, Trash2, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { usePrescriptions, useCreatePrescription, usePatients, useDoctors } from '@/lib/supabase/hooks'
import { printDentalRx } from '@/lib/print-documents'
import { toast } from 'sonner'
import type { Medicine } from '@/types/database'

const BLANK_MED: Medicine = { name: '', generic_name: '', dosage: '', frequency: '', duration: '', form: 'Tab', timing: 'After Food', schedule: '1-0-1' }

export default function PrescriptionsPage() {
    const { hospitalId, hospital } = useAuth()
    const { data: prescriptions = [], isLoading, isError } = usePrescriptions(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: doctors = [] } = useDoctors(hospitalId)
    const createPrescription = useCreatePrescription()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDoctor, setFDoctor] = useState('')
    const [fConsultationType, setFConsultationType] = useState('')
    const [fFollowUp, setFFollowUp] = useState('')

    // Simple textarea fields — one item per line
    const [symptomsText, setSymptomsText] = useState('')
    const [examinationsText, setExaminationsText] = useState('')
    const [advicesText, setAdvicesText] = useState('')
    const [labText, setLabText] = useState('')
    const [medicines, setMedicines] = useState<Medicine[]>([{ ...BLANK_MED }])

    const resetForm = () => {
        setFPatient(''); setFDoctor(''); setFConsultationType(''); setFFollowUp('')
        setSymptomsText(''); setExaminationsText(''); setAdvicesText(''); setLabText('')
        setMedicines([{ ...BLANK_MED }])
    }

    // Split textarea into array, filtering blanks
    const textToArray = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean)

    const updateMedicine = (i: number, field: keyof Medicine, value: string | number) => {
        setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    }

    const handlePrint = (rx: any) => {
        const patient = patients.find(p => p.id === rx.patient_id) || rx.patients || null
        const doctor = doctors.find(d => d.id === rx.doctor_id) || rx.doctors || null
        printDentalRx({
            hospital,
            doctor: doctor ? { ...doctor, full_name: doctor.full_name } : null,
            patient: patient ? { ...patient, full_name: patient.full_name } : null,
            prescription: {
                created_at: rx.created_at,
                symptoms: rx.symptoms || [],
                examinations: rx.examinations || [],
                medicines: rx.medicines || [],
                advices: rx.advices || [],
                lab_investigation: rx.lab_investigation || [],
                follow_up: rx.follow_up,
                consultation_type: rx.consultation_type,
            },
        })
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient || !fDoctor) { toast.error('Patient and Doctor are required'); return }
        const validMeds = medicines.filter(m => m.name.trim())
        if (validMeds.length === 0) { toast.error('Add at least one medicine'); return }

        createPrescription.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            doctor_id: fDoctor,
            diagnosis: null,
            instructions: null,
            medicines: validMeds,
            symptoms: textToArray(symptomsText),
            examinations: textToArray(examinationsText),
            advices: textToArray(advicesText),
            lab_investigation: textToArray(labText),
            follow_up: fFollowUp.trim() || null,
            consultation_type: fConsultationType.trim() || null,
        } as any, {
            onSuccess: () => { toast.success('Prescription created'); setIsAddOpen(false); resetForm() },
            onError: (e: any) => toast.error(e.message),
        })
    }

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3"><p className="text-destructive">Failed to load prescriptions.</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dental Prescriptions</h1>
                    <p className="text-muted-foreground">Create and print clinic Rx prescriptions</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Prescription
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>New Prescription (Rx)</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Patient + Doctor — always needed */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Patient *</Label>
                                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                        <option value="">Select patient</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id_number})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Doctor *</Label>
                                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fDoctor} onChange={e => setFDoctor(e.target.value)}>
                                        <option value="">Select doctor</option>
                                        {doctors.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Consultation Type */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Consultation Type</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fConsultationType} onChange={e => setFConsultationType(e.target.value)}>
                                    <option value="">Select type</option>
                                    <option>Regular</option>
                                    <option>Follow-up</option>
                                    <option>Emergency</option>
                                    <option>Referral</option>
                                </select>
                            </div>

                            {/* Symptoms — simple textarea */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Symptoms <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                                <Textarea placeholder={"Difficulty in chewing\nPain in lower jaw\nSensitivity to cold"} value={symptomsText} onChange={e => setSymptomsText(e.target.value)} rows={3} className="text-sm" />
                            </div>

                            {/* Examinations — simple textarea */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Examinations <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                                <Textarea placeholder={"implants (44,45,46,31,34,36,37)\ncrown (31,32,41,42,43,44)\nCaries (33,34,35,43,44)"} value={examinationsText} onChange={e => setExaminationsText(e.target.value)} rows={3} className="text-sm" />
                            </div>

                            {/* Medicines — simplified cards */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Medication (Rx)</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setMedicines(prev => [...prev, { ...BLANK_MED }])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {medicines.map((med, i) => (
                                    <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2 bg-muted/20">
                                        {/* Row 1: Essential — Name + Form */}
                                        <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Form</Label>
                                                <select className="h-9 rounded-md border border-input bg-background px-2 text-sm w-20" value={med.form || 'Tab'} onChange={e => updateMedicine(i, 'form', e.target.value)}>
                                                    <option>Tab</option><option>Cap</option><option>Syp</option><option>Inj</option><option>Drops</option><option>Gel</option><option>Oint</option><option>Mouth Wash</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Medicine Name *</Label>
                                                <Input placeholder="e.g. Amoxicillin 500mg" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))} disabled={medicines.length <= 1}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                        {/* Row 2: Schedule + Timing + Duration */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Schedule</Label>
                                                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={med.schedule || ''} onChange={e => updateMedicine(i, 'schedule', e.target.value)}>
                                                    <option value="1-0-1">1-0-1 (Morning-Night)</option>
                                                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                                                    <option value="1-0-0">1-0-0 (Morning only)</option>
                                                    <option value="0-0-1">0-0-1 (Night only)</option>
                                                    <option value="0-1-0">0-1-0 (Afternoon only)</option>
                                                    <option value="1-1-0">1-1-0 (Morning-Afternoon)</option>
                                                    <option value="सुबह-रात (1-0-1)">सुबह-रात (1-0-1)</option>
                                                    <option value="सुबह-दोपहर-रात (1-1-1)">सुबह-दोपहर-रात (1-1-1)</option>
                                                    <option value="सकाळ-रात्री (1-0-1)">सकाळ-रात्री (1-0-1)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Timing</Label>
                                                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={med.timing || ''} onChange={e => updateMedicine(i, 'timing', e.target.value)}>
                                                    <option>After Food</option><option>Before Food</option><option>With Food</option><option>Empty Stomach</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Duration</Label>
                                                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={med.duration || ''} onChange={e => updateMedicine(i, 'duration', e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option>3 Day(s)</option><option>5 Day(s)</option><option>7 Day(s)</option><option>10 Day(s)</option><option>14 Day(s)</option><option>15 Day(s)</option><option>30 Day(s)</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Row 3: Optional extras — collapsed feel */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Generic / Composition</Label><Input placeholder="Optional" value={med.generic_name || ''} onChange={e => updateMedicine(i, 'generic_name', e.target.value)} className="h-8 text-xs" /></div>
                                            <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Dose</Label><Input placeholder="500mg" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} className="h-8 text-xs" /></div>
                                            <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Qty</Label><Input type="number" min={1} placeholder="14" value={med.quantity || ''} onChange={e => updateMedicine(i, 'quantity', e.target.value)} className="h-8 text-xs" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Advices — simple textarea */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Advices <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                                <Textarea placeholder={"Avoid hard solid food\nAdviced soft diet\nWarm saline gargles three times a day"} value={advicesText} onChange={e => setAdvicesText(e.target.value)} rows={3} className="text-sm" />
                            </div>

                            {/* Lab Investigation — simple textarea */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Lab Investigation <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                                <Textarea placeholder={"OPG X-Ray\nCBCT (3D)\nBlood sugar fasting"} value={labText} onChange={e => setLabText(e.target.value)} rows={2} className="text-sm" />
                            </div>

                            {/* Follow-up */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Follow-up</Label>
                                <Input placeholder="e.g. Review after 7 days" value={fFollowUp} onChange={e => setFFollowUp(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createPrescription.isPending}>
                                {createPrescription.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Create Prescription'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Prescriptions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Symptoms</TableHead>
                                    <TableHead>Medicines</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No prescriptions found.</TableCell></TableRow>
                                ) : prescriptions.map((rx: any) => (
                                    <TableRow key={rx.id}>
                                        <TableCell className="font-medium">{rx.patients?.full_name || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{rx.doctors?.full_name || '—'}</TableCell>
                                        <TableCell><Badge variant="secondary">{(rx.symptoms?.length ?? 0)} items</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{rx.medicines?.length ?? 0} meds</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(rx.created_at)}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handlePrint(rx)} title="Print Rx">
                                                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
                                            </Button>
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
