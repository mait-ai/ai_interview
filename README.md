# Crucible — AI-Powered Mock Interview Platform

Crucible is a live, adaptive AI interviewer for technical roles. It reads a candidate's resume and a job description, asks tailored questions one at a time, adapts the difficulty to the quality of each answer, enforces a strict time limit on every question, scores each answer across five dimensions, and produces a complete interview-readiness report with a final score from 0 to 100.

Built for the Hack2Hire AI-Powered Interview Hackathon.

Repository: github.com/mait-ai/ai_interview

---

## Demo video (required)

A screen recording of the live, working project:

Watch the demo: (https://drive.google.com/file/d/1XePLUe5sg8Kna7g7In6mYX0-1FuzgLaJ/view?usp=sharing)

## Live demo (optional)

Live app: https://aiinterview-bykwlqqoh-mait-ais-projects.vercel.app/

A hosted version is optional, but it gives an evaluation edge. This project is already prepared to deploy on Vercel or Netlify.

---

## What it does

- Analyses a candidate resume: skills, experience, projects, and relevance to the role.
- Accepts a job description and aligns the entire interview to that role.
- Asks technical, conceptual, behavioural, and scenario questions, one at a time.
- Adapts difficulty in real time: strong answers raise the difficulty, weaker answers ease it back.
- Enforces a strict per-question time limit with a live countdown and time-efficiency penalties.
- Ends the interview early if performance falls below a defined threshold.
- Scores every answer on accuracy, clarity, depth, relevance, and time efficiency.
- Produces a final readiness score from 0 to 100, a category of Strong, Average, or Needs Improvement, a per-dimension breakdown, a list of strengths and weaknesses, an actionable improvement plan, and a hiring-readiness indicator for the role.

## Key features beyond the brief

- Works with zero setup. A built-in offline engine runs the entire interview in the browser, so no API key is required for a complete, working demonstration.
- Optional real AI. Connect Google Gemini, Groq, OpenAI, or any compatible service to power the analysis, questions, scoring, and feedback. The provider can be changed at any time from the in-app Settings panel, with a one-click connection test.
- Graceful fallback. If an AI call fails for any reason, the app quietly falls back to the offline engine, so a demonstration never breaks in the middle.
- Voice mode. Questions can be read aloud, and answers can be spoken, using the browser's built-in speech features.
- Resume upload or paste. Upload a PDF, which is parsed entirely in the browser, or paste the text directly.
- Live visualisation. A countdown ring, an animated difficulty indicator, and a running score show the engine's decisions as they happen.
- Optional proctoring. Switching away from the interview tab during the session is detected and noted in the report.
- Rich report. An animated readiness gauge, a five-axis radar chart, a question-by-question breakdown, and a downloadable, printable report.

## How the requirements are met

| Requirement (from the problem statement) | Where it is implemented |
| --- | --- |
| Analyse resume: skills, experience, projects, role relevance | `src/services/interviewAI.js` (analyzeProfile); offline logic in `src/lib/heuristics.js` |
| Accept a job description and align questions | Resume and job-description intake in `src/components/SetupScreen.jsx` |
| Ask technical, conceptual, behavioural, scenario questions | `src/services/interviewAI.js` (nextQuestion); offline bank in `src/lib/questionBank.js` |
| Varying difficulty (Easy to Medium to Hard) | `src/lib/scoring.js` (difficulty levels) and the difficulty selector in setup |
| Adapt difficulty dynamically | `src/lib/scoring.js` (nextDifficulty): a score of 75 or more raises difficulty, 42 or less lowers it |
| Strict time limits with penalties | `src/components/TimerRing.jsx` (countdown and auto-submit) and the time-efficiency score in `src/lib/scoring.js` |
| Early termination below a threshold | `src/lib/scoring.js` (shouldTerminateEarly) |
| Objective scoring across five dimensions | `src/lib/scoring.js` (dimensions and weighted score); grading in `src/lib/heuristics.js` |
| Final readiness score (0 to 100) and category | `src/lib/scoring.js` (computeReadiness, categoryFor) |
| Breakdown by dimension | `src/lib/scoring.js` (dimensionAverages); charts in `src/components/ReportScreen.jsx` |
| Strengths, weaknesses, actionable feedback | `src/services/interviewAI.js` (finalReport); offline version in `src/lib/heuristics.js` |
| Hiring-readiness indicator for the role | `src/lib/scoring.js` (hiringReadinessFor) |
| State-based flow, adaptive logic, edge cases | State machine in `src/App.jsx`; empty answers, time-outs, and duplicate questions handled throughout |

## Tech stack

- React 18 and Vite, for a fast, modern single-page application.
- Tailwind CSS, for styling with a custom warm editorial theme.
- Framer Motion, for animation and transitions.
- lucide-react, for icons.
- pdfjs-dist, for in-browser PDF text extraction.
- The browser's Web Speech API, for optional spoken questions and voice answers.

No backend is required. The application runs entirely in the browser, and any AI calls are made directly to the chosen provider.

## Getting started

Prerequisites: Node.js version 18 or newer.

Install and run:

```
npm install
npm run dev
```

Then open the address that Vite prints, usually `http://localhost:5173`.

Build for production:

```
npm run build
npm run preview
```

## Where the API key goes

Crucible runs out of the box with no key, using the offline engine. To power it with a real AI service, there are two options.

Option A, recommended for the demo: start the app, open the Settings panel, choose a provider such as Google Gemini, paste your key, and save. The key stays only in that browser tab for the session and is never saved to any file.

Option B, for local development: copy `.env.example` to a file named `.env`, then set your values:

```
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your_key_here
VITE_LLM_MODEL=
VITE_LLM_BASE_URL=
```

Only variables that start with `VITE_` are read by the app. The `.env` file is already listed in `.gitignore`.

Important: this repository must be public for the hackathon. A real key committed to a public repository can be found and misused within minutes. For the demonstration, please use Option A or the offline engine. If you must show a key, use a temporary, low-quota key and revoke it immediately after recording.

## Deployment

The build output is fully static, so any static host works.

Vercel: import the repository at vercel.com, keep the detected Vite settings, and deploy. Then paste the resulting link into the Live demo section above.

Netlify: create a new site from the repository, set the build command to `npm run build` and the publish directory to `dist`, and deploy.

## How the engine works

Scoring. Each answer is scored from 0 to 100 on five dimensions, combined into a weighted answer score: accuracy at 30 percent, relevance at 25 percent, depth at 20 percent, clarity at 15 percent, and time efficiency at 10 percent. Time efficiency is always calculated directly from time used against the limit, so it stays objective. An empty or timed-out answer scores zero.

Adaptive difficulty. After each answer, a score of 75 or above moves the difficulty up, a score of 42 or below moves it down, and anything in between holds. The current level and direction are shown live.

Early termination. After a minimum number of questions, the interview ends early if the running average drops below 30, the last three answers are each below 35, or two questions in a row are left unanswered.

Final readiness. The readiness score is the mean answer score, with small adjustments for consistency and for reaching harder questions. Early termination caps and reduces the score. The result maps to a category and a hiring-readiness indicator.

## Project structure

```
ai_interview/
├─ index.html
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .env.example
├─ README.md
├─ Crucible-Project-Report.md
└─ src/
   ├─ main.jsx                 app entry
   ├─ App.jsx                  state machine: setup, analyzing, interview, report
   ├─ index.css                styling and theme
   ├─ components/
   │  ├─ Background.jsx         animated backdrop
   │  ├─ ui.jsx                 buttons, cards, pills, toggles, fields
   │  ├─ InterviewerAvatar.jsx  animated AI avatar
   │  ├─ TimerRing.jsx          countdown ring with auto-submit
   │  ├─ charts.jsx             score gauge, radar chart, bars
   │  ├─ SettingsModal.jsx      provider, key, model, connection test
   │  ├─ SetupScreen.jsx        resume and job-description intake
   │  ├─ AnalyzingScreen.jsx    loading state
   │  ├─ InterviewScreen.jsx    the live interview loop
   │  └─ ReportScreen.jsx       final readiness report
   ├─ hooks/
   │  └─ useSpeech.js           speech-to-text and text-to-speech
   ├─ lib/
   │  ├─ utils.js               helpers
   │  ├─ scoring.js             dimensions, adaptive logic, termination, readiness
   │  ├─ questionBank.js        offline question bank
   │  └─ heuristics.js          offline engine
   └─ services/
      ├─ config.js              provider configuration
      ├─ llm.js                 multi-provider AI client
      ├─ pdf.js                 in-browser PDF text extraction
      └─ interviewAI.js         AI logic with automatic offline fallback
```

## Limitations

- Voice mode uses the browser's Web Speech API. It works best in Google Chrome or Microsoft Edge, requires microphone permission, and requires the secure online site rather than a local file. The platform is fully usable by typing if voice is not available.
- PDF parsing extracts text only. Scanned, image-only PDFs may not yield text, in which case please paste the resume instead.
- The offline engine uses transparent rules rather than real language understanding. Connecting an AI service gives the most natural questions and feedback.

## Project report

A full written report is included in the repository as `Crucible-Project-Report.md`. It describes the problem, the solution, the features, the technology, and how each requirement is met.

## License

Released under the MIT License. See the LICENSE file.
