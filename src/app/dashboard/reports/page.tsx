'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, Users, Calendar, IndianRupee } from 'lucide-react'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Insights on your hospital performance</p>
                </div>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Export Report</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Patients', value: '1,247', change: '+18%', icon: Users, color: 'text-blue-600' },
                    { title: 'Appointments (Month)', value: '342', change: '+12%', icon: Calendar, color: 'text-purple-600' },
                    { title: 'Revenue (Month)', value: '₹4,85,000', change: '+22%', icon: IndianRupee, color: 'text-green-600' },
                    { title: 'Growth Rate', value: '15.3%', change: '+3%', icon: TrendingUp, color: 'text-amber-600' },
                ].map((stat) => (
                    <Card key={stat.title} className="border-border/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <p className="text-xs text-green-500 mt-1">{stat.change} vs last month</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                            <div className="text-center text-muted-foreground">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Revenue Chart</p>
                                <p className="text-xs">Connect Supabase to see live data with Recharts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Appointments by Service</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                            <div className="text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Service Distribution</p>
                                <p className="text-xs">Connect Supabase to see live data with Recharts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Services */}
            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Top Services (This Month)</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { name: 'Root Canal Treatment', count: 45, revenue: 202500, percent: 90 },
                            { name: 'Dental Implants', count: 12, revenue: 300000, percent: 55 },
                            { name: 'Teeth Cleaning', count: 78, revenue: 93600, percent: 100 },
                            { name: 'Braces (Orthodontics)', count: 8, revenue: 280000, percent: 35 },
                            { name: 'Cavity Filling', count: 34, revenue: 68000, percent: 70 },
                        ].map((service) => (
                            <div key={service.name} className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium truncate">{service.name}</span>
                                        <span className="text-xs text-muted-foreground">{service.count} cases</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${service.percent}%` }} />
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-green-600 w-24 text-right">₹{(service.revenue / 1000).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
