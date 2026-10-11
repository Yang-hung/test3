import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import { DecisionOption } from '../types';
import { LabubuCharacter, LabubuAction } from './LabubuCharacter';
import { soundManager } from '../utils/audio';

interface RPSGameViewProps {
  options: DecisionOption[];
  onDecide: (winner: DecisionOption) => void;
}

type HandGesture = 'rock' | 'paper' | 'scissors';

const GESTURE_ICONS: Record<HandGesture, string> = {
  rock: '✊',
  paper: '🖐️',
  scissors: '✌️',
};

const GESTURE_NAMES: Record<HandGesture, string> = {
  rock: '石頭',
  paper: '布',
  scissors: '剪刀',
};

export const RPSGameView: React.FC<RPSGameViewProps> = ({
  options,
  onDecide,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdownStep, setCountdownStep] = useState<number | null>(null); // 3, 2, 1, 0
  const [leftGesture, setLeftGesture] = useState<HandGesture>('rock');
  const [rightGesture, setRightGesture] = useState<HandGesture>('rock');
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null); // 0 (left) or 1 (right)
  const [labubuAction, setLabubuAction] = useState<LabubuAction>('idle');
  const clapIntervalRef = useRef<number | null>(null);

  const leftOption = options[0];
  const rightOption = options[1];

  // Stop clap sound loop on unmount
  useEffect(() => {
    return () => {
      if (clapIntervalRef.current) {
        clearInterval(clapIntervalRef.current);
      }
    };
  }, []);

  const startShowdown = () => {
    if (isPlaying || !leftOption || !rightOption) return;

    // Reset states
    setIsPlaying(true);
    setWinnerIndex(null);
    setLabubuAction('idle');
    if (clapIntervalRef.current) {
      clearInterval(clapIntervalRef.current);
      clapIntervalRef.current = null;
    }

    soundManager.playClick();

    // Beat 1: 剪刀 (Scissors)
    setCountdownStep(3);
    soundManager.playRPSBounce();

    setTimeout(() => {
      // Beat 2: 石頭 (Rock)
      setCountdownStep(2);
      soundManager.playRPSBounce();
    }, 600);

    setTimeout(() => {
      // Beat 3: 布！ (Paper!)
      setCountdownStep(1);
      soundManager.playRPSBounce();
    }, 1200);

    setTimeout(() => {
      // Reveal showdown gestures!
      setCountdownStep(0);

      // Randomly pick a winning combination
      // Winner: 0 or 1
      const chosenWinnerIdx = Math.random() < 0.5 ? 0 : 1;
      const winningGestureChoices: HandGesture[] = ['rock', 'paper', 'scissors'];
      const winGesture = winningGestureChoices[Math.floor(Math.random() * winningGestureChoices.length)];

      let loseGesture: HandGesture;
      if (winGesture === 'rock') loseGesture = 'scissors';
      else if (winGesture === 'paper') loseGesture = 'rock';
      else loseGesture = 'paper';

      if (chosenWinnerIdx === 0) {
        setLeftGesture(winGesture);
        setRightGesture(loseGesture);
      } else {
        setLeftGesture(loseGesture);
        setRightGesture(winGesture);
      }

      setWinnerIndex(chosenWinnerIdx);
      setIsPlaying(false);

      // Play spotlight swoosh
      soundManager.playSpotlight();

      // Labubu claps happily!
      setLabubuAction('clap');

      // Clapping sound pulses
      let claps = 0;
      clapIntervalRef.current = window.setInterval(() => {
        soundManager.playClap();
        claps++;
        if (claps >= 8) {
          if (clapIntervalRef.current) {
            clearInterval(clapIntervalRef.current);
            clapIntervalRef.current = null;
          }
        }
      }, 190);

      // Delay a little and invoke modal callback
      setTimeout(() => {
        const winningOption = chosenWinnerIdx === 0 ? leftOption : rightOption;
        onDecide(winningOption);
      }, 2600);
    }, 1800);
  };

  const isDarkened = isPlaying || winnerIndex !== null;

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 transition-all duration-700 ${
        isDarkened
          ? 'bg-gradient-to-b from-[#0a0712] via-[#120d20] to-[#0c0817] border-purple-900/60 shadow-2xl text-white'
          : 'bg-white/90 backdrop-blur-md border-pink-200/90 shadow-xl shadow-pink-200/30 text-slate-800'
      }`}
    >
      {/* Dimmed Ambient Darkness Overlay */}
      {isDarkened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 z-0 pointer-events-none"
        />
      )}

      {/* SECTION 1: UPPER HALF - RPS DUEL ANIMATION & SPOTLIGHT */}
      <div className={`relative z-10 p-6 sm:p-8 min-h-[300px] flex flex-col justify-between border-b ${isDarkened ? 'border-slate-800' : 'border-pink-100'}`}>
        {/* Header / Mode Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-300">
              <Scissors className="w-4 h-4" />
            </span>
            <span className={`font-black text-sm sm:text-base ${isDarkened ? 'text-white' : 'text-slate-800'}`}>
              二選一極限猜拳擂台
            </span>
          </div>

          <div className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
            isDarkened
              ? 'bg-slate-800 text-slate-200 border-slate-700'
              : 'bg-pink-100 text-pink-700 border-pink-200'
          }`}>
            {isPlaying
              ? '決鬥進行中...'
              : winnerIndex !== null
              ? '🎉 猜拳勝負揭曉！'
              : '準備就緒'}
          </div>
        </div>

        {/* Duel Stage (Left vs Right) */}
        <div className="relative grid grid-cols-2 gap-4 sm:gap-8 my-auto items-center">
          {/* VS Badge in Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-slate-900 font-extrabold flex items-center justify-center text-xs shadow-lg border-2 border-white/40">
              VS
            </div>
          </div>

          {/* LEFT OPTION (Index 0) */}
          <div className="relative flex flex-col items-center">
            {/* SPOTLIGHT BEAM FOR LEFT WINNER */}
            {winnerIndex === 0 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute -top-16 inset-x-0 h-80 pointer-events-none z-10 flex justify-center origin-top"
              >
                {/* Conical light beam */}
                <div
                  className="w-full max-w-[200px] h-full bg-gradient-to-b from-amber-200/50 via-amber-300/25 to-transparent blur-md rounded-b-full"
                  style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                  }}
                />
                {/* Spotlight core lamp */}
                <div className="absolute top-0 w-8 h-2 bg-amber-100 rounded-full shadow-[0_0_20px_#fde047]" />
              </motion.div>
            )}

            {/* Gesture Fist Animation */}
            <div className="relative z-10 mb-3">
              <motion.div
                animate={
                  isPlaying
                    ? {
                        y: [-16, 8, -16],
                        rotate: [-12, 12, -12],
                      }
                    : winnerIndex === 0
                    ? { y: [0, -8, 0], scale: [1, 1.15, 1] }
                    : winnerIndex === 1
                    ? { opacity: 0.35, scale: 0.85 }
                    : {}
                }
                transition={
                  isPlaying
                    ? { duration: 0.3, repeat: Infinity }
                    : winnerIndex === 0
                    ? { duration: 0.8, repeat: Infinity }
                    : {}
                }
                className={`text-5xl sm:text-6xl p-4 rounded-3xl transition-all ${
                  winnerIndex === 0
                    ? 'bg-amber-400/25 border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-800/80 border border-slate-700'
                }`}
              >
                {isPlaying
                  ? '✊'
                  : winnerIndex !== null
                  ? GESTURE_ICONS[leftGesture]
                  : '✊'}
              </motion.div>
            </div>

            {/* Option Box */}
            <div
              className={`relative z-10 w-full text-center p-3 rounded-2xl transition-all ${
                winnerIndex === 0
                  ? 'bg-amber-400/20 border-2 border-amber-300 shadow-lg text-amber-200 font-bold scale-105'
                  : winnerIndex === 1
                  ? 'bg-slate-900/40 border border-slate-800 text-slate-500 opacity-40'
                  : 'bg-slate-900/70 border border-slate-700 text-white font-medium'
              }`}
            >
              <div className="text-xs text-pink-400 font-semibold mb-0.5">
                選項 A
              </div>
              <div className="text-sm sm:text-base font-bold truncate">
                {leftOption?.text}
              </div>
              {winnerIndex === 0 && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-300 font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>獲勝！({GESTURE_NAMES[leftGesture]})</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT OPTION (Index 1) */}
          <div className="relative flex flex-col items-center">
            {/* SPOTLIGHT BEAM FOR RIGHT WINNER */}
            {winnerIndex === 1 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute -top-16 inset-x-0 h-80 pointer-events-none z-10 flex justify-center origin-top"
              >
                {/* Conical light beam */}
                <div
                  className="w-full max-w-[200px] h-full bg-gradient-to-b from-amber-200/50 via-amber-300/25 to-transparent blur-md rounded-b-full"
                  style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                  }}
                />
                <div className="absolute top-0 w-8 h-2 bg-amber-100 rounded-full shadow-[0_0_20px_#fde047]" />
              </motion.div>
            )}

            {/* Gesture Fist Animation */}
            <div className="relative z-10 mb-3">
              <motion.div
                animate={
                  isPlaying
                    ? {
                        y: [-16, 8, -16],
                        rotate: [12, -12, 12],
                      }
                    : winnerIndex === 1
                    ? { y: [0, -8, 0], scale: [1, 1.15, 1] }
                    : winnerIndex === 0
                    ? { opacity: 0.35, scale: 0.85 }
                    : {}
                }
                transition={
                  isPlaying
                    ? { duration: 0.3, repeat: Infinity }
                    : winnerIndex === 1
                    ? { duration: 0.8, repeat: Infinity }
                    : {}
                }
                className={`text-5xl sm:text-6xl p-4 rounded-3xl transition-all ${
                  winnerIndex === 1
                    ? 'bg-amber-400/25 border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-800/80 border border-slate-700'
                }`}
              >
                {isPlaying
                  ? '✊'
                  : winnerIndex !== null
                  ? GESTURE_ICONS[rightGesture]
                  : '✊'}
              </motion.div>
            </div>

            {/* Option Box */}
            <div
              className={`relative z-10 w-full text-center p-3 rounded-2xl transition-all ${
                winnerIndex === 1
                  ? 'bg-amber-400/20 border-2 border-amber-300 shadow-lg text-amber-200 font-bold scale-105'
                  : winnerIndex === 0
                  ? 'bg-slate-900/40 border border-slate-800 text-slate-500 opacity-40'
                  : 'bg-slate-900/70 border border-slate-700 text-white font-medium'
              }`}
            >
              <div className="text-xs text-purple-400 font-semibold mb-0.5">
                選項 B
              </div>
              <div className="text-sm sm:text-base font-bold truncate">
                {rightOption?.text}
              </div>
              {winnerIndex === 1 && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-300 font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>獲勝！({GESTURE_NAMES[rightGesture]})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Duel Countdown Caption */}
        <div className="h-6 text-center mt-3">
          {isPlaying && countdownStep !== null && (
            <motion.p
              key={countdownStep}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-amber-400 font-extrabold text-base tracking-widest drop-shadow"
            >
              {countdownStep === 3
                ? '剪刀 ✌️...'
                : countdownStep === 2
                ? '石頭 ✊...'
                : '布 🖐️！出招！'}
            </motion.p>
          )}
        </div>
      </div>

      {/* SECTION 2: LOWER HALF - LABUBU & CLAPPING ANIMATION */}
      <div className="relative z-10 p-6 sm:p-7 flex flex-col items-center bg-slate-900/50">
        {/* Labubu Reaction Dialogue */}
        <div className="mb-2 min-h-[32px] text-center">
          {labubuAction === 'clap' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 text-xs sm:text-sm font-bold shadow-md"
            >
              <span>👏</span>
              <span>太讚了！Labubu 狂喜拍手中！命運已定，就選它！</span>
              <span>👏</span>
            </motion.div>
          ) : isPlaying ? (
            <span className="text-xs sm:text-sm text-slate-400 animate-pulse">
              👀 Labubu 屏氣凝神注視著猜拳對決...
            </span>
          ) : (
            <span className="text-xs sm:text-sm text-slate-400">
              點擊下方按鈕，召喚 Labubu 為你裁決這場世紀對決！
            </span>
          )}
        </div>

        {/* Animated Labubu */}
        <div className="flex justify-center -my-2">
          <LabubuCharacter
            action={labubuAction}
            size="md"
            isHappy={winnerIndex !== null}
          />
        </div>

        {/* Action Button */}
        <div className="mt-4 w-full max-w-xs">
          <button
            onClick={startShowdown}
            disabled={isPlaying}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:from-rose-400 hover:via-pink-400 hover:to-amber-300 text-slate-950 shadow-rose-500/20'
            }`}
          >
            {winnerIndex !== null ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>再次猜拳對決</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>開始猜拳對決！</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
