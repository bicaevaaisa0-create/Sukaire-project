/**
 * Sukaire — игровой движок мира.
 * Тайловая карта 32px, две стороны мира, коллизии, объекты, NPC, точки интереса.
 */

export const TILE = 32;
export const MAP_W = 60;
export const MAP_H = 44;
export const WORLD_PX_W = MAP_W * TILE;
export const WORLD_PX_H = MAP_H * TILE;

export const VIEW_W = 960;
export const VIEW_H = 540;

/* ---------- Тайлы ---------- */
export const T = {
  GRASS: 0,
  GRASS_D: 1,
  FLOWERS: 2,
  PATH: 3,
  SAND: 4,
  WATER: 5,
  WATER_DEEP: 6,
  STONE: 7,
  DARK: 8,
  MOSS: 9,
  VOID: 10,
  DARK_PATH: 11,
  ASH: 12
} as const;

export type TileId = number;

export const SOLID_TILES = new Set<number>([T.WATER_DEEP, T.VOID]);
export const WET_TILES = new Set<number>([T.WATER]);

/* ---------- Детерминированный шум ---------- */
export function hash2(x: number, y: number, seed = 1): number {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040888963407;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

/* ---------- Объекты ---------- */
export type ObjKind =
  | 'tree' | 'pine' | 'deadtree' | 'rock' | 'bush' | 'flower' | 'mushroom'
  | 'lantern' | 'yurt' | 'crystal' | 'tomb' | 'brazier' | 'fence' | 'sign'
  | 'shrine' | 'bridge' | 'reed' | 'stump' | 'spirit';

export interface WorldObject {
  kind: ObjKind;
  x: number;          // world px (центр основания)
  y: number;
  v: number;          // вариация 0..1
  col?: { w: number; h: number }; // коллайдер у основания
}

/* ---------- Точки интереса ---------- */
export interface Spot {
  id: string;
  kind: 'hotspot' | 'portal' | 'shadow';
  title: string;
  sub: string;
  x: number;
  y: number;
  r: number;
  color: string;
  shadowId?: string;
  icon: 'breath' | 'release' | 'sound' | 'wisdom' | 'portal' | 'shadow';
}

/* ---------- NPC ---------- */
export interface NpcDef {
  id: string;
  name: string;
  presetIdx: number;
  x: number;
  y: number;
  lines: string[];
  gift?: string;
}

/* ---------- Генерация светлой стороны ---------- */
function riverY(x: number): number {
  return 23 + Math.sin(x * 0.11) * 3.2 + Math.cos(x * 0.05) * 2.1;
}

function genLight(): Uint8Array {
  const t = new Uint8Array(MAP_W * MAP_H);
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const i = y * MAP_W + x;
      const n = hash2(x, y, 7);
      let tile: number = T.GRASS;

      if (n > 0.82) tile = T.GRASS_D;
      if (n > 0.95) tile = T.FLOWERS;

      // река
      const ry = riverY(x);
      const d = Math.abs(y - ry);
      if (d < 1.1) tile = T.WATER_DEEP;
      else if (d < 2.2) tile = T.WATER;
      else if (d < 3.0) tile = T.SAND;

      // поляна в центре (святилище)
      const cx = MAP_W / 2, cy = MAP_H / 2;
      const dc = Math.hypot(x - cx, (y - cy) * 1.25);
      if (dc < 4.2) tile = T.STONE;
      else if (dc < 5.4 && n > 0.35) tile = T.PATH;

      // тропы-крестом к четырём углам
      const onPathH = Math.abs(y - cy) < 1.2 && x > 6 && x < MAP_W - 6;
      const onPathV = Math.abs(x - cx) < 1.2 && y > 5 && y < MAP_H - 5;
      if ((onPathH || onPathV) && tile !== T.WATER_DEEP && tile !== T.WATER) tile = T.PATH;

      // мост через реку
      if (Math.abs(x - cx) < 2 && d < 3.2) tile = T.STONE;

      t[i] = tile;
    }
  }
  return t;
}

function genDark(): Uint8Array {
  const t = new Uint8Array(MAP_W * MAP_H);
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const i = y * MAP_W + x;
      const n = hash2(x, y, 19);
      let tile: number = T.DARK;
      if (n > 0.78) tile = T.MOSS;
      if (n > 0.94) tile = T.ASH;

      // разлом (пропасть) по диагонали
      const rift = Math.abs(y - (10 + x * 0.42 + Math.sin(x * 0.2) * 2));
      if (rift < 1.0) tile = T.VOID;
      else if (rift < 2.0) tile = T.ASH;

      // центральная площадка врат
      const cx = MAP_W / 2, cy = MAP_H / 2;
      const dc = Math.hypot(x - cx, (y - cy) * 1.25);
      if (dc < 4.0) tile = T.STONE;
      else if (dc < 5.2 && n > 0.4) tile = T.DARK_PATH;

      const onPathH = Math.abs(y - cy) < 1.1 && x > 5 && x < MAP_W - 5;
      const onPathV = Math.abs(x - cx) < 1.1 && y > 5 && y < MAP_H - 5;
      if ((onPathH || onPathV) && tile !== T.VOID) tile = T.DARK_PATH;

      // мост через разлом
      if (Math.abs(x - cx) < 2 && rift < 2.2) tile = T.STONE;

      t[i] = tile;
    }
  }
  return t;
}

