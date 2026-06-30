import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import type { ReturnItem } from '../types'
import { parseLocalDate } from '../types'

const isNative = Capacitor.isNativePlatform()

export async function requestPermission(): Promise<boolean> {
  if (!isNative) {
    // Browser fallback — request Web Notification permission
    if ('Notification' in window) {
      const p = await Notification.requestPermission()
      return p === 'granted'
    }
    return false
  }
  const { display } = await LocalNotifications.requestPermissions()
  return display === 'granted'
}

export async function scheduleReturnNotifications(item: ReturnItem) {
  const deadline = parseLocalDate(item.purchaseDate)
  deadline.setDate(deadline.getDate() + item.returnDays)
  deadline.setHours(9, 0, 0, 0)

  const threeDays = new Date(deadline)
  threeDays.setDate(threeDays.getDate() - 3)

  const oneDay = new Date(deadline)
  oneDay.setDate(oneDay.getDate() - 1)

  const now = new Date()
  const baseId = hashId(item.id)

  if (!isNative) return  // browser can't schedule future notifications

  const { display } = await LocalNotifications.checkPermissions()
  if (display !== 'granted') return

  const notifications = []

  if (threeDays > now) {
    notifications.push({
      id: baseId,
      title: `Return in 3 days — ${item.store}`,
      body: `${item.item} must be returned by ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      schedule: { at: threeDays },
      extra: { itemId: item.id },
    })
  }
  if (oneDay > now) {
    notifications.push({
      id: baseId + 1,
      title: `⚠️ Return tomorrow — ${item.store}`,
      body: `Last chance! Return ${item.item} by tomorrow.`,
      schedule: { at: oneDay },
      extra: { itemId: item.id },
    })
  }
  if (deadline > now) {
    notifications.push({
      id: baseId + 2,
      title: `🚨 Last day to return — ${item.store}`,
      body: `Today is your last day to return: ${item.item}`,
      schedule: { at: deadline },
      extra: { itemId: item.id },
    })
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications })
  }
}

export async function cancelReturnNotifications(itemId: string) {
  if (!isNative) return
  const baseId = hashId(itemId)
  await LocalNotifications.cancel({
    notifications: [{ id: baseId }, { id: baseId + 1 }, { id: baseId + 2 }],
  })
}

// Fires a test notification in 10 seconds — works on native AND browser
export async function sendTestNotification(): Promise<'sent' | 'denied' | 'unsupported'> {
  const fireAt = new Date(Date.now() + 10_000)

  if (isNative) {
    const { display } = await LocalNotifications.requestPermissions()
    if (display !== 'granted') return 'denied'
    await LocalNotifications.schedule({
      notifications: [{
        id: 999999,
        title: '🛍 ReturnIt — Notification Test',
        body: 'Notifications are working! You\'ll get reminders like this before deadlines.',
        schedule: { at: fireAt },
      }],
    })
    return 'sent'
  }

  // Browser fallback
  if (!('Notification' in window)) return 'unsupported'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'
  setTimeout(() => {
    new Notification('🛍 ReturnIt — Notification Test', {
      body: "Notifications are working! You'll get reminders like this before deadlines.",
    })
  }, 10_000)
  return 'sent'
}

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2_000_000
}
