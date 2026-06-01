import React, { useEffect, useRef, useState } from 'react'
import { formatTime } from '../lib/utils.js'

// Animated circular countdown. Self-contained ticking with real-timestamp math
// (drift-free). Reports remaining seconds via onTick and fires onExpire at 0.
// Remount with a `key` per question to reset cleanly.
export default function TimerRing({
  total = 100,
  running = true,
  onTick,
  onExpire,
  size = 132,
  stroke = 10,
}) {
  const [remaining, setRemaining] = useState(total)
  const endRef = useRef(Date.now() + total * 1000)
  const expiredRef = useRef(false)
  const onTickRef = useRef(onTick)
  const onExpireRef = useRef(onExpire)
  onTickRef.current = onTick
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!running) return
    endRef.current = Date.now() + remaining * 1000
    const id = setInterval(() => {
      const left = Math.max(0, (endRef.current - Date.now()) / 1000)
      const rounded = Math.ceil(left)
      setRemaining(rounded)
      onTickRef.current?.(rounded)
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        clearInterval(id)
        onExpireRef.current?.()
      }
    }, 200)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, remaining / total))
  const offset = circ * (1 - frac)

  const danger = remaining <= total * 0.2
  const warn = !danger && remaining <= total * 0.5
  const color = danger ? '#FF4D6D' : warn ? '#F4A521' : '#0FB6A6'
  const label = danger ? 'Hurry!' : warn ? 'Keep going' : 'Time left'

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div
          className={`font-mono text-2xl font-semibold tabular-nums ${danger ? 'animate-pulse' : ''}`}
          style={{ color }}
        >
          {formatTime(remaining)}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">{label}</div>
      </div>
    </div>
  )
}
