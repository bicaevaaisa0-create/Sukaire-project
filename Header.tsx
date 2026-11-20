import React from 'react';
import { UserProfile, EmotionAnalysisResult } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { audioEngine } from '../utils/audioSynthesizer';
import {
  PenLine,
  Compass,
  TrendingUp,
  User,
  Palette,
  Volume2,
  VolumeX,
  Lock,
  Sparkles
} from 'lucide-react';

export type NavTab = 'diary' | 'sanctuary' | 'timeline' | 'cabinet' | 'matrix';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userProfile: UserProfile;
  currentAnalysis: EmotionAnalysisResult;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  userProfile,
  currentAnalysis
}) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const handleToggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'diary', label: 'Дневник', icon: <PenLine className="w-4 h-4" /> },
    { id: 'sanctuary', label: 'Мой Мир', icon: <Compass className="w-4 h-4" /> },
    { id: 'timeline', label: 'Волна тонуса', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cabinet', label: 'Кабинет', icon: <User className="w-4 h-4" /> },
    { id: 'matrix', label: 'Атлас эмоций', icon: <Palette className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-2xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Concept */}
        <div
          onClick={() => onTabChange('diary')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 border border-white/80"
              style={{
                background: `linear-gradient(135deg, ${currentAnalysis.palette.primaryHex}, ${currentAnalysis.palette.secondaryHex})`
              }}
            >
              <Sparkles className="w-4 h-4 text-slate-800" />
            </div>
            <div
              className="absolute -inset-1 rounded-2xl blur-xs opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none"
              style={{ backgroundColor: currentAnalysis.palette.primaryHex }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Sukaire
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                Chromatica
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              эмоциональная хроматика и святилище
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-xs font-semibold">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Включить эмбиент' : 'Выключить звук'}
            className="p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Local AES Status Pill */}
          <div
            title="Локальное шифрование AES-256 активно"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/70 select-none"
          >
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Локально</span>
          </div>

          {/* User Avatar Button */}
          <button
            type="button"
            onClick={() => onTabChange('cabinet')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-slate-100/80 hover:bg-slate-200 border border-slate-200/60 transition-all text-xs font-medium text-slate-700"
          >
            <PixelAvatar
              config={userProfile.avatar}
              size={28}
              crop="head"
              animate={false}
              showAura={false}
            />
            <span className="max-w-[80px] truncate">{userProfile.nickname}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-white/95 overflow-x-auto text-[11px] font-semibold text-slate-600">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
