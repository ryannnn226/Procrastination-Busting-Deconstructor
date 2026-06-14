
import { memo, useState } from 'react'
import { useT } from '../lib/i18n.tsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Difficulty } from '../lib/types'
import { CheckCircle2, Circle, Skull, Siren, Clock, Star, Sword, Sparkles } from 'lucide-react'

const DIFFICULTY_CONFIG: Record<Difficulty, { labelKey: string; color: string; bg: string; icon: string }> = {
  easy: { labelKey: 'diff.easy', color: 'text-emerald-400 border-emerald-500/30', bg: 'bg-emerald-500/5', icon: '🟢' },
  medium: { labelKey: 'diff.medium', color: 'text-yellow-400 border-yellow-500/30', bg: 'bg-yellow-500/5', icon: '🟡' },
  hard: { labelKey: 'diff.hard', color: 'text-orange-400 border-orange-500/30', bg: 'bg-orange-500/5', icon: '🟠' },
  boss: { labelKey: 'diff.boss', color: 'text-red-400 border-red-500/40', bg: 'bg-red-500/5', icon: '💀' },
}

interface Props {
  task: Task
  onCompleteSubtask: (taskId: string, subtaskId: string) => void
  onStartBoss: (taskId: string) => void
  onSlackOff: () => void
  onFuneral?: () => void
  onDeleteTask?: () => void
  onUndoSubtask?: (subtaskId: string) => void
  onStartPomodoro?: (subtaskId: string) => void
}

