/**
 * Google Gemini API client — fallback jika Groq rate limit tercapai.
 * Model default: gemini-1.5-flash (gratis via Google AI Studio).
 *
 * @location apps/web/src/lib/ai/gemini.ts
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return _client
}

export async function geminiChat(systemPrompt: string, userMessage: string): Promise<string> {
  const client = getGeminiClient()
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContent(userMessage)
  return result.response.text()
}
