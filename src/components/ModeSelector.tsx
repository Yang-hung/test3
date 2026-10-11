import React from 'react';
import { Scissors, Disc, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { DecisionMode } from '../types';
import { soundManager } from '../utils/audio';

interface ModeSelectorProps {
  currentMode: DecisionMode;
  optionsCount: number;
  onSelectMode: (mode: DecisionMode) => void;
  onBackToOptions: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  optionsCount,
  onSelectMode,
  onBackToOptions,
}) => {
  const isRPSAvailable = optionsCount === 2;

  const modes: Array<{
    id: DecisionMode;
    title: string;
    icon: React.ReactNode;
    desc: string;
    disabled: boolean;
    disabledReason?: string;
    badge?: string;
  }> = [
    {
      id: 'rps',
      title: '猜拳模式 (剪刀石頭布)',
      icon: <Scissors className="w-5 h-5" />,
      desc: '雙雄爭霸！背景變暗、鎂光燈照射贏家、Labubu興奮拍手！',
      disabled: !isRPSAvailable,
      disabledReason: `僅限 2 個選項使用（目前為 ${optionsCount} 個）`,
      badge: isRPSAvailable ? '2選1專屬' : '限制 2 項',
    },
    {
      id: 'fortune',
      title: '抽籤模式 (搖籤筒)',
      icon: <Sparkles className="w-5 h-5" />,
      desc: 'Labubu用力搖籤筒 ➜ 籤掉在地上 ➜ 彎腰撿起揭曉！',
      disabled: false,
      badge: '經典神準',
    },
    {
      id: 'wheel',
      title: '轉盤模式 (命運大轉盤)',
      icon: <Disc className="w-5 h-5" />,
      desc: 'Labubu用毛茸茸的手用力甩動轉盤，指針飛轉決定命運！',
      disabled: false,
      badge: '刺激好玩',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3.5">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToOptions();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs sm:text-sm font-bold border border-pink-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-pink-500" />
          <span>返回修改選項 ({optionsCount}項)</span>
        </button>

        <span className="text-xs text-pink-700/80 font-bold">
          🌸 切換命運玩法
        </span>
      </div>

      {/* Mode Tabs / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => {
          const isSelected = currentMode === m.id;

          return (
            <button
              key={m.id}
              disabled={m.disabled}
              onClick={() => {
                if (m.disabled) return;
                soundManager.playClick();
                onSelectMode(m.id);
              }}
              className={`relative text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-xs sm:text-sm flex flex-col justify-between ${
                m.disabled
                  ? 'opacity-40 cursor-not-allowed bg-pink-50/60 border-pink-100'
                  : isSelected
                  ? 'bg-gradient-to-br from-pink-500/15 via-rose-500/15 to-purple-500/10 border-pink-400 shadow-md shadow-pink-300/40 scale-[1.02] bg-white'
                  : 'bg-white/85 hover:bg-white border-pink-200 hover:border-pink-300 shadow-sm active:scale-98'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white'
                        : 'bg-pink-100 text-pink-600'
                    }`}
                  >
                    {m.icon}
                  </div>
                  {m.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-pink-100 text-pink-700 border border-pink-300'
                          : m.disabled
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-pink-50 text-pink-600 border border-pink-200'
                      }`}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-slate-800 text-sm">
                  {m.title}
                </div>
                <div className="text-slate-500 text-xs mt-1 leading-snug line-clamp-2 font-medium">
                  {m.desc}
                </div>
              </div>

              {m.disabled && m.disabledReason && (
                <div className="mt-2.5 pt-2 border-t border-pink-100 text-[11px] text-rose-500 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{m.disabledReason}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
