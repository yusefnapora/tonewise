import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Sampler } from '../../audio/sampler.js'

/**
 * @typedef {(time?: number) => void} PlaybackStopFn
 * @typedef {object} PlaybackMeta
 * @property {PlaybackStopFn} stop
 * @property {Promise<unknown>} ended
 */

const AudioGlobals = {
  context: new AudioContext(),

  /**
   * @type {Sampler|null}
   */
  sampler: null,

  /**
   * @type {{[midiNote: number]: PlaybackMeta? }}
   */
  playbackMeta: {},
}

export function resumeAudio() {
  if (AudioGlobals.context.state === 'suspended') {
    console.log('resuming audio context')
    return AudioGlobals.context
      .resume()
      .then(() => console.log('context resumed'))
  }
}

/**
 * @typedef {import('./types.js').Note} Note
 * @typedef {import('./types.js').AudioState} AudioState
 */

/** @type {AudioState} */
const initialState = {
  samplerLoading: 'idle',
  soundingMidiNotes: [],
}

/** @type {import('@reduxjs/toolkit').AsyncThunk<void, unknown, { state: { audio: AudioState }}>} */
export const loadSampler = createAsyncThunk(
  'audio/loadSampler',
  /**
   * @param {object} args
   * @param {{ getState: () => { audio: AudioState }}} thunkAPI
   */
  async (args, thunkAPI) => {
    AudioGlobals.sampler = new Sampler({
      context: AudioGlobals.context,
    })
    await AudioGlobals.sampler.enable()
  },
  {
    condition: (_, { getState }) => {
      const { audio } = getState()
      return audio.samplerLoading == 'idle'
    },
  },
)

/** @type {import('@reduxjs/toolkit').AsyncThunk<{ midiNote: number }, { midiNote: number }, { state: { audio: AudioState }}>} */
export const triggerNoteStart = createAsyncThunk(
  'audio/noteStart',
  /**
   *
   * @param {object} args
   * @param {number} args.midiNote
   * @param {{ requestId: string, getState: () => { audio: AudioState }}} thunkAPI
   */
  async ({ midiNote }, { requestId }) => {
    const meta = AudioGlobals.playbackMeta[midiNote]
    if (meta) {
      meta.stop()
    }
    const { started, ended, stop } = await AudioGlobals.sampler.play({
      note: midiNote,
      decayTime: 1, // TODO: add to args
    })
    AudioGlobals.playbackMeta[midiNote] = { stop, ended }
    await started
    return { midiNote }
  },
  {
    condition: (_, { getState }) => {
      return getState().audio.samplerLoading === 'loaded'
    },
  },
)

/** @type {import('@reduxjs/toolkit').AsyncThunk<{ midiNote: number }, { midiNote: number }, { state: { audio: AudioState }}>} */
export const triggerNoteStop = createAsyncThunk(
  'audio/noteStop',
  /**
   *
   * @param {object} args
   * @param {number} args.midiNote
   * @param {{ requestId: string, getState: () => { audio: AudioState }}} thunkAPI
   */
  async ({ midiNote }, { requestId }) => {
    const meta = AudioGlobals.playbackMeta[midiNote]
    if (!meta) {
      return
    }
    meta.stop()
    await meta.ended
    return { midiNote }
  },
  {
    condition: (_, { getState }) => {
      return getState().audio.samplerLoading === 'loaded'
    },
  },
)

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSampler.pending, (state) => {
        state.samplerLoading = 'loading'
      })
      .addCase(loadSampler.fulfilled, (state) => {
        state.samplerLoading = 'loaded'
      })
      .addCase(triggerNoteStart.fulfilled, (state, action) => {
        state.soundingMidiNotes.push(action.payload.midiNote)
      })
      .addCase(triggerNoteStop.fulfilled, (state, action) => {
        state.soundingMidiNotes = [
          ...state.soundingMidiNotes.filter(
            (n) => n === action.payload.midiNote,
          ),
        ]
      })
  },
})

const { reducer } = audioSlice
export default reducer
