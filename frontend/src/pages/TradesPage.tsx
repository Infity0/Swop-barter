import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTradesThunk } from '../store/slices/tradesSlice'
import { TRADE_STATUS_LABELS, TRADE_STATUS_COLORS } from '../types/trade'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeftRight } from 'lucide-react'

export function TradesPage() {
  const dispatch = useAppDispatch()
  const { trades, loading } = useAppSelector((s) => s.trades)
  const { user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchTradesThunk())
  }, [dispatch])

  const sent = trades.filter((t) => t.initiatorId === user?.id)
  const received = trades.filter((t) => t.receiverId === user?.id)

  const TradeCard = ({ trade }: { trade: (typeof trades)[0] }) => {
    const isInitiator = trade.initiatorId === user?.id
    const other = isInitiator ? trade.receiver : trade.initiator
    return (
      <div
        onClick={() => navigate(`/trades/${trade.id}`)}
        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm dark:hover:shadow-black/30 transition cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TRADE_STATUS_COLORS[trade.status]}`}>
              {TRADE_STATUS_LABELS[trade.status]}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">{isInitiator ? '→ Вы предложили' : '← Входящее'}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
            С{' '}
            <Link
              to={`/profile/${other?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {other?.firstName || other?.username}
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {trade.initiatorItems?.length} вещ. ↔ {trade.receiverItems?.length} вещ.
          </p>
        </div>
        <div className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
          {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true, locale: ru })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Мои сделки</h1>

      {trades.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <ArrowLeftRight size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Сделок пока нет</p>
          <Link to="/browse" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-2 inline-block">
            Найди вещи для первой сделки
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {received.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Входящие предложения ({received.length})
              </h2>
              <div className="space-y-2">
                {received.map((t) => <TradeCard key={t.id} trade={t} />)}
              </div>
            </section>
          )}
          {sent.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Исходящие предложения ({sent.length})
              </h2>
              <div className="space-y-2">
                {sent.map((t) => <TradeCard key={t.id} trade={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
