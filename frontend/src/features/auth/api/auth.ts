import { api } from '../../../shared/api/axiosInstance'
import type { MessageResponse, UserCreate, Usuario } from '../types'

/** Login con formulario OAuth2: el JWT llega en la cookie HttpOnly, no en el cuerpo. */
export async function loginRequest(username: string, password: string): Promise<MessageResponse> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  const { data } = await api.post<MessageResponse>('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function registerRequest(payload: UserCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', payload)
  return data
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}
