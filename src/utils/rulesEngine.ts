import {
  Product,
  ProductType,
  CalendarData,
  ValidationResult,
  ValidationError,
} from '../types'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  format,
  addDays,
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

// ─── Main validation ──────────────────────────────────────────────────────────
export function validateDayProducts(
  dateStr: string,
  newProductId: string,
  time: 'morning' | 'night',
  calendar: CalendarData,
  products: Product[],
): ValidationResult {
  const errors: ValidationError[] = []
  const newProduct = products.find(p => p.id === newProductId)
  if (!newProduct) return { valid: false, errors: [{ code: 'NOT_FOUND', message: 'Producto no encontrado' }] }

  const entry = calendar[dateStr]
  const dayProducts = [
    ...(entry?.morning ?? []),
    ...(entry?.night   ?? []),
  ]

  // 1. Conflict check
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

  // 2. Weekly limit check
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

  // 3. Duplicate check (same time slot)
  const timeSlot = entry?.[time] ?? []
  if (timeSlot.includes(newProductId)) {
    errors.push({
      code: 'DUPLICATE',
      message: `${newProduct.name} ya está en tu rutina de ${time === 'morning' ? 'mañana' : 'noche'} de este día`,
    })
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
): ValidationError[] {
  const entry = calendar[dateStr]
  if (!entry) return []

  const allProductIds = [...(entry.morning ?? []), ...(entry.night ?? [])]
  const errors: ValidationError[] = []

  for (const productId of allProductIds) {
    const product = products.find(p => p.id === productId)
    if (!product) continue

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

  return errors
}
