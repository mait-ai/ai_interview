# Crucible — AI-Powered Mock Interview Platform

> Forge your interview readiness. Crucible is a live, adaptive AI interviewer that reads your résumé and a job description, asks tailored questions, adapts its difficulty to your answers, holds you to strict time limits, scores you objectively across five dimensions, and produces a full interview-readiness report.

Built for the **Hack2Hire: AI-Powered Interview Hackathon**.

---

## Demo video (required)

A screen recording of the live, working project:

**▶ Watch the demo:** `PASTE_YOUR_VIDEO_LINK_HERE`

> Replace the link above with your screen recording (YouTube / Loom / Google Drive). This is mandatory for a valid submission. To embed a thumbnail that links to the video, you may also use:
>
> ```markdown
> [![Watch the demo](docs/demo-thumbnail.png)](PASTE_YOUR_VIDEO_LINK_HERE)
> ```

A live hosted version (optional, gives an evaluation edge):

**🔗 Live app:** `PASTE_YOUR_DEPLOY_LINK_HERE`

---

## What it does

- Analyses a candidate résumé (skills, experience, projects, role relevance).
- Accepts a job description and aligns the interview to the role.
- Asks technical, conceptual, behavioral and scenario-based questions, one at a time.
- Adapts difficulty dynamically: strong answers push the difficulty up; weak answers ease it back.
- Enforces a strict, per-question time limit with a live countdown and time-efficiency penalties.
- Terminates the interview early if performance falls below a defined threshold.
- Scores every answer objectively on Accuracy, Clarity, Depth, Relevance and Time efficiency.
- Generates a final Interview Readiness Score (0–100), a category (Strong / Average / Needs Improvement), a per-dimension breakdown, strengths and weaknesses, an actionable improvement plan, and a hiring-readiness indicator for the given role.

---

## Standout features (beyond the brief)

- **Works with zero setup.** A built-in, rule-based **Simulation Engine** runs the entire interview offline in the browser. No API key is required for a complete, working demo.
- **Bring your own AI.** Optionally plug in Google Gemini, Groq, OpenAI, or any OpenAI-compatible endpoint to power analysis, questioning, scoring and feedback. The provider is switchable at runtime from an in-app Settings panel, with a one-click connection test.
- **Graceful fallback.** If an AI call fails for any reason (no key, network or CORS issue, malformed response), Crucible transparently falls back to the Simulation Engine so a demo never breaks mid-interview.
- **Voice mode.** Hear questions read aloud and answer by speaking, using the browser's built-in speech APIs.
- **Résumé upload or paste.** Upload a PDF (parsed entirely in the browser) or paste text directly.
- **Live adaptive visualisation.** A countdown ring, animated difficulty indicator, and running-average score show the engine's decisions in real time.
- **Focus proctoring (optional).** Tab-switching during the interview is detected and noted in the report.
- **Rich report.** Animated readiness gauge, a five-axis radar chart, a question-by-question breakdown, and a downloadable / printable report.

---

## How the requirements are met

| Requirement (from the problem statement) | Where it is implemented |
| --- | --- |
| Analyse résumé: skills, experience, projects, role relevance | `services/interviewAI.js` (`analyzeProfile`); offline logic in `lib/heuristics.js` (`analyzeResumeHeuristic`) |
| Accept a job description and align questions | Résumé and JD intake in `components/SetupScreen.jsx`; both passed into analysis and question generation |
| Ask technical, conceptual, behavioral, scenario questions | `services/interviewAI.js` (`nextQuestion`); offline bank in `lib/questionBank.js` (tagged by category) |
| Varying difficulty (Easy → Medium → Hard) | `lib/scoring.js` (`DIFFICULTY`, `DIFFICULTY_META`) and the difficulty selector in setup |
| Adapt difficulty dynamically | `lib/scoring.js` (`nextDifficulty`): score ≥ 75 increases difficulty, ≤ 42 decreases it, otherwise holds |
| Strict time limits with penalties | `components/TimerRing.jsx` (drift-free countdown + auto-submit) and `timeEfficiencyScore` in `lib/scoring.js` |
| Early termination below a threshold | `lib/scoring.js` (`shouldTerminateEarly`): sustained low average, three consecutive weak answers, or two consecutive non-answers |
| Objective scoring (Accuracy, Clarity, Depth, Relevance, Time efficiency) | `lib/scoring.js` (`DIMENSIONS`, `computeOverall`); AI grading and transparent offline grading in `lib/heuristics.js` |
| Final readiness score (0–100) + category | `lib/scoring.js` (`computeReadiness`, `categoryFor`) |
| Performance breakdown by skill / dimension | `lib/scoring.js` (`dimensionAverages`); radar chart and bars in `components/ReportScreen.jsx` |
| Strengths, weaknesses, actionable feedback | `services/interviewAI.js` (`finalReport`); offline version in `lib/heuristics.js` (`finalReportHeuristic`) |
| Hiring-readiness indicator for the JD | `lib/scoring.js` (`hiringReadinessFor`) |
| State-based simulation, adaptive logic, edge cases | State machine in `src/App.jsx`; edge cases such as empty answers, time-outs, and duplicate questions handled throughout |

---

## Tech stack

- **React 18** + **Vite** — fast, modern single-page app.
- **Tailwind CSS** — utility-first styling with a custom warm editorial theme.
- **Framer Motion** — animation and transitions.
- **lucide-react** — icon set.
- **pdfjs-dist** — in-browser PDF text extraction.
- **Web Speech API** — optional spoken questions and voice answers.

No backend is required. The app runs fully in the browser; AI calls (if enabled) are made directly to the chosen provider.

---

## Getting started

