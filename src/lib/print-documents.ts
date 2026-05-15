/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PRINT DOCUMENT GENERATORS
// Shared utility for Dental Rx, Discharge Chart, and Hospital Bill
// All branding comes from the hospital object (multi-tenant SaaS)
// =============================================================================

import type { Hospital, Doctor, Patient } from '@/types/database'

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const inr = (amount: unknown) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(d))
}

const fmtDateTime = (d: string | Date | null | undefined) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(d))
}

function openPrintWindow(html: string, _title: string) {
  if (typeof window === 'undefined') return

  // Clean up any leftover frame from previous print
  const existingFrame = document.getElementById('__print_frame') as HTMLIFrameElement | null
  if (existingFrame) existingFrame.remove()
  const existingOverlay = document.getElementById('__print_overlay')
  if (existingOverlay) existingOverlay.remove()

  // Create a backdrop overlay with a visible close button so users can always dismiss
  const overlay = document.createElement('div')
  overlay.id = '__print_overlay'
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998;background:rgba(0,0,0,0.3);'
  const closeOverlayBtn = document.createElement('button')
  closeOverlayBtn.textContent = '✕ Close Preview'
  closeOverlayBtn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:100001;background:#111;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);'
  closeOverlayBtn.onclick = () => { iframe.remove(); overlay.remove() }
  overlay.appendChild(closeOverlayBtn)
  document.body.appendChild(overlay)

  const iframe = document.createElement('iframe')
  iframe.id = '__print_frame'
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;border:none;background:#fff;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) { iframe.remove(); overlay.remove(); return }

  doc.open()
  doc.write(html)
  doc.close()

  const cleanup = () => { iframe.remove(); overlay.remove() }

  // Replace "Close" button behavior inside the iframe
  iframe.contentWindow?.addEventListener('load', () => {
    const closeBtn = doc.querySelector('.btn:not(.primary)') as HTMLButtonElement | null
    if (closeBtn) closeBtn.onclick = cleanup
  })

  // Auto-cleanup after printing
  iframe.contentWindow?.addEventListener('afterprint', cleanup)

  // Escape key to close
  iframe.contentWindow?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') cleanup()
  })
  // Also listen on parent window for Escape
  const parentEscHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { cleanup(); window.removeEventListener('keydown', parentEscHandler) }
  }
  window.addEventListener('keydown', parentEscHandler)
}

function hospitalAddress(h: Hospital | null) {
  return [h?.address, h?.city, h?.state, h?.pincode].filter(Boolean).join(', ')
}

