import { useState } from 'react'
import { useT } from '../lib/i18n.tsx'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface Props { onDone: () => void }

export function Onboarding({ onDone }: Props) {
  const { t, lang, setLang } = useT()
  const [step, setStep] = useState(0)

  const steps = [
    { emoji: '🗂️', title: t('onboarding.step1.title'), desc: t('onboarding.step1.desc') },
    { emoji: '⚔️', title: t('onboarding.step2.title'), desc: t('onboarding.step2.desc') },
    { emoji: '🎳', title: t('onboarding.step3.title'), desc: t('onboarding.step3.desc') },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      {/* Language switch - top right */}
      <button
        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        className="fixed top-4 right-4 z-[200] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-xs font-bold text-white transition-all"
        title={t('app.lang.tooltip')}
      >
        {t('app.lang.switch')}
      </button>

      {/* Skip button - top right below lang switch */}
      <button
        onClick={onDone}
        className="fixed top-4 right-20 z-[200] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 text-xs text-white/60 hover:text-white transition-all"
      >
        {t('onboarding.skip')} →
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass border border-[hsl(var(--border-glass))] rounded-[18px] p-8 max-w-sm w-full text-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              {steps[step].emoji}
            </motion.div>
            <h2 className="text-xl font-bold mb-2">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={'w-2 h-2 rounded-full transition-all ' + (i === step ? 'bg-[hsl(var(--gold))] w-6' : 'bg-muted-foreground/30')} />
          ))}
        </div>

        <button
          onClick={() => step < 2 ? setStep(step + 1) : onDone()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--gold))] text-[hsl(var(--primary-foreground))] rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          {step < 2 ? t('onboarding.next') : t('onboarding.start')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
