import React from 'react'
import { motion } from 'framer-motion'

// Tone -> tailwind classes (soft pill style)
export const TONES = {
  teal: 'bg-teal/12 text-teal border-teal/30',
  amber: 'bg-amber/15 text-[#9a6a00] border-amber/40',
  coral: 'bg-coral/12 text-coral border-coral/30',
  grape: 'bg-grape/12 text-grape border-grape/30',
  tangerine: 'bg-tangerine/12 text-tangerine border-tangerine/30',
  ink: 'bg-ink/8 text-ink-soft border-ink/15',
}

export function Pill({ tone = 'ink', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${TONES[tone] || TONES.ink} ${className}`}
    >
      {children}
    </span>
  )
}

export function Button({ as = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/50'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-[15px]',
    lg: 'px-7 py-4 text-base',
  }
  const variants = {
    primary: 'btn-grad text-white shadow-glow hover:-translate-y-0.5 active:translate-y-0',
    dark: 'bg-ink text-cream hover:bg-ink-soft shadow-soft hover:-translate-y-0.5',
    outline: 'bg-white/70 text-ink border border-ink/15 hover:border-ink/30 hover:bg-white shadow-sm',
    ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5',
  }
  const Comp = motion[as] || motion.button
  return (
    <Comp
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`glass rounded-4xl shadow-soft ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-left transition hover:border-ink/20"
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-mute">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-tangerine to-coral' : 'bg-ink/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function Dots({ className = '' }) {
  return (
    <span className={`inline-flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-current opacity-70"
          style={{ animation: `pop 0.6s ${i * 0.15}s infinite alternate` }}
        />
      ))}
    </span>
  )
}

export function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </label>
  )
}
