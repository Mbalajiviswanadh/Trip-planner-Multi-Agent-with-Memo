import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { storage } from '../lib/storage'

const stored = storage.getAuth()

const initialState = {
  user: stored?.user || null,
  token: stored?.token || null,
  status: 'idle', // idle | loading
  error: null,
  bootstrapped: !stored?.token,
}

const fail = (e) => e?.message || 'Something went wrong. Please try again.'

export const login = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    const res = await api.login(body)
    return { user: res.user, token: res.access_token }
  } catch (e) {
    return rejectWithValue(fail(e))
  }
})

export const register = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    const res = await api.register(body)
    return { user: res.user, token: res.access_token }
  } catch (e) {
    return rejectWithValue(fail(e))
  }
})

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    const res = await api.me()
    const u = res.user
    return { id: u.id, name: u.name, email: u.email }
  } catch (e) {
    return rejectWithValue(fail(e))
  }
})

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      state.bootstrapped = true
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (b) => {
    for (const thunk of [login, register]) {
      b.addCase(thunk.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
        .addCase(thunk.fulfilled, (s, a) => {
          s.status = 'idle'
          s.user = a.payload.user
          s.token = a.payload.token
          s.bootstrapped = true
        })
        .addCase(thunk.rejected, (s, a) => {
          s.status = 'idle'
          s.error = a.payload || 'Something went wrong.'
        })
    }
    b.addCase(restoreSession.fulfilled, (s, a) => {
      s.user = a.payload
      s.bootstrapped = true
    }).addCase(restoreSession.rejected, (s) => {
      s.bootstrapped = true // 401 is handled by logout; network errors keep the cached session
    })
  },
})

export const { logout, clearAuthError } = slice.actions
export default slice.reducer
