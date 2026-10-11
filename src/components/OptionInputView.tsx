import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { DecisionOption, PresetScenario } from '../types';
import { soundManager } from '../utils/audio';

interface OptionInputViewProps {
  options: DecisionOption[];
  onAddOption: (text: string) => void;
  onEditOption: (id: string, newText: string) => void;
  onDeleteOption: (id: string) => void;
  onClearOptions: () => void;
  onApplyPreset: (presetOptions: string[]) => void;
  onProceedToDecision: () => void;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    title: '午餐吃什麼？',
    icon: '🍜',
    description: '經典天人交戰 5 選 1',
    options: ['日式拉麵', '麥當勞 1 號餐', '古早味滷肉飯', '低卡健康餐盒', '炙燒壽司'],
  },
  {
    title: '要買還是不買？',
    icon: '🛍️',
    description: '猜拳專用 2 選 1',
    options: ['買！快樂無價不能等', '不買！省錢致富去存股'],
  },
  {
    title: '週末去哪裡？',
    icon: '⛺',
    description: '外出或宅家 3 選 1',
    options: ['宅在舒服家裡追劇打遊戲', '去文青咖啡廳看書喝下午茶', '去大自然野餐露營踏青'],
  },
  {
    title: '手搖飲甜度冰塊？',
    icon: '🧋',
    description: '飲料店櫃檯前糾結',
    options: ['微糖微冰（標準安全款）', '無糖去冰（健康無負擔）', '半糖少冰（螞蟻人滿足）'],
  },

];

export const OptionInputView: React.FC<OptionInputViewProps> = ({
  options,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onClearOptions,
  onApplyPreset,
  onProceedToDecision,
}) => {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setInputError('請輸入選項內容');
      return;
    }
    if (options.some((opt) => opt.text.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('已有相同的選項囉！');
      return;
    }
    soundManager.playClick();
    onAddOption(trimmed);
    setInputText('');
    setInputError(null);
  };

  const startEdit = (opt: DecisionOption) => {
    soundManager.playClick();
    setEditingId(opt.id);
    setEditingText(opt.text);
  };

  const saveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    soundManager.playClick();
    onEditOption(id, trimmed);
    setEditingId(null);
  };

  const cancelEdit = () => {
    soundManager.playClick();
    setEditingId(null);
  };

  const isProceedDisabled = options.length < 2;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Introduction Card: Frosted Glass with girlish border */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-pink-200/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl">⚖️</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wide">
            步驟一：列出你的糾結選項
          </h2>
        </div>
        <p className="text-sm text-slate-600 font-medium">
          輸入你想決定的事項，<span className="text-pink-600 font-bold underline decoration-pink-300">至少需要 2 個選項</span>。天秤座不用再糾結，交給 Labubu 替你拍板定案！
        </p>

        {/* Input Form */}
        <form onSubmit={handleAdd} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="例如：吃麻辣鍋、買新衣服、去海邊..."
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-pink-200 text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm sm:text-base font-medium shadow-inner"
              maxLength={40}
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white font-bold transition-all active:scale-95 shadow-md shadow-pink-300/50 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>新增選項</span>
          </button>
        </form>

        {inputError && (
          <p className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </p>
        )}

        {/* Preset quick buttons */}
        <div className="mt-5 pt-4 border-t border-pink-100">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>天秤座常見糾結範本（點擊快速套用）：</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onApplyPreset(preset.options);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-xs font-semibold text-pink-700 border border-pink-200/80 transition-all active:scale-95 group shadow-sm"
                title={`${preset.description}: ${preset.options.join('、')}`}
              >
                <span>{preset.icon}</span>
                <span className="group-hover:text-pink-900 transition-colors">{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options List Card */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-pink-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-pink-200/30">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
              候選選項清單
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                options.length >= 2
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              目前 {options.length} 個 {options.length < 2 ? '(至少需 2 個)' : '✓ 已達標'}
            </span>
          </div>

          {options.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('確定要清空所有選項嗎？')) {
                  soundManager.playClick();
                  onClearOptions();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空選項</span>
            </button>
          )}
        </div>

        {options.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
              📝
            </div>
            <p className="text-slate-700 font-bold text-sm">
              目前還沒有任何選項
            </p>
            <p className="text-slate-500 text-xs mt-1">
              請在上方輸入至少 2 個選項，或點選上方範本直接帶入！
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {options.map((opt, index) => {
                const isEditing = editingId === opt.id;

                return (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-pink-200/80 hover:border-pink-300 shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 border border-pink-300/80 flex items-center justify-center text-xs font-black shrink-0">
                        {index + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(opt.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 rounded-xl bg-pink-50 border-2 border-pink-400 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400 font-medium"
                            maxLength={40}
                          />
                          <button
                            onClick={() => saveEdit(opt.id)}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                            title="儲存"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="取消"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm sm:text-base text-slate-800 font-bold truncate">
                          {opt.text}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(opt)}
                          className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="編輯選項"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onDeleteOption(opt.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="刪除選項"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Hint on RPS mode availability */}
        {options.length === 2 && (
          <div className="mt-4 p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
            <span>
              太棒了！剛好 2 個選項，解鎖限定的「<strong>猜拳對決模式</strong>」以及轉盤與抽籤！
            </span>
          </div>
        )}
        {options.length > 2 && (
          <div className="mt-4 p-3 rounded-2xl bg-pink-50 border border-pink-200 text-pink-800 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
            <span>
              已輸入 {options.length} 個選項！可使用「<strong>幸運轉盤</strong>」與「<strong>籤筒抽籤</strong>」。（猜拳僅限 2 個選項）
            </span>
          </div>
        )}

        {/* Advance CTA button */}
        <div className="mt-6 pt-2">
          <button
            onClick={() => {
              if (isProceedDisabled) return;
              soundManager.playClick();
              onProceedToDecision();
            }}
            disabled={isProceedDisabled}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
              isProceedDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:via-rose-400 hover:to-amber-300 text-white active:scale-[0.99] shadow-pink-300/50 cursor-pointer'
            }`}
          >
            <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              {isProceedDisabled
                ? `請再輸入 ${2 - options.length} 個選項方可開始決策`
                : '召喚 Labubu 來替我決定！✨ (前往模式選擇)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
