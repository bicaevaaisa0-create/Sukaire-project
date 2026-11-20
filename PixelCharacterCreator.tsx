import React, { useState } from 'react';
import {
  PixelAvatarConfig,
  AVATAR_PRESETS,
  HAIR_STYLES,
  EYE_STYLES,
  OUTFITS,
  CLOAKS,
  ACCESSORIES,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTH_COLORS,
  AURA_COLORS,
  randomAvatar
} from '../data/pixelParts';
import { PixelAvatar } from './PixelAvatar';
import { Dices, Shirt, Scissors, Eye, Shield, Crown, Palette, Users, Check } from 'lucide-react';

interface PixelCharacterCreatorProps {
  value: PixelAvatarConfig;
  onChange: (cfg: PixelAvatarConfig) => void;
  compact?: boolean;
}

type Section = 'presets' | 'hair' | 'face' | 'outfit' | 'cloak' | 'accessory' | 'colors';

const SECTIONS: { id: Section; name: string; icon: React.ReactNode }[] = [
  { id: 'presets', name: 'Готовые', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'hair', name: 'Волосы', icon: <Scissors className="w-3.5 h-3.5" /> },
  { id: 'face', name: 'Лицо', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'outfit', name: 'Одежда', icon: <Shirt className="w-3.5 h-3.5" /> },
  { id: 'cloak', name: 'Плащи', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'accessory', name: 'Аксессуары', icon: <Crown className="w-3.5 h-3.5" /> },
  { id: 'colors', name: 'Цвета', icon: <Palette className="w-3.5 h-3.5" /> }
];

