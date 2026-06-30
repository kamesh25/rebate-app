export interface ReturnItem {
  id: string
  store: string
  item: string
  purchaseDate: string   // YYYY-MM-DD local date
  returnDays: number
  notes: string
  returned: boolean
  refundAmount?: number  // amount received back when returned
  createdAt: string
  photo?: string
}

export type UrgencyLevel = 'safe' | 'soon' | 'urgent' | 'expired'

export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysLeft(item: ReturnItem): number {
  const deadline = parseLocalDate(item.purchaseDate)
  deadline.setDate(deadline.getDate() + item.returnDays)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)
  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000)
}

export function urgency(item: ReturnItem): UrgencyLevel {
  if (item.returned) return 'safe'
  const d = daysLeft(item)
  if (d < 0) return 'expired'
  if (d <= 2) return 'urgent'
  if (d <= 5) return 'soon'
  return 'safe'
}

export interface RebateItem {
  id: string
  store: string
  item: string
  purchaseDate: string   // YYYY-MM-DD
  mailByDate: string     // YYYY-MM-DD — last day to submit
  rebateAmount: number   // promised dollar amount
  submitted: boolean
  submittedDate?: string
  notes: string
  photo?: string
  createdAt: string
}

export type RebateUrgencyLevel = 'safe' | 'soon' | 'urgent' | 'expired' | 'submitted'

export function rebateDaysLeft(item: RebateItem): number {
  const deadline = parseLocalDate(item.mailByDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)
  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000)
}

export function rebateUrgency(item: RebateItem): RebateUrgencyLevel {
  if (item.submitted) return 'submitted'
  const d = rebateDaysLeft(item)
  if (d < 0) return 'expired'
  if (d <= 2) return 'urgent'
  if (d <= 7) return 'soon'
  return 'safe'
}

export const STORE_POLICIES: { store: string; days: number }[] = [
  { store: 'Amazon', days: 30 },
  { store: 'Walmart', days: 90 },
  { store: 'Target', days: 90 },
  { store: 'Best Buy', days: 15 },
  { store: 'Costco', days: 90 },
  { store: 'Apple', days: 14 },
  { store: 'Home Depot', days: 90 },
  { store: 'Nordstrom', days: 30 },
  { store: "Macy's", days: 90 },
  { store: 'IKEA', days: 365 },
  { store: 'Other', days: 30 },
]
