import React, { useCallback, useEffect, useState } from 'react'
import Background from './components/Background.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import AnalyzingScreen from './components/AnalyzingScreen.jsx'
import InterviewScreen from './components/InterviewScreen.jsx'
import ReportScreen from './components/ReportScreen.jsx'
import SettingsModal from './components/SettingsModal.jsx'

import { getInitialConfig, usesLLM } from './services/config.js'
import { analyzeProfile, nextQuestion, evaluateAnswer, finalReport } from './services/interviewAI.js'
import {
  DIFFICULTY,
  timeLimitFor,
  nextDifficulty,
  shouldTerminateEarly,
  dimensionAverages,
  computeReadiness,
  categoryFor,
  hiringReadinessFor,
} from './lib/scoring.js'
import { uid } from './lib/utils.js'

export default function App() {
  const [screen, setScreen] = useState('setup') // setup | analyzing | interview | report
  const [config, setConfig] = useState(getInitialConfig())
  const [settingsOpen, setSettingsOpen] = useState(false)

  // setup payload
  const [setup, setSetup] = useState(null)

  // interview state
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentDifficulty, setCurrentDifficulty] = useState(1)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [lastDirection, setLastDirection] = useState('hold')
  const [evaluating, setEvaluating] = useState(false)
  const [proctorFlags, setProctorFlags] = useState(0)
  const [engineDegraded, setEngineDegraded] = useState(false)

  // report state
  const [result, setResult] = useState(null)

  const noteEngine = useCallback(
    (res) => {
      if (usesLLM(config) && (res?._fellBack || (res?.source && res.source !== 'ai'))) setEngineDegraded(true)
    },
    [config]
  )

  // ---- Proctoring: count tab switches while interviewing ----
  useEffect(() => {
    if (screen !== 'interview' || !setup?.enableProctor) return
    const onVis = () => {
      if (document.hidden) setProctorFlags((n) => n + 1)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [screen, setup])

  // ---- Start ----
  const startInterview = useCallback(
    async (payload) => {
      setSetup(payload)
      setHistory([])
      setEngineDegraded(false)
      setProctorFlags(0)
      setLastDirection('hold')
      setCurrentDifficulty(payload.startDifficulty)
      setQuestionNumber(1)
      setScreen('analyzing')

      const analysisRes = await analyzeProfile({
        config,
        resumeText: payload.resumeText,
        jdText: payload.jdText,
      })
      noteEngine(analysisRes)
      setAnalysis(analysisRes)

      const q = await nextQuestion({
        config,
        analysis: analysisRes,
        difficulty: payload.startDifficulty,
        asked: [],
        questionNumber: 1,
        total: payload.numQuestions,
      })
      noteEngine(q)
      setCurrentQuestion({ ...q, id: uid('q') })
      setScreen('interview')
    },
    [config, noteEngine]
  )

  // ---- Finish + build report ----
  const finish = useCallback(
    async (hist, earlyTerminated, reason) => {
      const dims = dimensionAverages(hist)
      const readiness = computeReadiness(hist, { terminatedEarly: earlyTerminated })
      const category = categoryFor(readiness)
      const hiring = hiringReadinessFor(readiness, earlyTerminated)

      const report = await finalReport({
        config,
        analysis,
        history: hist,
        terminatedEarly: earlyTerminated,
        readiness,
        dimensionAverages: dims,
      })
      noteEngine(report)

      setResult({
        dims,
        readiness,
        category,
        hiring,
        report,
        terminatedEarly: earlyTerminated,
        terminationReason: reason || '',
      })
      setEvaluating(false)
      setScreen('report')
    },
    [config, analysis, noteEngine]
  )

  // ---- Submit an answer ----
  const handleSubmit = useCallback(
    async ({ answer, timeUsed }) => {
      if (evaluating || !currentQuestion) return
      setEvaluating(true)

      const limit = timeLimitFor(currentDifficulty, setup.timeLimits)
      const evalRes = await evaluateAnswer({
        config,
        question: currentQuestion.question,
        category: currentQuestion.category,
        answer,
        keywords: currentQuestion.keywords,
        skills: analysis?.skills || [],
        timeUsed,
        timeLimit: limit,
        difficulty: currentDifficulty,
      })
      noteEngine(evalRes)

      const record = {
        id: currentQuestion.id,
        question: currentQuestion.question,
        category: currentQuestion.category,
        difficulty: currentDifficulty,
        difficultyLabel: DIFFICULTY[currentDifficulty],
        keywords: currentQuestion.keywords,
        answer,
        timeUsed,
        timeLimit: limit,
        dimensions: evalRes.dimensions,
        overall: evalRes.overall,
        answered: evalRes.answered,
        feedback: evalRes.feedback,
        verdict: evalRes.verdict,
      }
      const newHistory = [...history, record]
      setHistory(newHistory)

      // Decide what happens next.
      const term = shouldTerminateEarly(newHistory, { minQuestions: Math.min(4, setup.numQuestions) })
      if (term.terminate) {
        await finish(newHistory, true, term.reason)
        return
      }
      if (newHistory.length >= setup.numQuestions) {
        await finish(newHistory, false)
        return
      }

      // Adapt difficulty and fetch the next question.
      const { next, direction } = nextDifficulty(currentDifficulty, record.overall)
      setLastDirection(direction)
      setCurrentDifficulty(next)

      const nextQ = await nextQuestion({
        config,
        analysis,
        difficulty: next,
        asked: newHistory.map((h) => h.question),
        questionNumber: newHistory.length + 1,
        total: setup.numQuestions,
      })
      noteEngine(nextQ)
      setCurrentQuestion({ ...nextQ, id: uid('q') })
      setQuestionNumber(newHistory.length + 1)
      setEvaluating(false)
    },
    [evaluating, currentQuestion, currentDifficulty, setup, config, analysis, history, finish, noteEngine]
  )

  const restart = useCallback(() => {
    setScreen('setup')
    setAnalysis(null)
    setHistory([])
    setCurrentQuestion(null)
    setResult(null)
    setEvaluating(false)
    setProctorFlags(0)
    setQuestionNumber(1)
    setCurrentDifficulty(1)
    setLastDirection('hold')
  }, [])

  const usedAI = usesLLM(config) && !engineDegraded

  return (
    <>
      <Background />

      {screen === 'setup' && (
        <SetupScreen config={config} onOpenSettings={() => setSettingsOpen(true)} onStart={startInterview} />
      )}

      {screen === 'analyzing' && <AnalyzingScreen />}

      {screen === 'interview' && currentQuestion && (
        <InterviewScreen
          analysis={analysis}
          question={currentQuestion}
          questionNumber={questionNumber}
          total={setup.numQuestions}
          difficulty={currentDifficulty}
          timeLimit={timeLimitFor(currentDifficulty, setup.timeLimits)}
          history={history}
          evaluating={evaluating}
          lastDirection={lastDirection}
          enableVoice={setup.enableVoice}
          enableProctor={setup.enableProctor}
          proctorFlags={proctorFlags}
          onSubmit={handleSubmit}
        />
      )}

      {screen === 'report' && result && (
        <ReportScreen
          analysis={analysis}
          history={history}
          readiness={result.readiness}
          category={result.category}
          hiring={result.hiring}
          dims={result.dims}
          report={result.report}
          terminatedEarly={result.terminatedEarly}
          terminationReason={result.terminationReason}
          proctorFlags={proctorFlags}
          usedAI={usedAI}
          onRestart={restart}
        />
      )}

      <SettingsModal open={settingsOpen} config={config} onSave={setConfig} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
