import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'
import ErrorBoundary from './components/ErrorBoundary'
import Logo from './components/Logo'
import { restoreSession } from './store/authSlice'

function Splash() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse"><Logo /></div>
    </div>
  )
}

function Home() {
  const token = useSelector((s) => s.auth.token)
  return token ? <ChatPage /> : <LandingPage />
}

function Protected({ children }) {
  const token = useSelector((s) => s.auth.token)
  return token ? children : <Navigate to="/auth" replace />
}

function PublicOnly({ children }) {
  const token = useSelector((s) => s.auth.token)
  return token ? <Navigate to="/" replace /> : children
}

export default function App() {
  const dispatch = useDispatch()
  const { token, bootstrapped } = useSelector((s) => s.auth)
  const theme = useSelector((s) => s.ui.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    if (token) dispatch(restoreSession())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!bootstrapped) return <Splash />

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PublicOnly><AuthPage /></PublicOnly>} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/c/:threadId" element={<Protected><ChatPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </MotionConfig>
  )
}
