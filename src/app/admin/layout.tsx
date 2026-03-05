'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    LayoutDashboard, Building2, CreditCard, BarChart3, Bell,
    Menu, LogOut, Shield, ChevronLeft, Loader2, Sun, Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { user, isLoading, isSuperAdmin, signOut } = useAuth()
    const { theme, setTheme } = useTheme()

    useEffect(() => { setMounted(true) }, [])

    // Auth guard — only super admin can access
    useEffect(() => {
        if (!isLoading && !user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        } else if (!isLoading && user && !isSuperAdmin) {
            router.push('/dashboard')
        }
    }, [isLoading, user, isSuperAdmin, pathname, router])

    const handleLogout = async () => {
        await signOut()
        router.push('/')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
        )
    }

    if (!user || !isSuperAdmin) return null

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 h-16 border-b">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                </div>
                {!sidebarCollapsed && (
                    <span className="text-lg font-bold text-red-600">Super Admin</span>
                )}
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive ? 'bg-red-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}>
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-3 border-t space-y-1">
                <Link href="/dashboard"><Button variant="ghost" size="sm" className="w-full justify-start"><Building2 className="w-4 h-4 mr-2" />{!sidebarCollapsed && 'Hospital Dashboard'}</Button></Link>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {mounted && theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {!sidebarCollapsed && (mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />{!sidebarCollapsed && 'Sign Out'}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex">
            <aside className={cn('hidden lg:flex flex-col border-r bg-card transition-all duration-300', sidebarCollapsed ? 'w-16' : 'w-64')}>
                <NavContent />
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 rounded-full border bg-card items-center justify-center shadow-md z-50"
                    style={{ left: sidebarCollapsed ? '52px' : '248px' }}>
                    <ChevronLeft className={cn('w-3 h-3 transition-transform', sidebarCollapsed && 'rotate-180')} />
                </button>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button></SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0"><NavContent /></SheetContent>
                        </Sheet>
                        <h1 className="text-lg font-semibold">
                            {NAV_ITEMS.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Super Admin'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-4 h-4 text-red-500" /> Super Admin Mode
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
            </div>
        </div>
    )
}
