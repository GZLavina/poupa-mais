import { configureStore } from '@reduxjs/toolkit'
import { poupaMaisApi } from '../api/poupaMaisApi'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [poupaMaisApi.reducerPath]: poupaMaisApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(poupaMaisApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