// =============================================================================
// 1. DENTAL PRESCRIPTION (Rx)
// =============================================================================
export function printDentalRx(opts: {
  hospital: Hospital | null
  doctor: Doctor | null
  patient: Patient | null
  prescription: {
    created_at: string
    symptoms?: string[]
    examinations?: string[]
    medicines?: any[]
    advices?: string[]
    lab_investigation?: string[]
    follow_up?: string | null
    consultation_type?: string | null
  }
}) {
  const { hospital: h, doctor: d, patient: p, prescription: rx } = opts
  const sinceYear = h?.since_year ? `Since ${h.since_year}` : ''
  const taglines = (h?.taglines || []).map(t => `<div style="font-size:12px;font-weight:600;color:#374151;">${esc(t)}</div>`).join('')
  const qualifications = d?.qualification || ''
  const logoUrl = h?.logo_url || ''
  const addr = hospitalAddress(h)
  const groupName = h?.institute_group_name || ''

  const numberedList = (items: string[] | undefined, label: string) => {
    if (!items?.length) return ''
    const rows = items.map((item, i) => `<div>${i + 1}. ${esc(item)}</div>`).join('')
    return `<div class="rx-section"><div class="rx-label">${esc(label)}:</div>${rows}</div>`
  }

  const medsTable = (meds: any[]) => {
    if (!meds?.length) return ''
    const rows = meds.map((m, i) => {
      const nameStr = [
        m.form || 'Tab',
        m.name || '',
        m.generic_name ? `(${m.generic_name}${m.dosage ? ', ' + m.dosage : ''})` : (m.dosage ? `(${m.dosage})` : ''),
      ].filter(Boolean).join(' ')
      return `<tr>
        <td>${i + 1}</td>
        <td>${esc(nameStr)}</td>
        <td>${esc(m.quantity || '—')}</td>
        <td>${esc(m.schedule || '—')}</td>
        <td>${esc(m.timing || '—')}</td>
        <td>${esc(m.duration || '—')}</td>
      </tr>`
    }).join('')
    return `<div class="rx-section">
      <div class="rx-label">Medication (Rx):</div>
      <table class="med-table">
        <thead><tr><th>Sr</th><th>Medicine Name</th><th>Qty</th><th>Schedule</th><th>Timing</th><th>Duration</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
  }

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Prescription – ${esc(p?.full_name || 'Patient')}</title>
<style>
:root{color-scheme:light}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,sans-serif;color:#111;background:#f5f5f5}
.page{max-width:820px;margin:12px auto;background:#fff;border:1px solid #ddd;overflow:hidden}

/* ── Fancy Teal Wave Banner ── */
.wave-banner{position:relative;height:100px;background:linear-gradient(135deg,#0e7490 0%,#14b8a6 40%,#0d9488 70%,#0e7490 100%);overflow:hidden}
.wave-banner::before{content:'';position:absolute;top:-60px;right:-80px;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,0.06)}
.wave-banner::after{content:'';position:absolute;bottom:-30px;left:0;right:0;height:50px;background:#fff;border-radius:50% 50% 0 0 / 100% 100% 0 0}
.wave-inner{position:absolute;bottom:-20px;left:0;right:0;height:40px;background:linear-gradient(90deg,rgba(13,148,136,0.4),rgba(20,184,166,0.2),rgba(13,148,136,0.4));border-radius:50% 50% 0 0 / 100% 100% 0 0;z-index:1}
.wave-accent{position:absolute;top:0;left:-100px;width:600px;height:200px;border-radius:0 0 50% 0;background:linear-gradient(180deg,rgba(255,255,255,0.1) 0%,transparent 100%)}

/* ── Medical Cross Icon ── */
.cross-icon{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);z-index:3;width:40px;height:40px;background:#fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center}
.cross-icon svg{width:22px;height:22px}

/* ── Hospital Info Below Wave ── */
.hdr-info{text-align:center;padding:28px 24px 14px;border-bottom:2px solid #e5e7eb}
.hdr-info-flex{display:flex;align-items:center;justify-content:center;gap:16px}
.hdr-logo{width:70px;height:70px;object-fit:contain;border-radius:8px}
.hdr-logo-placeholder{width:70px;height:70px;border-radius:8px;background:linear-gradient(135deg,#0e7490,#14b8a6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:26px}
.hospital-name{font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;color:#0e7490}
.group-name{font-size:13px;font-weight:700;color:#374151;margin-top:2px}
.hdr-addr{font-size:11.5px;color:#4b5563;margin-top:4px;line-height:1.5}
.since-badge{display:inline-block;margin-top:4px;font-size:10px;font-weight:700;color:#fff;background:#0e7490;padding:2px 10px;border-radius:10px;letter-spacing:.04em}

.patient-bar{display:grid;grid-template-columns:1fr 1fr;gap:3px 20px;padding:10px 24px;font-size:12px;border-bottom:1px solid #d1d5db}
.patient-bar span{color:#6b7280}
.patient-bar strong{color:#111;font-weight:600}
.divider{height:1px;background:#d1d5db;margin:0 24px}
.rx-body{padding:16px 24px 24px;min-height:320px}
.rx-section{margin-bottom:14px}
.rx-label{font-weight:700;font-size:13px;margin-bottom:3px;color:#0e7490}
.rx-section div:not(.rx-label){font-size:12.5px;line-height:1.7;color:#1f2937;padding-left:4px}
table.med-table{width:100%;border-collapse:collapse;margin-top:4px}
table.med-table th,table.med-table td{border:1px solid #d1d5db;padding:6px 8px;text-align:left;font-size:12px}
table.med-table th{background:linear-gradient(135deg,#f0fdfa,#ecfeff);font-size:11px;text-transform:uppercase;font-weight:700;color:#0e7490}
table.med-table td:first-child{width:30px;text-align:center}
.dr-sign{text-align:right;margin-top:40px;padding:0 24px 20px}
.dr-sign .name{font-weight:700;font-size:14px;color:#0e7490}
.dr-sign .qual{font-size:11px;color:#374151;line-height:1.5}
.actions{max-width:820px;margin:10px auto;display:flex;gap:8px}
.btn{border:1px solid #d1d5db;background:#fff;color:#111;font-size:13px;padding:7px 14px;border-radius:8px;cursor:pointer}
.btn.primary{background:linear-gradient(135deg,#0e7490,#14b8a6);color:#fff;border-color:#0e7490}
@media print{
  body{background:#fff}.page{margin:0;border:none;box-shadow:none}
  .actions{display:none!important}
  @page{size:A4;margin:8mm}
}
</style></head><body>
<div class="actions">
  <button class="btn primary" onclick="window.print()">Print / Save as PDF</button>
  <button class="btn" id="closeBtn">Close</button>
</div>
<div class="page">
  <!-- Teal Wave Banner -->
  <div class="wave-banner">
    <div class="wave-accent"></div>
    <div class="wave-inner"></div>
    <div class="cross-icon">
      <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="20" rx="1.5" fill="#0e7490"/><rect x="2" y="9" width="20" height="6" rx="1.5" fill="#0e7490"/></svg>
    </div>
  </div>
  <!-- Hospital Info -->
  <div class="hdr-info">
    <div class="hdr-info-flex">
      ${logoUrl ? `<img class="hdr-logo" src="${esc(logoUrl)}" alt="Logo">` : ''}
      <div>
        <div class="hospital-name">${esc(h?.name || 'Clinic')}</div>
        ${groupName ? `<div class="group-name">(${esc(groupName)})</div>` : ''}
        ${taglines}
      </div>
    </div>
    <div class="hdr-addr">${esc(addr)}${h?.phone ? ` | Mob. No : ${esc(h.phone)}` : ''}</div>
    ${sinceYear ? `<div class="since-badge">${esc(sinceYear)}</div>` : ''}
  </div>
  <div class="patient-bar">
    <div><span>Patient Name & Patient id: </span><strong>${esc(p?.full_name || '—')}, ${esc(p?.patient_id_number || '—')}</strong></div>
    <div><span>Date & Time: </span><strong>${fmtDateTime(rx.created_at)}</strong></div>
    <div><span>Age/Gender: </span><strong>${esc(p?.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000) + 'y' : '—')}, ${esc(p?.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '—')}</strong></div>
    <div><span>Mobile No: </span><strong>${esc(p?.phone || '—')}</strong></div>
    <div><span>Height/Weight: </span><strong>${esc(p?.height || '-')} / ${esc(p?.weight || '-')}</strong></div>
    <div><span>Blood Group: </span><strong>${esc(p?.blood_group || '-')}</strong></div>
    <div><span>Address: </span><strong>${esc(p?.address || '-')}</strong></div>
    <div><span>Consultation Type: </span><strong>${esc(rx.consultation_type || '-')}</strong></div>
  </div>
  <div class="divider"></div>
  <div class="rx-body">
    ${numberedList(rx.symptoms, 'Symptoms')}
    ${numberedList(rx.examinations, 'Examinations')}
    ${medsTable(rx.medicines || [])}
    ${numberedList(rx.advices, 'Advices')}
    ${numberedList(rx.lab_investigation, 'Lab Investigation')}
    ${rx.follow_up ? `<div class="rx-section"><div class="rx-label">Follow-up:</div><div>${esc(rx.follow_up)}</div></div>` : ''}
  </div>
  <div class="dr-sign">
    <div class="name">${esc(d?.full_name || 'Doctor')}</div>
    <div class="qual">${esc(qualifications).replace(/,/g, '<br>')}</div>
    <div class="qual">Reg. No. ${esc(d?.license_number || '')}</div>
  </div>
</div></body></html>`

  openPrintWindow(html, `Prescription – ${p?.full_name || 'Patient'}`)
}


// =============================================================================
// 2. DISCHARGE MEDICATION CHART
// =============================================================================
export function printDischargeChart(opts: {
  hospital: Hospital | null
  doctor: Doctor | null
  patient: Patient | null
  chart: {
    note_text?: string | null
    medications: { sr: number; medicine_name: string; frequency: string; doses: string; days: number; qty: string }[]
  }
}) {
  const { hospital: h, doctor: d, patient: p, chart } = opts
  const primaryColor = h?.primary_color || '#0e7490'
  const emergencyPhone = h?.emergency_phone || h?.phone || ''

  const medRows = chart.medications.length > 0
    ? chart.medications.map((m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(m.medicine_name)}</td>
          <td class="freq">${esc(m.frequency)}</td>
          <td>${esc(m.doses)}</td>
          <td>${m.days}</td>
          <td>${esc(m.qty)}</td>
        </tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:#888;">No medications listed.</td></tr>'

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Discharge Chart – ${esc(p?.full_name || 'Patient')}</title>
<style>
:root{color-scheme:light}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,sans-serif;color:#111;background:#f5f5f5}
.page{max-width:820px;margin:12px auto;background:#fff;border:1px solid #ddd;padding:28px 32px}
.note-section{margin-bottom:20px}
.note-label{font-weight:700;font-size:14px;margin-bottom:4px}
.note-text{font-size:13px;color:#374151;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;min-height:32px;white-space:pre-wrap}
.rx-title{font-weight:800;font-size:16px;margin-bottom:8px;color:${primaryColor}}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th,td{border:1px solid #111;padding:8px 10px;text-align:left;font-size:13px}
th{background:#f3f4f6;font-size:12px;text-transform:uppercase;font-weight:700}
.freq{min-width:180px}
.sig-area{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;padding-top:16px}
.sig-left{text-align:center;min-width:200px}
.sig-right{text-align:center;min-width:240px}
.sig-line{border-top:1px solid #111;padding-top:6px;font-size:12px;color:#374151}
.dr-block{text-align:center;font-size:12px;line-height:1.6}
.dr-block .name{font-weight:700;font-size:14px}
.emergency{margin-top:16px;font-size:12px;font-weight:700;color:#111}
.disclaimer{margin-top:12px;font-size:11px;color:#374151;font-style:italic}
.actions{max-width:820px;margin:10px auto;display:flex;gap:8px}
.btn{border:1px solid #d1d5db;background:#fff;color:#111;font-size:13px;padding:7px 14px;border-radius:8px;cursor:pointer}
.btn.primary{background:${primaryColor};color:#fff;border-color:${primaryColor}}
@media print{
  body{background:#fff}.page{margin:0;border:none;padding:20px}
  .actions{display:none!important}
  @page{size:A4;margin:10mm}
}
</style></head><body>
<div class="actions">
  <button class="btn primary" onclick="window.print()">Print / Save as PDF</button>
  <button class="btn" onclick="window.close()">Close</button>
</div>
<div class="page">
  <div class="note-section">
    <div class="note-label">Note</div>
    <div class="note-text">${esc(chart.note_text || '')}</div>
  </div>
  <div class="rx-title">Rx</div>
  <table>
    <thead>
      <tr><th>Sr</th><th>Medicine Name</th><th>Frequency</th><th>Doses</th><th>Days</th><th>Qty</th></tr>
    </thead>
    <tbody>${medRows}</tbody>
  </table>
  <div class="disclaimer">I have understood the instructions given about the medication dosage and post-discharge care.</div>
  <div class="emergency">IN CASE OF EMERGENCY CONTACT No.: ${esc(emergencyPhone)}</div>
  <div class="sig-area">
    <div class="sig-left">
      <div class="sig-line">(Patient/Relative Signature)</div>
    </div>
    <div class="sig-right">
      <div class="dr-block">
        <div class="name">${esc(d?.full_name || 'Doctor')}</div>
        <div>${esc(d?.qualification || '')}</div>
        <div>Reg. No. ${esc(d?.license_number || '')}</div>
        <div>${esc(h?.name || '')}</div>
      </div>
    </div>
  </div>
</div></body></html>`

  openPrintWindow(html, `Discharge Chart – ${p?.full_name || 'Patient'}`)
}


// =============================================================================
// 3. HOSPITAL BILL
// =============================================================================
export function printHospitalBill(opts: {
  hospital: Hospital | null
  doctor: Doctor | null
  patient: Patient | null
  invoice: {
    invoice_number: string
    created_at: string
    items: { description: string; quantity: number; unit_price: number; total: number }[]
    subtotal: number
    tax: number
    discount: number
    total: number
    payment_status?: string
    payment_mode?: string | null
    admission_date?: string | null
    discharge_date?: string | null
    uhid?: string | null
  }
}) {
  const { hospital: h, doctor: d, patient: p, invoice: inv } = opts
  const addr = hospitalAddress(h)
  const logoUrl = h?.logo_url || ''
  const groupName = h?.institute_group_name || ''

  const itemRows = inv.items.length > 0
    ? inv.items.map((it, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(it.description)}</td>
          <td>${it.quantity}</td>
          <td>${inr(it.unit_price)}</td>
          <td>${inr(it.total)}</td>
        </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#888">No items</td></tr>'

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Hospital Bill – ${esc(inv.invoice_number)}</title>
<style>
:root{color-scheme:light}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,sans-serif;color:#111;background:#f5f5f5}
.page{max-width:820px;margin:12px auto;background:#fff;border:1px solid #ddd}
.bill-header{display:flex;align-items:center;padding:18px 28px;gap:16px;border-bottom:1px solid #e5e7eb}
.bill-logo{width:72px;height:72px;object-fit:contain}
.bill-logo-ph{width:72px;height:72px;border-radius:8px;background:#111;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:24px}
.bill-hdr-text{flex:1;text-align:center}
.bill-hdr-text h1{font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:.02em}
.bill-hdr-text .group{font-size:12px;font-weight:600;color:#374151;margin-top:2px}
.bill-hdr-text .addr{font-size:11px;color:#6b7280;margin-top:4px}
.bill-title{background:#111;color:#fff;text-align:center;font-size:18px;font-weight:800;padding:8px;letter-spacing:.06em}
.info-grid{display:grid;grid-template-columns:1fr 1fr;padding:14px 28px;gap:6px;font-size:12.5px;border-bottom:1px solid #e5e7eb}
.info-grid .lbl{color:#374151;font-weight:600}
.info-grid .val{color:#111}
table.items{width:calc(100% - 56px);margin:14px 28px;border-collapse:collapse}
table.items th,table.items td{border:1px solid #d1d5db;padding:8px 10px;font-size:12.5px;text-align:left}
table.items th{background:#f3f4f6;font-size:11px;text-transform:uppercase;font-weight:700}
.totals{margin:0 28px 14px auto;width:280px;border:1px solid #d1d5db;border-radius:6px;overflow:hidden}
.totals .row{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px}
.totals .row:last-child{border:none;font-weight:800;font-size:14px;background:#f0fdf4}
.payment-mode{padding:6px 28px 16px;font-size:12px;color:#374151}
.actions{max-width:820px;margin:10px auto;display:flex;gap:8px}
.btn{border:1px solid #d1d5db;background:#fff;color:#111;font-size:13px;padding:7px 14px;border-radius:8px;cursor:pointer}
.btn.primary{background:#111;color:#fff;border-color:#111}
@media print{
  body{background:#fff}.page{margin:0;border:none}
  .actions{display:none!important}
  @page{size:A4;margin:10mm}
}
</style></head><body>
<div class="actions">
  <button class="btn primary" onclick="window.print()">Print / Save as PDF</button>
  <button class="btn" onclick="window.close()">Close</button>
</div>
<div class="page">
  <div class="bill-header">
    ${logoUrl ? `<img class="bill-logo" src="${esc(logoUrl)}" alt="Logo">` : `<div class="bill-logo-ph">${esc((h?.name || 'H')[0])}</div>`}
    <div class="bill-hdr-text">
      <h1>${esc(h?.name || 'Hospital')}</h1>
      ${groupName ? `<div class="group">(${esc(groupName)})</div>` : ''}
      <div class="addr">${esc(addr)}${h?.phone ? `, Mob. No: ${esc(h.phone)}` : ''}</div>
    </div>
  </div>
  <div class="bill-title">HOSPITAL BILL</div>
  <div class="info-grid">
    <div><span class="lbl">Bill No.: </span><span class="val">${esc(inv.invoice_number)}</span></div>
    <div><span class="lbl">Bill Date: </span><span class="val">${fmtDate(inv.created_at)}</span></div>
    <div><span class="lbl">Name: </span><span class="val">${esc(p?.full_name || '—')}</span></div>
    <div><span class="lbl">Age/Sex: </span><span class="val">${esc(p?.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000) + ' yrs' : '—')} / ${esc(p?.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '—')}</span></div>
    <div><span class="lbl">DOA: </span><span class="val">${fmtDateTime(inv.admission_date)}</span></div>
    <div><span class="lbl">DOD: </span><span class="val">${fmtDateTime(inv.discharge_date)}</span></div>
    <div><span class="lbl">Doctor: </span><span class="val">${esc(d?.full_name || '—')}</span></div>
    <div><span class="lbl">UHID: </span><span class="val">${esc(inv.uhid || '—')}</span></div>
    <div><span class="lbl">Address: </span><span class="val">${esc(p?.address || '—')}</span></div>
    <div></div>
  </div>
  <table class="items">
    <thead><tr><th style="width:40px">Sr</th><th>Description</th><th style="width:60px">Qty</th><th style="width:100px">Rate</th><th style="width:110px">Amount</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${inr(inv.subtotal)}</span></div>
    ${inv.discount ? `<div class="row"><span>Discount</span><span>- ${inr(inv.discount)}</span></div>` : ''}
    ${inv.tax ? `<div class="row"><span>GST / Tax</span><span>${inr(inv.tax)}</span></div>` : ''}
    <div class="row"><span>Grand Total</span><span>${inr(inv.total)}</span></div>
  </div>
  ${inv.payment_mode ? `<div class="payment-mode"><strong>Payment Mode:</strong> ${esc(inv.payment_mode)}</div>` : ''}
</div></body></html>`

  openPrintWindow(html, `Hospital Bill – ${inv.invoice_number}`)
}
