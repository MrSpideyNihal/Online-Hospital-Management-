'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    Building2, Palette, MapPin, QrCode, Save, Upload, Loader2, ExternalLink, Plus, Trash2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
    useUpdateHospital,
    useHospitalServices,
    useCreateHospitalService,
    useUpdateHospitalService,
    useDeleteHospitalService,
} from '@/lib/supabase/hooks'
import type { Hospital, HospitalService } from '@/types/database'

export default function SettingsPage() {
    const { hospital, hospitalId, refreshProfile } = useAuth()
    const updateHospital = useUpdateHospital()
    const { data: procedurePresets = [] } = useHospitalServices(hospitalId)
    const createProcedurePreset = useCreateHospitalService()
    const updateProcedurePreset = useUpdateHospitalService()
    const deleteProcedurePreset = useDeleteHospitalService()

    const [hospitalName, setHospitalName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [pincode, setPincode] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
    const [secondaryColor, setSecondaryColor] = useState('#6366f1')
    const [aboutText, setAboutText] = useState('')
    const [mission, setMission] = useState('')
    const [mapEmbed, setMapEmbed] = useState('')

    const [newProcedureName, setNewProcedureName] = useState('')
    const [newProcedureFee, setNewProcedureFee] = useState('')
    const [newProcedureDuration, setNewProcedureDuration] = useState('30')
    const [newProcedureDescription, setNewProcedureDescription] = useState('')
    const [updatingPresetId, setUpdatingPresetId] = useState<string | null>(null)
    const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null)
    const [procedureDrafts, setProcedureDrafts] = useState<Record<string, {
        service_name: string
        price: string
        duration_minutes: string
        description: string
    }>>({})

    // Pre-fill from hospital data
    useEffect(() => {
        if (hospital) {
            setHospitalName(hospital.name || '')
            setEmail(hospital.email || '')
            setPhone(hospital.phone || '')
            setAddress(hospital.address || '')
            setCity(hospital.city || '')
            setState(hospital.state || '')
            setPincode(hospital.pincode || '')
            setPrimaryColor(hospital.primary_color || '#0ea5e9')
            setSecondaryColor(hospital.secondary_color || '#6366f1')
            setAboutText(hospital.about_text || '')
            setMission(hospital.mission || '')
            setMapEmbed(hospital.map_embed_url || '')
        }
    }, [hospital])

    useEffect(() => {
        setProcedureDrafts((prev) => {
            const next: Record<string, {
                service_name: string
                price: string
                duration_minutes: string
                description: string
            }> = {}

            for (const preset of procedurePresets) {
                next[preset.id] = prev[preset.id] || {
                    service_name: preset.service_name || '',
                    price: preset.price != null ? String(preset.price) : '',
                    duration_minutes: String(preset.duration_minutes || 30),
                    description: preset.description || '',
                }
            }

            return next
        })
    }, [procedurePresets])

    const updateProcedureDraft = (
        id: string,
        field: keyof (typeof procedureDrafts)[string],
        value: string,
    ) => {
        setProcedureDrafts((prev) => {
            const existing = prev[id] || {
                service_name: '',
                price: '',
                duration_minutes: '30',
                description: '',
            }

            return {
                ...prev,
                [id]: {
                    ...existing,
                    [field]: value,
                },
            }
        })
    }

    const resetNewProcedureForm = () => {
        setNewProcedureName('')
        setNewProcedureFee('')
        setNewProcedureDuration('30')
        setNewProcedureDescription('')
    }

    const handleAddProcedurePreset = () => {
        if (!hospitalId) {
            toast.error('Hospital is not linked to your account yet. Please refresh and try again.')
            return
        }

        const serviceName = newProcedureName.trim()
        if (!serviceName) {
            toast.error('Procedure name is required')
            return
        }

        const fee = newProcedureFee.trim() ? Number(newProcedureFee) : 0
        const duration = Number(newProcedureDuration) || 30

        if (fee < 0) {
            toast.error('Procedure fee cannot be negative')
            return
        }
        if (duration < 5) {
            toast.error('Duration must be at least 5 minutes')
            return
        }

        createProcedurePreset.mutate({
            hospital_id: hospitalId,
            service_name: serviceName,
            price: fee,
            duration_minutes: duration,
            description: newProcedureDescription.trim() || null,
            is_active: true,
        }, {
            onSuccess: () => {
                toast.success('Procedure preset added')
                resetNewProcedureForm()
            },
            onError: (error) => toast.error(error.message),
        })
    }

    const handleSaveProcedurePreset = (preset: HospitalService) => {
        const draft = procedureDrafts[preset.id]
        if (!draft) return

        const serviceName = draft.service_name.trim()
        const fee = draft.price.trim() ? Number(draft.price) : 0
        const duration = Number(draft.duration_minutes) || 30

        if (!serviceName) {
            toast.error('Procedure name is required')
            return
        }
        if (fee < 0) {
            toast.error('Procedure fee cannot be negative')
            return
        }
        if (duration < 5) {
            toast.error('Duration must be at least 5 minutes')
            return
        }

        setUpdatingPresetId(preset.id)
        updateProcedurePreset.mutate({
            id: preset.id,
            service_name: serviceName,
            price: fee,
            duration_minutes: duration,
            description: draft.description.trim() || null,
            is_active: true,
        }, {
            onSuccess: () => toast.success('Procedure preset updated'),
            onError: (error) => toast.error(error.message),
            onSettled: () => setUpdatingPresetId(null),
        })
    }

    const handleDeleteProcedurePreset = (preset: HospitalService) => {
        if (!hospitalId) return
        if (!window.confirm(`Delete procedure preset "${preset.service_name}"?`)) return

        setDeletingPresetId(preset.id)
        deleteProcedurePreset.mutate({ id: preset.id, hospitalId }, {
            onSuccess: () => toast.success('Procedure preset removed'),
            onError: (error) => toast.error(error.message),
            onSettled: () => setDeletingPresetId(null),
        })
    }

    const handleSave = (section?: string) => {
        if (!hospitalId) {
            toast.error('Hospital is not linked to your account yet. Please refresh or sign in again.')
            return
        }
        // Required field validation
        if ((!section || section === 'general') && !hospitalName.trim()) {
            toast.error('Hospital name is required'); return
        }
        if ((!section || section === 'general') && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email'); return
        }
        if ((!section || section === 'location') && pincode && !/^\d{6}$/.test(pincode)) {
            toast.error('Pincode must be a 6-digit number'); return
        }
        // Validate map embed URL for security (only Google Maps allowed)
        if ((!section || section === 'location') && mapEmbed) {
            try {
                const embedUrl = new URL(mapEmbed)
                const allowedHosts = ['www.google.com', 'maps.google.com', 'google.com', 'www.google.co.in', 'maps.googleapis.com']
                if (!allowedHosts.includes(embedUrl.hostname)) {
                    toast.error('Map embed URL must be from Google Maps (google.com)'); return
                }
            } catch {
                toast.error('Invalid map embed URL'); return
            }
        }
        // Validate hex colors
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if ((!section || section === 'branding') && (!hexRegex.test(primaryColor) || !hexRegex.test(secondaryColor))) {
            toast.error('Invalid color format. Use hex like #0ea5e9'); return
        }
        const updates: Partial<Hospital> = {}
        if (!section || section === 'general') {
            Object.assign(updates, { name: hospitalName, email, phone, about_text: aboutText, mission })
        }
        if (!section || section === 'branding') {
            Object.assign(updates, { primary_color: primaryColor, secondary_color: secondaryColor })
        }
        if (!section || section === 'location') {
            Object.assign(updates, { address, city, state, pincode, map_embed_url: mapEmbed })
        }
        updateHospital.mutate({ id: hospitalId, ...updates }, {
            onSuccess: () => { toast.success('Settings saved successfully!'); refreshProfile() },
            onError: (e) => toast.error(e.message),
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Customize your hospital profile and public website</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl h-auto gap-2">
                    <TabsTrigger value="general"><Building2 className="w-4 h-4 mr-1.5" />General</TabsTrigger>
                    <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-1.5" />Branding</TabsTrigger>
                    <TabsTrigger value="location"><MapPin className="w-4 h-4 mr-1.5" />Location</TabsTrigger>
                    <TabsTrigger value="procedures"><Plus className="w-4 h-4 mr-1.5" />Procedures</TabsTrigger>
                    <TabsTrigger value="qr"><QrCode className="w-4 h-4 mr-1.5" />QR Code</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Hospital Information</CardTitle>
                            <CardDescription>This info appears on your public website and search results.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Hospital Name *</Label>
                                    <Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email *</Label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Phone</Label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1.5">
                                <Label>About Us</Label>
                                <Textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={4} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Mission Statement</Label>
                                <Textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={2} />
                            </div>
                            <Button onClick={() => handleSave('general')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" disabled={updateHospital.isPending}>
                                {updateHospital.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="branding">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Branding & Appearance</CardTitle>
                            <CardDescription>Customize your public website look and feel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>Hospital Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center bg-muted/50">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm" disabled><Upload className="w-4 h-4 mr-1.5" /> Upload Logo (Coming Soon)</Button>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB. Recommended 200x200px.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <Label>Hero Banner Image</Label>
                                <div className="w-full h-32 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/50">
                                    <div className="text-center">
                                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                                        <p className="text-xs text-muted-foreground">Upload banner — Coming Soon</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Colors */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Color</Label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                                        <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="h-20" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
                                    <div className="p-4 bg-card">
                                        <p className="font-semibold" style={{ color: primaryColor }}>{hospitalName}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Your public website will use these colors.</p>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => handleSave('branding')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" disabled={updateHospital.isPending}>
                                {updateHospital.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save Branding
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="location">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Location & Address</CardTitle>
                            <CardDescription>Set your hospital address for the public website and search results.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Street Address</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>State</Label><Input value={state} onChange={(e) => setState(e.target.value)} /></div>
                                <div className="space-y-1.5"><Label>Pincode</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Google Maps Embed URL</Label>
                                <Input value={mapEmbed} onChange={(e) => setMapEmbed(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                                <p className="text-xs text-muted-foreground">Paste the embed URL from Google Maps share dialog.</p>
                            </div>
                            {mapEmbed && (() => { try { const u = new URL(mapEmbed); const allowed = ['www.google.com', 'maps.google.com', 'google.com', 'www.google.co.in', 'maps.googleapis.com']; return allowed.includes(u.hostname) } catch { return false } })() && (
                                <div className="rounded-xl overflow-hidden border">
                                    <iframe src={mapEmbed} width="100%" height="300" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" allowFullScreen loading="lazy" referrerPolicy="no-referrer" />
                                </div>
                            )}
                            <Button onClick={() => handleSave('location')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" disabled={updateHospital.isPending}>
                                {updateHospital.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save Location
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="procedures">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Procedure Presets</CardTitle>
                            <CardDescription>
                                Configure clinic-specific procedure names and default fees. These presets appear in Billing for one-click treatment line items.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <p className="font-medium">Add New Procedure Preset</p>
                                    <p className="text-sm text-muted-foreground">Example: Root Canal, Scaling, Crown Placement.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Procedure Name *</Label>
                                        <Input value={newProcedureName} onChange={(e) => setNewProcedureName(e.target.value)} placeholder="Root Canal" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Default Fee (INR)</Label>
                                        <Input type="number" min={0} value={newProcedureFee} onChange={(e) => setNewProcedureFee(e.target.value)} placeholder="5500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Duration (minutes)</Label>
                                        <Input type="number" min={5} value={newProcedureDuration} onChange={(e) => setNewProcedureDuration(e.target.value)} placeholder="30" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                        <Label>Description</Label>
                                        <Input value={newProcedureDescription} onChange={(e) => setNewProcedureDescription(e.target.value)} placeholder="Tooth #, optional notes" />
                                    </div>
                                </div>
                                <Button onClick={handleAddProcedurePreset} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" disabled={createProcedurePreset.isPending}>
                                    {createProcedurePreset.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                                    Add Preset
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium">Saved Procedure Presets</p>
                                    <p className="text-sm text-muted-foreground">Update fees any time. Billing uses the latest values.</p>
                                </div>
                                {procedurePresets.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        No procedure presets yet. Add your first preset above.
                                    </div>
                                ) : procedurePresets.map((preset) => {
                                    const draft = procedureDrafts[preset.id] || {
                                        service_name: preset.service_name || '',
                                        price: preset.price != null ? String(preset.price) : '',
                                        duration_minutes: String(preset.duration_minutes || 30),
                                        description: preset.description || '',
                                    }

                                    return (
                                        <div key={preset.id} className="rounded-xl border p-4 space-y-3">
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Procedure Name</Label>
                                                    <Input value={draft.service_name} onChange={(e) => updateProcedureDraft(preset.id, 'service_name', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Fee (INR)</Label>
                                                    <Input type="number" min={0} value={draft.price} onChange={(e) => updateProcedureDraft(preset.id, 'price', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Duration (minutes)</Label>
                                                    <Input type="number" min={5} value={draft.duration_minutes} onChange={(e) => updateProcedureDraft(preset.id, 'duration_minutes', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Description</Label>
                                                    <Input value={draft.description} onChange={(e) => updateProcedureDraft(preset.id, 'description', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleSaveProcedurePreset(preset)}
                                                    disabled={updateProcedurePreset.isPending && updatingPresetId === preset.id}
                                                >
                                                    {updateProcedurePreset.isPending && updatingPresetId === preset.id
                                                        ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                        : <Save className="w-4 h-4 mr-1.5" />}
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteProcedurePreset(preset)}
                                                    disabled={deleteProcedurePreset.isPending && deletingPresetId === preset.id}
                                                >
                                                    {deleteProcedurePreset.isPending && deletingPresetId === preset.id
                                                        ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                        : <Trash2 className="w-4 h-4 mr-1.5" />}
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="qr">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>QR Code Templates</CardTitle>
                            <CardDescription>Generate QR codes for patients to view their basic public details without login.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-8 rounded-xl border-2 border-dashed text-center">
                                <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <p className="font-medium mb-1">Patient QR Codes</p>
                                <p className="text-sm text-muted-foreground mb-4">Generate a QR code for any patient from their profile page. When scanned, it shows basic public details (name, last visit, upcoming appointment, allergies).</p>
                                <Button variant="outline" onClick={() => window.open('/qr/sample', '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-1.5" />
                                    View Sample QR Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
