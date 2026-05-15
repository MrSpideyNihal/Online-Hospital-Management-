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
import { useDischargeCharts, useCreateDischargeChart, usePatients, useDoctors } from '@/lib/supabase/hooks'
import { printDischargeChart } from '@/lib/print-documents'
import { toast } from 'sonner'
import type { DischargeMedication } from '@/types/database'

const FREQ_PRESETS: Record<string, { label: string; options: { value: string; label: string }[] }> = {
    english: {
        label: 'English',
        options: [
            { value: 'Morning and Night After Food', label: 'Morning & Night After Food' },
            { value: 'Morning, Afternoon and Night After Food', label: 'Morning, Afternoon & Night After Food' },
            { value: 'Morning After Food', label: 'Morning After Food' },
            { value: 'Night After Food', label: 'Night After Food' },
            { value: 'As needed', label: 'As Needed (SOS)' },
        ],
    },
    marathi: {
        label: 'मराठी',
        options: [
            { value: 'सकाळी आणि रात्री जेवणानंतर', label: 'सकाळी आणि रात्री जेवणानंतर' },
            { value: 'सकाळी जेवणाआधी', label: 'सकाळी जेवणाआधी' },
            { value: 'सकाळी आणि रात्री जेवणानंतर', label: 'सकाळी आणि रात्री जेवणानंतर' },
            { value: 'सकाळी दुपारी आणि रात्री जेवणानंतर', label: 'सकाळी दुपारी आणि रात्री जेवणानंतर' },
            { value: 'गरज असल्यास', label: 'गरज असल्यास (SOS)' },
        ],
    },
    hindi: {
        label: 'हिंदी',
        options: [
            { value: 'सुबह और रात खाने के बाद', label: 'सुबह और रात खाने के बाद' },
            { value: 'सुबह खाने से पहले', label: 'सुबह खाने से पहले' },
            { value: 'सुबह दोपहर और रात खाने के बाद', label: 'सुबह दोपहर और रात खाने के बाद' },
            { value: 'जरूरत अनुसार', label: 'जरूरत अनुसार (SOS)' },
        ],
    },
}

const BLANK_MED: DischargeMedication = { sr: 1, medicine_name: '', frequency: '', doses: '1-0-1', days: 7, qty: '' }

export default function DischargePage() {
    const { hospitalId, hospital } = useAuth()
    const { data: charts = [], isLoading, isError } = useDischargeCharts(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: doctors = [] } = useDoctors(hospitalId)
    const createChart = useCreateDischargeChart()

    const freqLang = hospital?.rx_frequency_language || 'english'
    const freqPresets = FREQ_PRESETS[freqLang] || FREQ_PRESETS.english

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDoctor, setFDoctor] = useState('')
    const [fNote, setFNote] = useState('')
    const [medications, setMedications] = useState<DischargeMedication[]>([{ ...BLANK_MED }])

    const resetForm = () => {
        setFPatient(''); setFDoctor(''); setFNote('')
        setMedications([{ ...BLANK_MED }])
    }

    const updateMed = (i: number, field: keyof DischargeMedication, value: string | number) => {
        setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    }

    const handlePrint = (chart: any) => {
        const patient = patients.find(p => p.id === chart.patient_id) || chart.patients || null
        const doctor = doctors.find(d => d.id === chart.doctor_id) || chart.doctors || null
        printDischargeChart({
            hospital,
            doctor: doctor ? { ...doctor, full_name: doctor.full_name } : null,
            patient: patient ? { ...patient, full_name: patient.full_name } : null,
            chart: {
                note_text: chart.note_text,
                medications: chart.medications || [],
            },
        })
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient || !fDoctor) { toast.error('Patient and Doctor are required'); return }
        const validMeds = medications.filter(m => m.medicine_name.trim())
        if (validMeds.length === 0) { toast.error('Add at least one medication'); return }

        createChart.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            doctor_id: fDoctor,
            note_text: fNote.trim() || null,
            medications: validMeds.map((m, i) => ({ ...m, sr: i + 1 })),
        } as any, {
            onSuccess: () => { toast.success('Discharge chart created'); setIsAddOpen(false); resetForm() },
            onError: (e: any) => toast.error(e.message),
        })
    }

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }
    if (isError) {
        return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3"><p className="text-destructive">Failed to load discharge charts.</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Post-Discharge</p>
                    <h1 className="text-2xl font-bold">Discharge Medication Charts</h1>
                    <p className="text-muted-foreground">Create discharge Rx with regional language frequency support ({freqPresets.label})</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Discharge Chart
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>New Discharge Medication Chart</DialogTitle></DialogHeader>
                        <div className="grid gap-5 py-4">
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
                                <Label>Note (free text)</Label>
                                <Textarea placeholder="e.g. 7 दिवसांनी भेट या / Follow-up after 7 days" value={fNote} onChange={e => setFNote(e.target.value)} rows={2} />
                            </div>

                            {/* Medications Table */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Rx Medications</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setMedications(prev => [...prev, { ...BLANK_MED, sr: prev.length + 1 }])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Row
                                    </Button>
                                </div>
                                {medications.map((med, i) => (
                                    <div key={i} className="rounded-md border border-border/60 p-3 grid grid-cols-[1fr_1.2fr_0.6fr_0.5fr_0.5fr_auto] gap-2 items-end">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Medicine Name</Label>
                                            <Input placeholder="TAB NIFTAS 100 MG" value={med.medicine_name} onChange={e => updateMed(i, 'medicine_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Frequency ({freqPresets.label})</Label>
                                            <div className="flex gap-1">
                                                <Input placeholder="Type or pick →" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} className="flex-1" />
                                                <select className="h-9 rounded-md border border-input bg-background px-1 text-xs w-8 shrink-0" onChange={e => { if (e.target.value) updateMed(i, 'frequency', e.target.value); e.target.value = '' }} defaultValue="">
                                                    <option value="">▼</option>
                                                    {freqPresets.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1"><Label className="text-xs">Doses</Label><Input placeholder="1-0-1" value={med.doses} onChange={e => updateMed(i, 'doses', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Days</Label><Input type="number" min={1} value={med.days} onChange={e => updateMed(i, 'days', parseInt(e.target.value) || 1)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Qty</Label><Input placeholder="14" value={med.qty} onChange={e => updateMed(i, 'qty', e.target.value)} /></div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setMedications(prev => prev.filter((_, idx) => idx !== i))} disabled={medications.length <= 1}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white" onClick={handleCreate} disabled={createChart.isPending}>
                                {createChart.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Create Discharge Chart'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Discharge Charts</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Medications</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {charts.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No discharge charts found.</TableCell></TableRow>
                                ) : charts.map((chart: any) => (
                                    <TableRow key={chart.id}>
                                        <TableCell className="font-medium">{chart.patients?.full_name || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{chart.doctors?.full_name || '—'}</TableCell>
                                        <TableCell><Badge variant="secondary">{chart.medications?.length ?? 0} items</Badge></TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{chart.note_text || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(chart.created_at)}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handlePrint(chart)}>
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
