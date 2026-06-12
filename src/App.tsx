
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, ProcrastinationType, Subtask } from './lib/types'
import { PERSONALITY_PROFILES } from './lib/personality'
import { loadTasks, saveTasks } from './lib/storage'
import { addPoints, getAvailablePoints } from './lib/shop'
import { updateAchievementStats, getAchievementStats } from './lib/achievements'
import { decomposeTask, analyzePersonality } from './lib/ai'
import { PersonalityTest } from './components/PersonalityTest'
import { FutureMirror } from './components/FutureMirror'
import { SubtaskEditor } from './components/SubtaskEditor'
import { TaskBoard } from './components/TaskBoard'
import { NegotiateDialog } from './components/NegotiateDialog'
import { TimeCapsuleModal } from './components/TimeCapsule'
import { StreakPanel } from './components/StreakPanel'
import { BossBattle } from './components/BossBattle'
import { DailyReport } from './components/DailyReport'
import { TaskFuneral } from './components/TaskFuneral'
import { FlowBreak } from './components/FlowBreak'
import { ShopPanel } from './components/ShopPanel'
import { AchievementPanel } from './components/AchievementPanel'
import { PomodoroTimer } from './components/PomodoroTimer'
import { Sword, Plus, Sun, Moon, Brain, Store, Trophy } from 'lucide-react'

type AppPhase = 'personality' | 'future_mirror' | 'edit_subtasks' | 'capsule' | 'task_board' | 'boss_battle'
type TaskFilter = 'all' | 'todo' | 'done'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('personality'); const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null); const [personality, setPersonality] = useState<ProcrastinationType | null>(null)
  const [showNegotiate, setShowNegotiate] = useState(false); const [negotiatingTask, setNegotiatingTask] = useState<Task | null>(null)
  const [showCapsule, setShowCapsule] = useState(false); const [darkMode, setDarkMode] = useState(true)
  const [bossTaskId, setBossTaskId] = useState<string | null>(null); const [showFuneral, setShowFuneral] = useState<Task | null>(null)
  const [showFlowBreak, setShowFlowBreak] = useState(false); const [showShop, setShowShop] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [pomodoroTask, setPomodoroTask] = useState<{ task: Task; subtaskId: string } | null>(null)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all'); const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([])
  const [pendingTaskInfo, setPendingTaskInfo] = useState<{ name: string; deadline: string } | null>(null)
  const [regenKey, setRegenKey] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => { const saved = loadTasks(); setTasks(saved); if (saved.length > 0) { setPersonality(saved[0].personality); setPhase('task_board') } }, [])
  useEffect(() => { document.documentElement.classList.toggle('light', !darkMode) }, [darkMode])
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])

  const getFilteredTasks = () => taskFilter === 'all' ? tasks : taskFilter === 'todo' ? tasks.filter(t => !t.bossDefeated) : tasks.filter(t => t.bossDefeated)

  const handlePersonalityDone = async (answers: string[]) => { const r = await analyzePersonality(answers); setPersonality(r.type as ProcrastinationType); setPhase('future_mirror') }
  const handleFutureMirrorDone = async (taskName: string, deadline: string) => { const p = personality || 'avoider'; const subs = await decomposeTask(taskName, deadline, p); setPendingSubtasks(subs); setPendingTaskInfo({ name: taskName, deadline }); setPhase('edit_subtasks') }

  const handleSubtasksConfirmed = (editedSubtasks: Subtask[]) => {
    if (!pendingTaskInfo) return; const p = personality || 'avoider'
    const t: Task = { id: 'task-' + Date.now(), name: pendingTaskInfo.name, deadline: pendingTaskInfo.deadline, subtasks: editedSubtasks, createdAt: new Date().toISOString(), personality: p, totalCompleted: 0, streak: 0, bestStreak: 0, bossDefeated: false, pointsEarned: 0 }
    setTasks(prev => { const u = [...prev, t]; saveTasks(u); return u }); setActiveTask(t); setPendingSubtasks([]); setPendingTaskInfo(null); setShowCapsule(true)
  }

  const handleCapsuleDone = (message: string) => {
    if (!activeTask) return; const u = { ...activeTask, capsule: { message, createdAt: new Date().toISOString() } }
    setActiveTask(u); setTasks(prev => { const n = prev.map(t => t.id === u.id ? u : t); saveTasks(n); return n }); setShowCapsule(false); setPhase('task_board')
  }

  const handleCompleteSubtask = (taskId: string, subtaskId: string) => {
    const target = tasks.find(t => t.id === taskId); const sub = target?.subtasks.find(s => s.id === subtaskId); const pts = sub?.points || 10
    addPoints(pts)
    setTasks(prev => {
      const u = prev.map(t => {
        if (t.id !== taskId) return t
        const idx = t.subtasks.findIndex(x => x.id === subtaskId)
        const subs = t.subtasks.map((s, i) => i === idx ? { ...s, completed: true } : i === idx + 1 ? { ...s, unlocked: true } : s)
        const done = subs.filter(s => s.completed).length; const all = subs.every(s => s.completed)
        return { ...t, subtasks: subs, totalCompleted: done, bossDefeated: all, pointsEarned: (t.pointsEarned || 0) + pts }
      })
      saveTasks(u); const total = u.reduce((s, t) => s + t.subtasks.filter(x => x.completed).length, 0)
      if (total > 0 && total % 3 === 0) setTimeout(() => setShowFlowBreak(true), 500)
      const s = getAchievementStats(); updateAchievementStats({ totalSubtasksCompleted: s.totalSubtasksCompleted + 1 })
      return u
    })
  }

  const handleStartBoss = (taskId: string) => { setBossTaskId(taskId); setPhase('boss_battle') }
  const handleBossDefeated = () => {
    if (!bossTaskId) return; const tk = tasks.find(t => t.id === bossTaskId); const bs = tk?.subtasks.find(s => s.isBoss); const bp = bs?.points || 50
    addPoints(bp)
    setTasks(prev => { const u = prev.map(t => t.id !== bossTaskId ? t : { ...t, bossDefeated: true, pointsEarned: (t.pointsEarned || 0) + bp, subtasks: t.subtasks.map(s => s.isBoss ? { ...s, completed: true } : s) }); saveTasks(u); return u })
    const s = getAchievementStats(); updateAchievementStats({ totalTasksCompleted: s.totalTasksCompleted + 1, totalBossesDefeated: s.totalBossesDefeated + 1 })
    setBossTaskId(null); setPhase('task_board')
  }

  const handleSlackOff = (task: Task) => { setNegotiatingTask(task); setShowNegotiate(true) }
  const handleDeleteTask = (taskId: string) => { setTasks(prev => { const u = prev.filter(t => t.id !== taskId); saveTasks(u); return u }) }
  const handleUndoSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => { const u = prev.map(t => t.id !== taskId ? t : { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: false } : s), totalCompleted: t.subtasks.filter(s => s.id !== subtaskId || !s.completed).length - 1, bossDefeated: false }); saveTasks(u); return u })
  }
  const handleStartPomodoro = (task: Task, subtaskId: string) => { setPomodoroTask({ task, subtaskId }) }

  
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set())
  
  const getDeadlineInfo = (deadline: string) => {
    const dl = new Date(deadline).getTime()
    const diff = dl - now
    const hours = diff / 3600000
    if (hours <= 0) return { level: 'overdue' as const, text: '已过期 ' + Math.abs(Math.round(hours)) + 'h', className: 'text-red-400 font-bold' }
    if (hours <= 6) return { level: 'critical' as const, text: Math.round(hours) + 'h后到期', className: 'text-red-400 animate-pulse font-bold' }
    if (hours <= 24) return { level: 'urgent' as const, text: Math.round(hours) + 'h后到期', className: 'text-orange-400 font-semibold' }
    if (hours <= 72) return { level: 'warning' as const, text: Math.round(hours / 24) + '天后到期', className: 'text-yellow-400' }
    return null
  }

  const activeWarnings = tasks.filter(t => {
    if (t.bossDefeated || dismissedWarnings.has(t.id)) return false
    const info = getDeadlineInfo(t.deadline)
    return info !== null
  })
