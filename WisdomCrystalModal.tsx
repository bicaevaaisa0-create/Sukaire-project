import React, { useState } from 'react';
import { X, BookOpen, Sparkles, RefreshCw } from 'lucide-react';

interface WisdomCrystalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WISDOM_QUOTES = [
  {
    quote: 'Эмоции не делают вас слабыми. Они показывают, где вы неравнодушны. Психическое здоровье — это не постоянное счастье, а способность переживать адекватные чувства в ответ на то, что с вами происходит.',
    source: 'Лиза Дамур — «Эмоциональная жизнь подростков»',
    theme: 'Принятие чувств'
  },
  {
    quote: 'Уязвимость — это не победа и не поражение. Это смелость появиться и быть увиденным, когда мы не можем контролировать результат.',
    source: 'Брене Браун — «Атлас сердца»',
    theme: 'Смелость быть собой'
  },
  {
    quote: 'Осознание своих эмоций в момент их зарождения — это 80% успеха в управлении стрессом. Назовите эмоцию словами, и ее физиологическая хватка ослабнет.',
    source: 'Дэниэл Гоулман — «Эмоциональный интеллект»',
    theme: 'Саморегуляция'
  },
  {
    quote: 'Трудности в учебе не говорят о вашем потолке способностей. Ошибки — это всего лишь нейронный сигнал о том, что мозг прямо сейчас строит новые связи.',
    source: 'Кэрол Дуэк — «Гибкое сознание»',
    theme: 'Рост и развитие'
  },
  {
    quote: 'В колесе эмоций нет «плохих» цветов. Каждая темная краска — это сигнал о потребности: грусть зовет к заботе, страх — к безопасности, гнев — к защите личных границ.',
    source: 'Роберт Плутчик — «Теория эмоций»',
    theme: 'Матрица логики'
  },
  {
    quote: 'Вы не должны доказывать свою ценность идеальными оценками и бесконечной продуктивностью. Ваша ценность безусловна с самого рождения.',
    source: 'Лори Готтлиб — «Вы хотите поговорить об этом?»',
    theme: 'Самоценность'
  }
];

export const WisdomCrystalModal: React.FC<WisdomCrystalModalProps> = ({ isOpen, onClose }) => {
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const current = WISDOM_QUOTES[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % WISDOM_QUOTES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 shadow-2xl text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-700">
            Кристалл Мудрости • Библиотека мыслей
          </span>
        </div>

        <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/70 border border-purple-100/70 relative">
          <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-200/60 text-purple-800 text-[11px] font-semibold mb-3">
            {current.theme}
          </div>
          <p className="text-sm sm:text-base italic text-slate-800 leading-relaxed font-serif">
            «{current.quote}»
          </p>
          <p className="text-xs font-medium text-purple-900 mt-4 text-right">
            — {current.source}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Мысль {index + 1} из {WISDOM_QUOTES.length}</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Еще мысль</span>
          </button>
        </div>
      </div>
    </div>
  );
};
