import { useState } from 'react'
import type { FormEvent } from 'react'
import type {
  CategoryResponse,
  CreateTransactionRequest,
  TransactionType,
} from '../../types/api'
import { todayIso } from '../../utils/format'

interface TransactionFormProps {
  categories: CategoryResponse[]
  isSubmitting: boolean
  isDisabled: boolean
  onCreate: (payload: CreateTransactionRequest) => Promise<boolean>
}

const initialForm = () => ({
  type: 'EXPENSE' as TransactionType,
  amount: '',
  date: todayIso(),
  categoryId: '',
  description: '',
})

export function TransactionForm({
  categories,
  isSubmitting,
  isDisabled,
  onCreate,
}: TransactionFormProps) {
  const [form, setForm] = useState(initialForm)

  const hasCategories = categories.length > 0
  const parsedAmount = Number(form.amount)
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount > 0
  const canSubmit =
    !isDisabled && !isSubmitting && hasCategories && amountIsValid && form.categoryId !== ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    const payload: CreateTransactionRequest = {
      type: form.type,
      amount: Number(parsedAmount.toFixed(2)),
      date: form.date,
      description: form.description.trim(),
      categoryId: Number(form.categoryId),
    }

    const succeeded = await onCreate(payload)

    if (succeeded) {
      setForm((prev) => ({ ...initialForm(), type: prev.type }))
    }
  }

  return (
    <section className="panel" aria-labelledby="transaction-form-title">
      <div className="panel-header">
        <h2 id="transaction-form-title">Nova transação</h2>
      </div>

      {!hasCategories && (
        <p className="empty-state">
          Cadastre ao menos uma categoria antes de registrar transações.
        </p>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field-group">
          <span className="field-label">Tipo</span>
          <div className="segment-control" role="group" aria-label="Tipo de transação">
            <button
              type="button"
              className={form.type === 'EXPENSE' ? 'active' : ''}
              onClick={() => setForm((prev) => ({ ...prev, type: 'EXPENSE' }))}
              disabled={isDisabled || isSubmitting}
            >
              Despesa
            </button>
            <button
              type="button"
              className={form.type === 'INCOME' ? 'active' : ''}
              onClick={() => setForm((prev) => ({ ...prev, type: 'INCOME' }))}
              disabled={isDisabled || isSubmitting}
            >
              Receita
            </button>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="transaction-amount">Valor</label>
          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            required
            disabled={isDisabled || isSubmitting || !hasCategories}
            placeholder="0,00"
          />
        </div>

        <div className="field-group">
          <label htmlFor="transaction-date">Data</label>
          <input
            id="transaction-date"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
            disabled={isDisabled || isSubmitting || !hasCategories}
          />
        </div>

        <div className="field-group">
          <label htmlFor="transaction-category">Categoria</label>
          <select
            id="transaction-category"
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            required
            disabled={isDisabled || isSubmitting || !hasCategories}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="transaction-description">Descrição</label>
          <input
            id="transaction-description"
            type="text"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            maxLength={255}
            disabled={isDisabled || isSubmitting || !hasCategories}
            placeholder="Ex.: Mercado da semana"
          />
        </div>

        <button type="submit" className="primary-action" disabled={!canSubmit}>
          {isSubmitting ? 'Registrando...' : 'Registrar transação'}
        </button>
      </form>
    </section>
  )
}
