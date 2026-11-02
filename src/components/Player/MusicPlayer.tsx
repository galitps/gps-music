import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MusicObject } from "@/types/music";
import { PITCH_MAP } from "@/components/NotesDisplay/NotesDisplay";

type MusicPlayerProps = {
  selectedPiece: MusicObject;
  currentMeasureIdx: number;
  setCurrentMeasureIdx: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setCompletedSession: Dispatch<SetStateAction<boolean>>;
  bpm: number;
  useAutoAdvance: boolean;
  metronomeEnabled: boolean;
  audioPlayAlong: boolean;
  setActiveBeat: Dispatch<SetStateAction<number>>;
  setActiveNoteIdx: Dispatch<SetStateAction<number>>;
};

export default function MusicPlayer({
  selectedPiece,
  currentMeasureIdx,
  setCurrentMeasureIdx,
  isPlaying,
  setIsPlaying,
  setCompletedSession,
  bpm,
  useAutoAdvance,
  metronomeEnabled,
  audioPlayAlong,
  setActiveBeat,
  setActiveNoteIdx,
}: MusicPlayerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  };

  const playClick = (isFirstBeat = false) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 700, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.warn("Audio Context error", error);
    }
  };

  const playNoteAudio = (freq: number, durationInSec: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + Math.max(durationInSec - 0.02, 0.03),
      );

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationInSec);
    } catch (error) {
      console.warn("Audio Context error", error);
    }
  };

  const currentMeasure = selectedPiece.measures[currentMeasureIdx] ?? [];

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let completionTimeoutId: ReturnType<typeof setTimeout> | undefined;

    if (!isPlaying) {
      setActiveBeat(-1);
      setActiveNoteIdx(-1);
      return;
    }

    const beatDurationMs = (60 / bpm) * 1000;
    let beatCounter = 0;
    setActiveBeat(0);

    const runBeat = () => {
      if (beatCounter >= 4) {
        return;
      }

      const beatNum = beatCounter % 4;
      setActiveBeat(beatNum);

      let accumulatedBeats = 0;
      let matchedNoteIdx = -1;

      for (let i = 0; i < currentMeasure.length; i++) {
        const note = currentMeasure[i];
        if (
          beatCounter >= accumulatedBeats &&
          beatCounter < accumulatedBeats + note.duration
        ) {
          matchedNoteIdx = i;
          if (beatCounter === accumulatedBeats && audioPlayAlong) {
            const pitchInfo = PITCH_MAP[note.pitch];
            if (pitchInfo) {
              playNoteAudio(pitchInfo.freq, (note.duration * 60) / bpm);
            }
          }
          break;
        }
        accumulatedBeats += note.duration;
      }

      setActiveNoteIdx(matchedNoteIdx);

      if (metronomeEnabled) {
        playClick(beatNum === 0);
      }

      beatCounter++;
      if (beatCounter === 4) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }

        completionTimeoutId = setTimeout(() => {
          if (useAutoAdvance && currentMeasureIdx < selectedPiece.measures.length - 1) {
            setCurrentMeasureIdx((index) => index + 1);
          } else {
            setIsPlaying(false);
            if (useAutoAdvance) {
              setCompletedSession(true);
            }
            setActiveBeat(-1);
            setActiveNoteIdx(-1);
          }
        }, beatDurationMs);
      }
    };

    runBeat();
    intervalId = setInterval(runBeat, beatDurationMs);

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      if (completionTimeoutId !== undefined) {
        clearTimeout(completionTimeoutId);
      }
    };
  }, [
    isPlaying,
    currentMeasureIdx,
    currentMeasure,
    bpm,
    useAutoAdvance,
    metronomeEnabled,
    audioPlayAlong,
    selectedPiece,
    setActiveBeat,
    setActiveNoteIdx,
    setCompletedSession,
    setCurrentMeasureIdx,
    setIsPlaying,
  ]);

  return null;
}
