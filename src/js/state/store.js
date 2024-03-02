import { configureStore } from "@reduxjs/toolkit"
import gameReducer from './slices/game-slice.js'
import instrumentReducer from './slices/instrument-slice.js'

export const store = configureStore({
  reducer: {
    game: gameReducer,
    instrument: instrumentReducer,
  }
})


/**
 * @typedef {typeof store} StateStore
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

/** @type {AppDispatch} */
export const dispatch = store.dispatch
