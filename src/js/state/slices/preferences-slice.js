import { createSlice } from "@reduxjs/toolkit"
import { DEFAULT_COLOR_SCALE } from "../../common/color.js"

/**
 * @typedef {import('../../common/types.js').ColorScaleName} ColorScaleName
 * @typedef {import('./types.js').PreferencesState} PreferencesState
 * @typedef {import('@reduxjs/toolkit').PayloadAction<ColorScaleName>} ColorScaleAction
 */


/** @type {PreferencesState} */
const initialState = {
  colorScale: DEFAULT_COLOR_SCALE,
  enharmonicPresentation: 'flat',
}

const preferencesSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    /**
     * @param {PreferencesState} state 
     * @param {ColorScaleAction} action 
     */
    setColorScale(state, action) {
      state.colorScale = action.payload
    }
  },
})

const { actions, reducer } = preferencesSlice
export const { setColorScale } = actions
export default reducer
