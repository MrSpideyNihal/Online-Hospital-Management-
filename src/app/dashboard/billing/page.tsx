/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
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
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, Trash2, CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useInvoices, useCreateInvoice, useUpdateInvoice, usePatients, useHospitalServices } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { InvoiceItem } from '@/types/database'

const paymentStatusMeta: Record<string, { label: string, className: string }> = {
    paid: {
        label: 'Settled',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    pending: {
        label: 'Awaiting Payment',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    partial: {
        label: 'Partially Settled',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
}

type DentalProcedureTemplate = {
    label: string
    description: string
    sessions: number
    fee: number
}

const defaultDentalProcedureTemplates: DentalProcedureTemplate[] = [
    { label: 'Consultation', description: 'Dental Consultation', sessions: 1, fee: 500 },
    { label: 'Scaling', description: 'Scaling and Polishing', sessions: 1, fee: 1800 },
    { label: 'Root Canal', description: 'Root Canal Treatment (Tooth #)', sessions: 1, fee: 5500 },
    { label: 'Extraction', description: 'Tooth Extraction (Tooth #)', sessions: 1, fee: 2200 },
    { label: 'Crown', description: 'Dental Crown Placement (Tooth #)', sessions: 1, fee: 7000 },
    { label: 'X-Ray', description: 'Intraoral X-Ray / OPG', sessions: 1, fee: 900 },
]

const createBlankItem = (): InvoiceItem => ({ description: '', quantity: 1, unit_price: 0, total: 0 })

const toINRCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

const escapeHtml = (value: unknown) => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

const safeInvoiceItems = (rawItems: unknown): InvoiceItem[] => {
    if (!Array.isArray(rawItems)) return []

    return rawItems
        .map((item) => {
            if (!item || typeof item !== 'object') return null
            const row = item as Record<string, unknown>

            return {
                description: String(row.description || '').trim(),
                quantity: Math.max(1, Number(row.quantity) || 1),
                unit_price: Math.max(0, Number(row.unit_price) || 0),
                total: Math.max(0, Number(row.total) || (Number(row.quantity) || 1) * (Number(row.unit_price) || 0)),
            }
        })
        .filter((item): item is InvoiceItem => !!item && !!item.description)
}

const isBlankItem = (item: InvoiceItem) => {
    return !item.description.trim() && Number(item.quantity) === 1 && Number(item.unit_price) === 0
}

export default function BillingPage() {
    const { hospitalId, hospital } = useAuth()
    const { data: invoices = [], isLoading, isError } = useInvoices(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const { data: procedureServices = [] } = useHospitalServices(hospitalId)
    const createInvoice = useCreateInvoice()
    const updateInvoice = useUpdateInvoice()

    const procedureTemplates = useMemo<DentalProcedureTemplate[]>(() => {
        if (procedureServices.length === 0) return defaultDentalProcedureTemplates

        return procedureServices
            .map((service) => {
                const fee = Number(service.price) || 0
                return {
                    label: service.service_name,
                    description: service.description?.trim() || service.service_name,
                    sessions: 1,
                    fee,
                }
            })
            .filter((template) => template.label.trim())
    }, [procedureServices])

    const handlePaymentStatusChange = (id: string, payment_status: string) => {
        updateInvoice.mutate({ id, payment_status } as any, {
            onSuccess: () => toast.success(`Bill marked as ${paymentStatusMeta[payment_status]?.label || payment_status}`),
            onError: (e: Error) => toast.error(e.message),
        })
    }

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDiscount, setFDiscount] = useState('0')
    const [fTax, setFTax] = useState('0')
    const [fNotes, setFNotes] = useState('')
    const [items, setItems] = useState<InvoiceItem[]>([createBlankItem()])

    const addProcedureTemplate = (template: DentalProcedureTemplate) => {
        const templatedItem: InvoiceItem = {
            description: template.description,
            quantity: template.sessions,
            unit_price: template.fee,
            total: template.sessions * template.fee,
        }

        setItems(prev => {
            if (prev.length === 1 && isBlankItem(prev[0])) {
                return [templatedItem]
            }
            return [...prev, templatedItem]
        })
    }

    const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
        setItems(prev => prev.map((item, idx) => {
            if (idx !== i) return item
            const updated = { ...item, [field]: value }
            if (field === 'quantity' || field === 'unit_price') {
                updated.total = Number(updated.quantity) * Number(updated.unit_price)
            }
            return updated
        }))
    }

    const subtotal = items.reduce((s, i) => s + (i.total || 0), 0)
    const tax = Number(fTax) || 0
    const discount = Number(fDiscount) || 0
    const grandTotal = subtotal + tax - discount

    const resetForm = () => {
        setFPatient('')
        setFDiscount('0')
        setFTax('0')
        setFNotes('')
        setItems([createBlankItem()])
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient) { toast.error('Patient is required'); return }
        const validItems = items.filter(i => i.description.trim())
        if (validItems.length === 0) { toast.error('Add at least one treatment item'); return }
        // Validate no negative amounts
        const hasInvalid = validItems.some(i => Number(i.quantity) < 1 || Number(i.unit_price) < 0)
        if (hasInvalid) { toast.error('Quantities must be at least 1 and prices cannot be negative'); return }
        if (discount > subtotal) { toast.error('Discount cannot exceed subtotal'); return }
        if (tax < 0) { toast.error('Tax cannot be negative'); return }
        createInvoice.mutate({
            hospital_id: hospitalId,
            patient_id: fPatient,
            items: validItems,
            subtotal,
            tax,
            discount,
            total: grandTotal,
            payment_status: 'pending',
            notes: fNotes.trim() || null,
        }, {
            onSuccess: () => { toast.success('Treatment bill created'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const totalRevenue = invoices.filter((i: any) => i.payment_status === 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0)
    const pendingAmount = invoices.filter((i: any) => i.payment_status !== 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0)
    const openInvoices = invoices.filter((i: any) => i.payment_status !== 'paid').length

    const getTreatmentPreview = (invoiceItems: unknown) => {
        const safeItems = safeInvoiceItems(invoiceItems)

        if (safeItems.length === 0) {
            return { primary: 'No treatment items added', extraCount: 0 }
        }

        return {
            primary: safeItems[0].description,
            extraCount: Math.max(0, safeItems.length - 1),
        }
    }

        const openBillPrintPreview = (invoice: any) => {
                if (typeof window === 'undefined') return

                const popup = window.open('', '_blank', 'noopener,noreferrer,width=920,height=1100')
                if (!popup) {
                        toast.error('Popup blocked. Please allow popups to print or save PDF bills.')
                        return
                }

                const billItems = safeInvoiceItems(invoice.items)
                const rowsHtml = billItems.length > 0
                        ? billItems.map((item, idx) => `
                                <tr>
                                        <td>${idx + 1}</td>
                                        <td>${escapeHtml(item.description)}</td>
                                        <td>${item.quantity}</td>
                                        <td>${toINRCurrency(item.unit_price)}</td>
                                        <td>${toINRCurrency(item.total)}</td>
                                </tr>
                        `).join('')
                        : '<tr><td colspan="5" style="text-align:center;color:#6b7280;">No treatment items available.</td></tr>'

                const issuedDate = formatDate(invoice.created_at)
                const hospitalName = hospital?.name || 'Dental Clinic'
                const hospitalAddress = [hospital?.address, hospital?.city, hospital?.state, hospital?.pincode].filter(Boolean).join(', ')
                const paymentLabel = paymentStatusMeta[invoice.payment_status]?.label || String(invoice.payment_status || 'Pending')
                const patientName = invoice.patients?.full_name || 'Patient'
                const patientPhone = invoice.patients?.phone ? `+91 ${invoice.patients.phone}` : ''

                const printHtml = `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Bill ${escapeHtml(invoice.invoice_number)}</title>
    <style>
        :root { color-scheme: light; }
        body { font-family: "Segoe UI", Tahoma, sans-serif; margin: 0; background: #f3f4f6; color: #111827; }
        .sheet { max-width: 820px; margin: 20px auto; background: #fff; border: 1px solid #e5e7eb; }
        .header { padding: 28px 30px 16px; border-bottom: 1px solid #e5e7eb; }
        .tag { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #ecfeff; color: #0e7490; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        h1 { margin: 10px 0 6px; font-size: 28px; }
        .subtitle { margin: 0; color: #4b5563; font-size: 14px; }
        .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 18px 30px; }
        .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
        .value { font-size: 14px; font-weight: 600; white-space: pre-wrap; }
        table { width: calc(100% - 60px); margin: 8px 30px 0; border-collapse: collapse; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; font-size: 13px; vertical-align: top; }
        th { background: #f9fafb; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: .03em; }
        .totals { margin: 14px 30px 0 auto; width: 320px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
        .row { display: flex; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .row:last-child { border-bottom: none; font-weight: 700; font-size: 15px; background: #ecfeff; }
        .notes { margin: 14px 30px 0; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #fffbeb; }
        .footer { margin: 16px 30px 26px; color: #6b7280; font-size: 12px; }
        .actions { max-width: 820px; margin: 18px auto 0; display: flex; gap: 10px; }
        .btn { border: 1px solid #d1d5db; background: #fff; color: #111827; font-size: 13px; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .btn.primary { border-color: #0ea5e9; background: #0ea5e9; color: #fff; }
        @media print {
            body { background: #fff; }
            .actions { display: none !important; }
            .sheet { margin: 0; border: none; }
            @page { size: A4; margin: 10mm; }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button class="btn primary" onclick="window.print()">Print / Save as PDF</button>
        <button class="btn" onclick="window.close()">Close</button>
    </div>
    <main class="sheet">
        <section class="header">
            <span class="tag">Dental Treatment Bill</span>
            <h1>${escapeHtml(hospitalName)}</h1>
            <p class="subtitle">Patient-friendly summary of completed or planned dental procedures.</p>
        </section>
        <section class="meta">
            <div class="box">
                <div class="label">Clinic Details</div>
                <div class="value">${escapeHtml(hospitalName)}\n${escapeHtml(hospitalAddress || 'Address not available')}\n${escapeHtml(hospital?.phone || '')}\n${escapeHtml(hospital?.email || '')}</div>
            </div>
            <div class="box">
                <div class="label">Bill Details</div>
                <div class="value">Bill No: ${escapeHtml(invoice.invoice_number)}\nIssued On: ${escapeHtml(issuedDate)}\nPayment: ${escapeHtml(paymentLabel)}</div>
            </div>
            <div class="box">
                <div class="label">Patient</div>
                <div class="value">${escapeHtml(patientName)}\n${escapeHtml(patientPhone)}</div>
            </div>
            <div class="box">
                <div class="label">Billing Summary</div>
                <div class="value">Subtotal: ${toINRCurrency(invoice.subtotal)}\nTax: ${toINRCurrency(invoice.tax)}\nDiscount: ${toINRCurrency(invoice.discount)}</div>
            </div>
        </section>

        <table>
            <thead>
                <tr>
                    <th style="width:42px;">#</th>
                    <th>Treatment / Procedure</th>
                    <th style="width:88px;">Sessions</th>
                    <th style="width:120px;">Fee</th>
                    <th style="width:120px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <section class="totals">
            <div class="row"><span>Subtotal</span><span>${toINRCurrency(invoice.subtotal)}</span></div>
            <div class="row"><span>Tax</span><span>${toINRCurrency(invoice.tax)}</span></div>
            <div class="row"><span>Discount</span><span>- ${toINRCurrency(invoice.discount)}</span></div>
            <div class="row"><span>Total Due</span><span>${toINRCurrency(invoice.total)}</span></div>
        </section>

        ${invoice.notes ? `<section class="notes"><strong>Notes:</strong><div style="margin-top:6px; font-size:13px;">${escapeHtml(invoice.notes)}</div></section>` : ''}
        <section class="footer">Thank you for choosing ${escapeHtml(hospitalName)}. Keep this bill for records and insurance claims. You can use the print dialog destination "Save as PDF" for a digital copy.</section>
    </main>
</body>
</html>`

                popup.document.open()
                popup.document.write(printHtml)
                popup.document.close()
        }

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <p className="text-destructive font-medium">Failed to load treatment bills</p>
                <p className="text-sm text-muted-foreground">Please check your connection and refresh the page.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Dental Billing Desk</p>
                    <h1 className="text-2xl font-bold">Treatment Billing</h1>
                    <p className="text-muted-foreground">Create patient treatment bills, track dues, and settle procedure payments</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> New Treatment Bill
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Create Treatment Invoice</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label>Patient *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                    <option value="">Select patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                </select>
                                {patients.length === 0 && (
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        No patients found yet. Add a patient profile first, then create a treatment bill.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Common Dental Procedures</Label>
                                <div className="flex flex-wrap gap-2">
                                    {procedureTemplates.map(template => (
                                        <Button
                                            key={template.label}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addProcedureTemplate(template)}
                                        >
                                            {template.label} ({formatCurrency(template.fee)})
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Procedure presets are clinic-specific. Customize names and fees in Settings {'>'} Procedure Presets.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Treatment Items</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setItems(prev => [...prev, createBlankItem()])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Custom Item
                                    </Button>
                                </div>
                                {items.map((item, i) => (
                                    <div key={i} className="rounded-md border border-border/60 p-3 grid gap-2 md:grid-cols-[1.35fr_0.55fr_0.8fr_0.8fr_auto] md:items-end">
                                        <div className="space-y-1"><Label className="text-xs">Procedure / Note</Label><Input placeholder="e.g., RCT - Tooth 46 (Session 1)" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Sessions</Label><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Fee / Session</Label><Input type="number" min={0} value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Math.max(0, parseFloat(e.target.value) || 0))} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Total</Label><Input readOnly value={formatCurrency(item.total)} className="bg-muted" /></div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} disabled={items.length <= 1}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1"><Label className="text-xs">Tax (₹)</Label><Input type="number" min={0} value={fTax} onChange={e => setFTax(e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Discount (₹)</Label><Input type="number" min={0} value={fDiscount} onChange={e => setFDiscount(e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Grand Total</Label><Input readOnly value={formatCurrency(grandTotal)} className="bg-muted font-bold" /></div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Treatment Notes (optional)</Label>
                                <Textarea
                                    value={fNotes}
                                    onChange={e => setFNotes(e.target.value)}
                                    placeholder="e.g., Includes temporary filling and 7-day review follow-up"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createInvoice.isPending}>
                                {createInvoice.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Create Bill'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Collected From Treatments</p><p className="text-3xl font-bold mt-1 text-green-600">{formatCurrency(totalRevenue)}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Outstanding Dues</p><p className="text-3xl font-bold mt-1 text-amber-600">{formatCurrency(pendingAmount)}</p><p className="text-xs text-muted-foreground mt-1">{openInvoices} open bills</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Treatment Bills</p><p className="text-3xl font-bold mt-1">{invoices.length}</p></CardContent></Card>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Treatment Bills</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Treatments</TableHead>
                                    <TableHead>Billed On</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Print</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No treatment bills found.</TableCell></TableRow>
                                ) : invoices.map((inv: any) => {
                                    const preview = getTreatmentPreview(inv.items)

                                    return (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                            <TableCell className="font-medium">{inv.patients?.full_name || '—'}</TableCell>
                                            <TableCell className="max-w-[270px]">
                                                <p className="truncate font-medium">{preview.primary}</p>
                                                {preview.extraCount > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        +{preview.extraCount} more item(s)
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(inv.created_at)}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(inv.total)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-xs cursor-pointer hover:opacity-80 ${paymentStatusMeta[inv.payment_status]?.className || ''}`}
                                                        >
                                                            {paymentStatusMeta[inv.payment_status]?.label || inv.payment_status}
                                                        </Badge>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {['pending', 'partial', 'paid'].filter(s => s !== inv.payment_status).map(s => (
                                                            <DropdownMenuItem key={s} onClick={() => handlePaymentStatusChange(inv.id, s)}>
                                                                {s === 'paid' ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : s === 'partial' ? <AlertCircle className="w-4 h-4 mr-2 text-blue-600" /> : <Clock className="w-4 h-4 mr-2 text-amber-600" />}
                                                                <span>{paymentStatusMeta[s]?.label || s}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => openBillPrintPreview(inv)}>
                                                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                                                    Print
                                                </Button>
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
