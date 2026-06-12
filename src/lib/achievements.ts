
import { Achievement, AchievementStats, UnlockedAchievement } from './types'

const ACHIEVEMENT_KEY = 'deconstructor_achievements'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', name: '第一步', description: '完成第一个子任务', emoji: '👣', condition: s => s.totalSubtasksCompleted >= 1 },
  { id: 'getting_started', name: '渐入佳境', description: '累计完成 10 个子任务', emoji: '🌱', condition: s => s.totalSubtasksCompleted >= 10 },
  { id: 'on_fire', name: '火力全开', description: '累计完成 50 个子任务', emoji: '🔥', condition: s => s.totalSubtasksCompleted >= 50 },
  { id: 'century', name: '百关斩', description: '累计完成 100 个子任务', emoji: '💯', condition: s => s.totalSubtasksCompleted >= 100 },
  { id: 'first_clear', name: '首通', description: '通关第一个任务', emoji: '🏆', condition: s => s.totalTasksCompleted >= 1 },
  { id: 'veteran', name: '老兵', description: '累计通关 5 个任务', emoji: '🎖️', condition: s => s.totalTasksCompleted >= 5 },
  { id: 'boss_slayer', name: 'Boss 杀手', description: '击败 3 个 Boss', emoji: '⚔️', condition: s => s.totalBossesDefeated >= 3 },
  { id: 'boss_master', name: 'Boss 大师', description: '击败 10 个 Boss', emoji: '👑', condition: s => s.totalBossesDefeated >= 10 },
  { id: 'rich', name: '积分新贵', description: '累计获得 200 积分', emoji: '💰', condition: s => s.totalPointsEarned >= 200 },
  { id: 'millionaire', name: '积分大亨', description: '累计获得 1000 积分', emoji: '💎', condition: s => s.totalPointsEarned >= 1000 },
  { id: 'streak_3', name: '三日王者', description: '连续打卡 3 天', emoji: '📅', condition: s => s.currentStreak >= 3 },
  { id: 'streak_7', name: '七日传说', description: '连续打卡 7 天', emoji: '🌟', condition: s => s.currentStreak >= 7 },
  { id: 'negotiator', name: '谈判专家', description: '完成 5 次拉扯谈判', emoji: '🤝', condition: s => s.totalNegotiations >= 5 },
  { id: 'zen', name: '心流大师', description: '完成 10 次心流小憩', emoji: '🧘', condition: s => s.totalFlowBreaks >= 10 },
  { id: 'all_rounder', name: '全能选手', description: '解锁 10 个成就', emoji: '🎯', condition: s => false },
]

export function getAchievementStats(): AchievementStats {
  try { return JSON.parse(localStorage.getItem('deconstructor_achieve_stats') || '{"totalSubtasksCompleted":0,"totalTasksCompleted":0,"totalBossesDefeated":0,"totalPointsEarned":0,"currentStreak":0,"bestStreak":0,"totalFlowBreaks":0,"totalNegotiations":0}') }
  catch { return { totalSubtasksCompleted: 0, totalTasksCompleted: 0, totalBossesDefeated: 0, totalPointsEarned: 0, currentStreak: 0, bestStreak: 0, totalFlowBreaks: 0, totalNegotiations: 0 } }
}

export function updateAchievementStats(update: Partial<AchievementStats>) {
  const stats = getAchievementStats()
  const merged = { ...stats, ...update }
  if (update.currentStreak && update.currentStreak > stats.bestStreak) merged.bestStreak = update.currentStreak
  localStorage.setItem('deconstructor_achieve_stats', JSON.stringify(merged))
  checkAndUnlock(merged)
}

export function getUnlocked(): UnlockedAchievement[] {
  try { return JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) || '[]') }
  catch { return [] }
}

function checkAndUnlock(stats: AchievementStats) {
  const unlocked = getUnlocked()
  const ids = new Set(unlocked.map(u => u.id))
  let changed = false

  for (const a of ACHIEVEMENTS) {
    if (ids.has(a.id)) continue
    // Special handling for 'all_rounder'
    if (a.id === 'all_rounder') {
      if (ids.size >= 10) {
        unlocked.push({ id: a.id, unlockedAt: new Date().toISOString() })
        changed = true
      }
      continue
    }
    if (a.condition(stats)) {
      unlocked.push({ id: a.id, unlockedAt: new Date().toISOString() })
      changed = true
    }
  }
  if (changed) localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(unlocked))
}

export function getAchievementProgress(): { total: number; unlocked: number } {
  return { total: ACHIEVEMENTS.length, unlocked: getUnlocked().length }
}
