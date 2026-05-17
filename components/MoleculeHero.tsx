'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

// Lazy-load the actual three.js scene; never render on the server, and only
// when the hero is in the viewport.
const MoleculeScene = dynamic(() => import('./MoleculeScene'), {
  ssr: false,
  loading: () => <div aria-hidden className="w-full h-full" />,
})

export default function MoleculeHero() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: '200px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {visible && <MoleculeScene />}
    </div>
  )
}
