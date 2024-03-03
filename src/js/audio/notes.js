

// todo: support multiple octaves, non-default tunings, etc
export const NoteIds = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const startMidiNote = 60
export const NoteIdMidiMap = Object.fromEntries(NoteIds.map((n, i) => [n, startMidiNote + i]))