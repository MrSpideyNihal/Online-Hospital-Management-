'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    User, Droplets, Calendar, Clock, Download, Stethoscope,
    Receipt, FileText, AlertTriangle, CheckCircle, Pill,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

type Props = { data: any }

const STATUS_COLORS: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    planned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const esc = (v: unknown) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function toINR(amount: unknown) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount) || 0)
}

function safeItems(raw: unknown): { description: string; quantity: number; unit_price: number; total: number }[] {
    if (!Array.isArray(raw)) return []
    return raw.filter((i: any) => i && typeof i === 'object' && i.description).map((i: any) => ({
        description: String(i.description), quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0, total: Number(i.total) || 0,
    }))
}

function openPrintPreview(data: any) {
    const p = data.patient
    const h = data.hospital
    const hospName = esc(h?.name || 'Hospital')
    const hospAddr = [h?.address, h?.city, h?.state, h?.pincode].filter(Boolean).join(', ')
    const age = p.age != null ? `${p.age} yrs` : '—'

    const visitRows = (data.visits || []).map((v: any, i: number) =>
        `<tr><td>${i+1}</td><td>${esc(formatDate(v.visit_date))}</td><td>${esc(v.doctors?.full_name || '—')}</td><td>${esc(v.chief_complaint || '—')}</td><td>${esc(v.diagnosis || '—')}</td><td>${esc((v.status||'').replace('_',' '))}</td></tr>`
    ).join('') || '<tr><td colspan="6" style="text-align:center;color:#6b7280;">No visits recorded</td></tr>'

    const treatRows = (data.treatments || []).map((t: any, i: number) =>
        `<tr><td>${i+1}</td><td>${esc(t.treatment_type)}</td><td>${t.tooth_number || '—'}</td><td>${esc(t.doctors?.full_name || '—')}</td><td>${toINR(t.actual_cost || t.estimated_cost)}</td><td>${esc((t.status||'').replace('_',' '))}</td></tr>`
    ).join('') || '<tr><td colspan="6" style="text-align:center;color:#6b7280;">No treatments recorded</td></tr>'

    const billRows = (data.invoices || []).map((inv: any, i: number) => {
        const items = safeItems(inv.items)
        const desc = items.length > 0 ? items.map((it: any) => it.description).join(', ') : '—'
        return `<tr><td>${i+1}</td><td>${esc(inv.invoice_number)}</td><td>${esc(formatDate(inv.created_at))}</td><td style="max-width:200px">${esc(desc)}</td><td>${toINR(inv.total)}</td><td>${esc(inv.payment_status)}</td></tr>`
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:#6b7280;">No bills found</td></tr>'

    const rxRows = (data.prescriptions || []).map((rx: any, i: number) => {
        const meds = (rx.medicines || []).map((m: any) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`).join('; ') || '—'
        return `<tr><td>${i+1}</td><td>${esc(formatDate(rx.created_at))}</td><td>${esc(rx.doctors?.full_name || '—')}</td><td>${esc(rx.diagnosis || '—')}</td><td style="max-width:250px;font-size:11px">${esc(meds)}</td></tr>`
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:#6b7280;">No prescriptions found</td></tr>'

    const bs = data.billingSummary

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Patient Report - ${esc(p.full_name)}</title>
<style>
:root{color-scheme:light}body{font-family:"Segoe UI",Tahoma,sans-serif;margin:0;background:#f3f4f6;color:#111827;font-size:13px}
.sheet{max-width:900px;margin:20px auto;background:#fff;border:1px solid #e5e7eb;padding:0 0 20px}
.hdr{padding:24px 30px 16px;border-bottom:2px solid #0ea5e9;display:flex;justify-content:space-between;align-items:flex-start}
.hdr h1{margin:0;font-size:22px;color:#0e7490}.hdr .sub{color:#6b7280;font-size:12px;margin-top:4px}
.hdr .right{text-align:right;font-size:12px;color:#4b5563}
.section{padding:12px 30px 0}.section h2{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#0e7490;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:0 0 10px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.field{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px}
.field .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:2px}
.field .val{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border-bottom:1px solid #e5e7eb;padding:7px 6px;text-align:left;font-size:12px;vertical-align:top}
th{background:#f0f9ff;font-size:11px;text-transform:uppercase;color:#0e7490;letter-spacing:.03em}
.summary-box{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:8px}
.sbox{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px;text-align:center}
.sbox.warn{background:#fffbeb;border-color:#fde68a}.sbox .sv{font-size:18px;font-weight:700}.sbox .sl{font-size:10px;text-transform:uppercase;color:#6b7280;margin-top:2px}
.actions{max-width:900px;margin:16px auto 0;display:flex;gap:10px}
.btn{border:1px solid #d1d5db;background:#fff;color:#111;font-size:13px;padding:8px 14px;border-radius:8px;cursor:pointer}
.btn.primary{border-color:#0ea5e9;background:#0ea5e9;color:#fff}
.allergy{display:inline-block;background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;margin-right:4px}
@media print{body{background:#fff}.actions{display:none!important}.sheet{margin:0;border:none}@page{size:A4;margin:8mm}}
</style></head><body>
<div class="actions"><button class="btn primary" onclick="window.print()">Print / Save as PDF</button><button class="btn" onclick="window.close()">Close</button></div>
<main class="sheet">
<div class="hdr"><div><h1>${hospName}</h1><div class="sub">${esc(hospAddr)}</div></div><div class="right"><strong>Patient Report</strong><br/>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div>

<div class="section"><h2>Patient Information</h2>
<div class="grid3">
<div class="field"><div class="lbl">Full Name</div><div class="val">${esc(p.full_name)}</div></div>
<div class="field"><div class="lbl">Patient ID</div><div class="val">${esc(p.patient_id_number || '—')}</div></div>
<div class="field"><div class="lbl">Gender / Age</div><div class="val" style="text-transform:capitalize">${esc(p.gender || '—')} / ${age}</div></div>
<div class="field"><div class="lbl">Blood Group</div><div class="val">${esc(p.blood_group || '—')}</div></div>
<div class="field"><div class="lbl">Phone</div><div class="val">${esc(p.phone || '—')}</div></div>
<div class="field"><div class="lbl">Email</div><div class="val">${esc(p.email || '—')}</div></div>
<div class="field"><div class="lbl">DOB</div><div class="val">${p.date_of_birth ? esc(formatDate(p.date_of_birth)) : '—'}</div></div>
<div class="field"><div class="lbl">Address</div><div class="val">${esc([p.address, p.city].filter(Boolean).join(', ') || '—')}</div></div>
<div class="field"><div class="lbl">Allergies</div><div class="val">${(p.allergies||[]).length > 0 ? (p.allergies||[]).map((a:string) => `<span class="allergy">${esc(a)}</span>`).join('') : 'None'}</div></div>
</div>
${p.emergency_contact_name ? `<div style="margin-top:8px" class="grid2"><div class="field"><div class="lbl">Emergency Contact</div><div class="val">${esc(p.emergency_contact_name)} — ${esc(p.emergency_contact_phone||'')}</div></div></div>` : ''}
</div>

<div class="section"><h2>Billing Summary</h2>
<div class="summary-box">
<div class="sbox"><div class="sv">${toINR(bs.totalBilled)}</div><div class="sl">Total Billed</div></div>
<div class="sbox"><div class="sv">${toINR(bs.totalPaid)}</div><div class="sl">Total Paid</div></div>
<div class="sbox warn"><div class="sv">${toINR(bs.balanceDue)}</div><div class="sl">Balance Due</div></div>
<div class="sbox"><div class="sv">${bs.invoiceCount}</div><div class="sl">Bills</div></div>
</div>
</div>

<div class="section"><h2>Visit History (${(data.visits||[]).length})</h2><table><thead><tr><th>#</th><th>Date</th><th>Doctor</th><th>Complaint</th><th>Diagnosis</th><th>Status</th></tr></thead><tbody>${visitRows}</tbody></table></div>
<div class="section"><h2>Treatments (${(data.treatments||[]).length})</h2><table><thead><tr><th>#</th><th>Treatment</th><th>Tooth</th><th>Doctor</th><th>Cost</th><th>Status</th></tr></thead><tbody>${treatRows}</tbody></table></div>
<div class="section"><h2>Bills (${(data.invoices||[]).length})</h2><table><thead><tr><th>#</th><th>Bill No</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th></tr></thead><tbody>${billRows}</tbody></table></div>
<div class="section"><h2>Prescriptions (${(data.prescriptions||[]).length})</h2><table><thead><tr><th>#</th><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th></tr></thead><tbody>${rxRows}</tbody></table></div>
<div class="section" style="margin-top:14px;color:#6b7280;font-size:11px">Generated on ${new Date().toLocaleString('en-IN')} • ${hospName} • Confidential Patient Record</div>
</main></body></html>`

    // Use Blob URL instead of window.open('') to avoid popup blockers
    // and the noopener/noreferrer issue that kills document.write()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const popup = window.open(url, '_blank')
    if (!popup) {
        // Fallback: navigate current tab if popup blocked
        window.location.href = url
    }
    // Clean up blob URL after a delay to allow the page to load
    setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export default function PatientFullProfile({ data }: Props) {
    const p = data.patient
    const h = data.hospital
    const bs = data.billingSummary

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-3xl mx-auto space-y-4">

                {/* Header + Download */}
                <Card className="shadow-xl border-border/50">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{p.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{p.patient_id_number || 'N/A'}</p>
                        {h?.name && <p className="text-xs text-muted-foreground mt-1">{h.name}</p>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {p.gender && <InfoBox label="Gender" value={p.gender} capitalize />}
                            {p.age != null && <InfoBox label="Age" value={`${p.age} years`} />}
                            {p.blood_group && <InfoBox label="Blood Group" value={p.blood_group} icon={<Droplets className="w-3 h-3 text-red-500" />} />}
                            {p.date_of_birth && <InfoBox label="DOB" value={formatDate(p.date_of_birth)} icon={<Calendar className="w-3 h-3 text-muted-foreground" />} />}
                            {p.phone && <InfoBox label="Phone" value={p.phone} />}
                            {p.email && <InfoBox label="Email" value={p.email} />}
                        </div>

                        {p.allergies && p.allergies.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Allergies</p>
                                <div className="flex flex-wrap gap-1.5">{p.allergies.map((a: string) => <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>)}</div>
                            </div>
                        )}

                        {p.emergency_contact_name && (
                            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Emergency Contact</p>
                                <p className="text-sm font-medium">{p.emergency_contact_name}</p>
                                {p.emergency_contact_phone && <p className="text-sm text-muted-foreground">{p.emergency_contact_phone}</p>}
                            </div>
                        )}

                        {data.nextAppointment && (
                            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Upcoming Appointment</p>
                                <p className="text-sm font-medium">{formatDate(data.nextAppointment.appointment_date)} {data.nextAppointment.appointment_time ? `at ${data.nextAppointment.appointment_time}` : ''}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{data.nextAppointment.reason || 'Dental Appointment'}{data.nextAppointment.doctors?.full_name ? ` • Dr. ${data.nextAppointment.doctors.full_name}` : ''}</p>
                            </div>
                        )}

                        <Button onClick={() => openPrintPreview(data)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <Download className="w-4 h-4 mr-2" /> Download Full Report (PDF)
                        </Button>
                    </CardContent>
                </Card>

                {/* Billing Summary */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-green-600" /> Payment Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <SummaryBox label="Total Billed" value={formatCurrency(bs.totalBilled)} color="text-foreground" />
                            <SummaryBox label="Paid" value={formatCurrency(bs.totalPaid)} color="text-green-600" />
                            <SummaryBox label="Balance Due" value={formatCurrency(bs.balanceDue)} color={bs.balanceDue > 0 ? "text-red-600" : "text-green-600"} />
                            <SummaryBox label="Bills" value={String(bs.invoiceCount)} color="text-foreground" />
                        </div>
                    </CardContent>
                </Card>

                {/* Visit History */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="w-4 h-4 text-blue-600" /> Visit History ({data.visits.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {data.visits.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6 text-sm">No visits recorded</p>
                        ) : (
                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                {data.visits.map((v: any) => (
                                    <div key={v.id} className="px-4 py-3 hover:bg-muted/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{formatDate(v.visit_date)}</span>
                                            <Badge variant="secondary" className={`text-xs capitalize ${STATUS_COLORS[v.status] || ''}`}>{(v.status || '').replace('_', ' ')}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Dr. {v.doctors?.full_name || '—'}</p>
                                        {v.chief_complaint && <p className="text-sm mt-1"><span className="text-muted-foreground">Complaint:</span> {v.chief_complaint}</p>}
                                        {v.diagnosis && <p className="text-sm"><span className="text-muted-foreground">Diagnosis:</span> {v.diagnosis}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Treatments */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-600" /> Treatments ({data.treatments.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {data.treatments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6 text-sm">No treatments recorded</p>
                        ) : (
                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                {data.treatments.map((t: any) => (
                                    <div key={t.id} className="px-4 py-3 hover:bg-muted/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold">{t.treatment_type}</span>
                                            <Badge variant="secondary" className={`text-xs capitalize ${STATUS_COLORS[t.status] || ''}`}>{(t.status || '').replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {t.tooth_number && <span>Tooth #{t.tooth_number}</span>}
                                            <span>Dr. {t.doctors?.full_name || '—'}</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(t.actual_cost || t.estimated_cost || 0)}</span>
                                        </div>
                                        {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bills */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-amber-600" /> Bills ({data.invoices.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {data.invoices.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6 text-sm">No bills found</p>
                        ) : (
                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                {data.invoices.map((inv: any) => {
                                    const items = safeItems(inv.items)
                                    return (
                                        <div key={inv.id} className="px-4 py-3 hover:bg-muted/30">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-mono text-muted-foreground">{inv.invoice_number}</span>
                                                <Badge variant="secondary" className={`text-xs capitalize ${STATUS_COLORS[inv.payment_status] || ''}`}>{inv.payment_status}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{items.map(i => i.description).join(', ') || '—'}</span>
                                                <span className="text-sm font-bold">{formatCurrency(inv.total)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(inv.created_at)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Prescriptions */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="w-4 h-4 text-teal-600" /> Prescriptions ({data.prescriptions.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {data.prescriptions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6 text-sm">No prescriptions found</p>
                        ) : (
                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                {data.prescriptions.map((rx: any) => (
                                    <div key={rx.id} className="px-4 py-3 hover:bg-muted/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{formatDate(rx.created_at)}</span>
                                            <span className="text-xs text-muted-foreground">Dr. {rx.doctors?.full_name || '—'}</span>
                                        </div>
                                        {rx.diagnosis && <p className="text-sm"><span className="text-muted-foreground">Diagnosis:</span> {rx.diagnosis}</p>}
                                        {rx.medicines && rx.medicines.length > 0 && (
                                            <div className="mt-1 space-y-0.5">
                                                {rx.medicines.map((m: any, i: number) => (
                                                    <p key={i} className="text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">{m.name}</span> — {m.dosage}, {m.frequency}, {m.duration}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Download button bottom */}
                <Button onClick={() => openPrintPreview(data)} variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" /> Print / Download Full Report
                </Button>
            </div>
        </div>
    )
}

function InfoBox({ label, value, icon, capitalize }: { label: string; value: string; icon?: React.ReactNode; capitalize?: boolean }) {
    return (
        <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1">
                {icon}
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className={`text-sm font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
        </div>
    )
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="p-3 rounded-xl bg-muted/50 text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{label}</p>
        </div>
    )
}
