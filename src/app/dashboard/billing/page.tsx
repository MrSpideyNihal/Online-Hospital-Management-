'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download, Eye } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

const DEMO_INVOICES = [
    { id: '1', invoice_number: 'INV-202603-0001', patient: 'Rahul Sharma', date: '2026-03-04', items: [{ desc: 'Root Canal Treatment', amount: 4500 }, { desc: 'X-Ray', amount: 500 }, { desc: 'Medication', amount: 500 }], total: 5500, status: 'paid' },
    { id: '2', invoice_number: 'INV-202603-0002', patient: 'Anita Desai', date: '2026-03-03', items: [{ desc: 'Teeth Cleaning', amount: 1200 }], total: 1200, status: 'pending' },
    { id: '3', invoice_number: 'INV-202603-0003', patient: 'Vikram Singh', date: '2026-03-02', items: [{ desc: 'Dental Implant', amount: 22000 }, { desc: 'Consultation', amount: 800 }, { desc: 'X-Ray & CT Scan', amount: 2200 }], total: 25000, status: 'partial' },
    { id: '4', invoice_number: 'INV-202602-0015', patient: 'Meera Joshi', date: '2026-02-28', items: [{ desc: 'Braces Adjustment', amount: 3500 }], total: 3500, status: 'paid' },
]

const paymentStatusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function BillingPage() {
    const totalRevenue = DEMO_INVOICES.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
    const pendingAmount = DEMO_INVOICES.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">Track payments and generate invoices</p>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
                </Button>
            </div>

            {/* Revenue Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Total Revenue (Month)</p>
                        <p className="text-3xl font-bold mt-1 text-green-600">{formatCurrency(totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Pending Payments</p>
                        <p className="text-3xl font-bold mt-1 text-amber-600">{formatCurrency(pendingAmount)}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Total Invoices</p>
                        <p className="text-3xl font-bold mt-1">{DEMO_INVOICES.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Table */}
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
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {DEMO_INVOICES.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                        <TableCell className="font-medium">{inv.patient}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(inv.date)}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(inv.total)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`text-xs capitalize ${paymentStatusColors[inv.status]}`}>{inv.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                                            </div>
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
