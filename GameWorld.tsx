import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UserProfile, EmotionAnalysisResult, HeroState, WorldState } from '../types';
import { AVATAR_PRESETS, PixelAvatarConfig } from '../data/pixelParts';
import { SHADOWS, ShadowBoss } from '../data/shadows';
import {
  getMap, tileAt, TILE, MAP_W, MAP_H, VIEW_W, VIEW_H,
  WORLD_PX_W, WORLD_PX_H, SOLID_TILES, WET_TILES, Spot, NpcDef, T
} from '../game/worldMap';
import {
  renderTerrain, drawWaterOverlay, drawObject, drawCharacter,
  drawShadowEntity, drawPortal, drawSpotBase
} from '../game/sprites';
import { BreathingModal } from './BreathingModal';
import { ReleaseWallModal } from './ReleaseWallModal';
import { SoundPavilionModal } from './SoundPavilionModal';
import { WisdomCrystalModal } from './WisdomCrystalModal';
import { ShadowBattle } from './ShadowBattle';
import { audioEngine } from '../utils/audioSynthesizer';
import {
  Maximize2, Minimize2, Volume2, VolumeX, Swords, Map as MapIcon,
  ScrollText, Sparkles, X, ChevronRight
} from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  currentAnalysis: EmotionAnalysisResult;
  hero: HeroState;
  world: WorldState;
  onHeroChange: (h: HeroState) => void;
  onWorldChange: (w: WorldState) => void;
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; }

