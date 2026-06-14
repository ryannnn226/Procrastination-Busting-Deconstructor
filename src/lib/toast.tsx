import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Trophy, Sparkles, AlertCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'achievement' | 'xp'

interface Toast {
  id: number
  message: string
  type: ToastType
  sub?: string
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, sub?: string) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success', sub?: string) => {
    const id = nextId++
    setToasts(prev => [...prev.slice(-3), { id, message, type, sub }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const iconMap: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    achievement: <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />,
    xp: <Sparkles className="w-4 h-4 text-[hsl(var(--gold))]" />,
  }

  const bgMap: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    achievement: 'border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)]',
    xp: 'border-[hsl(var(--gold)/0.2)] bg-[hsl(var(--gold)/0.05)]',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[14px] border backdrop-blur-xl shadow-lg min-w-[260px] max-w-[380px] ' + bgMap[t.type]}
            >
              <div className="shrink-0 mt-0.5">{iconMap[t.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t.message}</p>
                {t.sub && <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}