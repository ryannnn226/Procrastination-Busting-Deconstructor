
import { ShopItem, UserStats } from './types'

const SHOP_KEY = 'deconstructor_shop'
const POINTS_KEY = 'deconstructor_points'
const TX_KEY = 'deconstructor_transactions'
const CHECKIN_KEY = 'deconstructor_checkin'

export interface Transaction {
  id: string
  type: 'earn' | 'spend' | 'checkin'
  amount: number
  reason: string
  time: string
}

const DEFAULT_ITEMS: ShopItem[] = [
  { id: 'game1h', name: '玩游戏一小时', description: '犒劳自己，尽情玩一小时游戏', cost: 100, emoji: '🎮', redeemed: false },
  { id: 'movie', name: '看一部电影', description: '选一部想看的电影，完整看完', cost: 150, emoji: '🎬', redeemed: false },
  { id: 'snack', name: '零食自由', description: '买一份自己喜欢的零食', cost: 60, emoji: '🍿', redeemed: false },
  { id: 'sleepin', name: '睡到自然醒', description: '明天不设闹钟，睡到自然醒', cost: 200, emoji: '😴', redeemed: false },
  { id: 'treat', name: '小确幸', description: '给自己买一个小礼物', cost: 120, emoji: '🎁', redeemed: false },
]

export function loadShop(): ShopItem[] {
  try { const saved = localStorage.getItem(SHOP_KEY); return saved ? JSON.parse(saved) : DEFAULT_ITEMS }
  catch { return DEFAULT_ITEMS }
}

export function saveShop(items: ShopItem[]) {
  localStorage.setItem(SHOP_KEY, JSON.stringify(items))
}

export function getAvailablePoints(): number {
  return parseInt(localStorage.getItem(POINTS_KEY) || '0')
}

export function addPoints(amount: number, reason?: string): number {
  const current = getAvailablePoints()
  const updated = current + amount
  localStorage.setItem(POINTS_KEY, String(updated))
  addTransaction({ id: 'tx-' + Date.now(), type: 'earn', amount, reason: reason || '任务奖励', time: new Date().toISOString() })
  return updated
}

export function spendPoints(amount: number, reason?: string): boolean {
  const current = getAvailablePoints()
  if (current < amount) return false
  localStorage.setItem(POINTS_KEY, String(current - amount))
  addTransaction({ id: 'tx-' + Date.now(), type: 'spend', amount: -amount, reason: reason || '商城兑换', time: new Date().toISOString() })
  return true
}

export function getTransactions(): Transaction[] {
  try { return JSON.parse(localStorage.getItem(TX_KEY) || '[]') }
  catch { return [] }
}

function addTransaction(tx: Transaction) {
  const txs = getTransactions()
  txs.unshift(tx)
  if (txs.length > 50) txs.length = 50
  localStorage.setItem(TX_KEY, JSON.stringify(txs))
}

export function getTotalEarned(): number {
  return getTransactions().filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
}

export function getTotalSpent(): number {
  return getTransactions().filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
}

export function getCheckinStatus(): { checked: boolean; streak: number } {
  try {
    const data = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{"date":"","streak":0}')
    const today = new Date().toISOString().slice(0, 10)
    return { checked: data.date === today, streak: data.streak || 0 }
  } catch { return { checked: false, streak: 0 } }
}

export function doCheckin(): { points: number; streak: number } {
  const points = 5 + Math.floor(Math.random() * 11)
  const today = new Date().toISOString().slice(0, 10)
  const data = getCheckinStatus()
  const newStreak = data.checked ? data.streak : data.streak + 1
  localStorage.setItem(CHECKIN_KEY, JSON.stringify({ date: today, streak: newStreak }))
  addPoints(points, '每日签到')
  return { points, streak: newStreak }
}

export function getUserStats(): UserStats {
  return { totalPoints: getTotalEarned(), availablePoints: getAvailablePoints(), shopItems: loadShop() }
}
