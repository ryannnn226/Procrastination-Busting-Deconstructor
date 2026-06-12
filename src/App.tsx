import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, ProcrastinationType, Subtask } from './lib/types'
import { PERSONALITY_PROFILES } from './lib/personality'
import { loadTasks, saveTasks } from './lib/storage'
import { addPoints, getAvailablePoints } from './lib/shop'
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
import { Sword, Plus, Sun, Moon, Brain, Store } from 'lucide-react'

type AppPhase = 'personality' | 'future_mirror' | 'edit_subtasks' | 'capsule' | 'task_board' | 'boss_battle'
type TaskFilter = 'all' | 'todo' | 'done'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('personality')
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [personality, setPersonality] = useState<ProcrastinationType | null>(null)
  const [showNegotiate, setShowNegotiate] = useState(false)
  const [negotiatingTask, setNegotiatingTask] = useState<Task | null>(null)
  const [showCapsule, setShowCapsule] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [bossTaskId, setBossTaskId] = useState<string | null>(null)
  const [showFuneral, setShowFuneral] = useState<Task | null>(null)
  const [showFlowBreak, setShowFlowBreak] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all')
  const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([])
  const [regenKey, setRegenKey] = useState(0)
  const [showApiWarning, setShowApiWarning] = useState(!import.meta.env.VITE_DEEPSEEK_API_KEY)
  const [pendingTaskInfo, setPendingTaskInfo] = useState<{ name: string; deadline: string } | null>(null)

  useEffect(() => {
    const saved = loadTasks()
    setTasks(saved)
    if (saved.length > 0) {
      setPersonality(saved[0].personality)
      setPhase('task_board')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  const getFilteredTasks = () => {
    if (taskFilter === 'all') return tasks
    if (taskFilter === 'todo') return tasks.filter(t => !t.bossDefeated)
    return tasks.filter(t => t.bossDefeated)
  }

  const handlePersonalityDone = async (answers: string[]) => {
    const result = await analyzePersonality(answers)
    setPersonality(result.type as ProcrastinationType)
    setPhase('future_mirror')
  }

  const handleFutureMirrorDone = async (taskName: string, deadline: string) => {
    const pType = personality || 'avoider'
    const subtasks = await decomposeTask(taskName, deadline, pType)
    setPendingSubtasks(subtasks)
    setPendingTaskInfo({ name: taskName, deadline })
    setPhase('edit_subtasks')
  }

  const handleSubtasksConfirmed = (editedSubtasks: Subtask[]) => {
    if (!pendingTaskInfo) return
    const pType = personality || 'avoider'
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: pendingTaskInfo.name,
      deadline: pendingTaskInfo.deadline,
      subtasks: editedSubtasks,
      createdAt: new Date().toISOString(),
      personality: pType,
      totalCompleted: 0,
      streak: 0,
      bestStreak: 0,
      bossDefeated: false,
      pointsEarned: 0,
    }
    setTasks(prev => {
      const updated = [...prev, newTask]
      saveTasks(updated)
      return updated
    })
    setActiveTask(newTask)
    setPendingSubtasks([])
    setPendingTaskInfo(null)
    setShowCapsule(true)
  }

  const handleCapsuleDone = (message: string) => {
    if (!activeTask) return
    const updated = { ...activeTask, capsule: { message, createdAt: new Date().toISOString() } }
    setActiveTask(updated)
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === updated.id ? updated : t)
      saveTasks(newTasks)
      return newTasks
    })
    setShowCapsule(false)
    setPhase('task_board')
  }

  const handleCompleteSubtask = (taskId: string, subtaskId: string) => {
    // Calculate points OUTSIDE the setState updater to avoid React StrictMode double-invocation
    const targetTask = tasks.find(t => t.id === taskId)
    const subtask = targetTask?.subtasks.find(s => s.id === subtaskId)
    const earnPoints = subtask?.points || 10
    addPoints(earnPoints)

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== taskId) return t
        const completedIdx = t.subtasks.findIndex(x => x.id === subtaskId)
        const subs = t.subtasks.map((s, i) => {
          if (i === completedIdx) return { ...s, completed: true }
          if (i === completedIdx + 1) return { ...s, unlocked: true }
          return s
        })
        const completedCount = subs.filter(s => s.completed).length
        const allDone = subs.every(s => s.completed)
        const earned = (t.pointsEarned || 0) + earnPoints
        return { ...t, subtasks: subs, totalCompleted: completedCount, bossDefeated: allDone, pointsEarned: earned }
      })
      saveTasks(updated)
      const totalCompleted = updated.reduce((s, t) => s + t.subtasks.filter(x => x.completed).length, 0)
      if (totalCompleted > 0 && totalCompleted % 3 === 0) {
        setTimeout(() => setShowFlowBreak(true), 500)
      }
      return updated
    })
  }

  const handleStartBoss = (taskId: string) => { setBossTaskId(taskId); setPhase('boss_battle') }

  const handleBossDefeated = () => {
    if (!bossTaskId) return
    const task = tasks.find(t => t.id === bossTaskId)
    const bossSub = task?.subtasks.find(s => s.isBoss)
    const bossPoints = bossSub?.points || 50
    addPoints(bossPoints)

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== bossTaskId) return t
        return { ...t, bossDefeated: true, pointsEarned: (t.pointsEarned || 0) + bossPoints, subtasks: t.subtasks.map(s => s.isBoss ? { ...s, completed: true } : s) }
      })
      saveTasks(updated)
      return updated
    })
    setBossTaskId(null)
    setPhase('task_board')
  }

  const handleSlackOff = (task: Task) => { setNegotiatingTask(task); setShowNegotiate(true) }

  const pProfile = personality ? PERSONALITY_PROFILES[personality] : null
  const points = getAvailablePoints()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? '' : 'light'}`}>
      <header className="border-b border-border/50 bg-card/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 15 }} className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sword className="w-4 h-4 text-primary" />
            </motion.div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              拖延闯关拆解器
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pProfile && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                {pProfile.emoji} {pProfile.label}
              </span>
            )}
            <button onClick={() => setShowShop(true)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Store className="w-4 h-4 text-yellow-400" />
              {points > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {points > 99 ? '99+' : points}
                </span>
              )}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {showApiWarning && (
        <div className="max-w-4xl mx-auto px-4 pt-3">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400 flex items-center justify-between">
            <span>⚠️ 未配置 DeepSeek API Key，AI 功能不可用。请在项目根目录 <code className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-xs">.env</code> 文件中填入 <code className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-xs">VITE_DEEPSEEK_API_KEY</code></span>
            <button onClick={() => setShowApiWarning(false)} className="shrink-0 ml-3 text-yellow-400/60 hover:text-yellow-400">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === 'personality' && (
            <motion.div key="personality" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PersonalityTest onDone={handlePersonalityDone} />
            </motion.div>
          )}
          {phase === 'future_mirror' && (
            <motion.div key="future_mirror" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <FutureMirror onDone={handleFutureMirrorDone} onBack={() => setPhase('personality')} />
            </motion.div>
          )}
          {phase === 'edit_subtasks' && pendingTaskInfo && (
            <motion.div key="edit_subtasks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SubtaskEditor
                subtasks={pendingSubtasks}
                version={regenKey}
                onConfirm={handleSubtasksConfirmed}
                onBack={() => setPhase('future_mirror')}
                onRegenerate={async () => {
                  const newSubs = await decomposeTask(pendingTaskInfo.name, pendingTaskInfo.deadline, personality || 'avoider')
                  setPendingSubtasks(newSubs)
                  setRegenKey(k => k + 1)
                }}
              />
            </motion.div>
          )}
          {showCapsule && activeTask && (
            <TimeCapsuleModal taskName={activeTask.name} onDone={handleCapsuleDone} onSkip={() => { setShowCapsule(false); setPhase('task_board') }} />
          )}
          {phase === 'task_board' && (
            <motion.div key="task_board" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <StreakPanel tasks={tasks} />
              <DailyReport tasks={tasks} />

              <div className="flex gap-1 mb-4 p-1 rounded-xl bg-secondary/50">
                {(['all', 'todo', 'done'] as const).map(f => (
                  <button key={f} onClick={() => setTaskFilter(f)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${taskFilter === f ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {f === 'all' ? '全部' : f === 'todo' ? '待办' : '已完成'}
                    {f === 'todo' && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                        {tasks.filter(t => !t.bossDefeated).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Brain className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" />
                  </motion.div>
                  <p className="text-muted-foreground mb-2 text-lg font-medium">还没有任务</p>
                  <p className="text-muted-foreground/60 mb-6 text-sm">来拆解第一个巨型任务吧！</p>
                  <button onClick={() => setPhase('future_mirror')}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-red-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    <Plus className="w-5 h-5" /> 新建任务
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {getFilteredTasks().map(task => (
                    <TaskBoard key={task.id} task={task} onCompleteSubtask={handleCompleteSubtask}
                      onStartBoss={handleStartBoss} onSlackOff={() => handleSlackOff(task)}
                      onFuneral={task.bossDefeated ? () => setShowFuneral(task) : undefined}
                    />
                  ))}
                  <div className="text-center pt-4">
                    <button onClick={() => setPhase('future_mirror')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl hover:bg-secondary hover:border-primary/30 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" /> 添加新任务
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {phase === 'boss_battle' && bossTaskId && (
            <BossBattle task={tasks.find(t => t.id === bossTaskId)!} onDefeated={handleBossDefeated}
              onRetreat={() => { setBossTaskId(null); setPhase('task_board') }} />
          )}
        </AnimatePresence>
      </main>

      {showNegotiate && negotiatingTask && (
        <NegotiateDialog taskName={negotiatingTask.name} personality={negotiatingTask.personality || personality || 'avoider'}
          onStay={() => setShowNegotiate(false)} onClose={() => setShowNegotiate(false)} />
      )}
      {showFlowBreak && <FlowBreak onClose={() => setShowFlowBreak(false)} />}
      {showFuneral && <TaskFuneral task={showFuneral} onClose={() => setShowFuneral(null)} />}
      {showShop && <ShopPanel onClose={() => setShowShop(false)} />}
    </div>
  )
}