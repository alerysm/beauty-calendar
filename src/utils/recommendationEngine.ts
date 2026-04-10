import { Product, ProductSchedule, FrequencyType, CustomRule } from '../types'

// Types that conflict with each other (built-in group)
const CONFLICT_GROUP = ['azelaic_acid', 'retinol', 'dermaplaning', 'aha_bha_pha_mask']

function getDaysNeeded(frequency: FrequencyType): number {
  switch (frequency) {
    case 'daily':    return 7
    case 'weekly_6': return 6
    case 'weekly_5': return 5
    case 'weekly_4': return 4
    case 'weekly_3': return 3
    case 'weekly_2': return 2
    case 'weekly_1': return 1
    case 'biweekly': return 1 // 1 day/week, limited by weeksOfMonth
    case 'monthly':  return 1 // 1 day/week, limited by weeksOfMonth
    case 'as_needed':return 1
  }
}

/** Returns which weeks of the month (0-indexed) a product should be used, or undefined for every week */
function getWeeksOfMonth(frequency: FrequencyType): number[] | undefined {
  if (frequency === 'biweekly') return [0, 2] // weeks 1 & 3 ≈ every 2 weeks
  if (frequency === 'monthly')  return [0]    // week 1 only
  return undefined
}

/** Pick `needed` indices spread evenly across `available` days */
function spreadEvenly(available: number[], needed: number): number[] {
  if (needed <= 0 || available.length === 0) return []
  if (needed >= available.length) return [...available]
  const result: number[] = []
  for (let i = 0; i < needed; i++) {
    const idx = Math.min(Math.floor((i / needed) * available.length), available.length - 1)
    result.push(available[idx])
  }
  return result
}

/**
 * Generate a recommended weekly pattern for the selected products.
 * Returns one ProductSchedule per selected product.
 */
export function generateRecommendation(
  products: Product[],
  selectedProductIds: string[],
  customRules: CustomRule[] = [],
): ProductSchedule[] {
  const selected = products.filter(p => selectedProductIds.includes(p.id))
  const schedules: ProductSchedule[] = []

  // ── 1. Daily products with no built-in conflicts ────────────────────────────
  const dailyFree = selected.filter(
    p => p.frequency === 'daily' && !CONFLICT_GROUP.includes(p.type),
  )
  for (const p of dailyFree) {
    schedules.push({ productId: p.id, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: p.usage })
  }

  // ── 2. Conflict-group products (azelaic, retinol, dermaplaning, mask) ───────
  const conflictSelected = selected.filter(p => CONFLICT_GROUP.includes(p.type))

  // Sort lowest frequency first so most-constrained gets first pick of days
  const freqOrder: FrequencyType[] = [
    'monthly', 'biweekly', 'weekly_1', 'weekly_2', 'weekly_3',
    'weekly_4', 'weekly_5', 'weekly_6', 'as_needed', 'daily',
  ]
  conflictSelected.sort(
    (a, b) => freqOrder.indexOf(a.frequency) - freqOrder.indexOf(b.frequency),
  )

  const usedDays = new Set<number>()
  for (const p of conflictSelected) {
    const available = [0, 1, 2, 3, 4, 5, 6].filter(d => !usedDays.has(d))
    const needed    = getDaysNeeded(p.frequency)
    const assigned  = spreadEvenly(available, Math.min(needed, available.length))
    assigned.forEach(d => usedDays.add(d))
    schedules.push({
      productId: p.id,
      daysOfWeek: assigned,
      time: p.usage,
      weeksOfMonth: getWeeksOfMonth(p.frequency),
    })
  }

  // ── 3. Custom-conflict groups ────────────────────────────────────────────────
  // Build adjacency from custom conflict rules
  const customConflicts = customRules.filter(
    r => r.type === 'conflict' && r.productAId && r.productBId,
  )

  // Remaining selected products not yet scheduled
  const alreadyScheduled = new Set(schedules.map(s => s.productId))
  const remaining = selected.filter(p => !alreadyScheduled.has(p.id))

  // Sort remaining by frequency
  remaining.sort(
    (a, b) => freqOrder.indexOf(a.frequency) - freqOrder.indexOf(b.frequency),
  )

  for (const p of remaining) {
    // Find days blocked by custom conflicts with already-scheduled products
    const conflictingScheduled = schedules.filter(s => {
      return customConflicts.some(
        r =>
          (r.productAId === p.id && r.productBId === s.productId) ||
          (r.productBId === p.id && r.productAId === s.productId),
      )
    })
    const blocked    = new Set(conflictingScheduled.flatMap(s => s.daysOfWeek))
    const available  = [0, 1, 2, 3, 4, 5, 6].filter(d => !blocked.has(d))
    const needed     = getDaysNeeded(p.frequency)
    const assigned   = spreadEvenly(available, Math.min(needed, available.length))
    schedules.push({
      productId: p.id,
      daysOfWeek: assigned,
      time: p.usage,
      weeksOfMonth: getWeeksOfMonth(p.frequency),
    })
  }

  return schedules
}

/**
 * Convert a list of ProductSchedules into calendar entries for a full month.
 * Returns a map of dateStr → { morning, night }.
 */
export function schedulesToCalendar(
  yearMonth: string,
  schedules: ProductSchedule[],
): Record<string, { date: string; morning: string[]; night: string[] }> {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth   = new Date(year, month, 0).getDate()
  const result: Record<string, { date: string; morning: string[]; night: string[] }> = {}

  for (let day = 1; day <= daysInMonth; day++) {
    const jsDate    = new Date(year, month - 1, day)
    const dayOfWeek = (jsDate.getDay() + 6) % 7 // JS: Sun=0 → Mon=0
    const dateStr   = `${yearMonth}-${String(day).padStart(2, '0')}`

    const morning: string[] = []
    const night:   string[] = []

    for (const s of schedules) {
      if (!s.daysOfWeek.includes(dayOfWeek)) continue
      if (s.weeksOfMonth) {
        const weekOfMonth = Math.floor((day - 1) / 7)
        if (!s.weeksOfMonth.includes(weekOfMonth)) continue
      }
      if ((s.time === 'morning' || s.time === 'both') && !morning.includes(s.productId))
        morning.push(s.productId)
      if ((s.time === 'night' || s.time === 'both') && !night.includes(s.productId))
        night.push(s.productId)
    }

    if (morning.length > 0 || night.length > 0) {
      result[dateStr] = { date: dateStr, morning, night }
    }
  }

  return result
}
