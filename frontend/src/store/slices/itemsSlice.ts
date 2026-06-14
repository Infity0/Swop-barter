import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { itemsApi } from '../../api/items.api'
import type { Item, QueryItemsParams } from '../../types/item'

interface ItemsState {
  items: Item[]
  currentItem: Item | null
  myItems: Item[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  error: string | null
}

const initialState: ItemsState = {
  items: [],
  currentItem: null,
  myItems: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
}

export const fetchItemsThunk = createAsyncThunk(
  'items/fetchAll',
  async (params: QueryItemsParams = {}, { rejectWithValue }) => {
    try {
      const res = await itemsApi.getAll(params)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch items')
    }
  },
)

export const fetchItemThunk = createAsyncThunk(
  'items/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await itemsApi.getOne(id)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Item not found')
    }
  },
)

export const fetchMyItemsThunk = createAsyncThunk(
  'items/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const res = await itemsApi.getMyItems()
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch items')
    }
  },
)

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsThunk.pending, (state) => { state.loading = true })
      .addCase(fetchItemsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data
        state.total = action.payload.total
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchItemsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchItemThunk.pending, (state) => { state.loading = true })
      .addCase(fetchItemThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentItem = action.payload
      })
      .addCase(fetchItemThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchMyItemsThunk.fulfilled, (state, action) => {
        state.myItems = action.payload
      })
  },
})

export default itemsSlice.reducer
