import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Settings2,
  Sparkles,
  Gauge,
  ChevronDown,
  Loader2,
  Briefcase,
  Cpu,
  Wand2,
} from 'lucide-react'
import { Button, Card, Pill, Toggle, Field } from './ui.jsx'
import InterviewerAvatar from './InterviewerAvatar.jsx'
import { DEFAULT_TIME_LIMITS, DIFFICULTY_META } from '../lib/scoring.js'
import { extractTextFromPDF } from '../services/pdf.js'
import { usesLLM, PROVIDERS } from '../services/config.js'

const SAMPLE_RESUME = `Aarav Sharma — Frontend Engineer
Skills: JavaScript, TypeScript, React, Redux, Node.js, REST, GraphQL, SQL, Git, Jest, Tailwind CSS, AWS
Experience: 3 years building production web apps.
Projects:
• Built a real-time analytics dashboard in React handling 50k concurrent users.
• Developed a design-system component library adopted across 4 teams.
• Implemented CI/CD pipelines reducing deploy time by 40%.`

const SAMPLE_JD = `We are hiring a Frontend Engineer (React).
Required: strong JavaScript and React, state management (Redux), REST/GraphQL APIs,
testing (Jest/RTL), performance optimisation, and solid CSS. Bonus: TypeScript, AWS, CI/CD.
You will build accessible, high-performance interfaces and collaborate on system design.`

