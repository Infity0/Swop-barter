import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import itemsReducer from './slices/itemsSlice'
import tradesReducer from './slices/tradesSlice'
import notificationsReducer from './slices/notificationsSlice'
import chatReducer from './slices/chatSlice'
import favoritesReducer from './slices/favoritesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    trades: tradesReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    favorites: favoritesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
