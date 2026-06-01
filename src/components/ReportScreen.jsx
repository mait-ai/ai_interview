import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Download,
  Printer,
  RotateCcw,
  ChevronDown,
  ShieldAlert,
  Clock,
  Cpu,
  Sparkles,
} from 'lucide-react'
import { Button, Card, Pill } from './ui.jsx'
import { ScoreGauge, RadarChart, Bar } from './charts.jsx'
import { DIMENSIONS, DIFFICULTY_META } from '../lib/scoring.js'
import { formatTime } from '../lib/utils.js'

const TONE_HEX = { teal: '#0FB6A6', amber: '#F4A521', coral: '#FF4D6D', tangerine: '#FF7A3D', grape: '#7C5CFC' }

function Confetti() {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 44 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2.4 + Math.random() * 1.6,
        rot: Math.random() * 360,
        color: ['#FF7A3D', '#FF4D6D', '#0FB6A6', '#F4A521', '#7C5CFC'][i % 5],
        size: 7 + Math.random() * 7,
      })),
    []
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-5%] rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.5, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: p.rot }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rot + 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

function QuestionRow({ rec, index }) {
  const [open, setOpen] = useState(false)
  const meta = DIFFICULTY_META[rec.difficulty] || DIFFICULTY_META[1]
  const tone = rec.overall >= 75 ? 'teal' : rec.overall >= 50 ? 'amber' : 'coral'
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, #FF7A3D, ${TONE_HEX[tone]})` }}
        >
          {rec.overall}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            Q{index + 1}. {rec.question}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
            <span>{rec.category}</span>
            <span>·</span>
            <span>
              {meta.emoji} {meta.label}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {formatTime(Math.round(rec.timeUsed))}/{formatTime(rec.timeLimit)}
            </span>
            {!rec.answered && <span className="font-semibold text-coral">· skipped</span>}
          </div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-ink-mute transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
          <div className="space-y-3 px-4 pb-4">
            <div className="rounded-xl bg-ink/[0.04] p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-mute">Your answer</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {rec.answered ? rec.answer : 'No answer submitted in time.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="rounded-xl bg-white/70 p-2 text-center">
                  <div className="font-mono text-base font-bold text-ink">{rec.dimensions?.[d.key] ?? 0}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">{d.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-coral/20 bg-coral/[0.06] p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-coral">Feedback</p>
              <p className="text-sm leading-relaxed text-ink-soft">{rec.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ReportScreen({
  analysis,
  history,
  readiness,
  category,
  hiring,
  dims,
  report,
  terminatedEarly,
  terminationReason,
  proctorFlags = 0,
  usedAI,
  onRestart,
}) {
  const celebrate = !terminatedEarly && readiness >= 55
  const [showConfetti, setShowConfetti] = useState(celebrate)
  useEffect(() => {
    if (!celebrate) return
    const t = setTimeout(() => setShowConfetti(false), 4200)
    return () => clearTimeout(t)
  }, [celebrate])

  const radarData = DIMENSIONS.map((d) => ({ label: d.label, value: dims[d.key] ?? 0 }))

  const downloadReport = () => {
    const lines = []
    lines.push('CRUCIBLE — INTERVIEW READINESS REPORT')
    lines.push('=====================================')
    lines.push('')
    lines.push(`Final readiness score: ${readiness}/100 (${category.label})`)
    lines.push(`Hiring readiness: ${hiring.label}`)
    if (analysis?.experienceLevel) lines.push(`Profile: ${analysis.experienceLevel} · role alignment ${analysis.roleRelevance}%`)
    if (terminatedEarly) lines.push(`NOTE: Interview ended early — ${terminationReason || 'performance below threshold'}`)
    lines.push('')
    lines.push('SUMMARY')
    lines.push(report.summary)
    lines.push('')
    lines.push('SCORE BREAKDOWN (avg per dimension)')
    DIMENSIONS.forEach((d) => lines.push(`  - ${d.label}: ${dims[d.key] ?? 0}/100`))
    lines.push('')
    lines.push('STRENGTHS')
    report.strengths.forEach((s) => lines.push(`  + ${s}`))
    lines.push('')
    lines.push('WEAKNESSES')
    report.weaknesses.forEach((s) => lines.push(`  - ${s}`))
    lines.push('')
    lines.push('ACTION PLAN')
    report.actionable.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`))
    lines.push('')
    lines.push('QUESTION-BY-QUESTION')
    history.forEach((h, i) => {
      lines.push(`  Q${i + 1} [${h.category}/${h.difficultyLabel}] — ${h.overall}/100 (${formatTime(Math.round(h.timeUsed))}/${formatTime(h.timeLimit)})`)
      lines.push(`     ${h.question}`)
      lines.push(`     Feedback: ${h.feedback}`)
    })
    if (proctorFlags > 0) {
      lines.push('')
      lines.push(`INTEGRITY: ${proctorFlags} tab switch(es) detected during the session.`)
    }
    lines.push('')
    lines.push(`Generated by Crucible · ${usedAI ? 'AI engine' : 'Simulation Engine'} · ${new Date().toLocaleString()}`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crucible-interview-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-10">
      {showConfetti && <Confetti />}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <Pill tone="tangerine" className="mb-4">
          <Trophy size={13} /> Interview complete
        </Pill>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Your readiness report</h1>
      </motion.div>

      {/* Score + verdict */}
      <Card className="mb-5 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <ScoreGauge value={readiness} tone={category.tone} label={category.label} />
            <div className="max-w-md text-center sm:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Pill tone={category.tone}>{category.label}</Pill>
                <Pill tone={hiring.tone}>
                  {hiring.emoji} {hiring.label} for this role
                </Pill>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-soft">{report.summary}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute">
                {usedAI ? <Sparkles size={13} className="text-tangerine" /> : <Cpu size={13} className="text-teal" />}
                Scored by the {usedAI ? 'AI engine' : 'offline Simulation Engine'}
              </p>
            </div>
          </div>
        </div>

        {terminatedEarly && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coral/30 bg-coral/[0.07] p-4">
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-coral" />
            <div>
              <p className="text-sm font-bold text-ink">Interview ended early</p>
              <p className="text-sm text-ink-soft">{terminationReason || 'Performance dropped below the readiness threshold.'}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Breakdown: radar + bars */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-2 font-display text-lg font-bold text-ink">Skill profile</h2>
          <RadarChart data={radarData} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Performance by dimension</h2>
          <div className="space-y-4">
            {DIMENSIONS.map((d, i) => (
              <Bar
                key={d.key}
                label={d.label}
                value={dims[d.key] ?? 0}
                tone={['tangerine', 'coral', 'grape', 'teal', 'amber'][i % 5]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Strengths / weaknesses */}
      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
            <CheckCircle2 size={18} className="text-teal" /> Strengths
          </h2>
          <ul className="space-y-2.5">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
            <XCircle size={18} className="text-coral" /> Areas to improve
          </h2>
          <ul className="space-y-2.5">
            {report.weaknesses.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Action plan */}
      <Card className="mb-5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Lightbulb size={18} className="text-amber" /> Your action plan
        </h2>
        <ol className="space-y-3">
          {report.actionable.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-tangerine to-coral text-xs font-bold text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Card>

      {/* Per-question breakdown */}
      <Card className="mb-5 p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Question-by-question</h2>
        <div className="space-y-2.5">
          {history.map((rec, i) => (
            <QuestionRow key={rec.id || i} rec={rec} index={i} />
          ))}
        </div>
      </Card>

      {/* Integrity */}
      {proctorFlags > 0 && (
        <Card className="mb-5 flex items-start gap-3 border border-amber/30 bg-amber/[0.06] p-5">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber" />
          <div>
            <p className="text-sm font-bold text-ink">Focus note</p>
            <p className="text-sm text-ink-soft">
              You switched away from the interview tab {proctorFlags} time{proctorFlags > 1 ? 's' : ''}. In a real
              remote interview, staying focused on the screen signals engagement.
            </p>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="no-print flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button onClick={onRestart} size="lg">
          <RotateCcw size={18} /> New interview
        </Button>
        <Button variant="outline" size="lg" onClick={downloadReport}>
          <Download size={18} /> Download report
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.print()}>
          <Printer size={18} /> Print / PDF
        </Button>
      </div>
    </div>
  )
}
