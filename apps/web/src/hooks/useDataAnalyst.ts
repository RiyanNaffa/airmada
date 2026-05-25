/**
 * Custom Hook for Data Analyst API
 * Simplifies integration of data analyst functionality in components
 *
 * Location: apps/web/src/hooks/useDataAnalyst.ts
 */
'use client'

import { useState, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AnalystResponse {
  success: boolean
  message?: string
  error?: string
  timestamp?: string
}

interface UploadResponse {
  success: boolean
  fileName?: string
  fileSize?: number
  analysis?: string
  sessionId?: string
  error?: string
}

interface UseDataAnalystReturn {
  // State
  messages: Message[]
  isLoading: boolean
  error: string | null
  fileName: string | null
  sessionId: string | null
  initialAnalysis: string | null

  // Methods
  uploadFile: (file: File) => Promise<UploadResponse>
  sendMessage: (content: string) => Promise<void>
  reset: () => void
  clearError: () => void
}

export function useDataAnalyst(): UseDataAnalystReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialAnalysis, setInitialAnalysis] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<UploadResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate file
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only CSV and Excel files are supported')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit')
      }

      // Upload
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai/analyst/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data: UploadResponse = await response.json()

      if (data.success) {
        setFileName(data.fileName || null)
        setSessionId(data.sessionId || null)
        setInitialAnalysis(data.analysis || null)

        if (data.analysis) {
          setMessages([
            {
              role: 'assistant',
              content: data.analysis,
            },
          ])
        }
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        setError('Message cannot be empty')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Add user message to state
        const userMessage: Message = {
          role: 'user',
          content,
        }

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)

        // Send to API
        const response = await fetch('/api/ai/analyst/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Chat request failed')
        }

        const data: AnalystResponse = await response.json()

        if (data.success && data.message) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.message,
          }

          setMessages((prev) => [...prev, assistantMessage])
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Chat request failed'
        setError(errorMessage)

        // Remove the user message if request failed
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [messages]
  )

  const reset = useCallback(() => {
    setMessages([])
    setIsLoading(false)
    setError(null)
    setFileName(null)
    setSessionId(null)
    setInitialAnalysis(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    fileName,
    sessionId,
    initialAnalysis,
    uploadFile,
    sendMessage,
    reset,
    clearError,
  }
}

/**
 * Example Usage:
 *
 * function MyComponent() {
 *   const {
 *     messages,
 *     isLoading,
 *     error,
 *     fileName,
 *     uploadFile,
 *     sendMessage,
 *     reset,
 *   } = useDataAnalyst()
 *
 *   const handleFileSelect = async (file: File) => {
 *     const result = await uploadFile(file)
 *     if (result.success) {
 *       console.log('Analysis:', result.analysis)
 *     }
 *   }
 *
 *   const handleSendMessage = async (msg: string) => {
 *     await sendMessage(msg)
 *   }
 *
 *   return (
 *     <div>
 *       {fileName && <p>File: {fileName}</p>}
 *       <input
 *         type="file"
 *         accept=".csv,.xlsx"
 *         onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
 *       />
 *       <div>
 *         {messages.map((msg, i) => (
 *           <div key={i}>
 *             <strong>{msg.role}:</strong> {msg.content}
 *           </div>
 *         ))}
 *       </div>
 *       <input
 *         type="text"
 *         placeholder="Ask analyst..."
 *         onKeyPress={(e) => {
 *           if (e.key === 'Enter') {
 *             handleSendMessage((e.target as HTMLInputElement).value)
 *             ;(e.target as HTMLInputElement).value = ''
 *           }
 *         }}
 *         disabled={isLoading}
 *       />
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </div>
 *   )
 * }
 */
