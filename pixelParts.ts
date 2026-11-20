/**
 * Sukaire Pixel Character System
 * Grid 24 x 32. Every part is a list of pixel rects: [x, y, w, h, colorRole]
 * Combinations: 12 hair x 6 eyes x 10 outfits x 7 cloaks x 12 accessories x colors
 */

export type ColorRole =
  | 'skin' | 'skinD' | 'skinL'
  | 'hair' | 'hairD' | 'hairL'
  | 'out1' | 'out1D' | 'out1L'
  | 'out2' | 'out2D'
  | 'cloak' | 'cloakD' | 'cloakL'
  | 'acc' | 'accD'
  | 'white' | 'dark' | 'blush' | 'gold' | 'leather' | 'leatherD';

export type Rect = [number, number, number, number, ColorRole];

export interface ResolvedRect {
  x: number; y: number; w: number; h: number; c: string;
}

/* ------------------------------------------------------------------ */
/* Color helpers                                                       */
/* ------------------------------------------------------------------ */

function clamp(v: number) { return Math.max(0, Math.min(255, Math.round(v))); }

export function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const f = (v: number) => clamp(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount));
  return `#${f(r).toString(16).padStart(2, '0')}${f(g).toString(16).padStart(2, '0')}${f(b).toString(16).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Option lists (palettes)                                             */
/* ------------------------------------------------------------------ */

export const SKIN_TONES = [
  { name: 'Фарфор', hex: '#FBE0CE' },
  { name: 'Светлый', hex: '#F3CBA9' },
  { name: 'Персик', hex: '#E8B48C' },
  { name: 'Загар', hex: '#C98E64' },
  { name: 'Тёплый орех', hex: '#A66B43' },
  { name: 'Тёмный янтарь', hex: '#7A4A2B' },
  { name: 'Эбен', hex: '#563123' },
  { name: 'Лунный дух', hex: '#DCE6F2' },
  { name: 'Шалфейный дух', hex: '#C9E4D2' },
  { name: 'Лавандовый дух', hex: '#E0D4F5' }
];

export const HAIR_COLORS = [
  { name: 'Смоль', hex: '#2B2536' },
  { name: 'Тёмный шоколад', hex: '#4A2F23' },
  { name: 'Каштан', hex: '#7A4A2E' },
  { name: 'Карамель', hex: '#B07A45' },
  { name: 'Пшеница', hex: '#E3C07B' },
  { name: 'Платина', hex: '#EDE7DC' },
  { name: 'Пепел', hex: '#9AA3AE' },
  { name: 'Клубника', hex: '#D96C5F' },
  { name: 'Розовый кварц', hex: '#F0A6C4' },
  { name: 'Лаванда', hex: '#B9A2E8' },
  { name: 'Мята', hex: '#8FD9C0' },
  { name: 'Небесный', hex: '#8FBCE8' },
  { name: 'Малина', hex: '#B0537E' },
  { name: 'Полночь', hex: '#3C4A78' }
];

export const CLOTH_COLORS = [
  { name: 'Молоко', hex: '#F5F0E6' },
  { name: 'Слоновая кость', hex: '#E8DCC4' },
  { name: 'Шалфей', hex: '#A8C6A1' },
  { name: 'Лесной', hex: '#4F7A55' },
  { name: 'Мята', hex: '#B7E4CF' },
  { name: 'Небесный', hex: '#A8CBE8' },
  { name: 'Индиго', hex: '#4C5C96' },
  { name: 'Полночь', hex: '#2E3350' },
  { name: 'Лаванда', hex: '#C3B2E8' },
  { name: 'Слива', hex: '#6B4C7A' },
  { name: 'Розовый кварц', hex: '#F2BBD0' },
  { name: 'Малина', hex: '#B84E6E' },
  { name: 'Коралл', hex: '#F09B7E' },
  { name: 'Янтарь', hex: '#E0A244' },
  { name: 'Золото', hex: '#F2D08A' },
  { name: 'Терракота', hex: '#B05E43' },
  { name: 'Какао', hex: '#6E4F3A' },
  { name: 'Графит', hex: '#3F444F' },
  { name: 'Туман', hex: '#C9CFD6' },
  { name: 'Уголь', hex: '#22242E' }
];

export const AURA_COLORS = [
  { name: 'Шалфейный', hex: '#86EFAC' },
  { name: 'Небесный', hex: '#93C5FD' },
  { name: 'Лавандовый', hex: '#C4B5FD' },
  { name: 'Розовый кварц', hex: '#F472B6' },
  { name: 'Золотистый', hex: '#FDE047' },
  { name: 'Коралловый', hex: '#FB7185' },
  { name: 'Бирюзовый', hex: '#5EEAD4' },
  { name: 'Серебристый', hex: '#E2E8F0' }
];

/* ------------------------------------------------------------------ */
/* Base body                                                           */
/* ------------------------------------------------------------------ */

const BODY_LEGS: Rect[] = [
  [9, 26, 2, 4, 'skin'], [13, 26, 2, 4, 'skin'],
  [10, 26, 1, 4, 'skinD'], [14, 26, 1, 4, 'skinD']
];

const BODY_SHOES: Rect[] = [
  [8, 30, 3, 2, 'leather'], [13, 30, 3, 2, 'leather'],
  [8, 31, 3, 1, 'leatherD'], [13, 31, 3, 1, 'leatherD']
];

const BODY_ARMS: Rect[] = [
  [7, 17, 2, 7, 'skin'], [15, 17, 2, 7, 'skin'],
  [8, 17, 1, 7, 'skinD'], [16, 17, 1, 7, 'skinD'],
  [7, 24, 2, 2, 'skinL'], [15, 24, 2, 2, 'skinL']
];

const BODY_TORSO: Rect[] = [[9, 16, 6, 10, 'skin']];

const BODY_HEAD: Rect[] = [
  [8, 6, 8, 9, 'skin'],
  [15, 6, 1, 9, 'skinD'],
  [8, 6, 8, 1, 'skinL'],
  [7, 10, 1, 2, 'skin'], [16, 10, 1, 2, 'skin'],
  [11, 15, 2, 1, 'skinD']
];

/* ------------------------------------------------------------------ */
/* Eyes / faces                                                        */
/* ------------------------------------------------------------------ */

export const EYE_STYLES: { id: string; name: string; rects: Rect[] }[] = [
  {
    id: 'round', name: 'Круглые',
    rects: [
      [10, 10, 2, 3, 'dark'], [13, 10, 2, 3, 'dark'],
      [10, 10, 1, 1, 'white'], [13, 10, 1, 1, 'white'],
      [9, 13, 1, 1, 'blush'], [14, 13, 1, 1, 'blush'],
      [12, 13, 1, 1, 'skinD']
    ]
  },
  {
    id: 'calm', name: 'Спокойные',
    rects: [
      [10, 11, 2, 1, 'dark'], [13, 11, 2, 1, 'dark'],
      [9, 12, 1, 1, 'blush'], [14, 12, 1, 1, 'blush'],
      [12, 13, 1, 1, 'skinD']
    ]
  },
  {
    id: 'sparkle', name: 'Искрящиеся',
    rects: [
      [10, 10, 2, 3, 'dark'], [13, 10, 2, 3, 'dark'],
      [10, 10, 1, 1, 'white'], [13, 10, 1, 1, 'white'],
      [11, 12, 1, 1, 'white'], [14, 12, 1, 1, 'white'],
      [9, 13, 1, 1, 'blush'], [14, 13, 1, 1, 'blush'],
      [11, 13, 2, 1, 'skinD']
    ]
  },
  {
    id: 'sleepy', name: 'Сонные',
    rects: [
      [10, 10, 2, 1, 'dark'], [13, 10, 2, 1, 'dark'],
      [10, 11, 2, 1, 'skinD'], [13, 11, 2, 1, 'skinD'],
      [9, 12, 1, 1, 'blush'], [14, 12, 1, 1, 'blush'],
      [12, 13, 1, 1, 'skinD']
    ]
  },
  {
    id: 'wink', name: 'Подмигивание',
    rects: [
      [10, 10, 2, 3, 'dark'], [10, 10, 1, 1, 'white'],
      [13, 11, 2, 1, 'dark'],
      [9, 13, 1, 1, 'blush'], [14, 13, 1, 1, 'blush'],
      [11, 13, 2, 1, 'skinD']
    ]
  },
  {
    id: 'starry', name: 'Звёздные',
    rects: [
      [10, 10, 2, 3, 'gold'], [13, 10, 2, 3, 'gold'],
      [10, 11, 1, 1, 'white'], [14, 11, 1, 1, 'white'],
      [9, 13, 1, 1, 'blush'], [14, 13, 1, 1, 'blush'],
      [12, 13, 1, 1, 'skinD']
    ]
  },
  {
    id: 'shy', name: 'Стеснительные',
    rects: [
      [10, 11, 2, 2, 'dark'], [13, 11, 2, 2, 'dark'],
      [9, 12, 2, 1, 'blush'], [14, 12, 2, 1, 'blush'],
      [12, 14, 1, 1, 'skinD']
    ]
  },
  {
    id: 'brave', name: 'Решительные',
    rects: [
      [10, 9, 2, 1, 'hairD'], [13, 9, 2, 1, 'hairD'],
      [10, 10, 2, 3, 'dark'], [13, 10, 2, 3, 'dark'],
      [11, 10, 1, 1, 'white'], [14, 10, 1, 1, 'white'],
      [11, 13, 2, 1, 'skinD']
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Hair styles                                                         */
/* ------------------------------------------------------------------ */

interface HairStyle {
  id: string; name: string;
  back?: Rect[];
  front: Rect[];
  fringe: Rect[]; // shown even under hoods/hats
}

const CAP: Rect[] = [
  [7, 4, 10, 3, 'hair'], [7, 4, 10, 1, 'hairL'],
  [7, 7, 1, 4, 'hair'], [16, 7, 1, 4, 'hair']
];
const FRINGE: Rect[] = [[8, 7, 8, 1, 'hair'], [8, 8, 3, 1, 'hair'], [15, 8, 1, 1, 'hairD']];

export const HAIR_STYLES: HairStyle[] = [
  {
    id: 'short', name: 'Короткие',
    front: [...CAP, [7, 11, 1, 1, 'hairD'], [16, 11, 1, 1, 'hairD']],
    fringe: FRINGE
  },
  {
    id: 'bob', name: 'Каре',
    back: [[6, 6, 12, 9, 'hairD']],
    front: [...CAP, [6, 7, 2, 7, 'hair'], [16, 7, 2, 7, 'hair'], [6, 13, 3, 2, 'hair'], [15, 13, 3, 2, 'hair']],
    fringe: FRINGE
  },
  {
    id: 'long', name: 'Длинные',
    back: [[6, 6, 12, 16, 'hairD'], [7, 21, 10, 2, 'hairD']],
    front: [...CAP, [6, 7, 2, 14, 'hair'], [16, 7, 2, 14, 'hair'], [6, 20, 2, 2, 'hairD'], [16, 20, 2, 2, 'hairD']],
    fringe: FRINGE
  },
  {
    id: 'hime', name: 'Химэ',
    back: [[5, 6, 14, 18, 'hairD']],
    front: [[7, 3, 10, 4, 'hair'], [7, 3, 10, 1, 'hairL'], [5, 7, 3, 16, 'hair'], [16, 7, 3, 16, 'hair'], [5, 22, 3, 2, 'hairD'], [16, 22, 3, 2, 'hairD']],
    fringe: [[8, 7, 8, 2, 'hair'], [8, 9, 2, 1, 'hairD'], [14, 9, 2, 1, 'hairD']]
  },
  {
    id: 'twintails', name: 'Два хвостика',
    back: [[6, 6, 12, 6, 'hairD']],
    front: [...CAP, [4, 9, 3, 10, 'hair'], [17, 9, 3, 10, 'hair'], [4, 18, 3, 2, 'hairD'], [17, 18, 3, 2, 'hairD'], [6, 8, 2, 2, 'acc'], [16, 8, 2, 2, 'acc']],
    fringe: FRINGE
  },
  {
    id: 'ponytail', name: 'Хвост',
    back: [[16, 7, 4, 13, 'hairD']],
    front: [...CAP, [17, 8, 3, 11, 'hair'], [17, 18, 3, 2, 'hairD'], [16, 7, 2, 2, 'acc']],
    fringe: FRINGE
  },
  {
    id: 'buns', name: 'Пучки',
    front: [...CAP, [4, 4, 4, 4, 'hair'], [16, 4, 4, 4, 'hair'], [4, 4, 4, 1, 'hairL'], [16, 4, 4, 1, 'hairL']],
    fringe: FRINGE
  },
  {
    id: 'curly', name: 'Кудри',
    back: [[5, 4, 14, 12, 'hairD']],
    front: [
      [6, 2, 12, 6, 'hair'], [6, 2, 12, 1, 'hairL'],
      [4, 6, 3, 8, 'hair'], [17, 6, 3, 8, 'hair'],
      [5, 13, 3, 2, 'hairD'], [16, 13, 3, 2, 'hairD'],
      [7, 1, 3, 1, 'hair'], [14, 1, 3, 1, 'hair']
    ],
    fringe: [[8, 7, 8, 1, 'hair'], [8, 8, 2, 1, 'hair'], [14, 8, 2, 1, 'hair']]
  },
  {
    id: 'spiky', name: 'Колючие',
    front: [
      [7, 5, 10, 2, 'hair'], [7, 5, 10, 1, 'hairL'],
      [7, 3, 2, 2, 'hair'], [10, 2, 3, 3, 'hair'], [14, 3, 2, 2, 'hair'],
      [7, 7, 1, 3, 'hair'], [16, 7, 1, 3, 'hair']
    ],
    fringe: [[8, 7, 8, 1, 'hair'], [9, 8, 2, 1, 'hairD']]
  },
  {
    id: 'braids', name: 'Косички',
    back: [[6, 6, 12, 8, 'hairD']],
    front: [
      ...CAP,
      [5, 10, 2, 3, 'hair'], [5, 13, 2, 3, 'hairD'], [5, 16, 2, 3, 'hair'], [5, 19, 2, 2, 'acc'],
      [17, 10, 2, 3, 'hair'], [17, 13, 2, 3, 'hairD'], [17, 16, 2, 3, 'hair'], [17, 19, 2, 2, 'acc']
    ],
    fringe: FRINGE
  },
  {
    id: 'wolf', name: 'Волчий срез',
    back: [[6, 6, 12, 12, 'hairD']],
    front: [
      ...CAP,
      [5, 7, 3, 9, 'hair'], [16, 7, 3, 9, 'hair'],
      [4, 14, 3, 3, 'hairD'], [17, 14, 3, 3, 'hairD']
    ],
    fringe: [[8, 7, 8, 1, 'hair'], [8, 8, 2, 2, 'hair'], [14, 8, 2, 2, 'hair']]
  },
  {
    id: 'shaved', name: 'Очень короткие',
    front: [[7, 5, 10, 2, 'hair'], [7, 5, 10, 1, 'hairL'], [7, 7, 1, 2, 'hairD'], [16, 7, 1, 2, 'hairD']],
    fringe: [[8, 7, 8, 1, 'hairD']]
  },
  {
    id: 'messy', name: 'Растрёпанные',
    back: [[6, 6, 12, 5, 'hairD']],
    front: [
      [7, 4, 10, 3, 'hair'], [7, 4, 10, 1, 'hairL'],
      [6, 3, 2, 2, 'hair'], [9, 2, 3, 2, 'hair'], [14, 3, 3, 2, 'hair'],
      [6, 7, 2, 5, 'hair'], [16, 7, 2, 5, 'hair'],
      [6, 11, 2, 1, 'hairD'], [16, 11, 2, 1, 'hairD']
    ],
    fringe: [[8, 7, 5, 1, 'hair'], [13, 7, 3, 2, 'hair'], [9, 8, 2, 1, 'hairD']]
  },
  {
    id: 'sidecut', name: 'Асимметрия',
    front: [
      [7, 4, 10, 3, 'hair'], [7, 4, 10, 1, 'hairL'],
      [6, 6, 3, 9, 'hair'], [16, 7, 1, 3, 'hairD'],
      [6, 14, 3, 2, 'hairD']
    ],
    fringe: [[8, 7, 6, 2, 'hair'], [14, 7, 2, 1, 'hairD']]
  },
  {
    id: 'topknot', name: 'Пучок самурая',
    front: [
      [7, 5, 10, 2, 'hair'], [7, 5, 10, 1, 'hairL'],
      [10, 1, 4, 4, 'hair'], [10, 1, 4, 1, 'hairL'], [9, 4, 6, 1, 'acc'],
      [7, 7, 1, 4, 'hair'], [16, 7, 1, 4, 'hair']
    ],
    fringe: [[8, 7, 8, 1, 'hair'], [8, 8, 2, 2, 'hair']]
  }
];

/* ------------------------------------------------------------------ */
/* Outfits                                                             */
/* ------------------------------------------------------------------ */

interface Outfit {
  id: string; name: string;
  body: Rect[];
  sleeves: Rect[];
  legs: Rect[];
}

const SLEEVE_LONG: Rect[] = [[7, 16, 2, 8, 'out1'], [15, 16, 2, 8, 'out1'], [8, 16, 1, 8, 'out1D'], [16, 16, 1, 8, 'out1D']];
const SLEEVE_SHORT: Rect[] = [[7, 16, 2, 4, 'out1'], [15, 16, 2, 4, 'out1'], [8, 16, 1, 4, 'out1D'], [16, 16, 1, 4, 'out1D']];

export const OUTFITS: Outfit[] = [
  {
    id: 'tunic', name: 'Туника странника',
    body: [
      [9, 16, 6, 10, 'out1'], [14, 16, 1, 10, 'out1D'], [9, 16, 6, 1, 'out1L'],
      [8, 24, 8, 5, 'out1'], [8, 28, 8, 1, 'out1D'],
      [9, 21, 6, 1, 'leather'], [11, 21, 2, 1, 'gold']
    ],
    sleeves: SLEEVE_LONG,
    legs: []
  },
  {
    id: 'sundress', name: 'Летний сарафан',
    body: [
      [9, 16, 6, 5, 'out2'], [14, 16, 1, 5, 'out2'],
      [10, 15, 1, 2, 'out2'], [13, 15, 1, 2, 'out2'],
      [8, 21, 8, 6, 'out1'], [7, 26, 10, 2, 'out1'], [7, 27, 10, 1, 'out1D'],
      [9, 20, 6, 1, 'out1L']
    ],
    sleeves: [],
    legs: []
  },
  {
    id: 'hoodie', name: 'Худи',
    body: [
      [9, 16, 6, 10, 'out1'], [14, 16, 1, 10, 'out1D'],
      [8, 14, 8, 3, 'out1'], [8, 14, 8, 1, 'out1L'],
      [10, 21, 4, 3, 'out2'],
      [11, 17, 1, 3, 'white'], [13, 17, 1, 3, 'white']
    ],
    sleeves: SLEEVE_LONG,
    legs: [[9, 26, 2, 4, 'out2'], [13, 26, 2, 4, 'out2'], [10, 26, 1, 4, 'out2D'], [14, 26, 1, 4, 'out2D']]
  },
  {
    id: 'robe', name: 'Мантия мага',
    body: [
      [9, 16, 6, 8, 'out1'], [14, 16, 1, 8, 'out1D'],
      [8, 23, 8, 7, 'out1'], [7, 28, 10, 2, 'out1'], [7, 29, 10, 1, 'out1D'],
      [9, 21, 6, 2, 'out2'], [11, 16, 2, 5, 'out2'],
      [11, 17, 2, 1, 'gold']
    ],
    sleeves: [[6, 16, 3, 9, 'out1'], [15, 16, 3, 9, 'out1'], [8, 16, 1, 9, 'out1D'], [17, 16, 1, 9, 'out1D']],
    legs: []
  },
  {
    id: 'uniform', name: 'Школьная форма',
    body: [
      [9, 16, 6, 10, 'out1'], [14, 16, 1, 10, 'out1D'],
      [11, 16, 2, 6, 'white'],
      [11, 16, 2, 1, 'out2'], [11, 17, 2, 4, 'out2'],
      [9, 25, 6, 1, 'out1D']
    ],
    sleeves: SLEEVE_LONG,
    legs: [[8, 26, 8, 3, 'out2'], [8, 28, 8, 1, 'out2D'], [9, 29, 2, 1, 'dark'], [13, 29, 2, 1, 'dark']]
  },
  {
    id: 'overalls', name: 'Комбинезон',
    body: [
      [9, 16, 6, 4, 'out2'], [14, 16, 1, 4, 'out2D'],
      [9, 20, 6, 6, 'out1'], [14, 20, 1, 6, 'out1D'],
      [10, 16, 1, 4, 'out1'], [13, 16, 1, 4, 'out1'],
      [10, 21, 1, 1, 'gold'], [13, 21, 1, 1, 'gold']
    ],
    sleeves: SLEEVE_SHORT,
    legs: [[9, 26, 2, 4, 'out1'], [13, 26, 2, 4, 'out1'], [10, 26, 1, 4, 'out1D'], [14, 26, 1, 4, 'out1D']]
  },
  {
    id: 'sweater', name: 'Вязаный свитер',
    body: [
      [9, 16, 6, 11, 'out1'], [14, 16, 1, 11, 'out1D'],
      [9, 18, 6, 1, 'out2'], [9, 21, 6, 1, 'out2'], [9, 24, 6, 1, 'out2'],
      [9, 16, 6, 1, 'out1L']
    ],
    sleeves: SLEEVE_LONG,
    legs: [[9, 27, 2, 3, 'out2'], [13, 27, 2, 3, 'out2'], [10, 27, 1, 3, 'out2D'], [14, 27, 1, 3, 'out2D']]
  },
  {
    id: 'kimono', name: 'Кимоно',
    body: [
      [9, 16, 6, 10, 'out1'], [14, 16, 1, 10, 'out1D'],
      [8, 24, 8, 6, 'out1'], [8, 29, 8, 1, 'out1D'],
      [11, 16, 1, 3, 'white'], [12, 17, 1, 3, 'white'], [12, 19, 2, 2, 'white'],
      [9, 21, 6, 2, 'out2'], [11, 21, 2, 2, 'gold']
    ],
    sleeves: [[6, 16, 3, 10, 'out1'], [15, 16, 3, 10, 'out1'], [8, 16, 1, 10, 'out1D'], [17, 16, 1, 10, 'out1D']],
    legs: []
  },
  {
    id: 'jacket', name: 'Куртка',
    body: [
      [9, 16, 6, 10, 'out1'], [14, 16, 1, 10, 'out1D'],
      [11, 16, 2, 10, 'white'],
      [9, 16, 2, 2, 'out2'], [13, 16, 2, 2, 'out2'],
      [9, 22, 6, 1, 'out2']
    ],
    sleeves: SLEEVE_LONG,
    legs: [[9, 26, 2, 4, 'out2'], [13, 26, 2, 4, 'out2'], [10, 26, 1, 4, 'out2D'], [14, 26, 1, 4, 'out2D']]
  },
  {
    id: 'shepherd', name: 'Степной чапан',
    body: [
      [9, 16, 6, 12, 'out1'], [14, 16, 1, 12, 'out1D'],
      [8, 27, 8, 3, 'out1'], [8, 29, 8, 1, 'out1D'],
      [11, 16, 2, 12, 'out2'],
      [9, 22, 6, 2, 'leather'], [11, 22, 2, 2, 'gold'],
      [9, 16, 6, 1, 'gold']
    ],
    sleeves: SLEEVE_LONG,
    legs: []
  },
  {
    id: 'stargazer', name: 'Костюм звездочёта',
    body: [
      [9, 16, 6, 11, 'out1'], [14, 16, 1, 11, 'out1D'],
      [8, 26, 8, 4, 'out1'], [8, 29, 8, 1, 'out1D'],
      [10, 18, 1, 1, 'gold'], [13, 20, 1, 1, 'gold'], [11, 23, 1, 1, 'gold'], [14, 25, 1, 1, 'gold'],
      [9, 16, 6, 1, 'out2']
    ],
    sleeves: SLEEVE_LONG,
    legs: []
  },
  {
    id: 'athletic', name: 'Спортивный сет',
    body: [
      [9, 16, 6, 9, 'out1'], [14, 16, 1, 9, 'out1D'],
      [9, 16, 6, 1, 'out2'], [9, 19, 6, 1, 'out2']
    ],
    sleeves: SLEEVE_SHORT,
    legs: [[9, 25, 2, 5, 'out2'], [13, 25, 2, 5, 'out2'], [10, 25, 1, 5, 'out2D'], [14, 25, 1, 5, 'out2D']]
  }
];

/* ------------------------------------------------------------------ */
/* Cloaks                                                              */
/* ------------------------------------------------------------------ */

interface Cloak {
  id: string; name: string;
  hidesHair?: boolean;
  back?: Rect[];
  front?: Rect[];
}

export const CLOAKS: Cloak[] = [
  { id: 'none', name: 'Без плаща' },
  {
    id: 'hood', name: 'Капюшон странника',
    hidesHair: true,
    back: [
      [5, 3, 14, 12, 'cloakD'],
      [4, 14, 16, 14, 'cloak'], [4, 27, 16, 1, 'cloakD']
    ],
    front: [
      [7, 2, 10, 4, 'cloak'], [7, 2, 10, 1, 'cloakL'],
      [6, 5, 2, 10, 'cloak'], [16, 5, 2, 10, 'cloak'],
      [6, 14, 2, 2, 'cloakD'], [16, 14, 2, 2, 'cloakD'],
      [4, 15, 3, 12, 'cloak'], [17, 15, 3, 12, 'cloak'],
      [5, 15, 1, 12, 'cloakD'], [17, 15, 1, 12, 'cloakL'],
      [11, 16, 2, 2, 'gold']
    ]
  },
  {
    id: 'cape', name: 'Плащ',
    back: [[6, 16, 12, 12, 'cloakD'], [7, 27, 10, 2, 'cloakD']],
    front: [[7, 15, 10, 3, 'cloak'], [7, 15, 10, 1, 'cloakL'], [10, 16, 1, 1, 'gold'], [13, 16, 1, 1, 'gold']]
  },
  {
    id: 'shawl', name: 'Тёплая шаль',
    front: [[7, 15, 10, 4, 'cloak'], [7, 15, 10, 1, 'cloakL'], [7, 19, 3, 3, 'cloak'], [14, 19, 3, 3, 'cloak'], [7, 21, 3, 1, 'cloakD'], [14, 21, 3, 1, 'cloakD']]
  },
  {
    id: 'coat', name: 'Длинное пальто',
    back: [[6, 16, 12, 13, 'cloakD']],
    front: [
      [6, 16, 3, 13, 'cloak'], [15, 16, 3, 13, 'cloak'],
      [6, 16, 3, 1, 'cloakL'], [15, 16, 3, 1, 'cloakL'],
      [6, 28, 3, 1, 'cloakD'], [15, 28, 3, 1, 'cloakD']
    ]
  },
  {
    id: 'wings', name: 'Крылья духа',
    back: [
      [2, 14, 4, 9, 'cloak'], [18, 14, 4, 9, 'cloak'],
      [1, 16, 2, 5, 'cloakL'], [21, 16, 2, 5, 'cloakL'],
      [2, 22, 4, 1, 'cloakD'], [18, 22, 4, 1, 'cloakD']
    ]
  },
  {
    id: 'scarfcloak', name: 'Плащ-накидка с шарфом',
    back: [[6, 17, 12, 11, 'cloakD']],
    front: [
      [8, 14, 8, 2, 'cloak'], [8, 14, 8, 1, 'cloakL'],
      [15, 16, 2, 7, 'cloak'], [15, 22, 2, 1, 'cloakD'],
      [7, 16, 2, 10, 'cloak']
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Accessories                                                         */
/* ------------------------------------------------------------------ */

interface Accessory {
  id: string; name: string;
  hidesHairTop?: boolean;
  rects: Rect[];
}

export const ACCESSORIES: Accessory[] = [
  { id: 'none', name: 'Без аксессуара', rects: [] },
  {
    id: 'headphones', name: 'Наушники',
    rects: [
      [8, 2, 8, 1, 'acc'], [7, 3, 1, 2, 'acc'], [16, 3, 1, 2, 'acc'],
      [5, 5, 3, 5, 'acc'], [16, 5, 3, 5, 'acc'],
      [6, 6, 1, 3, 'white'], [17, 6, 1, 3, 'white']
    ]
  },
  {
    id: 'glasses', name: 'Очки',
    rects: [
      [9, 10, 3, 1, 'accD'], [9, 12, 3, 1, 'accD'], [9, 11, 1, 1, 'accD'], [11, 11, 1, 1, 'accD'],
      [13, 10, 3, 1, 'accD'], [13, 12, 3, 1, 'accD'], [13, 11, 1, 1, 'accD'], [15, 11, 1, 1, 'accD'],
      [12, 11, 1, 1, 'accD'], [10, 11, 1, 1, 'white']
    ]
  },
  {
    id: 'catears', name: 'Кошачьи ушки',
    rects: [
      [7, 2, 3, 3, 'hair'], [8, 1, 1, 1, 'hair'], [8, 3, 1, 1, 'blush'],
      [14, 2, 3, 3, 'hair'], [15, 1, 1, 1, 'hair'], [15, 3, 1, 1, 'blush']
    ]
  },
  {
    id: 'flowercrown', name: 'Венок из цветов',
    rects: [
      [7, 3, 10, 1, 'acc'],
      [7, 2, 2, 2, 'blush'], [10, 2, 2, 2, 'white'], [13, 2, 2, 2, 'blush'], [16, 2, 1, 2, 'white'],
      [7, 2, 1, 1, 'gold'], [13, 2, 1, 1, 'gold']
    ]
  },
  {
    id: 'halo', name: 'Нимб',
    rects: [[8, 0, 8, 1, 'gold'], [7, 1, 1, 1, 'gold'], [16, 1, 1, 1, 'gold'], [8, 2, 8, 1, 'white']]
  },
  {
    id: 'beanie', name: 'Шапка-бини',
    hidesHairTop: true,
    rects: [
      [7, 2, 10, 4, 'acc'], [7, 2, 10, 1, 'accD'],
      [7, 6, 10, 1, 'accD'], [11, 0, 2, 2, 'white']
    ]
  },
  {
    id: 'strawhat', name: 'Соломенная шляпа',
    hidesHairTop: true,
    rects: [
      [4, 5, 16, 2, 'gold'], [4, 6, 16, 1, 'accD'],
      [8, 2, 8, 3, 'gold'], [8, 4, 8, 1, 'acc']
    ]
  },
  {
    id: 'scarf', name: 'Тёплый шарф',
    rects: [[8, 14, 8, 2, 'acc'], [8, 14, 8, 1, 'accD'], [14, 16, 2, 5, 'acc'], [14, 20, 2, 1, 'accD']]
  },
  {
    id: 'bag', name: 'Сумка через плечо',
    rects: [[10, 16, 1, 7, 'leather'], [15, 21, 4, 4, 'acc'], [15, 21, 4, 1, 'leather'], [16, 22, 1, 1, 'gold']]
  },
  {
    id: 'starclip', name: 'Звёздная заколка',
    rects: [[5, 6, 3, 3, 'gold'], [6, 5, 1, 1, 'gold'], [6, 9, 1, 1, 'gold'], [6, 7, 1, 1, 'white']]
  },
  {
    id: 'lantern', name: 'Фонарик светлячков',
    rects: [[17, 20, 1, 4, 'leather'], [16, 24, 3, 4, 'gold'], [16, 25, 3, 2, 'white'], [16, 27, 3, 1, 'accD']]
  },
  {
    id: 'earrings', name: 'Серёжки-капли',
    rects: [[7, 12, 1, 2, 'gold'], [16, 12, 1, 2, 'gold']]
  },
  {
    id: 'bandage', name: 'Пластырь смелости',
    rects: [[13, 9, 3, 1, 'white'], [13, 9, 1, 1, 'accD'], [15, 9, 1, 1, 'accD']]
  }
];

/* ------------------------------------------------------------------ */
/* Config + resolver                                                   */
/* ------------------------------------------------------------------ */

export interface PixelAvatarConfig {
  skin: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  outfit: string;
  outfitPrimary: string;
  outfitSecondary: string;
  cloak: string;
  cloakColor: string;
  accessory: string;
  accessoryColor: string;
  shoeColor: string;
  auraColor: string;
}

export const DEFAULT_AVATAR: PixelAvatarConfig = {
  skin: '#F3CBA9',
  hairStyle: 'long',
  hairColor: '#4A2F23',
  eyes: 'round',
  outfit: 'tunic',
  outfitPrimary: '#F5F0E6',
  outfitSecondary: '#4C5C96',
  cloak: 'hood',
  cloakColor: '#2E3350',
  accessory: 'none',
  accessoryColor: '#B84E6E',
  shoeColor: '#6E4F3A',
  auraColor: '#86EFAC'
};

function palette(cfg: PixelAvatarConfig): Record<ColorRole, string> {
  return {
    skin: cfg.skin,
    skinD: shade(cfg.skin, -0.18),
    skinL: shade(cfg.skin, 0.16),
    hair: cfg.hairColor,
    hairD: shade(cfg.hairColor, -0.28),
    hairL: shade(cfg.hairColor, 0.2),
    out1: cfg.outfitPrimary,
    out1D: shade(cfg.outfitPrimary, -0.2),
    out1L: shade(cfg.outfitPrimary, 0.18),
    out2: cfg.outfitSecondary,
    out2D: shade(cfg.outfitSecondary, -0.22),
    cloak: cfg.cloakColor,
    cloakD: shade(cfg.cloakColor, -0.3),
    cloakL: shade(cfg.cloakColor, 0.16),
    acc: cfg.accessoryColor,
    accD: shade(cfg.accessoryColor, -0.35),
    white: '#FDFCF8',
    dark: '#2B2536',
    blush: '#F09DAE',
    gold: '#E9BE62',
    leather: cfg.shoeColor,
    leatherD: shade(cfg.shoeColor, -0.3)
  };
}

export function buildPixelLayers(cfg: PixelAvatarConfig): ResolvedRect[] {
  const p = palette(cfg);
  const out: Rect[] = [];

  const hair = HAIR_STYLES.find(h => h.id === cfg.hairStyle) || HAIR_STYLES[0];
  const outfit = OUTFITS.find(o => o.id === cfg.outfit) || OUTFITS[0];
  const cloak = CLOAKS.find(c => c.id === cfg.cloak) || CLOAKS[0];
  const acc = ACCESSORIES.find(a => a.id === cfg.accessory) || ACCESSORIES[0];
  const eyes = EYE_STYLES.find(e => e.id === cfg.eyes) || EYE_STYLES[0];

  const hideHair = !!cloak.hidesHair || !!acc.hidesHairTop;

  // 1. behind everything
  if (cloak.back) out.push(...cloak.back);
  if (!hideHair && hair.back) out.push(...hair.back);

  // 2. body
  out.push(...BODY_LEGS);
  out.push(...outfit.legs);
  out.push(...BODY_SHOES);
  out.push(...BODY_TORSO);
  out.push(...BODY_ARMS);
  out.push(...outfit.body);
  out.push(...outfit.sleeves);

  // 3. head + face
  out.push(...BODY_HEAD);
  out.push(...eyes.rects);

  // 4. hair
  if (!hideHair) out.push(...hair.front);
  out.push(...hair.fringe);

  // 5. cloak front (hood) + accessories
  if (cloak.front) out.push(...cloak.front);
  out.push(...acc.rects);

  return out.map(([x, y, w, h, role]) => ({ x, y, w, h, c: p[role] }));
}

/* ------------------------------------------------------------------ */
/* Curated presets                                                     */
/* ------------------------------------------------------------------ */

export interface AvatarPreset {
  id: string;
  name: string;
  tag: string;
  cfg: PixelAvatarConfig;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'hooded_wanderer', name: 'Странник в капюшоне', tag: 'Тишина',
    cfg: { ...DEFAULT_AVATAR, skin: '#F3CBA9', hairStyle: 'long', hairColor: '#3B3050', eyes: 'calm', outfit: 'tunic', outfitPrimary: '#F5F0E6', outfitSecondary: '#6E4F3A', cloak: 'hood', cloakColor: '#2E3350', accessory: 'none', shoeColor: '#4A3527', auraColor: '#C4B5FD' }
  },
  {
    id: 'headphone_girl', name: 'Меломан в наушниках', tag: 'Ритм',
    cfg: { ...DEFAULT_AVATAR, skin: '#F3CBA9', hairStyle: 'bob', hairColor: '#7A4A2E', eyes: 'sparkle', outfit: 'sundress', outfitPrimary: '#F5F0E6', outfitSecondary: '#A8CBE8', cloak: 'none', cloakColor: '#A8CBE8', accessory: 'headphones', accessoryColor: '#E8DCC4', shoeColor: '#3F444F', auraColor: '#93C5FD' }
  },
  {
    id: 'forest_herbalist', name: 'Лесной травник', tag: 'Надежда',
    cfg: { ...DEFAULT_AVATAR, skin: '#E8B48C', hairStyle: 'braids', hairColor: '#4F7A55', eyes: 'round', outfit: 'kimono', outfitPrimary: '#A8C6A1', outfitSecondary: '#E0A244', cloak: 'shawl', cloakColor: '#B7E4CF', accessory: 'flowercrown', accessoryColor: '#4F7A55', shoeColor: '#6E4F3A', auraColor: '#86EFAC' }
  },
  {
    id: 'stargazer', name: 'Ночной звездочёт', tag: 'Мечта',
    cfg: { ...DEFAULT_AVATAR, skin: '#DCE6F2', hairStyle: 'wolf', hairColor: '#3C4A78', eyes: 'starry', outfit: 'stargazer', outfitPrimary: '#2E3350', outfitSecondary: '#C3B2E8', cloak: 'cape', cloakColor: '#4C5C96', accessory: 'halo', accessoryColor: '#F2D08A', shoeColor: '#22242E', auraColor: '#C4B5FD' }
  },
  {
    id: 'steppe_rider', name: 'Всадник степи', tag: 'Көк аспан',
    cfg: { ...DEFAULT_AVATAR, skin: '#C98E64', hairStyle: 'short', hairColor: '#2B2536', eyes: 'brave', outfit: 'shepherd', outfitPrimary: '#4C5C96', outfitSecondary: '#E0A244', cloak: 'none', cloakColor: '#B05E43', accessory: 'bag', accessoryColor: '#B05E43', shoeColor: '#6E4F3A', auraColor: '#93C5FD' }
  },
  {
    id: 'sleepy_student', name: 'Сонный студент', tag: 'Выгорание',
    cfg: { ...DEFAULT_AVATAR, skin: '#F3CBA9', hairStyle: 'messy', hairColor: '#4A2F23', eyes: 'sleepy', outfit: 'hoodie', outfitPrimary: '#C9CFD6', outfitSecondary: '#3F444F', cloak: 'none', cloakColor: '#3F444F', accessory: 'headphones', accessoryColor: '#3F444F', shoeColor: '#3F444F', auraColor: '#E2E8F0' }
  },
  {
    id: 'cat_spirit', name: 'Кошачий дух', tag: 'Игривость',
    cfg: { ...DEFAULT_AVATAR, skin: '#FBE0CE', hairStyle: 'twintails', hairColor: '#F0A6C4', eyes: 'wink', outfit: 'overalls', outfitPrimary: '#F2BBD0', outfitSecondary: '#F5F0E6', cloak: 'none', cloakColor: '#F2BBD0', accessory: 'catears', accessoryColor: '#F0A6C4', shoeColor: '#B84E6E', auraColor: '#F472B6' }
  },
  {
    id: 'quiet_scholar', name: 'Тихий книжник', tag: 'Ясность',
    cfg: { ...DEFAULT_AVATAR, skin: '#E8B48C', hairStyle: 'hime', hairColor: '#2B2536', eyes: 'calm', outfit: 'uniform', outfitPrimary: '#2E3350', outfitSecondary: '#B84E6E', cloak: 'none', cloakColor: '#2E3350', accessory: 'glasses', accessoryColor: '#6E4F3A', shoeColor: '#22242E', auraColor: '#5EEAD4' }
  },
  {
    id: 'snow_mage', name: 'Снежный маг', tag: 'Покой',
    cfg: { ...DEFAULT_AVATAR, skin: '#DCE6F2', hairStyle: 'long', hairColor: '#EDE7DC', eyes: 'calm', outfit: 'robe', outfitPrimary: '#E8DCC4', outfitSecondary: '#A8CBE8', cloak: 'coat', cloakColor: '#A8CBE8', accessory: 'starclip', accessoryColor: '#F2D08A', shoeColor: '#4C5C96', auraColor: '#93C5FD' }
  },
  {
    id: 'sun_farmer', name: 'Солнечный садовник', tag: 'Радость',
    cfg: { ...DEFAULT_AVATAR, skin: '#C98E64', hairStyle: 'curly', hairColor: '#B07A45', eyes: 'sparkle', outfit: 'overalls', outfitPrimary: '#4C5C96', outfitSecondary: '#F5F0E6', cloak: 'none', cloakColor: '#E0A244', accessory: 'strawhat', accessoryColor: '#E0A244', shoeColor: '#6E4F3A', auraColor: '#FDE047' }
  },
  {
    id: 'ember_knight', name: 'Тлеющий рыцарь', tag: 'Решимость',
    cfg: { ...DEFAULT_AVATAR, skin: '#A66B43', hairStyle: 'spiky', hairColor: '#B05E43', eyes: 'brave', outfit: 'jacket', outfitPrimary: '#B84E6E', outfitSecondary: '#22242E', cloak: 'cape', cloakColor: '#B05E43', accessory: 'bandage', accessoryColor: '#B84E6E', shoeColor: '#22242E', auraColor: '#FB7185' }
  },
  {
    id: 'moth_spirit', name: 'Дух ночного мотылька', tag: 'Тревога',
    cfg: { ...DEFAULT_AVATAR, skin: '#E0D4F5', hairStyle: 'buns', hairColor: '#B9A2E8', eyes: 'shy', outfit: 'sweater', outfitPrimary: '#C3B2E8', outfitSecondary: '#6B4C7A', cloak: 'wings', cloakColor: '#E0D4F5', accessory: 'lantern', accessoryColor: '#F2D08A', shoeColor: '#6B4C7A', auraColor: '#C4B5FD' }
  },
  {
    id: 'runner', name: 'Утренний бегун', tag: 'Перезагрузка',
    cfg: { ...DEFAULT_AVATAR, skin: '#7A4A2B', hairStyle: 'shaved', hairColor: '#2B2536', eyes: 'round', outfit: 'athletic', outfitPrimary: '#F09B7E', outfitSecondary: '#3F444F', cloak: 'none', cloakColor: '#F09B7E', accessory: 'none', accessoryColor: '#F09B7E', shoeColor: '#F5F0E6', auraColor: '#FB7185' }
  },
  {
    id: 'tea_keeper', name: 'Хранитель чайной', tag: 'Нежность',
    cfg: { ...DEFAULT_AVATAR, skin: '#F3CBA9', hairStyle: 'ponytail', hairColor: '#7A4A2E', eyes: 'round', outfit: 'kimono', outfitPrimary: '#F2BBD0', outfitSecondary: '#B84E6E', cloak: 'none', cloakColor: '#F2BBD0', accessory: 'earrings', accessoryColor: '#F2D08A', shoeColor: '#6E4F3A', auraColor: '#F472B6' }
  },
  {
    id: 'rain_walker', name: 'Идущий под дождём', tag: 'Печаль',
    cfg: { ...DEFAULT_AVATAR, skin: '#E8B48C', hairStyle: 'wolf', hairColor: '#9AA3AE', eyes: 'sleepy', outfit: 'sweater', outfitPrimary: '#4C5C96', outfitSecondary: '#C9CFD6', cloak: 'coat', cloakColor: '#3F444F', accessory: 'scarf', accessoryColor: '#A8CBE8', shoeColor: '#22242E', auraColor: '#93C5FD' }
  },
  {
    id: 'mint_healer', name: 'Мятный целитель', tag: 'Спокойствие',
    cfg: { ...DEFAULT_AVATAR, skin: '#C9E4D2', hairStyle: 'bob', hairColor: '#8FD9C0', eyes: 'calm', outfit: 'robe', outfitPrimary: '#F5F0E6', outfitSecondary: '#8FD9C0', cloak: 'shawl', cloakColor: '#B7E4CF', accessory: 'flowercrown', accessoryColor: '#4F7A55', shoeColor: '#A8C6A1', auraColor: '#5EEAD4' }
  }
];

export function randomAvatar(): PixelAvatarConfig {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    skin: pick(SKIN_TONES).hex,
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS).hex,
    eyes: pick(EYE_STYLES).id,
    outfit: pick(OUTFITS).id,
    outfitPrimary: pick(CLOTH_COLORS).hex,
    outfitSecondary: pick(CLOTH_COLORS).hex,
    cloak: pick(CLOAKS).id,
    cloakColor: pick(CLOTH_COLORS).hex,
    accessory: pick(ACCESSORIES).id,
    accessoryColor: pick(CLOTH_COLORS).hex,
    shoeColor: pick(CLOTH_COLORS).hex,
    auraColor: pick(AURA_COLORS).hex
  };
}
