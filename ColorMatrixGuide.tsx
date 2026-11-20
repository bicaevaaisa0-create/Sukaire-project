import React, { useState } from 'react';
import { COLOR_MATRIX, PSYCHOLOGY_RESOURCES } from '../data/colorMatrix';
import { EmotionKey } from '../types';
import { BookOpen, Globe2, Palette, Sparkles, Layers, Info } from 'lucide-react';

export const ColorMatrixGuide: React.FC = () => {
  const [selectedEmotionKey, setSelectedEmotionKey] = useState<EmotionKey>('calm_hope');

  const selected = COLOR_MATRIX[selectedEmotionKey];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Research Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
          <Palette className="w-4 h-4" />
          <span>Матрица «Цветная логика» • Sukaire</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Синтез 128 лет исследований и культурного кода
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Матрица составлена с учётом личных ассоциаций авторов, результатов масштабного систематического обзора исследований восприятия цвета (более 128 лет, свыше 42 000 участников из 64 стран) и культурных традиций Казахстана и Китая.
        </p>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Формула 70 / 30</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Доминирующая эмоция задает основной цвет (60–70%), вторичная формирует подтона и градиентные переливы (20–30%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Globe2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Культурный контекст</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Учет степных архетипов (Көк, Ақ, Жасыл) и древней космологии пяти первоэлементов У-син.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Динамика и текстура</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Интенсивность чувства отражается в плотности зерна, скорости вибрации линий и объеме «воздуха» в композиции.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Matrix Browser */}
      <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>Интерактивный Атлас Эмоций (11 состояний)</span>
        </h3>

        {/* Emotion Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(COLOR_MATRIX) as EmotionKey[]).map(key => {
            const item = COLOR_MATRIX[key];
            const isSelected = selectedEmotionKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedEmotionKey(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.primaryHex }}
                />
                <span>{item.nameRu}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Emotion Detail Card */}
        <div
          className="p-6 rounded-2xl border transition-all"
          style={{
            background: selected.bgGradient,
            borderColor: `${selected.primaryHex}66`
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                Выбранное состояние
              </span>
              <h4 className="text-xl font-extrabold text-slate-900">
                {selected.nameRu}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg shadow-xs border border-white"
                style={{ backgroundColor: selected.primaryHex }}
                title={`Основной: ${selected.primaryHex}`}
              />
              <div
                className="w-6 h-6 rounded-lg shadow-xs border border-white"
                style={{ backgroundColor: selected.secondaryHex }}
                title={`Вторичный: ${selected.secondaryHex}`}
              />
              <div
                className="w-6 h-6 rounded-lg shadow-xs border border-white"
                style={{ backgroundColor: selected.accentHex }}
                title={`Акцент: ${selected.accentHex}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60">
              <span className="font-bold text-slate-700 block mb-1">Основные цвета:</span>
              <p className="text-slate-600">{selected.primaryColorsRu}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60">
              <span className="font-bold text-slate-700 block mb-1">Подтона и текстура:</span>
              <p className="text-slate-600">{selected.undertonesRu}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60">
              <span className="font-bold text-slate-700 block mb-1">Насыщенность:</span>
              <p className="text-slate-600">{selected.saturationRu}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60">
              <span className="font-bold text-slate-700 block mb-1">Динамика и атмосфера:</span>
              <p className="text-slate-600">{selected.atmosphereRu}</p>
            </div>
          </div>

          {/* Cultural Symbolism section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            {selected.kazakhSymbolism && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
                  <span>Символика в казахской традиции:</span>
                </span>
                <p className="text-amber-800 leading-relaxed">{selected.kazakhSymbolism}</p>
              </div>
            )}

            {selected.chineseSymbolism && (
              <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-100">
                <span className="font-bold text-rose-900 block mb-1 flex items-center gap-1.5">
                  <span>Традиция У-син (Китай):</span>
                </span>
                <p className="text-rose-800 leading-relaxed">{selected.chineseSymbolism}</p>
              </div>
            )}
          </div>

          {/* Prompt example */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 text-slate-200 text-xs font-mono">
            <span className="text-[10px] text-slate-400 block mb-1 font-sans uppercase font-bold">
              Промпт для генерации цифровой картины (Prompt):
            </span>
            <p className="select-all">{selected.promptExample}</p>
          </div>
        </div>
      </div>

      {/* Cultural Color Deep Dive Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Kazakh Tradition */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm text-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-1">
            <Globe2 className="w-4 h-4" />
            <span>Символика цветов в казахской культуре</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            В казахской традиции цвета тесно связаны с кочевым мировоззрением, степной природой и культом Неба (Тенгри).
          </p>
          <ul className="space-y-2 text-slate-700 pt-1">
            <li>
              <strong>Көк (синий / голубой)</strong> — символ неба, Тенгри, свободы, бесконечности и мира (основа флага Казахстана).
            </li>
            <li>
              <strong>Ақ (белый)</strong> — самый священный цвет: чистота («ақ жүрек»), правда, благородство и светлый путь («ақ жол»).
            </li>
            <li>
              <strong>Жасыл (зеленый)</strong> — весна, возрождение степи, юность и расцвет сил.
            </li>
            <li>
              <strong>Қызыл (красный)</strong> — огонь, жизнь, солнце, здоровье и смелость.
            </li>
            <li>
              <strong>Сары (желтый)</strong> — мудрость и свет разума, но также «сары уайым» (глубокая затаенная грусть).
            </li>
            <li>
              <strong>Қара (черный)</strong> — земля и глубина, а также символ родного почитаемого дома («қара шаңырақ»).
            </li>
          </ul>
        </div>

        {/* Chinese Wu Xing */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm text-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-1">
            <Globe2 className="w-4 h-4" />
            <span>Система У-син (Пять стихий Китая)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Цвета рассматриваются как динамические фазы движения жизненной энергии (Ци) в человеческом теле и психике.
          </p>
          <ul className="space-y-2 text-slate-700 pt-1">
            <li>
              <strong>Зелёный (Дерево / Му)</strong> — рост, пробуждение, гибкость и надежда.
            </li>
            <li>
              <strong>Красный (Огонь / Хо)</strong> — открытость сердца, радость, энергия и тепло.
            </li>
            <li>
              <strong>Жёлтый (Земля / Ту)</strong> — устойчивость, заземление и стабильность центра.
            </li>
            <li>
              <strong>Белый (Металл / Цзинь)</strong> — ясность, структура, очищение и спокойствие.
            </li>
            <li>
              <strong>Чёрный / Тёмно-синий (Вода / Шуй)</strong> — глубина подсознания, мудрость и преодоление страха.
            </li>
          </ul>
        </div>
      </div>

      {/* Psychology Literature Bookshelf */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Теоретическая опора платформы</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Книги по эмоциональному интеллекту и психологии подростков
        </h3>
        <p className="text-xs text-slate-500 mb-5 max-w-2xl">
          Алгоритмы Sukaire опираются на труды ведущих мировых исследователей эмоций, а также на литературу для школьников и студентов (в духе Popcorn Books).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PSYCHOLOGY_RESOURCES.map(book => (
            <div
              key={book.title}
              className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 hover:border-purple-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-purple-100 text-purple-800 inline-block mb-2">
                  {book.badge}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {book.title}
                </h4>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  {book.author}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {book.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Важное примечание:</strong> Sukaire не ставит медицинских диагнозов и не является заменой клинической психотерапии. Это инструмент эмоциональной гигиены, самопознания и бережного заземления в дни высоких учебных и личных нагрузок.
          </span>
        </div>
      </div>
    </div>
  );
};
