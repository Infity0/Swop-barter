import api from './axios'
import type { User, UpdateUserDto } from '../types/user'

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  getProfile: (username: string) => api.get<User>(`/users/${username}`),
  update: (data: UpdateUserDto) => api.patch<User>('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.patch<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
