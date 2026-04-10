import {
  Product,
  ProductType,
  CalendarData,
  ValidationResult,
  ValidationError,
  CustomRule,
  RulePeriodicityType,
  PERIODICITY_LABELS,
} from '../types'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from 'date-fns'

// ─── Conflict map ────────────────────────────────────────────────────────────
const CONFLICTS: Partial<Record<ProductType, ProductType[]>> = {
  azelaic_acid:     ['retinol', 'dermaplaning', 'aha_bha_pha_mask'],
  retinol:          ['azelaic_acid', 'dermaplaning', 'aha_bha_pha_mask'],
  dermaplaning:     ['azelaic_acid', 'retinol', 'aha_bha_pha_mask'],
  aha_bha_pha_mask: ['azelaic_acid', 'retinol', 'dermaplaning'],
}

// Max uses per week
const WEEKLY_LIMITS: Partial<Record<ProductType, number>> = {
  aha_bha_pha_mask: 2,
  glycolic_acid:    2,
  cleansing_oil:    1,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getWeekDates(dateStr: string): string[] {
  const date = parseISO(dateStr)
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end   = endOfWeek(date,   { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

function getProductsOnDay(
  dateStr: string,
  calendar: CalendarData,
): string[] {
  const entry = calendar[dateStr]
  if (!entry) return []
  return [...(entry.morning ?? []), ...(entry.night ?? [])]
}

function countWeeklyUsage(
  productId: string,
  dateStr: string,
  calendar: CalendarData,
  excludeDate?: string,
): number {
  const weekDates = getWeekDates(dateStr)
  return weekDates.reduce((count, d) => {
    if (d === excludeDate) return count
    const ids = getProductsOnDay(d, calendar)
    return count + (ids.includes(productId) ? 1 : 0)
  }, 0)
}

function countBiweeklyUsage(productId: string, dateStr: string, calendar: CalendarData): number {
  const date = parseISO(dateStr)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const twoWeekStart = addDays(weekStart, -7)
  const twoWeekEnd   = addDays(weekStart, 6)
  const dates = eachDayOfInterval({ start: twoWeekStart, end: twoWeekEnd }).map(d => format(d, 'yyyy-MM-dd'))
  return dates.reduce((count, d) => {
    const ids = getProductsOnDay(d, calendar)
    return count + (ids.includes(productId) ? 1 : 0)
  }, 0)
}

function countMonthlyUsage(productId: string, dateStr: string, calendar: CalendarData): number {
  const date  = parseISO(dateStr)
  const start = startOfMonth(date)
  const end   = endOfMonth(date)
  const dates = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
  return dates.reduce((count, d) => {
    const ids = getProductsOnDay(d, calendar)
    return count + (ids.includes(productId) ? 1 : 0)
  }, 0)
}

/** Returns the most recent date (before dateStr) on which productId was used, or null */
function getLastUsedDate(
  productId: string,
  beforeDate: string,
  calendar: CalendarData,
): string | null {
  const dates = Object.keys(calendar)
    .filter(d => d < beforeDate && getProductsOnDay(d, calendar).includes(productId))
    .sort()
  return dates.length > 0 ? dates[dates.length - 1] : null
}

function checkPeriodicity(
  productId: string,
  dateStr: string,
  calendar: CalendarData,
  periodicity: RulePeriodicityType,
): { used: number; limit: number } {
  switch (periodicity) {
    case 'once_week':      return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 1 }
    case 'twice_week':     return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 2 }
    case 'three_week':     return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 3 }
    case 'four_week':      return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 4 }
    case 'five_week':      return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 5 }
    case 'six_week':       return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 6 }
    case 'daily':          return { used: countWeeklyUsage(productId, dateStr, calendar), limit: 7 }
    case 'once_two_weeks': return { used: countBiweeklyUsage(productId, dateStr, calendar), limit: 1 }
    case 'once_month':     return { used: countMonthlyUsage(productId, dateStr, calendar),  limit: 1 }
  }
}

