import { motion } from 'framer-motion'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={'rounded-xl bg-[hsl(var(--muted)/0.4)] overflow-hidden ' + className}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function SubtaskSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-2/3 mb-6" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-[18px] border border-[hsl(var(--border-glass))]">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-8 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}