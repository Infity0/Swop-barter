import api from './axios'
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth'

export const authApi = {
  register: (data: RegisterDto) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginDto) => api.post<AuthResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}
