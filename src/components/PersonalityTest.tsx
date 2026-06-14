import { useT } from '../lib/i18n.tsx'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight } from 'lucide-react'

const QUESTION_TYPES: string[][] = [
  ['perfectionist', 'thrill_seeker', 'avoider', 'decision_paralysis'],
  ['perfectionist', 'thrill_seeker', 'avoider', 'decision_paralysis'],
  ['perfectionist', 'thrill_seeker', 'avoider', 'decision_paralysis'],
  ['perfectionist', 'thrill_seeker', 'avoider', 'decision_paralysis'],
  ['perfectionist', 'thrill_seeker', 'avoider', 'decision_paralysis'],
]

interface Props {
  onDone: (answers: string[]) => void
}

export function PersonalityTest({ onDone }: Props) {
  const { t } = useT()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const questions = [
    {
      q: t('personality.q1'),
      options: [
        { text: t('personality.q1.opt1'), type: 'perfectionist' },
        { text: t('personality.q1.opt2'), type: 'thrill_seeker' },
        { text: t('personality.q1.opt3'), type: 'avoider' },
        { text: t('personality.q1.opt4'), type: 'decision_paralysis' },
      ],
    },
    {
      q: t('personality.q2'),
      options: [
        { text: t('personality.q2.opt1'), type: 'perfectionist' },
        { text: t('personality.q2.opt2'), type: 'thrill_seeker' },
        { text: t('personality.q2.opt3'), type: 'avoider' },
        { text: t('personality.q2.opt4'), type: 'decision_paralysis' },
      ],
    },
    {
      q: t('personality.q3'),
      options: [
        { text: t('personality.q3.opt1'), type: 'perfectionist' },
        { text: t('personality.q3.opt2'), type: 'thrill_seeker' },
        { text: t('personality.q3.opt3'), type: 'avoider' },
        { text: t('personality.q3.opt4'), type: 'decision_paralysis' },
      ],
    },
    {
      q: t('personality.q4'),
      options: [
        { text: t('personality.q4.opt1'), type: 'perfectionist' },
        { text: t('personality.q4.opt2'), type: 'thrill_seeker' },
        { text: t('personality.q4.opt3'), type: 'avoider' },
        { text: t('personality.q4.opt4'), type: 'decision_paralysis' },
      ],
    },
    {
      q: t('personality.q5'),
      options: [
        { text: t('personality.q5.opt1'), type: 'perfectionist' },
        { text: t('personality.q5.opt2'), type: 'thrill_seeker' },
        { text: t('personality.q5.opt3'), type: 'avoider' },
        { text: t('personality.q5.opt4'), type: 'decision_paralysis' },
      ],
    },
  ]

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type]
    setAnswers(newAnswers)
    if (step < 4) {
      setStep(step + 1)
    } else {
      onDone(newAnswers)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <Brain className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{t('personality.intro')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('personality.subtitle')}
        </p>
        <div className="flex justify-center gap-1.5 mt-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step ? 'bg-primary' : i === step ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <h3 className="text-lg font-medium mb-6 text-center">
            {questions[step].q}
          </h3>
          <div className="space-y-3">
            {questions[step].options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(opt.type)}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span>{opt.text}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
