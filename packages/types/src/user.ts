export type UserRole = 'MANAGER' | 'DISPATCHER' | 'DRIVER';

export interface User {
  id: string
  full_name: string
  short_name: string
  role: UserRole
  cell_phone: string
}

export interface UserSession {
  user: {
    id: string
    full_name: string
    short_name: string
    role: string
    cell_phone: string
    avatar_url?: string
    warehouse_id: string
  }
  email: string
  loginTime: string
}