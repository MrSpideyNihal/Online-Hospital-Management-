'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Send, IndianRupee } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

const SUBSCRIPTIONS = [
    { hospital: 'SmileCare Dental', plan: 'Premium', amount: 4999, status: 'active', paid_until: '2026-06-15', last_payment: '2026-03-01' },
    { hospital: 'DentPro Clinic', plan: 'Basic', amount: 1999, status: 'active', paid_until: '2026-04-20', last_payment: '2026-01-20' },
    { hospital: 'PearlSmile Dental', plan: 'Premium', amount: 4999, status: 'expiring_soon', paid_until: '2026-03-15', last_payment: '2025-12-15' },
    { hospital: 'City Dental Hub', plan: 'Basic', amount: 1999, status: 'expired', paid_until: '2026-01-15', last_payment: '2025-10-15' },
]

export default function SubscriptionsPage() {
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Subscriptions</h1><p className="text-muted-foreground">Manage hospital subscriptions and payments</p></div>

            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Monthly Revenue</p><p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(18995)}</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Active Subscriptions</p><p className="text-3xl font-bold mt-1">3</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Renewals</p><p className="text-3xl font-bold text-amber-600 mt-1">2</p></CardContent></Card>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">All Subscriptions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {SUBSCRIPTIONS.map((sub) => (
                        <div key={sub.hospital} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{sub.hospital}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-[10px] mr-1">{sub.plan}</Badge>
                                        {formatCurrency(sub.amount)}/mo &middot; Paid until {formatDate(sub.paid_until)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`text-xs ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'expiring_soon' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {sub.status.replace('_', ' ')}
                                </Badge>
                                <Button size="sm" variant="outline" className="h-7 text-xs"><Send className="w-3 h-3 mr-1" />Remind</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs"><IndianRupee className="w-3 h-3 mr-1" />Extend</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
