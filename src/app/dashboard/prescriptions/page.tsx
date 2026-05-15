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

    // List fields
    const [symptoms, setSymptoms] = useState<string[]>([''])
    const [examinations, setExaminations] = useState<string[]>([''])
    const [advices, setAdvices] = useState<string[]>([''])
    const [labInvestigation, setLabInvestigation] = useState<string[]>([''])
    const [medicines, setMedicines] = useState<Medicine[]>([{ ...BLANK_MED }])

    const resetForm = () => {
        setFPatient(''); setFDoctor(''); setFConsultationType(''); setFFollowUp('')
        setSymptoms(['']); setExaminations(['']); setAdvices(['']); setLabInvestigation([''])
        setMedicines([{ ...BLANK_MED }])
    }

    const updateListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) => {
        setter(prev => prev.map((v, i) => i === idx ? val : v))
    }
    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ''])
    }
    const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
        setter(prev => prev.filter((_, i) => i !== idx))
    }

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
            symptoms: symptoms.filter(s => s.trim()),
            examinations: examinations.filter(e => e.trim()),
            advices: advices.filter(a => a.trim()),
            lab_investigation: labInvestigation.filter(l => l.trim()),
            follow_up: fFollowUp.trim() || null,
            consultation_type: fConsultationType.trim() || null,
        } as any, {
            onSuccess: () => { toast.success('Prescription created'); setIsAddOpen(false); resetForm() },
            onError: (e: any) => toast.error(e.message),
        })
    }

    // Numbered list field builder
    const renderListField = (
        label: string,
        items: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        placeholder: string,
    ) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{label}</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setter)}>
                    <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
            </div>
            {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                    <Input
                        placeholder={placeholder}
                        value={item}
                        onChange={e => updateListItem(setter, i, e.target.value)}
                        className="flex-1"
                    />
                    {items.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeListItem(setter, i)}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    )

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
                    <p className="text-muted-foreground">Clinic letterhead Rx with symptoms, examinations, medication & lab orders</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Prescription
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>New Dental Prescription (Rx)</DialogTitle></DialogHeader>
                        <div className="grid gap-5 py-4">
                            {/* Patient + Doctor */}
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>

                            <div className="space-y-1.5">
                                <Label>Consultation Type</Label>
                                <Input placeholder="e.g. Regular, Follow-up, Emergency" value={fConsultationType} onChange={e => setFConsultationType(e.target.value)} />
                            </div>

                            {/* Symptoms */}
                            {renderListField('Symptoms', symptoms, setSymptoms, 'e.g. Difficulty in chewing')}

                            {/* Examinations */}
                            {renderListField('Examinations', examinations, setExaminations, 'e.g. implants (44,45,46,31,34,36,37)')}

                            {/* Medicines */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Medication (Rx)</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setMedicines(prev => [...prev, { ...BLANK_MED }])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Medicine
                                    </Button>
                                </div>
                                {/* Schedule preset language note */}
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className="text-xs text-muted-foreground">Quick Schedule:</span>
                                    {[
                                        { label: '1-0-1', value: '1-0-1' },
                                        { label: '1-1-1', value: '1-1-1' },
                                        { label: '1-0-0', value: '1-0-0' },
                                        { label: '0-0-1', value: '0-0-1' },
                                        { label: 'सुबह-दोपहर-रात (1-1-1)', value: 'सुबह-दोपहर-रात (1-1-1)' },
                                        { label: 'सुबह-रात (1-0-1)', value: 'सुबह-रात (1-0-1)' },
                                        { label: 'सुबह (1-0-0)', value: 'सकाळ (1-0-0)' },
                                    ].map(preset => (
                                        <Badge key={preset.value} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10" onClick={() => {
                                            // Apply to last medicine
                                            if (medicines.length > 0) updateMedicine(medicines.length - 1, 'schedule', preset.value)
                                        }}>{preset.label}</Badge>
                                    ))}
                                </div>
                                {medicines.map((med, i) => (
                                    <div key={i} className="rounded-md border border-border/60 p-3 space-y-2">
                                        <div className="grid grid-cols-[0.4fr_1fr_1fr_0.6fr] gap-2">
                                            <div className="space-y-1"><Label className="text-xs">Form</Label>
                                                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={med.form || 'Tab'} onChange={e => updateMedicine(i, 'form', e.target.value)}>
                                                    <option>Tab</option><option>Cap</option><option>Syp</option><option>Inj</option><option>Drops</option><option>Gel</option><option>Oint</option><option>Mouth Wash</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1"><Label className="text-xs">Name *</Label><Input placeholder="Amoxicillin" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Generic / Composition</Label><Input placeholder="Amoxicillin+ clavulonic acid" value={med.generic_name || ''} onChange={e => updateMedicine(i, 'generic_name', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Dose</Label><Input placeholder="500mg" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} /></div>
                                        </div>
                                        <div className="grid grid-cols-[0.6fr_0.5fr_0.6fr_0.5fr_auto] gap-2 items-end">
                                            <div className="space-y-1"><Label className="text-xs">Schedule (M-A-N)</Label><Input placeholder="1-0-1 or सुबह-रात" value={med.schedule || ''} onChange={e => updateMedicine(i, 'schedule', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Timing</Label>
                                                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={med.timing || ''} onChange={e => updateMedicine(i, 'timing', e.target.value)}>
                                                    <option value="">—</option><option>Before Food</option><option>After Food</option><option>With Food</option><option>Empty Stomach</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1"><Label className="text-xs">Duration</Label><Input placeholder="7 Day(s)" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} /></div>
                                            <div className="space-y-1"><Label className="text-xs">Qty</Label><Input type="number" min={1} placeholder="14" value={med.quantity || ''} onChange={e => updateMedicine(i, 'quantity', e.target.value)} /></div>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))} disabled={medicines.length <= 1}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Advices */}
                            {renderListField('Advices', advices, setAdvices, 'e.g. Avoid hard solid food')}

                            {/* Lab Investigation */}
                            {renderListField('Lab Investigation', labInvestigation, setLabInvestigation, 'e.g. OPG X-Ray')}

                            {/* Follow-up */}
                            <div className="space-y-1.5">
                                <Label>Follow-up</Label>
                                <Textarea placeholder="e.g. Review after 7 days" value={fFollowUp} onChange={e => setFFollowUp(e.target.value)} rows={2} />
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
