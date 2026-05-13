'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { TOOTH_CONDITIONS } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { usePatients, useDentalChartRecords, useSaveDentalChartRecord } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

// FDI World Dental Federation notation (ISO 3950)
// Quadrant 1: Upper Right (18-11), Quadrant 2: Upper Left (21-28)
// Quadrant 3: Lower Left (31-38), Quadrant 4: Lower Right (48-41)
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

const TOOTH_NAMES: Record<number, string> = {
    // Upper Right (Quadrant 1)
    18: 'Upper Right 3rd Molar', 17: 'Upper Right 2nd Molar', 16: 'Upper Right 1st Molar', 15: 'Upper Right 2nd Premolar',
    14: 'Upper Right 1st Premolar', 13: 'Upper Right Canine', 12: 'Upper Right Lateral Incisor', 11: 'Upper Right Central Incisor',
    // Upper Left (Quadrant 2)
    21: 'Upper Left Central Incisor', 22: 'Upper Left Lateral Incisor', 23: 'Upper Left Canine', 24: 'Upper Left 1st Premolar',
    25: 'Upper Left 2nd Premolar', 26: 'Upper Left 1st Molar', 27: 'Upper Left 2nd Molar', 28: 'Upper Left 3rd Molar',
    // Lower Left (Quadrant 3)
    31: 'Lower Left Central Incisor', 32: 'Lower Left Lateral Incisor', 33: 'Lower Left Canine', 34: 'Lower Left 1st Premolar',
    35: 'Lower Left 2nd Premolar', 36: 'Lower Left 1st Molar', 37: 'Lower Left 2nd Molar', 38: 'Lower Left 3rd Molar',
    // Lower Right (Quadrant 4)
    41: 'Lower Right Central Incisor', 42: 'Lower Right Lateral Incisor', 43: 'Lower Right Canine', 44: 'Lower Right 1st Premolar',
    45: 'Lower Right 2nd Premolar', 46: 'Lower Right 1st Molar', 47: 'Lower Right 2nd Molar', 48: 'Lower Right 3rd Molar',
}

// Helper to classify tooth type by FDI number
function getToothType(num: number): 'molar' | 'premolar' | 'canine' | 'incisor' {
    const pos = num % 10 // last digit = tooth position in quadrant
    if (pos >= 6) return 'molar'      // 6,7,8 = molars
    if (pos >= 4) return 'premolar'   // 4,5 = premolars
    if (pos === 3) return 'canine'    // 3 = canine
    return 'incisor'                  // 1,2 = incisors
}

interface ToothCondition {
    tooth_number: number
    condition: string
    notes: string
}

