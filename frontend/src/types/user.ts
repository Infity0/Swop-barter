export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  city?: string
  rating: number
  reviewsCount: number
  successfulTrades: number
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  bio?: string
  city?: string
}

export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
  if (user.firstName) return user.firstName
  return user.username
}
