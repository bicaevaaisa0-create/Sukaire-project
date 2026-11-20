import { buildPixelLayers, PixelAvatarConfig } from '../data/pixelParts';
import { WorldObject, TILE, T, MAP_W, MAP_H } from './worldMap';

type Ctx = CanvasRenderingContext2D;

const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

/* ================= ТАЙЛЫ ================= */

const TILE_COLORS: Record<number, [string, string, string]> = {
  [T.GRASS]:      ['#9BCB7F', '#8CBE72', '#AFD993'],
  [T.GRASS_D]:    ['#86B86D', '#78AB60', '#97C77E'],
  [T.FLOWERS]:    ['#9BCB7F', '#F2D08A', '#F0A6C4'],
  [T.PATH]:       ['#D9C9A3', '#CDBB91', '#E4D7B8'],
  [T.SAND]:       ['#E6D7AE', '#D9C89B', '#F0E4C4'],
  [T.WATER]:      ['#7FC4E8', '#6DB6DE', '#9BD6F2'],
  [T.WATER_DEEP]: ['#4E9BC9', '#428CB8', '#63AFD8'],
  [T.STONE]:      ['#BFC4C9', '#AEB4BA', '#D2D7DC'],
  [T.DARK]:       ['#2A2740', '#232036', '#332F4C'],
  [T.MOSS]:       ['#30304F', '#282845', '#3B3B5E'],
  [T.VOID]:       ['#0B0A14', '#07060D', '#15131F'],
  [T.DARK_PATH]:  ['#403A5C', '#38324F', '#4B4469'],
  [T.ASH]:        ['#4A4458', '#403A4D', '#574F66']
};

export function renderTerrain(tiles: Uint8Array): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = MAP_W * TILE;
  cv.height = MAP_H * TILE;
  const c = cv.getContext('2d')!;

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const id = tiles[y * MAP_W + x];
      const [base, dark, light] = TILE_COLORS[id] || TILE_COLORS[T.GRASS];
      const ox = x * TILE, oy = y * TILE;
      px(c, ox, oy, TILE, TILE, base);

      // пиксельная крошка
      for (let i = 0; i < 7; i++) {
        const hx = ((x * 31 + y * 17 + i * 13) % 8) * 4;
        const hy = ((x * 13 + y * 29 + i * 7) % 8) * 4;
        px(c, ox + hx, oy + hy, 4, 4, i % 2 ? dark : light);
      }

      if (id === T.FLOWERS) {
        px(c, ox + 8, oy + 10, 4, 4, '#F6EBA0');
        px(c, ox + 20, oy + 18, 4, 4, '#F3B6CF');
        px(c, ox + 14, oy + 24, 3, 3, '#FFFFFF');
      }
      if (id === T.PATH || id === T.DARK_PATH) {
        px(c, ox + 6, oy + 6, 5, 5, dark);
        px(c, ox + 20, oy + 16, 6, 6, dark);
      }
      if (id === T.STONE) {
        px(c, ox, oy, TILE, 2, light);
        px(c, ox, oy + TILE - 2, TILE, 2, dark);
      }
    }
  }
  return cv;
}

/* ---- анимированная вода поверх ---- */
export function drawWaterOverlay(c: Ctx, tiles: Uint8Array, cam: { x: number; y: number }, vw: number, vh: number, t: number) {
  const x0 = Math.max(0, Math.floor(cam.x / TILE));
  const y0 = Math.max(0, Math.floor(cam.y / TILE));
  const x1 = Math.min(MAP_W, Math.ceil((cam.x + vw) / TILE));
  const y1 = Math.min(MAP_H, Math.ceil((cam.y + vh) / TILE));

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const id = tiles[y * MAP_W + x];
      if (id !== T.WATER && id !== T.WATER_DEEP) continue;
      const ox = x * TILE - cam.x, oy = y * TILE - cam.y;
      const w = Math.sin(t * 2 + x * 0.6 + y * 0.4);
      if (w > 0.4) px(c, ox + 6 + w * 4, oy + 10, 12, 2, 'rgba(255,255,255,0.45)');
      if (w < -0.5) px(c, ox + 12 - w * 4, oy + 22, 9, 2, 'rgba(255,255,255,0.3)');
    }
  }
}

