/**
 * ─────────────────────────────────────────────────────────────
 *  THE ONLY PLACE COLORS ARE DEFINED.
 *  Change any hex value below and the whole app follows
 *  (light + dark). No other file needs to be touched.
 * ─────────────────────────────────────────────────────────────
 *
 *  bg          page background
 *  surface     cards, sidebar, panels, inputs
 *  sunken      subtle fills (user bubbles, code, hover)
 *  line        borders and dividers
 *  ink         primary text
 *  muted       secondary text, placeholders, icons
 *  accent      brand color (buttons, links, active states)
 *  accentFg    text/icons placed on top of `accent`
 *  accentSoft  tinted background for selected / highlighted items
 *  danger      errors and destructive actions
 *  success     confirmations
 */
export const palette = {
  light: {
    bg: '#FAF9F7',
    surface: '#FFFFFF',
    sunken: '#F3EFEB',
    line: '#E7E0D9',
    ink: '#201915',
    muted: '#7B6F66',
    accent: '#6A4630',
    accentFg: '#FFFFFF',
    accentSoft: '#F0E7DF',
    danger: '#B3382C',
    success: '#3D7A52',
  },
  dark: {
    bg: '#14100E',
    surface: '#1B1613',
    sunken: '#110E0C',
    line: '#2D2520',
    ink: '#F1EBE5',
    muted: '#A09389',
    accent: '#D2A981',
    accentFg: '#1A120C',
    accentSoft: '#2A211B',
    danger: '#E5786C',
    success: '#7FBF96',
  },
}
