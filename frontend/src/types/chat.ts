import type { User } from './user'

export interface Message {
  id: string
  content: string | null
  imageUrl: string | null
  isRead: boolean
  sender: User
  senderId: string
  tradeOfferId: string
  createdAt: string
}
