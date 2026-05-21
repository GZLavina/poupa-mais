import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import {
  getApiErrorMessage,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from './api/poupaMaisApi'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { login, logout } from './features/auth/authSlice'
import { CategoryForm } from './features/categories/CategoryForm'
import { CategoryList } from './features/categories/CategoryList'
import { registerUser } from './features/user/userSlice'
import type { CategoryResponse, CreateCategoryRequest } from './types/api'

type AppView = 'dashboard' | 'transactions' | 'categories'

const views: Array<{ id: AppView; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transações' },
  { id: 'categories', label: 'Categorias' },
]

function normalize(value: string): string {
  return value.trim()
}

function App() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const hasToken = Boolean(auth.token)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')

  if (!hasToken) {
    return <PublicSession />
  }

  function handleLogout() {
    dispatch(logout())
    setCurrentView('dashboard')
  }

  return (
    <AuthenticatedShell
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={handleLogout}
    />
  )
}

function PublicSession() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const user = useAppSelector((state) => state.user)

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login')
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const email = normalize(registerForm.email)
    await dispatch(
      registerUser({
        name: normalize(registerForm.name),
        email,
        password: registerForm.password,
      }),
    )

    setLoginForm((prev) => ({ ...prev, email }))
    setRegisterForm({ name: '', email: '', password: '' })
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await dispatch(
      login({
        email: normalize(loginForm.email),
        password: loginForm.password,
      }),
    )
  }

  return (
    <main className="public-layout">
      <section className="brand-panel" aria-labelledby="public-title">
        <div className="brand-copy-block">
          <p className="eyebrow">PoupaMais</p>
          <h1 id="public-title">Controle financeiro pessoal</h1>
          <p className="brand-copy">
            Acompanhe saldo, transações e categorias em uma área simples para tomar decisões com
            clareza.
          </p>
        </div>

        <div className="login-visual" aria-hidden="true">
          <div className="visual-header">
            <span>Visão do mês</span>
            <strong>Maio</strong>
          </div>
          <div className="visual-balance">
            <span>Saldo atual</span>
            <strong>R$ 4.280,00</strong>
          </div>
          <div className="visual-metrics">
            <div>
              <span>Receitas</span>
              <strong>R$ 6.150</strong>
            </div>
            <div>
              <span>Despesas</span>
              <strong>R$ 1.870</strong>
            </div>
          </div>
          <div className="visual-chart" aria-label="Distribuição visual de gastos">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="visual-activity">
            <div>
              <span className="activity-dot income-dot" />
              <span>Salário</span>
              <strong>+ R$ 5.200</strong>
            </div>
            <div>
              <span className="activity-dot expense-dot" />
              <span>Moradia</span>
              <strong>- R$ 1.200</strong>
            </div>
            <div>
              <span className="activity-dot neutral-dot" />
              <span>Mercado</span>
              <strong>- R$ 430</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="session-panel" aria-label="Acesso ao PoupaMais">
        <div className="segment-control" role="tablist" aria-label="Modo de acesso">
          <button
            type="button"
            className={activeMode === 'login' ? 'active' : ''}
            onClick={() => setActiveMode('login')}
            role="tab"
            aria-selected={activeMode === 'login'}
          >
            Entrar
          </button>
          <button
            type="button"
            className={activeMode === 'register' ? 'active' : ''}
            onClick={() => setActiveMode('register')}
            role="tab"
            aria-selected={activeMode === 'register'}
          >
            Cadastrar
          </button>
        </div>

        {activeMode === 'login' ? (
          <form onSubmit={handleLogin} className="form-grid">
            <div className="field-group">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                placeholder="Sua senha"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className="primary-action" disabled={auth.status === 'loading'}>
              {auth.status === 'loading' ? 'Entrando...' : 'Entrar'}
            </button>
            {auth.error && <p className="error">{auth.error}</p>}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="form-grid">
            <div className="field-group">
              <label htmlFor="register-name">Nome</label>
              <input
                id="register-name"
                type="text"
                placeholder="Nome completo"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
                maxLength={120}
              />
            </div>
            <div className="field-group">
              <label htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                maxLength={160}
              />
            </div>
            <div className="field-group">
              <label htmlFor="register-password">Senha</label>
              <input
                id="register-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
                minLength={8}
                maxLength={72}
              />
            </div>
            <button type="submit" className="primary-action" disabled={user.status === 'loading'}>
              {user.status === 'loading' ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            {user.status === 'succeeded' && user.lastCreatedUser && (
              <p className="success">Usuário criado: {user.lastCreatedUser.email}</p>
            )}
            {user.error && <p className="error">{user.error}</p>}
          </form>
        )}
      </section>
    </main>
  )
}

interface AuthenticatedShellProps {
  currentView: AppView
  onChangeView: (view: AppView) => void
  onLogout: () => void
}

