// High-level interview brain. Each function tries the configured LLM and, on
// any failure (no key, network/CORS error, bad JSON), transparently falls back
// to the offline Simulation Engine so the platform never breaks.

import { callLLMJSON } from './llm.js'
import { usesLLM } from './config.js'
import { computeOverall, timeEfficiencyScore } from '../lib/scoring.js'
import {
  analyzeResumeHeuristic,
  pickQuestionHeuristic,
  evaluateAnswerHeuristic,
  finalReportHeuristic,
} from '../lib/heuristics.js'
import { clamp, round } from '../lib/utils.js'

const cut = (s, n = 6000) => String(s || '').slice(0, n)

async function withFallback(config, llmFn, heuristicFn) {
  if (!usesLLM(config)) return heuristicFn()
  try {
    const result = await llmFn()
    return result
  } catch (e) {
    console.warn('[Crucible] LLM call failed — using Simulation Engine.', e?.message || e)
    const fb = heuristicFn()
    fb._fellBack = true
    return fb
  }
}

// ---------------- Resume + JD analysis ----------------
export async function analyzeProfile({ config, resumeText, jdText }) {
  return withFallback(
    config,
    async () => {
      const system =
        'You are a senior technical recruiter. Analyse a candidate resume against a job description. Reply ONLY with a JSON object.'
      const user = `RESUME:\n${cut(resumeText)}\n\nJOB DESCRIPTION:\n${cut(jdText)}\n\nReturn JSON with keys: skills (array of strings found in resume), jdSkills (array of skills the JD requires), matched (array present in both), missing (array required but absent from resume), experienceLevel (one of "Entry / Junior","Mid-level","Senior"), roleRelevance (integer 0-100), projects (array of up to 3 short project descriptions from the resume), focusAreas (array of up to 8 topics to interview on), summary (2-3 sentence assessment).`
      const out = await callLLMJSON({ config, system, user })
      return {
        skills: arr(out.skills, ['general software engineering']),
        jdSkills: arr(out.jdSkills),
        matched: arr(out.matched),
        missing: arr(out.missing),
        experienceLevel: str(out.experienceLevel, 'Mid-level'),
        roleRelevance: clamp(round(num(out.roleRelevance, 50)), 0, 100),
        projects: arr(out.projects),
        focusAreas: arr(out.focusAreas, ['problem solving']),
        summary: str(out.summary, 'Profile analysed.'),
        source: 'ai',
      }
    },
    () => analyzeResumeHeuristic(resumeText, jdText)
  )
}

// ---------------- Question generation ----------------
export async function nextQuestion({ config, analysis, difficulty, asked = [], questionNumber, total }) {
  const diffLabel = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }[difficulty]
  return withFallback(
    config,
    async () => {
      const system =
        'You are an expert technical interviewer running a live, adaptive interview. Ask ONE question at a time. Reply ONLY with a JSON object.'
      const user = `Candidate focus areas: ${(analysis.focusAreas || []).join(', ')}.
Skills: ${(analysis.skills || []).join(', ')}.
Target role / JD skills: ${(analysis.jdSkills || []).join(', ')}.
Experience level: ${analysis.experienceLevel}.
This is question ${questionNumber} of up to ${total}. Required difficulty: ${diffLabel}.
Already asked (do NOT repeat or paraphrase these): ${asked.map((q) => `"${q}"`).join('; ') || 'none'}.
Vary the category across the interview (technical, conceptual, behavioral, scenario-based). Tailor the question to the candidate's profile and the role.
Return JSON: { "question": string, "category": one of "Technical"|"Conceptual"|"Behavioral"|"Scenario", "difficulty": ${difficulty}, "keywords": array of 4-8 key terms a strong answer should contain }.`
      const out = await callLLMJSON({ config, system, user })
      const question = str(out.question, '')
      if (!question || asked.includes(question)) throw new Error('Empty/duplicate question from LLM')
      return {
        question,
        category: str(out.category, 'Technical'),
        difficulty,
        keywords: arr(out.keywords),
        source: 'ai',
      }
    },
    () => pickQuestionHeuristic({ skills: analysis.focusAreas?.length ? analysis.focusAreas : analysis.skills, difficulty, asked })
  )
}

