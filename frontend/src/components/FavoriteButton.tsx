import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleFavoriteThunk } from '../store/slices/favoritesSlice'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  itemId: string
  className?: string
}

export function FavoriteButton({ itemId, className = '' }: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const isFavorited = useAppSelector((s) => s.favorites.ids.includes(itemId))

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    dispatch(toggleFavoriteThunk(itemId))
    toast.success(isFavorited ? 'Удалено из избранного' : 'Добавлено в избранное')
  }

  return (
    <button
      onClick={handleClick}
      aria-label="В избранное"
      className={`flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:scale-110 transition-all ${className}`}
    >
      <Heart
        size={15}
        className={isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-400 dark:text-slate-400'}
      />
    </button>
  )
}