function AuthenticatedShell({ currentView, onChangeView, onLogout }: AuthenticatedShellProps) {
  return (
    <div className="authenticated-layout">
      <aside className="sidebar">
        <div className="app-mark">
          <span className="mark-symbol">P</span>
          <div>
            <strong>PoupaMais</strong>
            <small>Área autenticada</small>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegacao principal">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={currentView === view.id ? 'active' : ''}
              onClick={() => onChangeView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <nav className="mobile-nav" aria-label="Navegacao principal compacta">
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                className={currentView === view.id ? 'active' : ''}
                onClick={() => onChangeView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </nav>
          <button type="button" className="ghost-action" onClick={onLogout}>
            Sair
          </button>
        </header>

        <main className="content-shell">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'transactions' && <TransactionsView />}
          {currentView === 'categories' && <CategoriesView />}
        </main>
      </div>
    </div>
  )
}

function DashboardView() {
  return (
    <section className="view-stack" aria-labelledby="dashboard-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1 id="dashboard-title">Dashboard</h1>
        </div>
        <select aria-label="Período do dashboard" defaultValue="month">
          <option value="month">Este mês</option>
          <option value="quarter">Trimestre</option>
          <option value="year">Ano</option>
        </select>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Saldo</span>
          <strong>R$ 0,00</strong>
        </article>
        <article className="metric-card income">
          <span>Receitas</span>
          <strong>R$ 0,00</strong>
        </article>
        <article className="metric-card expense">
          <span>Despesas</span>
          <strong>R$ 0,00</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Evolução financeira</h2>
          <span className="status-pill">Aguardando transações</span>
        </div>
        <div className="chart-placeholder" aria-label="Gráfico de evolução vazio">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Últimas transações</h2>
        </div>
        <p className="empty-state">Nenhuma transação disponível nesta fase.</p>
      </section>
    </section>
  )
}

function TransactionsView() {
  return (
    <section className="view-stack" aria-labelledby="transactions-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Lançamentos</p>
          <h1 id="transactions-title">Transações</h1>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Nova transação</h2>
          <span className="status-pill muted">Endpoint pendente</span>
        </div>
        <div className="placeholder-form" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="empty-state">
          A estrutura da tela está pronta para receber o fluxo real quando os endpoints de
          transações estiverem disponíveis.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de transações</h2>
        </div>
        <p className="empty-state">Nenhuma transação carregada.</p>
      </section>
    </section>
  )
}

function CategoriesView() {
  const hasToken = useAppSelector((state) => Boolean(state.auth.token))
  const categoriesQuery = useGetCategoriesQuery(undefined, { skip: !hasToken })
  const [createCategory, createCategoryStatus] = useCreateCategoryMutation()
  const [updateCategory, updateCategoryStatus] = useUpdateCategoryMutation()
  const [deleteCategory, deleteCategoryStatus] = useDeleteCategoryMutation()

  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null)
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<CategoryResponse | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const categories = categoriesQuery.data ?? []
  const isMutationBusy =
    createCategoryStatus.isLoading ||
    updateCategoryStatus.isLoading ||
    deleteCategoryStatus.isLoading
  const isCategoryDisabled = !hasToken || isMutationBusy
  const categoryError = getApiErrorMessage(
    categoriesQuery.error ??
      createCategoryStatus.error ??
      updateCategoryStatus.error ??
      deleteCategoryStatus.error,
    'Falha ao processar categoria.',
  )

  function resetCategoryFeedback() {
    setSuccessMessage('')
    createCategoryStatus.reset()
    updateCategoryStatus.reset()
    deleteCategoryStatus.reset()
  }

  async function handleCreateCategory(payload: CreateCategoryRequest) {
    resetCategoryFeedback()

    try {
      const createdCategory = await createCategory(payload).unwrap()
      setSuccessMessage(`Categoria "${createdCategory.name}" criada.`)
      return true
    } catch {
      // RTK Query stores the normalized error in createCategoryStatus.error.
      return false
    }
  }

  async function handleUpdateCategory(category: CategoryResponse, payload: CreateCategoryRequest) {
    resetCategoryFeedback()

    try {
      const updatedCategory = await updateCategory({
        id: category.id,
        payload,
      }).unwrap()
      setSelectedCategory(null)
      setSuccessMessage(`Categoria "${updatedCategory.name}" atualizada.`)
      return true
    } catch {
      // RTK Query stores the normalized error in updateCategoryStatus.error.
      return false
    }
  }

  async function handleDeleteCategory(category: CategoryResponse) {
    resetCategoryFeedback()

    try {
      await deleteCategory(category.id).unwrap()
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null)
      }
      setPendingDeleteCategory(null)
      setSuccessMessage(`Categoria "${category.name}" excluída.`)
    } catch {
      // RTK Query stores the normalized error in deleteCategoryStatus.error.
    }
  }

  function handleSelectCategory(category: CategoryResponse) {
    resetCategoryFeedback()
    setPendingDeleteCategory(null)
    setSelectedCategory(category)
  }

  function handleRetryCategories() {
    resetCategoryFeedback()
    void categoriesQuery.refetch()
  }

  return (
    <section className="view-stack" aria-labelledby="categories-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Classificação</p>
          <h1 id="categories-title">Categorias</h1>
        </div>
      </div>

      <div className="category-workflow">
        <CategoryForm
          key={selectedCategory?.id ?? 'create-category'}
          selectedCategory={selectedCategory}
          isSubmitting={createCategoryStatus.isLoading || updateCategoryStatus.isLoading}
          isDisabled={!hasToken || deleteCategoryStatus.isLoading}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onCancelEdit={() => {
            resetCategoryFeedback()
            setSelectedCategory(null)
          }}
        />

        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategory?.id ?? null}
          pendingDeleteCategoryId={pendingDeleteCategory?.id ?? null}
          isLoading={categoriesQuery.isLoading}
          isFetching={categoriesQuery.isFetching}
          isDeleting={deleteCategoryStatus.isLoading}
          isDisabled={isCategoryDisabled}
          onSelectCategory={handleSelectCategory}
          onRequestDelete={(category) => {
            resetCategoryFeedback()
            setPendingDeleteCategory(category)
          }}
          onCancelDelete={() => setPendingDeleteCategory(null)}
          onConfirmDelete={handleDeleteCategory}
          onRetry={handleRetryCategories}
        />
      </div>

      {(successMessage || categoryError) && (
        <div className="feedback-row">
          {successMessage && <p className="success">{successMessage}</p>}
          {categoryError && <p className="error">{categoryError}</p>}
          <button type="button" className="ghost-action" onClick={resetCategoryFeedback}>
            Dispensar
          </button>
        </div>
      )}
    </section>
  )
}

export default App
