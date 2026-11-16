import React, { useState, useEffect, useRef } from 'react';
import MusicSelector from "@/components/MusicLoader/MusicSelector";
import styles from "./NotesDisplay.module.css";
import { getMeasureBeatCount, TIME_SIGNATURES } from "@/types/music";
import type { MeasureObject, MusicObject } from "@/types/music";
import { 
  Play, Pause, RotateCcw, Volume2, Music, Eye, Palette, Hash, Sparkles,
  ChevronRight, ChevronLeft, Metronome, Pencil, Save, Upload, Plus, Trash2,
  ArrowUp, ArrowDown
} from 'lucide-react';

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

const PITCHES = Object.keys(PITCH_MAP);
const NOTE_DURATIONS = [0.5, 1, 1.5, 2, 3, 4];



// Display staff, key signature, time signature
// Display one measure at a time
// Display finger number below each note.
    // If number is 0, show string name.
    // Use string-based color coding

// Stay on each measure as indicated by Metronome setting
    // If Metronome is OFF, listen for measure having been played, or user click NEXT
    // For any other Metronome setting, use rate x number of beats per measure.

type NotesDisplayProps = {
  repertoire: MusicObject[];
  onCreateNewPiece: () => void;
  onUpdatePiece: (piece: MusicObject) => void;
  onImportPieces: (pieces: MusicObject[]) => void;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentMeasureIdx: number;
  setCurrentMeasureIdx: React.Dispatch<React.SetStateAction<number>>;
  selectedPiece: string;
  setSelectedPiece: React.Dispatch<React.SetStateAction<string>>;
  completedSession: boolean;
  setCompletedSession: React.Dispatch<React.SetStateAction<boolean>>;
  useColorCoding: boolean;
  setUseColorCoding: React.Dispatch<React.SetStateAction<boolean>>;
  showNoteNames: boolean;
  setShowNoteNames: React.Dispatch<React.SetStateAction<boolean>>;
  showFingerings: boolean;
  setShowFingerings: React.Dispatch<React.SetStateAction<boolean>>;
  activeBeat: number;
  activeNoteIdx: number;
  setActiveNoteIdx: React.Dispatch<React.SetStateAction<number>>;
  bpm: number;
  setBpm: React.Dispatch<React.SetStateAction<number>>;
  useAutoAdvance: boolean;
  setUseAutoAdvance: React.Dispatch<React.SetStateAction<boolean>>;
  metronomeEnabled: boolean;
  setMetronomeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  audioPlayAlong: boolean;
  setAudioPlayAlong: React.Dispatch<React.SetStateAction<boolean>>;
};

type MeasureSVGProps = {
  measure: MeasureObject;
  timeSignature: string;
  activeNoteIdx: number;
  showNoteNames: boolean;
  showFingerings: boolean;
  useColorCoding: boolean;
  isEditing: boolean;
  selectedEditNoteIdx: number;
  onSelectNote: (index: number) => void;
};

