import React, { useState } from 'react';
import { HeroState, EmotionAnalysisResult } from '../types';
import { atlasById } from '../data/atlas87';
import { PLUTCHIK, WU_XING, JAPANESE_CONCEPTS } from '../data/wheels';
import { Sparkles, Check, Swords, Compass } from 'lucide-react';

export interface HeroAction {
  id: string;
  label: string;
  hint: string;
  icon: string;
  gain: Partial<Pick<HeroState, 'energy' | 'calm' | 'courage' | 'clarity'>>;
  light: number;
  xp: number;
  note: string;
}

export const HERO_ACTIONS: HeroAction[] = [
  { id: 'breathe', label: 'Три глубоких вдоха', hint: 'Выдох длиннее вдоха', icon: '◍', gain: { calm: 8, energy: 2 }, light: 4, xp: 8, note: 'Длинный выдох активирует блуждающий нерв — пульс замедляется за 40 секунд.' },
  { id: 'water', label: 'Стакан воды медленно', hint: 'Вкус и прохлада', icon: '◈', gain: { energy: 7, clarity: 3 }, light: 3, xp: 6, note: 'Даже 2% обезвоживания заметно снижают концентрацию и настроение.' },
  { id: 'walk', label: 'Прогулка 10 минут', hint: 'Без телефона', icon: '⬙', gain: { energy: 9, clarity: 6, calm: 4 }, light: 6, xp: 12, note: '森林浴 Shinrin-yoku: короткая прогулка снижает кортизол сильнее, чем час в ленте.' },
  { id: 'name', label: 'Назвать эмоцию словом', hint: 'Точное имя', icon: '✎', gain: { clarity: 9, calm: 4 }, light: 5, xp: 10, note: 'Affect labeling: названная эмоция теряет до 50% интенсивности в миндалине.' },
  { id: 'kind', label: 'Сказать себе как другу', hint: 'Самосострадание', icon: '❀', gain: { calm: 7, courage: 5 }, light: 5, xp: 10, note: 'Kristin Neff: самосострадание снижает стыд эффективнее самокритики.' },
  { id: 'reach', label: 'Написать одному человеку', hint: 'Короткое сообщение', icon: '✉', gain: { courage: 10, calm: 3 }, light: 7, xp: 14, note: 'Один социальный контакт разрывает петлю изоляции быстрее всего.' },
  { id: 'stretch', label: 'Размять плечи и шею', hint: '60 секунд', icon: '⟡', gain: { energy: 6, calm: 5 }, light: 3, xp: 6, note: 'Гнев и тревога живут в мышцах — движение даёт им выход.' },
  { id: 'rest', label: 'Разрешить себе паузу', hint: 'Без чувства вины', icon: '☾', gain: { energy: 11, calm: 6 }, light: 6, xp: 12, note: 'Отдых — условие продуктивности, а не награда за неё.' },
  { id: 'gratitude', label: 'Назвать одну благодарность', hint: 'Даже мелочь', icon: '✦', gain: { clarity: 5, calm: 6 }, light: 5, xp: 10, note: 'Практика благодарности усиливает радость и смягчает foreboding joy.' },
  { id: 'boundary', label: 'Сказать одно «нет»', hint: 'Спокойно и ясно', icon: '⛨', gain: { courage: 12, clarity: 4 }, light: 7, xp: 14, note: 'Ясные границы — основа доброты, а не её противоположность.' },
  { id: 'step', label: 'Один микро-шаг по делу', hint: '5 минут максимум', icon: '➜', gain: { energy: 5, courage: 6, clarity: 4 }, light: 6, xp: 12, note: 'Минимальная доза действия разрывает паралич избегания.' },
  { id: 'sun', label: 'Постоять у окна на свету', hint: '2 минуты', icon: '☀', gain: { energy: 6, calm: 5 }, light: 4, xp: 8, note: 'Утренний свет настраивает циркадные ритмы и стабилизирует настроение.' }
];

interface Props {
  hero: HeroState;
  analysis: EmotionAnalysisResult;
  onHeroChange: (h: HeroState) => void;
  onGoToWorld: () => void;
}

