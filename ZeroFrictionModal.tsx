import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { PixelCharacterCreator } from './PixelCharacterCreator';
import { AVATAR_PRESETS, PixelAvatarConfig, randomAvatar } from '../data/pixelParts';
import { generateLocalEncryptionKey, saveUserProfile } from '../utils/storage';
import { Sparkles, ShieldCheck, ArrowRight, Dices, Wand2, ChevronLeft } from 'lucide-react';

interface ZeroFrictionModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

const DEFAULT_NICKNAMES = [
  'Странник_Ветра', 'Шалфейная_Звезда', 'Тихий_Бриз', 'Небесный_Путь',
  'Лавандовый_Импульс', 'Солнечный_Росток', 'Тенгри_Бриз', 'Акварельный_Кот',
  'Ночной_Мотылёк', 'Мятный_Лис'
];

export const ZeroFrictionModal: React.FC<ZeroFrictionModalProps> = ({ isOpen, onComplete }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<PixelAvatarConfig>(AVATAR_PRESETS[0].cfg);
  const [showFullCreator, setShowFullCreator] = useState(false);

  if (!isOpen) return null;

  const handleRandomizeNickname = () => {
    setNickname(DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)]);
  };

  const handleFinish = (isSkipped: boolean = false) => {
    const finalNickname = nickname.trim()
      ? nickname.trim()
      : isSkipped
        ? 'Тихий_Гость'
        : DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)];

    const newProfile: UserProfile = {
      nickname: finalNickname,
      avatar,
      auraColor: avatar.auraColor,
      realmPreference: 'forest',
      createdAt: Date.now(),
      encryptedKey: generateLocalEncryptionKey()
    };

    saveUserProfile(newProfile);
    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className={`relative w-full ${showFullCreator ? 'max-w-4xl' : 'max-w-2xl'} my-auto overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl p-5 sm:p-7 text-slate-800 transition-all`}>
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none transition-colors duration-500"
          style={{ background: avatar.auraColor }}
        />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-25 bg-emerald-200 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-xs font-medium text-slate-600 mb-2 border border-slate-200/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Добро пожаловать в Sukaire</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Создайте своего пиксельного хранителя
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Никаких паролей и почты — только никнейм и герой, который будет ходить с вами по Святилищу. Окно появляется один раз.
          </p>
        </div>

        {showFullCreator ? (
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => setShowFullCreator(false)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Назад к быстрому выбору</span>
            </button>
            <PixelCharacterCreator value={avatar} onChange={setAvatar} />
          </div>
        ) : (
          <div className="relative z-10">
            {/* Big preview */}
            <div className="flex items-end justify-center h-40 mb-3">
              <PixelAvatar config={avatar} size={148} animate shadow />
            </div>

            {/* Preset gallery */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Выберите героя ({AVATAR_PRESETS.length} готовых)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatar(randomAvatar())}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Случайно</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFullCreator(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Полный конструктор</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-1">
                {AVATAR_PRESETS.map(p => {
                  const isActive = JSON.stringify(p.cfg) === JSON.stringify(avatar);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      onClick={() => setAvatar({ ...p.cfg })}
                      className={`flex flex-col items-center p-1 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-300'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="h-16 flex items-end">
                        <PixelAvatar config={p.cfg} size={62} animate={false} showAura={false} />
                      </div>
                      <span className="text-[8.5px] font-medium text-slate-600 leading-tight text-center truncate w-full">
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Nickname */}
        <div className="relative z-10 mt-4 mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Как к вам обращаться в пространстве?
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Введите никнейм (например, Шалфей или Кай)..."
              maxLength={24}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={handleRandomizeNickname}
              title="Случайный никнейм"
              className="absolute right-2 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs mb-5">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Полная анонимность:</strong> записи шифруются локально (AES-256) в этом браузере и не уходят во внешнюю сеть.
          </span>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={() => handleFinish(false)}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <span>Войти в Святилище</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs sm:text-sm transition-all"
          >
            Пропустить и попробовать
          </button>
        </div>
      </div>
    </div>
  );
};
