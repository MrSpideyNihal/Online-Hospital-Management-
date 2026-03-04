'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, TrendingUp, IndianRupee } from 'lucide-react'

export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Global Analytics</h1><p className="text-muted-foreground">Platform-wide performance metrics</p></div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Hospitals', value: '23', icon: Building2, color: 'text-blue-600' },
                    { title: 'Total Patients', value: '12,450', icon: Users, color: 'text-green-600' },
                    { title: 'Total Revenue', value: '₹28,50,000', icon: IndianRupee, color: 'text-purple-600' },
                    { title: 'Growth Rate', value: '24%', icon: TrendingUp, color: 'text-amber-600' },
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
                            {[{ city: 'Mumbai', count: 6 }, { city: 'Delhi', count: 5 }, { city: 'Bangalore', count: 4 }, { city: 'Chennai', count: 3 }, { city: 'Hyderabad', count: 3 }, { city: 'Pune', count: 2 }].map(c => (
                                <div key={c.city} className="flex items-center justify-between">
                                    <span className="text-sm">{c.city}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / 6) * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-medium w-6 text-right">{c.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Revenue by Plan</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[{ plan: 'Premium', revenue: '₹14,99,700', hospitals: 12 }, { plan: 'Basic', revenue: '₹7,99,600', hospitals: 8 }, { plan: 'Trial', revenue: '₹0', hospitals: 3 }].map(p => (
                                <div key={p.plan} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div><p className="font-medium text-sm">{p.plan}</p><p className="text-xs text-muted-foreground">{p.hospitals} hospitals</p></div>
                                    <span className="font-semibold text-green-600">{p.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
