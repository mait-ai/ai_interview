import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import InterviewerAvatar from './InterviewerAvatar.jsx'

const STEPS = [
  'Reading your résumé…',
  'Mapping skills to the job description…',
  'Spotting strengths and gaps…',
  'Designing your first questions…',
  'Calibrating difficulty…',
]

export default function AnalyzingScreen({ name = 'the candidate' }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % STEPS.length), 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid min-h-[80vh] place-items-center px-5">
      <div className="flex flex-col items-center text-center">
        <InterviewerAvatar state="thinking" size={140} />
        <h2 className="mt-8 font-display text-3xl font-bold text-ink">Preparing your interview</h2>
        <div className="mt-3 h-6">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-ink-soft"
          >
            {STEPS[i]}
          </motion.p>
        </div>
        <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-tangerine to-coral"
            animate={{ x: ['-100%', '320%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}
