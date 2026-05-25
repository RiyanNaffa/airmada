'use client'

import { Mail, CheckCircle } from 'lucide-react'

interface EmailConfirmationModalProps {
  isOpen: boolean
  email: string
  onClose?: () => void
}

/**
 * Modal to inform user about email confirmation requirement
 * Shows when user registers and email confirmation is required
 */
export function EmailConfirmationModal({ isOpen, email, onClose }: EmailConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">Confirm Your Email</h2>

        {/* Description */}
        <p className="mb-6 text-center text-slate-600">We've sent a confirmation link to:</p>

        {/* Email Display */}
        <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-center font-semibold text-blue-900">{email}</p>
        </div>

        {/* Instructions */}
        <div className="mb-8 space-y-3 text-sm text-slate-600">
          <div className="flex gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
            <p>Check your email inbox and spam folder</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
            <p>Click the confirmation link in the email</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
            <p>You'll be automatically redirected to your dashboard</p>
          </div>
        </div>

        {/* Help Text */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Didn't receive the email?</p>
          <p className="mt-1">
            Check your spam folder or try registering again with the same email.
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-slate-100 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