export const TaskBoard = memo(function TaskBoard({ task, onCompleteSubtask, onStartBoss, onSlackOff, onFuneral, onDeleteTask, onUndoSubtask, onStartPomodoro }: Props) {
  const { t } = useT()
  const [xpFly, setXpFly] = useState<string | null>(null)
  const progress = task.subtasks.length > 0 ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) : 0
  const allCompleted = task.subtasks.every(s => s.completed || (s.isBoss && task.bossDefeated))
  const bossReady = task.subtasks.filter(s => !s.isBoss && !s.completed).length === 0 && !task.bossDefeated
  const parseDeadlineLocal = (dateStr: string) => { const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d, 23, 59, 59) };
  const dl = parseDeadlineLocal(task.deadline);
  const dlHours = (dl.getTime() - Date.now()) / 3600000
  const dlUrgent = !task.bossDefeated && dlHours <= 24
  const dlOverdue = !task.bossDefeated && dlHours <= 0

  const handleComplete = (taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setXpFly(subtaskId)
    setTimeout(() => setXpFly(null), 1000)
    onCompleteSubtask(taskId, subtaskId)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={'rounded-[18px] overflow-hidden transition-all duration-300 ' + (allCompleted ? 'glass border border-emerald-500/20 shadow-[var(--shadow-glow)]' : 'glass border border-[hsl(var(--border-glass))] hover:border-[hsl(var(--gold)/0.2)] hover:shadow-[var(--shadow-card-hover)]')}>

      {/* Quest Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[17px] tracking-tight truncate">{task.name}</h3>
              {onDeleteTask && !allCompleted && (
                <button onClick={onDeleteTask} className="shrink-0 text-xs text-muted-foreground/50 hover:text-red-400 transition-colors ml-auto">{t('quest.remove')}</button>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{t('quest.due')} {task.deadline}</span>
              {dlOverdue ? <span className="text-red-400 font-semibold animate-pulse">{t('quest.overdue')}</span>
               : dlUrgent ? <span className="text-orange-400 font-semibold">{t('deadline.hoursLeft', Math.round(dlHours).toString())}</span>
               : null}
            </div>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 mt-3 mb-4">
          <div className="flex-1 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full gold-bg" style={{ background: 'linear-gradient(90deg, hsl(var(--gold-dim)), hsl(var(--gold)))' }}
              initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{progress}%</span>
          <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--gold))]">
            <Star className="w-3 h-3" />{task.pointsEarned || 0}
          </div>
        </div>
      </div>

      {/* Quest Steps */}
      <div className="px-3 pb-3 space-y-1">
        {task.subtasks.map((sub) => {
          const isLocked = !sub.unlocked && !sub.completed
          const isBossReady = sub.isBoss && bossReady
          const diff = DIFFICULTY_CONFIG[sub.difficulty]

          return (
            <div key={sub.id} className="relative">
              <motion.div
                whileHover={!isLocked && !sub.completed ? { scale: 1.01, x: 3 } : {}}
                whileTap={!isLocked && !sub.completed ? { scale: 0.99 } : {}}
                onClick={e => {
                  if (isLocked || sub.completed) return
                  if (sub.isBoss) onStartBoss(task.id)
                  else handleComplete(task.id, sub.id, e)
                }}
                className={'flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all cursor-pointer group ' +
                  (sub.completed ? 'bg-emerald-500/5' :
                   isBossReady ? 'bg-red-500/5 border border-red-500/30 shadow-[0_0_20px_-8px_hsl(var(--danger)/0.3)] animate-pulse-glow' :
                   isLocked ? 'opacity-25 cursor-not-allowed' :
                   'hover:bg-[hsl(var(--surface-2))]')}>

                {/* Step Icon */}
                <div className="shrink-0 w-8 flex justify-center">
                  {sub.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isLocked ? (
                    <Circle className="w-5 h-5 text-muted-foreground/15" />
                  ) : sub.isBoss ? (
                    <Skull className="w-5 h-5 text-red-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-[hsl(var(--gold)/0.6)] transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className={'flex-1 min-w-0 ' + (sub.completed ? 'opacity-60' : '')}>
                  <div className="flex items-center gap-2">
                    <span className={'text-[13px] font-medium truncate ' + (sub.completed ? 'line-through text-muted-foreground' : '')}>
                      {sub.title}
                    </span>
                    <span className={'text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ' + diff.color + ' ' + diff.bg}>
                      {t(diff.labelKey)}
                    </span>
                    {sub.isBoss && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 font-bold flex items-center gap-0.5">
                        <Sword className="w-2.5 h-2.5" />Boss
                      </span>
                    )}
                    {isBossReady && <Siren className="w-3 h-3 text-red-400 animate-pulse" />}
                  </div>
                  {sub.reward && sub.completed && (
                    <p className="text-[11px] text-emerald-400/60 mt-0.5">{sub.reward}</p>
                  )}
                  {sub.completed && onUndoSubtask && (
                    <button onClick={e => { e.stopPropagation(); onUndoSubtask(sub.id) }}
                      className="text-[10px] text-muted-foreground/50 hover:text-yellow-400 mt-0.5 transition-colors">{t('quest.undo')}</button>
                  )}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 shrink-0">
                  {!sub.completed && sub.unlocked && !sub.isBoss && onStartPomodoro && (
                    <button onClick={e => { e.stopPropagation(); onStartPomodoro(sub.id) }}
                      className="px-2 py-1 text-[10px] rounded-lg bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.2)] transition-colors font-medium">
                      {t('quest.focus')}
                    </button>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{sub.duration}m
                  </span>
                  <span className="text-[10px] text-[hsl(var(--gold)/0.6)] font-mono">+{sub.points || 10}</span>
                </div>

                {/* XP Fly Animation */}
                <AnimatePresence>
                  {xpFly === sub.id && (
                    <motion.div initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -40, scale: 1.3 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute right-4 -top-2 text-xs font-black text-[hsl(var(--gold))] pointer-events-none z-10">
                      <Sparkles className="w-3 h-3 inline mr-0.5" />+{sub.points || 10} XP
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Slack Off */}
      {!allCompleted && (
        <div className="px-5 pb-5 pt-1">
          <button onClick={onSlackOff}
            className="w-full py-2.5 rounded-xl border border-dashed border-[hsl(var(--border))] text-[12px] text-muted-foreground/60 hover:border-[hsl(var(--gold)/0.3)] hover:text-[hsl(var(--gold))] transition-all">
            Feeling lazy? Tap here 🏃
          </button>
        </div>
      )}

      {/* Completed Footer */}
      {allCompleted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 pt-2 text-center space-y-2">
          <p className="text-emerald-400 font-semibold text-[15px]">{t('quest.complete')}</p>
          {onFuneral && (
            <button onClick={onFuneral}
              className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors">
              Hold a funeral ⚰️
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
})
