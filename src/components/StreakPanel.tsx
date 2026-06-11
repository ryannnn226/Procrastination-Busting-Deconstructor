import { motion } from 'framer-motion'
import { Task } from '../lib/types'
import { getAvailablePoints } from '../lib/shop'
import { Flame, Trophy, TrendingUp, Star } from 'lucide-react'

interface Props {
  tasks: Task[]
}

export function StreakPanel({ tasks }: Props) {
  const totalCompleted = tasks.reduce((sum, t) => sum + t.totalCompleted, 0)
  const bestStreak = Math.max(0, ...tasks.map(t => t.bestStreak))
  const completedTasks = tasks.filter(t => t.bossDefeated)
  const currentStreak = tasks.length > 0 ? Math.max(1, ...tasks.map(t => t.streak)) : 0
  const totalPointsEarned = tasks.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
  const availablePoints = getAvailablePoints()

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        className="bg-card border border-border rounded-xl p-3.5 text-center hover:border-primary/30 transition-all"
      >
        <Flame className={`w-5 h-5 mx-auto mb-1.5 ${currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
        <p className="text-xl font-bold font-mono">{currentStreak}</p>
        <p className="text-[10px] text-muted-foreground">连续天</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        className="bg-card border border-border rounded-xl p-3.5 text-center hover:border-blue-400/30 transition-all"
      >
        <TrendingUp className="w-5 h-5 mx-auto mb-1.5 text-blue-400" />
        <p className="text-xl font-bold font-mono">{totalCompleted}</p>
        <p className="text-[10px] text-muted-foreground">小关完成</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        className="bg-card border border-border rounded-xl p-3.5 text-center hover:border-yellow-400/30 transition-all"
      >
        <Trophy className="w-5 h-5 mx-auto mb-1.5 text-yellow-400" />
        <p className="text-xl font-bold font-mono">{completedTasks.length}</p>
        <p className="text-[10px] text-muted-foreground">已通关</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        className="bg-card border border-border rounded-xl p-3.5 text-center hover:border-amber-400/30 transition-all bg-gradient-to-b from-amber-500/5 to-transparent"
      >
        <Star className="w-5 h-5 mx-auto mb-1.5 text-amber-400" />
        <p className="text-xl font-bold font-mono text-amber-400">{availablePoints}</p>
        <p className="text-[10px] text-muted-foreground">可用积分</p>
      </motion.div>
    </div>
  )
}