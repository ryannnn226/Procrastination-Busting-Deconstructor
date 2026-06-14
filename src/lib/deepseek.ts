import OpenAI from 'openai'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
})

const MODEL = 'deepseek-chat'

export class AIError extends Error {
  constructor(
    public code: 'no_key' | 'network' | 'api_error' | 'timeout' | 'parse_error',
    message: string,
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export function hasApiKey(): boolean {
  return API_KEY.length > 0
}

export async function chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  if (!API_KEY) {
    throw new AIError('no_key', 'DeepSeek API key is not configured.')
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await client.chat.completions.create(
      {
        model: MODEL,
        messages,
        temperature: 0.9,
        max_tokens: 1024,
      },
      { signal: controller.signal },
    )

    clearTimeout(timeout)
    return response.choices[0]?.message?.content || ''
  } catch (err: any) {
    clearTimeout(err?.signal ? 0 : 0) // no-op safety
    if (err?.name === 'AbortError') {
      throw new AIError('timeout', 'Request timed out. Please check your network and try again.')
    }
    if (err?.status === 401 || err?.status === 403) {
      throw new AIError('no_key', 'Invalid API key. Please check your DeepSeek API key.')
    }
    if (err?.status === 429) {
      throw new AIError('api_error', 'Rate limited. Please wait a moment and try again.')
    }
    if (err?.message?.includes('fetch') || err?.message?.includes('network') || err?.message?.includes('ENOTFOUND')) {
      throw new AIError('network', 'Network error. Please check your internet connection.')
    }
    throw new AIError('api_error', err?.message || 'API request failed. Please try again.')
  }
}

export async function chatStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
) {
  if (!API_KEY) {
    throw new AIError('no_key', 'DeepSeek API key is not configured.')
  }

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 1024,
      stream: true,
    })
    let full = ''
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      full += text
      onChunk(text)
    }
    return full
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) {
      throw new AIError('no_key', 'Invalid API key. Please check your DeepSeek API key.')
    }
    throw new AIError('api_error', err?.message || 'Stream request failed.')
  }
}