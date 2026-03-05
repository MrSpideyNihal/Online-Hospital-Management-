'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AdminErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
    useEffect(() => {
        console.error('[Admin Error Boundary]', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <h2 className="text-xl font-semibold">Admin Panel Error</h2>
                <p className="text-sm text-muted-foreground">Something failed while loading admin data.</p>
                <Button onClick={reset}>Retry</Button>
            </div>
        </div>
    )
}
