const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/**
 * Formats an ISO date string (YYYY-MM-DD) without applying timezone shifts.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)

  if (!year || !month || !day) {
    return isoDate
  }

  return dateFormatter.format(new Date(year, month - 1, day))
}

export function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
