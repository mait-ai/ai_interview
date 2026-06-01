import React from 'react'

// Living, warm gradient-mesh background. Pure CSS animation, sits behind content.
export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-sand" />

      {/* floating colour blobs */}
      <div className="absolute -left-40 -top-32 h-[34rem] w-[34rem] rounded-full bg-tangerine/30 blur-3xl animate-blob" />
      <div
        className="absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-coral/25 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-[-10rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-teal/20 blur-3xl animate-blob"
        style={{ animationDelay: '8s' }}
      />
      <div
        className="absolute right-1/4 bottom-0 h-[22rem] w-[22rem] rounded-full bg-amber/25 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
      />

      {/* faint dotted grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgba(21,18,58,0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
        }}
      />
    </div>
  )
}
