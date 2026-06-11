import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Wind, Puzzle, Music, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

type BreakType = 'menu' | 'breathing' | 'puzzle' | 'soundscape'

export function FlowBreak({ onClose }: Props) {
  const [mode, setMode] = useState<BreakType>('menu')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">心流小憩 · 90 秒</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  别刷手机了，选一个真正恢复专注力的方式吧～
                </p>

                <button
                  onClick={() => setMode('breathing')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">4-7-8 呼吸法</p>
                    <p className="text-xs text-muted-foreground">4秒吸 · 7秒屏 · 8秒呼</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('puzzle')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Puzzle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">快速数独</p>
                    <p className="text-xs text-muted-foreground">激活大脑，切换思维模式</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('soundscape')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">白噪音场景</p>
                    <p className="text-xs text-muted-foreground">雨声 · 篝火 · 森林</p>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'breathing' && (
              <BreathingExercise onBack={() => setMode('menu')} onDone={onClose} />
            )}

            {mode === 'puzzle' && (
              <MiniPuzzle onBack={() => setMode('menu')} onDone={onClose} />
            )}

            {mode === 'soundscape' && (
              <SoundScape onBack={() => setMode('menu')} onDone={onClose} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// --- Breathing Exercise ---
function BreathingExercise({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [seconds, setSeconds] = useState(4)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (cycles >= 5) {
      setTimeout(onDone, 1500)
      return
    }

    const maxSec = step === 'inhale' ? 4 : step === 'hold' ? 7 : 8
    if (seconds <= 0) {
      if (step === 'inhale') { setStep('hold'); setSeconds(7) }
      else if (step === 'hold') { setStep('exhale'); setSeconds(8) }
      else { setStep('inhale'); setSeconds(4); setCycles(c => c + 1) }
      return
    }

    const timer = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds, step, cycles])

  const circleScale = step === 'inhale' ? 1.5 : step === 'hold' ? 1.5 : 1

  return (
    <div className="text-center py-4">
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground mb-4">
        ← 返回菜单
      </button>
      <div className="relative w-32 h-32 mx-auto mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20"
          animate={{ scale: circleScale }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <p className="text-3xl font-bold font-mono">{seconds}</p>
            <p className="text-xs text-blue-400 font-medium mt-1">
              {step === 'inhale' ? '吸气' : step === 'hold' ? '屏息' : '呼气'}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">已完成 {cycles}/5 轮</p>
    </div>
  )
}

// --- Mini Puzzle ---
function MiniPuzzle({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [grid, setGrid] = useState<(number | null)[][]>(() => generateEasySudoku())
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [moves, setMoves] = useState(0)

  const handleCellClick = (r: number, c: number) => {
    setSelected([r, c])
  }

  const handleNumber = (n: number) => {
    if (!selected) return
    const [r, c] = selected
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = n
    setGrid(newGrid)
    setMoves(m => m + 1)

    if (moves + 1 >= 5) {
      setTimeout(onDone, 1500)
    }
  }

  return (
    <div className="text-center py-2">
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground mb-4">
        ← 返回菜单
      </button>
      <p className="text-sm text-muted-foreground mb-3">填入 5 个数字即可（快速版）</p>
      <div className="inline-grid grid-cols-4 gap-0.5 mb-4">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`w-10 h-10 rounded text-sm font-mono transition-colors ${
                selected?.[0] === r && selected?.[1] === c
                  ? 'bg-purple-500/30 border border-purple-500'
                  : cell !== null
                  ? 'bg-secondary/80'
                  : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
            >
              {cell ?? ''}
            </button>
          ))
        )}
      </div>
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary/20 font-mono font-bold text-sm transition-colors"
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">已填 {moves}/5</p>
    </div>
  )
}

// --- Sound Scape ---
const SOUNDS = [
  { label: '🌧️ 雨声', color: 'bg-blue-500/10 hover:bg-blue-500/20', active: 'bg-blue-500/30 border-blue-500' },
  { label: '🔥 篝火', color: 'bg-orange-500/10 hover:bg-orange-500/20', active: 'bg-orange-500/30 border-orange-500' },
  { label: '🌿 森林', color: 'bg-emerald-500/10 hover:bg-emerald-500/20', active: 'bg-emerald-500/30 border-emerald-500' },
  { label: '🌊 海浪', color: 'bg-cyan-500/10 hover:bg-cyan-500/20', active: 'bg-cyan-500/30 border-cyan-500' },
]

function SoundScape({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [active, setActive] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(90)

  useEffect(() => {
    if (!active) return
    if (countdown <= 0) {
      onDone()
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [active, countdown])

  return (
    <div className="text-center py-2">
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground mb-4">
        ← 返回菜单
      </button>
      {active ? (
        <div>
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-current opacity-20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-lg font-medium mb-1">{active}</p>
          <p className="text-2xl font-mono font-bold mb-4">
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </p>
          <p className="text-xs text-muted-foreground mb-4">闭上眼睛，放松一下</p>
          <button
            onClick={onDone}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
          >
            我休息好了
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">选择一个背景音，放松 90 秒</p>
          {SOUNDS.map(s => (
            <button
              key={s.label}
              onClick={() => setActive(s.label)}
              className={`w-full py-3 rounded-xl border border-border text-sm font-medium transition-all ${s.color}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper: generate a simple 4x4 sudoku puzzle
function generateEasySudoku(): (number | null)[][] {
  // Pre-made easy 4x4
  return [
    [1, null, null, 4],
    [null, 4, 1, null],
    [null, 1, 4, null],
    [4, null, null, 1],
  ]
}
