import React, { useState } from 'react';
import { X, Volume2, VolumeX, Wind, CloudRain, Sparkles, Waves } from 'lucide-react';
import { audioEngine } from '../utils/audioSynthesizer';

interface SoundPavilionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrackState {
  id: 'wind' | 'rain' | 'ambient' | 'waves';
  name: string;
  sub: string;
  icon: React.ReactNode;
  active: boolean;
  volume: number;
}

export const SoundPavilionModal: React.FC<SoundPavilionModalProps> = ({ isOpen, onClose }) => {
  const [tracks, setTracks] = useState<TrackState[]>([
    {
      id: 'wind',
      name: 'Степной ветер',
      sub: 'Мягкий ковыльный шелест просторов Казахстана',
      icon: <Wind className="w-5 h-5 text-sky-500" />,
      active: false,
      volume: 0.4
    },
    {
      id: 'rain',
      name: 'Дождь в шалфейном саду',
      sub: 'Мягкие капли по листьям, уносящие суету',
      icon: <CloudRain className="w-5 h-5 text-emerald-500" />,
      active: false,
      volume: 0.35
    },
    {
      id: 'ambient',
      name: 'Эмбиент Кокона (Y2K)',
      sub: 'Теплые гармонические синусоиды покоя',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      active: false,
      volume: 0.3
    },
    {
      id: 'waves',
      name: 'Морской прибой',
      sub: 'Размеренное дыхание спокойного океана',
      icon: <Waves className="w-5 h-5 text-indigo-500" />,
      active: false,
      volume: 0.35
    }
  ]);

  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  const toggleTrack = (id: TrackState['id']) => {
    setTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextActive = !t.active;
          if (nextActive) {
            if (id === 'wind') audioEngine.playWind(t.volume);
            if (id === 'rain') audioEngine.playRain(t.volume);
            if (id === 'ambient') audioEngine.playAmbientPad(t.volume);
            if (id === 'waves') audioEngine.playWaves(t.volume);
          } else {
            if (id === 'wind') audioEngine.stopWind();
            if (id === 'rain') audioEngine.stopRain();
            if (id === 'ambient') audioEngine.stopAmbientPad();
            if (id === 'waves') audioEngine.stopWaves();
          }
          return { ...t, active: nextActive };
        }
        return t;
      })
    );
  };

  const handleVolumeChange = (id: TrackState['id'], newVol: number) => {
    setTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          if (t.active) {
            if (id === 'wind') audioEngine.playWind(newVol);
            if (id === 'rain') audioEngine.playRain(newVol);
            if (id === 'ambient') audioEngine.playAmbientPad(newVol);
            if (id === 'waves') audioEngine.playWaves(newVol);
          }
          return { ...t, volume: newVol };
        }
        return t;
      })
    );
  };

  const handleMasterToggle = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleMasterChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  const handleStopAll = () => {
    audioEngine.stopAll();
    setTracks(prev => prev.map(t => ({ ...t, active: false })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Акустическая Зона • Природный Микшер
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-2">
            Эмбиент-Звуки Заземления
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Звуки генерируются в реальном времени веб-синтезатором, создавая безопасный акустический кокон вокруг вас.
          </p>
        </div>

        {/* Master controls */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 mb-5 text-xs text-slate-600">
          <button
            onClick={handleMasterToggle}
            className="flex items-center gap-2 font-medium hover:text-slate-900 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
            <span>{isMuted ? 'Звук выключен' : 'Общая громкость'}</span>
          </button>
          <div className="flex items-center gap-3 w-44">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : masterVolume}
              onChange={e => handleMasterChange(parseFloat(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-3">
          {tracks.map(t => (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                t.active
                  ? 'bg-white border-sky-300 shadow-sm ring-2 ring-sky-100'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                    {t.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.sub}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTrack(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    t.active
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {t.active ? 'Играет' : 'Включить'}
                </button>
              </div>

              {t.active && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Громкость:</span>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={t.volume}
                    onChange={e => handleVolumeChange(t.id, parseFloat(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <span className="text-[11px] text-slate-500 font-mono w-8 text-right">
                    {Math.round(t.volume * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleStopAll}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            Остановить все звуки
          </button>
          <span className="text-[11px] text-slate-400">
            Работает в фоне при переходе между вкладками
          </span>
        </div>
      </div>
    </div>
  );
};
