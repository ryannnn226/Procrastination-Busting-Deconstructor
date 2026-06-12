
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, getUnlocked, getAchievementStats, getAchievementProgress } from '../lib/achievements'
import { Trophy, Lock, Medal } from 'lucide-react'

interface Props { onClose: () => void }

export function AchievementPanel({ onClose }: Props) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState(getAchievementStats())
  const [progress, setProgress] = useState(getAchievementProgress())

  useEffect(() => {
    setUnlockedIds(new Set(getUnlocked().map(u => u.id)))
    setStats(getAchievementStats())
    setProgress(getAchievementProgress())
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[hsl(var(--card))] rounded-[18px] border border-[hsl(var(--border-glass))] max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /><h2 className="text-lg font-bold">成就系统</h2></div>
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">关闭 ✕</button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-2xl font-black text-yellow-400">{progress.unlocked}</span>
            <span className="text-muted-foreground text-sm"> / {progress.total} 已解锁</span>
          </div>
          <div className="h-1.5 mt-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-yellow-400 rounded-full"
              initial={{ width: 0 }} animate={{ width: (progress.unlocked / progress.total * 100) + '%' }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedIds.has(a.id)
            const progressVal = getProgressForAchievement(a.id, stats)
            return (
              <div key={a.id} className={'flex items-center gap-3 p-3 rounded-xl border transition-all ' + (unlocked ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-[hsl(var(--muted))]/30 opacity-50')}>
                <span className="text-2xl shrink-0">{unlocked ? a.emoji : '🔒'}</span>
                <div className="flex-1 min-w-0">
                  <p className={'text-sm font-medium ' + (unlocked ? '' : 'text-muted-foreground')}>{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  {!unlocked && progressVal !== undefined && (
                    <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden w-24">
                      <div className="h-full bg-yellow-500/50 rounded-full" style={{ width: Math.min(100, progressVal) + '%' }} />
                    </div>
                  )}
                </div>
                {unlocked && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function getProgressForAchievement(id: string, stats: any): number | undefined {
  const thresholds: Record<string, { current: number; target: number }> = {
    first_step: { current: stats.totalSubtasksCompleted, target: 1 },
    getting_started: { current: stats.totalSubtasksCompleted, target: 10 },
    on_fire: { current: stats.totalSubtasksCompleted, target: 50 },
    century: { current: stats.totalSubtasksCompleted, target: 100 },
    first_clear: { current: stats.totalTasksCompleted, target: 1 },
    veteran: { current: stats.totalTasksCompleted, target: 5 },
    boss_slayer: { current: stats.totalBossesDefeated, target: 3 },
    boss_master: { current: stats.totalBossesDefeated, target: 10 },
    rich: { current: stats.totalPointsEarned, target: 200 },
    millionaire: { current: stats.totalPointsEarned, target: 1000 },
    streak_3: { current: stats.currentStreak, target: 3 },
    streak_7: { current: stats.currentStreak, target: 7 },
    negotiator: { current: stats.totalNegotiations, target: 5 },
    zen: { current: stats.totalFlowBreaks, target: 10 },
  }
  const t = thresholds[id]
  if (!t) return undefined
  return Math.min(100, (t.current / t.target) * 100)
}