export default function SetupScreen({ config, onOpenSettings, onStart }) {
  const [mode, setMode] = useState('paste') // 'paste' | 'upload'
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [role, setRole] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  const [numQuestions, setNumQuestions] = useState(6)
  const [startDifficulty, setStartDifficulty] = useState(1)
  const [timeLimits, setTimeLimits] = useState({ ...DEFAULT_TIME_LIMITS })
  const [enableVoice, setEnableVoice] = useState(false)
  const [enableProctor, setEnableProctor] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const fileRef = useRef(null)

  const onFile = async (file) => {
    if (!file) return
    setParseError('')
    setFileName(file.name)
    setParsing(true)
    try {
      const text = await extractTextFromPDF(file)
      if (!text || text.trim().length < 20) {
        setParseError('Could not read much text from that PDF (it may be scanned). You can paste your resume instead.')
      } else {
        setResumeText(text)
      }
    } catch (e) {
      setParseError('Failed to parse the PDF. Please paste your resume text instead.')
    } finally {
      setParsing(false)
    }
  }

  const loadSample = () => {
    setMode('paste')
    setResumeText(SAMPLE_RESUME)
    setJdText(SAMPLE_JD)
    setRole('Frontend Engineer (React)')
  }

  const canStart = resumeText.trim().length > 10 && jdText.trim().length > 10 && !parsing

  const begin = () => {
    if (!canStart) return
    onStart({
      resumeText: resumeText.trim(),
      jdText: jdText.trim(),
      role: role.trim(),
      numQuestions,
      startDifficulty,
      timeLimits,
      enableVoice,
      enableProctor,
    })
  }

  const engineLabel = usesLLM(config)
    ? PROVIDERS.find((p) => p.id === config.provider)?.label || 'AI'
    : 'Simulation Engine'

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:pt-16">
      {/* Top bar */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-cream shadow-soft">
            <Sparkles size={20} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-ink">Crucible</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-soft shadow-sm transition hover:border-ink/25 hover:text-ink"
        >
          {usesLLM(config) ? <Sparkles size={15} className="text-tangerine" /> : <Cpu size={15} className="text-teal" />}
          {engineLabel}
          <Settings2 size={15} />
        </button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="max-w-xl">
          <Pill tone="tangerine" className="mb-4">
            <Wand2 size={13} /> AI-Powered Mock Interview
          </Pill>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Forge your <span className="text-gradient">interview readiness</span>.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            A live AI interviewer that reads your resume and the job description, adapts its difficulty to your answers,
            keeps you on the clock, and scores you the way a real panel would.
          </p>
        </div>
        <InterviewerAvatar state="idle" size={132} />
      </motion.div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Resume */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <FileText size={18} className="text-coral" /> Your résumé
            </h2>
            <div className="flex rounded-full bg-ink/5 p-1 text-xs font-semibold">
              {['paste', 'upload'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1.5 capitalize transition ${
                    mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink-mute hover:text-ink'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode === 'upload' ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/15 bg-white/50 px-6 py-10 text-center transition hover:border-coral/40 hover:bg-white"
              >
                {parsing ? (
                  <Loader2 size={28} className="animate-spin text-coral" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-tangerine to-coral text-white shadow-glow">
                    <Upload size={22} />
                  </span>
                )}
                <span className="text-sm font-semibold text-ink">
                  {fileName ? fileName : 'Drop a PDF or click to upload'}
                </span>
                <span className="text-xs text-ink-mute">We extract the text right here in your browser.</span>
              </button>
              {resumeText && !parseError && (
                <p className="mt-2 text-xs font-semibold text-teal">✓ Extracted {resumeText.length.toLocaleString()} characters.</p>
              )}
              {parseError && <p className="mt-2 text-xs font-semibold text-coral">{parseError}</p>}
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your résumé text here — skills, experience, projects…"
              className="h-44 w-full resize-none rounded-2xl border border-ink/12 bg-white/80 p-4 text-sm leading-relaxed text-ink outline-none transition focus:border-coral/50"
            />
          )}
        </Card>

        {/* JD */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Briefcase size={18} className="text-grape" /> Job description
          </h2>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description / role requirements…"
            className="h-44 w-full resize-none rounded-2xl border border-ink/12 bg-white/80 p-4 text-sm leading-relaxed text-ink outline-none transition focus:border-coral/50"
          />
          <div className="mt-3">
            <Field label="Target role (optional)">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Engineer, Data Scientist…"
                className="w-full rounded-2xl border border-ink/12 bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-coral/50"
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* Options */}
      <Card className="mt-5 p-6">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Gauge size={18} className="text-teal" /> Interview settings
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Questions</span>
              <span className="font-mono text-sm text-coral">{numQuestions}</span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-xs text-ink-mute">The interview may end earlier if performance drops.</p>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Starting difficulty</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((d) => {
                const meta = DIFFICULTY_META[d]
                const active = startDifficulty === d
                return (
                  <button
                    key={d}
                    onClick={() => setStartDifficulty(d)}
                    className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active ? 'border-coral/50 bg-coral/10 text-ink shadow-soft' : 'border-ink/12 bg-white/60 text-ink-mute hover:border-ink/25'
                    }`}
                  >
                    <span className="mr-1">{meta.emoji}</span>
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Toggle
            checked={enableVoice}
            onChange={setEnableVoice}
            label="Voice mode"
            hint="Hear questions aloud & answer by speaking"
          />
          <Toggle
            checked={enableProctor}
            onChange={setEnableProctor}
            label="Focus proctoring"
            hint="Flag tab-switching during the interview"
          />
        </div>

        {/* Advanced timing */}
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced timing
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-3"
          >
            {[1, 2, 3].map((d) => (
              <div key={d}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {DIFFICULTY_META[d].emoji} {DIFFICULTY_META[d].label}
                  </span>
                  <span className="font-mono text-xs text-ink-mute">{timeLimits[d]}s</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={5}
                  value={timeLimits[d]}
                  onChange={(e) => setTimeLimits((t) => ({ ...t, [d]: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}
          </motion.div>
        )}
      </Card>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button size="lg" onClick={begin} disabled={!canStart} className="w-full sm:w-auto">
          <Sparkles size={18} /> Start the interview
        </Button>
        <button onClick={loadSample} className="text-sm font-semibold text-ink-mute underline-offset-2 hover:text-ink hover:underline">
          or try it with a sample resume & JD
        </button>
        {!canStart && (
          <p className="text-xs text-ink-mute">Add both a résumé and a job description to begin.</p>
        )}
      </div>
    </div>
  )
}
