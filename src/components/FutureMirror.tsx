import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateFutureScenes } from '../lib/ai'
import { FutureScene } from '../lib/types'
import { Sparkles, Calendar, ArrowLeft, Play, CheckCircle } from 'lucide-react'

interface Props {
  onDone: (taskName: string, deadline: string) => void
  onBack: () => void
}

export function FutureMirror({ onDone, onBack }: Props) {
  const [taskName, setTaskName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [scenes, setScenes] = useState<FutureScene[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [chosenPath, setChosenPath] = useState<'A' | 'B' | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!taskName || !deadline) return
    setLoading(true)
    const result = await generateFutureScenes(taskName, deadline)
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
          <h2 className="text-2xl font-bold mb-2">🔮 未来之镜</h2>
          <p className="text-muted-foreground text-sm">
            两条路线，两种结局。你选择哪一条？
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
                  {scene.path === 'A' ? '🟢' : '🔴'} 路线{scene.path}：{scene.title}
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
                对！我要走这条路 💪
              </button>
            ) : (
              <div>
                <p className="text-muted-foreground mb-3 text-sm">你也不想这样对吧？重新选一条？</p>
                <button
                  onClick={() => setChosenPath('A')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  我要选路线 A ✨
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
        返回
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">创建你的闯关任务</h2>
        <p className="text-muted-foreground text-sm">
          告诉我你要搞定什么，我帮你拆成小关卡
        </p>
      </motion.div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">任务名称</label>
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            placeholder="比如：写完毕业论文初稿"
            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            截止日期
          </label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!taskName || !deadline || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {loading ? 'AI 正在拆解任务...' : '开始拆解'}
        </button>
      </div>
    </div>
  )
}
