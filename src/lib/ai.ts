import { chat } from './deepseek'
import { ProcrastinationType, Subtask, FutureScene, Difficulty } from './types'
import type { Lang } from './i18n'

export async function analyzePersonality(answers: string[], lang: Lang = 'zh') {
  const isEn = lang === 'en'
  const prompt = isEn
    ? `You are a procrastination psychology expert. Based on the following questionnaire answers, determine the user's procrastination personality type (choose one: perfectionist / thrill_seeker / avoider / decision_paralysis), and provide a warm interpretation under 50 words.
User answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Return ONLY JSON format: {"type":"...","reason":"..."}`
    : `你是一个拖延心理学专家。根据以下问卷回答，判断用户的拖延人格类型（四选一：perfectionist完美主义 / thrill_seeker刺激寻求 / avoider逃避 / decision_paralysis决策瘫痪），并给出 50 字以内的温暖解读。
用户回答：
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

请只返回 JSON 格式：{"type":"...","reason":"..."}`

  const result = await chat([{ role: 'user', content: prompt }])
  try {
    const cleaned = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { type: 'avoider', reason: isEn ? 'Looks like you have a slight avoidance tendency, but that\'s totally normal~' : '看起来你有一点点逃避倾向，不过这很正常～' }
  }
}

export async function generateFutureScenes(taskName: string, deadline: string, lang: Lang = 'zh'): Promise<FutureScene[]> {
  const isEn = lang === 'en'
  const prompt = isEn
    ? `You are a writer skilled in scenario storytelling. The user has a big task: "${taskName}", with a deadline of ${deadline}.
Generate two contrasting scenes, written in second person ("you"), each under 80 words:

Path A (Completed on time): Describe the relief and sense of achievement after completion
Path B (Procrastinated): Describe the anxiety and regret right before the deadline

Return JSON: [{"path":"A","title":"...","scene":"...","consequence":"..."},{"path":"B","title":"...","scene":"...","consequence":"..."}]`
    : `你是一个擅长场景化叙事的作家。用户有一个大任务："${taskName}"，截止日期是 ${deadline}。
请生成两个对比场景，用第二人称"你"来写，每个 80 字以内：

路线A（按时完成）：描述完成后的轻松感和成就感
路线B（一直拖延）：描述截止日前的焦虑和后悔

返回 JSON：[{"path":"A","title":"...","scene":"...","consequence":"..."},{"path":"B","title":"...","scene":"...","consequence":"..."}]`

  const result = await chat([{ role: 'user', content: prompt }])
  try {
    const cleaned = result.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return isEn
      ? [
          { path: 'A', title: 'The You Who Finished On Time', scene: 'You submit early, close your laptop, and breathe a long sigh of relief. Sunlight streams through the window as you head out to celebrate.', consequence: 'Light and free, full of control' },
          { path: 'B', title: 'The You Who Procrastinated', scene: '3 AM. Your fourth cup of coffee has gone cold. You stare at a document only one-third done, fingers trembling on the keyboard.', consequence: 'Extreme anxiety, body exhausted' },
        ]
      : [
          { path: 'A', title: '按时完成的你', scene: '你提前交稿，合上电脑，长舒一口气。窗外阳光正好，你决定出门散步庆祝。', consequence: '轻松自在，充满掌控感' },
          { path: 'B', title: '拖延到最后的你', scene: '凌晨三点，咖啡已经凉了第四杯。你盯着只写了三分之一的文档，手指发抖。', consequence: '极度焦虑，身体被透支' },
        ]
  }
}

