// Minimal multi-provider LLM client. Supports Google Gemini and any
// OpenAI-compatible chat endpoint (OpenAI, Groq, custom). Always asks the model
// for a JSON object and returns the parsed result.

import { MODEL_DEFAULTS } from './config.js'
import { safeParseJSON } from '../lib/utils.js'

function resolveModel(config) {
  return config.model || MODEL_DEFAULTS[config.provider] || ''
}

function openAIBaseURL(config) {
  if (config.provider === 'openai') return 'https://api.openai.com/v1'
  if (config.provider === 'groq') return 'https://api.groq.com/openai/v1'
  if (config.provider === 'custom') return (config.baseURL || '').replace(/\/$/, '')
  return ''
}

async function callOpenAICompatible({ config, system, user }) {
  const base = openAIBaseURL(config)
  if (!base) throw new Error('Missing base URL for custom provider')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: resolveModel(config),
      temperature: 0.55,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM HTTP ${res.status}: ${detail.slice(0, 160)}`)
  }
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content || ''
  return safeParseJSON(text)
}

async function callGemini({ config, system, user }) {
  const model = resolveModel(config)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    config.apiKey
  )}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.55, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${detail.slice(0, 160)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  return safeParseJSON(text)
}

export async function callLLMJSON({ config, system, user }) {
  if (config.provider === 'gemini') return callGemini({ config, system, user })
  return callOpenAICompatible({ config, system, user })
}

// Lightweight connectivity check used by the Settings panel.
export async function testConnection(config) {
  try {
    const out = await callLLMJSON({
      config,
      system: 'You are a JSON API. Reply only with JSON.',
      user: 'Return {"ok": true} exactly.',
    })
    return { ok: !!out, model: config.model || MODEL_DEFAULTS[config.provider] }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