const pProfile = personality ? PERSONALITY_PROFILES[personality] : null; const points = getAvailablePoints()

  return (
    <div className={'min-h-screen transition-colors duration-500 ' + (darkMode ? '' : 'light')}>
      <header className="sticky top-0 z-50 glass-strong border-b border-[hsl(var(--border-glass))]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><motion.div whileHover={{ rotate: 15 }} className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"><Sword className="w-4 h-4 text-primary" /></motion.div><h1 className="font-bold text-lg bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">拖延闯关拆解器</h1></div>
          <div className="flex items-center gap-2">
            {pProfile && <span className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground">{pProfile.emoji} {pProfile.label}</span>}
            <button onClick={() => setShowAchievements(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><Trophy className="w-4 h-4 text-yellow-400" /></button>
            <button onClick={() => setShowShop(true)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors"><Store className="w-4 h-4 text-yellow-400" />{points > 0 && <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">{points > 99 ? '99+' : points}</span>}</button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-secondary transition-colors">{darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          </div>
        </div>
      </header>

      {activeWarnings.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-3 space-y-2">
          {activeWarnings.map(t => {
            const info = getDeadlineInfo(t.deadline)
            if (!info) return null
            const isOverdue = info.level === 'overdue'
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={'p-3 rounded-xl text-sm flex items-center justify-between ' + (isOverdue ? 'bg-red-500/10 border border-red-500/30' : info.level === 'critical' ? 'bg-red-500/5 border border-red-500/20' : 'bg-yellow-500/5 border border-yellow-500/20')}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={'text-lg shrink-0 ' + (isOverdue ? '' : '')}>{isOverdue ? '🚨' : info.level === 'critical' ? '🔴' : '🟡'}</span>
                  <span className="truncate font-medium">{t.name}</span>
                  <span className={info.className + ' shrink-0 text-xs'}>{info.text}</span>
                </div>
                <button onClick={() => setDismissedWarnings(prev => new Set([...prev, t.id]))}
                  className="shrink-0 ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors">忽略</button>
              </motion.div>
            )
          })}
        </div>
      )}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {phase === 'personality' && <motion.div key="p" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><PersonalityTest onDone={handlePersonalityDone} /></motion.div>}
          {phase === 'future_mirror' && <motion.div key="f" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><FutureMirror onDone={handleFutureMirrorDone} onBack={() => setPhase('personality')} /></motion.div>}
          {phase === 'edit_subtasks' && pendingTaskInfo && <motion.div key="e" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><SubtaskEditor subtasks={pendingSubtasks} version={regenKey} onConfirm={handleSubtasksConfirmed} onBack={() => setPhase('future_mirror')} onRegenerate={async () => { const ns = await decomposeTask(pendingTaskInfo.name, pendingTaskInfo.deadline, personality || 'avoider'); setPendingSubtasks(ns); setRegenKey(k => k + 1) }} /></motion.div>}
          {showCapsule && activeTask && <TimeCapsuleModal taskName={activeTask.name} onDone={handleCapsuleDone} onSkip={() => { setShowCapsule(false); setPhase('task_board') }} />}
          {phase === 'task_board' && <motion.div key="t" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <StreakPanel tasks={tasks} /><DailyReport tasks={tasks} />
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[hsl(var(--muted))]/50">{(['all','todo','done'] as const).map(f => <button key={f} onClick={() => setTaskFilter(f)} className={'flex-1 py-2 rounded-lg text-sm font-medium transition-all ' + (taskFilter === f ? 'bg-[hsl(var(--card))] shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>{f === 'all' ? '全部' : f === 'todo' ? '待办' : '已完成'}{f === 'todo' && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{tasks.filter(t => !t.bossDefeated).length}</span>}</button>)}</div>
            {tasks.length === 0 ? <div className="text-center py-24"><motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}><Brain className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" /></motion.div><p className="text-muted-foreground mb-2 text-lg font-medium">还没有任务</p><p className="text-muted-foreground/60 mb-6 text-sm">来拆解第一个巨型任务吧！</p><button onClick={() => setPhase('future_mirror')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(var(--gold))] text-[hsl(var(--primary-foreground))] rounded-2xl font-bold text-[15px] hover:shadow-[var(--shadow-gold)] hover:shadow-lg hover:shadow-primary/25 transition-all"><Plus className="w-5 h-5" />新建任务</button></div>
            : <div className="space-y-6">{getFilteredTasks().map(task => <TaskBoard key={task.id} task={task} onCompleteSubtask={handleCompleteSubtask} onStartBoss={handleStartBoss} onSlackOff={() => handleSlackOff(task)} onFuneral={task.bossDefeated ? () => setShowFuneral(task) : undefined} onDeleteTask={() => handleDeleteTask(task.id)} onUndoSubtask={(sid: string) => handleUndoSubtask(task.id, sid)} onStartPomodoro={(sid: string) => handleStartPomodoro(task, sid)} />)}<div className="text-center pt-4"><button onClick={() => setPhase('future_mirror')} className="inline-flex items-center gap-2 px-5 py-2.5 border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--gold)/0.3)] hover:bg-[hsl(var(--gold)/0.05)] transition-all text-sm text-muted-foreground"><Plus className="w-4 h-4" />添加新任务</button></div></div>}
          </motion.div>}
          {phase === 'boss_battle' && bossTaskId && <BossBattle task={tasks.find(t => t.id === bossTaskId)!} onDefeated={handleBossDefeated} onRetreat={() => { setBossTaskId(null); setPhase('task_board') }} />}
        </AnimatePresence>
      </main>
      {showNegotiate && negotiatingTask && <NegotiateDialog taskName={negotiatingTask.name} personality={negotiatingTask.personality || personality || 'avoider'} onStay={() => { setShowNegotiate(false); const s = getAchievementStats(); updateAchievementStats({ totalNegotiations: s.totalNegotiations + 1 }) }} onClose={() => setShowNegotiate(false)} />}
      {showFlowBreak && <FlowBreak onClose={() => { setShowFlowBreak(false); const s = getAchievementStats(); updateAchievementStats({ totalFlowBreaks: s.totalFlowBreaks + 1 }) }} />}
      {showFuneral && <TaskFuneral task={showFuneral} onClose={() => setShowFuneral(null)} />}
      {showShop && <ShopPanel onClose={() => setShowShop(false)} />}
      {showAchievements && <AchievementPanel onClose={() => setShowAchievements(false)} />}
      {pomodoroTask && <PomodoroTimer taskName={pomodoroTask.task.name} subtaskTitle={pomodoroTask.task.subtasks.find(s => s.id === pomodoroTask.subtaskId)?.title || ''} onComplete={() => handleCompleteSubtask(pomodoroTask.task.id, pomodoroTask.subtaskId)} onClose={() => setPomodoroTask(null)} />}
    </div>
  )
}
