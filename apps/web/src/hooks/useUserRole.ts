import { useState, useEffect } from 'react'
import { useUserProfile } from './useUserProfile'

export type UserRole = 'MANAGER' | 'DRIVER' | 'DISPATCHER'

export function useUserRole() {
  const { user, loading } = useUserProfile()
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    if (user) {
      setRole(user.user.role as UserRole)
    }
  }, [user])

  return { role, loading }
}
