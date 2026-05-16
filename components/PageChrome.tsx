'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import ScrollScene from './ScrollScene'

/**
 * Routes-aware chrome:
 *  • Home (`/`) gets the persistent 3D vial stage + the soft pastel page-bg
 *    gradient, and resets scroll to the top on every navigation back here.
 *  • Every other route renders nothing extra — body's `bg-background` shows
 *    through as a flat, theme-aware solid color.
 */
export default function PageChrome() {
  const pathname = usePathname()

  // On every navigation TO home, reset scroll so users always start at the
  // hero (with the vial assembled), not where they were when they left.
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname])

  if (pathname !== '/') return null

  return (
    <>
      <div className="page-bg" aria-hidden />
      <ScrollScene />
    </>
  )
}
