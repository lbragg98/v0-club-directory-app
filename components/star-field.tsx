'use client'

import { useMemo } from 'react'

export function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 1.8 + 0.6,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 4 + 4}s`,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [])

  return (
    <>
      <style>{`
        @keyframes float-star {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: var(--star-opacity); }
          25% { transform: translateY(-6px) translateX(3px); opacity: calc(var(--star-opacity) * 1.6); }
          50% { transform: translateY(-2px) translateX(-4px); opacity: var(--star-opacity); }
          75% { transform: translateY(-8px) translateX(2px); opacity: calc(var(--star-opacity) * 0.5); }
        }
        .star-particle {
          animation: float-star var(--star-duration) var(--star-delay) ease-in-out infinite;
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white star-particle"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--star-opacity': star.opacity,
              '--star-duration': star.duration,
              '--star-delay': star.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  )
}
