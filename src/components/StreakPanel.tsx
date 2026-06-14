
import { memo } from 'react'
import { useT } from '../lib/i18n.tsx'
import { motion } from 'framer-motion'
import { Task } from '../lib/types'
import { getAvailablePoints } from '../lib/shop'
import { Flame, Trophy, TrendingUp, Star, Zap } from 'lucide-react'

interface Props { tasks: Task[] }

export const StreakPanel = memo(function StreakPanel({ tasks }: Props) {
  const { t } = useT()
  const totalCompleted = tasks.reduce((sum, t) => sum + t.totalCompleted, 0)
  const completedTasks = tasks.filter(t => t.bossDefeated)
  const currentStreak = tasks.length > 0 ? Math.max(1, ...tasks.map(t => t.streak)) : 0
  const availablePoints = getAvailablePoints()
  const xp = totalCompleted * 15 + completedTasks.length * 100
  const level = Math.floor(xp / 200) + 1
  const xpToNext = 200 - (xp % 200)
  const xpProgress = (xp % 200) / 200 * 100

  return (
    <div className="mb-8">
      {/* Hero Row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{t('hero.adventurer')}</p>
          <h2 className="text-3xl font-black gold-text tracking-tight">{t('hero.level').replace('{0}', String(level))}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('hero.xpToNext').replace('{0}', String(xpToNext)).replace('{1}', String(level + 1))}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} className="text-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl gold-bg border border-[hsl(var(--gold)/0.2)]">
            <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="font-black text-lg text-[hsl(var(--gold))]">{availablePoints}</span>
            <span className="text-xs text-[hsl(var(--gold)/0.7)]">pts</span>
          </div>
        </motion.div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <div className="level-bar h-2">
          <motion.div className="level-bar-fill" initial={{ width: 0 }} animate={{ width: xpProgress + '%' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      {/* Stat Pill Row */}
      <div className="flex gap-3">
        <motion.div whileHover={{ y: -2 }} className="flex-1 p-4 rounded-2xl glass border border-[hsl(var(--border-glass))]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xl font-black font-mono">{currentStreak}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{t('hero.streak')}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="flex-1 p-4 rounded-2xl glass border border-[hsl(var(--border-glass))]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-black font-mono">{totalCompleted}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{t('hero.questsDone')}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="flex-1 p-4 rounded-2xl glass border border-[hsl(var(--border-glass))]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black font-mono">{completedTasks.length}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{t('hero.cleared')}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="flex-1 p-4 rounded-2xl glass border border-[hsl(var(--border-glass))]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--gold)/0.1)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[hsl(var(--gold))]" />
            </div>
            <p className="text-xl font-black font-mono text-[hsl(var(--gold))]">{xp}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{t('hero.totalXp')}</p>
        </motion.div>
      </div>
    </div>
  )
})
