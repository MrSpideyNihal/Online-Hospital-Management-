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
import { Plus, Loader2, CheckCircle, Clock, XCircle, AlertCircle, IndianRupee } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTreatments, useCreateTreatment, useUpdateTreatment, usePatients } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { TreatmentStatus } from '@/types/database'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    planned: { label: 'Planned', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

const TREATMENT_TYPES = [
    'Root Canal Treatment', 'Dental Implant', 'Tooth Extraction', 'Cavity Filling',
    'Dental Crown', 'Bridge', 'Teeth Cleaning', 'Teeth Whitening',
    'Braces / Orthodontic', 'Smile Design', 'Gum Treatment', 'Dentures',
    'Wisdom Tooth Removal', 'Pediatric Dental Care', 'Other',
]

export default function TreatmentsPage() {
    const { hospitalId, user } = useAuth()
    const { data: treatments = [], isLoading } = useTreatments(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const createTreatment = useCreateTreatment()
    const updateTreatment = useUpdateTreatment()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    // Form state
    const [fPatient, setFPatient] = useState('')
    const [fType, setFType] = useState('')
    const [fDesc, setFDesc] = useState('')
    const [fTooth, setFTooth] = useState('')
    const [fEstCost, setFEstCost] = useState('')
    const [fPlannedDate, setFPlannedDate] = useState('')
    const [fNotes, setFNotes] = useState('')

    const resetForm = () => {
        setFPatient(''); setFType(''); setFDesc(''); setFTooth('');
        setFEstCost(''); setFPlannedDate(''); setFNotes('')
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient || !fType) {
            toast.error('Patient and treatment type are required')
            return
        }
        createTreatment.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            treatment_type: fType,
            description: fDesc || null,
            tooth_number: fTooth ? parseInt(fTooth) : null,
            estimated_cost: fEstCost ? parseFloat(fEstCost) : null,
            planned_date: fPlannedDate || null,
            status: 'planned',
            performed_by: user?.id ?? null,
            notes: fNotes || null,
        }, {
            onSuccess: () => { toast.success('Treatment plan created'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const handleStatusChange = (id: string, status: TreatmentStatus) => {
        updateTreatment.mutate({
            id,
            status,
            ...(status === 'completed' ? { completed_date: new Date().toISOString().split('T')[0] } : {}),
        }, {
            onSuccess: () => toast.success(`Treatment marked as ${status.replace('_', ' ')}`),
            onError: (e) => toast.error(e.message),
        })
    }

    const filtered = treatments.filter((t: any) => {
        const matchStatus = filter === 'all' || t.status === filter
        const matchSearch = (t.patients?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            t.treatment_type.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    // Summary stats
    const planned = treatments.filter((t: any) => t.status === 'planned').length
    const inProgress = treatments.filter((t: any) => t.status === 'in_progress').length
    const completed = treatments.filter((t: any) => t.status === 'completed').length
    const totalEstimated = treatments.reduce((sum: number, t: any) => sum + (Number(t.estimated_cost) || 0), 0)
    const totalActual = treatments.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + (Number(t.actual_cost) || Number(t.estimated_cost) || 0), 0)

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Treatment Plans</h1>
                    <p className="text-muted-foreground">Plan, track, and manage dental treatments</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Treatment Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Create Treatment Plan</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label>Patient *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                    <option value="">Select patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id_number})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Treatment Type *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fType} onChange={e => setFType(e.target.value)}>
                                    <option value="">Select type</option>
                                    {TREATMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Tooth Number</Label>
                                    <Input type="number" placeholder="e.g., 14" min={1} max={32} value={fTooth} onChange={e => setFTooth(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Estimated Cost (₹)</Label>
                                    <Input type="number" placeholder="e.g., 5000" value={fEstCost} onChange={e => setFEstCost(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Planned Date</Label>
                                <Input type="date" value={fPlannedDate} onChange={e => setFPlannedDate(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Textarea placeholder="Treatment details..." rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Notes</Label>
                                <Input placeholder="Additional notes..." value={fNotes} onChange={e => setFNotes(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createTreatment.isPending}>
                                {createTreatment.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{treatments.length}</p>
                        <p className="text-xs text-muted-foreground">Total Plans</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{planned}</p>
                        <p className="text-xs text-muted-foreground">Planned</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">{inProgress}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            <p className="text-2xl font-bold">{(totalEstimated / 1000).toFixed(0)}k</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Est. Revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Input placeholder="Search by patient or treatment type..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'planned', 'in_progress', 'completed', 'cancelled'].map((s) => (
                                <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="capitalize text-xs">
                                    {s === 'all' ? 'All' : s.replace('_', ' ')}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">{filtered.length} treatment plan{filtered.length !== 1 ? 's' : ''}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Treatment</TableHead>
                                    <TableHead>Tooth</TableHead>
                                    <TableHead>Est. Cost</TableHead>
                                    <TableHead>Planned Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No treatment plans found.</TableCell></TableRow>
                                ) : filtered.map((t: any) => {
                                    const config = STATUS_CONFIG[t.status] || STATUS_CONFIG.planned
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.patients?.full_name || '—'}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{t.treatment_type}</p>
                                                    {t.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.description}</p>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{t.tooth_number || '—'}</TableCell>
                                            <TableCell>{t.estimated_cost ? formatCurrency(t.estimated_cost) : '—'}</TableCell>
                                            <TableCell className="text-sm">{t.planned_date ? formatDate(t.planned_date) : '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={`${config.color} text-xs`}>{config.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {t.status === 'planned' && (
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600" onClick={() => handleStatusChange(t.id, 'in_progress')}>
                                                            Start
                                                        </Button>
                                                    )}
                                                    {t.status === 'in_progress' && (
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleStatusChange(t.id, 'completed')}>
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {(t.status === 'planned' || t.status === 'in_progress') && (
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleStatusChange(t.id, 'cancelled')}>
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
