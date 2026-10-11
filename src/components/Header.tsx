import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMuted, onToggleMute }) => {
  return (
    <header className="w-full max-w-4xl mx-auto py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-pink-200/70">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-300 p-0.5 shadow-md shadow-pink-300/40">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl shadow-inner">
            ⚖️
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 drop-shadow-sm">
              天秤座救星
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-300/80 shadow-sm">
              🌸 Labubu 夢幻粉紅版
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            專為天秤寶寶吳小姐設計 • 猜拳 × 轉盤 × 抽籤全動態命運審判
          </p>
        </div>
      </div>

      {/* Sound Toggle (Sweet Pastel Button) */}
      <div className="flex items-center bg-white/80 p-1.5 rounded-2xl border border-pink-200 shadow-sm backdrop-blur-sm">
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
            isMuted
              ? 'bg-rose-100 text-rose-600 border border-rose-300/80'
              : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm shadow-pink-300/50'
          }`}
          title={isMuted ? '音效已靜音' : '音效已開啟'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="text-[11px]">{isMuted ? '音效已靜音' : '音效開啟中 ♪'}</span>
        </button>
      </div>
    </header>
  );
};
