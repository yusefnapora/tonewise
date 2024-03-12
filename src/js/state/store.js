import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/es/storage'
import gameReducer from './slices/game-slice.js'
import instrumentReducer from './slices/instrument-slice.js'
import audioReducer from './slices/audio-slice.js'
import tuningReducer from './slices/tuning-slice.js'
import preferencesReducer from './slices/preferences-slice.js'

const persistedPreferencesReducer = persistReducer(
  {
    key: 'preferences',
    storage,
  },
  preferencesReducer,
)

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    game: gameReducer,
    instrument: instrumentReducer,
    preferences: persistedPreferencesReducer,
    tuning: tuningReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persister = persistStore(store)

/**
 * @typedef {typeof store} StateStore
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

/** @type {AppDispatch} */
export const dispatch = store.dispatch
