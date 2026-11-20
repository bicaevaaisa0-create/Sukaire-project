import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { COLOR_MATRIX } from '../data/colorMatrix';
import { Activity, Sparkles, TrendingUp, Calendar, Heart } from 'lucide-react';

interface EmotionalWaveProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const EmotionalWave: React.FC<EmotionalWaveProps> = ({ entries, onSelectEntry }) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(
    entries.length > 0 ? entries[0] : null
  );
  const [timeFilter, setTimeFilter] = useState<'7d' | '14d' | 'all'>('7d');

  // Filter entries according to selected timeframe and sort chronologically (oldest to newest for the graph)
  const filteredEntries = [...entries]
    .filter((_, idx) => {
      if (timeFilter === '7d') return idx < 7;
      if (timeFilter === '14d') return idx < 14;
      return true;
    })
    .reverse();

  const width = 760;
  const height = 260;
  const paddingX = 45;
  const paddingY = 40;

  if (filteredEntries.length === 0) {
    return (
      <div className="p-8 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 text-slate-500">
        <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
        <p className="text-sm">Пока нет записей для построения хроматической волны.</p>
      </div>
    );
  }

  // Calculate coordinates
  const stepX = (width - paddingX * 2) / Math.max(1, filteredEntries.length - 1);
  const points = filteredEntries.map((item, idx) => {
    const x = paddingX + idx * stepX;
    // Map tone score (1 to 10) to Y (higher tone = higher on screen, meaning lower Y coordinate)
    const normalizedScore = Math.max(1, Math.min(10, item.toneScore || 5));
    const y = height - paddingY - ((normalizedScore - 1) / 9) * (height - paddingY * 2);
    const color = COLOR_MATRIX[item.dominantEmotion]?.primaryHex || '#94A3B8';
    return { x, y, item, color };
  });

  // Build smooth cubic Bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Area path closed to bottom for gradient flood
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 15} L ${points[0].x} ${height - 15} Z`;

  // Dynamic emotional transition statement
  const firstEmotion = filteredEntries[0].dominantEmotion;
  const lastEmotion = filteredEntries[filteredEntries.length - 1].dominantEmotion;
  const trendNotice =
    firstEmotion === lastEmotion
      ? `Стабильный эмоциональный фон: доминирует ${COLOR_MATRIX[lastEmotion]?.nameRu.toLowerCase()}`
      : `Мягкая динамика: переход от ${COLOR_MATRIX[firstEmotion]?.nameRu.toLowerCase()} к ${COLOR_MATRIX[lastEmotion]?.nameRu.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Хроматическая Волна Тонуса</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Живая шкала
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {trendNotice}
            </p>
          </div>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-xs">
          <button
            type="button"
            onClick={() => setTimeFilter('7d')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              timeFilter === '7d' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            7 дней
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('14d')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              timeFilter === '14d' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            14 дней
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              timeFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Все
          </button>
        </div>
      </div>

      {/* SVG Chromatic Wave Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-md">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[580px] select-none block"
          >
            <defs>
              {/* Multi-stop linear gradient along wave */}
              <linearGradient id="waveFillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                {points.map((p, i) => (
                  <stop
                    key={i}
                    offset={`${(i / Math.max(1, points.length - 1)) * 100}%`}
                    stopColor={p.color}
                    stopOpacity="0.45"
                  />
                ))}
              </linearGradient>

              <linearGradient id="waveLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                {points.map((p, i) => (
                  <stop
                    key={i}
                    offset={`${(i / Math.max(1, points.length - 1)) * 100}%`}
                    stopColor={p.color}
                  />
                ))}
              </linearGradient>

              {/* Vertical soft fade for bottom edge */}
              <linearGradient id="verticalFade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal baseline guides */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#E2E8F0" strokeDasharray="4 4" />

            <text x={12} y={paddingY + 4} fill="#94A3B8" fontSize="10" fontFamily="sans-serif">Высокий</text>
            <text x={12} y={height / 2 + 4} fill="#94A3B8" fontSize="10" fontFamily="sans-serif">Баланс</text>
            <text x={12} y={height - paddingY + 4} fill="#94A3B8" fontSize="10" fontFamily="sans-serif">Покой</text>

            {/* Filled area */}
            <path d={areaD} fill="url(#waveFillGrad)" />

            {/* Main spline stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#waveLineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Interactive Points */}
            {points.map((p, idx) => {
              const isSelected = selectedEntry?.id === p.item.id;
              return (
                <g
                  key={p.item.id || idx}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntry(p.item);
                    if (onSelectEntry) onSelectEntry(p.item);
                  }}
                >
                  {/* Outer selection ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 14 : 9}
                    fill={p.color}
                    opacity={isSelected ? 0.35 : 0.15}
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Inner Node */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 7 : 5}
                    fill="#FFFFFF"
                    stroke={p.color}
                    strokeWidth="3.5"
                    className="transition-all duration-300"
                  />

                  {/* Date label at bottom */}
                  <text
                    x={p.x}
                    y={height - 5}
                    textAnchor="middle"
                    fill={isSelected ? '#0F172A' : '#94A3B8'}
                    fontSize="10"
                    fontWeight={isSelected ? '600' : '400'}
                    fontFamily="sans-serif"
                  >
                    {p.item.dateString}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Details Card */}
      {selectedEntry && (
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full shadow-xs border border-white"
                style={{
                  backgroundColor: COLOR_MATRIX[selectedEntry.dominantEmotion]?.primaryHex || '#86EFAC'
                }}
              />
              <span className="text-sm font-bold text-slate-800">
                {COLOR_MATRIX[selectedEntry.dominantEmotion]?.nameRu}
              </span>
              {selectedEntry.secondaryEmotion && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  + {COLOR_MATRIX[selectedEntry.secondaryEmotion]?.nameRu}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedEntry.dateString}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Тонус: <strong>{selectedEntry.toneScore}/10</strong></span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
            «{selectedEntry.rawText}»
          </p>

          {selectedEntry.analysis && (
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{selectedEntry.analysis.psychologicalValidation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
