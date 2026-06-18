import { formatDate } from './format'

export type PeriodKey = 'month' | 'quarter' | 'year' | 'all'

export interface DateRange {
  startDate?: string
  endDate?: string
}

export const periodOptions: Array<{ value: PeriodKey; label: string }> = [
  { value: 'month', label: 'Mês' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Ano' },
  { value: 'all', label: 'Tudo' },
]

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function lastDayOfMonth(year: number, month: number): number {
  // month is 1-based; day 0 of next month is the last day of this month.
  return new Date(year, month, 0).getDate()
}

/**
 * Resolves a period key into an inclusive [startDate, endDate] range (ISO YYYY-MM-DD),
 * based on the current local date.
 */
export function periodRange(period: PeriodKey): DateRange {
  if (period === 'all') return {}

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-based

  if (period === 'year') {
    return { startDate: iso(year, 1, 1), endDate: iso(year, 12, 31) }
  }

  if (period === 'quarter') {
    const firstMonth = Math.floor((month - 1) / 3) * 3 + 1
    const lastMonth = firstMonth + 2
    return {
      startDate: iso(year, firstMonth, 1),
      endDate: iso(year, lastMonth, lastDayOfMonth(year, lastMonth)),
    }
  }

  return {
    startDate: iso(year, month, 1),
    endDate: iso(year, month, lastDayOfMonth(year, month)),
  }
}

export function periodLabel(period: PeriodKey): string {
  if (period === 'all') return 'Tudo'
  const range = periodRange(period)
  const start = formatDate(range.startDate!)
  const end = formatDate(range.endDate!)
  const baseLabel = periodOptions.find((o) => o.value === period)!.label
  return `${baseLabel} (${start} - ${end})`
}
