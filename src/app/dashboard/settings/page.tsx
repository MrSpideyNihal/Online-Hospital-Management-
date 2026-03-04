'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    Building2, Palette, MapPin, Globe, QrCode, Save, Upload,
} from 'lucide-react'

export default function SettingsPage() {
    const [hospitalName, setHospitalName] = useState('SmileCare Dental Hospital')
    const [email, setEmail] = useState('info@smilecare.com')
    const [phone, setPhone] = useState('+91 22 2345 6789')
    const [address, setAddress] = useState('123 MG Road, Andheri West')
    const [city, setCity] = useState('Mumbai')
    const [state, setState] = useState('Maharashtra')
    const [pincode, setPincode] = useState('400058')
    const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
    const [secondaryColor, setSecondaryColor] = useState('#6366f1')
    const [aboutText, setAboutText] = useState('SmileCare Dental Hospital has been providing world-class dental care since 2010. Our team of experienced dentists uses the latest technology to ensure the best treatment for our patients.')
    const [mission, setMission] = useState('To provide affordable, high-quality dental care to every patient with compassion and excellence.')
    const [mapEmbed, setMapEmbed] = useState('')

    const handleSave = () => {
        toast.success('Settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Customize your hospital profile and public website</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 max-w-xl">
                    <TabsTrigger value="general"><Building2 className="w-4 h-4 mr-1.5" />General</TabsTrigger>
                    <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-1.5" />Branding</TabsTrigger>
                    <TabsTrigger value="location"><MapPin className="w-4 h-4 mr-1.5" />Location</TabsTrigger>
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
                            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <Save className="w-4 h-4 mr-1.5" /> Save Changes
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
                                        <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1.5" /> Upload Logo</Button>
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
                                        <p className="text-xs text-muted-foreground">Upload banner (1200x400px recommended)</p>
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

                            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <Save className="w-4 h-4 mr-1.5" /> Save Branding
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
                            {mapEmbed && (
                                <div className="rounded-xl overflow-hidden border">
                                    <iframe src={mapEmbed} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" />
                                </div>
                            )}
                            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <Save className="w-4 h-4 mr-1.5" /> Save Location
                            </Button>
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
                                <Button variant="outline">
                                    <Globe className="w-4 h-4 mr-1.5" />
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
