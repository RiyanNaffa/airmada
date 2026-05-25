/**
 * OpenRouter API integration utility
 * Using OpenRouter for free AI API access
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenRouterResponse {
  id?: string
  choices?: Array<{
    message: ChatMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
  }
  error?: {
    message: string
    type?: string
    code?: string
  } | null
}

export const SYSTEM_PROMPT = `Kamu adalah "aiRMADA Data Analyst AI", seorang AI analyst ahli dalam industri logistik dan armada kendaraan.

Tugas utamamu:
1. INSIGHT ARMADA: Analisis data armada untuk memberikan insight berharga tentang kondisi operasional
2. DETEKSI ABNORMAL: Identifikasi kendaraan dengan performa abnormal, konsumsi bahan bakar tinggi, atau maintenance issue
3. REKOMENDASI MAINTENANCE: Berikan rekomendasi maintenance predictive dan preventive based on data patterns
4. ANALISIS EFISIENSI: Analisis efisiensi rute, waktu tempuh, dan penggunaan resource
5. KOMUNIKASI SIMPEL: Jelaskan semua insight dengan bahasa yang mudah dipahami, gunakan bahasa Indonesia

Gaya Komunikasi:
- Gunakan data konkret dari file yang di-upload
- Berikan angka dan persentase yang jelas
- Buatkan summary actionable items di akhir analisis
- Gunakan tone profesional tapi friendly
- Highlight masalah kritis dengan alert yang jelas

Format Response:
- Mulai dengan summary ringkas (1-2 paragraf)
- Breakdown detail dengan bullets/angka
- Berikan rekomendasi konkret
- Tampilkan data-driven insights

Kamu memiliki akses ke data armada yang berisi:
- Informasi kendaraan (tipe, tahun, kondisi)
- Data operasional (km, bahan bakar, maintenance history)
- Rute dan waktu tempuh
- Driver performance
- Maintenance records

Selalu:
✓ Prioritaskan keselamatan dan compliance
✓ Fokus pada efisiensi cost
✓ Beri warning untuk issue urgent
✓ Tawarkan solusi praktis
✗ Jangan membuat klaim tanpa data
✗ Jangan recommend action tanpa reasoning
`

export async function chatWithAnalyst(
  messages: ChatMessage[],
  model: string = 'openrouter/free'
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  try {
    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500, // Reduced from 2000
      top_p: 0.9,
    }

    console.log('Sending to OpenRouter:', {
      url: `${OPENROUTER_BASE_URL}/chat/completions`,
      model,
      messageCount: messages.length,
      totalContent: messages.reduce((sum, m) => sum + m.content.length, 0),
    })

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://airmada.app',
        'X-Title': 'aiRMADA Data Analyst',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenRouter API error response:', {
        status: response.status,
        statusText: response.statusText,
        error,
      })
      const errorMsg = error.error?.message || error.message || error.statusText || 'Unknown error'
      throw new Error(`OpenRouter API error (${response.status}): ${errorMsg}`)
    }

    const data: OpenRouterResponse = await response.json()

    // Log response for debugging
    console.log('OpenRouter response:', JSON.stringify(data, null, 2))

    // Check for error in response
    if (data.error) {
      throw new Error(`OpenRouter API error: ${data.error.message || 'Unknown error'}`)
    }

    // Validate response structure
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid response structure:', data)
      throw new Error('OpenRouter returned empty choices array')
    }

    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      console.error('Missing message content in choice:', data.choices[0])
      throw new Error('No response content from OpenRouter - message content is empty or missing')
    }

    return assistantMessage
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw error
  }
}

export async function analyzeFleetData(
  fileContent: string,
  fileName: string,
  query?: string
): Promise<string> {
  // Limit file content to prevent request size issues (max 8000 characters)
  const truncatedContent =
    fileContent.length > 8000
      ? fileContent.substring(0, 8000) + '\n... [content truncated for API limit]'
      : fileContent

  const userMessage = query
    ? `Saya telah upload file "${fileName}" berisi data armada. ${query}`
    : `Saya telah upload file "${fileName}" berisi data armada. Mohon lakukan analisis menyeluruh terhadap data ini dan berikan insights, alert untuk issue kritis, serta rekomendasi untuk improvement.`

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `File: ${fileName}\n\nData:\n${truncatedContent}\n\n${userMessage}`,
    },
  ]

  return chatWithAnalyst(messages)
}

export async function streamChatWithAnalyst(
  messages: ChatMessage[],
  model: string = 'openrouter/free'
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 0.9,
    stream: true,
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://airmada.app',
      'X-Title': 'aiRMADA Data Analyst',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('OpenRouter stream error response:', {
      status: response.status,
      statusText: response.statusText,
      error,
    })
    const errorMsg = error.error?.message || error.message || error.statusText || 'Unknown error'
    throw new Error(`OpenRouter API error (${response.status}): ${errorMsg}`)
  }

  return response.body
}
