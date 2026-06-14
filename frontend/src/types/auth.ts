import type { User } from './user'

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  login: string
  password: string
}

export interface RegisterDto {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}
