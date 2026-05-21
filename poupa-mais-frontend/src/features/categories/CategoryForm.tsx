import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CategoryResponse, CreateCategoryRequest } from '../../types/api'

interface CategoryFormProps {
  selectedCategory: CategoryResponse | null
  isSubmitting: boolean
  isDisabled: boolean
  onCreate: (payload: CreateCategoryRequest) => Promise<boolean>
  onUpdate: (category: CategoryResponse, payload: CreateCategoryRequest) => Promise<boolean>
  onCancelEdit: () => void
}

function normalize(value: string): string {
  return value.trim()
}

export function CategoryForm({
  selectedCategory,
  isSubmitting,
  isDisabled,
  onCreate,
  onUpdate,
  onCancelEdit,
}: CategoryFormProps) {
  const [form, setForm] = useState({
    name: selectedCategory?.name ?? '',
    description: selectedCategory?.description ?? '',
  })
  const isEditing = Boolean(selectedCategory)
  const canSubmit = !isDisabled && !isSubmitting && normalize(form.name).length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      name: normalize(form.name),
      description: normalize(form.description),
    }

    const succeeded = selectedCategory
      ? await onUpdate(selectedCategory, payload)
      : await onCreate(payload)

    if (succeeded) {
      setForm({ name: '', description: '' })
    }
  }

  return (
    <section className="panel category-form-panel" aria-labelledby="category-form-title">
      <div className="panel-header">
        <div>
          <h2 id="category-form-title">
            {isEditing ? 'Editar categoria' : 'Criar categoria'}
          </h2>
          {selectedCategory && (
            <p className="panel-subtitle">Selecionada: {selectedCategory.name}</p>
          )}
        </div>
        {isEditing && (
          <button
            type="button"
            className="ghost-action compact-action"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancelar edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field-group">
          <label htmlFor="category-name">Nome da categoria</label>
          <input
            id="category-name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            maxLength={120}
            disabled={isDisabled || isSubmitting}
            placeholder="Ex.: Moradia"
          />
        </div>

        <div className="field-group">
          <label htmlFor="category-description">Descrição</label>
          <input
            id="category-description"
            type="text"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            maxLength={255}
            disabled={isDisabled || isSubmitting}
            placeholder="Ex.: Aluguel, condomínio e contas da casa"
          />
        </div>

        <button type="submit" className="primary-action" disabled={!canSubmit}>
          {isSubmitting
            ? isEditing
              ? 'Salvando...'
              : 'Criando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Criar categoria'}
        </button>
      </form>
    </section>
  )
}