/* ---------- Объекты ---------- */
function placeObjects(tiles: Uint8Array, side: 'light' | 'shadow', spots: Spot[]): WorldObject[] {
  const objs: WorldObject[] = [];
  const far = (x: number, y: number) =>
    spots.every(s => Math.hypot(x - s.x, y - s.y) > s.r + 46);

  for (let y = 2; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      const tile = tiles[y * MAP_W + x];
      const px = x * TILE + TILE / 2;
      const py = y * TILE + TILE;
      const n = hash2(x, y, side === 'light' ? 101 : 202);
      const n2 = hash2(x, y, 303);

      if (!far(px, py)) continue;
      if (tile === T.PATH || tile === T.DARK_PATH || tile === T.STONE) continue;

      if (side === 'light') {
        if (tile === T.SAND && n > 0.88) { objs.push({ kind: 'reed', x: px, y: py, v: n2 }); continue; }
        if (tile === T.WATER || tile === T.WATER_DEEP) continue;

        if (n > 0.955) objs.push({ kind: n2 > 0.5 ? 'tree' : 'pine', x: px, y: py, v: n2, col: { w: 16, h: 8 } });
        else if (n > 0.93) objs.push({ kind: 'bush', x: px, y: py, v: n2, col: { w: 14, h: 6 } });
        else if (n > 0.90) objs.push({ kind: 'rock', x: px, y: py, v: n2, col: { w: 14, h: 7 } });
        else if (n > 0.86) objs.push({ kind: 'flower', x: px, y: py, v: n2 });
        else if (n > 0.845) objs.push({ kind: 'mushroom', x: px, y: py, v: n2 });
        else if (n > 0.838) objs.push({ kind: 'stump', x: px, y: py, v: n2, col: { w: 14, h: 6 } });
      } else {
        if (tile === T.VOID) continue;
        if (n > 0.955) objs.push({ kind: 'deadtree', x: px, y: py, v: n2, col: { w: 14, h: 7 } });
        else if (n > 0.935) objs.push({ kind: 'rock', x: px, y: py, v: n2, col: { w: 14, h: 7 } });
        else if (n > 0.915) objs.push({ kind: 'tomb', x: px, y: py, v: n2, col: { w: 14, h: 7 } });
        else if (n > 0.90) objs.push({ kind: 'spirit', x: px, y: py, v: n2 });
        else if (n > 0.885) objs.push({ kind: 'crystal', x: px, y: py, v: n2, col: { w: 12, h: 6 } });
      }
    }
  }

  const cx = (MAP_W / 2) * TILE;
  const cy = (MAP_H / 2) * TILE;

  if (side === 'light') {
    objs.push({ kind: 'yurt', x: cx - 230, y: cy - 150, v: 0.4, col: { w: 70, h: 20 } });
    objs.push({ kind: 'shrine', x: cx, y: cy - 52, v: 0.5, col: { w: 30, h: 12 } });
    [[-120, -40], [120, -40], [-120, 90], [120, 90]].forEach(([ox, oy], i) =>
      objs.push({ kind: 'lantern', x: cx + ox, y: cy + oy, v: i / 4, col: { w: 8, h: 6 } }));
    objs.push({ kind: 'sign', x: cx + 50, y: cy + 46, v: 0.2, col: { w: 10, h: 6 } });
  } else {
    objs.push({ kind: 'shrine', x: cx, y: cy - 50, v: 0.9, col: { w: 30, h: 12 } });
    [[-130, -30], [130, -30], [-130, 80], [130, 80]].forEach(([ox, oy], i) =>
      objs.push({ kind: 'brazier', x: cx + ox, y: cy + oy, v: i / 4, col: { w: 10, h: 7 } }));
  }

  return objs;
}

/* ---------- Точки интереса ---------- */
const CX = (MAP_W / 2) * TILE;
const CY = (MAP_H / 2) * TILE;

export const LIGHT_SPOTS: Spot[] = [
  { id: 'breath', kind: 'hotspot', icon: 'breath', title: 'Камень заземления', sub: 'Дыхательное кольцо 4-7-8', x: CX - 420, y: CY - 260, r: 56, color: '#34D399' },
  { id: 'release', kind: 'hotspot', icon: 'release', title: 'Стена выплеска', sub: 'Растворить мысль в свете', x: CX + 430, y: CY - 250, r: 56, color: '#818CF8' },
  { id: 'sound', kind: 'hotspot', icon: 'sound', title: 'Акустический купол', sub: 'Ветер, дождь, прибой', x: CX - 430, y: CY + 300, r: 56, color: '#38BDF8' },
  { id: 'wisdom', kind: 'hotspot', icon: 'wisdom', title: 'Кристалл мудрости', sub: 'Мысли из книг', x: CX + 420, y: CY + 310, r: 56, color: '#F472B6' },
  { id: 'portal-dark', kind: 'portal', icon: 'portal', title: 'Врата Изнанки', sub: 'Перейти на теневую сторону', x: CX, y: CY + 10, r: 62, color: '#7C3AED' }
];