/* ================= ОБЪЕКТЫ ================= */

export function drawObject(c: Ctx, o: WorldObject, sx: number, sy: number, t: number) {
  const v = o.v;
  switch (o.kind) {
    case 'tree': {
      const g = v > 0.5 ? ['#4F7A4A', '#6FA368', '#8CC184'] : ['#47704A', '#669664', '#84B882'];
      px(c, sx - 4, sy - 22, 8, 22, '#6B4A33');
      px(c, sx - 1, sy - 22, 3, 22, '#573B29');
      const sway = Math.sin(t * 1.2 + v * 6) * 1.5;
      px(c, sx - 22 + sway, sy - 54, 44, 30, g[0]);
      px(c, sx - 18 + sway, sy - 62, 36, 14, g[0]);
      px(c, sx - 16 + sway, sy - 58, 30, 18, g[1]);
      px(c, sx - 12 + sway, sy - 60, 18, 10, g[2]);
      px(c, sx - 22 + sway, sy - 28, 44, 4, '#3E6240');
      break;
    }
    case 'pine': {
      const sway = Math.sin(t * 1.1 + v * 5) * 1.2;
      px(c, sx - 3, sy - 18, 6, 18, '#5C4330');
      for (let i = 0; i < 4; i++) {
        const w = 34 - i * 7;
        px(c, sx - w / 2 + sway, sy - 26 - i * 12, w, 14, i % 2 ? '#3F6B44' : '#4C7C50');
        px(c, sx - w / 2 + sway, sy - 26 - i * 12, w, 3, '#64975F');
      }
      break;
    }
    case 'deadtree': {
      const sway = Math.sin(t * 0.8 + v * 4) * 1;
      px(c, sx - 4, sy - 40, 8, 40, '#3A3348');
      px(c, sx - 2, sy - 40, 3, 40, '#2A2437');
      px(c, sx - 18 + sway, sy - 44, 16, 4, '#3A3348');
      px(c, sx + 4 + sway, sy - 52, 16, 4, '#3A3348');
      px(c, sx - 20 + sway, sy - 52, 5, 10, '#3A3348');
      px(c, sx + 16 + sway, sy - 60, 5, 10, '#3A3348');
      break;
    }
    case 'bush': {
      const col = v > 0.5 ? '#5F9158' : '#6EA066';
      px(c, sx - 14, sy - 16, 28, 16, col);
      px(c, sx - 10, sy - 21, 20, 10, col);
      px(c, sx - 8, sy - 19, 12, 6, '#85B57C');
      if (v > 0.7) { px(c, sx - 6, sy - 12, 4, 4, '#E05A6B'); px(c, sx + 5, sy - 8, 4, 4, '#E05A6B'); }
      break;
    }
    case 'rock': {
      const g = v > 0.5 ? ['#A8ADB5', '#C3C8CE', '#878C94'] : ['#9AA0A8', '#B6BBC2', '#7B8089'];
      px(c, sx - 13, sy - 14, 26, 14, g[0]);
      px(c, sx - 9, sy - 19, 18, 8, g[0]);
      px(c, sx - 7, sy - 18, 10, 5, g[1]);
      px(c, sx - 13, sy - 3, 26, 3, g[2]);
      break;
    }
    case 'stump': {
      px(c, sx - 10, sy - 12, 20, 12, '#6B4A33');
      px(c, sx - 10, sy - 14, 20, 4, '#8A6245');
      px(c, sx - 4, sy - 14, 8, 3, '#A67C57');
      break;
    }
    case 'flower': {
      const cols = ['#F2D08A', '#F0A6C4', '#FFFFFF', '#C3B2E8', '#F09B7E'];
      const col = cols[Math.floor(v * cols.length) % cols.length];
      const sway = Math.sin(t * 2 + v * 9) * 1;
      px(c, sx - 1, sy - 9, 2, 9, '#5F8B52');
      px(c, sx - 3 + sway, sy - 14, 6, 6, col);
      px(c, sx - 1 + sway, sy - 12, 2, 2, '#FFF7D6');
      break;
    }
    case 'mushroom': {
      px(c, sx - 2, sy - 7, 4, 7, '#EFE3CE');
      px(c, sx - 7, sy - 13, 14, 7, v > 0.5 ? '#D4625E' : '#C9846A');
      px(c, sx - 4, sy - 11, 3, 3, '#FFF1E0');
      px(c, sx + 2, sy - 12, 2, 2, '#FFF1E0');
      break;
    }
    case 'reed': {
      const sway = Math.sin(t * 2.4 + v * 7) * 2;
      for (let i = -1; i <= 1; i++) {
        px(c, sx + i * 5, sy - 18, 2, 18, '#7E9B5E');
        px(c, sx + i * 5 + sway, sy - 24, 3, 7, '#9C7B4F');
      }
      break;
    }
    case 'lantern': {
      const glow = 0.55 + Math.sin(t * 2.2 + v * 6) * 0.2;
      px(c, sx - 2, sy - 26, 4, 26, '#5B4A3A');
      px(c, sx - 7, sy - 38, 14, 13, '#6B5744');
      px(c, sx - 5, sy - 36, 10, 9, `rgba(255,220,140,${glow})`);
      px(c, sx - 8, sy - 40, 16, 3, '#4A3B2E');
      c.save();
      c.globalAlpha = glow * 0.35;
      const grd = c.createRadialGradient(sx, sy - 31, 2, sx, sy - 31, 54);
      grd.addColorStop(0, '#FFD98A'); grd.addColorStop(1, 'transparent');
      c.fillStyle = grd; c.beginPath(); c.arc(sx, sy - 31, 54, 0, Math.PI * 2); c.fill();
      c.restore();
      break;
    }
    case 'brazier': {
      const f = Math.sin(t * 6 + v * 9);
      px(c, sx - 9, sy - 12, 18, 12, '#3B3450');
      px(c, sx - 11, sy - 16, 22, 5, '#4A4266');
      px(c, sx - 5, sy - 22 - f, 10, 8, '#B06CE8');
      px(c, sx - 3, sy - 26 - f, 6, 6, '#D9A7FF');
      c.save(); c.globalAlpha = 0.3;
      const g2 = c.createRadialGradient(sx, sy - 20, 2, sx, sy - 20, 60);
      g2.addColorStop(0, '#B06CE8'); g2.addColorStop(1, 'transparent');
      c.fillStyle = g2; c.beginPath(); c.arc(sx, sy - 20, 60, 0, Math.PI * 2); c.fill();
      c.restore();
      break;
    }
    case 'crystal': {
      const fl = Math.sin(t * 2 + v * 8) * 3;
      px(c, sx - 7, sy - 20 + fl, 14, 20, '#8B6FD6');
      px(c, sx - 4, sy - 24 + fl, 8, 8, '#B9A2E8');
      px(c, sx - 2, sy - 18 + fl, 3, 10, '#E3DAFB');
      break;
    }
    case 'tomb': {
      px(c, sx - 10, sy - 20, 20, 20, '#514A63');
      px(c, sx - 10, sy - 24, 20, 6, '#5E5673');
      px(c, sx - 6, sy - 16, 12, 2, '#6E6684');
      px(c, sx - 6, sy - 11, 12, 2, '#6E6684');
      break;
    }
    case 'spirit': {
      const fl = Math.sin(t * 1.6 + v * 10) * 5;
      c.save(); c.globalAlpha = 0.6;
      px(c, sx - 6, sy - 30 + fl, 12, 14, '#9BA7D9');
      px(c, sx - 4, sy - 34 + fl, 8, 6, '#C5CEEF');
      px(c, sx - 4, sy - 28 + fl, 2, 2, '#1B1930');
      px(c, sx + 2, sy - 28 + fl, 2, 2, '#1B1930');
      c.restore();
      break;
    }
    case 'fence': {
      px(c, sx - 14, sy - 14, 4, 14, '#7A5C40');
      px(c, sx + 10, sy - 14, 4, 14, '#7A5C40');
      px(c, sx - 14, sy - 11, 28, 3, '#8E6D4C');
      break;
    }
    case 'sign': {
      px(c, sx - 2, sy - 18, 4, 18, '#7A5C40');
      px(c, sx - 14, sy - 32, 28, 16, '#A67C52');
      px(c, sx - 14, sy - 32, 28, 3, '#C09669');
      px(c, sx - 10, sy - 27, 20, 2, '#6B4A33');
      px(c, sx - 10, sy - 23, 14, 2, '#6B4A33');
      break;
    }
    case 'yurt': {
      px(c, sx - 40, sy - 36, 80, 36, '#F2EADA');
      px(c, sx - 40, sy - 36, 80, 4, '#DED2BC');
      c.fillStyle = '#F7F1E4';
      c.beginPath(); c.moveTo(sx - 42, sy - 34); c.quadraticCurveTo(sx, sy - 76, sx + 42, sy - 34); c.fill();
      c.strokeStyle = '#C9A227'; c.lineWidth = 3;
      c.beginPath(); c.arc(sx, sy - 66, 9, 0, Math.PI * 2); c.stroke();
      px(c, sx - 11, sy - 26, 22, 26, '#8B5E3C');
      px(c, sx - 11, sy - 26, 22, 3, '#C9A227');
      px(c, sx - 40, sy - 12, 80, 3, '#C9A227');
      break;
    }
    case 'shrine': {
      const glow = 0.4 + Math.sin(t * 1.5) * 0.18;
      px(c, sx - 20, sy - 10, 40, 10, '#C4C8CE');
      px(c, sx - 16, sy - 16, 32, 7, '#D4D8DE');
      px(c, sx - 8, sy - 44, 16, 29, '#B9BEC6');
      px(c, sx - 5, sy - 40, 10, 20, `rgba(255,255,255,${glow + 0.3})`);
      px(c, sx - 12, sy - 50, 24, 7, '#CDD2D9');
      c.save(); c.globalAlpha = glow * 0.5;
      const g3 = c.createRadialGradient(sx, sy - 32, 4, sx, sy - 32, 70);
      g3.addColorStop(0, '#FFFFFF'); g3.addColorStop(1, 'transparent');
      c.fillStyle = g3; c.beginPath(); c.arc(sx, sy - 32, 70, 0, Math.PI * 2); c.fill();
      c.restore();
      break;
    }
    default:
      break;
  }
}

