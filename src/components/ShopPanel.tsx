
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadShop, saveShop, getAvailablePoints, spendPoints, getTransactions, getTotalEarned, getTotalSpent, getCheckinStatus, doCheckin } from '../lib/shop'
import { ShopItem } from '../lib/types'
import { Store, Coins, Sparkles, Plus, Gift, History, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface Props { onClose: () => void }

type TabType = 'shop' | 'history' | 'stats'

export function ShopPanel({ onClose }: Props) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [points, setPoints] = useState(0)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState('')
  const [tab, setTab] = useState<TabType>('shop')
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', cost: 50, emoji: '🎯' })

  useEffect(() => { setItems(loadShop()); setPoints(getAvailablePoints()) }, [])

  const handleRedeem = (item: ShopItem) => {
    if (points < item.cost) return
    setRedeeming(item.id)
    setTimeout(() => {
      if (spendPoints(item.cost, item.name)) {
        setPoints(getAvailablePoints())
        setShowSuccess(item.emoji + ' ' + item.name)
        setTimeout(() => setShowSuccess(''), 2500)
      }
      setRedeeming(null)
    }, 400)
  }

  const handleAddItem = () => {
    if (!newItem.name.trim()) return
    const item: ShopItem = {
      id: 'custom-' + Date.now(),
      name: newItem.name.trim(),
      description: '自定义奖励',
      cost: newItem.cost,
      emoji: newItem.emoji,
      redeemed: false,
    }
    const updated = [...items, item]
    setItems(updated)
    saveShop(updated)
    setNewItem({ name: '', cost: 50, emoji: '🎯' })
    setShowAddItem(false)
  }

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    saveShop(updated)
  }

  // Checkin
  const checkin = getCheckinStatus()
  const [checkinDone, setCheckinDone] = useState(checkin.checked)
  const [checkinResult, setCheckinResult] = useState<{ points: number; streak: number } | null>(null)

  const handleCheckin = () => {
    if (checkinDone) return
    const result = doCheckin()
    setCheckinResult(result)
    setCheckinDone(true)
    setPoints(getAvailablePoints())
    setTimeout(() => setCheckinResult(null), 3000)
  }

  const transactions = getTransactions()
  const totalEarned = getTotalEarned()
  const totalSpent = getTotalSpent()

  const EMOJIS = ['🎯', '🏆', '🎨', '📚', '✈️', '🍕', '🎵', '💆', '🎪', '🌸']

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">积分商城</h2></div>
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">关闭 ✕</button>
          </div>

          {/* Points + Checkin */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div><p className="text-2xl font-black text-yellow-400">{points}</p><p className="text-xs text-muted-foreground">可用积分</p></div>
            </div>
            <button onClick={handleCheckin} disabled={checkinDone}
              className={'shrink-0 p-3 rounded-xl border text-center transition-all ' + (checkinDone ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border hover:border-primary/50')}>
              <Calendar className={'w-5 h-5 mx-auto mb-0.5 ' + (checkinDone ? 'text-emerald-400' : 'text-muted-foreground')} />
              <span className="text-[10px]">{checkinDone ? '已签到' : '签到'}</span>
            </button>
          </div>

          {checkinResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center text-sm text-yellow-400">
              🎉 签到成功！+{checkinResult.points} 积分 | 连续 {checkinResult.streak} 天
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 mx-4 mt-2 rounded-xl bg-secondary/50 shrink-0">
          {([['shop', '商城'], ['history', '明细'], ['stats', '统计']] as [TabType, string][]).map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)}
              className={'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ' + (tab === k ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
              {v}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {tab === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {items.map(item => {
                  const canAfford = points >= item.cost
                  return (
                    <motion.div key={item.id} whileHover={canAfford ? { scale: 1.02 } : {}}
                      onClick={() => canAfford && handleRedeem(item)}
                      className={'flex items-center gap-3 p-4 rounded-xl border transition-all ' + (canAfford ? 'border-border hover:border-primary/50 cursor-pointer' : 'border-border opacity-40')}>
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.id.startsWith('custom-') && (
                          <button onClick={e => { e.stopPropagation(); handleDeleteItem(item.id) }}
                            className="text-xs text-muted-foreground hover:text-red-400" title="删除">✕</button>
                        )}
                        <div className="text-right">
                          <p className={'text-sm font-bold ' + (canAfford ? 'text-yellow-400' : 'text-muted-foreground')}>{item.cost} ⭐</p>
                          {redeeming === item.id ? <span className="text-[10px] text-muted-foreground">兑换中...</span>
                            : canAfford ? <span className="text-[10px] text-primary">点击兑换</span>
                            : <span className="text-[10px] text-muted-foreground">积分不足</span>}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Add custom item */}
                {showAddItem ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex gap-1">
                        {EMOJIS.map(e => (
                          <button key={e} onClick={() => setNewItem({ ...newItem, emoji: e })}
                            className={'w-7 h-7 rounded text-sm ' + (newItem.emoji === e ? 'bg-primary/30 ring-1 ring-primary' : 'hover:bg-secondary')}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="奖励名称" className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none" />
                      <input type="number" value={newItem.cost} onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) || 10 })}
                        className="w-20 px-2 py-2 text-sm rounded-lg bg-secondary border border-border" min={10} max={999} />
                      <button onClick={handleAddItem} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">添加</button>
                    </div>
                    <button onClick={() => setShowAddItem(false)} className="text-xs text-muted-foreground hover:text-foreground">取消</button>
                  </motion.div>
                ) : (
                  <button onClick={() => setShowAddItem(true)}
                    className="w-full py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" />自定义奖励
                  </button>
                )}
              </motion.div>
            )}

            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">暂无积分记录</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                      <span className={tx.type === 'earn' ? 'text-emerald-400' : tx.type === 'checkin' ? 'text-yellow-400' : 'text-red-400'}>
                        {tx.type === 'earn' ? <TrendingUp className="w-4 h-4" /> : tx.type === 'checkin' ? <Gift className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{tx.reason}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={'font-mono font-bold text-sm ' + (tx.amount > 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                    <p className="text-2xl font-black text-emerald-400">{totalEarned}</p>
                    <p className="text-xs text-muted-foreground">累计赚取</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                    <TrendingDown className="w-5 h-5 mx-auto mb-2 text-red-400" />
                    <p className="text-2xl font-black text-red-400">{totalSpent}</p>
                    <p className="text-xs text-muted-foreground">累计消费</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 text-center">
                  <Coins className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                  <p className="text-2xl font-black text-yellow-400">{points}</p>
                  <p className="text-xs text-muted-foreground">当前余额</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div><p className="text-sm font-semibold text-emerald-400">兑换成功！</p><p className="text-xs text-emerald-400/70">{showSuccess} — 尽情享受！</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