const Swatches: React.FC<{
  label: string;
  colors: { name: string; hex: string }[];
  active: string;
  onPick: (hex: string) => void;
}> = ({ label, colors, active, onPick }) => (
  <div>
    <div className="text-[11px] font-semibold text-slate-600 mb-1.5">{label}</div>
    <div className="flex flex-wrap gap-1.5">
      {colors.map(c => (
        <button
          key={c.hex + label}
          type="button"
          title={c.name}
          onClick={() => onPick(c.hex)}
          className={`w-6 h-6 rounded-md border transition-transform ${
            active === c.hex
              ? 'border-slate-900 scale-110 shadow-sm ring-1 ring-slate-300'
              : 'border-slate-200 hover:scale-105'
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  </div>
);

export const PixelCharacterCreator: React.FC<PixelCharacterCreatorProps> = ({
  value,
  onChange,
  compact = false
}) => {
  const [section, setSection] = useState<Section>('presets');

  const set = (patch: Partial<PixelAvatarConfig>) => onChange({ ...value, ...patch });

  const OptionGrid: React.FC<{
    items: { id: string; name: string }[];
    activeId: string;
    onPick: (id: string) => void;
    preview: (id: string) => PixelAvatarConfig;
  }> = ({ items, activeId, onPick, preview }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      {items.map(item => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.id)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
              isActive
                ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="h-16 flex items-end justify-center overflow-hidden">
              <PixelAvatar config={preview(item.id)} size={62} animate={false} showAura={false} />
            </div>
            <span className="text-[10px] font-medium text-slate-700 leading-tight text-center">
              {item.name}
            </span>
            {isActive && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-12'} gap-4`}>
      {/* Live preview */}
      <div className={compact ? '' : 'lg:col-span-4'}>
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 flex flex-col items-center">
          <div className="relative flex items-end justify-center h-40 w-full rounded-xl bg-[repeating-conic-gradient(#F1F5F9_0%_25%,#FFFFFF_0%_50%)] bg-[length:16px_16px] border border-slate-100 overflow-hidden">
            <div className="pb-3">
              <PixelAvatar config={value} size={132} animate shadow />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 w-full">
            <button
              type="button"
              onClick={() => onChange(randomAvatar())}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Случайный герой</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, auraColor: AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)].hex })}
              title="Сменить свечение"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center leading-relaxed">
            Более 40 000 000 комбинаций: 15 причёсок · 8 взглядов · 12 нарядов · 7 плащей · 14 аксессуаров · 20 цветов тканей
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className={compact ? '' : 'lg:col-span-8'}>
        {/* Section tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 mb-3">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                section === s.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s.icon}
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 max-h-[420px] overflow-y-auto">
          {section === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {AVATAR_PRESETS.map(p => {
                const isActive = JSON.stringify(p.cfg) === JSON.stringify(value);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ ...p.cfg })}
                    className={`relative flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-300'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className="w-full h-24 rounded-xl flex items-end justify-center overflow-hidden mb-1.5"
                      style={{ background: `linear-gradient(180deg, ${p.cfg.auraColor}22, #ffffff)` }}
                    >
                      <PixelAvatar config={p.cfg} size={92} animate={false} showAura={false} shadow />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight text-center">
                      {p.name}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">
                      {p.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {section === 'hair' && (
            <div className="space-y-4">
              <OptionGrid
                items={HAIR_STYLES.map(h => ({ id: h.id, name: h.name }))}
                activeId={value.hairStyle}
                onPick={id => set({ hairStyle: id })}
                preview={id => ({ ...value, hairStyle: id, cloak: value.cloak === 'hood' ? 'none' : value.cloak, accessory: 'none' })}
              />
              <Swatches label="Цвет волос" colors={HAIR_COLORS} active={value.hairColor} onPick={hex => set({ hairColor: hex })} />
            </div>
          )}

          {section === 'face' && (
            <div className="space-y-4">
              <OptionGrid
                items={EYE_STYLES.map(e => ({ id: e.id, name: e.name }))}
                activeId={value.eyes}
                onPick={id => set({ eyes: id })}
                preview={id => ({ ...value, eyes: id, cloak: value.cloak === 'hood' ? 'none' : value.cloak })}
              />
              <Swatches label="Тон кожи" colors={SKIN_TONES} active={value.skin} onPick={hex => set({ skin: hex })} />
            </div>
          )}

          {section === 'outfit' && (
            <div className="space-y-4">
              <OptionGrid
                items={OUTFITS.map(o => ({ id: o.id, name: o.name }))}
                activeId={value.outfit}
                onPick={id => set({ outfit: id })}
                preview={id => ({ ...value, outfit: id, cloak: 'none' })}
              />
              <Swatches label="Основная ткань" colors={CLOTH_COLORS} active={value.outfitPrimary} onPick={hex => set({ outfitPrimary: hex })} />
              <Swatches label="Второй цвет / детали" colors={CLOTH_COLORS} active={value.outfitSecondary} onPick={hex => set({ outfitSecondary: hex })} />
              <Swatches label="Обувь" colors={CLOTH_COLORS} active={value.shoeColor} onPick={hex => set({ shoeColor: hex })} />
            </div>
          )}

          {section === 'cloak' && (
            <div className="space-y-4">
              <OptionGrid
                items={CLOAKS.map(c => ({ id: c.id, name: c.name }))}
                activeId={value.cloak}
                onPick={id => set({ cloak: id })}
                preview={id => ({ ...value, cloak: id })}
              />
              <Swatches label="Цвет плаща" colors={CLOTH_COLORS} active={value.cloakColor} onPick={hex => set({ cloakColor: hex })} />
            </div>
          )}

          {section === 'accessory' && (
            <div className="space-y-4">
              <OptionGrid
                items={ACCESSORIES.map(a => ({ id: a.id, name: a.name }))}
                activeId={value.accessory}
                onPick={id => set({ accessory: id })}
                preview={id => ({ ...value, accessory: id, cloak: value.cloak === 'hood' ? 'none' : value.cloak })}
              />
              <Swatches label="Цвет аксессуара" colors={CLOTH_COLORS} active={value.accessoryColor} onPick={hex => set({ accessoryColor: hex })} />
            </div>
          )}

          {section === 'colors' && (
            <div className="space-y-4">
              <Swatches label="Свечение ауры хранителя" colors={AURA_COLORS} active={value.auraColor} onPick={hex => set({ auraColor: hex })} />
              <Swatches label="Тон кожи" colors={SKIN_TONES} active={value.skin} onPick={hex => set({ skin: hex })} />
              <Swatches label="Цвет волос" colors={HAIR_COLORS} active={value.hairColor} onPick={hex => set({ hairColor: hex })} />
              <Swatches label="Основная ткань" colors={CLOTH_COLORS} active={value.outfitPrimary} onPick={hex => set({ outfitPrimary: hex })} />
              <Swatches label="Второй цвет" colors={CLOTH_COLORS} active={value.outfitSecondary} onPick={hex => set({ outfitSecondary: hex })} />
              <Swatches label="Плащ" colors={CLOTH_COLORS} active={value.cloakColor} onPick={hex => set({ cloakColor: hex })} />
              <Swatches label="Аксессуар" colors={CLOTH_COLORS} active={value.accessoryColor} onPick={hex => set({ accessoryColor: hex })} />
              <Swatches label="Обувь" colors={CLOTH_COLORS} active={value.shoeColor} onPick={hex => set({ shoeColor: hex })} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
