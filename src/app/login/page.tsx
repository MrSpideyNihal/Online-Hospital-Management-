'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Shield } from 'lucide-react'

function LoginForm() {
    const searchParams = useSearchParams()
    const isHospitalRegistration = searchParams.get('type') === 'hospital'
    const redirect = searchParams.get('redirect') || '/dashboard'
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
                },
            })
            if (error) throw error
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to sign in with Google'
            toast.error(message)
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">D</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold">
                    {isHospitalRegistration ? 'Register Your Hospital' : 'Welcome to DentalHub'}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isHospitalRegistration
                        ? 'Sign in with Google to register your hospital'
                        : 'Sign in with your Google account to continue'
                    }
                </p>
            </div>

            <Card className="border-border/50 shadow-xl shadow-black/5">
                <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-lg">Sign In</CardTitle>
                    <CardDescription>
                        One click to access your dental practice dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium border-2 hover:border-primary/50 hover:bg-accent transition-all duration-200"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        <Shield className="w-4 h-4 flex-shrink-0" />
                        <span>Your data is secured with enterprise-grade encryption. We only access your name and email.</span>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <Suspense fallback={
                <div className="w-full max-w-md text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    )
}
