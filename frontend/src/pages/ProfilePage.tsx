import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usersApi } from '../api/users.api'
import { reviewsApi } from '../api/reviews.api'
import type { Review } from '../api/reviews.api'
import type { User } from '../types/user'
import { User as UserIcon, MapPin, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-slate-700 fill-gray-200 dark:fill-slate-700'}
        />
      ))}
    </div>
  )
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      setLoading(true)
      usersApi.getProfile(username)
        .then((r) => {
          setProfile(r.data)
          return reviewsApi.getByUser(r.data.id)
        })
        .then((r) => setReviews(r.data))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false))
    }
  }, [username])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl h-40 animate-pulse mb-4" />
      </div>
    )
  }
  if (!profile) return <div className="text-center py-20 text-gray-400 dark:text-slate-500">Пользователь не найден</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-5">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <UserIcon size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {profile.firstName || profile.lastName
                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                : profile.username}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">@{profile.username}</p>
            {profile.city && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 mt-1">
                <MapPin size={13} /> {profile.city}
              </div>
            )}
            {profile.bio && <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">{profile.bio}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold dark:text-slate-100">{Number(profile.rating).toFixed(1)}</span>
                <span className="text-gray-400 dark:text-slate-500">({profile.reviewsCount} отзывов)</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">{profile.successfulTrades}</span> сделок
              </div>
              <div className="text-sm text-gray-400 dark:text-slate-500">
                На сайте {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true, locale: ru })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
          Отзывы {reviews.length > 0 && <span className="text-gray-400 dark:text-slate-500 font-normal text-sm">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500">
            <Star size={32} className="mx-auto mb-3 opacity-20" />
            <p>Отзывов пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {r.reviewer?.avatar ? (
                        <img src={r.reviewer.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">@{r.reviewer?.username}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: ru })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-gray-700 dark:text-slate-300">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