export default function DentalChartPage() {
    const { hospitalId, user } = useAuth()
    const { data: patients = [], isLoading: pLoading } = usePatients(hospitalId)
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
    const { data: records = [], isLoading: rLoading } = useDentalChartRecords(selectedPatientId)
    const saveDentalChart = useSaveDentalChartRecord()

    const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
    const [selectedCondition, setSelectedCondition] = useState('healthy')
    const [toothConditions, setToothConditions] = useState<ToothCondition[]>([])
    const [notes, setNotes] = useState('')
    const [patientSearch, setPatientSearch] = useState('')

    const patientSearchTerm = patientSearch.trim().toLowerCase()
    const filteredPatients = patients.filter((p) => {
        if (!patientSearchTerm) return true
        return (
            p.full_name.toLowerCase().includes(patientSearchTerm) ||
            (p.patient_id_number || '').toLowerCase().includes(patientSearchTerm) ||
            (p.phone || '').toLowerCase().includes(patientSearchTerm)
        )
    })

    const selectedPatient = selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null
    const patientOptions = selectedPatient && !filteredPatients.some((p) => p.id === selectedPatient.id)
        ? [selectedPatient, ...filteredPatients]
        : filteredPatients

    // Populate local state from DB records when patient changes
    useEffect(() => {
        if (records.length > 0) {
            // Group by tooth, take latest per tooth
            const map = new Map<number, ToothCondition>()
            for (const r of records) {
                if (!map.has(r.tooth_number)) {
                    map.set(r.tooth_number, { tooth_number: r.tooth_number, condition: r.condition, notes: r.notes || '' })
                }
            }
            setToothConditions(Array.from(map.values()))
        } else {
            setToothConditions([])
        }
    }, [records])

    const getToothColor = useCallback((toothNum: number) => {
        const cond = toothConditions.find(c => c.tooth_number === toothNum)
        if (!cond) return '#e2e8f0'
        return TOOTH_CONDITIONS.find(c => c.id === cond.condition)?.color || '#e2e8f0'
    }, [toothConditions])

    const handleToothClick = (toothNum: number) => {
        if (!selectedPatientId) {
            toast.error('Please select a patient first')
            return
        }
        setSelectedTooth(toothNum)
        const existing = toothConditions.find(c => c.tooth_number === toothNum)
        if (existing) {
            setSelectedCondition(existing.condition)
            setNotes(existing.notes)
        } else {
            setSelectedCondition('healthy')
            setNotes('')
        }
    }

    const handleSaveCondition = () => {
        if (selectedTooth === null) return
        if (!selectedPatientId) {
            toast.error('Please select a patient first')
            return
        }
        // Update local state immediately
        setToothConditions(prev => {
            const filtered = prev.filter(c => c.tooth_number !== selectedTooth)
            return [...filtered, { tooth_number: selectedTooth, condition: selectedCondition, notes }]
        })
        // Persist to DB
        if (hospitalId) {
            saveDentalChart.mutate({
                patient_id: selectedPatientId,
                hospital_id: hospitalId,
                tooth_number: selectedTooth,
                condition: selectedCondition,
                notes: notes || null,
                visit_id: null,
                surface: null,
                recorded_by: user?.id ?? null,
            }, {
                onSuccess: () => toast.success(`Tooth #${selectedTooth} saved`),
                onError: (e) => {
                    toast.error(e.message)
                    // Revert local state on save failure
                    setToothConditions(prev => prev.filter(c => c.tooth_number !== selectedTooth))
                },
            })
        }
        setSelectedTooth(null)
        setNotes('')
    }

    const ToothSVG = ({ num, isUpper }: { num: number; isUpper: boolean }) => {
        const color = getToothColor(num)
        const isSelected = selectedTooth === num
        const toothType = getToothType(num)
        const isMolar = toothType === 'molar'
        const isPremolar = toothType === 'premolar'

        return (
            <g
                onClick={() => handleToothClick(num)}
                className="tooth cursor-pointer"
                style={{ transition: 'all 0.2s' }}
            >
                {isMolar ? (
                    <rect
                        x={0} y={0} width={36} height={isUpper ? 44 : 44} rx={6}
                        fill={color}
                        stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="hover:brightness-110"
                    />
                ) : isPremolar ? (
                    <rect
                        x={2} y={isUpper ? 4 : 0} width={32} height={40} rx={6}
                        fill={color}
                        stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="hover:brightness-110"
                    />
                ) : (
                    <rect
                        x={4} y={isUpper ? 6 : 0} width={28} height={38} rx={8}
                        fill={color}
                        stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="hover:brightness-110"
                    />
                )}
                <text
                    x={18} y={isUpper ? 26 : 24} textAnchor="middle"
                    className="text-[10px] font-bold fill-gray-700 dark:fill-gray-200 pointer-events-none select-none"
                >
                    {num}
                </text>
            </g>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dental Chart</h1>
                <p className="text-muted-foreground">Interactive tooth chart (FDI notation) — click any tooth to record conditions</p>
            </div>

            {/* Patient Selector */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <Label className="whitespace-nowrap font-medium pt-2">Patient</Label>
                        {pLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <div className="flex-1 space-y-2">
                            <Input
                                placeholder="Search patient by name, ID, or phone..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                className="h-9"
                            />
                            <select
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                value={selectedPatientId || ''}
                                onChange={(e) => { setSelectedPatientId(e.target.value || null); setSelectedTooth(null); setToothConditions([]) }}
                            >
                                <option value="">Select a patient to load/save chart...</option>
                                {patientOptions.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id_number})</option>)}
                            </select>
                            {patientOptions.length === 0 && (
                                <p className="text-xs text-muted-foreground">No patients match your search.</p>
                            )}
                        </div>
                        )}
                        {rLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-2 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base">Adult Dentition — FDI Notation (32 Teeth)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-2">
                            {/* Upper Arch */}
                            <div className="text-xs text-muted-foreground font-medium mb-1">UPPER JAW</div>
                            <div className="w-full overflow-x-auto pb-2">
                                <svg viewBox="0 0 620 60" className="w-full min-w-[500px] h-16">
                                    {UPPER_TEETH.map((num, i) => (
                                        <g key={num} transform={`translate(${i * 38 + 6}, 4)`}>
                                            <ToothSVG num={num} isUpper={true} />
                                        </g>
                                    ))}
                                </svg>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-border my-2 relative">
                                <div className="absolute left-0 text-[10px] text-muted-foreground -top-2">Right</div>
                                <div className="absolute right-0 text-[10px] text-muted-foreground -top-2">Left</div>
                            </div>

                            {/* Lower Arch */}
                            <div className="w-full overflow-x-auto pb-2">
                                <svg viewBox="0 0 620 60" className="w-full min-w-[500px] h-16">
                                    {LOWER_TEETH.map((num, i) => (
                                        <g key={num} transform={`translate(${i * 38 + 6}, 4)`}>
                                            <ToothSVG num={num} isUpper={false} />
                                        </g>
                                    ))}
                                </svg>
                            </div>
                            <div className="text-xs text-muted-foreground font-medium mt-1">LOWER JAW</div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">LEGEND</p>
                            <div className="flex flex-wrap gap-3">
                                {TOOTH_CONDITIONS.map((cond) => (
                                    <div key={cond.id} className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: cond.color }} />
                                        <span className="text-xs">{cond.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tooth Detail Panel */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {selectedTooth
                                ? `Tooth #${selectedTooth}`
                                : 'Select a Tooth'
                            }
                        </CardTitle>
                        {selectedTooth && (
                            <p className="text-xs text-muted-foreground">{TOOTH_NAMES[selectedTooth]}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        {selectedTooth ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Condition</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TOOTH_CONDITIONS.map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => setSelectedCondition(cond.id)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${selectedCondition === cond.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
                                                    }`}
                                            >
                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cond.color }} />
                                                {cond.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm">Notes</Label>
                                    <Textarea
                                        placeholder="Additional notes about this tooth..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSaveCondition} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" size="sm">
                                        Save Condition
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedTooth(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <div className="text-4xl mb-2">🦷</div>
                                <p className="text-sm">Click on any tooth in the chart to view or update its condition.</p>
                            </div>
                        )}

                        {/* Recorded conditions */}
                        {toothConditions.length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">RECORDED CONDITIONS ({toothConditions.length})</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {toothConditions.map((tc) => {
                                        const cond = TOOTH_CONDITIONS.find(c => c.id === tc.condition)
                                        return (
                                            <div
                                                key={tc.tooth_number}
                                                className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs cursor-pointer hover:bg-muted"
                                                onClick={() => handleToothClick(tc.tooth_number)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cond?.color }} />
                                                    <span className="font-medium">#{tc.tooth_number}</span>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px]">{cond?.label}</Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
