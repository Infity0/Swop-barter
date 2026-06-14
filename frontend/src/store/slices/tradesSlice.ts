import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { tradesApi } from '../../api/trades.api'
import type { TradeOffer, TradeStatus } from '../../types/trade'

interface TradesState {
  trades: TradeOffer[]
  currentTrade: TradeOffer | null
  loading: boolean
  error: string | null
}

const initialState: TradesState = {
  trades: [],
  currentTrade: null,
  loading: false,
  error: null,
}

export const fetchTradesThunk = createAsyncThunk('trades/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await tradesApi.getAll()
    return res.data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trades')
  }
})

export const fetchTradeThunk = createAsyncThunk('trades/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const res = await tradesApi.getOne(id)
    return res.data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Trade not found')
  }
})

export const updateTradeStatusThunk = createAsyncThunk(
  'trades/updateStatus',
  async ({ id, status }: { id: string; status: TradeStatus }, { rejectWithValue }) => {
    try {
      const res = await tradesApi.updateStatus(id, status)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update trade')
    }
  },
)

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setCurrentTrade(state, action: PayloadAction<TradeOffer>) {
      state.currentTrade = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTradesThunk.pending, (state) => { state.loading = true })
      .addCase(fetchTradesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.trades = action.payload
      })
      .addCase(fetchTradesThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchTradeThunk.fulfilled, (state, action) => {
        state.currentTrade = action.payload
      })
      .addCase(updateTradeStatusThunk.fulfilled, (state, action) => {
        state.currentTrade = action.payload
        const idx = state.trades.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.trades[idx] = action.payload
      })
  },
})

export const { setCurrentTrade } = tradesSlice.actions
export default tradesSlice.reducer
