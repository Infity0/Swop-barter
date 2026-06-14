import api from './axios'
import type { TradeOffer, CreateTradeOfferDto, TradeStatus } from '../types/trade'

export const tradesApi = {
  getAll: () => api.get<TradeOffer[]>('/trades'),
  getOne: (id: string) => api.get<TradeOffer>(`/trades/${id}`),
  create: (data: CreateTradeOfferDto) => api.post<TradeOffer>('/trades', data),
  updateStatus: (id: string, status: TradeStatus) =>
    api.patch<TradeOffer>(`/trades/${id}/status`, { status }),
}
