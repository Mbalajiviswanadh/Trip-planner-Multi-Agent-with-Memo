import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { logout } from './authSlice'
import { sendMessage } from './chatSlice'

const PAGE_SIZE = 15

export const fetchThreads = createAsyncThunk(
  'threads/fetch',
  async ({ page = 1, append = false } = {}, { rejectWithValue }) => {
    try {
      const res = await api.listThreads(page, PAGE_SIZE)
      return {
        threads: res.threads || [],
        page: res.page || page,
        hasMore: Boolean(res.has_more),
        total: res.total ?? (res.threads?.length || 0),
        append,
      }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const createThread = createAsyncThunk('threads/create', async (title, { rejectWithValue }) => {
  try {
    const res = await api.createThread(title)
    const now = new Date().toISOString()
    return { id: res.thread_id, title: res.title, created_at: now, updated_at: now }
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const renameThread = createAsyncThunk(
  'threads/rename',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      const res = await api.renameThread(id, title)
      return res.thread || { id, title }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const removeThread = createAsyncThunk('threads/remove', async (id, { rejectWithValue }) => {
  try {
    await api.deleteThread(id)
    return id
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

const initialState = {
  items: [],
  status: 'idle',
  loadingMore: false,
  error: null,
  page: 1,
  hasMore: false,
  total: 0,
}

const slice = createSlice({
  name: 'threads',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchThreads.pending, (s, a) => {
      if (a.meta.arg?.append) {
        s.loadingMore = true
      } else {
        s.status = 'loading'
        s.error = null
      }
    })
      .addCase(fetchThreads.fulfilled, (s, a) => {
        const { threads, page, hasMore, total, append } = a.payload
        s.status = 'ready'
        s.loadingMore = false
        s.page = page
        s.hasMore = hasMore
        s.total = total
        if (append) {
          const seen = new Set(s.items.map((t) => t.id))
          threads.forEach((t) => {
            if (!seen.has(t.id)) s.items.push(t)
          })
        } else {
          s.items = threads
        }
      })
      .addCase(fetchThreads.rejected, (s, a) => {
        s.loadingMore = false
        if (!a.meta.arg?.append) {
          s.status = 'error'
          s.error = a.payload || 'Could not load your chats.'
        }
      })
      .addCase(createThread.fulfilled, (s, a) => {
        s.items.unshift(a.payload)
        s.total += 1
      })
      .addCase(renameThread.fulfilled, (s, a) => {
        const idx = s.items.findIndex((t) => t.id === a.payload.id)
        if (idx !== -1) {
          s.items[idx] = { ...s.items[idx], ...a.payload }
        }
      })
      .addCase(removeThread.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t.id !== a.payload)
        s.total = Math.max(0, s.total - 1)
      })
      .addCase(sendMessage.pending, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.meta.arg.threadId)
        if (i > 0) {
          const [t] = s.items.splice(i, 1)
          t.updated_at = new Date().toISOString()
          s.items.unshift(t)
        }
      })
      .addCase(logout, () => initialState)
  },
})

export default slice.reducer
