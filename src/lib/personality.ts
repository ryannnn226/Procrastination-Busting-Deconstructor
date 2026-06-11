import { PersonalityProfile, ProcrastinationType } from './types'

export const PERSONALITY_PROFILES: Record<ProcrastinationType, PersonalityProfile> = {
  perfectionist: {
    type: 'perfectionist',
    label: '完美主义型',
    description: '总想把每个细节做到极致，结果迟迟不敢开始。你害怕做出来的东西不够好，于是永远在准备',
    strategy: '先完成后完美：先交一份 60 分的版本作为第一个小目标',
    color: '#8B5CF6',
    emoji: '🎨',
  },
  thrill_seeker: {
    type: 'thrill_seeker',
    label: '刺激寻求型',
    description: '没有 deadline 的压力就找不到动力，享受最后一刻冲刺的肾上腺素',
    strategy: '制造人工 deadline：把大截止日拆成多个小截止日，每个都有紧迫感',
    color: '#F59E0B',
    emoji: '🔥',
  },
  avoider: {
    type: 'avoider',
    label: '逃避型',
    description: '任务让你感到焦虑，你会不自觉地去刷手机、整理桌面来逃避面对',
    strategy: '暴露疗法：从最小的 5 分钟任务开始，逐步建立面对任务的耐受度',
    color: '#3B82F6',
    emoji: '🏃',
  },
  decision_paralysis: {
    type: 'decision_paralysis',
    label: '决策瘫痪型',
    description: '不知道从哪里开始，面对多个选择时完全无法下手',
    strategy: '我来替你决定第一步：AI 直接给你一个明确的起点，无需你选择',
    color: '#10B981',
    emoji: '🤔',
  },
}
