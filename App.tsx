import { useState, useEffect } from 'react';
import {
  UserProfile, JournalEntry, EmotionAnalysisResult,
  HeroState, WorldState, DEFAULT_HERO_STATE, DEFAULT_WORLD_STATE
} from './types';
import { loadUserProfile, loadJournalEntries, removeJournalEntry } from './utils/storage';
import { analyzeEmotionalText } from './utils/sentimentAnalyzer';
import { AVATAR_PRESETS } from './data/pixelParts';
import { Header, NavTab } from './components/Header';
import { ZeroFrictionModal } from './components/ZeroFrictionModal';
import { EmotionalDiary } from './components/EmotionalDiary';
import { GameWorld } from './components/GameWorld';
import { EmotionalWave } from './components/EmotionalWave';
import { PersonalCabinet } from './components/PersonalCabinet';
import { ColorMatrixGuide } from './components/ColorMatrixGuide';
import { EmotionWheels } from './components/EmotionWheels';
import { ShieldCheck, Heart } from 'lucide-react';

const HERO_KEY = 'sukaire_hero_state';
const WORLD_KEY = 'sukaire_world_state';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('diary');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const [hero, setHero] = useState<HeroState>(DEFAULT_HERO_STATE);
  const [world, setWorld] = useState<WorldState>(DEFAULT_WORLD_STATE);

  const updateHero = (h: HeroState) => {
    setHero(h);
    try { localStorage.setItem(HERO_KEY, JSON.stringify(h)); } catch { /* ignore */ }
  };
  const updateWorld = (w: WorldState) => {
    setWorld(w);
    try { localStorage.setItem(WORLD_KEY, JSON.stringify(w)); } catch { /* ignore */ }
  };

  // Default initial chromatic analysis
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysisResult>(() => {
    return analyzeEmotionalText('Спокойный вечер, пью чай и чувствую глубокую надежду на завтра.');
  });

  // On mount: check if user exists or show zero-friction modal once
  useEffect(() => {
    const existingProfile = loadUserProfile();
    if (!existingProfile) {
      setIsWelcomeModalOpen(true);
    } else {
      setUserProfile(existingProfile);
    }

    const loadedEntries = loadJournalEntries();
    setEntries(loadedEntries);

    if (loadedEntries.length > 0 && loadedEntries[0].analysis) {
      setCurrentAnalysis(loadedEntries[0].analysis);
    }

    try {
      const h = localStorage.getItem(HERO_KEY);
      if (h) setHero({ ...DEFAULT_HERO_STATE, ...JSON.parse(h) });
      const w = localStorage.getItem(WORLD_KEY);
      if (w) setWorld({ ...DEFAULT_WORLD_STATE, ...JSON.parse(w) });
    } catch { /* ignore */ }
  }, []);

  const handleCompleteWelcome = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsWelcomeModalOpen(false);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = removeJournalEntry(id);
    setEntries(updated);
  };

  const handleSelectEntryForCanvas = (entry: JournalEntry) => {
    setCurrentAnalysis(entry.analysis);
    setCurrentTab('diary');
  };

  // Fallback guest profile while modal is open
  const effectiveProfile: UserProfile = userProfile || {
    nickname: 'Странник',
    avatar: AVATAR_PRESETS[0].cfg,
    auraColor: AVATAR_PRESETS[0].cfg.auraColor,
    realmPreference: 'forest',
    createdAt: Date.now(),
    encryptedKey: 'AES256-CLIENT-INIT'
  };

  return (
    <div
      className="min-h-screen relative flex flex-col selection:bg-slate-800 selection:text-white transition-colors duration-1000 ease-in-out"
      style={{
        background: currentAnalysis.palette.bgGradient
      }}
    >
      {/* Dynamic Animated Ambient Background Aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-3xl opacity-30 transition-all duration-1000"
          style={{ backgroundColor: currentAnalysis.palette.primaryHex }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-3xl opacity-25 transition-all duration-1000"
          style={{ backgroundColor: currentAnalysis.palette.secondaryHex }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full blur-3xl opacity-20 transition-all duration-1000"
          style={{ backgroundColor: currentAnalysis.palette.accentHex }}
        />
      </div>

      {/* Header Navigation */}
      <div className="relative z-40">
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          userProfile={effectiveProfile}
          currentAnalysis={currentAnalysis}
        />
      </div>

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'diary' && (
          <EmotionalDiary
            userProfile={effectiveProfile}
            currentAnalysis={currentAnalysis}
            onAnalysisUpdate={setCurrentAnalysis}
            onNavigateToSanctuary={() => setCurrentTab('sanctuary')}
            onNavigateToTimeline={() => setCurrentTab('timeline')}
            onEntriesChanged={setEntries}
            hero={hero}
            onHeroChange={updateHero}
          />
        )}

        {currentTab === 'sanctuary' && (
          <GameWorld
            userProfile={effectiveProfile}
            currentAnalysis={currentAnalysis}
            hero={hero}
            world={world}
            onHeroChange={updateHero}
            onWorldChange={updateWorld}
          />
        )}

        {currentTab === 'timeline' && (
          <EmotionalWave
            entries={entries}
            onSelectEntry={handleSelectEntryForCanvas}
          />
        )}

        {currentTab === 'cabinet' && (
          <PersonalCabinet
            userProfile={effectiveProfile}
            onUpdateProfile={handleUpdateProfile}
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
            onSelectEntryForCanvas={handleSelectEntryForCanvas}
          />
        )}

        {currentTab === 'matrix' && (
          <div className="flex flex-col gap-6">
            <EmotionWheels />
            <ColorMatrixGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-200/50 bg-white/40 backdrop-blur-md py-6 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Sukaire Chromatica</strong> • Безопасное эмоциональное пространство для учащихся
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              Разработано с заботой <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" /> для студентов и школьников
            </span>
            <span>AES-256 локально</span>
          </div>
        </div>
      </footer>

      {/* Soft First-Time Zero-Friction Registration Modal */}
      <ZeroFrictionModal
        isOpen={isWelcomeModalOpen}
        onComplete={handleCompleteWelcome}
      />
    </div>
  );
}

export default App;
