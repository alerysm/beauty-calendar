import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Product,
  ProductType,
  CalendarData,
  AppSettings,
  TabType,
  PRODUCT_COLORS,
  FrequencyType,
  UsageTime,
  CustomRule,
  ProductSchedule,
} from '../types'
import { validateDayProducts } from '../utils/rulesEngine'
import { schedulesToCalendar } from '../utils/recommendationEngine'
import { exportToJSON, importFromJSON } from '../utils/storage'

// ─── Built-in rules (seeded into the store, fully editable) ──────────────────
export const BUILTIN_CUSTOM_RULES: CustomRule[] = [
  // ── Conflictos mismo día ──────────────────────────────────────────────────
  { id: 'builtin-c1', isBuiltIn: true, type: 'conflict', description: 'Ácido Azelaico + Retinol',             productAId: 'default-azelaic',      productBId: 'default-retinol' },
  { id: 'builtin-c2', isBuiltIn: true, type: 'conflict', description: 'Ácido Azelaico + Dermaplaning',        productAId: 'default-azelaic',      productBId: 'default-dermaplaning' },
  { id: 'builtin-c3', isBuiltIn: true, type: 'conflict', description: 'Ácido Azelaico + Máscara AHA-BHA-PHA', productAId: 'default-azelaic',      productBId: 'default-mask' },
  { id: 'builtin-c4', isBuiltIn: true, type: 'conflict', description: 'Retinol + Dermaplaning',               productAId: 'default-retinol',      productBId: 'default-dermaplaning' },
  { id: 'builtin-c5', isBuiltIn: true, type: 'conflict', description: 'Retinol + Máscara AHA-BHA-PHA',        productAId: 'default-retinol',      productBId: 'default-mask' },
  { id: 'builtin-c6', isBuiltIn: true, type: 'conflict', description: 'Dermaplaning + Máscara AHA-BHA-PHA',   productAId: 'default-dermaplaning', productBId: 'default-mask' },
  // ── Frecuencia ────────────────────────────────────────────────────────────
  { id: 'builtin-l1', isBuiltIn: true, type: 'limit', description: 'Máscara AHA-BHA-PHA — 2 veces/sem',  productId: 'default-mask',      periodicity: 'twice_week' },
  { id: 'builtin-l2', isBuiltIn: true, type: 'limit', description: 'Ácido Glicólico — 2 veces/sem',      productId: 'default-glycolic',  periodicity: 'twice_week' },
  { id: 'builtin-l3', isBuiltIn: true, type: 'limit', description: 'Aceite Limpiador — 1 vez/sem',       productId: 'default-cleansing', periodicity: 'once_week' },
  // ── Restricción de horario ────────────────────────────────────────────────
  { id: 'builtin-t1', isBuiltIn: true, type: 'time', description: 'Retinol — Solo noche',              productId: 'default-retinol',  allowedTime: 'night' },
  { id: 'builtin-t2', isBuiltIn: true, type: 'time', description: 'Máscara AHA-BHA-PHA — Solo noche',  productId: 'default-mask',     allowedTime: 'night' },
  { id: 'builtin-t3', isBuiltIn: true, type: 'time', description: 'Ácido Glicólico — Solo noche',      productId: 'default-glycolic', allowedTime: 'night' },
  // ── Periodo de descanso post-Dermaplaning ─────────────────────────────────
  { id: 'builtin-r1', isBuiltIn: true, type: 'rest', description: 'Post-Dermaplaning: 3 días antes de Retinol',              productAId: 'default-dermaplaning', productBId: 'default-retinol',  minDays: 3 },
  { id: 'builtin-r2', isBuiltIn: true, type: 'rest', description: 'Post-Dermaplaning: 3 días antes de Máscara AHA-BHA-PHA',  productAId: 'default-dermaplaning', productBId: 'default-mask',     minDays: 3 },
  { id: 'builtin-r3', isBuiltIn: true, type: 'rest', description: 'Post-Dermaplaning: 3 días antes de Ácido Azelaico',       productAId: 'default-dermaplaning', productBId: 'default-azelaic',  minDays: 3 },
  { id: 'builtin-r4', isBuiltIn: true, type: 'rest', description: 'Post-Dermaplaning: 3 días antes de Ácido Glicólico',      productAId: 'default-dermaplaning', productBId: 'default-glycolic', minDays: 3 },
  // ── Periodo de descanso post-PDRN ────────────────────────────────────────
  { id: 'builtin-r5', isBuiltIn: true, type: 'rest', description: 'Post-PDRN: 2 días antes de Retinol',              productAId: 'default-pdrn', productBId: 'default-retinol',  minDays: 2 },
  { id: 'builtin-r6', isBuiltIn: true, type: 'rest', description: 'Post-PDRN: 2 días antes de Máscara AHA-BHA-PHA',  productAId: 'default-pdrn', productBId: 'default-mask',     minDays: 2 },
  { id: 'builtin-r7', isBuiltIn: true, type: 'rest', description: 'Post-PDRN: 2 días antes de Ácido Glicólico',      productAId: 'default-pdrn', productBId: 'default-glycolic', minDays: 2 },
]

