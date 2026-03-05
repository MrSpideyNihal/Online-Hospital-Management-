import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isSuperAdmin(email: string | undefined) {
  return email === process.env.SUPER_ADMIN_EMAIL || email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
}

const SAFE_REDIRECT_PREFIXES = ['/dashboard', '/patient', '/admin', '/hospitals', '/login']

export function sanitizeRedirectPath(rawPath: string | null | undefined, fallback = '/dashboard') {
  const value = (rawPath || '').trim()
  if (!value) return fallback

  // Only allow local paths and block protocol-relative/escaped variants.
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\n\r\0]/.test(value)) {
    return fallback
  }

  try {
    const parsed = new URL(value, 'https://app.local')
    // Strip nested redirect and stale chunk-fix keys from return paths.
    parsed.searchParams.delete('redirect')
    parsed.searchParams.delete('code')
    parsed.searchParams.delete('__chunkfix')
    parsed.searchParams.delete('__chunkts')
    parsed.searchParams.delete('_rsc')

    const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/'

    if (normalizedPath !== '/') {
      const isAllowed = SAFE_REDIRECT_PREFIXES.some(
        (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
      )
      if (!isAllowed) return fallback
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}

export function escapeCsvCell(value: unknown) {
  const raw = String(value ?? '')
  // Prevent CSV/Excel formula execution when files are opened in spreadsheet apps.
  const safe = /^[=+\-@]/.test(raw.trimStart()) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

export const DENTAL_SERVICES = [
  'General Dentistry',
  'Root Canal Treatment',
  'Dental Implants',
  'Orthodontics (Braces)',
  'Teeth Whitening',
  'Dental Crowns & Bridges',
  'Smile Design',
  'Pediatric Dentistry',
  'Oral Surgery',
  'Periodontics (Gum Treatment)',
  'Endodontics',
  'Prosthodontics',
  'Cosmetic Dentistry',
  'Emergency Dental Care',
  'Dental X-Ray & Diagnostics',
] as const

export const TOOTH_CONDITIONS = [
  { id: 'healthy', label: 'Healthy', color: '#22c55e' },
  { id: 'cavity', label: 'Cavity', color: '#ef4444' },
  { id: 'crown', label: 'Crown', color: '#f59e0b' },
  { id: 'filling', label: 'Filling', color: '#3b82f6' },
  { id: 'missing', label: 'Missing', color: '#6b7280' },
  { id: 'root_canal', label: 'Root Canal', color: '#8b5cf6' },
  { id: 'implant', label: 'Implant', color: '#06b6d4' },
  { id: 'extraction_needed', label: 'Extraction Needed', color: '#dc2626' },
  { id: 'bridge', label: 'Bridge', color: '#d946ef' },
  { id: 'veneer', label: 'Veneer', color: '#14b8a6' },
] as const
