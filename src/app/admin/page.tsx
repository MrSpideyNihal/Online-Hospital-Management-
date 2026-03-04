'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Building2, Users, IndianRupee, TrendingUp, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of all hospitals and platform metrics</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Hospitals', value: '23', change: '+3 this month', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { title: 'Active Patients', value: '12,450', change: '+850 new', icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                    { title: 'Monthly Revenue', value: '₹2,30,000', change: '+18%', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                    { title: 'Platform Growth', value: '24%', change: 'YoY', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                ].map((stat) => (
                    <Card key={stat.title} className="border-border/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <p className="text-xs text-green-500 mt-1">{stat.change}</p>
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
                        {[
                            { name: 'BrightSmile Dental Clinic', city: 'Hyderabad', date: '2 hours ago' },
                            { name: 'Dr. Mehta\'s Dental Care', city: 'Pune', date: '1 day ago' },
                        ].map((h) => (
                            <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-medium text-sm">{h.name}</p>
                                    <p className="text-xs text-muted-foreground">{h.city} &middot; Applied {h.date}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" className="h-7 text-xs bg-green-600 text-white hover:bg-green-700">Approve</Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive">Reject</Button>
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
                        {[
                            { name: 'SmileCare Dental', plan: 'Premium', expires: '5 days', status: 'warning' },
                            { name: 'DentPro Clinic', plan: 'Basic', expires: '12 days', status: 'info' },
                            { name: 'PearlSmile Dental', plan: 'Premium', expires: '18 days', status: 'info' },
                        ].map((h) => (
                            <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-medium text-sm">{h.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-[10px] mr-1">{h.plan}</Badge>
                                        Expires in {h.expires}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs">Send Reminder</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
