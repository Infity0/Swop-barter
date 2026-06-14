import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { favoritesApi } from '../../api/favorites.api'
import type { Item } from '../../types/item'

interface FavoritesState {
  ids: string[]
  items: Item[]
  loading: boolean
}

const initialState: FavoritesState = {
  ids: [],
  items: [],
  loading: false,
}

export const fetchFavoriteIdsThunk = createAsyncThunk('favorites/fetchIds', async () => {
  const res = await favoritesApi.getIds()
  return res.data
})

export const fetchFavoritesThunk = createAsyncThunk('favorites/fetchAll', async () => {
  const res = await favoritesApi.getAll()
  return res.data
})

export const toggleFavoriteThunk = createAsyncThunk(
  'favorites/toggle',
  async (itemId: string, { getState }) => {
    const state = getState() as { favorites: FavoritesState }
    const isFavorited = state.favorites.ids.includes(itemId)
    if (isFavorited) {
      await favoritesApi.remove(itemId)
      return { itemId, favorited: false }
    }
    await favoritesApi.add(itemId)
    return { itemId, favorited: true }
  },
)

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoriteIdsThunk.fulfilled, (state, action) => {
        state.ids = action.payload
      })
      .addCase(fetchFavoritesThunk.pending, (state) => { state.loading = true })
      .addCase(fetchFavoritesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.ids = action.payload.map((i) => i.id)
      })
      .addCase(fetchFavoritesThunk.rejected, (state) => { state.loading = false })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        const { itemId, favorited } = action.payload
        if (favorited) {
          if (!state.ids.includes(itemId)) state.ids.push(itemId)
        } else {
          state.ids = state.ids.filter((id) => id !== itemId)
          state.items = state.items.filter((i) => i.id !== itemId)
        }
      })
  },
})

export default favoritesSlice.reducer
