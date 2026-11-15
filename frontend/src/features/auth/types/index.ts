export type Rol = 'user' | 'admin'

/** Igual que el schema UserPublic del backend (nunca incluye la contraseña). */
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

/** Igual que el schema UserCreate del backend. */
export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MessageResponse {
  message: string
}
