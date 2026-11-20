import React, { useState, useEffect, useRef } from 'react';
import { ShadowBoss } from '../data/shadows';
import { HeroState } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { PixelAvatarConfig } from '../data/pixelParts';
import confetti from 'canvas-confetti';
import { Wind, Heart, Sparkles, X, ShieldCheck, Swords, ArrowRight } from 'lucide-react';

interface ShadowBattleProps {
  shadow: ShadowBoss;
  avatar: PixelAvatarConfig;
  hero: HeroState;
  onWin: (reward: ShadowBoss['reward']) => void;
  onFlee: () => void;
}

type Phase = 'intro' | 'dialogue' | 'feedback' | 'breath' | 'victory';

/* ---------- Пиксельный силуэт Тени ---------- */
const ShadowSprite: React.FC<{ shadow: ShadowBoss; hurt: boolean; hpPct: number }> = ({ shadow, hurt, hpPct }) => {
  const body: [number, number, number, number][] = (() => {
    switch (shadow.shape) {
      case 'spiky':
        return [[5,6,14,16],[3,10,2,8],[19,10,2,8],[7,2,2,4],[11,0,2,6],[15,2,2,4],[6,22,12,4],[4,26,16,2]];
      case 'tall':
        return [[7,2,10,24],[5,6,2,14],[17,6,2,14],[9,0,6,3],[5,26,14,3]];
      case 'heavy':
        return [[3,8,18,18],[5,4,14,6],[1,12,2,10],[21,12,2,10],[3,26,18,3]];
      case 'split':
        return [[4,4,7,22],[13,4,7,22],[4,2,7,3],[13,2,7,3],[3,26,18,2]];
      case 'eye':
        return [[5,5,14,16],[3,9,2,8],[19,9,2,8],[6,21,12,5],[4,26,16,2]];
      case 'blob':
      default:
        return [[4,8,16,16],[6,4,12,5],[2,12,2,9],[20,12,2,9],[4,24,16,4]];
    }
  })();

  return (
    <div className={`relative transition-transform duration-150 ${hurt ? 'translate-x-1 scale-95' : ''}`}>
      <div
        className="absolute inset-0 blur-2xl rounded-full transition-opacity"
        style={{ background: shadow.hex, opacity: 0.25 + (hpPct / 100) * 0.4 }}
      />
      <svg viewBox="0 0 24 32" width={150} height={200} shapeRendering="crispEdges" className="relative z-10 sk-idle">
        {body.map((r, i) => (
          <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={hurt ? '#FFFFFF' : shadow.darkHex} opacity={0.92} />
        ))}
        {body.map((r, i) => (
          <rect key={'h' + i} x={r[0]} y={r[1]} width={r[2]} height={1} fill={shadow.hex} opacity={0.8} />
        ))}
        {/* глаза */}
        <rect x={8} y={11} width={3} height={3} fill={hurt ? shadow.darkHex : shadow.hex} />
        <rect x={14} y={11} width={3} height={3} fill={hurt ? shadow.darkHex : shadow.hex} />
        <rect x={9} y={12} width={1} height={1} fill="#FFFFFF" />
        <rect x={15} y={12} width={1} height={1} fill="#FFFFFF" />
      </svg>
    </div>
  );
};

