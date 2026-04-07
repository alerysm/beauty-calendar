export type ProductType =
  | 'azelaic_acid'
  | 'retinol'
  | 'dermaplaning'
  | 'aha_bha_pha_mask'
  | 'niacinamide'
  | 'pdrn'
  | 'cleansing_oil'
  | 'cream'
  | 'glycolic_acid'
  | 'custom'

export type UsageTime = 'morning' | 'night' | 'both'

export type FrequencyType = 'daily' | 'weekly_1' | 'weekly_2' | 'weekly_3' | 'as_needed'

export interface Product {
  id: string
  name: string
  type: ProductType
  frequency: FrequencyType
  usage: UsageTime
  color: string
  notes?: string
  isDefault?: boolean
}

export interface DayEntry {
  date: string // YYYY-MM-DD
  morning: string[] // product IDs
  night: string[]   // product IDs
}

export type CalendarData = Record<string, DayEntry>

export interface ValidationError {
  code: string
  message: string
  affectedProducts?: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  suggestedDays?: string[]
}

export interface AppSettings {
  morningNotification: boolean
  nightNotification: boolean
  morningTime: string
  nightTime: string
  language: 'es' | 'en'
  notificationsPermission: boolean
}

export type TabType = 'today' | 'calendar' | 'planner' | 'products' | 'rules' | 'settings'

export interface ProductSchedule {
  productId: string
  daysOfWeek: number[] // 0=Lun … 6=Dom
  time: UsageTime
}

export interface CustomRule {
  id: string
  type: 'conflict' | 'limit'
  description: string
  // conflict
  productAId?: string
  productBId?: string
  // limit
  productId?: string
  maxPerWeek?: number
}

export interface ProductRule {
  type: ProductType
  label: string
  maxPerWeek?: number
  conflicts: ProductType[]
  requiresConflictCheck?: boolean
  description: string
}

export const PRODUCT_COLORS: Record<ProductType, string> = {
  azelaic_acid:   '#a78bfa',
  retinol:        '#f97316',
  dermaplaning:   '#06b6d4',
  aha_bha_pha_mask: '#ec4899',
  niacinamide:    '#22c55e',
  pdrn:           '#3b82f6',
  cleansing_oil:  '#eab308',
  cream:          '#e8b4b8',
  glycolic_acid:  '#14b8a6',
  custom:         '#8b5cf6',
}

export const PRODUCT_LABELS: Record<ProductType, string> = {
  azelaic_acid:     'Ácido Azelaico',
  retinol:          'Retinol',
  dermaplaning:     'Dermaplaning',
  aha_bha_pha_mask: 'Máscara AHA-BHA-PHA',
  niacinamide:      'Niacinamida',
  pdrn:             'PDRN',
  cleansing_oil:    'Aceite Limpiador',
  cream:            'Crema',
  glycolic_acid:    'Ácido Glicólico',
  custom:           'Personalizado',
}

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily:     'Diario',
  weekly_1:  '1 vez por semana',
  weekly_2:  '2 veces por semana',
  weekly_3:  '3 veces por semana',
  as_needed: 'Según necesidad',
}
