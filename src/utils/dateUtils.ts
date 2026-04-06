import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'

export function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateStr(dateStr: string): Date {
  return parseISO(dateStr)
}

export function formatDisplay(dateStr: string, fmt = 'd MMM yyyy'): string {
  return format(parseISO(dateStr), fmt, { locale: es })
}

export function formatDayName(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE', { locale: es })
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end   = endOfMonth(new Date(year, month))
  const calStart = startOfWeek(start, { weekStartsOn: 1 })
  const calEnd   = endOfWeek(end,   { weekStartsOn: 1 })
  return eachDayOfInterval({ start: calStart, end: calEnd })
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end   = endOfWeek(date,   { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export { isSameDay, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, format }
export { es }
