/**
 * Test Data Analyst API Integration
 *
 * Location: apps/web/tests/data-analyst-api.test.ts
 * Run: npm run test -- data-analyst-api.test.ts
 */

describe('aiRMADA Data Analyst API', () => {
  const BASE_URL = 'http://localhost:3000/api/ai/analyst'

  describe('POST /api/ai/analyst/upload', () => {
    it('should upload CSV file and return analysis', async () => {
      const csvContent = `No,Plat Nomor,Tipe Kendaraan,Kondisi,KM,Konsumsi BBM
1,B 1234 ABC,Truck,Good,250000,8.5
2,B 5678 DEF,Truck,Fair,350000,6.2`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'test-fleet.csv', { type: 'text/csv' })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.fileName).toBe('test-fleet.csv')
      expect(data.analysis).toBeDefined()
      expect(data.sessionId).toBeDefined()
      expect(data.analysis.length).toBeGreaterThan(0)
    })

    it('should reject unsupported file types', async () => {
      const blob = new Blob(['not a csv'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('CSV and Excel')
    })

    it('should reject files larger than 10MB', async () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('x').join('')
      const blob = new Blob([largeContent], { type: 'text/csv' })
      const file = new File([blob], 'large.csv', { type: 'text/csv' })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('10MB')
    })
  })

  describe('POST /api/ai/analyst/chat', () => {
    it('should return AI response for valid messages', async () => {
      const messages = [
        {
          role: 'user',
          content: 'Berapa rata-rata konsumsi BBM armada berdasarkan data yang di-upload?',
        },
      ]

      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBeDefined()
      expect(data.message.length).toBeGreaterThan(0)
      expect(data.timestamp).toBeDefined()
    })

    it('should handle conversation history', async () => {
      const messages = [
        {
          role: 'user',
          content: 'Analisis kondisi armada kami.',
        },
        {
          role: 'assistant',
          content: 'Berdasarkan data armada Anda, rata-rata konsumsi BBM adalah 7.5 KM/L...',
        },
        {
          role: 'user',
          content: 'Kendaraan mana yang konsumsinya paling tinggi?',
        },
      ]

      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBeDefined()
    })

    it('should reject empty messages array', async () => {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [] }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('empty')
    })

    it('should reject invalid message format', async () => {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: 'not an array' }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid')
    })
  })
})

/**
 * Integration Test - Full Flow
 */
describe('Data Analyst - Full Integration', () => {
  it('should complete full workflow: upload -> analyze -> chat', async () => {
    const BASE_URL = 'http://localhost:3000/api/ai/analyst'

    // Step 1: Upload file
    const csvContent = `No,Plat Nomor,Tipe Kendaraan,Tahun,Kondisi,Total KM,Konsumsi BBM
1,B 1234 ABC,Truck,2020,Good,250000,8.5
2,B 5678 DEF,Truck,2019,Fair,350000,6.2
3,B 9012 GHI,Van,2021,Excellent,180000,12.1
4,B 3456 JKL,Truck,2018,Poor,420000,5.1`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const file = new File([blob], 'fleet-test.csv', { type: 'text/csv' })

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const uploadResponse = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    expect(uploadResponse.status).toBe(200)
    const uploadData = await uploadResponse.json()
    expect(uploadData.success).toBe(true)
    expect(uploadData.analysis).toBeDefined()

    // Step 2: Ask follow-up question
    const chatMessages = [
      {
        role: 'user',
        content: uploadData.analysis, // Include initial analysis in context
      },
      {
        role: 'assistant',
        content: uploadData.analysis,
      },
      {
        role: 'user',
        content: 'Kendaraan mana yang perlu urgent maintenance?',
      },
    ]

    const chatResponse = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: chatMessages }),
    })

    expect(chatResponse.status).toBe(200)
    const chatData = await chatResponse.json()
    expect(chatData.success).toBe(true)
    expect(chatData.message).toBeDefined()
    expect(chatData.message.length).toBeGreaterThan(0)
  })
})

/**
 * Manual Testing Guide (cURL)
 */

/*
1. UPLOAD FILE:

curl -X POST http://localhost:3000/api/ai/analyst/upload \
  -F "file=@SAMPLE_FLEET_DATA.csv"

Expected Response:
{
  "success": true,
  "fileName": "SAMPLE_FLEET_DATA.csv",
  "fileSize": 3456,
  "analysis": "Berdasarkan analisis data armada Anda...",
  "sessionId": "session_1234567890"
}

---

2. CHAT WITH ANALYST:

curl -X POST http://localhost:3000/api/ai/analyst/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Kendaraan mana yang paling efisien?"
      }
    ]
  }'

Expected Response:
{
  "success": true,
  "message": "Berdasarkan data yang Anda berikan...",
  "timestamp": "2024-01-20T10:30:00Z"
}

---

3. CONVERSATION WITH HISTORY:

curl -X POST http://localhost:3000/api/ai/analyst/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Analisis data armada saya"
      },
      {
        "role": "assistant",
        "content": "Berdasarkan data armada Anda yang terdiri dari 15 kendaraan..."
      },
      {
        "role": "user",
        "content": "Berapa total investment untuk maintenance bulan depan?"
      }
    ]
  }'
*/