export const SHADOW_SPOTS: Spot[] = [
  { id: 's-anxiety', kind: 'shadow', icon: 'shadow', shadowId: 'anxiety', title: 'Тревога', sub: 'Дрожащая лавандовая тень', x: CX - 430, y: CY - 280, r: 54, color: '#C084FC' },
  { id: 's-anger', kind: 'shadow', icon: 'shadow', shadowId: 'anger', title: 'Злость', sub: 'Багровый страж границ', x: CX + 440, y: CY - 270, r: 54, color: '#E11D48' },
  { id: 's-shame', kind: 'shadow', icon: 'shadow', shadowId: 'shame', title: 'Стыд', sub: 'Серый шёпот', x: CX - 440, y: CY + 300, r: 54, color: '#8A7F8E' },
  { id: 's-burnout', kind: 'shadow', icon: 'shadow', shadowId: 'burnout', title: 'Выгорание', sub: 'Пыльный колосс', x: CX + 430, y: CY + 310, r: 54, color: '#A8A29E' },
  { id: 's-loneliness', kind: 'shadow', icon: 'shadow', shadowId: 'loneliness', title: 'Одиночество', sub: 'Голос за стеклом', x: CX - 200, y: CY + 330, r: 54, color: '#6D7C96' },
  { id: 's-perfect', kind: 'shadow', icon: 'shadow', shadowId: 'perfectionism', title: 'Перфекционизм', sub: 'Зеркальный судья', x: CX + 210, y: CY + 330, r: 54, color: '#B8A9CF' },
  { id: 'portal-light', kind: 'portal', icon: 'portal', title: 'Врата Света', sub: 'Вернуться в Сад Кокона', x: CX, y: CY + 10, r: 62, color: '#FDE047' }
];

/* ---------- NPC ---------- */
export const LIGHT_NPCS: NpcDef[] = [
  {
    id: 'herbalist', name: 'Айна, травница', presetIdx: 2, x: CX - 215, y: CY - 120,
    lines: [
      'Ты пришёл сам — это уже половина пути, странник.',
      'Я собираю травы, которые ничего не лечат мгновенно. Они просто напоминают телу, что оно в безопасности.',
      'Если станет тяжело — иди к Камню заземления на западе. Дыши там. Выдох должен быть длиннее вдоха.'
    ],
    gift: 'Совет: длинный выдох — самый быстрый путь к покою'
  },
  {
    id: 'scholar', name: 'Бекзат, книжник', presetIdx: 7, x: CX + 190, y: CY + 140,
    lines: [
      'О, живой человек! Я тут перечитываю Атлас Сердца в сто двадцатый раз.',
      'Знаешь, что главное? Стыд говорит «я плохой», а вина — «я поступил плохо». Между ними пропасть.',
      'За Вратами в центре — Изнанка. Там живут твои Тени. Не бойся: они не враги, они части тебя с устаревшей инструкцией.'
    ],
    gift: 'Знание: Тень — это часть вас, а не враг'
  },
  {
    id: 'tea', name: 'Мира, хранитель чайной', presetIdx: 13, x: CX - 150, y: CY + 190,
    lines: [
      'Садись. Чай горячий, спешить некуда.',
      'Здесь никто не спросит, чего ты добился сегодня. Отдых — это не награда за работу, а её условие.',
      'В японском есть слово 侘寂 — вабú-сáби. Красота трещин. Ты тоже красив с трещинами.'
    ],
    gift: 'Разрешение: отдыхать без чувства вины'
  }
];

export const DARK_NPCS: NpcDef[] = [
  {
    id: 'keeper', name: 'Страж Порога', presetIdx: 3, x: CX + 170, y: CY - 130,
    lines: [
      'Ты в Изнанке. Здесь громче, чем в саду. Это нормально.',
      'Тени не нужно убивать. Их нужно выслушать и перестать с ними спорить.',
      'Когда станет невыносимо — отступи к Вратам. Отступление здесь считается мудростью, а не поражением.'
    ],
    gift: 'Право отступить без стыда'
  }
];

/* ---------- Сборка карты ---------- */
export interface GameMap {
  tiles: Uint8Array;
  objects: WorldObject[];
  spots: Spot[];
  npcs: NpcDef[];
  spawn: { x: number; y: number };
}

const cache: Record<string, GameMap> = {};

export function getMap(side: 'light' | 'shadow'): GameMap {
  if (cache[side]) return cache[side];
  const tiles = side === 'light' ? genLight() : genDark();
  const spots = side === 'light' ? LIGHT_SPOTS : SHADOW_SPOTS;
  const npcs = side === 'light' ? LIGHT_NPCS : DARK_NPCS;
  const objects = placeObjects(tiles, side, spots);
  const map: GameMap = { tiles, objects, spots, npcs, spawn: { x: CX, y: CY + 150 } };
  cache[side] = map;
  return map;
}

export function tileAt(tiles: Uint8Array, px: number, py: number): number {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return T.VOID;
  return tiles[y * MAP_W + x];
}
