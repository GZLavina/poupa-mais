import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createCategory, deleteCategory, updateCategory } from '../../api/client'
import type { RootState } from '../../app/store'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/api'

interface CategoriesState {
  items: CategoryResponse[]
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CategoriesState = {
  items: [],
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  error: null,
}

function getToken(state: RootState): string {
  const token = state.auth.token
  if (!token) {
    throw new Error('Usuario nao autenticado. Faca login para continuar.')
  }
  return token
}

export const createCategoryAction = createAsyncThunk<CategoryResponse, CreateCategoryRequest, { state: RootState; rejectValue: string }>(
  'categories/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState())
      return await createCategory(payload, token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar categoria.'
      return rejectWithValue(message)
    }
  },
)

export const updateCategoryAction = createAsyncThunk<
  CategoryResponse,
  { id: number; payload: UpdateCategoryRequest },
  { state: RootState; rejectValue: string }
>('categories/update', async ({ id, payload }, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState())
    return await updateCategory(id, payload, token)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao editar categoria.'
    return rejectWithValue(message)
  }
})

export const deleteCategoryAction = createAsyncThunk<number, number, { state: RootState; rejectValue: string }>(
  'categories/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState())
      await deleteCategory(id, token)
      return id
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao excluir categoria.'
      return rejectWithValue(message)
    }
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCategoryAction.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createCategoryAction.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.items.push(action.payload)
      })
      .addCase(createCategoryAction.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload ?? 'Falha ao criar categoria.'
      })
      .addCase(updateCategoryAction.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = null
      })
      .addCase(updateCategoryAction.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        state.items = state.items.map((category) =>
          category.id === action.payload.id ? action.payload : category,
        )
      })
      .addCase(updateCategoryAction.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error = action.payload ?? 'Falha ao editar categoria.'
      })
      .addCase(deleteCategoryAction.pending, (state) => {
        state.deleteStatus = 'loading'
        state.error = null
      })
      .addCase(deleteCategoryAction.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded'
        state.items = state.items.filter((category) => category.id !== action.payload)
      })
      .addCase(deleteCategoryAction.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.error = action.payload ?? 'Falha ao excluir categoria.'
      })
  },
})

export default categoriesSlice.reducer
