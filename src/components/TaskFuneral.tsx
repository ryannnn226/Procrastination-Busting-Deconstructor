import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '../lib/types'
import { chat } from '../lib/deepseek'
import { Skull, X, PartyPopper } from 'lucide-react'

interface Props {
  task: Task
  onClose: () => void
}

export function TaskFuneral({ task, onClose }: Props) {
  const [eulogy, setEulogy] = useState('')
  const [phase, setPhase] = useState<'ceremony' | 'destroy' | 'done'>('ceremony')

  useEffect(() => {
    generateEulogy()
  }, [])

  const generateEulogy = async () => {
    const stats = [
      `总子任务：${task.subtasks.length} 个`,
      `人格类型：${task.personality}`,
      `截止日期：${task.deadline}`,
    ].join('，')

    const prompt = `用户刚刚完成了任务"${task.name}"！写一段 80 字以内的诙谐悼词/告别词，用幽默的语气悼念"拖延"的死亡，庆祝任务的完成。风格轻松有趣。第二人称。`
    const result = await chat([{ role: 'user', content: prompt }])
    setEulogy(result || `${task.name} 终于被你打败了！拖延兽已阵亡。`)
  }

  const totalMinutes = task.subtasks.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {phase === 'ceremony' && (
          <motion.div
            key="ceremony"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-card rounded-2xl border border-border max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 text-center">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                ⚰️
              </motion.div>
              <h2 className="text-xl font-bold mb-1">任务葬礼</h2>
              <p className="text-sm text-muted-foreground">
                「{task.name}」— 安息吧，拖延！
              </p>
            </div>

            {/* Stats */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold font-mono">{task.subtasks.length}</p>
                  <p className="text-[10px] text-muted-foreground">关卡数</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold font-mono">{totalMinutes}</p>
                  <p className="text-[10px] text-muted-foreground">总分钟</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold font-mono">{task.streak || '?'}</p>
                  <p className="text-[10px] text-muted-foreground">连胜天</p>
                </div>
              </div>

              {/* Eulogy */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-4">
                {eulogy ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm leading-relaxed italic"
                  >
                    "{eulogy}"
                  </motion.p>
                ) : (
                  <div className="flex justify-center py-4">
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setPhase('destroy')}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors"
              >
                🔥 火化任务
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'destroy' && (
          <motion.div
            key="destroy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            {/* Shredding animation */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-3 rounded"
                  style={{
                    background: ['#f43f5e', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'][i % 6],
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    rotate: Math.random() * 360,
                  }}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    opacity: 0,
                    scale: [1, 1.5, 0],
                    x: (Math.random() - 0.5) * 300,
                    y: (Math.random() - 0.5) * 300 - 100,
                    rotate: Math.random() * 720,
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    delay: i * 0.03,
                    ease: 'easeOut',
                  }}
                />
              ))}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 0.8, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 2, delay: 0.5 }}
              >
                <Skull className="w-20 h-20 text-red-500" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              onAnimationComplete={() => setTimeout(() => setPhase('done'), 1500)}
            >
              <p className="text-2xl font-black text-red-400">任务已粉碎！</p>
            </motion.div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-emerald-500/30 p-8 max-w-sm w-full text-center"
          >
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-black text-emerald-400 mb-2">
              彻底解放！
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              「{task.name}」已经从你的待办清单上消失了 🎉
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              继续前进
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
