'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, MoreHorizontal, CheckCircle, XCircle, Snowflake, Eye, MapPin,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface HospitalEntry {
    id: string; name: string; city: string; email: string; status: string;
    plan: string; subscription_end: string; created_at: string; total_patients: number;
}

const DEMO: HospitalEntry[] = [
    { id: '1', name: 'SmileCare Dental Hospital', city: 'Mumbai', email: 'info@smilecare.com', status: 'approved', plan: 'premium', subscription_end: '2026-06-15', created_at: '2025-01-10', total_patients: 450 },
    { id: '2', name: 'DentPro Clinic', city: 'Delhi', email: 'admin@dentpro.com', status: 'approved', plan: 'basic', subscription_end: '2026-04-20', created_at: '2025-03-15', total_patients: 230 },
    { id: '3', name: 'PearlSmile Dental', city: 'Bangalore', email: 'hello@pearlsmile.com', status: 'approved', plan: 'premium', subscription_end: '2026-05-10', created_at: '2025-02-01', total_patients: 380 },
    { id: '4', name: 'BrightSmile Dental Clinic', city: 'Hyderabad', email: 'bright@dental.com', status: 'pending', plan: 'trial', subscription_end: '', created_at: '2026-03-04', total_patients: 0 },
    { id: '5', name: 'Dr. Mehta\'s Dental Care', city: 'Pune', email: 'mehta@dental.com', status: 'pending', plan: 'trial', subscription_end: '', created_at: '2026-03-03', total_patients: 0 },
    { id: '6', name: 'City Dental Hub', city: 'Chennai', email: 'city@dental.com', status: 'frozen', plan: 'basic', subscription_end: '2026-01-15', created_at: '2025-05-20', total_patients: 120 },
]

const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    frozen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const planColors: Record<string, string> = {
    trial: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function AdminHospitalsPage() {
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const filtered = DEMO.filter(h => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || h.status === filterStatus
        return matchSearch && matchStatus
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hospital Management</h1>
                <p className="text-muted-foreground">Approve, manage, and monitor all hospitals</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: DEMO.length, color: 'text-foreground' },
                    { label: 'Approved', value: DEMO.filter(h => h.status === 'approved').length, color: 'text-green-600' },
                    { label: 'Pending', value: DEMO.filter(h => h.status === 'pending').length, color: 'text-amber-600' },
                    { label: 'Frozen', value: DEMO.filter(h => h.status === 'frozen').length, color: 'text-blue-600' },
                ].map(s => (
                    <Card key={s.label} className="border-border/50">
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search hospitals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'approved', 'pending', 'frozen', 'rejected'].map(s => (
                                <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)} className="capitalize text-xs">
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hospital</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Patients</TableHead>
                                    <TableHead>Subscription Ends</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{h.name}</p>
                                                <p className="text-xs text-muted-foreground">{h.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm"><MapPin className="w-3 h-3" />{h.city}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`text-xs capitalize ${planColors[h.plan]}`}>{h.plan}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`text-xs capitalize ${statusColors[h.status]}`}>{h.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{h.total_patients.toLocaleString()}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {h.subscription_end ? formatDate(h.subscription_end) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                                                    {h.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem className="text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Approve</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive"><XCircle className="w-4 h-4 mr-2" /> Reject</DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {h.status === 'approved' && (
                                                        <DropdownMenuItem className="text-blue-600"><Snowflake className="w-4 h-4 mr-2" /> Freeze</DropdownMenuItem>
                                                    )}
                                                    {h.status === 'frozen' && (
                                                        <DropdownMenuItem className="text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Unfreeze</DropdownMenuItem>
                                                    )}
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
