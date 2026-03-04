'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Users, Calendar, ClipboardList, Stethoscope,
    TrendingUp, IndianRupee, Clock, UserPlus,
    ArrowRight, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

const STATS = [
    { title: "Today's Patients", value: '24', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Appointments', value: '18', change: '+8%', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'OPD Visits', value: '32', change: '+15%', icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Total Doctors', value: '8', change: '0%', icon: Stethoscope, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Revenue (Today)', value: '₹45,200', change: '+22%', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Pending Payments', value: '₹12,800', change: '-5%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
]

const RECENT_APPOINTMENTS = [
    { id: 1, patient: 'Rahul Sharma', doctor: 'Dr. Priya Patel', time: '10:00 AM', status: 'confirmed', reason: 'Root Canal' },
    { id: 2, patient: 'Anita Desai', doctor: 'Dr. Amit Kumar', time: '10:30 AM', status: 'waiting', reason: 'Teeth Cleaning' },
    { id: 3, patient: 'Vikram Singh', doctor: 'Dr. Priya Patel', time: '11:00 AM', status: 'in_progress', reason: 'Dental Implant Consultation' },
    { id: 4, patient: 'Meera Joshi', doctor: 'Dr. Sunita Rao', time: '11:30 AM', status: 'scheduled', reason: 'Braces Adjustment' },
    { id: 5, patient: 'Arjun Nair', doctor: 'Dr. Amit Kumar', time: '12:00 PM', status: 'scheduled', reason: 'Cavity Filling' },
]

const QUICK_ACTIONS = [
    { label: 'New Patient', icon: UserPlus, href: '/dashboard/patients?action=new', color: 'from-blue-600 to-cyan-600' },
    { label: 'Book Appointment', icon: Calendar, href: '/dashboard/appointments?action=new', color: 'from-purple-600 to-pink-600' },
    { label: 'Quick Check-in', icon: ClipboardList, href: '/dashboard/visits?action=checkin', color: 'from-green-600 to-emerald-600' },
    { label: 'View Reports', icon: TrendingUp, href: '/dashboard/reports', color: 'from-amber-600 to-orange-600' },
]

const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scheduled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Good Morning! 👋</h1>
                    <p className="text-muted-foreground">Here&apos;s what&apos;s happening at your hospital today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action) => (
                    <Link key={action.label} href={action.href}>
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50 overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {STATS.map((stat) => (
                    <Card key={stat.title} className="border-border/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                                <ArrowUpRight className={`w-3.5 h-3.5 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-muted-foreground">vs last week</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Today's Appointments & Activity */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Appointments */}
                <Card className="lg:col-span-3 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold">Today&apos;s Appointments</CardTitle>
                        <Link href="/dashboard/appointments">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {RECENT_APPOINTMENTS.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-primary">
                                                {apt.patient.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{apt.patient}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {apt.doctor} &middot; {apt.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs text-muted-foreground hidden sm:inline">{apt.time}</span>
                                        <Badge variant="secondary" className={`text-[10px] px-2 ${statusColors[apt.status]}`}>
                                            {apt.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* OPD Queue */}
                <Card className="lg:col-span-2 border-border/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">Current OPD Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { num: 1, name: 'Anita Desai', status: 'In Progress', statusColor: 'text-blue-600' },
                                { num: 2, name: 'Vikram Singh', status: 'Waiting', statusColor: 'text-amber-600' },
                                { num: 3, name: 'Meera Joshi', status: 'Waiting', statusColor: 'text-amber-600' },
                                { num: 4, name: 'Arjun Nair', status: 'Waiting', statusColor: 'text-amber-600' },
                            ].map((item) => (
                                <div key={item.num} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.num === 1 ? 'bg-primary text-white' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                                        {item.num}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className={`text-xs ${item.statusColor}`}>{item.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/dashboard/visits">
                            <Button variant="outline" className="w-full mt-4" size="sm">
                                Manage Queue <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
