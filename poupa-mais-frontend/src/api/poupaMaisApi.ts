import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { RootState } from '../app/store'
import type {
  ApiError,
  BalanceQuery,
  BalanceResponse,
  CategoryResponse,
  CategorySummaryQuery,
  CategorySummaryResponse,
  CreateCategoryRequest,
  CreateTransactionRequest,
  TransactionResponse,
  UpdateCategoryRequest,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081'

function normalizeMessage(status: number | string | undefined, fallback: string): string {
  if (status === 401) return 'Sessão expirada ou credenciais inválidas.'
  if (status === 403) return 'Você não tem permissão para esta operação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 409) return 'Conflito de dados. Verifique os campos informados.'
  if (status === 400) return fallback || 'Dados inválidos. Revise os campos.'
  if (status === 'FETCH_ERROR') return 'Não foi possível conectar à API.'
  if (status === 'PARSING_ERROR') return 'A API retornou uma resposta inválida.'
  if (status === 'TIMEOUT_ERROR') return 'A API demorou para responder.'
  return fallback || 'Não foi possível concluir a operação agora.'
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function isApiError(data: unknown): data is ApiError {
  return typeof data === 'object' && data !== null && 'message' in data
}

export function getApiErrorMessage(error: unknown, fallback = ''): string | null {
  if (!error) {
    return null
  }

  if (isFetchBaseQueryError(error)) {
    const apiMessage = isApiError(error.data) ? error.data.message : ''
    return normalizeMessage(error.status, apiMessage || fallback)
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback || 'Não foi possível concluir a operação agora.'
}

export const poupaMaisApi = createApi({
  reducerPath: 'poupaMaisApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['Category', 'Transaction', 'Summary'],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => '/categories',
      providesTags: (result) =>
        result
          ? [
              ...result.map((category) => ({ type: 'Category' as const, id: category.id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation<
      CategoryResponse,
      { id: number; payload: UpdateCategoryRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    getTransactions: builder.query<TransactionResponse[], void>({
      query: () => '/transactions',
      providesTags: (result) =>
        result
          ? [
              ...result.map((transaction) => ({ type: 'Transaction' as const, id: transaction.id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    createTransaction: builder.mutation<TransactionResponse, CreateTransactionRequest>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Summary', id: 'BALANCE' },
        { type: 'Summary', id: 'BY_CATEGORY' },
      ],
    }),
    getBalance: builder.query<BalanceResponse, BalanceQuery | void>({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.startDate) search.set('startDate', params.startDate)
        if (params?.endDate) search.set('endDate', params.endDate)
        const queryString = search.toString()
        return queryString ? `/summary/balance?${queryString}` : '/summary/balance'
      },
      providesTags: [{ type: 'Summary', id: 'BALANCE' }],
    }),
    getCategorySummary: builder.query<CategorySummaryResponse, CategorySummaryQuery | void>({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.startDate) search.set('startDate', params.startDate)
        if (params?.endDate) search.set('endDate', params.endDate)
        if (params?.type) search.set('type', params.type)
        const queryString = search.toString()
        return queryString ? `/summary/by-category?${queryString}` : '/summary/by-category'
      },
      providesTags: [{ type: 'Summary', id: 'BY_CATEGORY' }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useGetBalanceQuery,
  useGetCategorySummaryQuery,
} = poupaMaisApi
