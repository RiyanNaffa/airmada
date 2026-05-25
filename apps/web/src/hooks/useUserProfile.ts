import { useState, useEffect } from 'react'
import type { UserSession } from '@airmada/types'

export interface UseUserProfileReturn {
  user: UserSession | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (data: Partial<UserSession['user']>) => Promise<UserSession>
}

/**
 * Custom hook for managing user profile data
 * Handles fetching and updating user profile via /api/auth/me
 */
export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again')
        }
        throw new Error(`Failed to fetch user profile (${response.status})`)
      }

      const session: UserSession = await response.json()
      setUser(session)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user profile'
      setError(errorMessage)
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserSession['user']>): Promise<UserSession> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again')
        }
        throw new Error(`Failed to update profile (${response.status})`)
      }

      const updatedSession: UserSession = await response.json()
      setUser(updatedSession)
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      console.error('Error updating user profile:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  return {
    user,
    loading,
    error,
    refetch: fetchUserProfile,
    updateProfile,
  }
}
