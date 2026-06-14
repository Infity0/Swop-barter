import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTradeThunk, updateTradeStatusThunk } from '../store/slices/tradesSlice'
import { chatApi } from '../api/chat.api'
import { reviewsApi } from '../api/reviews.api'
import type { Review } from '../api/reviews.api'
import type { Message } from '../types/chat'
import { TRADE_STATUS_LABELS, TRADE_STATUS_COLORS } from '../types/trade'
import { Send, CheckCheck, X, Star, Image as ImageIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { connectSocket } from '../lib/socket'

export function TradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { currentTrade: trade } = useAppSelector((s) => s.trades)
  const { user } = useAppSelector((s) => s.auth)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [myReview, setMyReview] = useState<Review | null | undefined>(undefined)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    if (id) {
      dispatch(fetchTradeThunk(id))
      chatApi.getMessages(id).then((r) => setMessages(r.data))
    }
  }, [id, dispatch])

  // Realtime chat via WebSocket
  useEffect(() => {
    if (!id) return
    const socket = connectSocket()

    const join = () => socket.emit('joinTrade', id)
    if (socket.connected) join()
    socket.on('connect', join)

    const handleNewMessage = (message: Message) => {
      if (message.tradeOfferId !== id) return
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
    }
    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.emit('leaveTrade', id)
      socket.off('connect', join)
      socket.off('newMessage', handleNewMessage)
    }
  }, [id])

  useEffect(() => {
    if (trade?.status === 'completed' && user?.id && id) {
      reviewsApi.getByUser(user.id).then((r) => {
        const existing = r.data.find((rev) => rev.tradeOfferId === id && rev.reviewerId === user.id)
        setMyReview(existing ?? null)
      })
    }
  }, [trade?.status, user?.id, id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const emitChatMessage = (payload: { content?: string; imageUrl?: string }) => {
    if (!id) return
    const socket = connectSocket()
    if (socket.connected) {
      socket.emit('sendMessage', { tradeId: id, ...payload }, (response: Message | { error: string }) => {
        if (!response || 'error' in response) {
          toast.error('Не удалось отправить сообщение')
        } else {
          setMessages((prev) => (prev.some((m) => m.id === response.id) ? prev : [...prev, response]))
        }
      })
    } else if (payload.content) {
      chatApi.sendMessage(id, payload.content).then((res) => {
        setMessages((prev) => [...prev, res.data])
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !id) return
    const content = newMessage
    setSendingMsg(true)
    try {
      emitChatMessage({ content })
      setNewMessage('')
    } catch {
      toast.error('Не удалось отправить сообщение')
    } finally {
      setSendingMsg(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !id) return
    if (!file.type.startsWith('image/')) {
      toast.error('Можно отправлять только изображения')
      return
    }
    setUploadingImage(true)
    try {
      const res = await chatApi.uploadImage(id, file)
      emitChatMessage({ imageUrl: res.data.url })
    } catch {
      toast.error('Не удалось загрузить изображение')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!id) return
    const result = await dispatch(updateTradeStatusThunk({ id, status: status as any }))
    if (updateTradeStatusThunk.fulfilled.match(result)) {
      toast.success(`Сделка ${status === 'accepted' ? 'принята' : status === 'rejected' ? 'отклонена' : status === 'cancelled' ? 'отменена' : 'завершена'}`)
    }
  }

  const submitReview = async () => {
    if (!trade || !id || !user) return
    const revieweeId = isInitiator ? trade.receiverId : trade.initiatorId
    setSubmittingReview(true)
    try {
      const res = await reviewsApi.create({ revieweeId, tradeOfferId: id, rating: reviewRating, comment: reviewComment })
      setMyReview(res.data)
      toast.success('Отзыв оставлен!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Ошибка при отправке отзыва')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!trade) return <div className="text-center py-20 text-gray-400 dark:text-slate-500">Загрузка...</div>

  const isInitiator = trade.initiatorId === user?.id
  const isPending = trade.status === 'pending'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Предложение обмена</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${TRADE_STATUS_COLORS[trade.status]}`}>
            {TRADE_STATUS_LABELS[trade.status]}
          </span>
        </div>

        {/* Items exchange */}
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">
              Предложение{' '}
              <Link to={`/profile/${trade.initiator?.username}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {trade.initiator?.username}
              </Link>
            </p>
            <div className="flex flex-wrap gap-2">
              {trade.initiatorItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  {item.images?.[0] && (
                    <img src={item.images[0].url} alt={item.title} className="w-10 h-10 rounded object-contain" />
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-2xl text-gray-300 dark:text-slate-600">⇄</div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">
              Вещи{' '}
              <Link to={`/profile/${trade.receiver?.username}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {trade.receiver?.username}
              </Link>
            </p>
            <div className="flex flex-wrap gap-2">
              {trade.receiverItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  {item.images?.[0] && (
                    <img src={item.images[0].url} alt={item.title} className="w-10 h-10 rounded object-contain" />
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {trade.message && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-sm text-gray-700 dark:text-slate-300">
            <span className="font-medium">Сообщение: </span>{trade.message}
          </div>
        )}

        {/* Action buttons */}
        {isPending && (
          <div className="flex gap-2 mt-4">
            {!isInitiator && (
              <>
                <button
                  onClick={() => handleStatusUpdate('accepted')}
                  className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <CheckCheck size={14} /> Принять
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="flex items-center gap-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-500/20"
                >
                  <X size={14} /> Отклонить
                </button>
              </>
            )}
            {isInitiator && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                <X size={14} /> Отменить
              </button>
            )}
            {trade.status === 'accepted' && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <CheckCheck size={14} /> Завершить сделку
              </button>
            )}
          </div>
        )}
        {trade.status === 'accepted' && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleStatusUpdate('completed')}
              className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <CheckCheck size={14} /> Завершить сделку
            </button>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 overflow-hidden shadow-sm shadow-indigo-50 dark:shadow-none">
        <div className="px-6 py-4 border-b border-indigo-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="font-semibold text-indigo-900 dark:text-indigo-300">Чат</h2>
        </div>
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                <Send size={16} className="text-indigo-400" />
              </div>
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm">Сообщений пока нет. Начните разговор!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-100 dark:border-slate-600'
                  }`}>
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 text-indigo-500 dark:text-indigo-400">
                        <Link to={`/profile/${msg.sender?.username}`} className="hover:underline">
                          {msg.sender?.username}
                        </Link>
                      </p>
                    )}
                    {msg.imageUrl && (
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.imageUrl}
                          alt="Изображение"
                          className="max-w-full max-h-60 rounded-lg mb-1 object-contain"
                        />
                      </a>
                    )}
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                    <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-slate-400'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ru })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-indigo-100 dark:border-slate-700 flex gap-2 bg-white dark:bg-slate-800">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            title="Отправить изображение"
            className="text-indigo-500 dark:text-indigo-400 p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition"
          >
            <ImageIcon size={18} />
          </button>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 border border-indigo-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={sendingMsg || !newMessage.trim()}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Review block - shown after trade is completed */}
      {trade.status === 'completed' && myReview === null && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mt-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
            Оставить отзыв о{' '}
            <Link
              to={`/profile/${isInitiator ? trade.receiver?.username : trade.initiator?.username}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isInitiator ? trade.receiver?.username : trade.initiator?.username}
            </Link>
          </h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Оценка</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={28}
                    className={s <= (hoverRating || reviewRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200 dark:text-slate-700 fill-gray-200 dark:fill-slate-700'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-slate-400 self-center">
                {['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'][hoverRating || reviewRating]}
              </span>
            </div>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={3}
            placeholder="Напишите комментарий (необязательно)..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
          />
          <button
            onClick={submitReview}
            disabled={submittingReview}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submittingReview ? 'Отправляем...' : 'Отправить отзыв'}
          </button>
        </div>
      )}

      {trade.status === 'completed' && myReview && (
        <div className="bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/30 p-5 mt-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-1">
            <CheckCheck size={16} /> Вы уже оставили отзыв
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} className={s <= myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-slate-700 fill-gray-200 dark:fill-slate-700'} />
            ))}
          </div>
          {myReview.comment && <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{myReview.comment}</p>}
        </div>
      )}
    </div>
  )
}
