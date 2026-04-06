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
} from '../types'
import { validateDayProducts } from '../utils/rulesEngine'
import { exportToJSON, importFromJSON } from '../utils/storage'

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
  moveProduct: (
    fromDate: string,
    toDate: string,
    productId: string,
    time: 'morning' | 'night',
  ) => ReturnType<typeof validateDayProducts>

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
        const { calendar, products } = get()
        const result = validateDayProducts(dateStr, productId, time, calendar, products)

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

      moveProduct: (fromDate, toDate, productId, time) => {
        const { calendar, products } = get()
        const result = validateDayProducts(toDate, productId, time, calendar, products)

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
        set({ products: DEFAULT_PRODUCTS, calendar: {}, settings: DEFAULT_SETTINGS })
      },
    }),
    {
      name: 'skincare-calendar-v1',
    },
  ),
)

// ─── Typed selectors ──────────────────────────────────────────────────────────
export const useProducts  = () => useStore(s => s.products)
export const useCalendar  = () => useStore(s => s.calendar)
export const useSettings  = () => useStore(s => s.settings)
export const useActiveTab = () => useStore(s => s.activeTab)
