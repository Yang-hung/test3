import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OptionInputView } from './components/OptionInputView';
import { ModeSelector } from './components/ModeSelector';
import { RPSGameView } from './components/RPSGameView';
import { FortuneStickView } from './components/FortuneStickView';
import { LuckyWheelView } from './components/LuckyWheelView';
import { ResultModal } from './components/ResultModal';
import { GirlyPinkBackground } from './components/LabubuBackgroundPattern';
import { DecisionOption, DecisionMode } from './types';
import { soundManager } from './utils/audio';

// Default initial state with a relatable Libra dilemma
const INITIAL_OPTIONS: DecisionOption[] = [
  { id: '1', text: '吃日式拉麵 🍜' },
  { id: '2', text: '吃美式漢堡 🍔' },
];

export default function App() {
  const [options, setOptions] = useState<DecisionOption[]>(() => {
    const saved = localStorage.getItem('libra_options');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_OPTIONS;
  });

  // Current interface: 'input' (Interface 1) or 'decision' (Interface 2)
  const [currentInterface, setCurrentInterface] = useState<'input' | 'decision'>('input');

  // Decision mode: 'rps' | 'fortune' | 'wheel'
  const [currentMode, setCurrentMode] = useState<DecisionMode>('rps');

  // Sound mute state
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  // Result modal state
  const [winner, setWinner] = useState<DecisionOption | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Sync options to local storage
  useEffect(() => {
    localStorage.setItem('libra_options', JSON.stringify(options));
  }, [options]);

  // Adjust mode automatically if RPS is selected but options != 2
  useEffect(() => {
    if (options.length !== 2 && currentMode === 'rps') {
      setCurrentMode('wheel');
    }
  }, [options.length, currentMode]);

  // Handle adding an option
  const handleAddOption = (text: string) => {
    const newOption: DecisionOption = {
      id: Date.now().toString(),
      text,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  // Handle editing an option
  const handleEditOption = (id: string, newText: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text: newText } : opt))
    );
  };

  // Handle deleting an option
  const handleDeleteOption = (id: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  // Handle clearing options
  const handleClearOptions = () => {
    setOptions([]);
  };

  // Handle applying presets
  const handleApplyPreset = (presetOptions: string[]) => {
    const newOptions: DecisionOption[] = presetOptions.map((text, idx) => ({
      id: `${Date.now()}-${idx}`,
      text,
    }));
    setOptions(newOptions);
  };

  // Switch sound mute
  const handleToggleMute = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
  };

  // Winner decided callback
  const handleDecide = (winningOption: DecisionOption) => {
    setWinner(winningOption);
    setIsResultOpen(true);
  };

  const getModeTitle = (mode: DecisionMode) => {
    switch (mode) {
      case 'rps':
        return '猜拳對決';
      case 'fortune':
        return '籤筒抽籤';
      case 'wheel':
        return '幸運轉盤';
    }
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col relative selection:bg-pink-400 selection:text-white">
      {/* GIRLY PASTEL PINK THEMED BACKGROUND WITH LABUBU AVATAR STAMP WALLPAPER */}
      <GirlyPinkBackground />

      {/* Main App Foreground Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <Header isMuted={isMuted} onToggleMute={handleToggleMute} />

        {/* Content Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
          {/* INTERFACE 1: OPTION INPUT & MANAGEMENT */}
          {currentInterface === 'input' && (
            <OptionInputView
              options={options}
              onAddOption={handleAddOption}
              onEditOption={handleEditOption}
              onDeleteOption={handleDeleteOption}
              onClearOptions={handleClearOptions}
              onApplyPreset={handleApplyPreset}
              onProceedToDecision={() => {
                if (options.length >= 2) {
                  if (options.length === 2) {
                    setCurrentMode('rps');
                  } else {
                    setCurrentMode('wheel');
                  }
                  setCurrentInterface('decision');
                }
              }}
            />
          )}

          {/* INTERFACE 2: DECISION MODES & ANIMATIONS */}
          {currentInterface === 'decision' && (
            <div className="space-y-6">
              {/* Mode Selector Navigation */}
              <ModeSelector
                currentMode={currentMode}
                optionsCount={options.length}
                onSelectMode={(mode) => setCurrentMode(mode)}
                onBackToOptions={() => setCurrentInterface('input')}
              />

              {/* Active Game Mode View */}
              {currentMode === 'rps' && (
                <RPSGameView
                  options={options}
                  onDecide={handleDecide}
                />
              )}

              {currentMode === 'fortune' && (
                <FortuneStickView
                  options={options}
                  onDecide={handleDecide}
                />
              )}

              {currentMode === 'wheel' && (
                <LuckyWheelView
                  options={options}
                  onDecide={handleDecide}
                />
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-pink-600/70 font-medium border-t border-pink-200/60 mt-auto">
          <p>
            天秤座救星 • 🌸 夢幻少女粉紅版 • 專治各種糾結與猶豫不決
          </p>
        </footer>
      </div>

      {/* Celebratory Result Modal */}
      <ResultModal
        isOpen={isResultOpen}
        winner={winner}
        modeName={getModeTitle(currentMode)}
        onClose={() => setIsResultOpen(false)}
        onRetry={() => {
          setIsResultOpen(false);
        }}
        onBackToOptions={() => {
          setIsResultOpen(false);
          setCurrentInterface('input');
        }}
      />
    </div>
  );
}
