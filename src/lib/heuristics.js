// Offline "Simulation Engine" — deterministic heuristics that mirror what the
// LLM does, so the platform fully works with no API key, and as a safe fallback
// if an LLM call fails.

import { QUESTION_BANK, SKILL_TO_TOPIC } from './questionBank.js'
import { computeOverall, timeEfficiencyScore } from './scoring.js'
import { clamp, round, tokenize, uniqueTokens, countWords, countSentences } from './utils.js'

// A broad catalogue of tech skills to detect inside resume / JD text.
const SKILL_CATALOGUE = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'kotlin', 'swift', 'scala',
  'react', 'angular', 'vue', 'next.js', 'svelte', 'redux', 'tailwind', 'html', 'css', 'sass',
  'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', '.net',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'dynamodb', 'cassandra', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'devops', 'linux',
  'git', 'github', 'rest', 'graphql', 'grpc', 'kafka', 'rabbitmq', 'microservices',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'nlp', 'computer vision',
  'data structures', 'algorithms', 'system design', 'oop', 'operating systems', 'networking', 'testing', 'agile',
]

export function analyzeResumeHeuristic(resumeText, jdText) {
  const resumeLower = ` ${(resumeText || '').toLowerCase()} `
  const jdLower = ` ${(jdText || '').toLowerCase()} `

  const has = (text, skill) => text.includes(` ${skill} `) || text.includes(`${skill},`) || text.includes(`${skill}.`) || text.includes(`/${skill}`) || text.includes(`${skill}/`)

  const resumeSkills = SKILL_CATALOGUE.filter((s) => has(resumeLower, s))
  const jdSkills = SKILL_CATALOGUE.filter((s) => has(jdLower, s))

  // Focus areas: skills the JD wants. Matched = present in both.
  const matched = jdSkills.filter((s) => resumeSkills.includes(s))
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s))

  // Experience level guess from year patterns or seniority words.
  const years = Math.max(
    0,
    ...(resumeText || '').match(/(\d{1,2})\s*\+?\s*(?:years|yrs)/gi)?.map((m) => parseInt(m, 10)) || [0]
  )
  let experienceLevel = 'Entry / Junior'
  if (/\b(senior|lead|principal|staff|architect)\b/i.test(resumeText || '') || years >= 6) experienceLevel = 'Senior'
  else if (years >= 2 || /\b(mid|intermediate)\b/i.test(resumeText || '')) experienceLevel = 'Mid-level'

  const roleRelevance = jdSkills.length
    ? clamp(round((matched.length / jdSkills.length) * 100), 0, 100)
    : resumeSkills.length
    ? 60
    : 30

  // Extract a couple of "projects" heuristically (lines mentioning project/built/developed).
  const projects = (resumeText || '')
    .split(/\n|•|\u2022/)
    .map((l) => l.trim())
    .filter((l) => /project|built|developed|designed|implemented|created|launched/i.test(l) && l.length > 25)
    .slice(0, 3)

  const focusAreas = (jdSkills.length ? jdSkills : resumeSkills).slice(0, 8)

  return {
    skills: resumeSkills.length ? resumeSkills : ['general software engineering'],
    jdSkills,
    matched,
    missing,
    experienceLevel,
    roleRelevance,
    projects,
    focusAreas: focusAreas.length ? focusAreas : ['problem solving', 'communication'],
    summary: `Candidate looks like a ${experienceLevel.toLowerCase()} profile with ${resumeSkills.length} detected skills. Role alignment is approximately ${roleRelevance}% based on overlap with the job description.`,
    source: 'simulation',
  }
}

