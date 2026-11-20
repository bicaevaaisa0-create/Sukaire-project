import React, { useState } from 'react';
import { X, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReleaseWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseWallModal: React.FC<ReleaseWallModalProps> = ({ isOpen, onClose }) => {
  const [thought, setThought] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [dissolvedCount, setDissolvedCount] = useState(0);
  const [justDissolved, setJustDissolved] = useState(false);

  if (!isOpen) return null;

  const handleDissolve = () => {
    if (!thought.trim()) return;

    setIsDissolving(true);

    // Trigger gentle pastel stardust confetti explosion
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FDE68A', '#A7F3D0', '#C4B5FD', '#FBCFE8', '#BAE6FD'],
      scalar: 0.9,
      disableForReducedMotion: false
    });

    setTimeout(() => {
      setThought('');
      setIsDissolving(false);
      setJustDissolved(true);
      setDissolvedCount(c => c + 1);

      setTimeout(() => {
        setJustDissolved(false);
      }, 4000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Стена Выплеска • Анонимный Сброс
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-2">
            Растворение Тяжелых Мыслей в Свете
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Напишите то, что давит на вас: страх сессии, обиду, самокритику или навязчивое чувство вины. Здесь нет цензуры — а затем превратите это в звездную пыль.
          </p>
        </div>

        {justDissolved ? (
          <div className="my-6 p-6 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
            <h4 className="text-sm font-semibold text-emerald-900">
              Ваша мысль отпущена и растворилась в небе
            </h4>
            <p className="text-xs text-emerald-700 mt-1 max-w-xs">
              Она больше не имеет над вами власти. Это было лишь временное состояние ума, а не ваше будущее.
            </p>
            <button
              onClick={() => setJustDissolved(false)}
              className="mt-4 px-4 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-medium shadow-xs border border-emerald-200 hover:bg-emerald-50"
            >
              Отпустить еще одну мысль
            </button>
          </div>
        ) : (
          <div className="my-4">
            <div className="relative">
              <textarea
                value={thought}
                onChange={e => setThought(e.target.value)}
                disabled={isDissolving}
                rows={4}
                placeholder="«Я боюсь, что подведу родителей...», «Мне кажется, я хуже всех на курсе...», «Я так устал притворяться сильным...»"
                className={`w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white resize-none transition-all ${
                  isDissolving ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'
                }`}
                style={{ transitionDuration: '800ms' }}
              />

              {isDissolving && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm animate-pulse">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Растворение в эфире...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Символов: {thought.length}</span>
              <span>Растворено за сессию: <strong className="text-slate-700">{dissolvedCount}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleDissolve}
              disabled={!thought.trim() || isDissolving}
              className="w-full mt-4 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Wind className="w-4 h-4" />
              <span>Растворить в свете</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
