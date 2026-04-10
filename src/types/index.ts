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

export type FrequencyType =
  | 'daily'
  | 'weekly_6'
  | 'weekly_5'
  | 'weekly_4'
  | 'weekly_3'
  | 'weekly_2'
  | 'weekly_1'
  | 'biweekly'   // cada 2 semanas (quincenal)
  | 'monthly'    // una vez al mes
  | 'as_needed'

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
  daysOfWeek: number[]   // 0=Lun … 6=Dom
  time: UsageTime
  weeksOfMonth?: number[] // 0-indexed weeks (0-4); absent = every week
}

export type RulePeriodicityType =
  | 'once_week'
  | 'twice_week'
  | 'three_week'
  | 'four_week'
  | 'five_week'
  | 'six_week'
  | 'daily'
  | 'once_two_weeks'
  | 'once_month'

export const PERIODICITY_LABELS: Record<RulePeriodicityType, string> = {
  once_week:      '1 vez por semana',
  twice_week:     '2 veces por semana',
  three_week:     '3 veces por semana',
  four_week:      '4 veces por semana',
  five_week:      '5 veces por semana',
  six_week:       '6 veces por semana',
  daily:          'Diario (todos los días)',
  once_two_weeks: 'Quincenal (c/2 semanas)',
  once_month:     '1 vez al mes',
}

export const PERIODICITY_SHORT: Record<RulePeriodicityType, string> = {
  once_week:      '1×/sem',
  twice_week:     '2×/sem',
  three_week:     '3×/sem',
  four_week:      '4×/sem',
  five_week:      '5×/sem',
  six_week:       '6×/sem',
  daily:          'Diario',
  once_two_weeks: 'Quincenal',
  once_month:     '1×/mes',
}

export interface CustomRule {
  id: string
  type: 'conflict' | 'limit' | 'time' | 'rest'
  description: string
  isBuiltIn?: boolean
  // conflict & rest share productAId / productBId
  productAId?: string
  productBId?: string
  // limit & time share productId
  productId?: string
  // limit
  maxPerWeek?: number        // legacy — kept for stored data compatibility
  periodicity?: RulePeriodicityType
  // time  (solo mañana / solo noche)
  allowedTime?: 'morning' | 'night'
  // rest  (días mínimos de espera tras usar productAId antes de productBId)
  minDays?: number
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
  weekly_6:  '6 veces por semana',
  weekly_5:  '5 veces por semana',
  weekly_4:  '4 veces por semana',
  weekly_3:  '3 veces por semana',
  weekly_2:  '2 veces por semana',
  weekly_1:  '1 vez por semana',
  biweekly:  'Quincenal (c/2 semanas)',
  monthly:   '1 vez al mes',
  as_needed: 'Según necesidad',
}
