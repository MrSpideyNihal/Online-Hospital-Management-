'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    Search, MoreHorizontal, CheckCircle, XCircle, Snowflake, Eye, MapPin, Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAllHospitals, useApproveHospital, useRejectHospital, useFreezeHospital } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import Link from 'next/link'

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

    const { data: hospitals, isLoading } = useAllHospitals()
    const approve = useApproveHospital()
    const rejectMut = useRejectHospital()
    const freeze = useFreezeHospital()

    const all = hospitals || []
    const displayStatus = (h: typeof all[0]) => h.is_frozen ? 'frozen' : h.status

    const filtered = all.filter(h => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || (h.city || '').toLowerCase().includes(search.toLowerCase())
        const st = displayStatus(h)
        const matchStatus = filterStatus === 'all' || st === filterStatus
        return matchSearch && matchStatus
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hospital Management</h1>
                <p className="text-muted-foreground">Approve, manage, and monitor all hospitals</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: all.length, color: 'text-foreground' },
                    { label: 'Approved', value: all.filter(h => h.status === 'approved' && !h.is_frozen).length, color: 'text-green-600' },
                    { label: 'Pending', value: all.filter(h => h.status === 'pending').length, color: 'text-amber-600' },
                    { label: 'Frozen', value: all.filter(h => h.is_frozen).length, color: 'text-blue-600' },
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
                                    <TableHead>Subscription Ends</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hospitals found</TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((h) => {
                                    const st = displayStatus(h)
                                    return (
                                    <TableRow key={h.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{h.name}</p>
                                                <p className="text-xs text-muted-foreground">{h.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm"><MapPin className="w-3 h-3" />{h.city || '—'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`text-xs capitalize ${planColors[h.subscription_plan] || ''}`}>{h.subscription_plan}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`text-xs capitalize ${statusColors[st] || ''}`}>{st}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {h.subscription_end ? formatDate(h.subscription_end) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/hospitals/${h.slug}`}>
                                                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Public Page</DropdownMenuItem>
                                                    </Link>
                                                    {h.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem className="text-green-600" onClick={() => approve.mutate(h.id, {
                                                                onSuccess: () => toast.success(`${h.name} approved`),
                                                                onError: (e) => toast.error(e.message),
                                                            })}><CheckCircle className="w-4 h-4 mr-2" /> Approve</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => rejectMut.mutate(h.id, {
                                                                onSuccess: () => toast.success(`${h.name} rejected`),
                                                                onError: (e) => toast.error(e.message),
                                                            })}><XCircle className="w-4 h-4 mr-2" /> Reject</DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {h.status === 'approved' && !h.is_frozen && (
                                                        <DropdownMenuItem className="text-blue-600" onClick={() => freeze.mutate({ hospitalId: h.id, freeze: true }, {
                                                            onSuccess: () => toast.success(`${h.name} frozen`),
                                                            onError: (e) => toast.error(e.message),
                                                        })}><Snowflake className="w-4 h-4 mr-2" /> Freeze</DropdownMenuItem>
                                                    )}
                                                    {h.is_frozen && (
                                                        <DropdownMenuItem className="text-green-600" onClick={() => freeze.mutate({ hospitalId: h.id, freeze: false }, {
                                                            onSuccess: () => toast.success(`${h.name} unfrozen`),
                                                            onError: (e) => toast.error(e.message),
                                                        })}><CheckCircle className="w-4 h-4 mr-2" /> Unfreeze</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
