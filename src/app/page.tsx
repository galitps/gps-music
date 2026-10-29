import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Settings, Music, Eye, Palette, Hash, Sparkles, ChevronRight, ChevronLeft,
  Check, ListMusic, Metronome, Sliders
} from 'lucide-react';



  // --- KEYBOARD SHORTCUT (Spacebar to Advance / Play) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [isPlaying, currentMeasureIdx, selectedPiece]);

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
    if (currentMeasureIdx < selectedPiece.measures.length - 1) {
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

  const handleSelectPiece = (piece) => {
    setSelectedPiece(piece);
    setCurrentMeasureIdx(0);
    setIsPlaying(false);
    setCompletedSession(false);
  };

  const handleResetPiece = () => {
    setCurrentMeasureIdx(0);
    setIsPlaying(false);
    setCompletedSession(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* TOP BAR / HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-md text-white">
            <Music className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white flex items-center gap-2">
              Paz's Violin Reader
            </h1>
            <p className="text-xs text-slate-400 font-medium">One Measure Sight-Reading</p>
          </div>
        </div>

        {/* Quick Actions & Settings Toggle */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="hidden sm:inline">Display & Options</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        
        {/* LEFT / CENTER: REPERTOIRE MENU & NOTATION DISPLAY */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* REPERTOIRE MENU / SELECTOR (LARGE TABS) */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 md:p-4 shadow-md">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ListMusic className="w-4 h-4 text-indigo-400" />
              <span>Select Piece</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {REPERTOIRE.map((piece) => {
                const isSelected = selectedPiece.id === piece.id;
                return (
                  <button
                    key={piece.id}
                    onClick={() => handleSelectPiece(piece)}
                    className={`px-4 py-3 rounded-xl font-bold text-base md:text-lg whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-102' 
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-650 hover:text-white'
                    }`}
                  >
                    <span>{piece.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEASURE NOTATION DISPLAY CARD (HIGH CONTRAST, LARGE) */}
          <div className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-3xl p-4 md:p-8 flex flex-col justify-between shadow-2xl relative min-h-[380px] overflow-hidden">
            
            {/* Header info inside display */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-2">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Current Piece</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{selectedPiece.title}</h2>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Measure</span>
                <div className="text-2xl md:text-3xl font-black text-amber-400">
                  {currentMeasureIdx + 1} <span className="text-slate-500 text-lg font-bold">/ {selectedPiece.measures.length}</span>
                </div>
              </div>
            </div>

            {/* COMPLETION BANNER */}
            {completedSession ? (
              <div className="my-auto py-12 text-center bg-indigo-950/60 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-inner animate-pulse">
                <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                <h3 className="text-3xl font-extrabold text-white mb-2">Piece Complete!</h3>
                <p className="text-lg text-indigo-200 mb-6">Excellent work! Time for your final bow!</p>
                <button
                  onClick={handleResetPiece}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span>Play Again From Start</span>
                </button>
              </div>
            ) : (
              /* NOTATION CANVAS / SVG */
              <div className="my-auto py-6 flex flex-col items-center justify-center relative">
                
                {/* SVG SHEET MUSIC DISPLAY */}
                <MeasureSVG 
                  measure={currentMeasure}
                  activeNoteIdx={activeNoteIdx}
                  showNoteNames={showNoteNames}
                  showFingerings={showFingerings}
                  useColorCoding={useColorCoding}
                />

                {/* BEAT PROGRESS INDICATOR */}
                <div className="flex gap-3 mt-6 items-center">
                  {[0, 1, 2, 3].map((b) => (
                    <div 
                      key={b}
                      className={`h-4 rounded-full transition-all duration-150 ${
                        activeBeat === b 
                          ? 'w-10 bg-amber-400 shadow-lg shadow-amber-500/50 scale-110' 
                          : 'w-4 bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CONTROLS / ADVANCE BUTTON (SUPER ACCESSIBLE) */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Prev / Next measure navigation */}
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevMeasure}
                  disabled={currentMeasureIdx === 0}
                  className="flex-1 sm:flex-none p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                  title="Previous Measure"
                >
                  <ChevronLeft className="w-7 h-7" />
                  <span className="sm:hidden md:inline">Prev</span>
                </button>

                <button
                  onClick={handleResetPiece}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold flex items-center justify-center transition"
                  title="Restart Piece"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNextMeasure}
                  disabled={currentMeasureIdx >= selectedPiece.measures.length - 1}
                  className="flex-1 sm:flex-none p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                  title="Next Measure"
                >
                  <span className="sm:hidden md:inline">Next</span>
                  <ChevronRight className="w-7 h-7" />
                </button>
              </div>

              {/* GIANT PRIMARY ADVANCE / PLAY BUTTON */}
              <button
                onClick={handleAdvanceOrPlay}
                className={`w-full sm:flex-1 py-5 px-8 rounded-2xl font-black text-xl md:text-2xl shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-8 h-8 fill-current" />
                    <span>PLAYING... (TAP TO PAUSE)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-8 h-8 fill-current" />
                    <span>PLAY MEASURE</span>
                  </>
                )}
              </button>

            </div>

          </div>

          {/* STRING COLOR LEGEND */}
          {useColorCoding && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-3 shadow-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">String Color Key:</span>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></span>
                <span className="text-sm font-bold text-red-400">G String</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></span>
                <span className="text-sm font-bold text-yellow-400">D String</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></span>
                <span className="text-sm font-bold text-blue-400">A String</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></span>
                <span className="text-sm font-bold text-green-400">E String</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT: CONTROL PANEL & DISPLAY TOGGLES (SIDEBAR OR TOGGLED) */}
        <div className={`w-full lg:w-80 flex flex-col gap-5 ${showSettings ? 'block' : 'hidden lg:flex'}`}>
          
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

      </div>

    </div>
  );
}

// ============================================================================
// MEASURE SVG NOTATION RENDERER
// ============================================================================
function MeasureSVG({ measure, activeNoteIdx, showNoteNames, showFingerings, useColorCoding }) {
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
  const notePositionsX = [140, 260, 380, 500]; // 4 note slots per measure

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className="w-full max-w-3xl h-auto overflow-visible select-none"
    >
      {/* Background container glow */}
      <rect x="0" y="0" width={width} height={height} rx="16" fill="#020617" />

      {/* TREBLE CLEF */}
      <g transform={`translate(${staffStartX + 10}, ${staffTopY + 8}) scale(0.45)`} fill="#94A3B8">
        <path d="M16.5 63.6c-1.2-3.1-1.5-6.7-1.5-10.2 0-12.8 8.1-24.8 19.3-29.3 3.6-1.5 7.6-2.2 11.5-2.2 14.1 0 25.8 11.2 25.8 25.4 0 10.3-6.2 19.4-15.8 23.2-3.2 1.3-6.7 1.9-10.2 1.9-3.2 0-6.4-.6-9.4-1.8-1.5 2.8-2.3 6-2.3 9.4 0 5.4 2.2 10.4 6.1 14.1 3.8 3.6 8.9 5.6 14.2 5.6 10.8 0 19.8-7.9 21.4-18.6h8.4c-1.7 15.3-14.6 27-30 27-7.7 0-14.9-3.1-20.3-8.6-5.5-5.5-8.6-12.8-8.6-20.5 0-5.8 1.8-11.3 5.1-15.8z" />
        <path d="M28 20 C28 5, 45 5, 45 20 C45 35, 28 35, 28 20 Z" />
      </g>

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

      {/* TIME SIGNATURE (4/4) */}
      <text x={staffStartX + 32} y={staffLines[1] + 6} fill="#CBD5E1" fontSize="24" fontWeight="bold" textAnchor="middle">4</text>
      <text x={staffStartX + 32} y={staffLines[3] + 6} fill="#CBD5E1" fontSize="24" fontWeight="bold" textAnchor="middle">4</text>

      {/* RENDER NOTES IN MEASURE */}
      {measure.map((note, idx) => {
        const pitchData = PITCH_MAP[note.pitch] || PITCH_MAP['A4'];
        const stringInfo = STRING_COLORS[pitchData.string];
        const noteColor = useColorCoding ? stringInfo.hex : '#F8FAFC';

        const cx = notePositionsX[idx] || (140 + idx * 100);

        // Pitch step mapping: E4 (bottom line) is pitchStep = 2.
        // Y position formula based on pitchStep from E4
        const bottomLineY = staffLines[4]; // E4
        const noteY = bottomLineY - (pitchData.pitchStep - 2) * (lineSpacing / 2);

        const isActive = activeNoteIdx === idx;
        const stemUp = noteY > staffLines[2]; // Stem up if below middle line

        return (
          <g key={idx} className="transition-all duration-200">
            
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
              fill={isActive ? '#FFFFFF' : noteColor} 
              stroke={isActive ? noteColor : '#020617'}
              strokeWidth="2"
            />

            {/* STEM */}
            <line 
              x1={stemUp ? cx + 11 : cx - 11} 
              y1={noteY} 
              x2={stemUp ? cx + 11 : cx - 11} 
              y2={stemUp ? noteY - 48 : noteY + 48} 
              stroke={isActive ? '#FFFFFF' : noteColor} 
              strokeWidth="3.5" 
              strokeLinecap="round"
            />

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