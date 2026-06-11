import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadShop, saveShop, getAvailablePoints, spendPoints, getUserStats } from '../lib/shop'
import { ShopItem } from '../lib/types'
import { Store, Coins, Check, Sparkles, ShoppingBag } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function ShopPanel({ onClose }: Props) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [points, setPoints] = useState(0)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null)

  useEffect(() => {
    setItems(loadShop())
    setPoints(getAvailablePoints())
  }, [])

  const handleRedeem = (item: ShopItem) => {
    if (item.redeemed) return
    if (points < item.cost) return
    setRedeeming(item.id)
    setTimeout(() => {
      const ok = spendPoints(item.cost)
      if (ok) {
        const updated = items.map(i =>
          i.id === item.id ? { ...i, redeemed: true } : i
        )
        setItems(updated)
        saveShop(updated)
        setPoints(getAvailablePoints())
        setSuccessItem(item)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
      setRedeeming(null)
    }, 600)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">积分商城</h2>
            </div>
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
              关闭 ✕
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Coins className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-2xl font-black text-yellow-400">{points}</p>
              <p className="text-xs text-muted-foreground">可用积分</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {items.map(item => {
            const canAfford = points >= item.cost
            return (
              <motion.div
                key={item.id}
                whileHover={canAfford && !item.redeemed ? { scale: 1.02 } : {}}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  item.redeemed
                    ? 'border-emerald-500/30 bg-emerald-500/5 opacity-60'
                    : canAfford
                    ? 'border-border hover:border-primary/50 cursor-pointer'
                    : 'border-border opacity-50'
                }`}
                onClick={() => canAfford && !item.redeemed && handleRedeem(item)}
              >
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.redeemed && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${canAfford ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                    {item.cost} ⭐
                  </p>
                  {item.redeemed ? (
                    <span className="text-[10px] text-emerald-400">已兑换</span>
                  ) : redeeming === item.id ? (
                    <span className="text-[10px] text-muted-foreground">兑换中...</span>
                  ) : canAfford ? (
                    <span className="text-[10px] text-primary">点击兑换</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">积分不足</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && successItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">兑换成功！</p>
                <p className="text-xs text-emerald-400/70">
                  {successItem.emoji} {successItem.name} — 尽情享受吧！
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}