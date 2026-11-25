import { palette } from './colors'

const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)

function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

const block = (selector, colors) =>
  `${selector}{${Object.entries(colors)
    .map(([k, v]) => `--c-${kebab(k)}:${hexToRgb(v)};`)
    .join('')}}`

/** Writes the palette from colors.js into CSS variables. Call once before render. */
export function injectTheme() {
  const css = block(':root', palette.light) + block('.dark', palette.dark)
  let el = document.getElementById('tm-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'tm-theme'
    document.head.appendChild(el)
  }
  el.textContent = css
}
