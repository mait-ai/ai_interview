import React from 'react'
import { motion } from 'framer-motion'

// A friendly, living "AI interviewer" orb. It breathes gently when idle,
// pulses with concentric rings when speaking, and shows a thinking shimmer.
export default function InterviewerAvatar({ state = 'idle', size = 96, name = 'Aria' }) {
  const speaking = state === 'speaking'
  const thinking = state === 'thinking'

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {/* speaking ripples */}
      {speaking &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-coral/40"
            style={{ animation: `pulseRing 1.8s ${i * 0.4}s cubic-bezier(0.2,0.6,0.3,1) infinite` }}
          />
        ))}

      {/* halo */}
      <div className="absolute inset-[-18%] rounded-full bg-gradient-to-br from-tangerine/30 via-coral/20 to-grape/20 blur-2xl" />

      {/* the orb */}
      <motion.div
        className="relative grid place-items-center rounded-full text-white shadow-glow"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(120% 120% at 30% 25%, #ffd9a8 0%, #ff7a3d 38%, #ff4d6d 72%, #7c5cfc 130%)',
        }}
        animate={
          speaking
            ? { scale: [1, 1.06, 0.98, 1.04, 1] }
            : thinking
            ? { scale: [1, 1.02, 1], rotate: [0, 2, -2, 0] }
            : { scale: [1, 1.03, 1] }
        }
        transition={{
          duration: speaking ? 0.9 : thinking ? 2.4 : 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* inner glassy core */}
        <div className="absolute inset-[14%] rounded-full bg-white/20 backdrop-blur-sm" />
        {/* highlight */}
        <div className="absolute left-[20%] top-[16%] h-1/4 w-1/4 rounded-full bg-white/70 blur-[2px]" />

        {/* eyes / equalizer */}
        {speaking ? (
          <div className="relative flex items-end gap-1.5" style={{ height: size * 0.26 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 rounded-full bg-white"
                animate={{ height: ['28%', '100%', '45%', '85%', '30%'] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
                style={{ height: '40%' }}
              />
            ))}
          </div>
        ) : thinking ? (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-white"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-2.5">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-white"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.04, 0.08], repeatDelay: 1 }}
            />
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-white"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.04, 0.08], repeatDelay: 1 }}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
