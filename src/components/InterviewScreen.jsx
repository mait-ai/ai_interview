import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Activity,
} from 'lucide-react'
import { Button, Card, Pill, Dots } from './ui.jsx'
import TimerRing from './TimerRing.jsx'
import InterviewerAvatar from './InterviewerAvatar.jsx'
import { useSpeech, useSpeechRecognition } from '../hooks/useSpeech.js'
import { DIFFICULTY_META } from '../lib/scoring.js'
import { countWords } from '../lib/utils.js'

const CATEGORY_TONE = {
  Technical: 'teal',
  Conceptual: 'grape',
  Behavioral: 'amber',
  Scenario: 'tangerine',
}

function DirectionTag({ direction }) {
  if (direction === 'up')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal">
        <ArrowUp size={13} /> harder
      </span>
    )
  if (direction === 'down')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-coral">
        <ArrowDown size={13} /> easier
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-mute">
      <Minus size={13} /> steady
    </span>
  )
}

export default function InterviewScreen({
  analysis,
  question,
  questionNumber,
  total,
  difficulty,
  timeLimit,
  history,
  evaluating,
  lastDirection,
  enableVoice,
  enableProctor,
  proctorFlags = 0,
  onSubmit,
}) {
  const [answer, setAnswer] = useState('')
  const remainingRef = useRef(timeLimit)
  const submittedRef = useRef(false)

  const { speak, cancel, speaking, supported: ttsSupported } = useSpeech()
  const { supported: sttSupported, listening, start, stop } = useSpeechRecognition({
    onResult: (text) => setAnswer((prev) => (prev ? `${prev} ${text}`.trim() : text.trim())),
  })

  const meta = DIFFICULTY_META[difficulty] || DIFFICULTY_META[1]
  const catTone = CATEGORY_TONE[question?.category] || 'ink'

  // Reset per-question state.
  useEffect(() => {
    setAnswer('')
    remainingRef.current = timeLimit
    submittedRef.current = false
    if (listening) stop()
    if (enableVoice && ttsSupported && question?.question) {
      const t = setTimeout(() => speak(question.question), 250)
      return () => {
        clearTimeout(t)
        cancel()
      }
    }
    return () => cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionNumber])

  const doSubmit = (reason = 'manual') => {
    if (submittedRef.current) return
    submittedRef.current = true
    if (listening) stop()
    cancel()
    const used = Math.max(0, Math.min(timeLimit, timeLimit - remainingRef.current))
    onSubmit({ answer: answer.trim(), timeUsed: used, timedOut: reason === 'timeout' })
  }

  const runningAvg =
    history.length > 0 ? Math.round(history.reduce((a, h) => a + h.overall, 0) / history.length) : null

  const words = countWords(answer)

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-8">
      {/* progress header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink-soft">
            Question {questionNumber} <span className="text-ink-mute">/ {total}</span>
          </span>
          <div className="flex items-center gap-3">
            {enableProctor && proctorFlags > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-coral">
                <AlertTriangle size={13} /> {proctorFlags} tab switch{proctorFlags > 1 ? 'es' : ''}
              </span>
            )}
            {runningAvg != null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-mute">
                <Activity size={13} /> avg {runningAvg}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => {
            const done = i < history.length
            const current = i === history.length
            const score = done ? history[i].overall : null
            const tone =
              score == null ? '' : score >= 75 ? 'bg-teal' : score >= 50 ? 'bg-amber' : 'bg-coral'
            return (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  done ? tone : current ? 'bg-gradient-to-r from-tangerine to-coral' : 'bg-ink/10'
                }`}
              />
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={questionNumber}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Pill tone={catTone}>{question?.category || 'Technical'}</Pill>
                  <Pill tone={meta.color}>
                    {meta.emoji} {meta.label}
                  </Pill>
                  {ttsSupported && enableVoice && (
                    <button
                      onClick={() => (speaking ? cancel() : speak(question?.question))}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
                    >
                      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {speaking ? 'Stop' : 'Replay'}
                    </button>
                  )}
                </div>

                <h2 className="font-display text-2xl font-bold leading-snug text-ink sm:text-[28px]">
                  {question?.question}
                </h2>

                {/* answer area */}
                <div className="mt-6">
                  <div className="relative">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={evaluating}
                      placeholder={
                        listening ? 'Listening… speak your answer.' : 'Type your answer here. Be specific and structured.'
                      }
                      className="h-48 w-full resize-none rounded-3xl border border-ink/12 bg-white/80 p-5 text-[15px] leading-relaxed text-ink outline-none transition focus:border-coral/50 disabled:opacity-60"
                    />
                    {sttSupported && enableVoice && (
                      <button
                        onClick={() => (listening ? stop() : start())}
                        disabled={evaluating}
                        className={`absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full shadow-soft transition ${
                          listening
                            ? 'bg-coral text-white'
                            : 'bg-white text-ink-soft hover:text-ink'
                        }`}
                        title={listening ? 'Stop recording' : 'Answer by voice'}
                      >
                        {listening ? (
                          <span className="relative flex">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                            <Mic size={18} />
                          </span>
                        ) : (
                          <Mic size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-ink-mute">
                      {words} word{words === 1 ? '' : 's'}
                    </span>
                    <Button onClick={() => doSubmit('manual')} disabled={evaluating}>
                      <Send size={16} /> Submit answer
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side rail */}
        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <Card className="flex flex-col items-center p-6 text-center">
            <InterviewerAvatar state={speaking ? 'speaking' : 'idle'} size={84} />
            <p className="mt-3 text-sm font-bold text-ink">Aria</p>
            <p className="text-xs text-ink-mute">your AI interviewer</p>
          </Card>

          <Card className="flex flex-col items-center p-6">
            <TimerRing
              key={questionNumber}
              total={timeLimit}
              running={!evaluating}
              onTick={(r) => (remainingRef.current = r)}
              onExpire={() => doSubmit('timeout')}
            />
            <p className="mt-3 text-center text-xs text-ink-mute">
              Answer within the limit — overtime and blanks cost time-efficiency points.
            </p>
          </Card>

          <Card className="p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-mute">Adaptive engine</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {meta.emoji} {meta.label}
              </span>
              <DirectionTag direction={lastDirection} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-mute">
              Strong answers push difficulty up; weaker ones ease it back. Sustained low scores end the interview early.
            </p>
          </Card>
        </div>
      </div>

      {/* Evaluating overlay */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center bg-cream/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center">
              <InterviewerAvatar state="thinking" size={110} />
              <p className="mt-5 inline-flex items-center gap-2 font-display text-xl font-bold text-ink">
                <Brain size={20} className="text-coral" /> Evaluating your answer
                <Dots className="text-coral" />
              </p>
              <p className="mt-1 text-sm text-ink-mute">Scoring accuracy, depth, clarity, relevance & timing.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
