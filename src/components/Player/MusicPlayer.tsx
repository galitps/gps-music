// Only active if Metronome is not OFF
// Follow currently played note from NotesDisplay
// Output audio for current note for the indicated duration

export default function MusicPlayer() {
  // --- STATE ---
  const [selectedPiece, setSelectedPiece] = useState(REPERTOIRE[0]);
  const [currentMeasureIdx, setCurrentMeasureIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [activeNoteIdx, setActiveNoteIdx] = useState(-1);

  // Settings
  const [bpm, setBpm] = useState(72);
  const [useAutoAdvance, setUseAutoAdvance] = useState(false); // Mode 1 vs Mode 2
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [audioPlayAlong, setAudioPlayAlong] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showFingerings, setShowFingerings] = useState(true);
  const [useColorCoding, setUseColorCoding] = useState(true);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Ensure AudioContext is initialized
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Sound synthesis: Metronome Click
  const playClick = (isFirstBeat = false) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 700, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  // Sound synthesis: Violin/Synth Tone for Notes
  const playNoteAudio = (freq, durationInSec) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sawtooth gives a richer string-like sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Lowpass filter to smooth violin tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      // Envelope
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationInSec - 0.02); // Release

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationInSec);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  const currentMeasure = selectedPiece.measures[currentMeasureIdx] || [];

  // --- AUTOMATIC TIMING & PLAYBACK LOOP ---
  useEffect(() => {
    let intervalId;

    if (isPlaying) {
      const beatDurationMs = (60 / bpm) * 1000;
      let beatCounter = 0;

      // Reset states
      setActiveBeat(0);

      const runBeat = () => {
        const beatNum = beatCounter % 4;
        setActiveBeat(beatNum);

        // Find which note corresponds to current beat
        let accumulatedBeats = 0;
        let matchedNoteIdx = -1;

        for (let i = 0; i < currentMeasure.length; i++) {
          const note = currentMeasure[i];
          if (beatCounter >= accumulatedBeats && beatCounter < accumulatedBeats + note.duration) {
            matchedNoteIdx = i;
            // Play note audio at start of note
            if (beatCounter === accumulatedBeats && audioPlayAlong) {
              const pitchInfo = PITCH_MAP[note.pitch];
              if (pitchInfo) {
                const noteSec = (note.duration * 60) / bpm;
                playNoteAudio(pitchInfo.freq, noteSec);
              }
            }
            break;
          }
          accumulatedBeats += note.duration;
        }

        setActiveNoteIdx(matchedNoteIdx);

        // Metronome sound
        if (metronomeEnabled) {
          playClick(beatNum === 0);
        }

        beatCounter++;

        // Measure completed?
        if (beatCounter >= 4) {
          if (useAutoAdvance) {
            // Auto advance mode
            setTimeout(() => {
              if (currentMeasureIdx < selectedPiece.measures.length - 1) {
                setCurrentMeasureIdx(prev => prev + 1);
                beatCounter = 0;
              } else {
                // Completed piece
                setIsPlaying(false);
                setCompletedSession(true);
                setActiveBeat(-1);
                setActiveNoteIdx(-1);
              }
            }, beatDurationMs);
          } else {
            // Stop at end of measure for interactive advance
            setTimeout(() => {
              setIsPlaying(false);
              setActiveBeat(-1);
              setActiveNoteIdx(-1);
            }, beatDurationMs);
          }
        }
      };

      // Initial beat
      runBeat();
      intervalId = setInterval(runBeat, beatDurationMs);
    } else {
      setActiveBeat(-1);
      setActiveNoteIdx(-1);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, currentMeasureIdx, bpm, useAutoAdvance, metronomeEnabled, audioPlayAlong, selectedPiece]);
