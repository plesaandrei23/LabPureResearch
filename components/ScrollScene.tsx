'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type RefObject } from 'react'

const SceneImpl = dynamic<{
  pageRef: RefObject<number>
  explodeRef: RefObject<number>
}>(() => import('./ScrollSceneImpl'), { ssr: false })

/**
 * Persistent full-viewport WebGL stage.
 *
 * Two refs feed the 3D scene every frame (no React re-renders per scroll):
 *  - pageRef    : 0 (top of doc) → 1 (bottom of doc)
 *  - explodeRef : 0 until the user reaches an element with id="explode-trigger"
 *                 (the warning banner), then ramps to 1 over ~60vh of scroll.
 *
 * Nothing animates without scroll — both refs only change while the user scrolls.
 */
export default function ScrollScene() {
  const pageRef = useRef(0)
  const explodeRef = useRef(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    let raf = 0
    const recompute = () => {
      const doc = document.documentElement
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
      const y = window.scrollY

      pageRef.current = Math.min(1, Math.max(0, y / maxScroll))

      const trigger = document.getElementById('explode-trigger')
      if (trigger) {
        const triggerTop = trigger.getBoundingClientRect().top + y
        // start exploding ~25vh before banner enters viewport bottom,
        // fully exploded ~35vh after banner has passed
        const start = triggerTop - window.innerHeight * 0.9
        const end = triggerTop + window.innerHeight * 0.35
        const range = Math.max(1, end - start)
        explodeRef.current = Math.min(1, Math.max(0, (y - start) / range))
      }
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        recompute()
      })
    }
    recompute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {mounted && <SceneImpl pageRef={pageRef} explodeRef={explodeRef} />}
    </div>
  )
}
