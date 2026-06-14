
import { useT } from '../lib/i18n.tsx'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Pause, Play, X, Minimize2, Maximize2, AlertTriangle, Plus, Minus } from 'lucide-react'

interface Props {
  taskName: string
  subtaskTitle: string
  defaultDuration: number
  onComplete: () => void
  onClose: () => void
}

const PRESETS = [5, 10, 15, 20, 25, 30, 45, 60]

export function PomodoroTimer({ taskName, subtaskTitle, defaultDuration, onComplete, onClose }: Props) {
  const { t } = useT()
  const [totalSeconds, setTotalSeconds] = useState(defaultDuration * 60)
  const [seconds, setSeconds] = useState(defaultDuration * 60)
  const [running, setRunning] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [tabWarnings, setTabWarnings] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const visibilityRef = useRef(true)

  // Sync when defaultDuration changes (e.g. different subtask selected)
  useEffect(() => {
    setTotalSeconds(defaultDuration * 60)
    setSeconds(defaultDuration * 60)
    setRunning(false)
    setCompleted(false)
    setTabWarnings(0)
  }, [defaultDuration])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && running) {
        setTabWarnings(w => w + 1)
        visibilityRef.current = false
      } else {
        visibilityRef.current = true
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [running])

  useEffect(() => {
    if (!running || seconds <= 0) return
    var t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { setRunning(false); setCompleted(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, seconds])

  var setTime = function(mins: number) {
    if (running) return
    setTotalSeconds(mins * 60)
    setSeconds(mins * 60)
    setShowPresets(false)
  }

  var adjustTime = function(delta: number) {
    if (running) return
    var newMins = Math.max(1, Math.min(120, Math.round(totalSeconds / 60) + delta))
    setTotalSeconds(newMins * 60)
    setSeconds(newMins * 60)
  }

  var formatTime = function(s: number) {
    var m = Math.floor(s / 60)
    var sec = s % 60
    return m + ':' + String(sec).padStart(2, '0')
  }

  var totalMins = Math.round(totalSeconds / 60)
  var progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0

  if (completed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-card rounded-2xl border border-emerald-500/30 p-5 shadow-xl max-w-xs">
          <p className="text-3xl mb-2 text-center">🎉</p>
          <p className="font-bold text-center mb-1">{t('pomodoro.done')}</p>
          <p className="text-sm text-muted-foreground text-center mb-3">「{subtaskTitle}」{t('pomodoro.focusOn')}</p>
          <div className="flex gap-2">
            <button onClick={() => { onComplete(); onClose() }}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">{t('pomodoro.markDone')}</button>
            <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-sm">{t('common.close')}</button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          onClick={() => setMinimized(false)}
          className="bg-card rounded-full border border-primary/30 px-4 py-2 shadow-lg cursor-pointer flex items-center gap-2 hover:border-primary transition-colors">
          <Timer className={'w-4 h-4 ' + (running ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
          <span className="font-mono font-bold text-sm">{formatTime(seconds)}</span>
          {running && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5 shadow-xl max-w-xs w-72">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('pomodoro.title')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(true)} className="p-1 hover:bg-secondary rounded"><Minimize2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-1 truncate">{taskName}</p>
        <p className="text-sm font-medium mb-3 truncate">{subtaskTitle}</p>

        <div className="text-center mb-3">
          <span className="text-4xl font-black font-mono">{formatTime(seconds)}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {totalMins}:00</span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
          <motion.div className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full"
            animate={{ width: progress + '%' }} transition={{ duration: 0.5 }} />
        </div>

        {/* Custom time controls */}
        {!running && !showPresets && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <button onClick={() => adjustTime(-5)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Minus className="w-3.5 h-3.5 text-muted-foreground" /></button>
            <button onClick={() => setShowPresets(true)} className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors">{totalMins} min</button>
            <button onClick={() => adjustTime(5)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Plus className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        )}

        {/* Preset time selector */}
        {showPresets && (
          <div className="mb-3 p-2 rounded-xl bg-secondary/50">
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map(function(p) {
                var isActive = p === totalMins
                return (
                  <button key={p} onClick={() => setTime(p)}
                    className={'py-1.5 rounded-lg text-xs font-medium transition-all ' + (isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>
                    {p}m
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowPresets(false)} className="w-full mt-1.5 py-1 text-xs text-muted-foreground hover:text-foreground">✕ close</button>
          </div>
        )}

        {tabWarnings > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-400">{t('pomodoro.tabWarn').replace('{0}', String(tabWarnings))}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)}
            className={'flex-1 py-2 rounded-lg text-sm font-medium transition-colors ' + (running ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:opacity-90')}>
            {running ? <span><Pause className="w-3.5 h-3.5 inline mr-1" />{t('pomodoro.pause')}</span> : <span><Play className="w-3.5 h-3.5 inline mr-1" />{t('pomodoro.startFocus')}</span>}
          </button>
          <button onClick={() => { setSeconds(totalSeconds); setRunning(false); setTabWarnings(0) }}
            className="px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:bg-secondary">{t('pomodoro.reset')}</button>
        </div>
      </motion.div>
    </div>
  )
}
