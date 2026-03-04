'use client'

import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, AlertTriangle, Phone, Mail, Droplets, Calendar } from 'lucide-react'
import { usePatient } from '@/lib/supabase/hooks'
import { formatDate } from '@/lib/utils'

export default function PatientQRPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = use(params)
    const { data: patient, isLoading, isError } = usePatient(patientId)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError || !patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-1">Patient Not Found</h2>
                        <p className="text-muted-foreground text-sm">The patient record could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const age = patient.date_of_birth
        ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{patient.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{patient.patient_id_number || 'N/A'}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {patient.gender && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Gender</p>
                                <p className="text-sm font-medium capitalize">{patient.gender}</p>
                            </div>
                        )}
                        {age !== null && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Age</p>
                                <p className="text-sm font-medium">{age} years</p>
                            </div>
                        )}
                        {patient.blood_group && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-red-500" />
                                    <p className="text-xs text-muted-foreground">Blood Group</p>
                                </div>
                                <p className="text-sm font-medium">{patient.blood_group}</p>
                            </div>
                        )}
                        {patient.date_of_birth && (
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">DOB</p>
                                </div>
                                <p className="text-sm font-medium">{formatDate(patient.date_of_birth)}</p>
                            </div>
                        )}
                    </div>

                    {patient.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{patient.phone}</span>
                        </div>
                    )}
                    {patient.email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{patient.email}</span>
                        </div>
                    )}

                    {patient.allergies && patient.allergies.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Allergies</p>
                            <div className="flex flex-wrap gap-1.5">
                                {patient.allergies.map((a) => (
                                    <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {patient.emergency_contact_name && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Emergency Contact</p>
                            <p className="text-sm font-medium">{patient.emergency_contact_name}</p>
                            {patient.emergency_contact_phone && (
                                <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                            )}
                        </div>
                    )}

                    <div className="text-center pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            Last visit: {patient.last_visit ? formatDate(patient.last_visit) : 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
