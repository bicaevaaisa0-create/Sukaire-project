import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Switch phases
          if (phase === 'inhale') {
            setPhase('hold');
            return 7; // 7 seconds hold
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 8; // 8 seconds exhale
          } else {
            setPhase('inhale');
            setCompletedCycles((c) => c + 1);
            return 4; // 4 seconds inhale
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const phaseDetails: Record<Phase, { text: string; sub: string; color: string; scale: string }> = {
    inhale: {
      text: 'Вдох через нос',
      sub: 'Медленно наполняйте живот и легкие воздухом',
      color: '#86EFAC',
      scale: 'scale-125'
    },
    hold: {
      text: 'Задержка дыхания',
      sub: 'Мягкий покой, замрите в центре тишины',
      color: '#93C5FD',
      scale: 'scale-125'
    },
    exhale: {
      text: 'Плавный выдох',
      sub: 'Выпускайте воздух через приоткрытые губы, отпуская вес с плеч',
      color: '#C4B5FD',
      scale: 'scale-90'
    }
  };

  const current = phaseDetails[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Камень Заземления • Ритм 4-7-8
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-2">
            Дыхательное Кольцо Покоя
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Снижает частоту сердечных сокращений и выводит нервную систему из режима паники.
          </p>
        </div>

        {/* Dynamic Breathing Circle */}
        <div className="my-8 flex items-center justify-center relative h-56">
          {/* Outer Pulsing Aura */}
          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-1000 ease-in-out opacity-30 ${current.scale}`}
            style={{ backgroundColor: current.color }}
          />

          {/* Inner Breathing Sphere */}
          <div
            className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-1000 ease-in-out border-4 border-white`}
            style={{
              background: `radial-gradient(circle, ${current.color} 0%, white 100%)`
            }}
          >
            <span className="text-3xl font-extrabold text-slate-800 font-mono">
              {countdown}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
              {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'}
            </span>
          </div>
        </div>

        {/* Phase instructions */}
        <div className="min-h-[48px] mb-6">
          <h4 className="text-base font-semibold text-slate-800">
            {current.text}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {current.sub}
          </p>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            Завершено циклов: <span className="font-semibold text-slate-700">{completedCycles}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs flex items-center gap-1.5 px-3"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isActive ? 'Пауза' : 'Продолжить'}</span>
            </button>

            <button
              onClick={() => {
                setPhase('inhale');
                setCountdown(4);
                setCompletedCycles(0);
              }}
              title="Начать сначала"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
