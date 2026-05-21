import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createUser } from '../../api/client'
import type { CreateUserRequest, UserResponse } from '../../types/api'

interface UserState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  lastCreatedUser: UserResponse | null
  error: string | null
}

const initialState: UserState = {
  status: 'idle',
  lastCreatedUser: null,
  error: null,
}

export const registerUser = createAsyncThunk<UserResponse, CreateUserRequest, { rejectValue: string }>(
  'user/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      return await createUser(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao cadastrar usuário.'
      return rejectWithValue(message)
    }
  },
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastCreatedUser = action.payload
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Falha ao cadastrar usuário.'
      })
  },
})

export default userSlice.reducer
