import { ShopItem, UserStats } from './types'

const SHOP_KEY = 'deconstructor_shop'
const POINTS_KEY = 'deconstructor_points'

const DEFAULT_ITEMS: ShopItem[] = [
  { id: 'game1h', name: '玩游戏一小时', description: '犒劳自己，尽情玩一小时游戏', cost: 100, emoji: '🎮', redeemed: false },
  { id: 'movie', name: '看一部电影', description: '选一部想看的电影，完整看完', cost: 150, emoji: '🎬', redeemed: false },
  { id: 'snack', name: '零食自由', description: '买一份自己喜欢的零食', cost: 60, emoji: '🍿', redeemed: false },
  { id: 'sleepin', name: '睡到自然醒', description: '明天不设闹钟，睡到自然醒', cost: 200, emoji: '😴', redeemed: false },
  { id: 'dayoff', name: '休息日', description: '给自己放一天假，完全不碰任务', cost: 300, emoji: '🏖️', redeemed: false },
  { id: 'treat', name: '小确幸', description: '给自己买一个小礼物', cost: 120, emoji: '🎁', redeemed: false },
]

export function loadShop(): ShopItem[] {
  try {
    const saved = localStorage.getItem(SHOP_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS
  } catch {
    return DEFAULT_ITEMS
  }
}

export function saveShop(items: ShopItem[]) {
  localStorage.setItem(SHOP_KEY, JSON.stringify(items))
}

export function getAvailablePoints(): number {
  return parseInt(localStorage.getItem(POINTS_KEY) || '0')
}

export function addPoints(amount: number): number {
  const current = getAvailablePoints()
  const updated = current + amount
  localStorage.setItem(POINTS_KEY, String(updated))
  return updated
}

export function spendPoints(amount: number): boolean {
  const current = getAvailablePoints()
  if (current < amount) return false
  localStorage.setItem(POINTS_KEY, String(current - amount))
  return true
}

export function getTotalEarned(): number {
  const shop = loadShop()
  const redeemed = shop.filter(i => i.redeemed).reduce((s, i) => s + i.cost, 0)
  return getAvailablePoints() + redeemed
}

export function getUserStats(): UserStats {
  return {
    totalPoints: getTotalEarned(),
    availablePoints: getAvailablePoints(),
    shopItems: loadShop(),
  }
}