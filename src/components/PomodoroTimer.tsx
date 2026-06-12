
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Pause, Play, X, Minimize2, Maximize2, AlertTriangle } from 'lucide-react'

interface Props {
  taskName: string
  subtaskTitle: string
  onComplete: () => void
  onClose: () => void
}

export function PomodoroTimer({ taskName, subtaskTitle, onComplete, onClose }: Props) {
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [tabWarnings, setTabWarnings] = useState(0)
  const [completed, setCompleted] = useState(false)
  const visibilityRef = useRef(true)

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
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { setRunning(false); setCompleted(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, seconds])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m + ':' + String(sec).padStart(2, '0')
  }

  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100

  if (completed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-card rounded-2xl border border-emerald-500/30 p-5 shadow-xl max-w-xs">
          <p className="text-3xl mb-2 text-center">🎉</p>
          <p className="font-bold text-center mb-1">番茄钟完成！</p>
          <p className="text-sm text-muted-foreground text-center mb-3">「{subtaskTitle}」专注完成</p>
          <div className="flex gap-2">
            <button onClick={() => { onComplete(); onClose() }}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">标记完成 ✓</button>
            <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-sm">关闭</button>
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
            <span className="text-sm font-medium">番茄钟</span>
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
          <span className="text-sm text-muted-foreground ml-1">/ 25:00</span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
          <motion.div className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full"
            animate={{ width: progress + '%' }} transition={{ duration: 0.5 }} />
        </div>

        {tabWarnings > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-400">切走页面 {tabWarnings} 次，别摸鱼！</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)}
            className={'flex-1 py-2 rounded-lg text-sm font-medium transition-colors ' + (running ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:opacity-90')}>
            {running ? <><Pause className="w-3.5 h-3.5 inline mr-1" />暂停</> : <><Play className="w-3.5 h-3.5 inline mr-1" />开始专注</>}
          </button>
          <button onClick={() => { setSeconds(25 * 60); setRunning(false); setTabWarnings(0) }}
            className="px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:bg-secondary">重置</button>
        </div>
      </motion.div>
    </div>
  )
}