export async function decomposeTask(
  taskName: string,
  deadline: string,
  personality: ProcrastinationType,
  lang: Lang = 'zh',
): Promise<Subtask[]> {
  const isEn = lang === 'en'
  const strategies: Record<ProcrastinationType, { zh: string; en: string }> = {
    perfectionist: { zh: '第一个子任务应该是"写一个粗糙版本"降低心理门槛', en: 'First subtask should be "write a rough draft" to lower the mental barrier' },
    thrill_seeker: { zh: '给每个子任务加一个虚构的小截止时间，制造紧迫感', en: 'Add a fake mini-deadline to each subtask to create urgency' },
    avoider: { zh: '第一个子任务不超过 5 分钟，极度容易完成', en: 'First subtask should be under 5 minutes, extremely easy to complete' },
    decision_paralysis: { zh: '第一个子任务要非常具体，直接告诉用户做什么', en: 'First subtask must be very specific, tell the user exactly what to do' },
  }

  const strategy = strategies[personality] || strategies.avoider
  const prompt = isEn
    ? `Break down the task "${taskName}" (deadline: ${deadline}) into 5-8 small quests (subtasks), each 10-20 minutes.
The user is a "${personality}" type procrastinator. Decomposition strategy: ${strategy.en}
The 1st quest MUST be the easiest, lowest-barrier one. The last quest should have isBoss: true.
Each quest gets a 15-word encouragement as "reward".
Each quest has difficulty: "easy" | "medium" | "hard" | "boss" (boss quest is always "boss").
Each quest has points: easy=10, medium=20, hard=30, boss=50.
Return JSON array: [{"title":"...","duration":15,"difficulty":"easy","isBoss":false,"points":10,"reward":"..."},...]`
    : `把任务"${taskName}"（截止 ${deadline}）拆成 5-8 个小关卡（子任务），每关 10-20 分钟。
用户是「${personality}」型拖延者，拆分策略：${strategy.zh}
第 1 关必须是最简单、门槛最低的。最后 1 关标注 isBoss: true。
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
      title: s.title || (isEn ? `Quest ${i + 1}` : `第${i + 1}关`),
      duration: s.duration || 15,
      difficulty: (s.difficulty as Difficulty) || (s.isBoss ? 'boss' : i === 0 ? 'easy' : i < 3 ? 'medium' : 'hard'),
      completed: false,
      isBoss: s.isBoss || (i === subtasks.length - 1),
      unlocked: i === 0,
      points: s.points || (s.isBoss ? 50 : s.duration && s.duration <= 10 ? 10 : s.duration && s.duration <= 15 ? 20 : 30),
      reward: s.reward || (isEn ? 'Keep going, you got this!' : '继续前进，你能行！'),
    }))
  } catch {
    const name = taskName
    return isEn
      ? [
          { id: `sub-${Date.now()}-0`, title: `Gather materials & tools for "${name}"`, duration: 5, difficulty: 'easy', completed: false, isBoss: false, unlocked: true, points: 10, reward: "Getting ready — the hardest part is starting!" },
          { id: `sub-${Date.now()}-1`, title: `Execute the first step of "${name}"`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: "You've started! Keep the momentum!" },
          { id: `sub-${Date.now()}-2`, title: `Complete the core part of "${name}"`, duration: 20, difficulty: 'hard', completed: false, isBoss: false, unlocked: false, points: 30, reward: "Core done! Victory is in sight!" },
          { id: `sub-${Date.now()}-3`, title: `Review & polish "${name}"`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: "Refine to perfection!" },
          { id: `sub-${Date.now()}-4`, title: `Final wrap-up — finish "${name}"!`, duration: 10, difficulty: 'boss', completed: false, isBoss: true, unlocked: false, points: 50, reward: "The final battle — GO!" },
        ]
      : [
          { id: `sub-${Date.now()}-0`, title: `准备「${name}」所需的材料和工具`, duration: 5, difficulty: 'easy', completed: false, isBoss: false, unlocked: true, points: 10, reward: '准备就绪，万事开头易！' },
          { id: `sub-${Date.now()}-1`, title: `开始执行「${name}」的第一步`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: '已经动起来了，继续保持！' },
          { id: `sub-${Date.now()}-2`, title: `完成「${name}」的核心部分`, duration: 20, difficulty: 'hard', completed: false, isBoss: false, unlocked: false, points: 30, reward: '核心搞定了，胜利在望！' },
          { id: `sub-${Date.now()}-3`, title: `检查并完善「${name}」的成果`, duration: 15, difficulty: 'medium', completed: false, isBoss: false, unlocked: false, points: 20, reward: '精益求精！' },
          { id: `sub-${Date.now()}-4`, title: `收尾整理，完成「${name}」！`, duration: 10, difficulty: 'boss', completed: false, isBoss: true, unlocked: false, points: 50, reward: '最后一战，冲！' },
        ]
  }
}

export async function negotiateStay(
  taskName: string,
  personality: ProcrastinationType,
  reason: string,
  round: number,
  lang: Lang = 'zh',
) {
  const isEn = lang === 'en'
  const prompts: Record<ProcrastinationType, { zh: string; en: string }> = {
    perfectionist: { zh: '用户是完美主义者，害怕做不好。不要硬劝，用"做个粗糙版也行"来降低门槛', en: 'User is a perfectionist, afraid of not doing well. Don\'t push hard — use "a rough draft is fine too" to lower the barrier' },
    thrill_seeker: { zh: '用户需要紧迫感。给 ta 一个很小的倒计时挑战', en: 'User needs urgency. Give them a tiny countdown challenge' },
    avoider: { zh: '用户想逃避。用极度微小的承诺（2分钟、打开文档就行）来引导', en: 'User wants to escape. Use extremely tiny commitments (2 minutes, just open the doc) to guide them' },
    decision_paralysis: { zh: '用户不知从哪开始。直接替 ta 决定下一步，命令式语气', en: 'User doesn\'t know where to start. Decide the next step for them, use commanding tone' },
  }

  const p = prompts[personality] || prompts.avoider
  const messages = [
    { role: 'system' as const, content: isEn
      ? `You are a warm but firm procrastination-terminator AI. The user wants to give up on task "${taskName}", reason: "${reason}". This is round ${round} of negotiation.
${p.en}

Rules:
- Round 1: Empathize + offer a shortened alternative
- Round 2: Compromise further, shrink task to minimal
- Round 3: Use future-mirror contrast, tone more serious but not blaming
- Round 4+: Use humor and self-deprecation, stay warm
Each reply under 40 words, conversational, with emoji. End with a negotiation condition in parentheses, e.g. "(Just 2 minutes?)"`
      : `你是一个温柔但坚定的拖延终结者AI。用户在任务"${taskName}"中想放弃，理由是"${reason}"。这是第 ${round} 轮谈判。
${p.zh}

规则：
- 第 1 轮：共情 + 提出缩短版的替代方案
- 第 2 轮：进一步让步，把任务缩到极小
- 第 3 轮：使用未来之镜对比，语气更严肃但不指责
- 第 4 轮+：使用幽默和自嘲，保持温暖
每次回复 40 字以内，口语化，带 emoji。最后加一句括号里的谈判条件，如「（做 2 分钟就行？）」`
    },
    { role: 'user' as const, content: isEn ? `I want to give up, reason: ${reason}` : `我想放弃了，理由是：${reason}` },
  ]

  return chat(messages)
}

export async function bossEncouragement(taskName: string, lang: Lang = 'zh') {
  const isEn = lang === 'en'
  const prompt = isEn
    ? `The user is about to face the final Boss quest for task "${taskName}". Write a 60-word battle declaration in the style of fighting games/anime. Include line breaks.`
    : `用户即将面对任务"${taskName}"的最终Boss关卡。写一段 60 字以内的热血战斗宣言，风格参考格斗游戏/热血动漫。带回车换行。`

  return chat([{ role: 'user', content: prompt }])
}

export async function streakQuote(streak: number, taskName: string, lang: Lang = 'zh') {
  const isEn = lang === 'en'
  const prompt = isEn
    ? `The user has completed task "${taskName}" for ${streak} consecutive days. Write a 40-word celebration/encouragement, warm and energetic.`
    : `用户已经连续 ${streak} 天打卡完成任务"${taskName}"。写一段 40 字以内的庆祝/鼓励文案，语气温暖有能量。`

  return chat([{ role: 'user', content: prompt }])
}
