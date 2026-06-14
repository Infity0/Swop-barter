import type { User } from './user'
import type { Item } from './item'

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'

export interface TradeOffer {
  id: string
  status: TradeStatus
  message?: string
  initiator: User
  initiatorId: string
  receiver: User
  receiverId: string
  initiatorItems: Item[]
  receiverItems: Item[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTradeOfferDto {
  receiverId: string
  initiatorItemIds: string[]
  receiverItemIds: string[]
  message?: string
}

export const TRADE_STATUS_LABELS: Record<TradeStatus, string> = {
  pending: 'Ожидает',
  accepted: 'Принято',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

export const TRADE_STATUS_COLORS: Record<TradeStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400',
  accepted: 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400',
  rejected: 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400',
  cancelled: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300',
  completed: 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400',
}
