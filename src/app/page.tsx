"use client";

import { useState } from 'react';
import NotesDisplay from "@/components/NotesDisplay/NotesDisplay";
import MusicPlayer from "@/components/Player/MusicPlayer";
import { REPERTOIRE } from "@/components/MusicLoader/BuiltInMusic";
import type { MusicObject } from "@/types/music";

export default function GPSMusicApp () {

  const [repertoire, setRepertoire] = useState<MusicObject[]>(REPERTOIRE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMeasureIdx, setCurrentMeasureIdx] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState(repertoire[0].id);
  const [completedSession, setCompletedSession] = useState(false);
  const [useColorCoding,setUseColorCoding] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showFingerings, setShowFingerings] = useState(true);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [activeNoteIdx, setActiveNoteIdx] = useState(-1);
  const [bpm, setBpm] = useState(72);
  const [useAutoAdvance, setUseAutoAdvance] = useState(true);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [audioPlayAlong, setAudioPlayAlong] = useState(true);
  const currentPiece =
    repertoire.find((piece) => piece.id === selectedPiece) ?? repertoire[0];

  const handleCreateNewPiece = () => {
    const title = getUniqueTitle("New Piece", repertoire);
    const newPiece: MusicObject = {
      id: `piece-${crypto.randomUUID()}`,
      title,
      timeSignature: "4/4",
      measures: [[]],
    };
    setRepertoire((pieces) => [...pieces, newPiece]);
    setSelectedPiece(newPiece.id);
    setCurrentMeasureIdx(0);
    setIsPlaying(false);
    setCompletedSession(false);
  };

  const handleUpdatePiece = (updatedPiece: MusicObject) => {
    setRepertoire((pieces) =>
      pieces.map((piece) => piece.id === updatedPiece.id ? updatedPiece : piece),
    );
  };

  const handleImportPieces = (importedPieces: MusicObject[]) => {
    const updatedRepertoire = [...repertoire];
    let firstImportedId: string | undefined;

    importedPieces.forEach((importedPiece) => {
      const titleConflictIndex = updatedRepertoire.findIndex(
        (piece) => piece.title.trim().toLocaleLowerCase() === importedPiece.title.trim().toLocaleLowerCase(),
      );
      const pieceToImport = { ...importedPiece };

      if (titleConflictIndex >= 0) {
        const existingPiece = updatedRepertoire[titleConflictIndex];
        const shouldReplace = window.confirm(
          `A piece named "${existingPiece.title}" already exists. Replace it? Choose Cancel to import a renamed copy.`,
        );
        if (shouldReplace) {
          pieceToImport.id = existingPiece.id;
          updatedRepertoire[titleConflictIndex] = pieceToImport;
        } else {
          pieceToImport.title = getUniqueTitle(pieceToImport.title, updatedRepertoire);
          pieceToImport.id = `piece-${crypto.randomUUID()}`;
          updatedRepertoire.push(pieceToImport);
        }
      } else {
        if (updatedRepertoire.some((piece) => piece.id === pieceToImport.id)) {
          pieceToImport.id = `piece-${crypto.randomUUID()}`;
        }
        updatedRepertoire.push(pieceToImport);
      }

      firstImportedId ??= pieceToImport.id;
    });

    setRepertoire(updatedRepertoire);
    if (firstImportedId) {
      setSelectedPiece(firstImportedId);
      setCurrentMeasureIdx(0);
      setIsPlaying(false);
      setCompletedSession(false);
    }
  };

  return (
    <>
      <NotesDisplay
        repertoire={repertoire}
        onCreateNewPiece={handleCreateNewPiece}
        onUpdatePiece={handleUpdatePiece}
        onImportPieces={handleImportPieces}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentMeasureIdx={currentMeasureIdx}
        setCurrentMeasureIdx={setCurrentMeasureIdx}
        selectedPiece={selectedPiece}
        setSelectedPiece={setSelectedPiece}
        completedSession={completedSession}
        setCompletedSession={setCompletedSession}
        useColorCoding={useColorCoding}
        setUseColorCoding={setUseColorCoding}
        showNoteNames={showNoteNames}
        setShowNoteNames={setShowNoteNames}
        showFingerings={showFingerings}
        setShowFingerings={setShowFingerings}
        activeBeat={activeBeat}
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

function getUniqueTitle(title: string, pieces: readonly MusicObject[]) {
  const existingTitles = new Set(pieces.map((piece) => piece.title.trim().toLocaleLowerCase()));
  if (!existingTitles.has(title.trim().toLocaleLowerCase())) {
    return title;
  }

  let version = 2;
  while (existingTitles.has(`${title} (${version})`.trim().toLocaleLowerCase())) {
    version += 1;
  }
  return `${title} (${version})`;
}