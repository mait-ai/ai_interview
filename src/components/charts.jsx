import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const TONE_HEX = {
  teal: '#0FB6A6',
  amber: '#F4A521',
  coral: '#FF4D6D',
  tangerine: '#FF7A3D',
  grape: '#7C5CFC',
  ink: '#15123A',
}

// Smoothly counts a number from 0 -> value once it mounts.
function useCountUp(value, duration = 1400) {
  const [n, setN] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const start = performance.now()
    const from = 0
    const to = Number(value) || 0
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setN(Math.round(from + (to - from) * eased))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value, duration])
  return n
}

// Big circular readiness gauge with animated arc + count-up.
export function ScoreGauge({ value = 0, tone = 'teal', label = 'Readiness', size = 220, stroke = 16 }) {
  const display = useCountUp(value)
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, value / 100))
  const color = TONE_HEX[tone] || TONE_HEX.teal
  const gradId = `g-${tone}`

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A3D" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor="#7C5CFC" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradId})`}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - frac) }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="font-display text-5xl font-bold leading-none text-ink">{display}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-mute">{label}</div>
      </div>
    </div>
  )
}

// Pentagon (n-axis) radar chart for the scoring dimensions.
export function RadarChart({ data = [], size = 280, tone = 'tangerine' }) {
  const points = data.filter((d) => d && d.label)
  const n = points.length
  if (!n) return null

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 44
  const color = TONE_HEX[tone] || TONE_HEX.tangerine

  const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const coord = (i, frac) => {
    const a = angleFor(i)
    return [cx + Math.cos(a) * radius * frac, cy + Math.sin(a) * radius * frac]
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const gridPoly = (frac) =>
    points.map((_, i) => coord(i, frac).join(',')).join(' ')

  const dataPoly = points.map((d, i) => coord(i, Math.max(0.02, (Number(d.value) || 0) / 100)).join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A3D" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* grid rings */}
      {rings.map((f) => (
        <polygon key={f} points={gridPoly(f)} fill="none" stroke="rgba(21,18,58,0.10)" strokeWidth="1" />
      ))}
      {/* spokes */}
      {points.map((_, i) => {
        const [x, y] = coord(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(21,18,58,0.10)" strokeWidth="1" />
      })}

      {/* data polygon */}
      <motion.polygon
        points={dataPoly}
        fill="url(#radar-fill)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* vertices */}
      {points.map((d, i) => {
        const [x, y] = coord(i, Math.max(0.02, (Number(d.value) || 0) / 100))
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />
      })}

      {/* labels */}
      {points.map((d, i) => {
        const [x, y] = coord(i, 1.2)
        const anchor = Math.abs(x - cx) < 12 ? 'middle' : x > cx ? 'start' : 'end'
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-ink" style={{ fontSize: 11, fontWeight: 600 }}>
            <tspan>{d.label}</tspan>
            <tspan x={x} dy="13" className="fill-ink-mute" style={{ fontSize: 10, fontWeight: 500 }}>
              {Math.round(d.value)}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}

// Slim labelled progress bar.
export function Bar({ label, value = 0, tone = 'tangerine', sublabel }) {
  const color = TONE_HEX[tone] || TONE_HEX.tangerine
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono text-xs text-ink-mute">
          {sublabel ? `${sublabel} · ` : ''}
          {v}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #FF7A3D, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
    </div>
  )
}
