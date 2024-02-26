import { configureStore } from "@reduxjs/toolkit"

export const store = configureStore({
  reducer: {}
})

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */
