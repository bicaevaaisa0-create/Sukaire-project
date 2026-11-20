export type EmotionKey =
  | 'calm' // Спокойствие
  | 'hope' // Надежда
  | 'calm_hope' // Спокойствие + Надежда
  | 'joy' // Радость
  | 'love' // Любовь / Нежность
  | 'resolve' // Решимость / Уверенность
  | 'sadness' // Печаль / Грусть
  | 'burnout' // Депрессия / Выгорание
  | 'anxiety' // Тревога
  | 'uncertainty' // Неуверенность
  | 'reboot'; // Перезагрузка

export interface ColorDefinition {
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  bgGradient: string;
  textColor: string;
  particleColor: string;
  grainIntensity: number; // 0 to 1
  blurAmount: string;
  nameRu: string;
  primaryColorsRu: string;
  undertonesRu: string;
  saturationRu: string;
  atmosphereRu: string;
  promptExample: string;
  kazakhSymbolism?: string;
  chineseSymbolism?: string;
}

export interface EmotionAnalysisResult {
  dominantEmotion: EmotionKey;
  secondaryEmotion?: EmotionKey;
  dominantRatio: number; // e.g. 0.65 (65%)
  secondaryRatio: number; // e.g. 0.35 (35%)
  toneScore: number; // 1 to 10 scale of energetic tone
  intensity: 'low' | 'medium' | 'high';
  palette: ColorDefinition;
  summaryTitle: string;
  psychologicalValidation: string;
  groundingExercise: string;
  culturalNote: string;
  recommendedRealm: 'forest' | 'cosmic' | 'steppe';
  /** id эмоций из Atlas of the Heart (87) */
  atlas?: string[];
  /** id лепестков колеса Плутчика */
  plutchik?: string[];
  /** id стихии У-син */
  wuxing?: string;
  /** id японской концепции */
  japanese?: string;
}

/** Состояние героя — меняется от действий в дневнике и битв с Тенями */
export interface HeroState {
  energy: number;    // 0..100 — ресурс тела
  calm: number;      // 0..100 — устойчивость нервной системы
  courage: number;   // 0..100 — готовность встречать Тени
  clarity: number;   // 0..100 — ясность мышления
  light: number;     // накопленный «свет» — валюта мира
  level: number;
  xp: number;
}

export const DEFAULT_HERO_STATE: HeroState = {
  energy: 55, calm: 50, courage: 45, clarity: 50, light: 0, level: 1, xp: 0
};

/** Прогресс мира: какие Тени побеждены, какие области открыты */
export interface WorldState {
  defeatedShadows: string[];
  visitedZones: string[];
  side: 'light' | 'shadow';
  talkedNpcs?: string[];
  usedSpots?: string[];
}

export const DEFAULT_WORLD_STATE: WorldState = {
  defeatedShadows: [],
  visitedZones: ['light'],
  side: 'light',
  talkedNpcs: [],
  usedSpots: []
};

export interface JournalEntry {
  id: string;
  timestamp: number;
  dateString: string;
  rawText: string;
  dominantEmotion: EmotionKey;
  secondaryEmotion?: EmotionKey;
  toneScore: number;
  analysis: EmotionAnalysisResult;
  isVoiceInput?: boolean;
}

import type { PixelAvatarConfig } from '../data/pixelParts';

export interface UserProfile {
  nickname: string;
  avatar: PixelAvatarConfig;
  auraColor: string;
  realmPreference: 'forest' | 'cosmic' | 'steppe';
  createdAt: number;
  encryptedKey: string;
}

export type SanctuaryRealm = 'forest' | 'cosmic' | 'steppe';

export interface Hotspot {
  id: 'breathing_stone' | 'release_wall' | 'sound_pavilion' | 'wisdom_crystal';
  x: number;
  y: number;
  radius: number;
  label: string;
  sublabel: string;
  icon: string;
}

export interface RPGPlayerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
}
