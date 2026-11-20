import React, { useState } from 'react';
import { UserProfile, JournalEntry } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { PixelCharacterCreator } from './PixelCharacterCreator';
import { PixelAvatarConfig } from '../data/pixelParts';
import { COLOR_MATRIX } from '../data/colorMatrix';
import { exportJournalAsJSON, saveUserProfile } from '../utils/storage';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Search,
  Sliders,
  Check,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface PersonalCabinetProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  onSelectEntryForCanvas: (entry: JournalEntry) => void;
}

export const PersonalCabinet: React.FC<PersonalCabinetProps> = ({
  userProfile,
  onUpdateProfile,
  entries,
  onDeleteEntry,
  onSelectEntryForCanvas
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'avatar' | 'archive' | 'privacy'>('avatar');
  const [nicknameInput, setNicknameInput] = useState(userProfile.nickname);
  const [draftAvatar, setDraftAvatar] = useState<PixelAvatarConfig>(userProfile.avatar);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Archive search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      nickname: nicknameInput.trim() || userProfile.nickname,
      avatar: draftAvatar,
      auraColor: draftAvatar.auraColor
    };
    saveUserProfile(updated);
    onUpdateProfile(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const filteredEntries = entries.filter(e => {
    const matchesQuery =
      e.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      COLOR_MATRIX[e.dominantEmotion]?.nameRu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmotion =
      selectedEmotionFilter === 'all' || e.dominantEmotion === selectedEmotionFilter;
    return matchesQuery && matchesEmotion;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Top Profile & AES-256 Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-1 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs flex items-end">
            <PixelAvatar config={userProfile.avatar} size={64} animate />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                {userProfile.nickname}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Хранитель
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              В Святилище с {new Date(userProfile.createdAt || Date.now()).toLocaleDateString('ru-RU')} • {entries.length} записей в архиве
            </p>
          </div>
        </div>

        {/* Local AES-256 Encryption Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <div className="font-semibold flex items-center gap-1.5">
              <span>Локальное шифрование AES-256</span>
              <Lock className="w-3 h-3 text-emerald-700" />
            </div>
            <span className="text-[10px] text-emerald-700/90 font-mono">
              Ключ: {userProfile.encryptedKey.slice(0, 18)}...
            </span>
          </div>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs w-fit text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveSubTab('avatar')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'avatar' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Конструктор хранителя</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('archive')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'archive' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Архив записей ({entries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('privacy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'privacy' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Приватность и безопасность</span>
        </button>
      </div>

      {/* TAB 1: Pixel Guardian Constructor */}
      {activeSubTab === 'avatar' && (
        <form
          onSubmit={handleSaveProfile}
          className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Имя или никнейм хранителя:
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={e => setNicknameInput(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              {isSavedNotice && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100/70 px-3 py-1.5 rounded-full animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Облик сохранён!</span>
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                Сохранить героя
              </button>
            </div>
          </div>

          <PixelCharacterCreator value={draftAvatar} onChange={setDraftAvatar} />
        </form>
      )}

      {/* TAB 2: Archive of Past Entries */}
      {activeSubTab === 'archive' && (
        <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm space-y-4">
          {/* Controls: Search, Filter, Export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по заметкам..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedEmotionFilter}
                onChange={e => setSelectedEmotionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">Все эмоции</option>
                {Object.entries(COLOR_MATRIX).map(([k, v]) => (
                  <option key={k} value={k}>{v.nameRu}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={exportJournalAsJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                title="Скачать резервную копию дневника"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Экспорт JSON</span>
              </button>
            </div>
          </div>

          {/* Entry Cards List */}
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Записей не найдено. Напишите о своих чувствах в Дневнике на главном экране!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEntries.map(entry => {
                const palette = COLOR_MATRIX[entry.dominantEmotion] || COLOR_MATRIX.calm;
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: palette.primaryHex }}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {palette.nameRu}
                          </span>
                          {entry.secondaryEmotion && (
                            <span className="text-[10px] text-slate-500">
                              + {COLOR_MATRIX[entry.secondaryEmotion]?.nameRu}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {entry.dateString}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed mb-3">
                        «{entry.rawText}»
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => onSelectEntryForCanvas(entry)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Окрасить холст</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          Тонус: <strong className="text-slate-600">{entry.toneScore}/10</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 rounded text-slate-300 hover:text-rose-500 transition-colors"
                          title="Удалить запись"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Privacy & Security Details */}
      {activeSubTab === 'privacy' && (
        <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950 text-xs leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900 mb-1">
                Локальная изоляция данных (Zero-Server Architecture)
              </h4>
              <p>
                Платформа Sukaire разработана с учетом высокой уязвимости подростков и студентов. Мы не собираем электронные почты, телефонные номера или реальные ФИО. Все ваши личные мысли, аудиозаписи и эмоциональные карточки обрабатываются исключительно на вашем собственном устройстве в браузере.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>AES-256 Signature</span>
              </div>
              <p className="text-slate-500">
                Каждая запись подписывается уникальным криптографическим хэшем вашей локальной сессии.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Никаких трекеров</span>
              </div>
              <p className="text-slate-500">
                На сайте нет рекламных пикселей, внешних систем слежения или продажи данных третьим лицам.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Полный контроль</span>
              </div>
              <p className="text-slate-500">
                Вы можете в любой момент выгрузить весь свой архив в JSON или стереть его одним кликом.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
