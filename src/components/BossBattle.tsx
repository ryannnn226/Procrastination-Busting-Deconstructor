import { useT } from '../lib/i18n.tsx'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '../lib/types'
import { bossEncouragement, streakQuote } from '../lib/ai'
import { Skull, Shield, Sword, Timer, Heart, PartyPopper } from 'lucide-react'

interface Props {
  task: Task
  onDefeated: () => void
  onRetreat: () => void
}

const getBossNames = (t: (k: string) => string) => [t('boss.name1'), t('boss.name2'), t('boss.name3'), t('boss.name4'), t('boss.name5')]

export function BossBattle({ task, onDefeated, onRetreat }: Props) {
  const { t, lang } = useT()
  const [phase, setPhase] = useState<'intro' | 'battle' | 'victory'>('intro')
  const [bossHp, setBossHp] = useState(100)
  const [playerHp, setPlayerHp] = useState(100)
  const [timer, setTimer] = useState(25 * 60) // 25 min
  const [started, setStarted] = useState(false)
  const [encouragement, setEncouragement] = useState('')
  const [bossName] = useState(() => getBossNames(t)[Math.floor(Math.random() * 5)])
  const [showConfetti, setShowConfetti] = useState(false)
  const [hitEffect, setHitEffect] = useState<'player' | 'boss' | null>(null)

  useEffect(() => {
    bossEncouragement(task.name, lang).then(setEncouragement)
  }, [task.name])

  useEffect(() => {
    if (!started) return
    if (timer <= 0) {
      // Time's up - player wins if boss HP < 50
      if (bossHp <= 50) {
        setShowConfetti(true)
        setPhase('victory')
        setTimeout(onDefeated, 3000)
      }
      return
    }
    const interval = setInterval(() => {
      setTimer(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [started, timer])

  // Boss attacks periodically
  useEffect(() => {
    if (!started || bossHp <= 0) return
    const interval = setInterval(() => {
      setPlayerHp(p => {
        const damage = Math.floor(Math.random() * 8) + 3
        setHitEffect('player')
        setTimeout(() => setHitEffect(null), 500)
        const newPlayerHp = Math.max(0, p - damage)
        if (newPlayerHp <= 0) {
          // Player defeated - not game over, but retreat
          setTimeout(onRetreat, 2000)
        }
        return newPlayerHp
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [started])  // eslint-disable-line

  const handleAttack = () => {
    if (!started) {
      setStarted(true)
      setPhase('battle')
      return
    }
    const damage = Math.floor(Math.random() * 15) + 10
    setHitEffect('boss')
    setTimeout(() => setHitEffect(null), 500)
    setBossHp(b => {
      const newHp = Math.max(0, b - damage)
      if (newHp <= 0) {
        setTimeout(() => {
          setShowConfetti(true)
          setPhase('victory')
          setTimeout(onDefeated, 3000)
        }, 100)
      }
      return newHp
    })
  }

  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'intro' && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Skull className="w-full h-full text-red-500 animate-glow" />
          </motion.div>

          <h2 className="text-3xl font-black mb-2 text-red-500">
            {t('boss.title')}
          </h2>
          <p className="text-xl font-bold mb-1">
            VS <span className="text-red-400">{bossName}</span>
          </p>
          <p className="text-muted-foreground text-sm mb-2">
            {t('boss.finalQuest')}：{task.subtasks.find(s => s.isBoss)?.title}
          </p>

          {encouragement && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm italic text-primary/80 mb-6 whitespace-pre-line"
            >
              "{encouragement}"
            </motion.p>
          )}

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAttack}
              className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
            >
              {t('boss.fight')}
            </motion.button>
            <button
              onClick={onRetreat}
              className="px-6 py-4 border border-border rounded-2xl text-muted-foreground hover:bg-secondary transition-colors"
            >
              {t('boss.retreat')}
            </button>
          </div>
        </motion.div>
      )}

      {phase === 'battle' && (
        <motion.div
          key="battle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto boss-mode"
        >
          {/* Timer */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
              <Timer className={`w-4 h-4 ${timer < 300 ? 'text-red-400 animate-pulse' : 'text-red-400'}`} />
              <span className="font-mono font-bold text-red-400 text-lg">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Boss HP */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skull className="w-6 h-6 text-red-500" />
                <span className="font-bold text-red-400">{bossName}</span>
              </div>
              <span className="font-mono font-bold">{bossHp}%</span>
            </div>
            <div className="h-4 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-600 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${bossHp}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* VS */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`text-4xl font-black ${hitEffect === 'boss' ? 'text-red-500' : 'text-foreground/30'}`}
            >
              VS
            </motion.div>
          </div>

          {/* Player HP */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-blue-400">{t('boss.you')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${playerHp < 30 ? 'text-red-400 animate-pulse' : 'text-red-400'}`} />
                <span className="font-mono font-bold">{playerHp}%</span>
              </div>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${playerHp > 50 ? 'bg-emerald-500' : playerHp > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${playerHp}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Attack Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAttack}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-3"
          >
            <Sword className="w-6 h-6" />
            {t('boss.attack')}
          </motion.button>

          {/* Retreat */}
          <button
            onClick={onRetreat}
            className="w-full mt-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('boss.retreatMsg')}
          </button>
        </motion.div>
      )}

      {phase === 'victory' && (
        <motion.div
          key="victory"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-black text-yellow-400 mb-2">
            {t('boss.defeated')}
          </h2>
          <p className="text-xl font-bold mb-1">{bossName} {t('boss.defeatedMsg')}</p>
          <p className="text-muted-foreground text-sm mb-4">
            {t('boss.congrats')}「{task.name}」
          </p>

          {/* Confetti Particles */}
          {showConfetti && (
            <div className="relative h-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#f43f5e', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: 40,
                  }}
                  animate={{
                    y: -100 - Math.random() * 100,
                    x: (Math.random() - 0.5) * 100,
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
