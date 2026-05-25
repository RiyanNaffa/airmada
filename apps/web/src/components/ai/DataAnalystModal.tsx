/**
 * Data Analyst Modal Component
 * Modal dialog untuk AI Data Analyst chat
 *
 * @location apps/web/src/components/ai/DataAnalystModal.tsx
 */
'use client'

import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { DataAnalystChat } from './DataAnalystChat'

interface DataAnalystModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DataAnalystModal({ isOpen, onClose }: DataAnalystModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <DataAnalystChat />
          </div>
        </div>
      </div>
    </>
  )
}