// ─── Main validation ──────────────────────────────────────────────────────────
export function validateDayProducts(
  dateStr: string,
  newProductId: string,
  time: 'morning' | 'night',
  calendar: CalendarData,
  products: Product[],
  customRules: CustomRule[] = [],
): ValidationResult {
  const errors: ValidationError[] = []
  const newProduct = products.find(p => p.id === newProductId)
  if (!newProduct) return { valid: false, errors: [{ code: 'NOT_FOUND', message: 'Producto no encontrado' }] }

  const entry = calendar[dateStr]
  const dayProducts = [
    ...(entry?.morning ?? []),
    ...(entry?.night   ?? []),
  ]

  // 1. Built-in conflict check (skipped if a custom rule already covers this product,
  //    to avoid duplicate errors when built-in rules are stored as custom rules)
  const hasCustomConflictCoverage = customRules.some(
    r => r.type === 'conflict' && (r.productAId === newProductId || r.productBId === newProductId),
  )
  if (!hasCustomConflictCoverage) {
    const conflicts = CONFLICTS[newProduct.type] ?? []
    for (const conflictType of conflicts) {
      const conflicting = products.find(p => dayProducts.includes(p.id) && p.type === conflictType)
      if (conflicting) {
        errors.push({
          code: 'CONFLICT',
          message: `No puedes aplicar ${newProduct.name} el mismo día que ${conflicting.name}`,
          affectedProducts: [newProductId, conflicting.id],
        })
      }
    }
  }

  // 2. Built-in weekly limit check (skipped for the same reason)
  const hasCustomLimitCoverage = customRules.some(
    r => r.type === 'limit' && r.productId === newProductId,
  )
  if (!hasCustomLimitCoverage) {
    const limit = WEEKLY_LIMITS[newProduct.type]
    if (limit !== undefined) {
      const used = countWeeklyUsage(newProductId, dateStr, calendar)
      if (used >= limit) {
        errors.push({
          code: 'WEEKLY_LIMIT',
          message: `${newProduct.name} solo puede usarse ${limit} vez${limit > 1 ? 'es' : ''} por semana. Ya lo usaste ${used} vez${used > 1 ? 'es' : ''} esta semana.`,
        })
      }
    }
  }

  // 3. Duplicate check (same time slot)
  const timeSlot = entry?.[time] ?? []
  if (timeSlot.includes(newProductId)) {
    errors.push({
      code: 'DUPLICATE',
      message: `${newProduct.name} ya está en tu rutina de ${time === 'morning' ? 'mañana' : 'noche'} de este día`,
    })
  }

  // 4. Custom conflict rules
  for (const rule of customRules) {
    if (rule.type !== 'conflict' || !rule.productAId || !rule.productBId) continue
    const isA = rule.productAId === newProductId
    const isB = rule.productBId === newProductId
    if (!isA && !isB) continue
    const otherId = isA ? rule.productBId : rule.productAId
    if (dayProducts.includes(otherId)) {
      const other = products.find(p => p.id === otherId)
      errors.push({
        code: 'CONFLICT',
        message: `No puedes aplicar ${newProduct.name} el mismo día que ${other?.name ?? otherId}`,
        affectedProducts: [newProductId, otherId],
      })
    }
  }

  // 5. Custom limit rules (supports periodicity + legacy maxPerWeek)
  for (const rule of customRules) {
    if (rule.type !== 'limit' || rule.productId !== newProductId) continue

    if (rule.periodicity) {
      const { used, limit } = checkPeriodicity(newProductId, dateStr, calendar, rule.periodicity)
      if (used >= limit) {
        errors.push({
          code: 'WEEKLY_LIMIT',
          message: `${newProduct.name}: ${PERIODICITY_LABELS[rule.periodicity]} (ya usado ${used} vez${used > 1 ? 'es' : ''}).`,
        })
      }
    } else if (rule.maxPerWeek) {
      // Legacy: maxPerWeek without periodicity
      const used = countWeeklyUsage(newProductId, dateStr, calendar)
      if (used >= rule.maxPerWeek) {
        errors.push({
          code: 'WEEKLY_LIMIT',
          message: `${newProduct.name} solo puede usarse ${rule.maxPerWeek} vez${rule.maxPerWeek > 1 ? 'es' : ''} por semana (regla personalizada).`,
        })
      }
    }
  }

  // 6. Time-of-day restriction rules
  for (const rule of customRules) {
    if (rule.type !== 'time' || rule.productId !== newProductId || !rule.allowedTime) continue
    if (time !== rule.allowedTime) {
      const slot = rule.allowedTime === 'morning' ? 'mañana' : 'noche'
      errors.push({
        code: 'TIME_RESTRICTION',
        message: `${newProduct.name} solo puede aplicarse en la rutina de ${slot}.`,
      })
    }
  }

  // 7. Rest-period rules: after productAId, wait minDays before productBId
  for (const rule of customRules) {
    if (rule.type !== 'rest' || rule.productBId !== newProductId || !rule.productAId || !rule.minDays) continue
    const lastUsed = getLastUsedDate(rule.productAId, dateStr, calendar)
    if (!lastUsed) continue
    const daysPassed = differenceInDays(parseISO(dateStr), parseISO(lastUsed))
    if (daysPassed < rule.minDays) {
      const trigger = products.find(p => p.id === rule.productAId)
      const remaining = rule.minDays - daysPassed
      errors.push({
        code: 'REST_PERIOD',
        message: `Después de usar ${trigger?.name ?? rule.productAId}, debes esperar ${rule.minDays} días antes de aplicar ${newProduct.name}. Faltan ${remaining} día${remaining > 1 ? 's' : ''}.`,
      })
    }
  }

  const suggestedDays = errors.length > 0
    ? suggestAvailableDays(newProductId, products, calendar, dateStr)
    : undefined

  return { valid: errors.length === 0, errors, suggestedDays }
}

