import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Disc, Sparkles, RotateCcw } from 'lucide-react';
import { DecisionOption } from '../types';
import { LabubuCharacter, LabubuAction } from './LabubuCharacter';
import { soundManager } from '../utils/audio';

interface LuckyWheelViewProps {
  options: DecisionOption[];
  onDecide: (winner: DecisionOption) => void;
}

const SLICE_COLORS = [
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#ec4899', // pink
  '#3b82f6', // blue
  '#eab308', // yellow
];

export const LuckyWheelView: React.FC<LuckyWheelViewProps> = ({
  options,
  onDecide,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [labubuAction, setLabubuAction] = useState<LabubuAction>('idle');
  const [winner, setWinner] = useState<DecisionOption | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickAngleRef = useRef<number>(0);

  const numSlices = options.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw the lucky wheel on Canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 14;

    ctx.clearRect(0, 0, size, size);

    // Save context for wheel rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((angle * Math.PI) / 180);

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const start = i * sliceAngle;
      const end = start + sliceAngle;

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      // Truncate text if needed
      let label = options[i].text;
      if (label.length > 9) {
        label = label.substring(0, 8) + '…';
      }

      ctx.fillText(label, radius - 22, 0);
      ctx.restore();
    }

    // Outer rim brass studs / pegs
    for (let i = 0; i < numSlices * 2; i++) {
      const pegAngle = (i * Math.PI) / numSlices;
      const px = Math.cos(pegAngle) * (radius - 4);
      const py = Math.sin(pegAngle) * (radius - 4);

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#78350f';
      ctx.stroke();
    }

    // Center hub cap
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotation);
  }, [options, rotation]);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    soundManager.playClick();

    // STEP 1: Labubu winds up with determined face
    setLabubuAction('spin-windup');

    setTimeout(() => {
      // STEP 2: Labubu swipes down forcefully with his furry paw!
      setLabubuAction('spin-swipe');
      soundManager.playSpinWhoosh();

      // Random target spin: at least 5-8 full spins + random offset
      const extraSpins = 5 + Math.floor(Math.random() * 4);
      const randomOffset = Math.random() * 360;
      const targetDelta = extraSpins * 360 + randomOffset;

      const startAngle = rotation % 360;
      let currentVelocity = 32 + Math.random() * 10;
      const friction = 0.985;
      let currentAngle = startAngle;

      let tickThreshold = 360 / (numSlices * 2);
      lastTickAngleRef.current = currentAngle;

      const animateSpin = () => {
        currentVelocity *= friction;
        currentAngle += currentVelocity;

        // Sound tick when crossing pegs
        if (Math.abs(currentAngle - lastTickAngleRef.current) >= tickThreshold) {
          soundManager.playWheelTick(Math.min(1.8, Math.max(0.7, currentVelocity / 15)));
          lastTickAngleRef.current = currentAngle;
        }

        drawWheel(currentAngle);
        setRotation(currentAngle);

        if (currentVelocity > 0.15) {
          animFrameRef.current = requestAnimationFrame(animateSpin);
        } else {
          // Stopped!
          setIsSpinning(false);

          // Calculate which option the top indicator (270 degrees in canvas coords) landed on
          const normalizedAngle = (360 - (currentAngle % 360) + 270) % 360;
          const sliceDeg = 360 / numSlices;
          const winningIndex = Math.floor(normalizedAngle / sliceDeg) % numSlices;
          const winningOption = options[winningIndex];

          setWinner(winningOption);
          setLabubuAction('cheer');

          setTimeout(() => {
            onDecide(winningOption);
          }, 1800);
        }
      };

      // Launch wheel rotation after paw hits rim
      setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(animateSpin);
      }, 160);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-200/30 overflow-hidden flex flex-col items-center text-slate-800">
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-1/3 w-56 h-56 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-300 shadow-sm">
            <Disc className="w-4 h-4" />
          </span>
          <span className="font-extrabold text-slate-800 text-sm sm:text-base">
            Labubu 毛茸茸神力轉盤
          </span>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200">
          轉盤格數：{options.length} 格
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-500 font-medium text-center mb-4">
        Labubu 會擺出蓄力姿勢，用毛茸茸的手大力揮下轉動大轉盤！
      </p>

      {/* WHEEL + LABUBU INTERACTION STAGE */}
      <div className="relative w-full flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* LABUBU INTERACTING ON THE LEFT */}
        <div className="relative flex flex-col items-center shrink-0">
          <LabubuCharacter
            action={labubuAction}
            size="md"
            isHappy={winner !== null}
          />

          {/* Action Callout */}
          <div className="mt-1 text-center">
            {labubuAction === 'spin-windup' && (
              <span className="text-xs font-bold text-amber-300 animate-pulse">
                🔥 蓄力準備！
              </span>
            )}
            {labubuAction === 'spin-swipe' && (
              <span className="text-xs font-bold text-cyan-300">
                💨 用力一甩！
              </span>
            )}
            {labubuAction === 'cheer' && (
              <span className="text-xs font-bold text-pink-300">
                🎉 開心歡呼！
              </span>
            )}
            {labubuAction === 'idle' && (
              <span className="text-xs text-slate-400">
                🐾 等待轉動指令
              </span>
            )}
          </div>
        </div>

        {/* THE WHEEL WITH POINTER */}
        <div className="relative flex flex-col items-center">
          {/* Top Pointer Needle pointing down at 12 o'clock */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-x-[12px] border-x-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white -mt-2 shadow" />
          </div>

          {/* Canvas Wheel Container */}
          <div className="p-2 rounded-full bg-gradient-to-br from-amber-400/40 via-purple-500/40 to-pink-500/40 border-4 border-amber-300/60 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-full bg-slate-900 filter drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Current Result / Encouragement */}
      <div className="text-center min-h-[30px] my-2">
        {isSpinning ? (
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold animate-pulse">
            🎡 轉盤高速旋轉中！看命運指針會停在哪一格...
          </p>
        ) : winner ? (
          <p className="text-xs sm:text-sm text-amber-300 font-bold">
            🎯 指針鎖定：【{winner.text}】！不要再改囉！
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            請按下下方按鈕，召喚 Labubu 出動毛茸茸肉球手！
          </p>
        )}
      </div>

      {/* Spin Button */}
      <div className="mt-2 w-full max-w-xs">
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            isSpinning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 hover:from-cyan-300 hover:via-teal-300 hover:to-pink-400 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {winner ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>再次用力轉轉盤</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>請 Labubu 用力轉轉盤！🌀</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