### Prerequisites

- Node.js 18 or newer.

### Install and run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

---

## Using an AI provider (and where the API key goes)

Crucible runs out of the box with **no key** using the offline Simulation Engine. To power it with a real LLM, you have two options.

### Option A — In-app Settings (recommended for the demo)

1. Start the app and click the engine button in the top bar.
2. Choose a provider (Google Gemini is recommended — it has a free tier and works well from the browser).
3. Paste your API key, optionally set a model, and click **Test connection**.
4. Save. The key lives only in that browser tab for the session and is never committed anywhere.

Get a free key:

- Google Gemini: <https://aistudio.google.com/app/apikey>
- Groq: <https://console.groq.com/keys>
- OpenAI: <https://platform.openai.com/api-keys>

### Option B — Environment file (`.env`) for local development

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:

   ```bash
   VITE_LLM_PROVIDER=gemini
   VITE_LLM_API_KEY=your_key_here
   VITE_LLM_MODEL=            # optional
   VITE_LLM_BASE_URL=         # only for provider=custom
   ```

Vite exposes only variables prefixed with `VITE_`. The values are read in `src/services/config.js`.

### Important: this repository must be public — do not commit a real key

The hackathon requires a **public** repository. A real API key committed to a public repo can be scraped within minutes and used to run up charges on your account.

- `.env` is already listed in `.gitignore`, so following Option B keeps your key out of version control.
- For the demo recording, prefer **Option A** (paste the key in the app) or use the offline Simulation Engine.
- If you must demonstrate a key in the repo, generate a **temporary, low-quota key** and **revoke it immediately** after recording. Never commit a long-lived production key.

### Switching provider or model

The provider, model and base URL can all be changed at runtime in the in-app Settings panel, or via the `.env` variables above. Defaults: `gemini-2.0-flash`, `gpt-4o-mini` (OpenAI), and `llama-3.3-70b-versatile` (Groq).

---

## Deploying (optional, recommended)

Any static host works because the build output is fully static.

**Vercel**

1. Push this repository to GitHub.
2. Import it at <https://vercel.com/new>.
3. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
4. Deploy, then paste the URL into the "Live app" link above.

**Netlify**

1. New site from Git, select the repository.
2. Build command `npm run build`, publish directory `dist`.
3. Deploy.

> If you set AI keys as host environment variables, remember they are bundled into the client at build time (any `VITE_` variable is visible in the browser). For a public demo, the in-app Settings panel or the offline engine is the safer choice.

---

## How the engine works

### Scoring

Each answer is scored 0–100 on five dimensions, combined into a weighted answer score:

- Accuracy (30%)
- Relevance (25%)
- Depth (20%)
- Clarity (15%)
- Time efficiency (10%)

Time efficiency is always computed deterministically from time used versus the limit, so it stays objective even when an LLM grades the rest. An empty or timed-out answer scores zero.

### Adaptive difficulty

After each answer the engine recalculates difficulty: a score of 75 or above moves up a level (toward Hard), 42 or below moves down (toward Easy), and anything in between holds. The current level and the most recent direction are shown live during the interview.

### Early termination

The interview ends early if, after a minimum number of questions, any of the following is true: the running average drops below 30/100, the last three answers are each below 35/100, or two consecutive questions are left unanswered.

### Final readiness

The readiness score is the mean answer score with small adjustments for consistency (lower variance is rewarded) and for reaching and surviving harder questions. An early termination caps and penalises the score. The result maps to a category and a hiring-readiness indicator for the role.

---

## Project structure

```
crucible-ai-interviewer/
├─ index.html
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .env.example
└─ src/
   ├─ main.jsx                 # app entry
   ├─ App.jsx                  # state machine: setup → analyzing → interview → report
   ├─ index.css                # Tailwind layers + theme utilities
   ├─ components/
   │  ├─ Background.jsx         # animated gradient-mesh backdrop
   │  ├─ ui.jsx                 # buttons, cards, pills, toggles, fields
   │  ├─ InterviewerAvatar.jsx  # animated AI avatar
   │  ├─ TimerRing.jsx          # countdown ring with auto-submit
   │  ├─ charts.jsx             # score gauge, radar chart, bars
   │  ├─ SettingsModal.jsx      # provider / key / model + connection test
   │  ├─ SetupScreen.jsx        # résumé + JD intake and options
   │  ├─ AnalyzingScreen.jsx    # loading state
   │  ├─ InterviewScreen.jsx    # the live interview loop
   │  └─ ReportScreen.jsx       # final readiness report
   ├─ hooks/
   │  └─ useSpeech.js           # speech-to-text and text-to-speech hooks
   ├─ lib/
   │  ├─ utils.js               # helpers (formatting, JSON parsing, tokenisation)
   │  ├─ scoring.js             # dimensions, adaptive logic, termination, readiness
   │  ├─ questionBank.js        # offline tagged question bank
   │  └─ heuristics.js          # offline Simulation Engine
   └─ services/
      ├─ config.js              # provider configuration
      ├─ llm.js                 # multi-provider LLM client (Gemini + OpenAI-compatible)
      ├─ pdf.js                 # in-browser PDF text extraction
      └─ interviewAI.js         # AI brain with automatic offline fallback
```

---

## Notes and limitations

- Voice mode relies on the browser's Web Speech API and works best in Chromium-based browsers; the platform stays fully usable without it.
- PDF parsing extracts text only; scanned image-only PDFs may not yield text, in which case paste the résumé instead.
- The offline Simulation Engine uses transparent heuristics, not real language understanding; enabling an LLM gives the most natural questions and feedback.

---

## License

Released under the MIT License. See [LICENSE](LICENSE).
