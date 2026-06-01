import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, KeyRound, ExternalLink, CheckCircle2, AlertCircle, Sparkles, Cpu } from 'lucide-react'
import { PROVIDERS, MODEL_DEFAULTS } from '../services/config.js'
import { testConnection } from '../services/llm.js'
import { Button, Field, Spinner } from './ui.jsx'

export default function SettingsModal({ open, config, onSave, onClose }) {
  const [draft, setDraft] = useState(config)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)

  // keep the draft in sync whenever the modal is (re)opened
  React.useEffect(() => {
    if (open) {
      setDraft(config)
      setResult(null)
    }
  }, [open, config])

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const provider = PROVIDERS.find((p) => p.id === draft.provider) || PROVIDERS[0]
  const isLLM = draft.provider !== 'demo'

  const runTest = async () => {
    setTesting(true)
    setResult(null)
    const r = await testConnection(draft)
    setResult(r)
    setTesting(false)
  }

  const save = () => {
    onSave(draft)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="glass relative z-10 w-full max-w-lg rounded-5xl p-6 shadow-lift sm:p-8"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">AI Engine</h2>
                <p className="text-sm text-ink-mute">Pick where the interviewer's intelligence comes from.</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-ink-mute transition hover:bg-ink/5 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            {/* provider grid */}
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROVIDERS.map((p) => {
                const active = draft.provider === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => set({ provider: p.id })}
                    className={`rounded-2xl border p-3 text-left transition ${
                      active ? 'border-coral/50 bg-coral/8 shadow-soft' : 'border-ink/10 bg-white/60 hover:border-ink/25'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {p.id === 'demo' ? (
                        <Cpu size={16} className="text-teal" />
                      ) : (
                        <Sparkles size={16} className="text-tangerine" />
                      )}
                      <span className="text-sm font-bold text-ink">{p.label}</span>
                    </div>
                    <p className="mt-1 text-xs leading-snug text-ink-mute">{p.hint}</p>
                  </button>
                )
              })}
            </div>

            {isLLM ? (
              <div className="space-y-3">
                <Field label="API key" hint="Stored only in this browser tab for the session — never sent anywhere except the provider.">
                  <div className="relative">
                    <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                    <input
                      type="password"
                      value={draft.apiKey || ''}
                      onChange={(e) => set({ apiKey: e.target.value })}
                      placeholder="paste your key…"
                      className="w-full rounded-2xl border border-ink/12 bg-white/80 py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-coral/50"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Model">
                    <input
                      value={draft.model || ''}
                      onChange={(e) => set({ model: e.target.value })}
                      placeholder={MODEL_DEFAULTS[draft.provider] || 'model name'}
                      className="w-full rounded-2xl border border-ink/12 bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-coral/50"
                    />
                  </Field>
                  {draft.provider === 'custom' && (
                    <Field label="Base URL">
                      <input
                        value={draft.baseURL || ''}
                        onChange={(e) => set({ baseURL: e.target.value })}
                        placeholder="https://…/v1"
                        className="w-full rounded-2xl border border-ink/12 bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-coral/50"
                      />
                    </Field>
                  )}
                </div>

                {provider.keyUrl && (
                  <a
                    href={provider.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline"
                  >
                    Get a free {provider.label} key <ExternalLink size={14} />
                  </a>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <Button variant="outline" size="sm" onClick={runTest} disabled={testing || !draft.apiKey}>
                    {testing ? <Spinner size={16} /> : <CheckCircle2 size={16} />}
                    Test connection
                  </Button>
                  {result && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                        result.ok ? 'text-teal' : 'text-coral'
                      }`}
                    >
                      {result.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {result.ok ? `Connected (${result.model})` : 'Failed — check key/model'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-teal/30 bg-teal/8 p-4 text-sm text-ink-soft">
                <p className="font-semibold text-ink">No key needed.</p>
                The built-in Simulation Engine runs entirely in your browser using transparent, rule-based logic for
                analysis, questioning, scoring and adaptation. Perfect for a guaranteed live demo.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={save}>Save engine</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
