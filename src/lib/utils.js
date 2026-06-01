// Misc helpers used across the app

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function round(n, d = 0) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// Strip a JSON object out of an LLM response that may include code fences / prose.
export function safeParseJSON(text) {
  if (!text) throw new Error('Empty response')
  let t = String(text).trim()
  // remove ```json ... ``` or ``` ... ``` fences
  t = t.replace(/```json/gi, '```').replace(/```/g, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  const slice = t.slice(start, end + 1)
  return JSON.parse(slice)
}

// Tokenize free text into meaningful lowercase words (length >= 3, dedupe stopwords).
const STOP = new Set(
  'the a an and or but if then else for to of in on at by with as is are was were be been being this that these those it its from into over under about above below up down out off your you i we they he she them his her our their will would can could should may might must do does did not no yes have has had how what why when where which who whom whose can use used using also more most very much many few some any each every other than so such only just into onto upon within without across after before during until while because since though although however therefore thus hence here there'.split(
      ' '
    )
)

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[-.]+|[-.]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP.has(w))
}

export function uniqueTokens(text) {
  return Array.from(new Set(tokenize(text)))
}

export function countWords(text) {
  const t = String(text || '').trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

export function countSentences(text) {
  const t = String(text || '').trim()
  if (!t) return 0
  return Math.max(1, (t.match(/[.!?]+/g) || []).length)
}