// ─── Default products ─────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'default-azelaic',
    name: 'Ácido Azelaico',
    type: 'azelaic_acid',
    frequency: 'daily',
    usage: 'both',
    color: PRODUCT_COLORS.azelaic_acid,
    isDefault: true,
    notes: 'No combinar con retinol ni dermaplaning',
  },
  {
    id: 'default-retinol',
    name: 'Retinol',
    type: 'retinol',
    frequency: 'weekly_3',
    usage: 'night',
    color: PRODUCT_COLORS.retinol,
    isDefault: true,
    notes: 'No combinar con ácido azelaico ni dermaplaning',
  },
  {
    id: 'default-dermaplaning',
    name: 'Dermaplaning',
    type: 'dermaplaning',
    frequency: 'weekly_1',
    usage: 'morning',
    color: PRODUCT_COLORS.dermaplaning,
    isDefault: true,
    notes: 'No combinar con ácido azelaico ni retinol',
  },
  {
    id: 'default-mask',
    name: 'Máscara AHA-BHA-PHA',
    type: 'aha_bha_pha_mask',
    frequency: 'weekly_2',
    usage: 'night',
    color: PRODUCT_COLORS.aha_bha_pha_mask,
    isDefault: true,
    notes: 'Máx 2 veces/semana. No combinar con ácido azelaico, retinol ni dermaplaning',
  },
  {
    id: 'default-niacinamide',
    name: 'Niacinamida',
    type: 'niacinamide',
    frequency: 'daily',
    usage: 'both',
    color: PRODUCT_COLORS.niacinamide,
    isDefault: true,
    notes: 'Compatible con todos los productos',
  },
  {
    id: 'default-pdrn',
    name: 'PDRN',
    type: 'pdrn',
    frequency: 'daily',
    usage: 'both',
    color: PRODUCT_COLORS.pdrn,
    isDefault: true,
    notes: 'Compatible con todos los productos',
  },
  {
    id: 'default-cleansing',
    name: 'Aceite Limpiador',
    type: 'cleansing_oil',
    frequency: 'weekly_1',
    usage: 'night',
    color: PRODUCT_COLORS.cleansing_oil,
    isDefault: true,
    notes: 'Una vez por semana',
  },
  {
    id: 'default-cream',
    name: 'Crema',
    type: 'cream',
    frequency: 'daily',
    usage: 'both',
    color: PRODUCT_COLORS.cream,
    isDefault: true,
    notes: 'Uso diario',
  },
  {
    id: 'default-glycolic',
    name: 'Ácido Glicólico',
    type: 'glycolic_acid',
    frequency: 'weekly_2',
    usage: 'both',
    color: PRODUCT_COLORS.glycolic_acid,
    isDefault: true,
    notes: 'Uso corporal. Máx 2 veces/semana',
  },
]

