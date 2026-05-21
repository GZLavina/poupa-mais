import type {
  ApiError,
  CategoryResponse,
  CreateCategoryRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateCategoryRequest,
  UserResponse,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

class HttpError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

function normalizeMessage(status: number, fallback: string): string {
  if (status === 401) return 'Sessao expirada ou credenciais invalidas.'
  if (status === 403) return 'Voce nao tem permissao para esta operacao.'
  if (status === 404) return 'Recurso nao encontrado.'
  if (status === 409) return 'Conflito de dados. Verifique os campos informados.'
  if (status === 400) return fallback || 'Dados invalidos. Revise os campos.'
  return fallback || 'Nao foi possivel concluir a operacao agora.'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const mergedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: mergedHeaders,
  })

  if (!response.ok) {
    let apiErrorMessage: string
    try {
      const apiError = (await response.json()) as ApiError
      apiErrorMessage = apiError.message ?? ''
    } catch {
      apiErrorMessage = ''
    }

    const message = normalizeMessage(response.status, apiErrorMessage)
    throw new HttpError(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function createUser(payload: CreateUserRequest): Promise<UserResponse> {
  return request<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createCategory(payload: CreateCategoryRequest, token: string): Promise<CategoryResponse> {
  return request<CategoryResponse>('/categories', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryRequest,
  token: string,
): Promise<CategoryResponse> {
  return request<CategoryResponse>(`/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  return request<void>(`/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
