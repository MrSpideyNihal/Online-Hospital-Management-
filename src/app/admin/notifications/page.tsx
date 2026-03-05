'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useNotifications, useMarkNotificationRead } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

const typeColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700', success: 'bg-green-100 text-green-700',
    payment: 'bg-purple-100 text-purple-700', warning: 'bg-amber-100 text-amber-700',
    appointment: 'bg-cyan-100 text-cyan-700', error: 'bg-red-100 text-red-700',
}

export default function AdminNotificationsPage() {
    const { user } = useAuth()
    const { data: notifications, isLoading, isError } = useNotifications(user?.id ?? null)
    const markRead = useMarkNotificationRead()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-destructive">Failed to load notifications.</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div>
    }

    const items = notifications || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">Platform notifications and alerts</p></div>
            </div>

            <Card className="border-border/50">
                <CardHeader><CardTitle className="text-base">Recent Notifications ({items.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {items.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
                    )}
                    {items.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${n.is_read ? 'bg-muted/30' : 'bg-muted/50 hover:bg-muted'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>
                                <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className={`font-medium text-sm ${n.is_read ? 'text-muted-foreground' : ''}`}>{n.title}</p>
                                    <Badge variant="secondary" className={`text-[10px] ${typeColors[n.type] || ''}`}>{n.type}</Badge>
                                    {!n.is_read && <Badge className="text-[10px] bg-primary/20 text-primary">New</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                            {!n.is_read && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => markRead.mutate(n.id, {
                                    onSuccess: () => toast.success('Marked as read'),
                                })}><CheckCircle className="w-3 h-3 mr-1" />Read</Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