/* ================= ПЕРСОНАЖ ================= */

const layerCache = new Map<string, { x: number; y: number; w: number; h: number; c: string }[]>();

function layersOf(cfg: PixelAvatarConfig) {
  const key = JSON.stringify(cfg);
  let l = layerCache.get(key);
  if (!l) { l = buildPixelLayers(cfg); layerCache.set(key, l); }
  return l;
}

export function drawCharacter(
  c: Ctx,
  cfg: PixelAvatarConfig,
  sx: number,
  sy: number,
  opts: { scale?: number; facing?: 'up' | 'down' | 'left' | 'right'; moving?: boolean; t?: number; aura?: string }
) {
  const scale = opts.scale ?? 2;
  const t = opts.t ?? 0;
  const W = 24 * scale, H = 32 * scale;
  const bob = opts.moving ? Math.round(Math.abs(Math.sin(t * 9)) * -2) : Math.round(Math.sin(t * 1.8) * -1);

  // тень
  c.save();
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.ellipse(sx, sy - 1, W * 0.26, H * 0.045, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // аура
  if (opts.aura) {
    c.save();
    c.globalAlpha = 0.33;
    const g = c.createRadialGradient(sx, sy - H * 0.45, 2, sx, sy - H * 0.45, W * 0.85);
    g.addColorStop(0, opts.aura); g.addColorStop(1, 'transparent');
    c.fillStyle = g;
    c.beginPath(); c.arc(sx, sy - H * 0.45, W * 0.85, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  const flip = opts.facing === 'left';
  c.save();
  c.translate(sx, sy + bob);
  if (flip) c.scale(-1, 1);
  c.translate(-W / 2, -H);

  const rects = layersOf(cfg);
  for (const r of rects) {
    c.fillStyle = r.c;
    c.fillRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
  }

  // вид со спины — закрываем лицо
  if (opts.facing === 'up') {
    c.fillStyle = cfg.cloak === 'hood' ? cfg.cloakColor : cfg.hairColor;
    c.fillRect(8 * scale, 6 * scale, 8 * scale, 9 * scale);
  }

  c.restore();
}

/* ================= ТЕНЬ-БОСС НА КАРТЕ ================= */
export function drawShadowEntity(c: Ctx, sx: number, sy: number, color: string, dark: string, t: number, defeated: boolean) {
  const fl = Math.sin(t * 1.5) * 4;
  const h = 56;
  c.save();
  c.globalAlpha = defeated ? 0.4 : 0.92;
  // тело
  px(c, sx - 18, sy - h + fl, 36, h - 10, dark);
  px(c, sx - 22, sy - h + 14 + fl, 6, 26, dark);
  px(c, sx + 16, sy - h + 14 + fl, 6, 26, dark);
  px(c, sx - 18, sy - h + fl, 36, 3, color);
  // голова-капюшон
  px(c, sx - 13, sy - h - 14 + fl, 26, 18, dark);
  px(c, sx - 13, sy - h - 14 + fl, 26, 3, color);
  // глаза
  px(c, sx - 8, sy - h - 6 + fl, 5, 5, defeated ? '#FDE047' : color);
  px(c, sx + 3, sy - h - 6 + fl, 5, 5, defeated ? '#FDE047' : color);
  c.restore();

  // дымка
  c.save();
  c.globalAlpha = defeated ? 0.25 : 0.4;
  const g = c.createRadialGradient(sx, sy - 30, 4, sx, sy - 30, 70);
  g.addColorStop(0, defeated ? '#FDE047' : color);
  g.addColorStop(1, 'transparent');
  c.fillStyle = g;
  c.beginPath(); c.arc(sx, sy - 30, 70, 0, Math.PI * 2); c.fill();
  c.restore();
}

/* ================= ПОРТАЛ ================= */
export function drawPortal(c: Ctx, sx: number, sy: number, color: string, t: number) {
  c.save();
  for (let i = 3; i >= 0; i--) {
    const r = 26 + i * 9 + Math.sin(t * 2 + i) * 3;
    c.globalAlpha = 0.18 + i * 0.06;
    c.fillStyle = color;
    c.beginPath(); c.ellipse(sx, sy - 34, r * 0.72, r, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 0.9;
  c.fillStyle = '#0B0A14';
  c.beginPath(); c.ellipse(sx, sy - 34, 19, 27, 0, 0, Math.PI * 2); c.fill();
  // искры
  for (let i = 0; i < 7; i++) {
    const a = t * 1.4 + i * 0.9;
    const rr = 10 + ((i * 5 + t * 24) % 26);
    c.globalAlpha = 1 - rr / 36;
    c.fillStyle = color;
    c.fillRect(sx + Math.cos(a) * rr * 0.7, sy - 34 + Math.sin(a) * rr, 3, 3);
  }
  c.restore();

  // каменная арка
  px(c, sx - 30, sy - 8, 10, 56, '#A8ADB5');
  px(c, sx + 20, sy - 8, 10, 56, '#A8ADB5');
  px(c, sx - 30, sy - 62, 60, 10, '#B8BDC5');
  px(c, sx - 30, sy - 62, 60, 3, '#D2D7DC');
}

/* ================= ТОЧКА ИНТЕРЕСА ================= */
export function drawSpotBase(c: Ctx, sx: number, sy: number, color: string, t: number, near: boolean, done: boolean) {
  const col = done ? '#FDE047' : color;
  const pulse = Math.sin(t * 2.4) * 3;
  c.save();
  c.globalAlpha = near ? 0.35 : 0.2;
  c.fillStyle = col;
  c.beginPath(); c.ellipse(sx, sy, 46 + pulse, 22 + pulse * 0.5, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = near ? 0.95 : 0.6;
  c.strokeStyle = col; c.lineWidth = near ? 3 : 2;
  c.setLineDash([7, 5]);
  c.lineDashOffset = -t * 18;
  c.beginPath(); c.ellipse(sx, sy, 46 + pulse, 22 + pulse * 0.5, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
}
