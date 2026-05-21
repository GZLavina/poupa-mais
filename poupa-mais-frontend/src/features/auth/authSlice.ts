import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser } from '../../api/client'
import type { LoginRequest } from '../../types/api'

interface AuthState {
  token: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'failed'
  error: string | null
}

const TOKEN_STORAGE_KEY = 'poupaMaisToken'

function getPersistedToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

const initialToken = getPersistedToken()

const initialState: AuthState = {
  token: initialToken,
  status: initialToken ? 'authenticated' : 'idle',
  error: null,
}

export const login = createAsyncThunk<string, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginUser(payload)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
      }

      return response.token
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar usuário.'
      return rejectWithValue(message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.status = 'idle'
      state.error = null
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.token = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Falha ao autenticar usuário.'
      })
  },
})

export const { logout } = authSlice.actions

export default authSlice.reducer
