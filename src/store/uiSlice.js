import { createSlice } from '@reduxjs/toolkit'
import { storage } from '../lib/storage'

const slice = createSlice({
  name: 'ui',
  initialState: {
    theme: storage.getTheme(),
    sidebarOpen: false,
    flowOpen: typeof window !== 'undefined' && window.innerWidth >= 1280,
    flowMessageId: null,
    flowTab: 'agent', // persists the active tab across thread switches
  },
  reducers: {
    toggleTheme(s) {
      s.theme = s.theme === 'dark' ? 'light' : 'dark'
    },
    setSidebar(s, a) {
      s.sidebarOpen = a.payload
    },
    setFlowOpen(s, a) {
      s.flowOpen = a.payload
    },
    setFlowTab(s, a) {
      s.flowTab = a.payload
    },
    showFlowFor(s, a) {
      s.flowMessageId = a.payload
      s.flowOpen = true
    },
  },
})

export const { toggleTheme, setSidebar, setFlowOpen, setFlowTab, showFlowFor } = slice.actions
export default slice.reducer
