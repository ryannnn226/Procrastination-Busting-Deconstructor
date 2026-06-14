import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateFutureScenes } from '../lib/ai'
import { FutureScene } from '../lib/types'
import { useT } from '../lib/i18n.tsx'
import { Sparkles, Calendar, ArrowLeft, Play, CheckCircle } from 'lucide-react'

interface Props {
  onDone: (taskName: string, deadline: string) => void
  onBack: () => void
}

export function FutureMirror({ onDone, onBack }: Props) {
  const { t, lang } = useT()
  const [taskName, setTaskName] = useState('')
  const [deadline, setDeadline] = useState('');
  const [dateText, setDateText] = useState('');
  const [dateError, setDateError] = useState('');
  const nativeDateRef = useRef<HTMLInputElement>(null)
  const [scenes, setScenes] = useState<FutureScene[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [chosenPath, setChosenPath] = useState<'A' | 'B' | null>(null)
  const [generating, setGenerating] = useState(false);
  const parseDateText = (text: string) => {
    setDateError('');
    if (!text.trim()) { setDeadline(''); return; }
    const lower = text.trim().toLowerCase();
    const shortcuts: Record<string, () => Date> = {
      '\u660e\u5929': () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; },
      '\u540e\u5929': () => { const d = new Date(); d.setDate(d.getDate() + 2); return d; },
      '\u4e0b\u5468': () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; },
      '\u4e0b\u4e2a\u6708': () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; },
      'tomorrow': () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; },
      'next week': () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; },
      'next month': () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; },
      'today': () => new Date(),
      '\u4eca\u5929': () => new Date(),
    };
    if (shortcuts[lower]) {
      const d = shortcuts[lower]();
      setDeadline(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
      return;
    }
    const isoM = text.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (isoM) {
      const y = +isoM[1], m = +isoM[2], d = +isoM[3];
      const dt = new Date(y, m - 1, d);
      if (!isNaN(dt.getTime())) { setDeadline(isoM[1] + '-' + isoM[2].padStart(2, '0') + '-' + isoM[3].padStart(2, '0')); return; }
    }
    const usM = text.match(/^(\d{1,2})[-\/](\d{1,2})$/);
    if (usM) {
      const y = new Date().getFullYear();
      let dt = new Date(y, +usM[1] - 1, +usM[2]);
      if (dt < new Date()) dt = new Date(y + 1, +usM[1] - 1, +usM[2]);
      if (!isNaN(dt.getTime())) { setDeadline(dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0')); return; }
    }
    const cnM = text.match(/(\d{1,2})\s*\u6708\s*(\d{1,2})\s*[\u65e5\u53f7]/);
    if (cnM) {
      const dt = new Date(new Date().getFullYear(), +cnM[1] - 1, +cnM[2]);
      if (!isNaN(dt.getTime())) { setDeadline(dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0')); return; }
    }
    setDateError(t('date.invalid'));
  };
  const formatDisplay = (d: string) => { if (!d) return ''; const p = d.split('-'); return p[0] + '/' + p[1] + '/' + p[2]; };
  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateText(e.target.value);
    if (e.target.value.match(/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/)) parseDateText(e.target.value);
  };

  const handleGenerate = async () => {
    if (!taskName || !deadline) return
    setLoading(true)
    const result = await generateFutureScenes(taskName, deadline, lang)
    setScenes(result)
    setLoading(false)
  }

  const handleConfirm = () => {
    if (chosenPath === 'A') {
      onDone(taskName, deadline)
    }
  }

  if (scenes) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h2 className="text-2xl font-bold mb-2">{t('mirror.title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('mirror.twoPaths')}
          </p>
        </motion.div>

        <div className="grid gap-4">
          {scenes.map((scene) => (
            <motion.div
              key={scene.path}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setChosenPath(scene.path)}
              className={`relative p-5 rounded-[18px] border-2 cursor-pointer transition-all ${
                chosenPath === scene.path
                  ? scene.path === 'A'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-red-500 bg-red-500/10'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-bold text-lg ${
                  scene.path === 'A' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {scene.path === 'A' ? '🟢' : '🔴'} {scene.path === 'A' ? t('mirror.pathA') : t('mirror.pathB')}：{scene.title}
                </h3>
                {chosenPath === scene.path && (
                  <CheckCircle className={`w-5 h-5 ${
                    scene.path === 'A' ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{scene.scene}</p>
              <p className={`text-xs mt-3 font-medium ${
                scene.path === 'A' ? 'text-emerald-400/70' : 'text-red-400/70'
              }`}>
                {scene.consequence}
              </p>
            </motion.div>
          ))}
        </div>

        {chosenPath && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            {chosenPath === 'A' ? (
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                {t('mirror.chooseThis')}
              </button>
            ) : (
              <div>
                <p className="text-muted-foreground mb-3 text-sm">{t('mirror.choosePath')}</p>
                <button
                  onClick={() => setChosenPath('A')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  {t('mirror.choosePathA')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">{t('mirror.createQuest')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('mirror.tellMe')}
        </p>
      </motion.div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('mirror.taskName')}</label>
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            placeholder={t('mirror.taskNamePlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            {t('mirror.deadline')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={dateText}
              onChange={handleDateTextChange}
              onKeyDown={e => { if (e.key === 'Enter') parseDateText(dateText) }}
              onBlur={() => parseDateText(dateText)}
              placeholder={t('date.placeholder')}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--gold))] border border-border focus:border-[hsl(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--gold))/30] transition-all text-sm font-medium placeholder:text-muted-foreground/50"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--gold))]/50 cursor-pointer"
              onClick={() => nativeDateRef.current?.showPicker?.()} />
            <input
              ref={nativeDateRef}
              type="date"
              value={deadline}
              onChange={e => { setDeadline(e.target.value); setDateText(formatDisplay(e.target.value)) }}
              className="sr-only"
              tabIndex={-1}
            />
          </div>
          {dateError && <p className="text-xs text-red-400 mt-1.5">{dateError}</p>}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!taskName || !deadline || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {loading ? t('mirror.generating') : t('mirror.analyze')}
        </button>
      </div>
    </div>
  )
}
