'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TOOTH_CONDITIONS } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { usePatients, useDentalChartRecords, useSaveDentalChartRecord } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

// Tooth data for adult dentition (Universal Numbering System 1-32)
const UPPER_TEETH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const LOWER_TEETH = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17]

const TOOTH_NAMES: Record<number, string> = {
    1: 'Upper Right 3rd Molar', 2: 'Upper Right 2nd Molar', 3: 'Upper Right 1st Molar', 4: 'Upper Right 2nd Premolar',
    5: 'Upper Right 1st Premolar', 6: 'Upper Right Canine', 7: 'Upper Right Lateral Incisor', 8: 'Upper Right Central Incisor',
    9: 'Upper Left Central Incisor', 10: 'Upper Left Lateral Incisor', 11: 'Upper Left Canine', 12: 'Upper Left 1st Premolar',
    13: 'Upper Left 2nd Premolar', 14: 'Upper Left 1st Molar', 15: 'Upper Left 2nd Molar', 16: 'Upper Left 3rd Molar',
    17: 'Lower Left 3rd Molar', 18: 'Lower Left 2nd Molar', 19: 'Lower Left 1st Molar', 20: 'Lower Left 2nd Premolar',
    21: 'Lower Left 1st Premolar', 22: 'Lower Left Canine', 23: 'Lower Left Lateral Incisor', 24: 'Lower Left Central Incisor',
    25: 'Lower Right Central Incisor', 26: 'Lower Right Lateral Incisor', 27: 'Lower Right Canine', 28: 'Lower Right 1st Premolar',
    29: 'Lower Right 2nd Premolar', 30: 'Lower Right 1st Molar', 31: 'Lower Right 2nd Molar', 32: 'Lower Right 3rd Molar',
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
        const isMolar = (num >= 1 && num <= 3) || (num >= 14 && num <= 16) || (num >= 17 && num <= 19) || (num >= 30 && num <= 32)
        const isPremolar = (num >= 4 && num <= 5) || (num >= 12 && num <= 13) || (num >= 20 && num <= 21) || (num >= 28 && num <= 29)

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
                        x={4} y={isUpper ? 6 : 0} width={28} height={38} rx={isUpper ? 8 : 8}
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
                <p className="text-muted-foreground">Interactive tooth chart — click any tooth to record conditions</p>
            </div>

            {/* Patient Selector */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Label className="whitespace-nowrap font-medium">Patient</Label>
                        {pLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <select
                            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedPatientId || ''}
                            onChange={(e) => { setSelectedPatientId(e.target.value || null); setSelectedTooth(null); setToothConditions([]) }}
                        >
                            <option value="">Select a patient to load/save chart...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id_number})</option>)}
                        </select>
                        )}
                        {rLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-2 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base">Adult Dentition (32 Teeth)</CardTitle>
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
