import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { notificationsApi } from '../../api/notifications.api'

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  referenceId?: string
  isRead: boolean
  createdAt: string
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
}

export const fetchNotificationsThunk = createAsyncThunk('notifications/fetchAll', async () => {
  const res = await notificationsApi.getAll()
  return res.data
})

export const fetchUnreadCountThunk = createAsyncThunk('notifications/unreadCount', async () => {
  const res = await notificationsApi.getUnreadCount()
  return res.data
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    decrementUnread(state) {
      if (state.unreadCount > 0) state.unreadCount -= 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.notifications = action.payload
      })
      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
  },
})

export const { addNotification, decrementUnread } = notificationsSlice.actions
export default notificationsSlice.reducer
