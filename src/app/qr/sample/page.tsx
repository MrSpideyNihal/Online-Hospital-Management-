import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Droplets, Calendar, Clock } from 'lucide-react'

export default function QRPatientSamplePage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Sample Patient</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">PAT-00001</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Gender</p>
                            <p className="text-sm font-medium">Female</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="text-sm font-medium">32 years</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-red-500" />
                                <p className="text-xs text-muted-foreground">Blood Group</p>
                            </div>
                            <p className="text-sm font-medium">B+</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">DOB</p>
                            </div>
                            <p className="text-sm font-medium">15 Jan 1994</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Allergies</p>
                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="destructive" className="text-xs">Penicillin</Badge>
                            <Badge variant="destructive" className="text-xs">Latex</Badge>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Upcoming Appointment
                        </p>
                        <p className="text-sm font-medium">12 Mar 2026 at 11:30</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Routine Cleaning • Dr. Sample</p>
                    </div>

                    <div className="text-center pt-2 border-t">
                        <p className="text-xs text-muted-foreground">This is a sample preview. Real QR pages show live patient data.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
