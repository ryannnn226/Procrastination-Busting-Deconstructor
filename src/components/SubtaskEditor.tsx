
import { useT } from '../lib/i18n.tsx'
import { SubtaskSkeleton } from './Skeleton'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Subtask, Difficulty } from '../lib/types'
import { Edit3, Trash2, Plus, ChevronUp, ChevronDown, Check, X, Clock, Star } from 'lucide-react'

const DIFFICULTY_CONFIG: Record<Difficulty, { labelKey: string; color: string; bg: string; points: number }> = {
  easy: { labelKey: 'subtask.easy', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', points: 10 },
  medium: { labelKey: 'subtask.medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', points: 20 },
  hard: { labelKey: 'subtask.hard', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', points: 30 },
  boss: { labelKey: 'diff.boss', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', points: 50 },
}

interface Props {
  isLoading?: boolean
  subtasks: Subtask[]
  onConfirm: (subtasks: Subtask[]) => void
  onBack: () => void
  onRegenerate: () => Promise<void>
  version?: number
}

export function SubtaskEditor({ subtasks, onConfirm, onBack, onRegenerate, version, isLoading }: Props) {
  const { t } = useT()
  const [items, setItems] = useState<Subtask[]>(subtasks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDuration, setEditDuration] = useState(15)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    setItems(subtasks)
  }, [version])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('medium')

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return
    const updated = [...items]; [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
    setItems(updated)
  }
  const handleMoveDown = (idx: number) => {
    if (idx === items.length - 1) return
    const updated = [...items]; [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]
    setItems(updated)
  }
  const handleDelete = (id: string) => setItems(items.filter(i => i.id !== id))
  const handleStartEdit = (item: Subtask) => { setEditingId(item.id); setEditTitle(item.title); setEditDuration(item.duration) }
  const handleSaveEdit = () => {
    setItems(items.map(i => i.id === editingId ? { ...i, title: editTitle, duration: editDuration } : i))
    setEditingId(null)
  }
  const handleAdd = () => {
    if (!newTitle.trim()) return
    const item: Subtask = {
      id: 'custom-' + Date.now(), title: newTitle.trim(), duration: 15, difficulty: newDifficulty,
      completed: false, isBoss: false, unlocked: true, points: DIFFICULTY_CONFIG[newDifficulty].points,
    }
    setItems([...items, item])
    setNewTitle(''); setShowAdd(false)
  }

  const totalPoints = items.reduce((s, i) => s + (i.points || 10), 0)
  const totalMinutes = items.reduce((s, i) => s + i.duration, 0)

  if (isLoading) return <div className="max-w-2xl mx-auto"><SubtaskSkeleton /></div>

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <Edit3 className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h2 className="text-xl font-bold mb-1">{t('subtask.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtask.desc')}</p>
        <div className="flex justify-center gap-4 mt-3">
          <span className="text-xs text-muted-foreground"><Clock className="w-3 h-3 inline mr-1" />{totalMinutes}{t('subtask.minutes')}</span>
          <span className="text-xs text-muted-foreground"><Star className="w-3 h-3 inline mr-1" />{totalPoints}{t('subtask.points')}</span>
          <span className="text-xs text-muted-foreground">{items.length}{t('subtask.quests')}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {items.map((item, idx) => {
            const diff = DIFFICULTY_CONFIG[item.difficulty]
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className={'flex items-center gap-2 p-3 rounded-xl border ' + diff.bg}>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => handleMoveUp(idx)} className="p-0.5 hover:bg-secondary/50 rounded"><ChevronUp className="w-3 h-3 text-muted-foreground" /></button>
                  <button onClick={() => handleMoveDown(idx)} className="p-0.5 hover:bg-secondary/50 rounded"><ChevronDown className="w-3 h-3 text-muted-foreground" /></button>
                </div>
                <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded bg-secondary border border-border focus:border-primary focus:outline-none" autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} />
                      <input type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm rounded bg-secondary border border-border focus:border-primary focus:outline-none" min={5} max={60} />
                      <button onClick={handleSaveEdit} className="p-1 text-emerald-400 hover:bg-secondary rounded"><Check className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate">{item.title}</span>
                      <span className={'text-[10px] px-1.5 py-0.5 rounded-full font-medium ' + diff.bg + ' ' + diff.color}>{t(diff.labelKey)}</span>
                      {item.isBoss && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">BOSS</span>}
                      <span className="text-[10px] text-muted-foreground ml-auto">+{item.points || 10}{t('subtask.xp')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground w-8 text-right">{item.duration}min</span>
                  <button onClick={() => handleStartEdit(item)} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {showAdd ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 rounded-[18px] border border-dashed border-primary/50 bg-primary/5">
          <div className="flex gap-2 mb-2">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t('subtask.newQuestPlaceholder')}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as Difficulty)}
              className="px-2 py-2 text-sm rounded-lg bg-secondary border border-border">
              <option value="easy">{t('subtask.easy')}</option><option value="medium">{t('subtask.medium')}</option><option value="hard">{t('subtask.hard')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">{t('subtask.add')}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
        </motion.div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full mb-4 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" />{t('subtask.addCustom')}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">{t('common.back')}</button>
        <button
          onClick={() => { setRegenerating(true); onRegenerate().finally(() => setRegenerating(false)) }}
          disabled={regenerating}
          className="px-4 py-3 border border-border rounded-xl text-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
        >
          {regenerating ? t('subtask.regenerating') : t('subtask.regenerate')}
        </button>
        <button onClick={() => onConfirm(items)}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
          {t('subtask.confirm')}
        </button>
      </div>
    </div>
  )
}
