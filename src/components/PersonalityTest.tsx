import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight } from 'lucide-react'

const QUESTIONS = [
  {
    q: '面对一个大任务时，你最常想到什么？',
    options: [
      { text: '我得先做好万全准备才能开始', type: 'perfectionist' },
      { text: '离 deadline 还远，到时候再说', type: 'thrill_seeker' },
      { text: '好焦虑，先刷会儿手机压压惊', type: 'avoider' },
      { text: '完全不知道从哪里下手...', type: 'decision_paralysis' },
    ],
  },
  {
    q: '任务做到一半卡住了，你会？',
    options: [
      { text: '反复修改前面的部分', type: 'perfectionist' },
      { text: '放着，等压力够大了自然会做完', type: 'thrill_seeker' },
      { text: '打开其他 app 转移注意力', type: 'avoider' },
      { text: '在几个方案之间来回纠结', type: 'decision_paralysis' },
    ],
  },
  {
    q: '你什么时候效率最高？',
    options: [
      { text: '一切准备就绪，环境完美的时候', type: 'perfectionist' },
      { text: 'deadline 前几小时的疯狂冲刺', type: 'thrill_seeker' },
      { text: '有人陪着/监督的时候', type: 'avoider' },
      { text: '有人明确告诉我第一步做什么的时候', type: 'decision_paralysis' },
    ],
  },
  {
    q: '想到「完成这个任务」，你的感受是？',
    options: [
      { text: '担心做得不够好', type: 'perfectionist' },
      { text: '没什么感觉，反正最后能搞定', type: 'thrill_seeker' },
      { text: '胃开始不舒服', type: 'avoider' },
      { text: '脑子一片空白', type: 'decision_paralysis' },
    ],
  },
  {
    q: '如果给你 25 分钟专注时间，你会？',
    options: [
      { text: '花 10 分钟调整格式排版', type: 'perfectionist' },
      { text: '花 20 分钟酝酿，最后 5 分钟爆发', type: 'thrill_seeker' },
      { text: '先看看有没有新消息再说', type: 'avoider' },
      { text: '不知道该先做什么而呆坐', type: 'decision_paralysis' },
    ],
  },
]

interface Props {
  onDone: (answers: string[]) => void
}

export function PersonalityTest({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type]
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      onDone(newAnswers)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <Brain className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold mb-2">先来认识一下你的拖延人格</h2>
        <p className="text-muted-foreground text-sm">
          5 道题，帮你找到拖延的根源，这样我才能用对的方式帮你
        </p>
        <div className="flex justify-center gap-1.5 mt-4">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step ? 'bg-primary' : i === step ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <h3 className="text-lg font-medium mb-6 text-center">
            {QUESTIONS[step].q}
          </h3>
          <div className="space-y-3">
            {QUESTIONS[step].options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(opt.type)}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span>{opt.text}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
