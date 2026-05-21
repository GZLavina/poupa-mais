import type { CategoryResponse } from '../../types/api'

interface CategoryListProps {
  categories: CategoryResponse[]
  selectedCategoryId: number | null
  pendingDeleteCategoryId: number | null
  isLoading: boolean
  isFetching: boolean
  isDeleting: boolean
  isDisabled: boolean
  onSelectCategory: (category: CategoryResponse) => void
  onRequestDelete: (category: CategoryResponse) => void
  onCancelDelete: () => void
  onConfirmDelete: (category: CategoryResponse) => void
  onRetry: () => void
}

export function CategoryList({
  categories,
  selectedCategoryId,
  pendingDeleteCategoryId,
  isLoading,
  isFetching,
  isDeleting,
  isDisabled,
  onSelectCategory,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onRetry,
}: CategoryListProps) {
  return (
    <section className="panel" aria-labelledby="category-list-title">
      <div className="panel-header">
        <div>
          <h2 id="category-list-title">Categorias cadastradas</h2>
          <p className="panel-subtitle">
            Selecione uma categoria para editar sem informar ID manualmente.
          </p>
        </div>
        <span className="status-pill">
          {isFetching && !isLoading ? 'Sincronizando...' : `${categories.length} itens`}
        </span>
      </div>

      {isLoading && <p className="loading-state">Carregando categorias...</p>}

      {!isLoading && categories.length === 0 && (
        <p className="empty-state">
          Nenhuma categoria encontrada. Crie a primeira categoria no formulário ao lado.
        </p>
      )}

      {categories.length > 0 && (
        <div className="category-table-wrap">
          <table className="category-table">
            <thead>
              <tr>
                <th scope="col">Categoria</th>
                <th scope="col">Descrição</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isSelected = category.id === selectedCategoryId
                const isConfirmingDelete = category.id === pendingDeleteCategoryId
                const rowIsBusy = isDeleting && isConfirmingDelete

                return (
                  <tr key={category.id} className={isSelected ? 'selected-row' : ''}>
                    <td data-label="Categoria">
                      <strong>{category.name}</strong>
                      <small>ID {category.id}</small>
                    </td>
                    <td data-label="Descrição">{category.description || 'Sem descrição'}</td>
                    <td data-label="Status">
                      <span className="status-pill muted">Ativa</span>
                    </td>
                    <td data-label="Ações">
                      {isConfirmingDelete ? (
                        <div className="row-actions confirm-actions">
                          <span>Confirmar exclusão?</span>
                          <button
                            type="button"
                            className="danger-action compact-action"
                            onClick={() => onConfirmDelete(category)}
                            disabled={isDisabled || rowIsBusy}
                          >
                            {rowIsBusy ? 'Excluindo...' : 'Confirmar'}
                          </button>
                          <button
                            type="button"
                            className="ghost-action compact-action"
                            onClick={onCancelDelete}
                            disabled={rowIsBusy}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="ghost-action compact-action"
                            onClick={() => onSelectCategory(category)}
                            disabled={isDisabled}
                          >
                            {isSelected ? 'Editando' : 'Editar'}
                          </button>
                          <button
                            type="button"
                            className="danger-action compact-action"
                            onClick={() => onRequestDelete(category)}
                            disabled={isDisabled}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
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
