// Central LLM configuration. Values come from .env (VITE_* vars) by default and
// can be overridden at runtime via the in-app Settings panel.

const env = import.meta.env || {}

export const MODEL_DEFAULTS = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  custom: '',
  demo: '',
}

export const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', hint: 'Free tier, works great from the browser — recommended', keyUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq', label: 'Groq', hint: 'Very fast, generous free tier (OpenAI-compatible)', keyUrl: 'https://console.groq.com/keys' },
  { id: 'openai', label: 'OpenAI', hint: 'GPT models (paid)', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', hint: 'Any endpoint that speaks the OpenAI chat API', keyUrl: '' },
  { id: 'demo', label: 'Simulation Engine (offline)', hint: 'No API key needed — built-in rule-based interviewer', keyUrl: '' },
]

export function getInitialConfig() {
  const provider = env.VITE_LLM_PROVIDER || 'demo'
  return {
    provider,
    apiKey: env.VITE_LLM_API_KEY && env.VITE_LLM_API_KEY !== 'PASTE_YOUR_API_KEY_HERE' ? env.VITE_LLM_API_KEY : '',
    model: env.VITE_LLM_MODEL || '',
    baseURL: env.VITE_LLM_BASE_URL || '',
  }
}

// Whether we should attempt real LLM calls (otherwise we use the offline engine).
export function usesLLM(config) {
  return config && config.provider && config.provider !== 'demo' && !!config.apiKey
}