const DEFAULT_SETTINGS: AppSettings = {
  morningNotification: false,
  nightNotification: false,
  morningTime: '08:00',
  nightTime: '21:00',
  language: 'es',
  notificationsPermission: false,
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface AppStore {
  products: Product[]
  calendar: CalendarData
  settings: AppSettings
  activeTab: TabType
  customRules: CustomRule[]

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Calendar actions
  addProductToDay: (
    dateStr: string,
    productId: string,
    time: 'morning' | 'night',
  ) => ReturnType<typeof validateDayProducts>
  removeProductFromDay: (dateStr: string, productId: string, time: 'morning' | 'night') => void
  addProductToMonth: (
    yearMonth: string,
    productId: string,
    time: 'morning' | 'night',
  ) => { applied: number; skipped: number }
  applyMonthlyPlan: (yearMonth: string, schedules: ProductSchedule[]) => void
  moveProduct: (
    fromDate: string,
    toDate: string,
    productId: string,
    time: 'morning' | 'night',
  ) => ReturnType<typeof validateDayProducts>

  // Custom rules
  addCustomRule: (rule: Omit<CustomRule, 'id'>) => void
  editCustomRule: (id: string, updates: Partial<Omit<CustomRule, 'id'>>) => void
  deleteCustomRule: (id: string) => void

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void
  setActiveTab: (tab: TabType) => void

  // Data
  exportData: () => string
  importData: (json: string) => boolean
  resetData: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      products: DEFAULT_PRODUCTS,
      calendar: {},
      settings: DEFAULT_SETTINGS,
      activeTab: 'today',
      customRules: BUILTIN_CUSTOM_RULES,

      addProduct: (product) => {
        const id = `product-${Date.now()}-${Math.random().toString(36).slice(2)}`
        set(state => ({ products: [...state.products, { ...product, id }] }))
      },

      updateProduct: (id, updates) => {
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
        }))
      },

      deleteProduct: (id) => {
        set(state => {
          // Remove from calendar too
          const calendar: CalendarData = {}
          for (const [date, entry] of Object.entries(state.calendar)) {
            calendar[date] = {
              date,
              morning: entry.morning.filter(pid => pid !== id),
              night:   entry.night.filter(pid => pid !== id),
            }
          }
          return {
            products: state.products.filter(p => p.id !== id),
            calendar,
          }
        })
      },

      addProductToDay: (dateStr, productId, time) => {
        const { calendar, products, customRules } = get()
        const result = validateDayProducts(dateStr, productId, time, calendar, products, customRules)

        if (result.valid) {
          set(state => {
            const entry = state.calendar[dateStr] ?? { date: dateStr, morning: [], night: [] }
            return {
              calendar: {
                ...state.calendar,
                [dateStr]: {
                  ...entry,
                  [time]: [...entry[time], productId],
                },
              },
            }
          })
        }

        return result
      },

      removeProductFromDay: (dateStr, productId, time) => {
        set(state => {
          const entry = state.calendar[dateStr]
          if (!entry) return state
          return {
            calendar: {
              ...state.calendar,
              [dateStr]: {
                ...entry,
                [time]: entry[time].filter(id => id !== productId),
              },
            },
          }
        })
      },

      addProductToMonth: (yearMonth, productId, time) => {
        const [year, month] = yearMonth.split('-').map(Number)
        const daysInMonth = new Date(year, month, 0).getDate()
        const { calendar, products, customRules } = get()

        let applied = 0
        let skipped = 0
        const newCalendar = { ...calendar }

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`
          const result = validateDayProducts(dateStr, productId, time, newCalendar, products, customRules)
          if (result.valid) {
            const entry = newCalendar[dateStr] ?? { date: dateStr, morning: [], night: [] }
            newCalendar[dateStr] = {
              ...entry,
              [time]: [...entry[time], productId],
            }
            applied++
          } else {
            skipped++
          }
        }

        set({ calendar: newCalendar })
        return { applied, skipped }
      },

      applyMonthlyPlan: (yearMonth, schedules) => {
        const entries = schedulesToCalendar(yearMonth, schedules)
        set(state => {
          // Remove existing entries for this month, then apply new ones
          const newCalendar: CalendarData = {}
          for (const [date, entry] of Object.entries(state.calendar)) {
            if (!date.startsWith(yearMonth)) newCalendar[date] = entry
          }
          for (const [date, entry] of Object.entries(entries)) {
            newCalendar[date] = entry
          }
          return { calendar: newCalendar }
        })
      },

      moveProduct: (fromDate, toDate, productId, time) => {
        const { calendar, products, customRules } = get()
        const result = validateDayProducts(toDate, productId, time, calendar, products, customRules)

        if (result.valid) {
          set(state => {
            const fromEntry = state.calendar[fromDate]
            const toEntry   = state.calendar[toDate] ?? { date: toDate, morning: [], night: [] }

            return {
              calendar: {
                ...state.calendar,
                [fromDate]: fromEntry
                  ? { ...fromEntry, [time]: fromEntry[time].filter(id => id !== productId) }
                  : { date: fromDate, morning: [], night: [] },
                [toDate]: {
                  ...toEntry,
                  [time]: [...toEntry[time], productId],
                },
              },
            }
          })
        }

        return result
      },

      addCustomRule: (rule) => {
        const id = `rule-${Date.now()}-${Math.random().toString(36).slice(2)}`
        set(state => ({ customRules: [...state.customRules, { ...rule, id }] }))
      },

      editCustomRule: (id, updates) => {
        set(state => ({
          customRules: state.customRules.map(r => r.id === id ? { ...r, ...updates } : r),
        }))
      },

      deleteCustomRule: (id) => {
        set(state => ({ customRules: state.customRules.filter(r => r.id !== id) }))
      },

      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }))
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      exportData: () => {
        const { products, calendar, settings } = get()
        return exportToJSON(products, calendar, settings)
      },

      importData: (json) => {
        const data = importFromJSON(json)
        if (!data) return false
        set({
          products: data.products ?? DEFAULT_PRODUCTS,
          calendar: data.calendar ?? {},
          settings: data.settings ?? DEFAULT_SETTINGS,
        })
        return true
      },

      resetData: () => {
        set({ products: DEFAULT_PRODUCTS, calendar: {}, settings: DEFAULT_SETTINGS, customRules: BUILTIN_CUSTOM_RULES })
      },
    }),
    {
      name: 'skincare-calendar-v1',
      // Migration: add any missing built-in rules individually (handles upgrades)
      merge: (persistedState: unknown, currentState: AppStore) => {
        const ps = (persistedState ?? {}) as Partial<AppStore>
        const merged: AppStore = { ...currentState, ...ps }
        const existingIds = new Set(merged.customRules.map((r: CustomRule) => r.id))
        const missing = BUILTIN_CUSTOM_RULES.filter(r => !existingIds.has(r.id))
        if (missing.length > 0) {
          merged.customRules = [...missing, ...merged.customRules]
        }
        return merged
      },
    },
  ),
)

// ─── Typed selectors ──────────────────────────────────────────────────────────
export const useProducts    = () => useStore(s => s.products)
export const useCalendar    = () => useStore(s => s.calendar)
export const useSettings    = () => useStore(s => s.settings)
export const useActiveTab   = () => useStore(s => s.activeTab)
export const useCustomRules = () => useStore(s => s.customRules)
