import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, ArrowLeft, Check, Share2 } from 'lucide-react';
import { DecisionOption } from '../types';
import { LabubuCharacter } from './LabubuCharacter';
import { soundManager } from '../utils/audio';

interface ResultModalProps {
  isOpen: boolean;
  winner: DecisionOption | null;
  modeName: string;
  onClose: () => void;
  onRetry: () => void;
  onBackToOptions: () => void;
}

const LIBRA_QUOTES = [
  "天秤座注意：天意已決，請即刻執行，禁止回頭重新糾結！✨",
  "不要再考慮其他選項了，宇宙與 Labubu 已經替你拍板定案！",
  "糾結只會消耗能量，相信第一直覺與命運的安排！🎯",
  "天秤座終結者認證：這就是最完美的選擇，出發吧！🥳",
  "恭喜擺脫選擇障礙！現在去做這件事，好運加倍！🍀",
];

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  winner,
  modeName,
  onClose,
  onRetry,
  onBackToOptions,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [quote] = React.useState(() => {
    return LIBRA_QUOTES[Math.floor(Math.random() * LIBRA_QUOTES.length)];
  });

  useEffect(() => {
    if (isOpen && winner) {
      soundManager.playVictoryFanfare();
      // Burst celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'],
      });
    }
  }, [isOpen, winner]);

  if (!isOpen || !winner) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`【天秤座救星替我決定了！】模式：${modeName} ➜ 命運選擇：${winner.text}`);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        {/* Backdrop modal click */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#2e2640] to-[#1c1729] rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-pink-400/30 overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{modeName} 命運裁決結果</span>
          </div>

          {/* Cheering Labubu */}
          <div className="flex justify-center -mt-2 -mb-2">
            <LabubuCharacter action="cheer" size="sm" isHappy={true} />
          </div>

          <h3 className="text-sm font-medium text-slate-300 tracking-wide mt-2">
            命運選中的答案是：
          </h3>

          {/* Big Winner Text Box */}
          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 border-2 border-amber-300/60 shadow-lg shadow-pink-500/10">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-wide break-words drop-shadow-md">
              {winner.text}
            </p>
          </div>

          {/* Libra humorous advice */}
          <p className="mt-4 text-xs sm:text-sm text-slate-300/90 bg-white/5 rounded-xl p-3 border border-white/10 leading-relaxed italic">
            "{quote}"
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onRetry();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all active:scale-95 border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再玩一次</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-pink-600/30 hover:bg-pink-600/40 text-pink-200 font-medium text-sm transition-all active:scale-95 border border-pink-400/30"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? '已複製！' : '複製結果'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onBackToOptions();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-900 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>回到選項列表修改</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
