
import { memo } from 'react'
import { motion } from 'framer-motion'
import { Task, Difficulty } from '../lib/types'
import { CheckCircle2, Circle, Skull, Trophy, Siren, Clock, Star } from 'lucide-react'

const DIFFICULTY_BADGE: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: '简单', color: 'bg-emerald-500/20 text-emerald-400' },
  medium: { label: '中等', color: 'bg-yellow-500/20 text-yellow-400' },
  hard: { label: '困难', color: 'bg-orange-500/20 text-orange-400' },
  boss: { label: 'Boss', color: 'bg-red-500/20 text-red-400' },
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
  const progress = task.subtasks.length > 0 ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) : 0
  const allCompleted = task.subtasks.every(s => s.completed || (s.isBoss && task.bossDefeated))
  const bossReady = task.subtasks.filter(s => !s.isBoss && !s.completed).length === 0 && !task.bossDefeated

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={'rounded-2xl border p-5 transition-all ' + (allCompleted ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' : 'border-border bg-card hover:border-primary/30')}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{task.name}{allCompleted && ' 🎉'}</h3>
            {onDeleteTask && !allCompleted && <button onClick={onDeleteTask} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">🗑 删除</button>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1"><span>截止：{task.deadline}</span><span>·</span><span>{task.subtasks.length} 关</span><span>·</span><span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3" />{task.pointsEarned || 0} 积分</span></div>
        </div>
        {task.bossDefeated && <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><Trophy className="w-7 h-7 text-yellow-400 drop-shadow-lg" /></motion.div>}
      </div>
      <div className="mb-5"><div className="flex justify-between text-xs mb-2"><span className="text-muted-foreground">闯关进度</span><span className="font-mono font-medium">{progress}%</span></div><div className="h-2.5 bg-secondary rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-red-500" initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 0.6, ease: 'easeOut' }} /></div></div>
      <div className="space-y-2 mb-4">
        {task.subtasks.map((sub) => {
          const isLocked = !sub.unlocked && !sub.completed; const isBossReady = sub.isBoss && bossReady; const badge = DIFFICULTY_BADGE[sub.difficulty]
          return (
            <motion.div key={sub.id} whileHover={!isLocked && !sub.completed ? { scale: 1.01, x: 2 } : {}} whileTap={!isLocked && !sub.completed ? { scale: 0.99 } : {}}
              className={'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ' + (sub.completed ? 'bg-emerald-500/5 text-muted-foreground' : isBossReady ? 'bg-red-500/5 border border-red-500/30 shadow-lg shadow-red-500/10 animate-glow' : isLocked ? 'bg-secondary/30 text-muted-foreground/40 cursor-not-allowed' : 'bg-secondary/50 hover:bg-secondary hover:border-primary/30 border border-transparent')}
              onClick={() => { if (isLocked || sub.completed) return; sub.isBoss ? onStartBoss(task.id) : onCompleteSubtask(task.id, sub.id) }}>
              {sub.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : isLocked ? <Circle className="w-5 h-5 text-muted-foreground/20 shrink-0" /> : sub.isBoss ? <Skull className="w-5 h-5 text-red-400 shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
              {!sub.completed && sub.unlocked && !sub.isBoss && onStartPomodoro && <button onClick={e => { e.stopPropagation(); onStartPomodoro(sub.id) }} className="shrink-0 px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">🍅</button>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium truncate">{sub.title}</span><span className={'text-[10px] px-1.5 py-0.5 rounded-full font-medium ' + badge.color}>{badge.label}</span>{sub.isBoss && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">BOSS</span>}{isBossReady && <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />}</div>
                {sub.reward && sub.completed && <p className="text-xs text-muted-foreground mt-1">{sub.reward}</p>}
                {sub.completed && onUndoSubtask && <button onClick={e => { e.stopPropagation(); onUndoSubtask(sub.id) }} className="text-[10px] text-muted-foreground hover:text-yellow-400 mt-0.5 transition-colors">↩ 撤销</button>}
                {isLocked && <p className="text-xs text-muted-foreground/40 mt-1">🔒 先完成前面的关卡</p>}{isBossReady && <p className="text-xs text-red-400 mt-1 animate-pulse font-medium">点击挑战 Boss！</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-yellow-400/70">+{sub.points || 10}</span><span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{sub.duration}min</span></div>
            </motion.div>
          )
        })}
      </div>
      {!allCompleted && <button onClick={onSlackOff} className="w-full text-center py-2.5 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 text-sm transition-all">🏃 想摸鱼摆烂了...</button>}
      {allCompleted && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-3 space-y-3"><p className="text-emerald-400 font-semibold text-lg">🎊 恭喜通关！你做到了！</p>{onFuneral && <button onClick={onFuneral} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">⚰️ 为任务办个葬礼</button>}</motion.div>}
    </motion.div>
  )
})