export const GameWorld: React.FC<Props> = ({
  userProfile, currentAnalysis, hero, world, onHeroChange, onWorldChange
}) => {
  const [side, setSide] = useState<'light' | 'shadow'>(world.side);
  const [immersive, setImmersive] = useState(false);
  const [started, setStarted] = useState(false);
  const [near, setNear] = useState<{ type: 'spot' | 'npc'; spot?: Spot; npc?: NpcDef } | null>(null);
  const [dialogue, setDialogue] = useState<{ npc: NpcDef; idx: number; shown: string } | null>(null);
  const [battle, setBattle] = useState<ShadowBoss | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showQuests, setShowQuests] = useState(true);
  const [muted, setMuted] = useState(false);
  const [night, setNight] = useState(false);

  const [mBreath, setMBreath] = useState(false);
  const [mRelease, setMRelease] = useState(false);
  const [mSound, setMSound] = useState(false);
  const [mWisdom, setMWisdom] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const map = useMemo(() => getMap(side), [side]);
  const terrain = useMemo(() => renderTerrain(map.tiles), [map]);

  const player = useRef({ x: map.spawn.x, y: map.spawn.y, fx: 0, fy: 0, facing: 'down' as 'up' | 'down' | 'left' | 'right', moving: false, run: false });
  const cam = useRef({ x: 0, y: 0 });
  const keys = useRef<Record<string, boolean>>({});
  const particles = useRef<Particle[]>([]);
  const nearRef = useRef<typeof near>(null);
  const dialogRef = useRef(false);
  const stepTimer = useRef(0);

  nearRef.current = near;
  dialogRef.current = !!dialogue || !!battle || mBreath || mRelease || mSound || mWisdom;

  const talked = useMemo(() => world.talkedNpcs || [], [world.talkedNpcs]);
  const usedSpots = useMemo(() => world.usedSpots || [], [world.usedSpots]);

  const showToast = (s: string) => { setToast(s); window.setTimeout(() => setToast(null), 3200); };

  /* ---------- перенос спавна при смене стороны ---------- */
  useEffect(() => {
    player.current.x = map.spawn.x;
    player.current.y = map.spawn.y;
    particles.current = [];
  }, [map]);

  /* ---------- коллизии ---------- */
  const canStand = useCallback((x: number, y: number) => {
    if (x < 20 || y < 24 || x > WORLD_PX_W - 20 || y > WORLD_PX_H - 8) return false;
    for (const dx of [-8, 0, 8]) {
      const tl = tileAt(map.tiles, x + dx, y - 2);
      if (SOLID_TILES.has(tl)) return false;
    }
    for (const o of map.objects) {
      if (!o.col) continue;
      if (Math.abs(o.x - x) < o.col.w / 2 + 7 && Math.abs(o.y - 4 - y) < o.col.h / 2 + 5) return false;
    }
    return true;
  }, [map]);

  /* ---------- взаимодействие ---------- */
  const interact = useCallback((n: NonNullable<typeof near>) => {
    if (n.type === 'npc' && n.npc) {
      setDialogue({ npc: n.npc, idx: 0, shown: '' });
      return;
    }
    const s = n.spot!;
    if (s.kind === 'portal') {
      const next = side === 'light' ? 'shadow' : 'light';
      setSide(next);
      onWorldChange({ ...world, side: next, visitedZones: Array.from(new Set([...world.visitedZones, next])) });
      showToast(next === 'shadow'
        ? '⟡ Изнанка. Здесь живут ваши Тени — части вас, которые просят внимания.'
        : '⟡ Сад Кокона. Здесь можно восстановиться и выдохнуть.');
      return;
    }
    if (s.kind === 'shadow' && s.shadowId) {
      if (world.defeatedShadows.includes(s.shadowId)) {
        const b = SHADOWS.find(x => x.id === s.shadowId);
        showToast(`${b?.giftName}: ${b?.giftDesc}`);
        return;
      }
      const boss = SHADOWS.find(b => b.id === s.shadowId);
      if (boss) setBattle(boss);
      return;
    }
    onWorldChange({ ...world, usedSpots: Array.from(new Set([...usedSpots, s.id])) });
    if (s.id === 'breath') setMBreath(true);
    if (s.id === 'release') setMRelease(true);
    if (s.id === 'sound') setMSound(true);
    if (s.id === 'wisdom') setMWisdom(true);
  }, [side, world, onWorldChange, usedSpots]);

  /* ---------- диалог: печатная машинка ---------- */
  useEffect(() => {
    if (!dialogue) return;
    const full = dialogue.npc.lines[dialogue.idx] || '';
    if (dialogue.shown.length >= full.length) return;
    const id = window.setTimeout(() => {
      setDialogue(d => d ? { ...d, shown: full.slice(0, d.shown.length + 1) } : d);
    }, 18);
    return () => clearTimeout(id);
  }, [dialogue]);

  const advanceDialogue = useCallback(() => {
    setDialogue(d => {
      if (!d) return d;
      const full = d.npc.lines[d.idx] || '';
      if (d.shown.length < full.length) return { ...d, shown: full };
      if (d.idx + 1 < d.npc.lines.length) return { ...d, idx: d.idx + 1, shown: '' };
      if (!talked.includes(d.npc.id)) {
        onWorldChange({ ...world, talkedNpcs: [...talked, d.npc.id] });
        onHeroChange({ ...hero, clarity: Math.min(100, hero.clarity + 4), light: hero.light + 5, xp: hero.xp + 10, level: 1 + Math.floor((hero.xp + 10) / 100) });
        if (d.npc.gift) showToast(`✦ ${d.npc.gift}`);
      }
      return null;
    });
  }, [talked, world, hero, onWorldChange, onHeroChange]);

  /* ---------- клавиатура ---------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === 'Shift') player.current.run = true;

      if (e.code === 'Space' || e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        e.preventDefault();
        if (dialogue) { advanceDialogue(); return; }
        if (!started) { setStarted(true); return; }
        if (nearRef.current && !dialogRef.current) interact(nearRef.current);
      }
      if (e.key === 'Escape') { if (dialogue) setDialogue(null); else setImmersive(false); }
      if (e.key.toLowerCase() === 'f') setImmersive(v => !v);
      if (e.key.toLowerCase() === 'q') setShowQuests(v => !v);
      if (e.key.toLowerCase() === 'n') setNight(v => !v);
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') player.current.run = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [interact, dialogue, advanceDialogue, started]);

  /* ---------- игровой цикл ---------- */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;
    c.imageSmoothingEnabled = false;

    let raf = 0;
    let t = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      const p = player.current;

      /* --- движение --- */
      if (!dialogRef.current && started) {
        const k = keys.current;
        let dx = 0, dy = 0;
        if (k['w'] || k['arrowup']) dy -= 1;
        if (k['s'] || k['arrowdown']) dy += 1;
        if (k['a'] || k['arrowleft']) dx -= 1;
        if (k['d'] || k['arrowright']) dx += 1;

        const len = Math.hypot(dx, dy);
        if (len > 0) {
          dx /= len; dy /= len;
          const wet = WET_TILES.has(tileAt(map.tiles, p.x, p.y));
          const speed = (p.run ? 190 : 125) * (wet ? 0.6 : 1) * dt;
          const nx = p.x + dx * speed;
          const ny = p.y + dy * speed;
          if (canStand(nx, p.y)) p.x = nx;
          if (canStand(p.x, ny)) p.y = ny;
          p.moving = true;
          if (Math.abs(dx) > Math.abs(dy)) p.facing = dx > 0 ? 'right' : 'left';
          else p.facing = dy > 0 ? 'down' : 'up';

          // пыль/брызги под ногами
          stepTimer.current -= dt;
          if (stepTimer.current <= 0) {
            stepTimer.current = p.run ? 0.14 : 0.22;
            const wetNow = WET_TILES.has(tileAt(map.tiles, p.x, p.y));
            for (let i = 0; i < (wetNow ? 4 : 2); i++) {
              particles.current.push({
                x: p.x + (Math.random() - 0.5) * 10, y: p.y,
                vx: (Math.random() - 0.5) * 16, vy: -14 - Math.random() * 16,
                life: 0, max: 0.45, s: wetNow ? 3 : 2,
                c: wetNow ? '#CFEAFA' : side === 'light' ? '#E6DCC0' : '#6B6484'
              });
            }
          }
        } else p.moving = false;
      } else p.moving = false;

      /* --- камера --- */
      const tx = Math.max(0, Math.min(WORLD_PX_W - VIEW_W, p.x - VIEW_W / 2));
      const ty = Math.max(0, Math.min(WORLD_PX_H - VIEW_H, p.y - VIEW_H / 2 - 20));
      cam.current.x += (tx - cam.current.x) * Math.min(1, dt * 7);
      cam.current.y += (ty - cam.current.y) * Math.min(1, dt * 7);
      const camX = Math.round(cam.current.x), camY = Math.round(cam.current.y);

      /* --- ближайший объект --- */
      let found: typeof near = null;
      for (const s of map.spots) {
        if (Math.hypot(p.x - s.x, p.y - s.y) < s.r) { found = { type: 'spot', spot: s }; break; }
      }
      if (!found) {
        for (const n of map.npcs) {
          if (Math.hypot(p.x - n.x, p.y - n.y) < 54) { found = { type: 'npc', npc: n }; break; }
        }
      }
      const prev = nearRef.current;
      const changed = (prev?.spot?.id || prev?.npc?.id) !== (found?.spot?.id || found?.npc?.id);
      if (changed) setNear(found);

      /* --- рендер --- */
      c.clearRect(0, 0, VIEW_W, VIEW_H);
      c.drawImage(terrain, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
      drawWaterOverlay(c, map.tiles, { x: camX, y: camY }, VIEW_W, VIEW_H, t);

      // основания точек интереса (под объектами)
      for (const s of map.spots) {
        if (s.x < camX - 80 || s.x > camX + VIEW_W + 80 || s.y < camY - 80 || s.y > camY + VIEW_H + 80) continue;
        const done = s.shadowId ? world.defeatedShadows.includes(s.shadowId) : usedSpots.includes(s.id);
        drawSpotBase(c, s.x - camX, s.y - camY, s.color, t, found?.spot?.id === s.id, done);
      }

      /* --- сортировка по глубине --- */
      type R = { y: number; f: () => void };
      const rend: R[] = [];

      for (const o of map.objects) {
        if (o.x < camX - 70 || o.x > camX + VIEW_W + 70 || o.y < camY - 110 || o.y > camY + VIEW_H + 70) continue;
        rend.push({ y: o.y, f: () => drawObject(c, o, o.x - camX, o.y - camY, t) });
      }

      for (const s of map.spots) {
        if (s.x < camX - 90 || s.x > camX + VIEW_W + 90) continue;
        if (s.kind === 'portal') {
          rend.push({ y: s.y + 10, f: () => drawPortal(c, s.x - camX, s.y - camY + 10, s.color, t) });
        } else if (s.kind === 'shadow') {
          const done = world.defeatedShadows.includes(s.shadowId || '');
          const boss = SHADOWS.find(b => b.id === s.shadowId);
          rend.push({ y: s.y, f: () => drawShadowEntity(c, s.x - camX, s.y - camY, boss?.hex || s.color, boss?.darkHex || '#333', t, done) });
        }
      }

      for (const n of map.npcs) {
        if (n.x < camX - 80 || n.x > camX + VIEW_W + 80) continue;
        const cfg = AVATAR_PRESETS[n.presetIdx % AVATAR_PRESETS.length].cfg as PixelAvatarConfig;
        rend.push({
          y: n.y, f: () => {
            drawCharacter(c, cfg, n.x - camX, n.y - camY, { scale: 2, facing: 'down', moving: false, t: t * 0.6 });
            // индикатор "!" если ещё не говорили
            if (!talked.includes(n.id)) {
              const b = Math.sin(t * 4) * 3;
              c.fillStyle = '#FDE047';
              c.fillRect(n.x - camX - 2, n.y - camY - 86 + b, 4, 10);
              c.fillRect(n.x - camX - 2, n.y - camY - 73 + b, 4, 4);
            }
          }
        });
      }

      rend.push({
        y: player.current.y, f: () => drawCharacter(c, userProfile.avatar, p.x - camX, p.y - camY, {
          scale: 2.2, facing: p.facing, moving: p.moving, t, aura: currentAnalysis.palette.primaryHex
        })
      });

      rend.sort((a, b) => a.y - b.y);
      rend.forEach(r => r.f());

      /* --- частицы --- */
      particles.current = particles.current.filter(pt => {
        pt.life += dt;
        if (pt.life > pt.max) return false;
        pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 60 * dt;
        c.globalAlpha = 1 - pt.life / pt.max;
        c.fillStyle = pt.c;
        c.fillRect(Math.round(pt.x - camX), Math.round(pt.y - camY), pt.s, pt.s);
        c.globalAlpha = 1;
        return true;
      });

      /* --- атмосферные частицы мира --- */
      for (let i = 0; i < 22; i++) {
        const ax = (i * 137 + t * (side === 'light' ? 14 : 7)) % (VIEW_W + 80) - 40;
        const ay = (i * 71 + Math.sin(t * 0.7 + i) * 60 + t * (side === 'light' ? 6 : 16)) % (VIEW_H + 60) - 30;
        c.globalAlpha = 0.35 + Math.sin(t * 2 + i) * 0.2;
        c.fillStyle = currentAnalysis.palette.particleColor;
        c.fillRect(ax, ay, 3, 3);
      }
      c.globalAlpha = 1;

      /* --- освещение / ночь / эмоция --- */
      c.save();
      if (side === 'shadow') {
        c.fillStyle = 'rgba(10,8,22,0.45)';
        c.fillRect(0, 0, VIEW_W, VIEW_H);
      }
      if (night) {
        c.fillStyle = 'rgba(16,20,56,0.42)';
        c.fillRect(0, 0, VIEW_W, VIEW_H);
      }
      // тинт эмоции
      c.globalAlpha = 0.18;
      c.fillStyle = currentAnalysis.palette.primaryHex;
      c.fillRect(0, 0, VIEW_W, VIEW_H);
      c.globalAlpha = 1;
      // виньетка
      const vg = c.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
      vg.addColorStop(0, 'transparent');
      vg.addColorStop(1, side === 'light' ? 'rgba(20,30,20,0.45)' : 'rgba(0,0,0,0.75)');
      c.fillStyle = vg;
      c.fillRect(0, 0, VIEW_W, VIEW_H);
      // свет вокруг героя ночью
      if (night || side === 'shadow') {
        c.globalCompositeOperation = 'lighter';
        const lg = c.createRadialGradient(p.x - camX, p.y - camY - 30, 6, p.x - camX, p.y - camY - 30, 160);
        lg.addColorStop(0, `${currentAnalysis.palette.primaryHex}55`);
        lg.addColorStop(1, 'transparent');
        c.fillStyle = lg;
        c.beginPath(); c.arc(p.x - camX, p.y - camY - 30, 160, 0, Math.PI * 2); c.fill();
        c.globalCompositeOperation = 'source-over';
      }
      c.restore();

      /* --- миникарта --- */
      const mc = miniRef.current?.getContext('2d');
      if (mc) {
        const MW = 150, MH = 110;
        mc.clearRect(0, 0, MW, MH);
        mc.fillStyle = side === 'light' ? '#8CBE72' : '#232036';
        mc.fillRect(0, 0, MW, MH);
        const sx = MW / MAP_W, sy = MH / MAP_H;
        for (let y = 0; y < MAP_H; y += 1) {
          for (let x = 0; x < MAP_W; x += 1) {
            const id = map.tiles[y * MAP_W + x];
            let col = '';
            if (id === T.WATER || id === T.WATER_DEEP) col = '#5BA8D6';
            else if (id === T.PATH || id === T.DARK_PATH) col = side === 'light' ? '#D9C9A3' : '#4B4469';
            else if (id === T.STONE) col = '#C4C8CE';
            else if (id === T.VOID) col = '#07060D';
            if (col) { mc.fillStyle = col; mc.fillRect(x * sx, y * sy, sx + 0.6, sy + 0.6); }
          }
        }
        map.spots.forEach(s => {
          const done = s.shadowId ? world.defeatedShadows.includes(s.shadowId) : usedSpots.includes(s.id);
          mc.fillStyle = done ? '#FDE047' : s.color;
          mc.fillRect((s.x / TILE) * sx - 2.5, (s.y / TILE) * sy - 2.5, 5, 5);
        });
        map.npcs.forEach(n => {
          mc.fillStyle = talked.includes(n.id) ? '#94A3B8' : '#FFFFFF';
          mc.fillRect((n.x / TILE) * sx - 2, (n.y / TILE) * sy - 2, 4, 4);
        });
        mc.fillStyle = '#FF4D6D';
        mc.fillRect((p.x / TILE) * sx - 2.5, (p.y / TILE) * sy - 2.5, 5, 5);
        mc.strokeStyle = 'rgba(255,255,255,0.6)';
        mc.lineWidth = 1;
        mc.strokeRect((camX / TILE) * sx, (camY / TILE) * sy, (VIEW_W / TILE) * sx, (VIEW_H / TILE) * sy);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [map, terrain, side, currentAnalysis, world.defeatedShadows, talked, usedSpots, userProfile.avatar, canStand, started, night]);

  /* ---------- звук ---------- */
  const toggleSound = () => {
    if (muted) {
      audioEngine.playWind(0.28);
      audioEngine.playAmbientPad(0.18);
      setMuted(false);
    } else {
      audioEngine.stopAll();
      setMuted(true);
    }
  };
  useEffect(() => () => audioEngine.stopAll(), []);

  /* ---------- награды ---------- */
  const onBattleWin = (reward: ShadowBoss['reward']) => {
    if (!battle) return;
    const xp = hero.xp + reward.xp;
    onHeroChange({
      ...hero,
      calm: Math.min(100, hero.calm + (reward.calm || 0)),
      courage: Math.min(100, hero.courage + (reward.courage || 0)),
      energy: Math.min(100, hero.energy + (reward.energy || 0)),
      clarity: Math.min(100, hero.clarity + (reward.clarity || 0)),
      light: hero.light + reward.light, xp, level: 1 + Math.floor(xp / 100)
    });
    onWorldChange({ ...world, defeatedShadows: Array.from(new Set([...world.defeatedShadows, battle.id])) });
    showToast(`✦ ${battle.name} принята. Получен ${battle.giftName}.`);
    setBattle(null);
  };

  /* ---------- квесты ---------- */
  const quests = [
    { id: 'q1', text: 'Поговорить с хранителями сада', now: talked.length, total: 3 },
    { id: 'q2', text: 'Найти Врата и войти в Изнанку', now: world.visitedZones.includes('shadow') ? 1 : 0, total: 1 },
    { id: 'q3', text: 'Принять свои Тени', now: world.defeatedShadows.length, total: SHADOWS.length },
    { id: 'q4', text: 'Использовать места силы', now: usedSpots.length, total: 4 }
  ];

  const HudBar: React.FC<{ v: number; c: string; label: string }> = ({ v, c, label }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] font-bold tracking-wider text-white/60 w-10">{label}</span>
      <div className="w-20 h-2 bg-black/50 border border-white/20 overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${v}%`, background: c }} />
      </div>
    </div>
  );

  const game = (
    <div ref={wrapRef} className={`relative w-full ${immersive ? 'h-full' : 'aspect-video max-h-[600px]'} bg-black overflow-hidden ${immersive ? '' : 'rounded-2xl border-2 border-slate-800 shadow-2xl'}`}>
      <canvas
        ref={canvasRef}
        width={VIEW_W}
        height={VIEW_H}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* ===== Заставка ===== */}
      {!started && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/88 backdrop-blur-sm text-center px-6">
          <div className="text-[10px] tracking-[0.3em] text-emerald-300 mb-3 font-mono">SUKAIRE · CHROMATICA</div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">СВЯТИЛИЩЕ КОКОНА</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-5 leading-relaxed">
            Мир, который меняется вместе с вашим состоянием. Исследуйте сад, говорите с хранителями,
            входите в Изнанку и принимайте свои Тени.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-400 mb-6">
            <span className="px-2 py-1 border border-white/20 rounded">WASD — ходьба</span>
            <span className="px-2 py-1 border border-white/20 rounded">SHIFT — бег</span>
            <span className="px-2 py-1 border border-white/20 rounded">E — действие</span>
            <span className="px-2 py-1 border border-white/20 rounded">F — фуллскрин</span>
            <span className="px-2 py-1 border border-white/20 rounded">Q — квесты</span>
            <span className="px-2 py-1 border border-white/20 rounded">N — ночь</span>
          </div>
          <button
            onClick={() => { setStarted(true); setImmersive(true); }}
            className="px-8 py-3 bg-white text-slate-900 font-black text-sm tracking-wide hover:bg-emerald-200 transition-all active:scale-95 animate-pulse"
          >
            ▶ НАЧАТЬ ИГРУ
          </button>
        </div>
      )}

      {/* ===== HUD слева сверху ===== */}
      {started && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="bg-slate-950/75 border-2 border-white/20 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black text-white tracking-wide">{userProfile.nickname}</span>
              <span className="text-[9px] px-1.5 bg-amber-400 text-slate-900 font-black">LV {hero.level}</span>
              <span className="text-[9px] text-amber-300 font-bold">✦ {hero.light}</span>
            </div>
            <div className="grid gap-1">
              <HudBar v={hero.energy} c="#4ADE80" label="ЭНРГ" />
              <HudBar v={hero.calm} c="#60A5FA" label="ПОКОЙ" />
              <HudBar v={hero.courage} c="#FB7185" label="СМЕЛ" />
              <HudBar v={hero.clarity} c="#C4B5FD" label="ЯСНО" />
            </div>
          </div>
          <div className="mt-1.5 bg-slate-950/75 border-2 border-white/20 px-2 py-1 backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: currentAnalysis.palette.primaryHex }} />
            <span className="text-[9px] text-white/80 font-bold">{currentAnalysis.palette.nameRu}</span>
          </div>
        </div>
      )}

      {/* ===== Миникарта ===== */}
      {started && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-slate-950/75 border-2 border-white/20 p-1.5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[8px] font-black text-white/70 tracking-wider flex items-center gap-1">
                <MapIcon className="w-2.5 h-2.5" />
                {side === 'light' ? 'САД КОКОНА' : 'ИЗНАНКА'}
              </span>
              <span className="text-[8px] text-white/50 font-mono">{Math.round(player.current.x / TILE)},{Math.round(player.current.y / TILE)}</span>
            </div>
            <canvas ref={miniRef} width={150} height={110} className="block border border-white/15" style={{ imageRendering: 'pixelated' }} />
          </div>

          <div className="mt-1.5 flex gap-1.5 justify-end">
            <button onClick={toggleSound} className="p-1.5 bg-slate-950/75 border-2 border-white/20 text-white/80 hover:text-white hover:bg-slate-900 transition-colors">
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowQuests(v => !v)} className="p-1.5 bg-slate-950/75 border-2 border-white/20 text-white/80 hover:text-white hover:bg-slate-900 transition-colors">
              <ScrollText className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setImmersive(v => !v)} className="p-1.5 bg-slate-950/75 border-2 border-white/20 text-white/80 hover:text-white hover:bg-slate-900 transition-colors">
              {immersive ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* ===== Квесты ===== */}
      {started && showQuests && (
        <div className="absolute top-32 right-3 z-20 w-52 bg-slate-950/75 border-2 border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between px-2 py-1 border-b border-white/15">
            <span className="text-[9px] font-black text-amber-300 tracking-wider">ЗАДАЧИ</span>
            <button onClick={() => setShowQuests(false)} className="text-white/50 hover:text-white"><X className="w-3 h-3" /></button>
          </div>
          <div className="p-2 space-y-1.5">
            {quests.map(q => {
              const done = q.now >= q.total;
              return (
                <div key={q.id} className="flex items-start gap-1.5">
                  <span className={`text-[9px] mt-0.5 ${done ? 'text-emerald-400' : 'text-white/40'}`}>{done ? '✔' : '○'}</span>
                  <div className="flex-1">
                    <div className={`text-[9px] leading-tight font-bold ${done ? 'text-emerald-300 line-through' : 'text-white/85'}`}>{q.text}</div>
                    <div className="h-1 bg-black/50 mt-0.5 border border-white/10">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (q.now / q.total) * 100)}%` }} />
                    </div>
                    <div className="text-[8px] text-white/40 font-mono mt-0.5">{Math.min(q.now, q.total)}/{q.total}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Подсказка взаимодействия ===== */}
      {started && near && !dialogue && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-slate-950/88 border-2 border-white/25 px-4 py-2 backdrop-blur-sm flex items-center gap-3">
            <div>
              <div className="text-[11px] font-black text-white">
                {near.type === 'npc' ? near.npc!.name : near.spot!.title}
              </div>
              <div className="text-[9px] text-white/60">
                {near.type === 'npc' ? 'Поговорить' : near.spot!.sub}
              </div>
            </div>
            <button
              onClick={() => interact(near)}
              className="px-3 py-1.5 bg-white text-slate-900 text-[10px] font-black hover:bg-emerald-200 transition-colors active:scale-95"
            >
              E
            </button>
          </div>
        </div>
      )}

      {/* ===== Диалог ===== */}
      {dialogue && (
        <div className="absolute inset-x-0 bottom-0 z-40 p-3 sm:p-5" onClick={advanceDialogue}>
          <div className="max-w-2xl mx-auto bg-slate-950/92 border-2 border-white/30 backdrop-blur-sm cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border-b border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-black text-amber-300 tracking-wide">{dialogue.npc.name}</span>
            </div>
            <div className="px-4 py-3 min-h-[72px]">
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">{dialogue.shown}<span className="animate-pulse">▌</span></p>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/15">
              <span className="text-[9px] text-white/40 font-mono">{dialogue.idx + 1} / {dialogue.npc.lines.length}</span>
              <span className="text-[9px] text-white/60 font-bold flex items-center gap-1">
                Далее <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== Тост ===== */}
      {toast && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 max-w-sm text-center animate-in fade-in zoom-in-95">
          <div className="bg-slate-950/90 border-2 border-amber-400/60 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-[11px] text-amber-100 font-bold leading-relaxed">{toast}</p>
          </div>
        </div>
      )}

      {/* ===== Низ: сторона мира + прогресс ===== */}
      {started && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
          <div className="bg-slate-950/75 border-2 border-white/20 px-2.5 py-1.5 backdrop-blur-sm flex items-center gap-1.5">
            <Swords className="w-3 h-3 text-rose-300" />
            <span className="text-[9px] font-black text-white/85">
              ТЕНЕЙ ПРИНЯТО {world.defeatedShadows.length}/{SHADOWS.length}
            </span>
          </div>
          <div className="hidden sm:block bg-slate-950/60 border-2 border-white/15 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-[9px] font-mono text-white/50">WASD · SHIFT бег · E действие · Q задачи · N ночь · ESC выход</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {!immersive && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Святилище Кокона
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-black tracking-wide">RPG</span>
            </h3>
            <p className="text-xs text-slate-500">
              Полноценный игровой мир {MAP_W}×{MAP_H} тайлов · камера, коллизии, диалоги, квесты, день и ночь
            </p>
          </div>
          <button
            onClick={() => { setStarted(true); setImmersive(true); }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Играть в полный экран
          </button>
        </div>
      )}

      {immersive
        ? <div className="fixed inset-0 z-50 bg-black">{game}</div>
        : game}

      {battle && (
        <ShadowBattle
          shadow={battle}
          avatar={userProfile.avatar}
          hero={hero}
          onWin={onBattleWin}
          onFlee={() => { setBattle(null); showToast('Вы отступили. Это мудрость, а не поражение.'); }}
        />
      )}

      <BreathingModal isOpen={mBreath} onClose={() => {
        setMBreath(false);
        onHeroChange({ ...hero, calm: Math.min(100, hero.calm + 6), light: hero.light + 4 });
      }} />
      <ReleaseWallModal isOpen={mRelease} onClose={() => {
        setMRelease(false);
        onHeroChange({ ...hero, clarity: Math.min(100, hero.clarity + 5), light: hero.light + 4 });
      }} />
      <SoundPavilionModal isOpen={mSound} onClose={() => setMSound(false)} />
      <WisdomCrystalModal isOpen={mWisdom} onClose={() => {
        setMWisdom(false);
        onHeroChange({ ...hero, clarity: Math.min(100, hero.clarity + 4), light: hero.light + 3 });
      }} />
    </div>
  );
};