// ---------------- Answer evaluation ----------------
export async function evaluateAnswer({ config, question, category, answer, keywords = [], skills = [], timeUsed, timeLimit, difficulty = 1 }) {
  const answered = String(answer || '').trim().length > 0

  // No answer => deterministic zero, no LLM needed.
  if (!answered) {
    return {
      dimensions: { accuracy: 0, relevance: 0, depth: 0, clarity: 0, timeEfficiency: 0 },
      overall: 0,
      answered: false,
      feedback: 'No answer was provided in time. A brief, structured attempt always beats silence in a real interview.',
      verdict: 'No answer',
      source: usesLLM(config) ? 'ai' : 'simulation',
    }
  }

  // Time efficiency is always computed deterministically for objectivity.
  const timeEff = timeEfficiencyScore({ timeUsed, timeLimit, answered: true })

  return withFallback(
    config,
    async () => {
      const system =
        'You are a fair but rigorous technical interviewer grading a single answer. Be objective and consistent. Reply ONLY with a JSON object.'
      const user = `QUESTION (${category}, difficulty ${difficulty}/3): ${question}
KEY POINTS a strong answer should cover: ${keywords.join(', ') || 'use your judgement'}
CANDIDATE ANSWER: """${cut(answer, 4000)}"""
The candidate used ${Math.round(timeUsed)}s of a ${timeLimit}s limit.
Grade each dimension 0-100 and return JSON: { "accuracy": int, "relevance": int, "depth": int, "clarity": int, "feedback": "one or two sentences of specific, actionable feedback", "verdict": one of "Strong"|"Adequate"|"Weak" }.`
      const out = await callLLMJSON({ config, system, user })
      const dimensions = {
        accuracy: clamp(round(num(out.accuracy, 0)), 0, 100),
        relevance: clamp(round(num(out.relevance, 0)), 0, 100),
        depth: clamp(round(num(out.depth, 0)), 0, 100),
        clarity: clamp(round(num(out.clarity, 0)), 0, 100),
        timeEfficiency: timeEff,
      }
      return {
        dimensions,
        overall: computeOverall(dimensions),
        answered: true,
        feedback: str(out.feedback, 'Reasonable answer.'),
        verdict: str(out.verdict, 'Adequate'),
        source: 'ai',
      }
    },
    () => evaluateAnswerHeuristic({ question, answer, keywords, skills, timeUsed, timeLimit, difficulty })
  )
}

// ---------------- Final report ----------------
export async function finalReport({ config, analysis, history, terminatedEarly, readiness, dimensionAverages }) {
  return withFallback(
    config,
    async () => {
      const transcript = history
        .map((h, i) => `Q${i + 1} [${h.category}/${h.difficultyLabel}] score ${h.overall}/100 — answered: ${h.answered}`)
        .join('\n')
      const system =
        'You are a senior interviewer writing a candid post-interview report for the candidate. Reply ONLY with a JSON object.'
      const user = `Role skills: ${(analysis.jdSkills || []).join(', ')}.
Per-dimension averages (0-100): ${JSON.stringify(dimensionAverages)}.
Overall readiness score: ${readiness}/100. Terminated early: ${terminatedEarly}.
Question summary:\n${transcript}\n
Return JSON: { "strengths": array of 2-4 short strings, "weaknesses": array of 2-4 short strings, "actionable": array of 3-5 specific improvement actions, "summary": "3-4 sentence overall assessment for this role" }.`
      const out = await callLLMJSON({ config, system, user })
      return {
        strengths: arr(out.strengths, ['Engaged with the full interview']),
        weaknesses: arr(out.weaknesses, ['Keep practising under time pressure']),
        actionable: arr(out.actionable, ['Practise more mock interviews']),
        summary: str(out.summary, 'Interview complete.'),
        source: 'ai',
      }
    },
    () => finalReportHeuristic({ analysis, history, terminatedEarly, readiness, dimensionAverages })
  )
}

// ---- tiny validators ----
function arr(v, fallback = []) {
  if (Array.isArray(v)) return v.filter((x) => x != null && String(x).trim()).map((x) => String(x).trim())
  return fallback
}
function str(v, fallback = '') {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}
function num(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
