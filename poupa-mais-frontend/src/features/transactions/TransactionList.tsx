import { useMemo, useState } from 'react'
import type { CategoryResponse, TransactionResponse, TransactionType } from '../../types/api'
import { formatCurrency, formatDate } from '../../utils/format'

interface TransactionListProps {
  transactions: TransactionResponse[]
  categories: CategoryResponse[]
  isLoading: boolean
  isFetching: boolean
  onRetry: () => void
}

type TypeFilter = 'ALL' | TransactionType

const typeLabels: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
}

export function TransactionList({
  transactions,
  categories,
  isLoading,
  isFetching,
  onRetry,
}: TransactionListProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      if (typeFilter !== 'ALL' && transaction.type !== typeFilter) return false
      if (categoryFilter !== 'ALL' && String(transaction.categoryId) !== categoryFilter) return false
      if (from && transaction.date < from) return false
      if (to && transaction.date > to) return false
      return true
    })
  }, [transactions, typeFilter, categoryFilter, from, to])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, transaction) => {
        if (transaction.type === 'INCOME') {
          acc.income += transaction.amount
        } else {
          acc.expense += transaction.amount
        }
        return acc
      },
      { income: 0, expense: 0 },
    )
  }, [filtered])

  const balance = totals.income - totals.expense
  const hasActiveFilters = typeFilter !== 'ALL' || categoryFilter !== 'ALL' || from !== '' || to !== ''

  function clearFilters() {
    setTypeFilter('ALL')
    setCategoryFilter('ALL')
    setFrom('')
    setTo('')
  }

  return (
    <section className="panel" aria-labelledby="transaction-list-title">
      <div className="panel-header">
        <div>
          <h2 id="transaction-list-title">Lançamentos</h2>
          <p className="panel-subtitle">
            Totais calculados sobre a lista filtrada, a partir dos dados do servidor.
          </p>
        </div>
        <span className="status-pill">
          {isFetching && !isLoading ? 'Sincronizando...' : `${filtered.length} itens`}
        </span>
      </div>

      <div className="metric-grid">
        <article className="metric-card income">
          <span>Receitas</span>
          <strong>{formatCurrency(totals.income)}</strong>
        </article>
        <article className="metric-card expense">
          <span>Despesas</span>
          <strong>{formatCurrency(totals.expense)}</strong>
        </article>
        <article className="metric-card">
          <span>Resultado da lista</span>
          <strong>{formatCurrency(balance)}</strong>
        </article>
      </div>

      <div className="filters-row">
        <div className="field-group">
          <label htmlFor="filter-type">Tipo</label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          >
            <option value="ALL">Todos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="filter-category">Categoria</label>
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="filter-from">De</label>
          <input
            id="filter-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="filter-to">Até</label>
          <input
            id="filter-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button type="button" className="ghost-action compact-action" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      {isLoading && <p className="loading-state">Carregando transações...</p>}

      {!isLoading && transactions.length === 0 && (
        <p className="empty-state">
          Nenhuma transação registrada ainda. Use o formulário ao lado para começar.
        </p>
      )}

      {!isLoading && transactions.length > 0 && filtered.length === 0 && (
        <p className="empty-state">Nenhuma transação corresponde aos filtros selecionados.</p>
      )}

      {filtered.length > 0 && (
        <div className="category-table-wrap">
          <table className="category-table">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Tipo</th>
                <th scope="col">Categoria</th>
                <th scope="col">Descrição</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((transaction) => (
                <tr key={transaction.id}>
                  <td data-label="Data">{formatDate(transaction.date)}</td>
                  <td data-label="Tipo">
                    <span
                      className={`status-pill ${
                        transaction.type === 'INCOME' ? 'pill-income' : 'pill-expense'
                      }`}
                    >
                      {typeLabels[transaction.type]}
                    </span>
                  </td>
                  <td data-label="Categoria">{transaction.categoryName}</td>
                  <td data-label="Descrição">{transaction.description || 'Sem descrição'}</td>
                  <td data-label="Valor">
                    <span
                      className={transaction.type === 'INCOME' ? 'amount-income' : 'amount-expense'}
                    >
                      {transaction.type === 'INCOME' ? '+ ' : '- '}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <div className="list-footer">
          <button type="button" className="ghost-action compact-action" onClick={onRetry}>
            Atualizar lista
          </button>
        </div>
      )}
    </section>
  )
}
