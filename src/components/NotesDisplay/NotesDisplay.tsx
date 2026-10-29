// --- VIOLIN COLOR CODING & STRING UTILS ---
// G String: Red, D String: Yellow/Gold, A String: Blue, E String: Green
export const STRING_COLORS = {
  G: { color: '#EF4444', bg: 'bg-red-500', lightBg: 'bg-red-100', text: 'text-red-600', border: 'border-red-500', hex: '#EF4444', label: 'G String' },
  D: { color: '#EAB308', bg: 'bg-yellow-500', lightBg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-500', hex: '#EAB308', label: 'D String' },
  A: { color: '#3B82F6', bg: 'bg-blue-500', lightBg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500', hex: '#3B82F6', label: 'A String' },
  E: { color: '#10B981', bg: 'bg-green-500', lightBg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500', hex: '#10B981', label: 'E String' }
};

// Staff Line Y Positions (from top down, standard 5-line staff)
// F5 (top line) = Y 60, D5 = Y 80, B4 = Y 100, G4 = Y 120, E4 (bottom line) = Y 140
// Each pitch step (line to space) = 10 units vertically.
export const PITCH_MAP = {
  'G3': { string: 'G', finger: 0, pitchStep: -3, noteName: 'G', freq: 196.00 },
  'A3': { string: 'G', finger: 1, pitchStep: -2, noteName: 'A', freq: 220.00 },
  'B3': { string: 'G', finger: 2, pitchStep: -1, noteName: 'B', freq: 246.94 },
  'C4': { string: 'G', finger: 3, pitchStep: 0,  noteName: 'C', freq: 261.63 },
  'D4': { string: 'D', finger: 0, pitchStep: 1,  noteName: 'D', freq: 293.66 },
  'E4': { string: 'D', finger: 1, pitchStep: 2,  noteName: 'E', freq: 329.63 },
  'F#4':{ string: 'D', finger: 2, pitchStep: 3,  noteName: 'F#', freq: 369.99 },
  'G4': { string: 'D', finger: 3, pitchStep: 4,  noteName: 'G', freq: 392.00 },
  'A4': { string: 'A', finger: 0, pitchStep: 5,  noteName: 'A', freq: 440.00 },
  'B4': { string: 'A', finger: 1, pitchStep: 6,  noteName: 'B', freq: 493.88 },
  'C#5':{ string: 'A', finger: 2, pitchStep: 7,  noteName: 'C#', freq: 554.37 },
  'D5': { string: 'A', finger: 3, pitchStep: 8,  noteName: 'D', freq: 587.33 },
  'E5': { string: 'E', finger: 0, pitchStep: 9,  noteName: 'E', freq: 659.25 },
  'F#5':{ string: 'E', finger: 1, pitchStep: 10, noteName: 'F#', freq: 739.99 },
  'G#5':{ string: 'E', finger: 2, pitchStep: 11, noteName: 'G#', freq: 830.61 },
  'A5': { string: 'E', finger: 3, pitchStep: 12, noteName: 'A', freq: 880.00 },
};

type NoteObject = {
    pitch: String;
    duration: 
}

type MeasureObject = {

};

type MusicObject = {
    id: string | null;
    name: string | null;
    keySignature: string;
    timeSignature: int; // denominator defaults to 4
    measures = 
};

// Display staff, key signature, time signature
// Display one measure at a time
// Display finger number below each note.
    // If number is 0, show string name.
    // Use string-based color coding

// Stay on each measure as indicated by Metronome setting
    // If Metronome is OFF, listen for measure having been played, or user click NEXT
    // For any other Metronome setting, use rate x number of beats per measure.