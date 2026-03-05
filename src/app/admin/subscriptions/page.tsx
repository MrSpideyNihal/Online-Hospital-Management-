'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Send, Loader2 } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAllHospitals } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

export default function SubscriptionsPage() {
    const { data: hospitals, isLoading, isError } = useAllHospitals()

    const all = hospitals || []
    const now = Date.now()

    const subsData = all
        .filter(h => h.status === 'approved' || h.is_frozen)
        .map(h => {
            const endDate = h.subscription_end ? new Date(h.subscription_end).getTime() : 0
            const daysLeft = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0
            let subStatus: 'active' | 'expiring_soon' | 'expired' = 'active'
            if (endDate && endDate < now) subStatus = 'expired'
            else if (daysLeft > 0 && daysLeft <= 30) subStatus = 'expiring_soon'
            return { ...h, subStatus, daysLeft }
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)

    const activeCount = subsData.filter(s => s.subStatus === 'active').length
    const pendingRenewals = subsData.filter(s => s.subStatus === 'expiring_soon' || s.subStatus === 'expired').length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-destructive">Failed to load subscriptions.</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div>
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Subscriptions</h1><p className="text-muted-foreground">Manage hospital subscriptions and payments</p></div>

            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Hospitals</p><p className="text-3xl font-bold mt-1">{subsData.length}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Active Subscriptions</p><p className="text-3xl font-bold mt-1">{activeCount}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Renewals</p><p className="text-3xl font-bold text-amber-600 mt-1">{pendingRenewals}</p></CardContent></Card>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">All Subscriptions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {subsData.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No subscriptions</p>
                    )}
                    {subsData.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{sub.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-[10px] mr-1 capitalize">{sub.subscription_plan}</Badge>
                                        {sub.subscription_end ? `Paid until ${formatDate(sub.subscription_end)}` : 'No end date'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`text-xs ${sub.subStatus === 'active' ? 'bg-green-100 text-green-700' : sub.subStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {sub.subStatus.replace('_', ' ')}
                                </Badge>
                                <Button size="sm" variant="outline" className="h-7 text-xs" disabled><Send className="w-3 h-3 mr-1" />Remind (Soon)</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
