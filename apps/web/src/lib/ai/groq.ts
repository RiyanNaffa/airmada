/**
 * Groq API client dan helper untuk chat completion.
 * Model default: llama3-8b-8192 (gratis, 30 req/min).
 *
 * @location apps/web/src/lib/ai/groq.ts
 */
import Groq from 'groq-sdk'

let _client: Groq | null = null

export function getGroqClient(): Groq {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set')
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _client
}

export async function groqChat(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const client = getGroqClient()
  const model = process.env.GROQ_MODEL ?? 'llama3-8b-8192'

  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1024,
    temperature: 0.3,
  })

  return res.choices[0]?.message?.content ?? ''
}