// Pick a question that hasn't been asked, biased to detected topics + difficulty.
export function pickQuestionHeuristic({ skills = [], difficulty = 1, asked = [] }) {
  const askedSet = new Set(asked)
  const topics = new Set()
  for (const s of skills) {
    const key = String(s).toLowerCase()
    if (SKILL_TO_TOPIC[key]) topics.add(SKILL_TO_TOPIC[key])
    for (const part of key.split(/[\s./]+/)) if (SKILL_TO_TOPIC[part]) topics.add(SKILL_TO_TOPIC[part])
  }

  const matchesDifficulty = (q) => Math.abs(q.difficulty - difficulty) <= 0 // exact first

  // 1) exact topic + exact difficulty
  let pool = QUESTION_BANK.filter((q) => !askedSet.has(q.q) && topics.has(q.topic) && q.difficulty === difficulty)
  // 2) topic + near difficulty
  if (!pool.length) pool = QUESTION_BANK.filter((q) => !askedSet.has(q.q) && topics.has(q.topic) && Math.abs(q.difficulty - difficulty) <= 1)
  // 3) any topic at this difficulty
  if (!pool.length) pool = QUESTION_BANK.filter((q) => !askedSet.has(q.q) && q.difficulty === difficulty)
  // 4) anything not asked
  if (!pool.length) pool = QUESTION_BANK.filter((q) => !askedSet.has(q.q))
  // 5) total fallback
  if (!pool.length) pool = QUESTION_BANK

  const chosen = pool[Math.floor(Math.random() * pool.length)]
  return {
    question: chosen.q,
    category: chosen.category,
    difficulty: chosen.difficulty,
    keywords: chosen.keywords || [],
    topic: chosen.topic,
    source: 'simulation',
  }
}

// Evaluate an answer with transparent heuristics across the five dimensions.
export function evaluateAnswerHeuristic({ question, answer, keywords = [], skills = [], timeUsed, timeLimit, difficulty = 1 }) {
  const answered = String(answer || '').trim().length > 0
  if (!answered) {
    return {
      dimensions: { accuracy: 0, relevance: 0, depth: 0, clarity: 0, timeEfficiency: 0 },
      overall: 0,
      answered: false,
      feedback: 'No answer was provided in time. In a real interview, even a brief structured attempt scores better than silence.',
      verdict: 'No answer',
      source: 'simulation',
    }
  }

  const ansTokens = uniqueTokens(answer)
  const ansTokenSet = new Set(ansTokens)
  const words = countWords(answer)
  const sentences = countSentences(answer)
  const avgSentenceLen = words / sentences

  // Build a "target" vocabulary from keywords + question terms + skills.
  const target = new Set([...keywords.flatMap((k) => tokenize(k)), ...tokenize(question), ...skills.flatMap((s) => tokenize(s))])
  const targetArr = Array.from(target)
  const hits = targetArr.filter((t) => ansTokenSet.has(t)).length
  const coverage = targetArr.length ? hits / targetArr.length : 0

  // Accuracy: keyword coverage, scaled, with a length floor so one-word answers can't score high.
  let accuracy = clamp(round(coverage * 130 + Math.min(words, 60) * 0.2), 0, 100)
  // Relevance: focuses on question-term overlap.
  const qTerms = uniqueTokens(question)
  const relHits = qTerms.filter((t) => ansTokenSet.has(t)).length
  let relevance = clamp(round((qTerms.length ? relHits / qTerms.length : 0) * 120 + 25), 0, 100)
  // Depth: rewards length, examples, numbers, and distinct technical terms.
  const hasExample = /for example|e\.g\.|for instance|such as|like when/i.test(answer)
  const hasNumbers = /\d/.test(answer)
  let depth = clamp(
    round(Math.min(words, 140) * 0.5 + (hasExample ? 14 : 0) + (hasNumbers ? 8 : 0) + Math.min(ansTokens.length, 40) * 0.4),
    0,
    100
  )
  // Clarity: ideal average sentence length 8–22 words; penalise extremes / wall-of-text.
  let clarity
  if (avgSentenceLen < 4) clarity = 55
  else if (avgSentenceLen <= 22) clarity = clamp(round(92 - Math.abs(14 - avgSentenceLen) * 1.5), 60, 96)
  else clarity = clamp(round(90 - (avgSentenceLen - 22) * 2.5), 35, 78)
  if (words < 12) clarity = Math.min(clarity, 62)

  const timeEff = timeEfficiencyScore({ timeUsed, timeLimit, answered: true })

  // Harder questions expect more — gently scale accuracy/depth expectations.
  if (difficulty >= 2) {
    accuracy = clamp(round(accuracy * 0.96), 0, 100)
    depth = clamp(round(depth * 0.94), 0, 100)
  }
  if (difficulty >= 3) {
    accuracy = clamp(round(accuracy * 0.95), 0, 100)
    depth = clamp(round(depth * 0.93), 0, 100)
  }

  const dimensions = { accuracy, relevance, depth, clarity, timeEfficiency: timeEff }
  const overall = computeOverall(dimensions)

  // Templated, dimension-aware feedback.
  const low = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0]
  const high = Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0]
  const labelMap = { accuracy: 'technical accuracy', relevance: 'relevance to the question', depth: 'depth and detail', clarity: 'clarity of explanation', timeEfficiency: 'time management' }
  const tips = {
    accuracy: 'try to name the specific concepts and mechanisms involved rather than staying high-level.',
    relevance: 'anchor the first sentence directly to what was asked before expanding.',
    depth: 'add a concrete example or walk through a short scenario to show depth.',
    clarity: 'break the answer into shorter, structured points so it is easier to follow.',
    timeEfficiency: 'aim to land the core answer well within the time limit, then add detail.',
  }
  let feedback = `Good work on ${labelMap[high[0]]}. To level up, ${tips[low[0]]}`
  if (overall >= 78) feedback = `Strong, well-structured answer — especially on ${labelMap[high[0]]}. Keep this consistency on harder questions.`
  if (overall < 45) feedback = `This answer needs more substance. Focus first on ${tips[low[0]]}`

  const verdict = overall >= 75 ? 'Strong' : overall >= 50 ? 'Adequate' : 'Weak'

  return { dimensions, overall, answered: true, feedback, verdict, source: 'simulation' }
}

