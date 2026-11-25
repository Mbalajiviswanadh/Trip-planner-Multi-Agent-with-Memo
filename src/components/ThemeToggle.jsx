import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../store/uiSlice'

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const theme = useSelector((s) => s.ui.theme)
  const dark = theme === 'dark'
  return (
    <button className="icon-btn" onClick={() => dispatch(toggleTheme())} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }} transition={{ duration: 0.18 }}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
