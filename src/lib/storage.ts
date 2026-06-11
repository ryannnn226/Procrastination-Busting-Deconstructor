import { Task, ProcrastinationPoint } from './types'

const TASKS_KEY = 'deconstructor_tasks'
const HEATMAP_KEY = 'deconstructor_heatmap'
const STREAK_KEY = 'deconstructor_streak'

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function loadTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveHeatmap(data: ProcrastinationPoint[]) {
  const existing = loadHeatmap()
  const merged = [...existing, ...data]
  // Keep last 14 days
  const cutoff = Date.now() - 14 * 86400000
  localStorage.setItem(HEATMAP_KEY, JSON.stringify(merged))
}

export function loadHeatmap(): ProcrastinationPoint[] {
  try {
    return JSON.parse(localStorage.getItem(HEATMAP_KEY) || '[]')
  } catch {
    return []
  }
}

export function getStreak(): number {
  return parseInt(localStorage.getItem(STREAK_KEY) || '0')
}

export function setStreak(n: number) {
  localStorage.setItem(STREAK_KEY, String(n))
}
