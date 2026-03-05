'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, Users, Calendar, IndianRupee, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useDashboardStats, useAppointments, useInvoices } from '@/lib/supabase/hooks'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308']

export default function ReportsPage() {
    const { hospitalId } = useAuth()
    const { data: stats, isLoading: sLoading } = useDashboardStats(hospitalId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointments = [] } = useAppointments(hospitalId) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invoices = [] } = useInvoices(hospitalId) as any

    // Build service distribution from appointments
    const serviceMap = new Map<string, number>()
    for (const a of appointments) {
        const reason = a.reason || 'General'
        serviceMap.set(reason, (serviceMap.get(reason) || 0) + 1)
    }
    const serviceData = Array.from(serviceMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)

    // Build revenue by month from invoices (last 6 months)
    const monthMap = new Map<string, number>()
    for (const inv of invoices) {
        if (inv.payment_status === 'paid') {
            const d = new Date(inv.created_at)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthMap.set(key, (monthMap.get(key) || 0) + (inv.total || 0))
        }
    }
    const revenueData = Array.from(monthMap.entries()).sort().slice(-6).map(([m, total]) => {
        const [y, mo] = m.split('-')
        return { name: new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-IN', { month: 'short' }), revenue: total }
    })

    if (sLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Insights on your hospital performance</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                    const headers = ['Service', 'Count']
                    const rows = serviceData.map(s => [s.name, String(s.value)])
                    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click()
                    URL.revokeObjectURL(url)
                    toast.success('Report exported')
                }}><Download className="w-4 h-4 mr-1.5" /> Export Report</Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Patients', value: String(stats?.totalPatients ?? 0), icon: Users, color: 'text-blue-600' },
                    { title: 'Appointments (Today)', value: String(stats?.todayAppointments ?? 0), icon: Calendar, color: 'text-purple-600' },
                    { title: 'Revenue (Today)', value: formatCurrency(stats?.todayRevenue ?? 0), icon: IndianRupee, color: 'text-green-600' },
                    { title: 'Today\'s Visits', value: String(stats?.todayVisits ?? 0), icon: TrendingUp, color: 'text-amber-600' },
                ].map((stat) => (
                    <Card key={stat.title} className="border-border/50">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
                    <CardContent>
                        {revenueData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No revenue data yet.</div>
                        ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-base">Appointments by Service</CardTitle></CardHeader>
                    <CardContent>
                        {serviceData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No appointment data yet.</div>
                        ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${(name || '').slice(0, 12)} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                    {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Top Services (All Time)</CardTitle></CardHeader>
                <CardContent>
                    {serviceData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No data yet.</p>
                    ) : (
                    <div className="space-y-3">
                        {serviceData.map((service, i) => {
                            const maxCount = serviceData[0]?.value || 1
                            const percent = Math.round((service.value / maxCount) * 100)
                            return (
                                <div key={service.name} className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium truncate">{service.name}</span>
                                            <span className="text-xs text-muted-foreground">{service.value} cases</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
