import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
import threads from './threadsSlice'
import chat from './chatSlice'
import ui from './uiSlice'
import { storage } from '../lib/storage'
import { configureApi } from '../lib/api'
import { logout } from './authSlice'

export const store = configureStore({
  reducer: { auth, threads, chat, ui },
  devTools: import.meta.env.DEV,
})

configureApi({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(logout()),
})

// Persist auth, theme and a bounded chat cache (debounced).
let timer
let last = {}
store.subscribe(() => {
  const { auth: a, ui: u, chat: c } = store.getState()
  if (a.token !== last.token || a.user !== last.user) {
    a.token ? storage.setAuth({ token: a.token, user: a.user }) : storage.clearAuth()
  }
  if (u.theme !== last.theme) storage.setTheme(u.theme)
  if (c.byThread !== last.byThread && a.user?.id) {
    clearTimeout(timer)
    const uid = a.user.id
    timer = setTimeout(() => {
      const trimmed = {}
      for (const [id, b] of Object.entries(store.getState().chat.byThread)) {
        trimmed[id] = { messages: b.messages.slice(-60), loaded: b.loaded, loading: false }
      }
      storage.setChat(uid, { byThread: trimmed })
    }, 400)
  }
  last = { token: a.token, user: a.user, theme: u.theme, byThread: c.byThread }
})
