import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { logout } from './authSlice'
import { sendMessage } from './chatSlice'

export const fetchThreads = createAsyncThunk('threads/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.listThreads()
    return res.threads || []
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const createThread = createAsyncThunk('threads/create', async (title, { rejectWithValue }) => {
  try {
    const res = await api.createThread(title)
    const now = new Date().toISOString()
    return { id: res.thread_id, title: res.title, created_at: now, updated_at: now }
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const removeThread = createAsyncThunk('threads/remove', async (id, { rejectWithValue }) => {
  try {
    await api.deleteThread(id)
    return id
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

const slice = createSlice({
  name: 'threads',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchThreads.pending, (s) => {
      s.status = 'loading'
      s.error = null
    })
      .addCase(fetchThreads.fulfilled, (s, a) => {
        s.status = 'ready'
        s.items = a.payload
      })
      .addCase(fetchThreads.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.payload || 'Could not load your chats.'
      })
      .addCase(createThread.fulfilled, (s, a) => {
        s.items.unshift(a.payload)
      })
      .addCase(removeThread.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t.id !== a.payload)
      })
      .addCase(sendMessage.pending, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.meta.arg.threadId)
        if (i > 0) {
          const [t] = s.items.splice(i, 1)
          t.updated_at = new Date().toISOString()
          s.items.unshift(t)
        }
      })
      .addCase(logout, () => ({ items: [], status: 'idle', error: null }))
  },
})

export default slice.reducer