export default function NotesDisplay({
  repertoire,
  onCreateNewPiece,
  onUpdatePiece,
  onImportPieces,
  isPlaying,
  setIsPlaying,
  currentMeasureIdx,
  setCurrentMeasureIdx,
  selectedPiece,
  setSelectedPiece,
  completedSession,
  setCompletedSession,
  useColorCoding,
  setUseColorCoding,
  showNoteNames,
  setShowNoteNames,
  showFingerings,
  setShowFingerings,
  activeBeat,
  activeNoteIdx,
  setActiveNoteIdx,
  bpm,
  setBpm,
  useAutoAdvance,
  setUseAutoAdvance,
  metronomeEnabled,
  setMetronomeEnabled,
  audioPlayAlong,
  setAudioPlayAlong
}: NotesDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEditNoteIdx, setSelectedEditNoteIdx] = useState(-1);
  const importInputRef = useRef<HTMLInputElement>(null);

  const currentPiece =
    repertoire.find((piece) => piece.id === selectedPiece) ?? repertoire[0];
  const currentMeasure = currentPiece.measures[currentMeasureIdx] ?? [];
  const measureBeatCount = getMeasureBeatCount(currentPiece.timeSignature);
  const selectedEditNote = currentMeasure[selectedEditNoteIdx];

  // --- KEYBOARD SHORTCUT (Spacebar to Advance / Play) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing || (e.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName))) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleAdvanceOrPlay();
      } else if (e.code === 'ArrowRight') {
        handleNextMeasure();
      } else if (e.code === 'ArrowLeft') {
        handlePrevMeasure();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentMeasureIdx, selectedPiece, isEditing]);

  // Handlers
  const handleAdvanceOrPlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      // If already playing, stop or advance
      setIsPlaying(false);
    }
  };

  const handleNextMeasure = () => {
    setIsPlaying(false);
    if (currentMeasureIdx < currentPiece.measures.length - 1) {
      setCurrentMeasureIdx(prev => prev + 1);
      setCompletedSession(false);
    } else {
      setCompletedSession(true);
    }
  };

  const handlePrevMeasure = () => {
    setIsPlaying(false);
    setCompletedSession(false);
    if (currentMeasureIdx > 0) {
      setCurrentMeasureIdx(prev => prev - 1);
    }
  };

  const handleSelectPiece = (pieceId: string) => {
    const newPiece = repertoire.find((item) => item.id === pieceId);

    if (!newPiece) {
      console.error(`No repertoire piece found with id "${pieceId}"`);
      return;
    }
    setSelectedPiece(pieceId);
    setCurrentMeasureIdx(0);
    setIsPlaying(false);
    setCompletedSession(false);
    setSelectedEditNoteIdx(-1);
  };

  const updateCurrentPiece = (update: (piece: MusicObject) => MusicObject) => {
    onUpdatePiece(update(currentPiece));
  };

  const handleAddNote = () => {
    const note = { pitch: currentMeasure.at(-1)?.pitch ?? "A4", duration: 1 };
    const split = splitMeasureByCapacity(
      [...currentMeasure, note],
      measureBeatCount,
      currentMeasure.length,
    );
    updateCurrentPiece((piece) => ({
      ...piece,
      measures: [
        ...piece.measures.slice(0, currentMeasureIdx),
        ...split.measures,
        ...piece.measures.slice(currentMeasureIdx + 1),
      ],
    }));
    if (split.selectedLocation) {
      setCurrentMeasureIdx(currentMeasureIdx + split.selectedLocation.measureOffset);
      setSelectedEditNoteIdx(split.selectedLocation.noteIndex);
    }
  };

  const handleDeleteNote = () => {
    if (!selectedEditNote) return;
    updateCurrentPiece((piece) => ({
      ...piece,
      measures: piece.measures.map((measure, idx) =>
        idx === currentMeasureIdx
          ? measure.filter((_, noteIdx) => noteIdx !== selectedEditNoteIdx)
          : measure,
      ),
    }));
    setSelectedEditNoteIdx(Math.min(selectedEditNoteIdx, currentMeasure.length - 2));
  };

  const handleMoveNote = (step: number) => {
    if (!selectedEditNote) return;
    const pitchIdx = PITCHES.indexOf(selectedEditNote.pitch);
    const nextPitch = PITCHES[pitchIdx + step];
    if (!nextPitch) return;
    updateCurrentPiece((piece) => ({
      ...piece,
      measures: piece.measures.map((measure, idx) =>
        idx === currentMeasureIdx
          ? measure.map((note, noteIdx) =>
              noteIdx === selectedEditNoteIdx ? { ...note, pitch: nextPitch } : note,
            )
          : measure,
      ),
    }));
  };

  const handleChangeDuration = (duration: number) => {
    if (!selectedEditNote) return;
    const updatedMeasure = currentMeasure.map((note, noteIdx) =>
      noteIdx === selectedEditNoteIdx ? { ...note, duration } : note,
    );
    const split = splitMeasureByCapacity(
      updatedMeasure,
      measureBeatCount,
      selectedEditNoteIdx,
    );
    updateCurrentPiece((piece) => ({
      ...piece,
      measures: [
        ...piece.measures.slice(0, currentMeasureIdx),
        ...split.measures,
        ...piece.measures.slice(currentMeasureIdx + 1),
      ],
    }));
    if (split.selectedLocation) {
      setCurrentMeasureIdx(currentMeasureIdx + split.selectedLocation.measureOffset);
      setSelectedEditNoteIdx(split.selectedLocation.noteIndex);
    }
  };

  const handleChangeTimeSignature = (timeSignature: string) => {
    const nextBeatCount = getMeasureBeatCount(timeSignature);
    if (currentPiece.measures.some((measure) => measure.some((note) => note.duration > nextBeatCount))) {
      window.alert(`Shorten any note longer than ${nextBeatCount} beats before changing to ${timeSignature}.`);
      return;
    }

    const measures: MeasureObject[] = [];
    let updatedCurrentMeasureIdx = 0;
    currentPiece.measures.forEach((measure, idx) => {
      if (idx === currentMeasureIdx) {
        updatedCurrentMeasureIdx = measures.length;
      }
      measures.push(...splitMeasureByCapacity(measure, nextBeatCount).measures);
    });

    updateCurrentPiece((piece) => ({ ...piece, timeSignature, measures }));
    setCurrentMeasureIdx(updatedCurrentMeasureIdx);
    setSelectedEditNoteIdx(-1);
  };

  const handleAddMeasure = () => {
    updateCurrentPiece((piece) => ({ ...piece, measures: [...piece.measures, []] }));
    setCurrentMeasureIdx(currentPiece.measures.length);
    setSelectedEditNoteIdx(-1);
  };

  const handleDeleteMeasure = () => {
    if (currentPiece.measures.length <= 1) return;
    updateCurrentPiece((piece) => ({
      ...piece,
      measures: piece.measures.filter((_, idx) => idx !== currentMeasureIdx),
    }));
    setCurrentMeasureIdx(Math.max(0, currentMeasureIdx - 1));
    setSelectedEditNoteIdx(-1);
  };

  const handleSavePiece = () => {
    if (!currentPiece.title.trim()) {
      window.alert("Give the piece a name before saving.");
      return;
    }

    const file = new Blob([JSON.stringify(currentPiece, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${currentPiece.title.trim().replace(/[^\w-]+/g, "-") || "music"}.json`;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const importedPieces = candidates.filter(isMusicObject);
      if (candidates.length === 0 || importedPieces.length !== candidates.length) {
        throw new Error("The file must contain one piece or an array of valid pieces.");
      }
      setSelectedEditNoteIdx(-1);
      onImportPieces(importedPieces);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The file could not be read.";
      window.alert(`Unable to import music: ${message}`);
    } finally {
      event.target.value = "";
    }
  };

  const handleResetPiece = () => {
    setCurrentMeasureIdx(0);
    setIsPlaying(false);
    setCompletedSession(false);
  };

  return (
    <div className={styles.screen}>
      
      {/* TOP BAR / HEADER */}
      <header className={styles.headerBar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Music className="h-5 w-5" />
          </div>
          <h1 className={styles.brandTitle}>
            Paz&apos;s Violin Reader
          </h1>
        </div>

        <div role="group" aria-label={isEditing ? "Music editing controls" : "Practice controls"} className={styles.controlBar}>
          <MusicSelector
            repertoire={repertoire}
            selectedPieceId={selectedPiece}
            onSelectPiece={handleSelectPiece}
            onCreateNew={() => {
              onCreateNewPiece();
              setIsPlaying(false);
              setIsEditing(true);
              setSelectedEditNoteIdx(-1);
            }}
          />

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setIsEditing((editing) => !editing);
              setSelectedEditNoteIdx(-1);
            }}
            aria-pressed={isEditing}
            className={`${styles.modeButton} ${isEditing ? styles.modeEdit : ""}`}
          >
            {isEditing ? <Play aria-hidden="true" /> : <Pencil aria-hidden="true" />}
            {isEditing ? "Play Mode" : "Edit Mode"}
          </button>

          {isEditing ? (
            <>
              <button type="button" onClick={handleSavePiece} className={styles.editorAction}>
                <Save aria-hidden="true" />
                Save JSON
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className={styles.editorAction}
              >
                <Upload aria-hidden="true" />
                Import
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className={styles.fileInput}
                aria-label="Import music JSON"
              />
            </>
          ) : (
            <>
              <div className={styles.measureControls}>
                <button
                  onClick={handlePrevMeasure}
                  disabled={currentMeasureIdx === 0}
                  aria-label="Previous measure"
                  title="Previous measure"
                  className={styles.iconButton}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleResetPiece}
                  aria-label="Restart piece"
                  title="Restart piece"
                  className={styles.iconButton}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextMeasure}
                  disabled={currentMeasureIdx >= currentPiece.measures.length - 1}
                  aria-label="Next measure"
                  title="Next measure"
                  className={styles.iconButton}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handleAdvanceOrPlay}
                aria-label={isPlaying ? "Pause playback" : "Play measure"}
                title={isPlaying ? "Pause playback" : "Play measure"}
                className={`${styles.playButton} ${isPlaying ? styles.playing : styles.stopped}`}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>

              <label className={styles.tempoControl}>
                <Metronome aria-hidden="true" />
                <span className={styles.visuallyHidden}>Tempo</span>
                <output className={styles.tempoValue}>{bpm}</output>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={bpm}
                  onChange={(event) => setBpm(Number(event.target.value))}
                  aria-label="Tempo in beats per minute"
                  className={styles.tempoSlider}
                />
                <span>BPM</span>
              </label>

              <button
                onClick={() => setUseAutoAdvance(!useAutoAdvance)}
                aria-pressed={useAutoAdvance}
                title="Toggle automatic measure advance"
                className={`${styles.autoAdvanceButton} ${useAutoAdvance ? styles.enabled : ""}`}
              >
                Auto
              </button>

              <label className={styles.audioToggle}>
                <input
                  type="checkbox"
                  checked={metronomeEnabled}
                  onChange={(event) => setMetronomeEnabled(event.target.checked)}
                />
                <Metronome aria-hidden="true" />
                <span>Beat</span>
              </label>
              <label className={styles.audioToggle}>
                <input
                  type="checkbox"
                  checked={audioPlayAlong}
                  onChange={(event) => setAudioPlayAlong(event.target.checked)}
                />
                <Volume2 aria-hidden="true" />
                <span>Audio</span>
              </label>

              <div className={styles.displayOptions}>
                <label title="Color notes by violin string" className={styles.displayToggle}>
                  <input type="checkbox" checked={useColorCoding} onChange={(event) => setUseColorCoding(event.target.checked)} />
                  <Palette aria-hidden="true" />
                  <span>Color</span>
                </label>
                <label title="Show note names" className={styles.displayToggle}>
                  <input type="checkbox" checked={showNoteNames} onChange={(event) => setShowNoteNames(event.target.checked)} />
                  <Eye aria-hidden="true" />
                  <span>Names</span>
                </label>
                <label title="Show finger numbers" className={styles.displayToggle}>
                  <input type="checkbox" checked={showFingerings} onChange={(event) => setShowFingerings(event.target.checked)} />
                  <Hash aria-hidden="true" />
                  <span>Fingers</span>
                </label>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className={styles.main}>
        
        {/* LEFT / CENTER: REPERTOIRE MENU & NOTATION DISPLAY */}
        <div className={styles.scoreLayout}>
          
          {/* MEASURE NOTATION DISPLAY CARD (HIGH CONTRAST, LARGE) */}
          <section className={styles.scoreCard}>
            
            {/* Header info inside display */}
            <div className={styles.scoreHeader}>
              <div className={styles.pieceHeading}>
                <span className={styles.sectionLabel}>Current Piece</span>
                {isEditing ? (
                  <input
                    value={currentPiece.title}
                    onChange={(event) => updateCurrentPiece((piece) => ({ ...piece, title: event.target.value }))}
                    aria-label="Piece title"
                    className={styles.titleInput}
                  />
                ) : (
                  <h2 className={styles.pieceTitle}>{currentPiece.title}</h2>
                )}
              </div>
              
              <div className={styles.measureHeading}>
                <span className={styles.sectionLabel}>Measure</span>
                <div className={styles.measureCount}>
                  {currentMeasureIdx + 1}<span> / {currentPiece.measures.length}</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className={styles.editorToolbar}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMeasureIdx((index) => index - 1);
                    setSelectedEditNoteIdx(-1);
                  }}
                  disabled={currentMeasureIdx === 0}
                  aria-label="Previous measure"
                  title="Previous measure"
                  className={styles.editorIconButton}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMeasureIdx((index) => index + 1);
                    setSelectedEditNoteIdx(-1);
                  }}
                  disabled={currentMeasureIdx >= currentPiece.measures.length - 1}
                  aria-label="Next measure"
                  title="Next measure"
                  className={styles.editorIconButton}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
                <button type="button" onClick={handleAddMeasure} className={styles.editorAction}>
                  <Plus aria-hidden="true" />
                  Add Measure
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMeasure}
                  disabled={currentPiece.measures.length <= 1}
                  className={`${styles.editorAction} ${styles.dangerAction}`}
                >
                  <Trash2 aria-hidden="true" />
                  Delete Measure
                </button>
                <label className={styles.editorField}>
                  <span>Time signature</span>
                  <select
                    value={currentPiece.timeSignature}
                    onChange={(event) => handleChangeTimeSignature(event.target.value)}
                    aria-label="Time signature"
                    className={styles.editorSelect}
                  >
                    {TIME_SIGNATURES.map((timeSignature) => (
                      <option key={timeSignature} value={timeSignature}>{timeSignature}</option>
                    ))}
                  </select>
                </label>
                <span className={styles.toolbarDivider} aria-hidden="true" />
                <button type="button" onClick={handleAddNote} className={styles.editorAction}>
                  <Plus aria-hidden="true" />
                  Add Note
                </button>
                <label className={styles.editorField}>
                  <span>Selected note</span>
                  <select
                    value={selectedEditNote ? selectedEditNoteIdx : ""}
                    onChange={(event) => setSelectedEditNoteIdx(event.target.value === "" ? -1 : Number(event.target.value))}
                    aria-label="Select note to edit"
                    className={styles.editorSelect}
                  >
                    <option value="">None</option>
                    {currentMeasure.map((note, idx) => (
                      <option key={idx} value={idx}>{`${idx + 1}: ${note.pitch}`}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.editorField}>
                  <span>Duration</span>
                  <select
                    value={selectedEditNote?.duration ?? ""}
                    onChange={(event) => handleChangeDuration(Number(event.target.value))}
                    disabled={!selectedEditNote}
                    aria-label="Note duration in beats"
                    className={styles.editorSelect}
                  >
                    <option value="" disabled>Select a note</option>
                    {NOTE_DURATIONS.filter((duration) => duration <= measureBeatCount).map((duration) => (
                      <option key={duration} value={duration}>{duration} {duration === 1 ? "beat" : "beats"}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => handleMoveNote(1)}
                  disabled={!selectedEditNote || PITCHES.indexOf(selectedEditNote.pitch) === PITCHES.length - 1}
                  aria-label="Move note up"
                  title="Move note up"
                  className={styles.editorIconButton}
                >
                  <ArrowUp aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveNote(-1)}
                  disabled={!selectedEditNote || PITCHES.indexOf(selectedEditNote.pitch) === 0}
                  aria-label="Move note down"
                  title="Move note down"
                  className={styles.editorIconButton}
                >
                  <ArrowDown aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  disabled={!selectedEditNote}
                  aria-label="Delete selected note"
                  title="Delete selected note"
                  className={`${styles.editorIconButton} ${styles.dangerAction}`}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            )}

            {/* COMPLETION BANNER */}
            {completedSession && !isEditing ? (
              <div className={styles.completionMessage}>
                <Sparkles aria-hidden="true" className={styles.completionIcon} />
                <h3>Piece Complete!</h3>
                <p>Excellent work! Time for your final bow!</p>
                <button
                  onClick={handleResetPiece}
                  className={styles.restartButton}
                >
                  <RotateCcw aria-hidden="true" />
                  <span>Play Again From Start</span>
                </button>
              </div>
            ) : (
              /* NOTATION CANVAS / SVG */
              <div className={styles.notationArea}>
                
                {/* SVG SHEET MUSIC DISPLAY */}
                <MeasureSVG 
                  measure={currentMeasure}
                  timeSignature={currentPiece.timeSignature}
                  activeNoteIdx={activeNoteIdx}
                  showNoteNames={showNoteNames}
                  showFingerings={showFingerings}
                  useColorCoding={useColorCoding}
                  isEditing={isEditing}
                  selectedEditNoteIdx={selectedEditNoteIdx}
                  onSelectNote={setSelectedEditNoteIdx}
                />

                {/* BEAT PROGRESS INDICATOR */}
                {!isEditing && <div className={styles.beatProgress} aria-label="Beat progress">
                  {Array.from({ length: measureBeatCount }, (_, b) => (
                    <div 
                      key={b}
                      className={`${styles.beatIndicator} ${activeBeat === b ? styles.activeBeat : ""}`}
                    />
                  ))}
                </div>}
              </div>
            )}

          </section>

          {/* STRING COLOR LEGEND */}
        </div>

        {/* RIGHT: CONTROL PANEL & DISPLAY TOGGLES (SIDEBAR OR TOGGLED) */}
        <div className={styles.legacySidebar} aria-hidden="true">
          
          {/* TEMPO & PLAYBACK MODE */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <Metronome className="w-5 h-5 text-indigo-400" />
              <span>Tempo & Advance Mode</span>
            </h3>

            {/* BPM Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Tempo (BPM)</span>
                <span className="text-2xl font-black text-indigo-400 font-mono">{bpm}</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="160" 
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>40 (Slow)</span>
                <span>100 (Medium)</span>
                <span>160 (Fast)</span>
              </div>
            </div>

            {/* Advance Mode Toggle Switch */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Advance Method</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUseAutoAdvance(false)}
                  className={`p-2.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition ${
                    !useAutoAdvance 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>Interactive</span>
                  <span className="text-[10px] font-normal opacity-80">(Manual/Tap)</span>
                </button>
                <button
                  onClick={() => setUseAutoAdvance(true)}
                  className={`p-2.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition ${
                    useAutoAdvance 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>Auto-Advance</span>
                  <span className="text-[10px] font-normal opacity-80">(Continuous)</span>
                </button>
              </div>
            </div>

            {/* Audio Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-700/60">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Metronome className="w-4 h-4 text-slate-400" /> Metronome Beat
                </span>
                <input 
                  type="checkbox" 
                  checked={metronomeEnabled} 
                  onChange={(e) => setMetronomeEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-400" /> Audio Play-Along
                </span>
                <input 
                  type="checkbox" 
                  checked={audioPlayAlong} 
                  onChange={(e) => setAudioPlayAlong(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* VISUAL & NOTATION ACCESSIBILITY TOGGLES */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              <span>Notation Assistants</span>
            </h3>

            <div className="space-y-4">
              
              {/* String Color Coding Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-700/50">
                <div>
                  <span className="text-sm font-bold text-white block">String Colors</span>
                  <span className="text-xs text-slate-400">Color notes by G, D, A, E string</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={useColorCoding} 
                  onChange={(e) => setUseColorCoding(e.target.checked)}
                  className="w-6 h-6 rounded accent-indigo-500 cursor-pointer"
                />
              </label>

              {/* Note Names Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-700/50">
                <div>
                  <span className="text-sm font-bold text-white block">Note Names</span>
                  <span className="text-xs text-slate-400">Display A, B, C#, D labels</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showNoteNames} 
                  onChange={(e) => setShowNoteNames(e.target.checked)}
                  className="w-6 h-6 rounded accent-indigo-500 cursor-pointer"
                />
              </label>

              {/* Fingerings Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-700/50">
                <div>
                  <span className="text-sm font-bold text-white block">Finger Numbers</span>
                  <span className="text-xs text-slate-400">Display 0, 1, 2, 3 above notes</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showFingerings} 
                  onChange={(e) => setShowFingerings(e.target.checked)}
                  className="w-6 h-6 rounded accent-indigo-500 cursor-pointer"
                />
              </label>

            </div>
          </div>

          {/* STAND PRACTICE TIP */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-4 text-xs text-indigo-300">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-indigo-200">
              <Sparkles className="w-4 h-4 text-amber-400" /> Stand Practice Tip
            </p>
            Press <strong>Spacebar</strong> or tap anywhere on the giant green button to advance to the next measure while holding your violin!
          </div>

        </div>

      </main>

    </div>
  );
};

// ============================================================================
// MEASURE SVG NOTATION RENDERER
// ============================================================================
function MeasureSVG({
  measure,
  timeSignature,
  activeNoteIdx,
  showNoteNames,
  showFingerings,
  useColorCoding,
  isEditing,
  selectedEditNoteIdx,
  onSelectNote,
}: MeasureSVGProps) {
  // SVG Dimensions & Layout Constants
  const width = 600;
  const height = 240;
  const staffTopY = 80;
  const lineSpacing = 16; // Distance between staff lines

  // 5 Staff Lines Y positions: F5 (line 5), D5 (line 4), B4 (line 3), G4 (line 2), E4 (line 1)
  const staffLines = [0, 1, 2, 3, 4].map(i => staffTopY + i * lineSpacing);

  // Measure start and end X
  const staffStartX = 80;
  const staffEndX = width - 40;

  // Calculate note positions
  const notePositionsX = [200, 305, 410, 515]; // 4 note slots per measure
  const [timeNumerator, timeDenominator] = timeSignature.split("/");

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className={styles.notationSvg}
    >
      {/* Background container glow */}
      <rect x="0" y="0" width={width} height={height} rx="16" fill="#020617" />

      {/* TREBLE CLEF */}
      <image
        href="/images/g-clef.svg"
        x={staffStartX + 4}
        y={staffTopY - 22}
        width="70"
        height="120"
        aria-label="Treble clef"
      />

      {/* STAFF LINES (5 Lines) */}
      {staffLines.map((y, idx) => (
        <line 
          key={idx} 
          x1={staffStartX} 
          y1={y} 
          x2={staffEndX} 
          y2={y} 
          stroke="#475569" 
          strokeWidth="3" 
        />
      ))}

      {/* START & END BAR LINES */}
      <line x1={staffStartX} y1={staffLines[0]} x2={staffStartX} y2={staffLines[4]} stroke="#94A3B8" strokeWidth="4" />
      <line x1={staffEndX} y1={staffLines[0]} x2={staffEndX} y2={staffLines[4]} stroke="#94A3B8" strokeWidth="6" />

      {/* TIME SIGNATURE */}
      <text x={staffStartX + 85} y={staffLines[1] + 6} fill="#CBD5E1" fontSize="24" fontWeight="bold" textAnchor="middle">{timeNumerator}</text>
      <text x={staffStartX + 85} y={staffLines[3] + 6} fill="#CBD5E1" fontSize="24" fontWeight="bold" textAnchor="middle">{timeDenominator}</text>

      {/* RENDER NOTES IN MEASURE */}
      {measure.map((note, idx) => {
        const pitchData = PITCH_MAP[note.pitch] || PITCH_MAP['A4'];
        const stringInfo = STRING_COLORS[pitchData.string];
        const noteColor = useColorCoding ? stringInfo.hex : '#F8FAFC';

        const cx = measure.length > 4
          ? 200 + idx * (315 / (measure.length - 1))
          : notePositionsX[idx] || (200 + idx * 100);
        const baseDuration = 2 ** Math.floor(Math.log2(note.duration));
        const isDotted = note.duration === baseDuration * 1.5;
        const noteValue = isDotted ? baseDuration : note.duration;
        const hasStem = noteValue < 4;
        const hasOpenHead = noteValue >= 2;
        const flagCount = noteValue < 1 ? Math.round(Math.log2(1 / noteValue)) : 0;

        // Pitch step mapping: E4 (bottom line) is pitchStep = 2.
        // Y position formula based on pitchStep from E4
        const bottomLineY = staffLines[4]; // E4
        const noteY = bottomLineY - (pitchData.pitchStep - 2) * (lineSpacing / 2);

        const isActive = activeNoteIdx === idx;
        const isSelected = isEditing && selectedEditNoteIdx === idx;
        const stemUp = noteY > staffLines[2]; // Stem up if below middle line
        const stemX = stemUp ? cx + 11 : cx - 11;
        const stemEndY = stemUp ? noteY - 48 : noteY + 48;

        return (
          <g
            key={idx}
            className="transition-all duration-200"
            onClick={isEditing ? () => onSelectNote(idx) : undefined}
            onKeyDown={isEditing ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectNote(idx);
              }
            } : undefined}
            role={isEditing ? "button" : undefined}
            tabIndex={isEditing ? 0 : undefined}
            aria-label={isEditing ? `Select ${note.pitch}, ${note.duration} beats` : undefined}
          >
            {isSelected && (
              <circle
                cx={cx}
                cy={noteY}
                r="23"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray="4 3"
              />
            )}

            {/* ACTIVE NOTE HIGHLIGHT GLOW */}
            {isActive && (
              <circle 
                cx={cx} 
                cy={noteY} 
                r="28" 
                fill={noteColor} 
                fillOpacity="0.35" 
                className="animate-ping"
              />
            )}

            {/* LEDGER LINES (for notes above or below staff) */}
            {/* A3 / G3 Ledger lines below */}
            {pitchData.pitchStep <= 0 && (
              <line 
                x1={cx - 18} 
                y1={bottomLineY + lineSpacing} 
                x2={cx + 18} 
                y2={bottomLineY + lineSpacing} 
                stroke="#64748B" 
                strokeWidth="3" 
              />
            )}
            {/* High A5 Ledger lines above */}
            {pitchData.pitchStep >= 12 && (
              <line 
                x1={cx - 18} 
                y1={staffLines[0] - lineSpacing} 
                x2={cx + 18} 
                y2={staffLines[0] - lineSpacing} 
                stroke="#64748B" 
                strokeWidth="3" 
              />
            )}

            {/* NOTEHEAD */}
            <ellipse 
              cx={cx} 
              cy={noteY} 
              rx="13" 
              ry="9.5" 
              transform={`rotate(-20 ${cx} ${noteY})`}
              fill={hasOpenHead ? '#020617' : isActive ? '#FFFFFF' : noteColor}
              stroke={isActive ? '#FFFFFF' : hasOpenHead ? noteColor : '#020617'}
              strokeWidth="2"
            />

            {hasStem && (
              <>
                <line
                  x1={stemX}
                  y1={noteY}
                  x2={stemX}
                  y2={stemEndY}
                  stroke={isActive ? '#FFFFFF' : noteColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {Array.from({ length: flagCount }, (_, flagIdx) => {
                  const flagY = stemEndY + (stemUp ? flagIdx : -flagIdx) * 10;
                  const flagPath = stemUp
                    ? `M ${stemX} ${flagY} C ${stemX + 4} ${flagY + 8}, ${stemX + 20} ${flagY + 8}, ${stemX + 13} ${flagY + 20}`
                    : `M ${stemX} ${flagY} C ${stemX - 4} ${flagY - 8}, ${stemX - 20} ${flagY - 8}, ${stemX - 13} ${flagY - 20}`;

                  return (
                    <path
                      key={flagIdx}
                      d={flagPath}
                      fill="none"
                      stroke={isActive ? '#FFFFFF' : noteColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </>
            )}

            {isDotted && (
              <circle
                cx={cx + 22}
                cy={noteY - 2}
                r="3.5"
                fill={isActive ? '#FFFFFF' : noteColor}
              />
            )}

            {/* FINGERINGS (Above staff/note) */}
            {showFingerings && (
              <g>
                <circle 
                  cx={cx} 
                  cy={24} 
                  r="14" 
                  fill="#1E293B" 
                  stroke={noteColor} 
                  strokeWidth="2" 
                />
                <text 
                  x={cx} 
                  y={29} 
                  fill="#F8FAFC" 
                  fontSize="15" 
                  fontWeight="900" 
                  textAnchor="middle"
                >
                  {pitchData.finger}
                </text>
              </g>
            )}

            {/* NOTE NAMES (Below note or staff) */}
            {showNoteNames && (
              <text 
                x={cx} 
                y={height - 12} 
                fill={noteColor} 
                fontSize="18" 
                fontWeight="800" 
                textAnchor="middle"
              >
                {pitchData.noteName}
              </text>
            )}

          </g>
        );
      })}

    </svg>
  );
}

function splitMeasureByCapacity(
  measure: MeasureObject,
  beatCapacity: number,
  selectedNoteIdx = -1,
) {
  const measures: MeasureObject[] = [[]];
  let accumulatedBeats = 0;
  let selectedLocation: { measureOffset: number; noteIndex: number } | undefined;

  measure.forEach((note, idx) => {
    let currentMeasure = measures[measures.length - 1];
    if (currentMeasure.length > 0 && accumulatedBeats + note.duration > beatCapacity) {
      measures.push([]);
      accumulatedBeats = 0;
      currentMeasure = measures[measures.length - 1];
    }

    if (idx === selectedNoteIdx) {
      selectedLocation = {
        measureOffset: measures.length - 1,
        noteIndex: currentMeasure.length,
      };
    }
    currentMeasure.push(note);
    accumulatedBeats += note.duration;
  });

  return { measures, selectedLocation };
}

function isMusicObject(value: unknown): value is MusicObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const piece = value as Record<string, unknown>;
  if (
    typeof piece.id !== "string" ||
    !piece.id.trim() ||
    typeof piece.title !== "string" ||
    !piece.title.trim() ||
    typeof piece.timeSignature !== "string" ||
    typeof piece.measures === "undefined" ||
    !Array.isArray(piece.measures) ||
    piece.measures.length === 0 ||
    (piece.keySignature !== undefined && typeof piece.keySignature !== "string")
  ) {
    return false;
  }

  if (!TIME_SIGNATURES.includes(piece.timeSignature as (typeof TIME_SIGNATURES)[number])) {
    return false;
  }

  const beatCapacity = getMeasureBeatCount(piece.timeSignature);
  return piece.measures.every((measure) =>
    Array.isArray(measure) &&
    measure.every((note) =>
      typeof note === "object" &&
      note !== null &&
      !Array.isArray(note) &&
      typeof note.pitch === "string" &&
      Object.prototype.hasOwnProperty.call(PITCH_MAP, note.pitch) &&
      typeof note.duration === "number" &&
      NOTE_DURATIONS.includes(note.duration),
    ) &&
    measure.reduce((total, note) => total + note.duration, 0) <= beatCapacity,
  );
}