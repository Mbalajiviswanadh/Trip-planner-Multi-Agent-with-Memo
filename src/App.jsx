import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ErrorBoundary from './components/ErrorBoundary'
import { restoreSession } from './store/authSlice'

function Protected({ children }) {
  const dispatch = useDispatch()
  const { token, bootstrapped } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token && !bootstrapped) dispatch(restoreSession())
  }, [dispatch, token, bootstrapped])

  return token ? children : <Navigate to="/auth" replace />
}

function PublicOnly({ children }) {
  const token = useSelector((s) => s.auth.token)
  return token ? <Navigate to="/chat" replace /> : children
}

export default function App() {
  const theme = useSelector((s) => s.ui.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PublicOnly><AuthPage /></PublicOnly>} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
            <Route path="/c/:threadId" element={<Protected><ChatPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </MotionConfig>
  )
}
