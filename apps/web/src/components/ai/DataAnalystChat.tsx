/**
 * DataAnalystChat Component
 *
 * @location apps/web/src/components/ai/DataAnalystChat.tsx
 * Modal layout untuk AI Data Analyst sesuai dengan design spec.
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Send, X, Loader } from 'lucide-react'
import { ChatMessage } from './ChatMessage'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UploadState {
  fileName: string | null
  isLoading: boolean
  error: string | null
  analysis: string | null
  sessionId: string | null
}

export function DataAnalystChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({
    fileName: null,
    isLoading: false,
    error: null,
    analysis: null,
    sessionId: null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileUpload = async (file: File | null) => {
    if (!file) return

    setUploadState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai/analyst/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload gagal')
      }

      const data = await response.json()

      setUploadState({
        fileName: file.name,
        isLoading: false,
        error: null,
        analysis: data.analysis,
        sessionId: data.sessionId,
      })

      const analysisMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.analysis || 'Data berhasil diupload. Silakan tanyakan tentang armada Anda.',
        timestamp: new Date(),
      }

      setMessages([analysisMessage])

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Upload gagal',
      }))
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    handleFileUpload(file)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !uploadState.fileName) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/analyst/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chat gagal')
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Gagal mendapatkan respons',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading) {
        handleSendMessage()
      }
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <h1 className="text-lg font-semibold">aiRMADA Data Analyst</h1>
        </div>
        <button
          type="button"
          className="rounded-full p-1 transition hover:bg-orange-400"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {/* Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">📤 Upload Data</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.isLoading}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {uploadState.isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
          <div className="border-b border-slate-200"></div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* Chat Messages Area */}
        <div className="min-h-80 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {messages.length === 0 && !uploadState.fileName ? (
            <div className="flex min-h-80 items-center justify-center text-center text-slate-500">
              <div>
                <p className="text-sm text-slate-600">Upload file untuk mulai chat</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} role={message.role} content={message.content} />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-600">
                    <Loader className="h-4 w-4 animate-spin text-orange-500" />
                    AI sedang menganalisis...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              uploadState.fileName ? 'Ketik pertanyaan...' : 'Upload file terlebih dahulu...'
            }
            disabled={!uploadState.fileName || isLoading}
            rows={2}
            className="min-h-16 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!uploadState.fileName || isLoading || !inputValue.trim()}
            className="flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Error Display */}
        {uploadState.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {uploadState.error}
          </div>
        )}

        {/* File Info */}
        {uploadState.fileName && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            ✓ File: {uploadState.fileName}
          </div>
        )}
      </div>
    </div>
  )
}
