'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Download, Eye, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const DEMO_PRESCRIPTIONS = [
    { id: '1', patient: 'Rahul Sharma', doctor: 'Dr. Priya Patel', diagnosis: 'Acute Pulpitis', date: '2026-03-04', medicines: 3 },
    { id: '2', patient: 'Anita Desai', doctor: 'Dr. Amit Kumar', diagnosis: 'Gingivitis', date: '2026-03-03', medicines: 2 },
    { id: '3', patient: 'Vikram Singh', doctor: 'Dr. Priya Patel', diagnosis: 'Dental Caries', date: '2026-03-02', medicines: 4 },
    { id: '4', patient: 'Meera Joshi', doctor: 'Dr. Sunita Rao', diagnosis: 'Periodontitis', date: '2026-03-01', medicines: 5 },
]

export default function PrescriptionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Prescriptions</h1>
                    <p className="text-muted-foreground">Digital prescriptions with PDF generation</p>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> New Prescription
                </Button>
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
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {DEMO_PRESCRIPTIONS.map((rx) => (
                                    <TableRow key={rx.id}>
                                        <TableCell className="font-medium">{rx.patient}</TableCell>
                                        <TableCell className="text-muted-foreground">{rx.doctor}</TableCell>
                                        <TableCell>{rx.diagnosis}</TableCell>
                                        <TableCell><Badge variant="secondary">{rx.medicines} items</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(rx.date)}</TableCell>
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
