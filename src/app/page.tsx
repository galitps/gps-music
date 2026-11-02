"use client";

import { useState } from 'react';
import NotesDisplay from "@/components/NotesDisplay/NotesDisplay";
import MusicPlayer from "@/components/Player/MusicPlayer";
import { REPERTOIRE } from "@/components/MusicLoader/BuiltInMusic";

export default function GPSMusicApp () {

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMeasureIdx, setCurrentMeasureIdx] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState(REPERTOIRE[0].id);
  const [completedSession, setCompletedSession] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useColorCoding,setUseColorCoding] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showFingerings, setShowFingerings] = useState(true);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [activeNoteIdx, setActiveNoteIdx] = useState(-1);
  const [bpm, setBpm] = useState(72);
  const [useAutoAdvance, setUseAutoAdvance] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [audioPlayAlong, setAudioPlayAlong] = useState(true);
  const currentPiece =
    REPERTOIRE.find((piece) => piece.id === selectedPiece) ?? REPERTOIRE[0];

  return (
    <>
      <NotesDisplay
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentMeasureIdx={currentMeasureIdx}
        setCurrentMeasureIdx={setCurrentMeasureIdx}
        selectedPiece={selectedPiece}
        setSelectedPiece={setSelectedPiece}
        completedSession={completedSession}
        setCompletedSession={setCompletedSession}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        useColorCoding={useColorCoding}
        setUseColorCoding={setUseColorCoding}
        showNoteNames={showNoteNames}
        setShowNoteNames={setShowNoteNames}
        showFingerings={showFingerings}
        setShowFingerings={setShowFingerings}
        activeBeat={activeBeat}
        setActiveBeat={setActiveBeat}
        activeNoteIdx={activeNoteIdx}
        setActiveNoteIdx={setActiveNoteIdx}
        bpm={bpm}
        setBpm={setBpm}
        useAutoAdvance={useAutoAdvance}
        setUseAutoAdvance={setUseAutoAdvance}
        metronomeEnabled={metronomeEnabled}
        setMetronomeEnabled={setMetronomeEnabled}
        audioPlayAlong={audioPlayAlong}
        setAudioPlayAlong={setAudioPlayAlong}
      />
      <MusicPlayer
        selectedPiece={currentPiece}
        currentMeasureIdx={currentMeasureIdx}
        setCurrentMeasureIdx={setCurrentMeasureIdx}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setCompletedSession={setCompletedSession}
        bpm={bpm}
        useAutoAdvance={useAutoAdvance}
        metronomeEnabled={metronomeEnabled}
        audioPlayAlong={audioPlayAlong}
        setActiveBeat={setActiveBeat}
        setActiveNoteIdx={setActiveNoteIdx}
      />
    </>
  );
}