export const HeroActionsPanel: React.FC<Props> = ({ hero, analysis, onHeroChange, onGoToWorld }) => {
  const [done, setDone] = useState<string[]>([]);
  const [lastNote, setLastNote] = useState<string | null>(null);

  const perform = (a: HeroAction) => {
    if (done.includes(a.id)) return;
    const xp = hero.xp + a.xp;
    onHeroChange({
      ...hero,
      energy: Math.min(100, hero.energy + (a.gain.energy || 0)),
      calm: Math.min(100, hero.calm + (a.gain.calm || 0)),
      courage: Math.min(100, hero.courage + (a.gain.courage || 0)),
      clarity: Math.min(100, hero.clarity + (a.gain.clarity || 0)),
      light: hero.light + a.light,
      xp,
      level: 1 + Math.floor(xp / 100)
    });
    setDone(d => [...d, a.id]);
    setLastNote(a.note);
  };

  // Подбор действий под текущую эмоцию
  const priority: Record<string, string[]> = {
    anxiety: ['breathe', 'name', 'walk', 'kind', 'stretch', 'water'],
    burnout: ['rest', 'water', 'sun', 'step', 'breathe', 'walk'],
    sadness: ['kind', 'reach', 'walk', 'gratitude', 'sun', 'breathe'],
    uncertainty: ['name', 'step', 'walk', 'breathe', 'gratitude', 'water'],
    resolve: ['boundary', 'stretch', 'breathe', 'step', 'walk', 'water'],
    joy: ['gratitude', 'reach', 'sun', 'walk', 'step', 'kind'],
    love: ['reach', 'gratitude', 'kind', 'sun', 'walk', 'breathe'],
    hope: ['step', 'gratitude', 'walk', 'sun', 'reach', 'name'],
    calm: ['gratitude', 'sun', 'walk', 'rest', 'breathe', 'kind'],
    calm_hope: ['gratitude', 'walk', 'step', 'sun', 'breathe', 'reach'],
    reboot: ['water', 'walk', 'rest', 'step', 'sun', 'stretch']
  };
  const order = priority[analysis.dominantEmotion] || HERO_ACTIONS.map(a => a.id);
  const sorted = [...HERO_ACTIONS].sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  }).slice(0, 8);

  const atlas = (analysis.atlas || []).map(atlasById).filter(Boolean);
  const petals = (analysis.plutchik || []).map(id => PLUTCHIK.find(p => p.id === id)).filter(Boolean);
  const wx = WU_XING.find(w => w.id === analysis.wuxing);
  const jp = JAPANESE_CONCEPTS.find(j => j.id === analysis.japanese);

  return (
    <div className="flex flex-col gap-4">
      {/* Распознанные тонкие эмоции */}
      {(atlas.length > 0 || petals.length > 0) && (
        <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-800">Что распознал алгоритм в ваших словах</h4>
          </div>

          {atlas.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Atlas of the Heart · 87 эмоций
              </div>
              <div className="flex flex-wrap gap-2">
                {atlas.map(a => a && (
                  <div key={a.id} className="group relative px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold cursor-help"
                    style={{ background: `${a.hex}1F`, borderColor: `${a.hex}66`, color: '#1E293B' }}>
                    {a.ru}
                    <div className="absolute bottom-full left-0 mb-1.5 w-56 p-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-normal leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                      {a.def}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {petals.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-700 mb-1">Плутчик</div>
                <div className="flex flex-wrap gap-1">
                  {petals.map(p => p && (
                    <span key={p.id} className="px-2 py-0.5 rounded-lg font-semibold" style={{ background: `${p.hex}44` }}>{p.ru}</span>
                  ))}
                </div>
              </div>
            )}
            {wx && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-700 mb-1">У-син: {wx.ru} {wx.cn}</div>
                <div className="text-slate-500 leading-relaxed">{wx.balance}</div>
              </div>
            )}
            {jp && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-700 mb-1">{jp.jp} · {jp.ru}</div>
                <div className="text-slate-500 leading-relaxed">{jp.practice}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Действия героя */}
      <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800">Действия героя</h4>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">Энергия {hero.energy}</span>
            <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700">Покой {hero.calm}</span>
            <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700">Смелость {hero.courage}</span>
            <span className="px-2 py-1 rounded-lg bg-violet-50 text-violet-700">Ясность {hero.clarity}</span>
            <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700">✦ {hero.light}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Выполните действие в реальной жизни и отметьте его — характеристики героя и погода вашего мира изменятся.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sorted.map(a => {
            const isDone = done.includes(a.id);
            return (
              <button key={a.id} onClick={() => perform(a)} disabled={isDone}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isDone ? 'bg-emerald-50 border-emerald-200 cursor-default' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 active:scale-[0.98]'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base leading-none" style={{ color: isDone ? '#059669' : '#6366F1' }}>{a.icon}</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">{a.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{a.hint}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {a.gain.energy ? <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">+{a.gain.energy} эн</span> : null}
                  {a.gain.calm ? <span className="text-[8px] px-1 py-0.5 rounded bg-sky-100 text-sky-700 font-bold">+{a.gain.calm} пок</span> : null}
                  {a.gain.courage ? <span className="text-[8px] px-1 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">+{a.gain.courage} см</span> : null}
                  {a.gain.clarity ? <span className="text-[8px] px-1 py-0.5 rounded bg-violet-100 text-violet-700 font-bold">+{a.gain.clarity} яс</span> : null}
                </div>
              </button>
            );
          })}
        </div>

        {lastNote && (
          <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 animate-in fade-in">
            {lastNote}
          </div>
        )}

        <button onClick={onGoToWorld}
          className="mt-3 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]">
          <Swords className="w-3.5 h-3.5" />
          <span>Открыть Мой Мир и встретиться с Тенями</span>
        </button>
      </div>
    </div>
  );
};
