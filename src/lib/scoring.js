import { clamp, round } from './utils.js'

// ---- Difficulty model -------------------------------------------------------
export const DIFFICULTY = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
export const DIFFICULTY_META = {
  1: { label: 'Easy', color: 'teal', emoji: '🌱' },
  2: { label: 'Medium', color: 'amber', emoji: '⚡' },
  3: { label: 'Hard', color: 'coral', emoji: '🔥' },
}

// Default time limit (seconds) per difficulty. Configurable in Settings.
export const DEFAULT_TIME_LIMITS = { 1: 75, 2: 100, 3: 140 }

export function timeLimitFor(difficulty, limits = DEFAULT_TIME_LIMITS) {
  return limits[difficulty] || 100
}

// The five objective dimensions (matches the problem statement).
export const DIMENSIONS = [
  { key: 'accuracy', label: 'Accuracy', weight: 0.3 },
  { key: 'relevance', label: 'Relevance', weight: 0.25 },
  { key: 'depth', label: 'Depth', weight: 0.2 },
  { key: 'clarity', label: 'Clarity', weight: 0.15 },
  { key: 'timeEfficiency', label: 'Time efficiency', weight: 0.1 },
]

// Combine dimension scores (each 0..100) into a single answer score 0..100.
export function computeOverall(dim) {
  let total = 0
  for (const d of DIMENSIONS) {
    total += (Number(dim[d.key]) || 0) * d.weight
  }
  return clamp(round(total), 0, 100)
}

// Time efficiency from time used vs limit. Penalises both rushing-with-no-answer
// and going over time. Returns 0..100.
export function timeEfficiencyScore({ timeUsed, timeLimit, answered }) {
  if (!answered) return 0
  const ratio = timeUsed / Math.max(1, timeLimit)
  if (ratio <= 1) {
    // Sweet spot: using 40%–90% of the time scores best.
    if (ratio < 0.2) return 78 // suspiciously fast / likely shallow
    if (ratio <= 0.9) return clamp(round(100 - (0.9 - ratio) * 25), 80, 100)
    return clamp(round(100 - (ratio - 0.9) * 80), 88, 96)
  }
  // Over time — escalating penalty.
  const over = ratio - 1
  return clamp(round(70 - over * 120), 10, 70)
}

// ---- Adaptive difficulty ----------------------------------------------------
// Increase on strong answers, decrease on weak ones, otherwise hold.
export function nextDifficulty(current, overallScore) {
  let next = current
  let direction = 'hold'
  if (overallScore >= 75) {
    next = clamp(current + 1, 1, 3)
    direction = next > current ? 'up' : 'hold'
  } else if (overallScore <= 42) {
    next = clamp(current - 1, 1, 3)
    direction = next < current ? 'down' : 'hold'
  }
  return { next, direction }
}

// ---- Early termination rules ------------------------------------------------
// `history` is an array of answer records: { overall, answered, difficulty }
export function shouldTerminateEarly(history, { minQuestions = 4 } = {}) {
  const n = history.length
  if (n < minQuestions) return { terminate: false }

  const scores = history.map((h) => h.overall)
  const avg = scores.reduce((a, b) => a + b, 0) / n

  // Rule 1: sustained poor performance.
  if (avg < 30) {
    return {
      terminate: true,
      reason: 'Running average dropped below the readiness threshold (30/100).',
    }
  }

  // Rule 2: three consecutive weak answers.
  const last3 = scores.slice(-3)
  if (last3.length === 3 && last3.every((s) => s < 35)) {
    return {
      terminate: true,
      reason: 'Three consecutive answers fell below 35/100.',
    }
  }

  // Rule 3: two consecutive non-answers (skipped / timed-out empty).
  const last2 = history.slice(-2)
  if (last2.length === 2 && last2.every((h) => !h.answered)) {
    return {
      terminate: true,
      reason: 'Two consecutive questions were left unanswered.',
    }
  }

  return { terminate: false }
}

// ---- Final readiness --------------------------------------------------------
export function categoryFor(score) {
  if (score >= 75) return { label: 'Strong', tone: 'teal' }
  if (score >= 50) return { label: 'Average', tone: 'amber' }
  return { label: 'Needs Improvement', tone: 'coral' }
}

export function hiringReadinessFor(score, terminatedEarly) {
  if (terminatedEarly) return { label: 'Not Ready Yet', tone: 'coral', emoji: '🛠️' }
  if (score >= 72) return { label: 'Recommended', tone: 'teal', emoji: '✅' }
  if (score >= 55) return { label: 'Borderline', tone: 'amber', emoji: '🤝' }
  return { label: 'Not Ready Yet', tone: 'coral', emoji: '🛠️' }
}

// Aggregate per-dimension averages from the answer history.
export function dimensionAverages(history) {
  const out = {}
  for (const d of DIMENSIONS) {
    const vals = history.map((h) => Number(h.dimensions?.[d.key]) || 0)
    out[d.key] = vals.length ? clamp(round(vals.reduce((a, b) => a + b, 0) / vals.length), 0, 100) : 0
  }
  return out
}

// Final readiness score 0..100 from history + a small set of adjustments
// (consistency, difficulty reached, completion).
export function computeReadiness(history, { terminatedEarly = false } = {}) {
  if (!history.length) return 0
  const scores = history.map((h) => h.overall)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length

  // Consistency: lower variance => small bonus, high variance => small penalty.
  const variance = scores.reduce((a, s) => a + Math.pow(s - mean, 2), 0) / scores.length
  const std = Math.sqrt(variance)
  const consistencyAdj = clamp(round((18 - std) * 0.3), -6, 6)

  // Reward reaching & surviving harder questions.
  const maxDiff = Math.max(...history.map((h) => h.difficulty || 1))
  const difficultyAdj = maxDiff >= 3 ? 4 : maxDiff >= 2 ? 2 : 0

  let score = mean + consistencyAdj + difficultyAdj
  if (terminatedEarly) score = Math.min(score, 45) - 5 // capped + penalty
  return clamp(round(score), 0, 100)
}
