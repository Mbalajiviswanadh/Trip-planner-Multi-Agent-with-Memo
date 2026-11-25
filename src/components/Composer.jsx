import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function Composer({ onSend, disabled, placeholder, autoFocusKey }) {
  const [text, setText] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [text])

  useEffect(() => {
    ref.current?.focus()
  }, [autoFocusKey])

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm transition-colors focus-within:border-accent">
        <textarea
          ref={ref}
          value={text}
          rows={1}
          maxLength={2000}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          className="max-h-44 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[0.95rem] outline-none placeholder:text-muted/70 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg transition-opacity disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Plans use live data where available. Check details before you book.</p>
    </div>
  )
}
