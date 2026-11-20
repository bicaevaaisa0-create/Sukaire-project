import { EmotionKey } from '../types';

/* ================= КОЛЕСО ПЛУТЧИКА ================= */

export interface PlutchikPetal {
  id: string;
  ru: string;
  en: string;
  angle: number;            // позиция на колесе (градусы)
  hex: string;              // базовый (средний) цвет
  mild: { ru: string; hex: string };
  base: { ru: string; hex: string };
  intense: { ru: string; hex: string };
  opposite: string;         // id противоположной эмоции
  sukaire: EmotionKey;      // связь с матрицей Sukaire
  kw: string[];
}

export const PLUTCHIK: PlutchikPetal[] = [
  {
    id: 'joy', ru: 'Радость', en: 'Joy', angle: 0, hex: '#FBBF24',
    mild: { ru: 'Безмятежность', hex: '#FEF3C7' },
    base: { ru: 'Радость', hex: '#FBBF24' },
    intense: { ru: 'Экстаз', hex: '#F59E0B' },
    opposite: 'sadness', sukaire: 'joy',
    kw: ['радост', 'счастлив', 'весел', 'ликую']
  },
  {
    id: 'trust', ru: 'Доверие', en: 'Trust', angle: 45, hex: '#86EFAC',
    mild: { ru: 'Принятие', hex: '#DCFCE7' },
    base: { ru: 'Доверие', hex: '#86EFAC' },
    intense: { ru: 'Восхищение', hex: '#22C55E' },
    opposite: 'disgust', sukaire: 'hope',
    kw: ['доверя', 'принял', 'верю']
  },
  {
    id: 'fear', ru: 'Страх', en: 'Fear', angle: 90, hex: '#A7F3D0',
    mild: { ru: 'Опасение', hex: '#ECFDF5' },
    base: { ru: 'Страх', hex: '#A7F3D0' },
    intense: { ru: 'Ужас', hex: '#10B981' },
    opposite: 'anger', sukaire: 'anxiety',
    kw: ['страх', 'боюсь', 'ужас', 'паник']
  },
  {
    id: 'surprise', ru: 'Удивление', en: 'Surprise', angle: 135, hex: '#7DD3FC',
    mild: { ru: 'Отвлечение', hex: '#E0F2FE' },
    base: { ru: 'Удивление', hex: '#7DD3FC' },
    intense: { ru: 'Изумление', hex: '#0EA5E9' },
    opposite: 'anticipation', sukaire: 'reboot',
    kw: ['удивил', 'неожидан', 'изумл']
  },
  {
    id: 'sadness', ru: 'Печаль', en: 'Sadness', angle: 180, hex: '#93C5FD',
    mild: { ru: 'Задумчивость', hex: '#DBEAFE' },
    base: { ru: 'Печаль', hex: '#93C5FD' },
    intense: { ru: 'Горе', hex: '#3B82F6' },
    opposite: 'joy', sukaire: 'sadness',
    kw: ['груст', 'печал', 'горе', 'тоск']
  },
  {
    id: 'disgust', ru: 'Отвращение', en: 'Disgust', angle: 225, hex: '#C4B5FD',
    mild: { ru: 'Скука', hex: '#EDE9FE' },
    base: { ru: 'Отвращение', hex: '#C4B5FD' },
    intense: { ru: 'Омерзение', hex: '#8B5CF6' },
    opposite: 'trust', sukaire: 'burnout',
    kw: ['отвращ', 'противно', 'скучно', 'мерзко']
  },
  {
    id: 'anger', ru: 'Гнев', en: 'Anger', angle: 270, hex: '#FCA5A5',
    mild: { ru: 'Досада', hex: '#FEE2E2' },
    base: { ru: 'Гнев', hex: '#FCA5A5' },
    intense: { ru: 'Ярость', hex: '#EF4444' },
    opposite: 'fear', sukaire: 'resolve',
    kw: ['злость', 'гнев', 'ярость', 'бесит', 'раздража']
  },
  {
    id: 'anticipation', ru: 'Ожидание', en: 'Anticipation', angle: 315, hex: '#FDBA74',
    mild: { ru: 'Интерес', hex: '#FFEDD5' },
    base: { ru: 'Ожидание', hex: '#FDBA74' },
    intense: { ru: 'Настороженность', hex: '#F97316' },
    opposite: 'surprise', sukaire: 'hope',
    kw: ['жду', 'предвкуш', 'интерес', 'насторож']
  }
];

