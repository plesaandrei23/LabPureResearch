'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeCtx {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

const STORAGE_KEY = 'pr-theme'

function getSystem(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', t)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
    setThemeState(stored)
    applyTheme(stored)
    setResolved(stored === 'system' ? getSystem() : stored)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) as Theme | null) === 'system' || !localStorage.getItem(STORAGE_KEY)) {
        setResolved(mq.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
    setThemeState(t)
    setResolved(t === 'system' ? getSystem() : t)
  }, [])

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

// Inline script to set the initial theme before React hydrates, preventing FOUC.
// Render this inside <head> via dangerouslySetInnerHTML.
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`
