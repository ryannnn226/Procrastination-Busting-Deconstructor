import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { negotiateStay } from '../lib/ai'
import { ProcrastinationType } from '../lib/types'
import { X, MessageCircle, Send } from 'lucide-react'

interface Props {
  taskName: string
  personality: ProcrastinationType
  onStay: () => void
  onClose: () => void
}

interface Message {
  role: 'ai' | 'user'
  content: string
}

export function NegotiateDialog({ taskName, personality, onStay, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    setMessages([
      { role: 'ai', content: '等等！我感觉你想跑路...发生什么了？👀' }
    ])
  }, [])

  const handleSend = async (reason?: string) => {
    const userMsg = reason || input || '就是不想做了'
    if (!reason && !input.trim()) return

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMsg },
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const reply = await negotiateStay(taskName, personality, userMsg, round)

    // Check if user agreed to stay
    if (reply.includes('(达成') || round >= 5 || userMsg.includes('好') || userMsg.includes('行')) {
      setMessages([...newMessages, { role: 'ai', content: reply.replace(/\(.*?\)/g, '').trim() }])
      setTimeout(() => {
        setResolved(true)
        setTimeout(onStay, 1500)
      }, 800)
    } else {
      setMessages([...newMessages, { role: 'ai', content: reply }])
      setRound(r => r + 1)
    }
    setLoading(false)
  }

  const quickReasons = ['太难了', '没动力', '有别的事', '累了']

  if (resolved) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-2xl p-8 max-w-sm w-full text-center border border-emerald-500/30"
        >
          <p className="text-4xl mb-4">🤝</p>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">谈判成功！</h3>
          <p className="text-muted-foreground text-sm">回来继续战斗吧，你可以的 💪</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[hsl(var(--card))] rounded-[18px] border border-[hsl(var(--border-glass))] max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI 拉扯谈判</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[hsl(var(--gold))] text-[hsl(var(--primary-foreground))] rounded-br-md'
                    : 'bg-secondary rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary px-4 py-2.5 rounded-2xl rounded-bl-md">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Reasons */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickReasons.map(r => (
              <button
                key={r}
                onClick={() => handleSend(r)}
                className="px-3 py-1.5 text-xs rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {messages.length > 1 && (
          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="说说你的想法..."
              className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none text-sm"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