// ─── Suggest available days ───────────────────────────────────────────────────
export function suggestAvailableDays(
  productId: string,
  products: Product[],
  calendar: CalendarData,
  fromDate: string,
  maxDays = 14,
): string[] {
  const product = products.find(p => p.id === productId)
  if (!product) return []

  const suggestions: string[] = []
  const base = parseISO(fromDate)

  for (let i = 1; i <= maxDays; i++) {
    const candidate = format(addDays(base, i), 'yyyy-MM-dd')
    const result = validateDayProducts(candidate, productId, 'night', calendar, products)
    if (result.valid) {
      suggestions.push(candidate)
      if (suggestions.length >= 3) break
    }
  }

  return suggestions
}

// ─── Check weekly limit ───────────────────────────────────────────────────────
export function checkWeeklyLimit(
  productId: string,
  dateStr: string,
  calendar: CalendarData,
  products: Product[],
): { exceeded: boolean; used: number; limit: number | null } {
  const product = products.find(p => p.id === productId)
  if (!product) return { exceeded: false, used: 0, limit: null }

  const limit = WEEKLY_LIMITS[product.type] ?? null
  if (limit === null) return { exceeded: false, used: 0, limit: null }

  const used = countWeeklyUsage(productId, dateStr, calendar)
  return { exceeded: used >= limit, used, limit }
}

// ─── Get conflicts for a day ──────────────────────────────────────────────────
export function getDayConflicts(
  dateStr: string,
  calendar: CalendarData,
  products: Product[],
  customRules: CustomRule[] = [],
): ValidationError[] {
  const entry = calendar[dateStr]
  if (!entry) return []

  const allProductIds = [...(entry.morning ?? []), ...(entry.night ?? [])]
  const errors: ValidationError[] = []

  for (const productId of allProductIds) {
    const product = products.find(p => p.id === productId)
    if (!product) continue

    // Check custom conflict rules first (includes built-in rules stored in the store)
    const hasCustomCoverage = customRules.some(
      r => r.type === 'conflict' && (r.productAId === productId || r.productBId === productId),
    )

    if (hasCustomCoverage) {
      // Use custom/built-in rules
      for (const rule of customRules) {
        if (rule.type !== 'conflict') continue
        const isA = rule.productAId === productId
        const isB = rule.productBId === productId
        if (!isA && !isB) continue
        const otherId = isA ? rule.productBId! : rule.productAId!
        if (allProductIds.includes(otherId)) {
          const other = products.find(p => p.id === otherId)
          const alreadyAdded = errors.some(
            e => e.affectedProducts?.includes(productId) && e.affectedProducts?.includes(otherId),
          )
          if (!alreadyAdded) {
            errors.push({
              code: 'CONFLICT',
              message: `Conflicto: ${product.name} y ${other?.name ?? otherId} no pueden usarse el mismo día`,
              affectedProducts: [productId, otherId],
            })
          }
        }
      }
    } else {
      // Fallback to hardcoded type-based conflicts
      const conflicts = CONFLICTS[product.type] ?? []
      for (const conflictType of conflicts) {
        const conflicting = products.find(
          p => allProductIds.includes(p.id) && p.type === conflictType && p.id !== productId,
        )
        if (conflicting) {
          const alreadyAdded = errors.some(
            e => e.affectedProducts?.includes(productId) && e.affectedProducts?.includes(conflicting.id),
          )
          if (!alreadyAdded) {
            errors.push({
              code: 'CONFLICT',
              message: `Conflicto: ${product.name} y ${conflicting.name} no pueden usarse el mismo día`,
              affectedProducts: [productId, conflicting.id],
            })
          }
        }
      }
    }
  }

  return errors
}
