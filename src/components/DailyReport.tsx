import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Task, ProcrastinationPoint } from '../lib/types'
import { loadHeatmap, saveHeatmap } from '../lib/storage'
import { Calendar, Clock, TrendingDown, Award, BarChart3 } from 'lucide-react'

interface Props {
  tasks: Task[]
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const HOUR_LABELS = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22']

export function DailyReport({ tasks }: Props) {
  const [heatmap, setHeatmap] = useState<ProcrastinationPoint[]>([])
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    setHeatmap(loadHeatmap())
  }, [])

  // Simulate tracking data based on tasks
  const today = new Date()
  const todayStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const totalCompletedToday = tasks.reduce((sum, t) => {
    const todaySubs = t.subtasks.filter(s => {
      // In a real app, we'd track completion timestamps
      return s.completed
    })
    return sum + todaySubs.length
  }, 0)

  const totalSlackOffs = tasks.length > 0 ? Math.max(1, Math.floor(Math.random() * 5)) : 0

  // Generate heatmap data
  const heatmapGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    heatmap.forEach(p => {
      if (p.day >= 0 && p.day < 7 && p.hour >= 0 && p.hour < 24) {
        grid[p.day][p.hour] = Math.max(grid[p.day][p.hour], p.level)
      }
    })
    // Add some demo data if empty
    if (heatmap.length === 0) {
      // Generate plausible procrastination pattern: highest in afternoon, lowest in morning
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          let level = 0
          if (h >= 14 && h <= 16) level = 6 + Math.floor(Math.random() * 4) // afternoon slump
          else if (h >= 21 && h <= 23) level = 4 + Math.floor(Math.random() * 3) // late night
          else if (h >= 9 && h <= 11) level = 1 + Math.floor(Math.random() * 2) // morning focus
          else level = Math.floor(Math.random() * 3)
          grid[d][h] = level
        }
      }
    }
    return grid
  }, [heatmap])

  const peakHour = useMemo(() => {
    let maxVal = 0
    let maxHour = 14
    for (let h = 0; h < 24; h++) {
      const sum = heatmapGrid.reduce((s, row) => s + row[h], 0)
      if (sum > maxVal) {
        maxVal = sum
        maxHour = h
      }
    }
    return maxHour
  }, [heatmapGrid])

  const getHeatColor = (level: number) => {
    if (level === 0) return 'bg-secondary/30'
    if (level <= 2) return 'bg-emerald-500/30'
    if (level <= 4) return 'bg-yellow-500/40'
    if (level <= 6) return 'bg-orange-500/50'
    if (level <= 8) return 'bg-red-500/60'
    return 'bg-red-600/80'
  }

  const streak = tasks.reduce((max, t) => Math.max(max, t.streak), 0)

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowReport(!showReport)}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="font-semibold text-sm">拖延改善成绩单</p>
            <p className="text-xs text-muted-foreground">{todayStr}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: showReport ? 180 : 0 }}
          className="text-muted-foreground"
        >
          ▼
        </motion.div>
      </button>

      {showReport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-3 p-5 rounded-xl border border-border bg-card space-y-5">
            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">今日完成</span>
                </div>
                <p className="text-2xl font-bold font-mono">{totalCompletedToday}</p>
                <p className="text-xs text-muted-foreground">个小关卡</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">摆烂次数</span>
                </div>
                <p className="text-2xl font-bold font-mono">{totalSlackOffs}</p>
                <p className="text-xs text-muted-foreground">次想放弃</p>
              </div>
            </div>

            {/* Peak procrastination time */}
            <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">最容易摆烂时段</p>
                <p className="text-lg font-bold text-yellow-400">
                  {peakHour}:00 - {peakHour + 2}:00
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  建议这个时段安排最简单的关卡 🎯
                </p>
              </div>
            </div>

            {/* Heatmap */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">7×24 摆烂热力图</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">低</span>
                  <div className="flex gap-0.5">
                    {[1, 3, 5, 7, 9].map(l => (
                      <div key={l} className={`w-3 h-3 rounded-sm ${getHeatColor(l)}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">高</span>
                </div>
              </div>
              {/* Hour labels */}
              <div className="flex mb-1 ml-8">
                {HOUR_LABELS.map(h => (
                  <span key={h} className="flex-1 text-[9px] text-muted-foreground text-center">{h}</span>
                ))}
              </div>
              {/* Grid */}
              <div className="space-y-0.5">
                {heatmapGrid.map((row, dayIdx) => (
                  <div key={dayIdx} className="flex items-center gap-1">
                    <span className="w-6 text-[10px] text-muted-foreground text-right shrink-0">
                      {DAY_LABELS[dayIdx]}
                    </span>
                    <div className="flex gap-0.5 flex-1">
                      {row.map((level, hourIdx) => (
                        <div
                          key={hourIdx}
                          className={`flex-1 h-4 rounded-sm ${getHeatColor(level)} transition-colors`}
                          title={`${DAY_LABELS[dayIdx]} ${hourIdx}:00 - 摆烂指数: ${level}/10`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis tip */}
            <div className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 <span className="font-medium text-foreground/80">AI 分析：</span>
                你在 <span className="text-yellow-400 font-medium">{peakHour}:00</span> 前后最容易摆烂， 
                连续打卡 <span className="text-emerald-400 font-medium">{streak}</span> 天。
                {streak >= 3
                  ? ' 势头不错，保持住这股劲！'
                  : ' 试试用"AI拉扯谈判"度过困难时段吧 💪'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
