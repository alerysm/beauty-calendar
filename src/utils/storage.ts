import { AppSettings, CalendarData, Product } from '../types'

export interface ExportData {
  version: string
  exportedAt: string
  products: Product[]
  calendar: CalendarData
  settings: AppSettings
}

export function exportToJSON(
  products: Product[],
  calendar: CalendarData,
  settings: AppSettings,
): string {
  const data: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    products,
    calendar,
    settings,
  }
  return JSON.stringify(data, null, 2)
}

export function importFromJSON(json: string): ExportData | null {
  try {
    const data = JSON.parse(json) as ExportData
    if (!data.products || !data.calendar) return null
    return data
  } catch {
    return null
  }
}

export function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readJSONFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Error leyendo archivo'))
    reader.readAsText(file)
  })
}
