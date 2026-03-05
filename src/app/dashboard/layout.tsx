'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    Stethoscope,
    Settings,
    BarChart3,
    FileText,
    Receipt,
    Menu,
    LogOut,
    Moon,
    Sun,
    ChevronLeft,
    Bell,
    Activity,
    Loader2,
    Hammer,
    AlertTriangle,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/patients', label: 'Patients', icon: Users },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dashboard/visits', label: 'OPD / Visits', icon: ClipboardList },
    { href: '/dashboard/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/dashboard/dental-chart', label: 'Dental Chart', icon: Activity },
    { href: '/dashboard/treatments', label: 'Treatments', icon: Hammer },
    { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/dashboard/billing', label: 'Billing', icon: Receipt },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user, profile, hospital, isLoading, signOut } = useAuth()

    useEffect(() => { setMounted(true) }, [])

    // Auth guard — redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
        // Redirect patients to patient portal
        if (!isLoading && user && profile?.role === 'patient') {
            router.push('/patient')
        }
    }, [isLoading, user, profile, router])

    const handleLogout = async () => {
        await signOut()
        router.push('/')
    }

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 h-16 border-b">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">D</span>
                </div>
                {!sidebarCollapsed && (
                    <span className="text-lg font-bold gradient-text">DentalHub</span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="p-3 border-t space-y-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    {mounted && theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {!sidebarCollapsed && (mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {!sidebarCollapsed && 'Sign Out'}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
                    sidebarCollapsed ? 'w-16' : 'w-64'
                )}
            >
                <NavContent />
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 rounded-full border bg-card items-center justify-center shadow-md hover:bg-accent z-50"
                    style={{ left: sidebarCollapsed ? '52px' : '248px' }}
                >
                    <ChevronLeft className={cn('w-3 h-3 transition-transform', sidebarCollapsed && 'rotate-180')} />
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <NavContent />
                            </SheetContent>
                        </Sheet>

                        <h1 className="text-lg font-semibold">
                            {NAV_ITEMS.find((item) =>
                                pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            )?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={profile?.avatar_url || ''} />
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                            {getInitials(profile?.full_name || user?.email || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Pending Hospital Banner */}
                {hospital && hospital.status === 'pending' && (
                    <div className="mx-4 lg:mx-6 mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-amber-800 dark:text-amber-300">Hospital Pending Approval</p>
                            <p className="text-amber-700 dark:text-amber-400">Your hospital is under review. You can set up your profile now via Settings. Once approved, your public page will be live at <strong>/hospitals/{hospital.slug}</strong></p>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
