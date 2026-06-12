import { chat } from './deepseek'
import { ProcrastinationType, Subtask, FutureScene, Difficulty } from './types'

// Feature 9: 拖延人格分析
export async function analyzePersonality(answers: string[]) {
  const prompt = `你是一个拖延心理学专家。根据以下问卷回答，判断用户的拖延人格类型（四选一：perfectionist完美主义 / thrill_seeker刺激寻求 / avoider逃避 / decision_paralysis决策瘫痪），并给出 50 字以内的温暖解读。

用户回答：
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

请只返回 JSON 格式：{"type":"...","reason":"..."}`

  const result = await chat([{ role: 'user', content: prompt }])
  try {
    const cleaned = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { type: 'avoider', reason: '看起来你有一点点逃避倾向，不过这很正常～' }
  }
}

// Feature 2: 生成未来之镜场景
export async function generateFutureScenes(taskName: string, deadline: string): Promise<FutureScene[]> {
  const prompt = `你是一个擅长场景化叙事的作家。用户有一个大任务："${taskName}"，截止日期是 ${deadline}。

请生成两个对比场景，用第二人称"你"来写，每个 80 字以内：

路线A（按时完成）：描述完成后的轻松感和成就感
路线B（一直拖延）：描述截止日前的焦虑和后悔

返回 JSON：[{"path":"A","title":"...","scene":"...","consequence":"..."},{"path":"B","title":"...","scene":"...","consequence":"..."}]`

  const result = await chat([{ role: 'user', content: prompt }])
  try {
    const cleaned = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return [
      { path: 'A', title: '按时完成的你', scene: '你提前交稿，合上电脑，长舒一口气。窗外阳光正好，你决定出门散步庆祝。', consequence: '轻松自在，充满掌控感' },
      { path: 'B', title: '拖延到最后的你', scene: '凌晨三点，咖啡已经凉了第四杯。你盯着只写了三分之一的文档，手指发抖。', consequence: '极度焦虑，身体被透支' },
    ]
  }
}

// 拆分任务
export async function decomposeTask(
  taskName: string,
  deadline: string,
  personality: ProcrastinationType,
): Promise<Subtask[]> {
  const strategies: Record<ProcrastinationType, string> = {
    perfectionist: '第一个子任务应该是"写一个粗糙版本"降低心理门槛',
    thrill_seeker: '给每个子任务加一个虚构的小截止时间，制造紧迫感',
    avoider: '第一个子任务不超过5分钟，极度容易完成',
    decision_paralysis: '第一个子任务要非常具体，直接告诉用户做什么',
  }

  const prompt = `把任务"${taskName}"（截止 ${deadline}）拆成 5-8 个小关卡（子任务），每关 10-20 分钟。
用户是「${personality}」型拖延者，拆分策略：${strategies[personality]}。

第1关必须是最简单、门槛最低的。最后1关标为 isBoss: true。
每关配一句 15 字以内的鼓励语作为 reward。
每关标注 difficulty: "easy" | "medium" | "hard" | "boss"，boss关固定为"boss"。
每关标注 points: 完成可获得的积分数（easy=10, medium=20, hard=30, boss=50）。

返回 JSON 数组：[{"title":"...","duration":15,"difficulty":"easy","isBoss":false,"points":10,"reward":"..."},...]`

  const result = await chat([{ role: 'user', content: prompt }])
  try {
    const cleaned = result.replace(/```json|```/g, '').trim()
    const subtasks: Partial<Subtask>[] = JSON.parse(cleaned)
    return subtasks.map((s, i) => ({
      id: `sub-${Date.now()}-${i}`,
      title: s.title || `第${i + 1}关`,
      duration: s.duration || 15,
      difficulty: (s.difficulty as Difficulty) || (s.isBoss ? 'boss' : i === 0 ? 'easy' : i < 3 ? 'medium' : 'hard'),
      completed: false,
      isBoss: s.isBoss || (i === subtasks.length - 1),
      unlocked: i === 0,
      points: s.points || (s.isBoss ? 50 : s.duration && s.duration <= 10 ? 10 : s.duration && s.duration <= 15 ? 20 : 30),
      reward: s.reward || '继续前进，你能行！',
    }))
  } catch {
    // Dynamic fallback based on task name
    const name = taskName
    return [
      { id: `sub-${Date.now()}-0`, title: `准备「${name}」所需的材料和工具`, duration: 5, difficulty: 'easy', completed: false, isBoss: false, unlocked: true, points: 10, reward: '准备就绪，万事开头易！' },
      { id: `sub-${Date.now()}-1`, title: `开始执行「${name}」的第一步`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: '已经动起来了，继续保持！' },
      { id: `sub-${Date.now()}-2`, title: `完成「${name}」的核心部分`, duration: 20, difficulty: 'hard', completed: false, isBoss: false, unlocked: false, points: 30, reward: '核心搞定了，胜利在望！' },
      { id: `sub-${Date.now()}-3`, title: `检查并完善「${name}」的成果`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: '精益求精！' },
      { id: `sub-${Date.now()}-4`, title: `收尾整理，完成「${name}」！`, duration: 10, difficulty: 'boss', completed: false, isBoss: true, unlocked: false, points: 50, reward: '最后一战，冲！' },
    ]
  }
}

// Feature 4: AI 拉扯谈判对话
export async function negotiateStay(
  taskName: string,
  personality: ProcrastinationType,
  reason: string,
  round: number,
) {
  const prompts: Record<ProcrastinationType, string> = {
    perfectionist: '用户是完美主义者，害怕做不好。不要硬劝，用"做个粗糙版也行"来降低门槛',
    thrill_seeker: '用户需要紧迫感。给 ta 一个很小的倒计时挑战',
    avoider: '用户想逃避。用极度微小的承诺（2分钟、打开文档就行）来引导',
    decision_paralysis: '用户不知从哪开始。直接替 ta 决定下一步，命令式语气',
  }

  const messages = [
    { role: 'system' as const, content: `你是一个温柔但坚定的拖延终结者AI。用户在任务"${taskName}"中想放弃，理由是"${reason}"。这是第 ${round} 轮谈判。${prompts[personality]}

规则：
- 第1轮：共情 + 提出缩短版的替代方案
- 第2轮：进一步让步，把任务缩到极小
- 第3轮：使用未来之镜对比，语气更严肃但不指责
- 第4轮+：使用幽默和自嘲，保持温暖

每次回复 40 字以内，口语化，带 emoji。最后加一句括号里的谈判条件，如「（做5分钟就行？）」` },
    { role: 'user' as const, content: `我想放弃了，理由是：${reason}` },
  ]

  return chat(messages)
}

// Feature 1: Boss 战鼓励
export async function bossEncouragement(taskName: string) {
  const prompt = `用户即将面对任务"${taskName}"的最终Boss关卡。写一段 60 字以内的热血战斗宣言，风格参考格斗游戏/热血动漫。带回车换行。`
  return chat([{ role: 'user', content: prompt }])
}

// Feature 6: 连胜鼓励文案
export async function streakQuote(streak: number, taskName: string) {
  const prompt = `用户已经连续 ${streak} 天打卡完成任务"${taskName}"。写一段 40 字以内的庆祝/鼓励文案，语气温暖有能量。`
  return chat([{ role: 'user', content: prompt }])
}