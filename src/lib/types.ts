// 拖延人格类型
export type ProcrastinationType =
  | 'perfectionist'   // 完美主义型
  | 'thrill_seeker'   // 刺激寻求型
  | 'avoider'         // 逃避型
  | 'decision_paralysis' // 决策瘫痪型

// 人格分析结果
export interface PersonalityProfile {
  type: ProcrastinationType
  label: string
  description: string
  strategy: string
  color: string
  emoji: string
}

// 任务
export interface Task {
  id: string
  name: string
  deadline: string
  subtasks: Subtask[]
  createdAt: string
  personality: ProcrastinationType
  totalCompleted: number
  streak: number
  bestStreak: number
  bossDefeated: boolean
  pointsEarned: number
  capsule?: TimeCapsule
}

// 子任务
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss'

export interface Subtask {
  id: string
  title: string
  duration: number // 分钟
  difficulty: Difficulty
  completed: boolean
  isBoss: boolean
  unlocked: boolean
  reward?: string
  points?: number // 完成可获得积分
}

export interface ShopItem {
  id: string
  name: string
  description: string
  cost: number
  emoji: string
  redeemed: boolean
}

export interface UserStats {
  totalPoints: number
  availablePoints: number
  shopItems: ShopItem[]
}

// 时光胶囊
export interface TimeCapsule {
  message: string
  audioUrl?: string
  createdAt: string
}

// 摆烂热力图数据点
export interface ProcrastinationPoint {
  day: number   // 0-6
  hour: number  // 0-23
  level: number // 0-10
}

// 每日成绩单
export interface DailyReport {
  date: string
  completedSubtasks: number
  totalSubtasks: number
  procrastinationMinutes: number
  peakProcrastinationHour: number
  streak: number
  quote: string
}

// 未来之镜场景
export interface FutureScene {
  path: 'A' | 'B'
  title: string
  scene: string
  consequence: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  condition: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  totalSubtasksCompleted: number
  totalTasksCompleted: number
  totalBossesDefeated: number
  totalPointsEarned: number
  currentStreak: number
  bestStreak: number
  totalFlowBreaks: number
  totalNegotiations: number
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}
