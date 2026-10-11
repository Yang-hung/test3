import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { DecisionOption } from '../types';
import { LabubuCharacter, LabubuAction } from './LabubuCharacter';
import { soundManager } from '../utils/audio';

interface FortuneStickViewProps {
  options: DecisionOption[];
  onDecide: (winner: DecisionOption) => void;
}

type FortunePhase =
  | 'idle' // Waiting to start
  | 'shaking' // Labubu actively shaking bamboo tube
  | 'dropping' // Stick flies out and drops to the floor
  | 'picking' // Labubu bends down and picks it up
  | 'revealed'; // Stick held up high and revealed

export const FortuneStickView: React.FC<FortuneStickViewProps> = ({
  options,
  onDecide,
}) => {
  const [phase, setPhase] = useState<FortunePhase>('idle');
  const [selectedWinner, setSelectedWinner] = useState<DecisionOption | null>(null);
  const [labubuAction, setLabubuAction] = useState<LabubuAction>('idle');
  const shakeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
    };
  }, []);

  const startDrawing = () => {
    if (phase !== 'idle' && phase !== 'revealed') return;
    if (options.length < 2) return;

    // Pick winning option
    const winner = options[Math.floor(Math.random() * options.length)];
    setSelectedWinner(winner);

    // STEP 1: SHAKING
    setPhase('shaking');
    setLabubuAction('shake');
    soundManager.playClick();

    // Loop wooden rattle sounds
    shakeIntervalRef.current = window.setInterval(() => {
      soundManager.playWoodenRattle();
    }, 220);

    // After 2.0s of shaking -> STEP 2: STICK DROPS
    setTimeout(() => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
        shakeIntervalRef.current = null;
      }

      setPhase('dropping');
      setLabubuAction('drop-watch');
      soundManager.playStickDrop();

      // After 1.4s of falling & settling -> STEP 3: PICKING UP
      setTimeout(() => {
        setPhase('picking');
        setLabubuAction('bend-pickup');

        // Halfway through bend, play pick up sound
        setTimeout(() => {
          soundManager.playPickUp();
        }, 700);

        // After 1.6s -> STEP 4: REVEAL
        setTimeout(() => {
          setPhase('revealed');
          setLabubuAction('cheer');

          // Trigger result modal after brief suspense
          setTimeout(() => {
            onDecide(winner);
          }, 1800);
        }, 1600);
      }, 1400);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-200/30 overflow-hidden flex flex-col items-center text-slate-800">
      {/* Background Zen Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 shadow-sm">
            🎋
          </span>
          <span className="font-extrabold text-slate-800 text-sm sm:text-base">
            Labubu 籤筒求籤 (命運指引)
          </span>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200">
          候選籤數：{options.length} 支
        </div>
      </div>

      {/* Status Progress Pills */}
      <div className="w-full max-w-md my-3 flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500">
        <div
          className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
            phase === 'shaking'
              ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
              : 'bg-pink-50 text-slate-500'
          }`}
        >
          1. 搖動籤筒
        </div>
        <span className="text-pink-300">➜</span>
        <div
          className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
            phase === 'dropping'
              ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
              : 'bg-pink-50 text-slate-500'
          }`}
        >
          2. 籤掉在地上
        </div>
        <span className="text-pink-300">➜</span>
        <div
          className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
            phase === 'picking'
              ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
              : 'bg-pink-50 text-slate-500'
          }`}
        >
          3. 彎腰撿起
        </div>
        <span className="text-pink-300">➜</span>
        <div
          className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
            phase === 'revealed'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-pink-50 text-slate-500'
          }`}
        >
          4. 揭曉天意
        </div>
      </div>

      {/* STAGE AREA: LABUBU + FORTUNE CYLINDER + FALLING STICK */}
      <div className="relative w-full h-[390px] flex items-center justify-center my-2 select-none">
        {/* Floor Graphic */}
        <div className="absolute bottom-4 inset-x-8 h-8 rounded-full bg-pink-100/90 border-t-2 border-pink-300/80 shadow-inner" />

        {/* LABUBU CHARACTER */}
        <div className="relative z-10 flex flex-col items-center">
          <LabubuCharacter
            action={labubuAction}
            size="lg"
            isHappy={phase === 'revealed'}
          />
        </div>

        {/* BAMBOO FORTUNE TUBE (Overlaid in front of Labubu) */}
        {phase !== 'picking' && (
          <motion.div
            animate={
              phase === 'shaking'
                ? {
                    y: [0, -20, 8, -15, 0],
                    rotate: [-12, 10, -8, 12, -10],
                    x: [-4, 6, -3, 5, 0],
                  }
                : { y: 0, rotate: 0 }
            }
            transition={{
              duration: 0.28,
              repeat: phase === 'shaking' ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="absolute z-20 bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          >
            {/* Wooden Sticks protruding from cylinder */}
            <div className="relative w-16 h-12 flex justify-center -mb-2">
              <div className="w-2 h-14 bg-amber-200 border border-amber-900 rounded-t -rotate-12 translate-x-1" />
              <div className="w-2.5 h-16 bg-amber-100 border border-amber-900 rounded-t rotate-3 -translate-y-2" />
              <div className="w-2 h-14 bg-amber-300 border border-amber-900 rounded-t rotate-14 -translate-x-1" />
              <div className="w-2 h-12 bg-amber-200 border border-amber-900 rounded-t -rotate-6" />
            </div>

            {/* Cylinder Body */}
            <div className="w-20 h-28 rounded-b-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-600/80 shadow-2xl flex flex-col items-center justify-between p-2">
              <div className="w-full h-2.5 bg-amber-600 rounded-full border border-amber-400/60" />
              <div className="text-amber-200 text-xs font-bold font-serif writing-mode-vertical">
                命運籤筒
              </div>
              <div className="w-full h-2 bg-amber-950 rounded-full" />
            </div>
          </motion.div>
        )}

        {/* STICK SHOOTING OUT AND FALLING TO THE GROUND */}
        <AnimatePresence>
          {phase === 'dropping' && (
            <motion.div
              initial={{ y: -80, x: 0, rotate: -20, opacity: 1 }}
              animate={{
                y: [ -80, -130, 95, 80, 95 ],
                x: [ 0, 50, 90, 95, 100 ],
                rotate: [ -20, 60, 160, 140, 150 ],
              }}
              transition={{
                duration: 1.1,
                times: [0, 0.25, 0.75, 0.88, 1],
                ease: 'easeOut',
              }}
              className="absolute z-30 bottom-16 left-1/2 flex items-center justify-center pointer-events-none"
            >
              {/* Single Golden Fortune Stick */}
              <div className="w-3.5 h-24 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-md border-2 border-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center">
                <span className="text-[9px] font-bold text-amber-950 rotate-90 whitespace-nowrap">
                  天意籤
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STICK LYING ON FLOOR BEFORE BEING PICKED UP */}
        {phase === 'picking' && (
          <motion.div
            initial={{ scale: 1, y: 95, x: 95, rotate: 150 }}
            animate={{
              scale: [1, 1.1, 0],
              y: [95, 50, -20],
              x: [95, 60, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute z-30 bottom-16 left-1/2 flex items-center justify-center pointer-events-none"
          >
            <div className="w-3.5 h-24 bg-gradient-to-b from-amber-200 to-amber-400 rounded-md border-2 border-amber-700 shadow-lg flex items-center justify-center">
              <span className="text-[9px] font-bold text-amber-950 rotate-90">
                天意籤
              </span>
            </div>
          </motion.div>
        )}

        {/* STICK REVEALED IN LABUBU'S PAWS (ZOOMED FRONT & CENTER) */}
        <AnimatePresence>
          {phase === 'revealed' && selectedWinner && (
            <motion.div
              initial={{ scale: 0.2, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: -20, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="absolute z-40 inset-x-4 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            >
              {/* Golden Fortune Stick Tablet */}
              <div className="relative px-6 py-4 rounded-3xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-4 border-amber-600 shadow-[0_0_40px_rgba(251,191,36,0.6)] text-center text-slate-900 max-w-sm pointer-events-auto">
                <div className="text-[11px] font-bold tracking-widest text-amber-900 uppercase">
                  🎋 上上大吉 • 命運指引
                </div>
                <div className="my-1.5 text-xl sm:text-2xl font-black text-slate-950 break-words drop-shadow">
                  {selectedWinner.text}
                </div>
                <div className="text-[11px] text-amber-900/90 font-medium">
                  Labubu 替你撿起命運之籤：不要再猶豫啦！
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narration Box */}
      <div className="text-center min-h-[30px] my-1">
        {phase === 'shaking' && (
          <p className="text-xs sm:text-sm text-amber-300 font-semibold animate-pulse">
            🎋 Labubu 正在賣力上下搖動籤筒，籤支激烈碰撞中...
          </p>
        )}
        {phase === 'dropping' && (
          <p className="text-xs sm:text-sm text-rose-300 font-semibold">
            💥 啪嗒！命運之籤從籤筒飛出，掉在地上啦！
          </p>
        )}
        {phase === 'picking' && (
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold">
            🐾 Labubu 伸出毛茸茸的小手，彎下腰把籤撿起來囉！
          </p>
        )}
        {phase === 'revealed' && (
          <p className="text-xs sm:text-sm text-pink-300 font-bold">
            ✨ 天意已定！命運籤詩揭曉！
          </p>
        )}
        {phase === 'idle' && (
          <p className="text-xs text-slate-400">
            點擊下方按鈕，觀賞 Labubu 親自搖籤筒、看籤落地並撿起揭曉！
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-3 w-full max-w-xs">
        <button
          onClick={startDrawing}
          disabled={phase !== 'idle' && phase !== 'revealed'}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            phase !== 'idle' && phase !== 'revealed'
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 hover:from-amber-300 hover:via-orange-300 hover:to-pink-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {phase === 'revealed' ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>再次搖籤抽籤</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>請 Labubu 搖籤抽籤！🎋</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
