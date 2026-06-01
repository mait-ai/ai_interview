# Crucible — AI-Powered Mock Interview Platform
### Hackathon Project Report

**Repository:** github.com/mait-ai/ai_interview
**Category:** AI-Powered Mock Interview Platform (Technical Roles)
**Type:** Browser-based web application (React + Vite)

---

## 1. Problem Statement

Many candidates struggle in technical interviews not because they lack ability, but because they lack realistic practice and clear, structured feedback. The challenge was to build an AI interviewer that can read a candidate's resume and a job description, conduct a realistic interview with varied and adaptive questions, enforce time pressure fairly, and produce a measurable, honest assessment of how ready the candidate is to be hired.

## 2. Solution Overview

Crucible is a complete, browser-based mock interview platform. The candidate provides a resume and a target job description, and the system then conducts a full adaptive interview. It asks a mix of technical, conceptual, behavioural, and scenario questions, raises or lowers the difficulty based on performance, enforces a strict time limit on each question, and can end the interview early if performance falls below a safe threshold. At the end, it produces a detailed readiness report with a single score from 0 to 100, a category verdict, a per-skill breakdown, clear strengths and weaknesses, and an actionable improvement plan.

A key design choice is that the platform runs entirely in the browser and requires no paid services to demonstrate. It includes a built-in offline engine, so it always works during evaluation, with an optional connection to a real language model for richer results.

## 3. How the Solution Meets Every Requirement

- **Resume analysis.** The platform reads the resume (typed or uploaded as a PDF) and extracts skills, experience level, projects, and relevance to the chosen role.
- **Job description alignment.** It compares the resume against the job description, identifies matched and missing skills, and focuses questions on the most relevant areas.
- **Varied question types.** Questions are drawn across four categories: technical, conceptual, behavioural, and scenario based.
- **Difficulty progression.** Questions move through Easy, Medium, and Hard levels.
- **Dynamic difficulty adaptation.** After each answer, the difficulty is raised when the candidate scores well and lowered when the candidate struggles, so the interview matches their real level.
- **Strict time limits with penalties.** Each question has a firm countdown. Slow or unanswered responses reduce the time-efficiency score, and an expired timer submits the answer automatically.
- **Early termination.** If average performance, recent performance, or repeated unanswered questions fall below a safe threshold, the interview ends early and the report explains why.
- **Multi-dimensional scoring.** Every answer is scored on five dimensions: accuracy, clarity, depth, relevance, and time efficiency.
- **Final readiness score.** A single score from 0 to 100 is produced, with a category of Strong, Average, or Needs Improvement.
- **Detailed breakdown.** The report provides a per-skill and per-dimension breakdown, a list of strengths, a list of weaknesses, an actionable improvement plan, and a clear hiring-readiness indicator.

## 4. Additional Features (Beyond the Brief)

- **Offline Simulation Engine.** A built-in engine runs a full interview with no API key, guaranteeing a working demonstration.
- **Voice support.** The candidate can answer by speaking, and the interviewer can read questions aloud.
- **Live adaptive-difficulty display.** An on-screen panel shows, in real time, whether the next question is getting harder, easier, or holding steady.
- **Visual report.** The result includes an animated score gauge, a radar chart of the five dimensions, and per-dimension bars.
- **Downloadable and printable report.** The full report can be saved as a text file or printed.
- **Optional proctoring.** The platform can detect when the candidate switches away from the interview tab and notes this in the report.
- **Flexible resume input.** The candidate can either paste their resume text or upload a PDF, with a graceful fallback if a PDF cannot be read.

## 5. Technology Stack

- **Framework:** React 18 with the Vite build tool.
- **Styling:** Tailwind CSS, with the framer-motion library for smooth animation.
- **Icons:** lucide-react.
- **PDF reading:** pdfjs-dist, for resume PDF parsing in the browser.
- **AI layer:** A multi-provider design that supports Google Gemini, Groq, OpenAI, and any compatible custom endpoint, plus the built-in offline engine.
- **Architecture:** Browser-only, with no backend server required.

## 6. Design

The interface uses a warm, editorial visual style rather than a plain dark theme. It features a soft cream background, a bright orange-to-pink highlight gradient, and supporting colours of teal, amber, and soft purple. Cards use a smooth, glass-like surface, and the interface includes gentle motion throughout, such as a glowing interviewer indicator, a coloured countdown ring, and an animated final score. The result is a bright, modern, and lively experience.

## 7. How It Works (Architecture)

The application is organised as a clear sequence of screens: setup, analysing, interview, and report. Behind these screens, dedicated service modules handle resume and job-description analysis, question selection, answer evaluation, and final report generation. A separate scoring module holds all the rules for difficulty adaptation, time penalties, early termination, and the final readiness calculation.

An important reliability feature is that if a live AI service is unavailable or returns an unexpected result, the platform automatically falls back to its built-in engine. This means the interview never breaks, and the demonstration always succeeds.

## 8. Scoring Methodology

Each answer is scored on five weighted dimensions: accuracy carries the most weight, followed by relevance, then depth, then clarity, and finally time efficiency. These combine into an overall score for the answer. Across the whole interview, the average of these scores produces the final readiness number. A score of 75 or above is rated Strong, a score of 50 or above is rated Average, and anything below that is rated Needs Improvement. The difficulty of the next question rises when a candidate scores highly and falls when they score poorly, keeping the interview calibrated to their real ability.

## 9. How to Run the Project

There are two simple ways to run Crucible.

- **As a live website.** The repository can be connected to a free hosting service such as Vercel, which builds and publishes the app and provides a public link. No commands are required.
- **On a local computer.** With Node.js installed, run the project folder with two commands: install the dependencies once, then start the development server, and open the local address that appears.

The platform works immediately with no API key, because the offline engine runs by default. A real key is optional and can be added either in the in-app Settings panel or in a private local environment file.

## 10. Privacy and Safety

The application runs entirely in the browser, so resume and answer data are not sent to any server of our own. Any optional API key is kept private and is never stored in a tracked file, which protects the candidate even though the repository is public.

## 11. Future Scope

- A larger and continuously expanding question bank across more roles.
- Analysis of spoken tone and pace, not only the words of an answer.
- Support for non-technical and mixed roles.
- A history dashboard that tracks a candidate's improvement over time.
- Stronger, server-side proctoring for formal assessments.

## 12. Conclusion

Crucible delivers a complete, realistic, and fair mock interview experience that meets every requirement of the brief and adds meaningful features on top of it. It is reliable enough to demonstrate with no setup, attractive and engaging to use, and honest in its assessment, giving candidates a clear and actionable picture of their interview readiness.
