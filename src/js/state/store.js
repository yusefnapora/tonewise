import { configureStore } from "@reduxjs/toolkit"
import { reducer as gameReducer } from './game-slice.js'

export const store = configureStore({
  reducer: {
    game: gameReducer,
  }
})


/**
 * @typedef {typeof store} StateStore
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

/** @type {AppDispatch} */
export const dispatch = store.dispatch
