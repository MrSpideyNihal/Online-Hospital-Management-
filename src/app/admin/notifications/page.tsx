'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, Plus } from 'lucide-react'

const NOTIFICATIONS = [
    { id: '1', title: 'Subscription Reminder', message: 'SmileCare Dental subscription expires in 5 days. Send renewal reminder via UPI.', type: 'payment', date: '2 hours ago' },
    { id: '2', title: 'New Hospital Registration', message: 'BrightSmile Dental Clinic from Hyderabad has applied for registration.', type: 'info', date: '3 hours ago' },
    { id: '3', title: 'Payment Received', message: 'PearlSmile Dental paid ₹4,999 for Premium plan renewal.', type: 'success', date: '1 day ago' },
    { id: '4', title: 'Hospital Frozen', message: 'City Dental Hub has been frozen due to expired subscription.', type: 'warning', date: '3 days ago' },
]

const typeColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700', success: 'bg-green-100 text-green-700',
    payment: 'bg-purple-100 text-purple-700', warning: 'bg-amber-100 text-amber-700',
}

export default function AdminNotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">Send in-app and email notifications to hospitals</p></div>
                <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> Send Notification
                </Button>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type]}`}>
                                <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{n.title}</p>
                                    <Badge variant="secondary" className={`text-[10px] ${typeColors[n.type]}`}>{n.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 text-xs"><Send className="w-3 h-3 mr-1" />Resend</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
