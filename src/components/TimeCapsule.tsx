import { useT } from '../lib/i18n.tsx'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Send, SkipForward, Clock } from 'lucide-react'

interface Props {
  taskName: string
  onDone: (message: string) => void
  onSkip: () => void
}

export function TimeCapsuleModal({ taskName, onDone, onSkip }: Props) {
  const { t } = useT()
  const [message, setMessage] = useState('')
  const [recording, setRecording] = useState(false)

  const handleSubmit = () => {
    if (message.trim()) {
      onDone(message.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('capsule.titleFull')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('capsule.desc')}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t('capsule.question')}「{taskName}」？
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="{t('capsule.placeholder')}"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none resize-none text-sm transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {t('capsule.seal')}
            </button>
            <button
              onClick={onSkip}
              className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-secondary transition-colors text-sm text-muted-foreground"
            >
              <SkipForward className="w-4 h-4" />
              {t('capsule.skip')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