export function finalReportHeuristic({ analysis, history, terminatedEarly, readiness, dimensionAverages }) {
  const dims = dimensionAverages
  const labelMap = { accuracy: 'Technical accuracy', relevance: 'Relevance', depth: 'Depth of answers', clarity: 'Communication clarity', timeEfficiency: 'Time management' }
  const sorted = Object.entries(dims).sort((a, b) => b[1] - a[1])

  const strengths = sorted.filter(([, v]) => v >= 65).slice(0, 3).map(([k, v]) => `${labelMap[k]} (${v}/100)`)
  const weaknesses = sorted.filter(([, v]) => v < 60).slice(-3).reverse().map(([k, v]) => `${labelMap[k]} (${v}/100)`)
  if (!strengths.length) strengths.push(`Most reliable area: ${labelMap[sorted[0][0]]} (${sorted[0][1]}/100)`)
  if (!weaknesses.length) weaknesses.push('No major weaknesses — push into harder topics to keep growing.')

  const actionable = []
  if (dims.accuracy < 65) actionable.push('Revisit fundamentals for your weakest topics and practise stating precise definitions out loud.')
  if (dims.depth < 65) actionable.push('Use the STAR / example-driven structure so every answer includes a concrete illustration.')
  if (dims.clarity < 65) actionable.push('Practise answering in 3 crisp points: claim → reason → example.')
  if (dims.timeEfficiency < 65) actionable.push('Time your practice answers; deliver the core point in the first 30–40 seconds.')
  if (dims.relevance < 65) actionable.push('Re-state the question in your first sentence to stay on target.')
  if (analysis?.missing?.length) actionable.push(`Close the JD gap by studying: ${analysis.missing.slice(0, 4).join(', ')}.`)
  if (!actionable.length) actionable.push('Maintain this level and rehearse a few hard system-design questions to stretch further.')

  const summary = terminatedEarly
    ? 'The interview ended early because performance dropped below the readiness threshold. Focus on the fundamentals below and retry when answers feel more confident.'
    : `You completed the interview with a readiness score of ${readiness}/100. ${
        readiness >= 72 ? 'You present as interview-ready for this role.' : readiness >= 55 ? 'You are close — a focused week on the weak areas should get you there.' : 'There is meaningful ground to cover before this role; the action plan below is your fastest path.'
      }`

  return { strengths, weaknesses, actionable, summary, source: 'simulation' }
}
