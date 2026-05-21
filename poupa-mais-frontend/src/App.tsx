import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { login, logout } from './features/auth/authSlice'
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from './features/categories/categoriesSlice'
import { registerUser } from './features/user/userSlice'

function App() {
  const dispatch = useAppDispatch()

  const auth = useAppSelector((state) => state.auth)
  const user = useAppSelector((state) => state.user)
  const categories = useAppSelector((state) => state.categories)

  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [editForm, setEditForm] = useState({ id: '', name: '', description: '' })

  const isCategoryBusy = useMemo(
    () =>
      categories.createStatus === 'loading' ||
      categories.updateStatus === 'loading' ||
      categories.deleteStatus === 'loading',
    [categories.createStatus, categories.deleteStatus, categories.updateStatus],
  )

  const hasToken = Boolean(auth.token)

  function normalize(value: string): string {
    return value.trim()
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await dispatch(
      registerUser({
        name: normalize(registerForm.name),
        email: normalize(registerForm.email),
        password: registerForm.password,
      }),
    )

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

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await dispatch(
      createCategoryAction({
        name: normalize(createForm.name),
        description: normalize(createForm.description),
      }),
    )

    setCreateForm({ name: '', description: '' })
  }

  async function handleEditCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editForm.id) {
      return
    }

    await dispatch(
      updateCategoryAction({
        id: Number(editForm.id),
        payload: {
          name: normalize(editForm.name),
          description: normalize(editForm.description),
        },
      }),
    )

    setEditForm({ id: '', name: '', description: '' })
  }

  async function handleDeleteCategory(id: number) {
    await dispatch(deleteCategoryAction(id))
  }

  return (
    <main className="app-shell">
      <h1>Poupa Mais Frontend</h1>
      <p className="subtitle">Arquitetura Flux com Redux para UC-01, UC-08, UC-09 e UC-10.</p>

      <section className="card">
        <h2>UC-01 Cadastrar Usuario</h2>
        <form onSubmit={handleRegister} className="form-grid">
          <input
            type="text"
            placeholder="Nome"
            value={registerForm.name}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            maxLength={120}
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
            required
            maxLength={160}
          />
          <input
            type="password"
            placeholder="Senha (minimo 8 caracteres)"
            value={registerForm.password}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
            required
            minLength={8}
            maxLength={72}
          />
          <button type="submit" disabled={user.status === 'loading'}>
            {user.status === 'loading' ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        {user.status === 'succeeded' && user.lastCreatedUser && (
          <p className="success">Usuario criado com sucesso: {user.lastCreatedUser.email}</p>
        )}
        {user.error && <p className="error">{user.error}</p>}
      </section>

      <section className="card">
        <h2>Autenticacao</h2>
        <form onSubmit={handleLogin} className="form-grid">
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={loginForm.password}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <button type="submit" disabled={auth.status === 'loading'}>
            {auth.status === 'loading' ? 'Entrando...' : 'Entrar'}
          </button>
          <button type="button" onClick={() => dispatch(logout())} disabled={!hasToken}>
            Sair
          </button>
        </form>
        <p className="token-status">
          Status do token: {hasToken ? 'Autenticado' : 'Sem autenticacao'}
        </p>
        {auth.error && <p className="error">{auth.error}</p>}
      </section>

      <section className="card">
        <h2>UC-08 Criar Categoria</h2>
        <form onSubmit={handleCreateCategory} className="form-grid">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            maxLength={120}
            disabled={!hasToken || isCategoryBusy}
          />
          <input
            type="text"
            placeholder="Descricao"
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
            maxLength={255}
            disabled={!hasToken || isCategoryBusy}
          />
          <button type="submit" disabled={!hasToken || isCategoryBusy}>
            {categories.createStatus === 'loading' ? 'Criando...' : 'Criar categoria'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>UC-09 Editar Categoria</h2>
        <form onSubmit={handleEditCategory} className="form-grid">
          <input
            type="number"
            placeholder="ID da categoria"
            value={editForm.id}
            onChange={(event) => setEditForm((prev) => ({ ...prev, id: event.target.value }))}
            required
            disabled={!hasToken || isCategoryBusy}
          />
          <input
            type="text"
            placeholder="Novo nome"
            value={editForm.name}
            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            maxLength={120}
            disabled={!hasToken || isCategoryBusy}
          />
          <input
            type="text"
            placeholder="Nova descricao"
            value={editForm.description}
            onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
            maxLength={255}
            disabled={!hasToken || isCategoryBusy}
          />
          <button type="submit" disabled={!hasToken || isCategoryBusy}>
            {categories.updateStatus === 'loading' ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>UC-10 Excluir Categoria</h2>
        <ul className="category-list">
          {categories.items.length === 0 && <li>Nenhuma categoria registrada nesta sessao.</li>}
          {categories.items.map((category) => (
            <li key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <p>{category.description || 'Sem descricao'}</p>
                <small>ID: {category.id}</small>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category.id)}
                disabled={!hasToken || isCategoryBusy}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
        {categories.error && <p className="error">{categories.error}</p>}
      </section>
    </main>
  )
}

export default App
