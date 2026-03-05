/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useInvoices, useCreateInvoice, useUpdateInvoice, usePatients } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import type { InvoiceItem } from '@/types/database'

const paymentStatusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function BillingPage() {
    const { hospitalId } = useAuth()
    const { data: invoices = [], isLoading, isError } = useInvoices(hospitalId)
    const { data: patients = [] } = usePatients(hospitalId)
    const createInvoice = useCreateInvoice()
    const updateInvoice = useUpdateInvoice()

    const handlePaymentStatusChange = (id: string, payment_status: string) => {
        updateInvoice.mutate({ id, payment_status } as any, {
            onSuccess: () => toast.success(`Invoice marked as ${payment_status}`),
            onError: (e: Error) => toast.error(e.message),
        })
    }

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [fPatient, setFPatient] = useState('')
    const [fDiscount, setFDiscount] = useState('0')
    const [fTax, setFTax] = useState('0')
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unit_price: 0, total: 0 }])

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
        setFPatient(''); setFDiscount('0'); setFTax('0')
        setItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }])
    }

    const handleCreate = () => {
        if (!hospitalId || !fPatient) { toast.error('Patient is required'); return }
        const validItems = items.filter(i => i.description.trim())
        if (validItems.length === 0) { toast.error('Add at least one item'); return }
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
        }, {
            onSuccess: () => { toast.success('Invoice created'); setIsAddOpen(false); resetForm() },
            onError: (e) => toast.error(e.message),
        })
    }

    const totalRevenue = invoices.filter((i: any) => i.payment_status === 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0)
    const pendingAmount = invoices.filter((i: any) => i.payment_status !== 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0)

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <p className="text-destructive font-medium">Failed to load invoices</p>
                <p className="text-sm text-muted-foreground">Please check your connection and refresh the page.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">Track payments and generate invoices</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label>Patient *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                                    <option value="">Select patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Line Items</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, total: 0 }])}>
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {items.map((item, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_0.5fr_0.6fr_0.6fr_auto] gap-2 items-end">
                                        <div className="space-y-1"><Label className="text-xs">Description</Label><Input placeholder="Root Canal" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Qty</Label><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Unit Price</Label><Input type="number" min={0} value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Math.max(0, parseFloat(e.target.value) || 0))} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Total</Label><Input readOnly value={`₹${item.total}`} className="bg-muted" /></div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} disabled={items.length <= 1}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1"><Label className="text-xs">Tax (₹)</Label><Input type="number" min={0} value={fTax} onChange={e => setFTax(e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Discount (₹)</Label><Input type="number" min={0} value={fDiscount} onChange={e => setFDiscount(e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Grand Total</Label><Input readOnly value={`₹${grandTotal}`} className="bg-muted font-bold" /></div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={handleCreate} disabled={createInvoice.isPending}>
                                {createInvoice.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Create Invoice'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-3xl font-bold mt-1 text-green-600">{formatCurrency(totalRevenue)}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Payments</p><p className="text-3xl font-bold mt-1 text-amber-600">{formatCurrency(pendingAmount)}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Invoices</p><p className="text-3xl font-bold mt-1">{invoices.length}</p></CardContent></Card>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No invoices found.</TableCell></TableRow>
                                ) : invoices.map((inv: any) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                        <TableCell className="font-medium">{inv.patients?.full_name || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(inv.created_at)}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(inv.total)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Badge variant="secondary" className={`text-xs capitalize cursor-pointer hover:opacity-80 ${paymentStatusColors[inv.payment_status] || ''}`}>{inv.payment_status}</Badge>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {['pending', 'partial', 'paid'].filter(s => s !== inv.payment_status).map(s => (
                                                        <DropdownMenuItem key={s} onClick={() => handlePaymentStatusChange(inv.id, s)}>
                                                            {s === 'paid' ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : s === 'partial' ? <AlertCircle className="w-4 h-4 mr-2 text-blue-600" /> : <Clock className="w-4 h-4 mr-2 text-amber-600" />}
                                                            <span className="capitalize">{s}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
