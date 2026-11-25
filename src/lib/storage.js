const safe = (fn, fallback = null) => {
  try { return fn() } catch { return fallback }
}

export const storage = {
  getAuth: () => safe(() => JSON.parse(localStorage.getItem('tm_auth') || 'null')),
  setAuth: (v) => safe(() => localStorage.setItem('tm_auth', JSON.stringify(v))),
  clearAuth: () => safe(() => localStorage.removeItem('tm_auth')),

  getTheme: () =>
    safe(() => localStorage.getItem('tm_theme')) ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  setTheme: (t) => safe(() => localStorage.setItem('tm_theme', t)),

  getChat: (userId) => (userId ? safe(() => JSON.parse(localStorage.getItem(`tm_chat_${userId}`) || 'null')) : null),
  setChat: (userId, v) => userId && safe(() => localStorage.setItem(`tm_chat_${userId}`, JSON.stringify(v))),
}
