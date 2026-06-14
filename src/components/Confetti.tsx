
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#FFD54A','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8']
const EMOJIS = ['🎉','✨','⭐','🏆','💎','🌟','🎊','🔥']

interface Particle {
  id: number; x: number; y: number; color: string; emoji: string
  vx: number; vy: number; size: number; rotation: number; delay: number
}

export function Confetti({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!show) { setParticles([]); return }
    const items: Particle[] = []
    for (let i = 0; i < 40; i++) {
      items.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: -10 - Math.random() * 20,
        color: COLORS[i % COLORS.length],
        emoji: EMOJIS[i % EMOJIS.length],
        vx: (Math.random() - 0.5) * 120,
        vy: 80 + Math.random() * 160,
        size: 8 + Math.random() * 16,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
      })
    }
    setParticles(items)
    if (onDone) setTimeout(onDone, 2500)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: p.x + 'vw', y: p.y + 'vh', opacity: 1, rotate: 0, scale: 0 }}
              animate={{ x: (p.x + p.vx * 0.15) + 'vw', y: '105vh', opacity: [1, 1, 0], rotate: p.rotation + 360, scale: [0, p.size / 10, p.size / 10, 0] }}
              transition={{ duration: 2 + p.delay, ease: [0.22, 1, 0.36, 1], delay: p.delay }}
              className="absolute text-2xl"
              style={{ left: p.x + '%', fontSize: p.size + 'px' }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
