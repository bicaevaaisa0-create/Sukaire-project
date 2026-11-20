import React, { useState } from 'react';
import { PLUTCHIK, PLUTCHIK_DYADS, WU_XING, JAPANESE_CONCEPTS } from '../data/wheels';
import { ATLAS_87, ATLAS_CATEGORIES, AtlasEmotion } from '../data/atlas87';
import { COLOR_MATRIX } from '../data/colorMatrix';
import { Compass, Globe2, Search, Layers, BookOpen } from 'lucide-react';

type Tab = 'plutchik' | 'atlas' | 'east';

export const EmotionWheels: React.FC = () => {
  const [tab, setTab] = useState<Tab>('plutchik');
  const [sel, setSel] = useState(PLUTCHIK[0]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<number | 'all'>('all');
  const [atlasSel, setAtlasSel] = useState<AtlasEmotion>(ATLAS_87[0]);

  const R = 150;
  const cx = 170, cy = 170;

  const petalPath = (angle: number, r1: number, r2: number) => {
    const a0 = ((angle - 22.5) * Math.PI) / 180;
    const a1 = ((angle + 22.5) * Math.PI) / 180;
    const p = (a: number, r: number) => `${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
    return `M ${p(a0, r1)} L ${p(a0, r2)} A ${r2} ${r2} 0 0 1 ${p(a1, r2)} L ${p(a1, r1)} A ${r1} ${r1} 0 0 0 ${p(a0, r1)} Z`;
  };

  const filtered = ATLAS_87.filter(e =>
    (cat === 'all' || e.cat === cat) &&
    (q === '' || e.ru.toLowerCase().includes(q.toLowerCase()) || e.en.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Переключатель */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs w-fit text-xs font-semibold text-slate-600">
        {([
          { id: 'plutchik', label: 'Колесо Плутчика', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'atlas', label: 'Атлас 87 эмоций', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'east', label: 'У-син и Япония', icon: <Globe2 className="w-3.5 h-3.5" /> }
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              tab === t.id ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900'
            }`}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ---------- ПЛУТЧИК ---------- */}
      {tab === 'plutchik' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Колесо эмоций Роберта Плутчика</h3>
            <p className="text-[11px] text-slate-500 mb-3 text-center max-w-sm">
              8 базовых эмоций × 3 уровня интенсивности. Внутри — сильнее, снаружи — мягче. Нажмите на лепесток.
            </p>
            <svg viewBox="0 0 340 340" className="w-full max-w-sm">
              {PLUTCHIK.map(p => (
                <g key={p.id} onClick={() => setSel(p)} className="cursor-pointer">
                  <path d={petalPath(p.angle, 100, R)} fill={p.mild.hex}
                    stroke={sel.id === p.id ? '#0F172A' : '#ffffff'} strokeWidth={sel.id === p.id ? 2 : 1} />
                  <path d={petalPath(p.angle, 55, 100)} fill={p.base.hex}
                    stroke={sel.id === p.id ? '#0F172A' : '#ffffff'} strokeWidth={sel.id === p.id ? 2 : 1} />
                  <path d={petalPath(p.angle, 18, 55)} fill={p.intense.hex}
                    stroke={sel.id === p.id ? '#0F172A' : '#ffffff'} strokeWidth={sel.id === p.id ? 2 : 1} />
                  <text
                    x={cx + Math.cos((p.angle * Math.PI) / 180) * 128}
                    y={cy + Math.sin((p.angle * Math.PI) / 180) * 128}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fontWeight="700" fill="#1E293B" className="pointer-events-none">
                    {p.ru}
                  </text>
                </g>
              ))}
              <circle cx={cx} cy={cy} r={17} fill="#0F172A" />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill="#fff">ЯДРО</text>
            </svg>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-4 h-4 rounded-full" style={{ background: sel.hex }} />
                <h4 className="text-lg font-extrabold text-slate-900">{sel.ru}</h4>
                <span className="text-xs text-slate-400">{sel.en}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[sel.mild, sel.base, sel.intense].map((lvl, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-100 text-center" style={{ background: `${lvl.hex}33` }}>
                    <div className="text-[9px] uppercase font-bold text-slate-500">
                      {i === 0 ? 'мягко' : i === 1 ? 'базово' : 'сильно'}
                    </div>
                    <div className="text-xs font-bold text-slate-800">{lvl.ru}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Противоположность</span>
                  <span className="font-bold text-slate-800">{PLUTCHIK.find(p => p.id === sel.opposite)?.ru}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">В матрице Sukaire</span>
                  <span className="font-bold text-slate-800">{COLOR_MATRIX[sel.sukaire].nameRu}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-800">Диады — эмоции второго порядка</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PLUTCHIK_DYADS.map(d => {
                  const a = PLUTCHIK.find(p => p.id === d.a)!;
                  const b = PLUTCHIK.find(p => p.id === d.b)!;
                  const active = sel.id === d.a || sel.id === d.b;
                  return (
                    <div key={d.ru} className={`p-2.5 rounded-xl border text-xs transition-all ${
                      active ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: a.hex }} />
                        <span className="w-2 h-2 rounded-full" style={{ background: b.hex }} />
                        <span className="font-bold text-slate-800">{d.ru}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{d.note}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ATLAS 87 ---------- */}
      {tab === 'atlas' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Атлас сердца — 87 эмоций</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-3xl">
              Полная карта из книги Brené Brown «Atlas of the Heart»: 13 территорий, на которые мы попадаем.
              Все 87 состояний подключены к ИИ-анализу вашего текста в дневнике.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Найти эмоцию..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none" />
              </div>
              <button onClick={() => setCat('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${cat === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Все ({ATLAS_87.length})
              </button>
              {ATLAS_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    cat === c.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c.hex }} />
                  <span className="max-w-[160px] truncate">{c.ru}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1">
              {filtered.map(e => (
                <button key={e.id} onClick={() => setAtlasSel(e)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    atlasSel.id === e.id ? 'bg-white border-slate-900 ring-1 ring-slate-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}>
                  <span className="block w-full h-1.5 rounded-full mb-1.5" style={{ background: e.hex }} />
                  <div className="text-[11px] font-bold text-slate-800 leading-tight">{e.ru}</div>
                  <div className="text-[9px] text-slate-400">{e.en}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">Ничего не найдено</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl border shadow-sm" style={{ background: `${atlasSel.hex}14`, borderColor: `${atlasSel.hex}55` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  {ATLAS_CATEGORIES.find(c => c.id === atlasSel.cat)?.ru}
                </span>
                <h4 className="text-2xl font-extrabold text-slate-900">{atlasSel.ru}</h4>
                <span className="text-xs text-slate-500">{atlasSel.en}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl border border-white shadow-xs" style={{ background: atlasSel.hex }} />
                <div className="px-3 py-1.5 rounded-xl bg-white/70 text-xs font-bold text-slate-700 border border-white">
                  Матрица: {COLOR_MATRIX[atlasSel.base].nameRu}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-white/60 p-4 rounded-2xl border border-white/70">
              {atlasSel.def}
            </p>
          </div>
        </div>
      )}

      {/* ---------- ВОСТОК ---------- */}
      {tab === 'east' && (
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">У-син — пять стихий (Китай)</h3>
            <p className="text-xs text-slate-500 mb-4">Каждая стихия связывает орган, сезон и эмоцию. Дисбаланс лечится противоположным движением.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {WU_XING.map(w => (
                <div key={w.id} className="p-4 rounded-2xl border border-slate-100 flex flex-col" style={{ background: `${w.hex}18` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-md border border-white" style={{ background: w.hex }} />
                    <span className="text-sm font-extrabold text-slate-900">{w.ru}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">{w.cn} · {w.season}</div>
                  <div className="text-[11px] text-slate-700 space-y-1 mb-2">
                    <div><strong>Орган:</strong> {w.organ}</div>
                    <div><strong>В балансе:</strong> {w.emotionPos}</div>
                    <div><strong>В избытке:</strong> {w.emotionNeg}</div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-auto pt-2 border-t border-white/70">{w.balance}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Японские концепции чувств</h3>
            <p className="text-xs text-slate-500 mb-4">Состояния, для которых в русском и английском нет одного слова — но которые мы все переживаем.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {JAPANESE_CONCEPTS.map(j => (
                <div key={j.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 flex flex-col">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-slate-900">{j.jp}</span>
                    <span className="text-[11px] text-slate-400 italic">{j.romaji}</span>
                  </div>
                  <div className="text-xs font-bold mb-1.5" style={{ color: j.hex }}>{j.ru}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{j.desc}</p>
                  <div className="mt-auto p-2.5 rounded-xl bg-white border border-slate-100 text-[11px] text-slate-700">
                    <strong>Практика:</strong> {j.practice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
