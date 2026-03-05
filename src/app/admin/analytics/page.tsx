'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, TrendingUp, Loader2 } from 'lucide-react'
import { useAllHospitals } from '@/lib/supabase/hooks'

export default function AdminAnalyticsPage() {
    const { data: hospitals, isLoading, isError } = useAllHospitals()

    const all = hospitals || []
    const approved = all.filter(h => h.status === 'approved')
    const pending = all.filter(h => h.status === 'pending')

    // Group by city
    const cityMap = new Map<string, number>()
    all.forEach(h => {
        const city = h.city || 'Unknown'
        cityMap.set(city, (cityMap.get(city) || 0) + 1)
    })
    const cityData = Array.from(cityMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    const maxCityCount = cityData[0]?.[1] || 1

    // Group by plan
    const planMap = new Map<string, number>()
    all.forEach(h => {
        const plan = h.subscription_plan || 'trial'
        planMap.set(plan, (planMap.get(plan) || 0) + 1)
    })
    const planData = Array.from(planMap.entries()).sort((a, b) => b[1] - a[1])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-destructive">Failed to load analytics.</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div>
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Global Analytics</h1><p className="text-muted-foreground">Platform-wide performance metrics</p></div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Hospitals', value: all.length, icon: Building2, color: 'text-blue-600' },
                    { title: 'Approved', value: approved.length, icon: Users, color: 'text-green-600' },
                    { title: 'Pending', value: pending.length, icon: TrendingUp, color: 'text-amber-600' },
                    { title: 'Premium Plans', value: all.filter(h => h.subscription_plan === 'premium').length, icon: TrendingUp, color: 'text-purple-600' },
                ].map(s => (
                    <Card key={s.title} className="border-border/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm text-muted-foreground">{s.title}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Hospitals by City</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {cityData.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
                            {cityData.map(([city, count]) => (
                                <div key={city} className="flex items-center justify-between">
                                    <span className="text-sm">{city}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxCityCount) * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Hospitals by Plan</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {planData.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
                            {planData.map(([plan, count]) => (
                                <div key={plan} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div><p className="font-medium text-sm capitalize">{plan}</p><p className="text-xs text-muted-foreground">{count} hospitals</p></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
