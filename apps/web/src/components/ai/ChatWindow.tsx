/**
 * Window chatbot AI — input + riwayat percakapan.
 *
 * @location apps/web/src/components/ai/ChatWindow.tsx
 * TODO: State percakapan, POST ke /api/ai/chat dengan conversation_history,
 *       render ChatMessage per pesan, auto-scroll ke bawah
 */
'use client'

export function ChatWindow() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-center text-sm text-gray-400">Mulai percakapan...</p>
      </div>
      <div className="flex gap-2 border-t p-3">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="Tanya sesuatu tentang armada..."
          disabled
        />
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white" disabled>
          Kirim
        </button>
      </div>
    </div>
  )
}
