'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Building2, Users, ArrowRight, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useAllHospitals, useApproveHospital, useRejectHospital } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

export default function SuperAdminDashboard() {
    const { data: hospitals, isLoading } = useAllHospitals()
    const approve = useApproveHospital()
    const reject = useRejectHospital()

    const pending = (hospitals || []).filter(h => h.status === 'pending')
    const approved = (hospitals || []).filter(h => h.status === 'approved')
    const frozen = (hospitals || []).filter(h => h.status === 'frozen' || h.is_frozen)
    const expiringSoon = (hospitals || []).filter(h => {
        if (!h.subscription_end) return false
        const diff = new Date(h.subscription_end).getTime() - Date.now()
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
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
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of all hospitals and platform metrics</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Hospitals', value: hospitals?.length ?? 0, change: `${approved.length} approved`, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { title: 'Pending Approvals', value: pending.length, change: 'awaiting review', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    { title: 'Frozen Hospitals', value: frozen.length, change: 'currently frozen', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { title: 'Expiring Soon', value: expiringSoon.length, change: 'within 30 days', icon: Building2, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                ].map((stat) => (
                    <Card key={stat.title} className="border-border/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending Approvals */}
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base">Pending Approvals</CardTitle>
                        <Link href="/admin/hospitals"><Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pending.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending approvals</p>
                        )}
                        {pending.slice(0, 5).map((h) => (
                            <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-medium text-sm">{h.name}</p>
                                    <p className="text-xs text-muted-foreground">{h.city || 'Unknown city'} &middot; Registered {new Date(h.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" className="h-7 text-xs bg-green-600 text-white hover:bg-green-700"
                                        disabled={approve.isPending}
                                        onClick={() => approve.mutate(h.id, {
                                            onSuccess: () => toast.success(`${h.name} approved`),
                                            onError: (e) => toast.error(e.message),
                                        })}>Approve</Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive"
                                        disabled={reject.isPending}
                                        onClick={() => reject.mutate(h.id, {
                                            onSuccess: () => toast.success(`${h.name} rejected`),
                                            onError: (e) => toast.error(e.message),
                                        })}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Expiring Subscriptions */}
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base">Expiring Subscriptions</CardTitle>
                        <Link href="/admin/subscriptions"><Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {expiringSoon.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No subscriptions expiring soon</p>
                        )}
                        {expiringSoon.slice(0, 5).map((h) => {
                            const daysLeft = Math.ceil((new Date(h.subscription_end!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                            return (
                                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-medium text-sm">{h.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] mr-1 capitalize">{h.subscription_plan}</Badge>
                                            Expires in {daysLeft} days
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-7 text-xs">Send Reminder</Button>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
