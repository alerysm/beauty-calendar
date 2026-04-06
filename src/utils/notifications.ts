import { CalendarData, Product } from '../types'
import { toDateStr } from './dateUtils'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendNotification(title: string, body: string, icon = '/icons/icon-192.png') {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon, badge: icon })
}

export function scheduleDailyNotification(
  time: string,
  calendar: CalendarData,
  products: Product[],
  period: 'morning' | 'night',
) {
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) target.setDate(target.getDate() + 1)

  const delay = target.getTime() - now.getTime()

  setTimeout(() => {
    const today = toDateStr(new Date())
    const entry = calendar[today]
    if (!entry) return

    const ids = period === 'morning' ? entry.morning : entry.night
    if (!ids.length) return

    const names = ids
      .map(id => products.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    const emoji = period === 'morning' ? '🌅' : '🌙'
    const label = period === 'morning' ? 'mañana' : 'noche'

    sendNotification(
      `${emoji} Rutina de ${label}`,
      `Hoy debes aplicar: ${names}`,
    )

    // Reschedule for next day
    scheduleDailyNotification(time, calendar, products, period)
  }, delay)
}

export function getNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
