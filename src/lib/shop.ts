
import { ShopItem } from './types'

const SHOP_KEY = 'deconstructor_shop'
const POINTS_KEY = 'deconstructor_points'
const TX_KEY = 'deconstructor_transactions'
const CHECKIN_KEY = 'deconstructor_checkin'
const REDEEM_KEY = 'deconstructor_redemptions'

export interface Transaction {
  id: string; type: 'earn' | 'spend' | 'checkin'; amount: number; reason: string; time: string
}

export interface Redemption {
  id: string
  itemId: string
  itemName: string
  itemEmoji: string
  cost: number
  status: 'pending' | 'used'
  redeemedAt: string
  usedAt?: string
}

const DEFAULT_ITEMS: ShopItem[] = [
  { id: 'game1h', name: '玩游戏一小时', description: '犒劳自己，尽情玩一小时', cost: 100, emoji: '🎮', redeemed: false },
  { id: 'movie', name: '看一部电影', description: '选一部想看的电影，完整看完', cost: 150, emoji: '🎬', redeemed: false },
  { id: 'snack', name: '零食自由', description: '买一份自己喜欢的零食', cost: 60, emoji: '🍿', redeemed: false },
  { id: 'sleepin', name: '睡到自然醒', description: '明天不设闹钟，睡到自然醒', cost: 200, emoji: '😴', redeemed: false },
  { id: 'treat', name: '小确幸', description: '给自己买一个小礼物', cost: 120, emoji: '🎁', redeemed: false },
]

export function loadShop(): ShopItem[] {
  try { return JSON.parse(localStorage.getItem(SHOP_KEY) || 'null') || DEFAULT_ITEMS }
  catch { return DEFAULT_ITEMS }
}
export function saveShop(items: ShopItem[]) { localStorage.setItem(SHOP_KEY, JSON.stringify(items)) }

export function getAvailablePoints(): number { return parseInt(localStorage.getItem(POINTS_KEY) || '0') }

export function addPoints(amount: number, reason?: string): number {
  const cur = getAvailablePoints(); localStorage.setItem(POINTS_KEY, String(cur + amount))
  addTransaction({ id: 'tx-' + Date.now(), type: 'earn', amount, reason: reason || '任务奖励', time: new Date().toISOString() })
  return cur + amount
}

export function spendPoints(amount: number, reason?: string): boolean {
  const cur = getAvailablePoints(); if (cur < amount) return false
  localStorage.setItem(POINTS_KEY, String(cur - amount))
  addTransaction({ id: 'tx-' + Date.now(), type: 'spend', amount: -amount, reason: reason || '商城兑换', time: new Date().toISOString() })
  return true
}

export function getTransactions(): Transaction[] {
  try { const t = JSON.parse(localStorage.getItem(TX_KEY) || '[]'); return t }
  catch { return [] }
}
function addTransaction(tx: Transaction) {
  const txs = getTransactions(); txs.unshift(tx); if (txs.length > 50) txs.length = 50
  localStorage.setItem(TX_KEY, JSON.stringify(txs))
}

export function getTotalEarned(): number { return getTransactions().filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0) }
export function getTotalSpent(): number { return getTransactions().filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) }

export function getCheckinStatus(): { checked: boolean; streak: number } {
  try {
    const d = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{"date":"","streak":0}')
    return { checked: d.date === new Date().toISOString().slice(0, 10), streak: d.streak || 0 }
  } catch { return { checked: false, streak: 0 } }
}
export function doCheckin(): { points: number; streak: number } {
  const points = 5 + Math.floor(Math.random() * 11); const today = new Date().toISOString().slice(0, 10)
  const s = getCheckinStatus(); const newStreak = s.checked ? s.streak : s.streak + 1
  localStorage.setItem(CHECKIN_KEY, JSON.stringify({ date: today, streak: newStreak }))
  addPoints(points, '每日签到'); return { points, streak: newStreak }
}

// Redemption tracking
export function getRedemptions(): Redemption[] {
  try { return JSON.parse(localStorage.getItem(REDEEM_KEY) || '[]') }
  catch { return [] }
}
function saveRedemptions(r: Redemption[]) { localStorage.setItem(REDEEM_KEY, JSON.stringify(r)) }

export function addRedemption(item: ShopItem): Redemption {
  const r: Redemption = { id: 'rd-' + Date.now(), itemId: item.id, itemName: item.name, itemEmoji: item.emoji, cost: item.cost, status: 'pending', redeemedAt: new Date().toISOString() }
  const all = getRedemptions(); all.unshift(r); saveRedemptions(all); return r
}

export function useRedemption(id: string) {
  const all = getRedemptions().map(r => r.id === id ? { ...r, status: 'used' as const, usedAt: new Date().toISOString() } : r)
  saveRedemptions(all)
}

export function getPendingRedemptions(): Redemption[] { return getRedemptions().filter(r => r.status === 'pending') }
export function getUsedRedemptions(): Redemption[] { return getRedemptions().filter(r => r.status === 'used') }
