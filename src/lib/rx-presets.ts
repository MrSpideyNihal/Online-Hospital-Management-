// =============================================================================
// SHARED Rx FREQUENCY / SCHEDULE / TIMING PRESETS
// Used by both Prescription and Discharge forms.
// Language is set per-clinic in Settings → Branding → "Prescription Language"
// Stored in hospitals.rx_frequency_language ('english' | 'hindi' | 'marathi')
// =============================================================================

export type RxLang = 'english' | 'hindi' | 'marathi'

export const RX_LANGUAGES: { value: RxLang; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी (Hindi)' },
    { value: 'marathi', label: 'मराठी (Marathi)' },
]

// ── Schedule presets (Morning-Afternoon-Night pattern) ──
export const SCHEDULE_PRESETS: Record<RxLang, { value: string; label: string }[]> = {
    english: [
        { value: '1-0-1', label: '1-0-1 (Morning & Night)' },
        { value: '1-1-1', label: '1-1-1 (Thrice daily)' },
        { value: '1-0-0', label: '1-0-0 (Morning only)' },
        { value: '0-0-1', label: '0-0-1 (Night only)' },
        { value: '0-1-0', label: '0-1-0 (Afternoon only)' },
        { value: '1-1-0', label: '1-1-0 (Morning & Afternoon)' },
        { value: '0-1-1', label: '0-1-1 (Afternoon & Night)' },
        { value: 'SOS', label: 'SOS (As needed)' },
    ],
    hindi: [
        { value: 'सुबह-रात (1-0-1)', label: 'सुबह-रात (1-0-1)' },
        { value: 'सुबह-दोपहर-रात (1-1-1)', label: 'सुबह-दोपहर-रात (1-1-1)' },
        { value: 'सुबह (1-0-0)', label: 'केवल सुबह (1-0-0)' },
        { value: 'रात (0-0-1)', label: 'केवल रात (0-0-1)' },
        { value: 'दोपहर (0-1-0)', label: 'केवल दोपहर (0-1-0)' },
        { value: 'सुबह-दोपहर (1-1-0)', label: 'सुबह-दोपहर (1-1-0)' },
        { value: 'दोपहर-रात (0-1-1)', label: 'दोपहर-रात (0-1-1)' },
        { value: 'जरूरत अनुसार', label: 'जरूरत अनुसार (SOS)' },
    ],
    marathi: [
        { value: 'सकाळ-रात्री (1-0-1)', label: 'सकाळ-रात्री (1-0-1)' },
        { value: 'सकाळ-दुपार-रात्री (1-1-1)', label: 'सकाळ-दुपार-रात्री (1-1-1)' },
        { value: 'सकाळी (1-0-0)', label: 'फक्त सकाळी (1-0-0)' },
        { value: 'रात्री (0-0-1)', label: 'फक्त रात्री (0-0-1)' },
        { value: 'दुपारी (0-1-0)', label: 'फक्त दुपारी (0-1-0)' },
        { value: 'सकाळ-दुपार (1-1-0)', label: 'सकाळ-दुपार (1-1-0)' },
        { value: 'दुपार-रात्री (0-1-1)', label: 'दुपार-रात्री (0-1-1)' },
        { value: 'गरज असल्यास', label: 'गरज असल्यास (SOS)' },
    ],
}

// ── Timing presets (Before/After food) ──
export const TIMING_PRESETS: Record<RxLang, { value: string; label: string }[]> = {
    english: [
        { value: 'After Food', label: 'After Food' },
        { value: 'Before Food', label: 'Before Food' },
        { value: 'With Food', label: 'With Food' },
        { value: 'Empty Stomach', label: 'Empty Stomach' },
    ],
    hindi: [
        { value: 'खाने के बाद', label: 'खाने के बाद (After Food)' },
        { value: 'खाने से पहले', label: 'खाने से पहले (Before Food)' },
        { value: 'खाने के साथ', label: 'खाने के साथ (With Food)' },
        { value: 'खाली पेट', label: 'खाली पेट (Empty Stomach)' },
    ],
    marathi: [
        { value: 'जेवणानंतर', label: 'जेवणानंतर (After Food)' },
        { value: 'जेवणाआधी', label: 'जेवणाआधी (Before Food)' },
        { value: 'जेवणासोबत', label: 'जेवणासोबत (With Food)' },
        { value: 'रिकाम्या पोटी', label: 'रिकाम्या पोटी (Empty Stomach)' },
    ],
}

// ── Frequency presets (for Discharge Chart — full sentence) ──
export const FREQUENCY_PRESETS: Record<RxLang, { value: string; label: string }[]> = {
    english: [
        { value: 'Morning and Night After Food', label: 'Morning & Night After Food' },
        { value: 'Morning, Afternoon and Night After Food', label: 'Morning, Afternoon & Night After Food' },
        { value: 'Morning After Food', label: 'Morning After Food' },
        { value: 'Night After Food', label: 'Night After Food' },
        { value: 'Morning Before Food', label: 'Morning Before Food' },
        { value: 'Night Before Food', label: 'Night Before Food' },
        { value: 'As needed', label: 'As Needed (SOS)' },
    ],
    hindi: [
        { value: 'सुबह और रात खाने के बाद', label: 'सुबह और रात खाने के बाद' },
        { value: 'सुबह दोपहर और रात खाने के बाद', label: 'सुबह दोपहर और रात खाने के बाद' },
        { value: 'सुबह खाने के बाद', label: 'सुबह खाने के बाद' },
        { value: 'रात खाने के बाद', label: 'रात खाने के बाद' },
        { value: 'सुबह खाने से पहले', label: 'सुबह खाने से पहले' },
        { value: 'रात खाने से पहले', label: 'रात खाने से पहले' },
        { value: 'जरूरत अनुसार', label: 'जरूरत अनुसार (SOS)' },
    ],
    marathi: [
        { value: 'सकाळी आणि रात्री जेवणानंतर', label: 'सकाळी आणि रात्री जेवणानंतर' },
        { value: 'सकाळी दुपारी आणि रात्री जेवणानंतर', label: 'सकाळी दुपारी आणि रात्री जेवणानंतर' },
        { value: 'सकाळी जेवणानंतर', label: 'सकाळी जेवणानंतर' },
        { value: 'रात्री जेवणानंतर', label: 'रात्री जेवणानंतर' },
        { value: 'सकाळी जेवणाआधी', label: 'सकाळी जेवणाआधी' },
        { value: 'रात्री जेवणाआधी', label: 'रात्री जेवणाआधी' },
        { value: 'गरज असल्यास', label: 'गरज असल्यास (SOS)' },
    ],
}
