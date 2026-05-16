'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const label = theme === 'system' ? `Sistem (${resolved})` : theme === 'dark' ? 'Întunecat' : 'Luminat'

  return (
    <button
      onClick={() => setTheme(next)}
      title={`Temă: ${label}. Click pentru a schimba.`}
      aria-label="Schimbă tema"
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
    >
      {theme === 'system' ? (
        <SystemIcon />
      ) : resolved === 'dark' ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
function SystemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}
