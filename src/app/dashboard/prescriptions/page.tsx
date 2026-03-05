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
import { Eye, Plus, Loader2, Trash2, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { usePrescriptions, useCreatePrescription, usePatients, useDoctors } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { Medicine, Prescription } from '@/types/database'
import jsPDF from 'jspdf'

export default function PrescriptionsPage() {
    const { hospitalId, hospital } = useAuth()
    const { data: prescriptions = [], isLoading, isError } = usePrescriptions(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: doctors = [] } = useDoctors(hospitalId)
    const createPrescription = useCreatePrescription()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDoctor, setFDoctor] = useState('')
    const [fDiagnosis, setFDiagnosis] = useState('')
    const [fInstructions, setFInstructions] = useState('')
    const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }])

    const resetForm = () => {
        setFPatient(''); setFDoctor(''); setFDiagnosis(''); setFInstructions('')
        setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }])
    }

    const generatePDF = (rx: Prescription & { patients?: { full_name: string }; doctors?: { full_name: string } }) => {
        const doc = new jsPDF()
        const hospitalName = hospital?.name || 'DentalHub Clinic'
        const hospitalAddr = hospital?.address || ''
        const hospitalPhone = hospital?.phone || ''

        // Header
        doc.setFillColor(37, 99, 235)
        doc.rect(0, 0, 210, 35, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text(hospitalName, 15, 18)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        if (hospitalAddr) doc.text(hospitalAddr, 15, 26)
        if (hospitalPhone) doc.text(`Phone: ${hospitalPhone}`, 15, 31)

        // Prescription title
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('PRESCRIPTION', 15, 50)

        // Date
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`Date: ${formatDate(rx.created_at)}`, 150, 50)

        // Patient & Doctor info
        let y = 62
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.text('Patient:', 15, y)
        doc.setFont('helvetica', 'normal')
        doc.text(rx.patients?.full_name || '—', 45, y)

        doc.setFont('helvetica', 'bold')
        doc.text('Doctor:', 120, y)
        doc.setFont('helvetica', 'normal')
        doc.text(rx.doctors?.full_name || '—', 145, y)
        y += 8

        if (rx.diagnosis) {
            doc.setFont('helvetica', 'bold')
            doc.text('Diagnosis:', 15, y)
            doc.setFont('helvetica', 'normal')
            doc.text(rx.diagnosis, 45, y)
            y += 8
        }

        // Separator
        doc.setDrawColor(200, 200, 200)
        doc.line(15, y, 195, y)
        y += 8

        // Medicines table header
        doc.setFillColor(245, 245, 245)
        doc.rect(15, y - 5, 180, 8, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('#', 18, y)
        doc.text('Medicine', 28, y)
        doc.text('Dosage', 90, y)
        doc.text('Frequency', 125, y)
        doc.text('Duration', 165, y)
        y += 8

        // Medicines rows
        doc.setFont('helvetica', 'normal')
        ;(rx.medicines || []).forEach((med: Medicine, i: number) => {
            if (y > 265) { doc.addPage(); y = 20 }
            doc.text(`${i + 1}`, 18, y)
            doc.text(med.name || '', 28, y)
            doc.text(med.dosage || '', 90, y)
            doc.text(med.frequency || '', 125, y)
            doc.text(med.duration || '', 165, y)
            y += 7
        })

        y += 5
        doc.setDrawColor(200, 200, 200)
        doc.line(15, y, 195, y)
        y += 10

        // Instructions
        if (rx.instructions) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.text('Instructions:', 15, y)
            y += 6
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            const lines = doc.splitTextToSize(rx.instructions, 170)
            doc.text(lines, 15, y)
            y += lines.length * 5 + 10
        }

        // Signature area
        doc.setDrawColor(150, 150, 150)
        doc.line(130, y + 15, 190, y + 15)
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text("Doctor's Signature", 140, y + 21)

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Generated by DentalHub — www.dentalhub.in', 15, 285)

        const patientName = (rx.patients?.full_name || 'prescription').replace(/\s+/g, '_')
        doc.save(`prescription_${patientName}_${new Date(rx.created_at).toISOString().split('T')[0]}.pdf`)
        toast.success('PDF downloaded')
    }

    const updateMedicine = (i: number, field: keyof Medicine, value: string) => {
        setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient || !fDoctor) { toast.error('Patient and Doctor are required'); return }
        const validMeds = medicines.filter(m => m.name.trim())
        if (validMeds.length === 0) { toast.error('Add at least one medicine'); return }
        const incompleteMed = validMeds.find(m => !m.dosage?.trim() || !m.frequency?.trim() || !m.duration?.trim())
        if (incompleteMed) { toast.error(`Complete all fields for medicine: ${incompleteMed.name}`); return }
        createPrescription.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            doctor_id: fDoctor,
            diagnosis: fDiagnosis || null,
            instructions: fInstructions || null,
            medicines: validMeds,
        }, {
            onSuccess: () => { toast.success('Prescription created'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
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
                    <h1 className="text-2xl font-bold">Prescriptions</h1>
                    <p className="text-muted-foreground">Digital prescriptions with PDF generation</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Prescription
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>New Prescription</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Patient *</Label>
                                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                        <option value="">Select patient</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
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
                                <Label>Diagnosis</Label>
                                <Input placeholder="e.g., Acute Pulpitis" value={fDiagnosis} onChange={e => setFDiagnosis(e.target.value)} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Medicines</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {medicines.map((med, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_0.7fr_0.8fr_0.7fr_auto] gap-2 items-end">
                                        <div className="space-y-1"><Label className="text-xs">Name</Label><Input placeholder="Amoxicillin" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Dosage</Label><Input placeholder="500mg" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Frequency</Label><Input placeholder="3x/day" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Duration</Label><Input placeholder="7 days" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} /></div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))} disabled={medicines.length <= 1}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Instructions</Label>
                                <Textarea placeholder="Take medicines after food, drink plenty of water..." value={fInstructions} onChange={e => setFInstructions(e.target.value)} rows={2} />
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
                                    <TableHead>Diagnosis</TableHead>
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
                                        <TableCell>{rx.diagnosis || '—'}</TableCell>
                                        <TableCell><Badge variant="secondary">{rx.medicines?.length ?? 0} items</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(rx.created_at)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generatePDF(rx)} title="Download PDF">
                                                <Download className="w-4 h-4" />
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
