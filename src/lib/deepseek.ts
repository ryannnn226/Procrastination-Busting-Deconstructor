import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  dangerouslyAllowBrowser: true,
})

const MODEL = 'deepseek-chat'

export async function chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 256,
  })
  return response.choices[0]?.message?.content || ''
}

export async function chatStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 256,
    stream: true,
  })
  let full = ''
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    full += text
    onChunk(text)
  }
  return full
}