/* ---------- Полоска ---------- */
const Bar: React.FC<{ value: number; max: number; color: string; label: string; right?: boolean }> = ({
  value, max, color, label, right
}) => (
  <div className={`w-full ${right ? 'text-right' : ''}`}>
    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
      <span>{label}</span>
      <span>{Math.max(0, Math.round(value))}/{max}</span>
    </div>
    <div className="h-2.5 w-full rounded-full bg-black/30 overflow-hidden border border-white/20">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, (value / max) * 100)}%`, background: color }}
      />
    </div>
  </div>
);

export const ShadowBattle: React.FC<ShadowBattleProps> = ({ shadow, avatar, hero, onWin, onFlee }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [shadowHp, setShadowHp] = useState(shadow.hp);
  const [resolve, setResolve] = useState(Math.round(60 + hero.calm * 0.4));
  const maxResolve = Math.round(60 + hero.calm * 0.4);
  const [turnIdx, setTurnIdx] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [hurt, setHurt] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // дыхательная мини-игра
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathCount, setBreathCount] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const breathTimer = useRef<number | null>(null);

  const turn = shadow.turns[Math.min(turnIdx, shadow.turns.length - 1)];

  /* дыхание */
  useEffect(() => {
    if (phase !== 'breath') return;
    breathTimer.current = window.setInterval(() => {
      setBreathCount(prev => {
        if (prev > 1) return prev - 1;
        if (breathPhase === 'in') { setBreathPhase('hold'); return 7; }
        if (breathPhase === 'hold') { setBreathPhase('out'); return 8; }
        setBreathPhase('in');
        setBreathCycles(c => c + 1);
        // урон за цикл
        const dmg = shadow.weakness === 'breath' ? 22 : 12;
        setShadowHp(h => Math.max(0, h - dmg));
        setResolve(r => Math.min(maxResolve, r + 10));
        setHurt(true);
        setTimeout(() => setHurt(false), 180);
        return 4;
      });
    }, 1000);
    return () => { if (breathTimer.current) clearInterval(breathTimer.current); };
  }, [phase, breathPhase, shadow.weakness, maxResolve]);

  /* победа */
  useEffect(() => {
    if (shadowHp <= 0 && phase !== 'victory') {
      setPhase('victory');
      confetti({
        particleCount: 90, spread: 100, origin: { y: 0.5 },
        colors: ['#FDE68A', '#A7F3D0', '#C4B5FD', '#FBCFE8', '#BAE6FD'], scalar: 1
      });
    }
  }, [shadowHp, phase]);

  const choose = (opt: ShadowBoss['turns'][number]['options'][number]) => {
    if (opt.good) {
      const dmg = 26 + Math.round(hero.clarity * 0.12);
      setShadowHp(h => Math.max(0, h - dmg));
      setHurt(true);
      setTimeout(() => setHurt(false), 200);
      setLog(l => [`✦ Верный ответ — Тень теряет ${dmg} силы`, ...l].slice(0, 4));
    } else {
      setResolve(r => Math.max(0, r - 18));
      setLog(l => ['✖ Слияние с Тенью — устойчивость падает на 18', ...l].slice(0, 4));
    }
    setLastFeedback({ good: opt.good, text: opt.feedback });
    setPhase('feedback');
  };

  const nextAfterFeedback = () => {
    setLastFeedback(null);
    if (turnIdx + 1 < shadow.turns.length) {
      setTurnIdx(i => i + 1);
      setPhase('dialogue');
    } else {
      setPhase('breath'); // финальная фаза — добить дыханием
    }
  };

  const hpPct = (shadowHp / shadow.hp) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* фон */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(90% 80% at 50% 20%, ${shadow.hex}55 0%, transparent 70%)` }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px)' }} />

      {/* HUD верх */}
      <div className="relative z-10 flex items-center justify-between gap-4 p-4 max-w-5xl w-full mx-auto">
        <div className="flex-1 max-w-xs">
          <Bar value={shadowHp} max={shadow.hp} color={shadow.hex} label={`Тень: ${shadow.name}`} />
        </div>
        <button
          onClick={onFlee}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-colors shrink-0"
          title="Отступить (это тоже нормально)"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 max-w-xs">
          <Bar value={resolve} max={maxResolve} color="#86EFAC" label="Ваша устойчивость" right />
        </div>
      </div>

      {/* Арена */}
      <div className="relative z-10 flex-1 flex items-end justify-center gap-6 sm:gap-20 px-4 pb-2 max-w-5xl w-full mx-auto">
        <div className="flex flex-col items-center">
          <PixelAvatar config={avatar} size={116} animate shadow facing="right" />
          <span className="mt-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Вы</span>
        </div>

        <div className="flex flex-col items-center">
          <ShadowSprite shadow={shadow} hurt={hurt} hpPct={hpPct} />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: shadow.hex }}>
            {shadow.title}
          </span>
        </div>
      </div>

      {/* Панель действий */}
      <div className="relative z-10 w-full max-w-3xl mx-auto p-4">
        <div className="rounded-3xl bg-slate-900/85 border border-white/15 backdrop-blur-xl p-5 shadow-2xl">

          {phase === 'intro' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3"
                style={{ background: `${shadow.hex}22`, color: shadow.hex }}>
                <Swords className="w-3.5 h-3.5" />
                <span>Встреча с собой</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-3">{shadow.intro}</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-amber-300 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Слабость Тени: {shadow.weaknessLabel}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Тень — не враг. Это часть вас, которая пытается защитить вас устаревшим способом. Победа — не уничтожение, а понимание.
              </p>
              <button
                onClick={() => setPhase('dialogue')}
                className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
              >
                Встретиться лицом к лицу
              </button>
            </div>
          )}

          {phase === 'dialogue' && (
            <div>
              <div className="mb-4 p-3.5 rounded-2xl border text-sm italic leading-relaxed"
                style={{ background: `${shadow.hex}14`, borderColor: `${shadow.hex}44`, color: '#E2E8F0' }}>
                {turn.line}
              </div>
              <div className="grid gap-2">
                {turn.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => choose(o)}
                    className="text-left px-4 py-3 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 text-slate-100 text-xs sm:text-sm transition-all active:scale-[0.99]"
                  >
                    {o.text}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                <span>Ход {turnIdx + 1} из {shadow.turns.length}</span>
                <span>{log[0] || 'Выберите ответ, который вы хотели бы услышать от друга'}</span>
              </div>
            </div>
          )}

          {phase === 'feedback' && lastFeedback && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 ${
                lastFeedback.good ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {lastFeedback.good ? <ShieldCheck className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                <span>{lastFeedback.good ? 'Здоровый ответ' : 'Ловушка мышления'}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4 max-w-xl mx-auto">{lastFeedback.text}</p>
              <button
                onClick={nextAfterFeedback}
                className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all active:scale-95 inline-flex items-center gap-1.5"
              >
                <span>Дальше</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {phase === 'breath' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 bg-sky-500/20 text-sky-300">
                <Wind className="w-3.5 h-3.5" />
                <span>Финальная фаза — дыхание 4-7-8</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Дышите вместе с кольцом. Каждый завершённый цикл ослабляет Тень и возвращает вам устойчивость.
              </p>

              <div className="relative h-44 flex items-center justify-center mb-3">
                <div
                  className="absolute rounded-full transition-all ease-in-out"
                  style={{
                    width: breathPhase === 'out' ? 90 : 165,
                    height: breathPhase === 'out' ? 90 : 165,
                    transitionDuration: breathPhase === 'in' ? '4s' : breathPhase === 'out' ? '8s' : '0.4s',
                    background: `radial-gradient(circle, ${shadow.hex}66, transparent 70%)`
                  }}
                />
                <div
                  className="relative z-10 rounded-full border-4 border-white/70 flex flex-col items-center justify-center transition-all ease-in-out bg-white/10 backdrop-blur-xs"
                  style={{
                    width: breathPhase === 'out' ? 76 : 136,
                    height: breathPhase === 'out' ? 76 : 136,
                    transitionDuration: breathPhase === 'in' ? '4s' : breathPhase === 'out' ? '8s' : '0.4s'
                  }}
                >
                  <span className="text-3xl font-black text-white font-mono">{breathCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                    {breathPhase === 'in' ? 'Вдох' : breathPhase === 'hold' ? 'Держим' : 'Выдох'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 mb-3">
                Завершено циклов: <strong className="text-white">{breathCycles}</strong> · Тень слабеет
              </div>
              <button
                onClick={() => { setShadowHp(h => Math.max(0, h - 14)); setHurt(true); setTimeout(() => setHurt(false), 180); }}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
              >
                Длинный выдох (дополнительный удар)
              </button>
            </div>
          )}

          {phase === 'victory' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 bg-amber-400/20 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Тень принята</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4 max-w-xl mx-auto">{shadow.victory}</p>

              <div className="inline-block px-4 py-3 rounded-2xl bg-white/10 border border-white/20 mb-4">
                <div className="text-sm font-bold text-amber-300">{shadow.giftName}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">{shadow.giftDesc}</div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-[11px] font-bold">
                {shadow.reward.calm ? <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300">+{shadow.reward.calm} спокойствие</span> : null}
                {shadow.reward.courage ? <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300">+{shadow.reward.courage} смелость</span> : null}
                {shadow.reward.energy ? <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">+{shadow.reward.energy} энергия</span> : null}
                {shadow.reward.clarity ? <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300">+{shadow.reward.clarity} ясность</span> : null}
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300">+{shadow.reward.light} свет</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white">+{shadow.reward.xp} опыта</span>
              </div>

              <button
                onClick={() => onWin(shadow.reward)}
                className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
              >
                Вернуться в мир
              </button>
            </div>
          )}

          {resolve <= 0 && phase !== 'victory' && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs text-center">
              Устойчивость на нуле — и это не поражение. Отступите, подышите в Святилище и вернитесь позже. Отдых — часть стратегии.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
