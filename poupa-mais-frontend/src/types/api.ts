export interface ApiError {
  timestamp: string
  status: number
  message: string
  path: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface UserResponse {
  id: number
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
}

export interface CreateCategoryRequest {
  name: string
  description: string
}

export interface UpdateCategoryRequest {
  name: string
  description: string
}

export interface CategoryResponse {
  id: number
  name: string
  description: string
}
