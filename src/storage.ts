import type { ReturnItem, RebateItem } from './types'

const ITEMS_KEY = 'returnit_items'
const REBATES_KEY = 'returnit_rebates'
const SAVINGS_KEY = 'returnit_savings'
const ONBOARDED_KEY = 'returnit_onboarded'

export function loadItems(): ReturnItem[] {
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]') } catch { return [] }
}

export function saveItems(items: ReturnItem[]): boolean {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
    return true
  } catch {
    alert('Storage full — try removing old receipt photos to free up space.')
    return false
  }
}

export function loadTotalSaved(): number {
  return parseFloat(localStorage.getItem(SAVINGS_KEY) ?? '0')
}

export function addSavings(amount: number) {
  const current = loadTotalSaved()
  localStorage.setItem(SAVINGS_KEY, String(current + amount))
}

export function loadRebates(): RebateItem[] {
  try { return JSON.parse(localStorage.getItem(REBATES_KEY) ?? '[]') } catch { return [] }
}

export function saveRebates(items: RebateItem[]): boolean {
  try {
    localStorage.setItem(REBATES_KEY, JSON.stringify(items))
    return true
  } catch {
    alert('Storage full — try removing old receipt photos to free up space.')
    return false
  }
}

export function isOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === 'yes'
}

export function setOnboarded() {
  localStorage.setItem(ONBOARDED_KEY, 'yes')
}
