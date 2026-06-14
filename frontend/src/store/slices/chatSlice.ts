import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Message } from '../../types/chat'

interface ChatState {
  messages: Record<string, Message[]> // tradeId -> messages
  loading: boolean
}

const initialState: ChatState = {
  messages: {},
  loading: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<{ tradeId: string; messages: Message[] }>) {
      state.messages[action.payload.tradeId] = action.payload.messages
    },
    addMessage(state, action: PayloadAction<{ tradeId: string; message: Message }>) {
      const { tradeId, message } = action.payload
      if (!state.messages[tradeId]) state.messages[tradeId] = []
      state.messages[tradeId].push(message)
    },
  },
})

export const { setMessages, addMessage } = chatSlice.actions
export default chatSlice.reducer
