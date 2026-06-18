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

export interface RegistrationResponse extends UserResponse {
  token: string
  tokenType: string
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

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface CreateTransactionRequest {
  type: TransactionType
  amount: number
  date: string
  description: string
  categoryId: number
}

export interface TransactionResponse {
  id: number
  type: TransactionType
  amount: number
  date: string
  description: string | null
  categoryId: number
  categoryName: string
}

export interface BalanceQuery {
  startDate?: string
  endDate?: string
}

export interface BalanceResponse {
  startDate: string | null
  endDate: string | null
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategorySummaryQuery {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

export interface CategorySummaryItem {
  categoryId: number
  categoryName: string
  type: TransactionType
  total: number
  percentage: number
}

export interface CategorySummaryResponse {
  startDate: string | null
  endDate: string | null
  type: TransactionType | null
  total: number
  items: CategorySummaryItem[]
}
