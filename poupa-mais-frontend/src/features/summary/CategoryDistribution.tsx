import { useState } from 'react'
import { getApiErrorMessage, useGetCategorySummaryQuery } from '../../api/poupaMaisApi'
import type { TransactionType } from '../../types/api'
import type { DateRange } from '../../utils/period'
import { formatCurrency } from '../../utils/format'

interface CategoryDistributionProps {
  range: DateRange
  isDisabled?: boolean
}

const typeOptions: Array<{ value: TransactionType; label: string }> = [
  { value: 'EXPENSE', label: 'Despesas' },
  { value: 'INCOME', label: 'Receitas' },
]

/**
 * UC-05 — Consultar Sumário Financeiro: shows the per-category distribution of
 * transactions for the selected period, switchable by transaction type. Totals and
 * percentages are computed by the backend; this component only renders them.
 */
export function CategoryDistribution({ range, isDisabled = false }: CategoryDistributionProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE')

  const summaryQuery = useGetCategorySummaryQuery(
    { ...range, type },
    { skip: isDisabled },
  )

  const summary = summaryQuery.data
  const items = summary?.items ?? []
  const error = getApiErrorMessage(summaryQuery.error, 'Falha ao carregar o sumário por categoria.')

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Distribuição por categoria</h2>
        <div className="segment-control compact" role="tablist" aria-label="Tipo do sumário">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={type === option.value ? 'active' : ''}
              onClick={() => setType(option.value)}
              role="tab"
              aria-selected={type === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {summaryQuery.isLoading && <p className="loading-state">Carregando sumário...</p>}

      {error && !summaryQuery.isLoading && (
        <div className="feedback-row">
          <p className="error">{error}</p>
          <button type="button" className="ghost-action" onClick={() => void summaryQuery.refetch()}>
            Tentar novamente
          </button>
        </div>
      )}

      {!summaryQuery.isLoading && !error && items.length === 0 && (
        <p className="empty-state">
          Nenhuma {type === 'EXPENSE' ? 'despesa' : 'receita'} no período selecionado.
        </p>
      )}

      {!error && items.length > 0 && (
        <ul className="distribution-list">
          {items.map((item) => (
            <li key={item.categoryId} className="distribution-row">
              <div className="distribution-label">
                <span className="distribution-name">{item.categoryName}</span>
                <span className="distribution-value">
                  {formatCurrency(item.total)}
                  <span className="distribution-share">{item.percentage.toFixed(1)}%</span>
                </span>
              </div>
              <div
                className="distribution-track"
                role="progressbar"
                aria-valuenow={Math.round(item.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.categoryName}: ${item.percentage.toFixed(1)}%`}
              >
                <span
                  className={type === 'INCOME' ? 'distribution-fill income' : 'distribution-fill expense'}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
