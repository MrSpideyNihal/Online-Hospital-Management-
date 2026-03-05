'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AppErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function AppError({ error, reset }: AppErrorProps) {
    useEffect(() => {
        console.error('[App Error Boundary]', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
                <Button onClick={reset}>Try Again</Button>
            </div>
        </div>
    )
}