/** Диады Плутчика — эмоции второго порядка */
export const PLUTCHIK_DYADS: { a: string; b: string; ru: string; note: string }[] = [
  { a: 'joy', b: 'trust', ru: 'Любовь', note: 'Радость + Доверие' },
  { a: 'trust', b: 'fear', ru: 'Покорность', note: 'Доверие + Страх' },
  { a: 'fear', b: 'surprise', ru: 'Благоговейный трепет', note: 'Страх + Удивление' },
  { a: 'surprise', b: 'sadness', ru: 'Неодобрение', note: 'Удивление + Печаль' },
  { a: 'sadness', b: 'disgust', ru: 'Раскаяние', note: 'Печаль + Отвращение' },
  { a: 'disgust', b: 'anger', ru: 'Презрение', note: 'Отвращение + Гнев' },
  { a: 'anger', b: 'anticipation', ru: 'Агрессия', note: 'Гнев + Ожидание' },
  { a: 'anticipation', b: 'joy', ru: 'Оптимизм', note: 'Ожидание + Радость' }
];

export function detectPlutchik(text: string): { petal: PlutchikPetal; score: number }[] {
  const t = text.toLowerCase();
  return PLUTCHIK
    .map(p => ({ petal: p, score: p.kw.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/* ================= У-СИН (КИТАЙ) ================= */

export interface WuXingElement {
  id: string;
  ru: string;
  cn: string;
  hex: string;
  organ: string;
  emotionPos: string;
  emotionNeg: string;
  season: string;
  balance: string;
  sukaire: EmotionKey;
}

export const WU_XING: WuXingElement[] = [
  {
    id: 'wood', ru: 'Дерево', cn: '木 (Му)', hex: '#4ADE80',
    organ: 'Печень', emotionPos: 'Надежда и рост', emotionNeg: 'Гнев, раздражение',
    season: 'Весна', balance: 'Движение и растяжка рассеивают застой гнева; зелёный возвращает гибкость.',
    sukaire: 'hope'
  },
  {
    id: 'fire', ru: 'Огонь', cn: '火 (Хо)', hex: '#F87171',
    organ: 'Сердце', emotionPos: 'Радость и связь', emotionNeg: 'Тревожное возбуждение',
    season: 'Лето', balance: 'Замедление ритма и тёплый контакт возвращают сердцу ровный огонь.',
    sukaire: 'joy'
  },
  {
    id: 'earth', ru: 'Земля', cn: '土 (Ту)', hex: '#FCD34D',
    organ: 'Селезёнка', emotionPos: 'Устойчивость и забота', emotionNeg: 'Навязчивые раздумья',
    season: 'Межсезонье', balance: 'Тёплая еда, режим и заземление останавливают мысленную жвачку.',
    sukaire: 'calm_hope'
  },
  {
    id: 'metal', ru: 'Металл', cn: '金 (Цзинь)', hex: '#E2E8F0',
    organ: 'Лёгкие', emotionPos: 'Ясность и чистота', emotionNeg: 'Печаль, скорбь',
    season: 'Осень', balance: 'Глубокое дыхание — прямой путь к печали; выдох длиннее вдоха.',
    sukaire: 'calm'
  },
  {
    id: 'water', ru: 'Вода', cn: '水 (Шуй)', hex: '#60A5FA',
    organ: 'Почки', emotionPos: 'Мудрость и глубина', emotionNeg: 'Страх',
    season: 'Зима', balance: 'Сон, тишина и тепло восстанавливают резерв, из которого рождается смелость.',
    sukaire: 'sadness'
  }
];

/* ================= ЯПОНСКИЕ КОНЦЕПЦИИ ================= */

export interface JapaneseConcept {
  id: string;
  jp: string;
  romaji: string;
  ru: string;
  hex: string;
  desc: string;
  practice: string;
  sukaire: EmotionKey;
}

export const JAPANESE_CONCEPTS: JapaneseConcept[] = [
  {
    id: 'mono_no_aware', jp: '物の哀れ', romaji: 'Mono no aware', ru: 'Печальное очарование вещей', hex: '#B49BC9',
    desc: 'Нежная грусть от осознания, что всё прекрасное проходит — и именно поэтому оно ценно.',
    practice: 'Посмотрите на что-то мимолётное (закат, дождь) и скажите про себя: «это тоже пройдёт, и это красиво».',
    sukaire: 'sadness'
  },
  {
    id: 'natsukashii', jp: '懐かしい', romaji: 'Natsukashii', ru: 'Тёплая ностальгия', hex: '#FDBA74',
    desc: 'Не тоскливая, а благодарная память о прошлом, которое согревает сейчас.',
    practice: 'Вспомните один тёплый момент из детства и удержите его в теле 30 секунд.',
    sukaire: 'reboot'
  },
  {
    id: 'wabi_sabi', jp: '侘寂', romaji: 'Wabi-sabi', ru: 'Красота несовершенства', hex: '#A8A29E',
    desc: 'Ценность трещин, асимметрии и следов времени — антидот перфекционизму.',
    practice: 'Найдите в своей работе одну «неидеальность» и оставьте её намеренно.',
    sukaire: 'uncertainty'
  },
  {
    id: 'yugen', jp: '幽玄', romaji: 'Yūgen', ru: 'Глубинная таинственность', hex: '#818CF8',
    desc: 'Чувство огромного и непостижимого, которое невозможно выразить словами.',
    practice: 'Посмотрите на ночное небо 2 минуты, не пытаясь ничего объяснить.',
    sukaire: 'calm'
  },
  {
    id: 'shinrin_yoku', jp: '森林浴', romaji: 'Shinrin-yoku', ru: 'Лесное купание', hex: '#4ADE80',
    desc: 'Терапевтическое погружение в атмосферу леса — снижает кортизол и давление.',
    practice: 'Медленная прогулка среди деревьев без телефона, вниманием на запахи и звуки.',
    sukaire: 'calm_hope'
  },
  {
    id: 'ikigai', jp: '生き甲斐', romaji: 'Ikigai', ru: 'Смысл вставать утром', hex: '#FBBF24',
    desc: 'Маленькая ежедневная причина жить, а не великая миссия.',
    practice: 'Назовите одну вещь на завтра, ради которой стоит проснуться.',
    sukaire: 'hope'
  },
  {
    id: 'gaman', jp: '我慢', romaji: 'Gaman', ru: 'Достойное терпение', hex: '#94A3B8',
    desc: 'Стойкость в невыносимом с сохранением достоинства — но не запрет на чувства.',
    practice: 'Признайте: «мне тяжело, и я всё равно держусь» — вслух.',
    sukaire: 'resolve'
  },
  {
    id: 'kintsugi', jp: '金継ぎ', romaji: 'Kintsugi', ru: 'Золотая починка', hex: '#F2D08A',
    desc: 'Разбитое склеивают золотом: шрам становится самой ценной частью истории.',
    practice: 'Назовите одну трудность, которая сделала вас внимательнее к себе.',
    sukaire: 'reboot'
  },
  {
    id: 'amae', jp: '甘え', romaji: 'Amae', ru: 'Право опереться', hex: '#F9A8D4',
    desc: 'Разрешение зависеть от близкого и принимать заботу без стыда.',
    practice: 'Попросите о маленькой помощи того, кому доверяете.',
    sukaire: 'love'
  }
];
