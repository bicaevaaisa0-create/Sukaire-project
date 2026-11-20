import React, { useState } from 'react';
import { UserProfile, EmotionAnalysisResult, JournalEntry, HeroState } from '../types';
import { HeroActionsPanel } from './HeroActionsPanel';
import { VoiceWaveRecorder } from './VoiceWaveRecorder';
import { PixelAvatar } from './PixelAvatar';
import { GenerativeArtworkCanvas } from './GenerativeArtworkCanvas';
import { BreathingModal } from './BreathingModal';
import { ReleaseWallModal } from './ReleaseWallModal';
import { analyzeEmotionalText } from '../utils/sentimentAnalyzer';
import { addJournalEntry } from '../utils/storage';
import {
  Sparkles,
  Send,
  Heart,
  Compass,
  Wind,
  CheckCircle2,
  Share2,
  RefreshCw
} from 'lucide-react';

interface EmotionalDiaryProps {
  userProfile: UserProfile;
  currentAnalysis: EmotionAnalysisResult;
  onAnalysisUpdate: (res: EmotionAnalysisResult) => void;
  onNavigateToSanctuary: () => void;
  onNavigateToTimeline: () => void;
  onEntriesChanged: (entries: JournalEntry[]) => void;
  hero: HeroState;
  onHeroChange: (h: HeroState) => void;
}

const QUICK_PROMPTS = [
  'Сессия и дедлайны: нарастает тревога, боюсь не справиться',
  'Полное опустошение и выгорание, просто нет сил двигаться',
  'Устал, но внутри есть тихая надежда, что завтра все наладится',
  'Тихий уютный вечер, пью чай и чувствую глубокое спокойствие',
  'Радость от маленькой победы, тепло на душе'
];

export const EmotionalDiary: React.FC<EmotionalDiaryProps> = ({
  userProfile,
  currentAnalysis,
  onAnalysisUpdate,
  onNavigateToSanctuary,
  onEntriesChanged,
  hero,
  onHeroChange
}) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [justRecordedVoice, setJustRecordedVoice] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

  const handleSubmitAnalysis = (textToAnalyze?: string) => {
    const targetText = (textToAnalyze ?? inputText).trim();
    if (!targetText) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const result = analyzeEmotionalText(targetText);
      onAnalysisUpdate(result);

      // Create new journal entry
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        timestamp: Date.now(),
        dateString: 'Только что',
        rawText: targetText,
        dominantEmotion: result.dominantEmotion,
        secondaryEmotion: result.secondaryEmotion,
        toneScore: result.toneScore,
        analysis: result,
        isVoiceInput: justRecordedVoice
      };

      const updated = addJournalEntry(newEntry);
      onEntriesChanged(updated);

      setIsAnalyzing(false);
      setJustRecordedVoice(false);
    }, 450);
  };

  const handleVoiceTranscript = (text: string, voiceMetrics?: { pitchMean: number }) => {
    setInputText(text);
    setJustRecordedVoice(true);
    // Instant live analysis on voice completion
    const result = analyzeEmotionalText(text, voiceMetrics);
    onAnalysisUpdate(result);

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      timestamp: Date.now(),
      dateString: 'Голосовая запись',
      rawText: text,
      dominantEmotion: result.dominantEmotion,
      secondaryEmotion: result.secondaryEmotion,
      toneScore: result.toneScore,
      analysis: result,
      isVoiceInput: true
    };
    const updated = addJournalEntry(newEntry);
    onEntriesChanged(updated);
  };

  const handleSharePalette = () => {
    navigator.clipboard.writeText(
      `Моя палитра Sukaire: ${currentAnalysis.summaryTitle} (${currentAnalysis.palette.primaryColorsRu}). Тонус: ${currentAnalysis.toneScore}/10.`
    );
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Main Emotional Release Workspace (Zero Fluff, immediate diary) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-sm relative overflow-hidden">
        {/* Subtle glow orb in corner */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentAnalysis.palette.primaryHex }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-end gap-3">
            <div className="hidden sm:block shrink-0">
              <PixelAvatar
                config={userProfile.avatar}
                auraOverride={currentAnalysis.palette.primaryHex}
                size={78}
                animate
                shadow
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentAnalysis.palette.primaryHex }}
                />
                <span>Интерактивный дневник эмоций • {userProfile.nickname}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Мгновенный выплеск чувств
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ваш хранитель рядом и слушает — он не оценивает и не ставит диагнозов.
              </p>
            </div>
          </div>

          {/* Quick Voice Input Button */}
          <VoiceWaveRecorder
            onTranscriptRecorded={handleVoiceTranscript}
            accentColor={currentAnalysis.palette.primaryHex}
          />
        </div>

        {/* Text Area */}
        <div className="relative z-10 my-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={4}
            placeholder="Выплесните всё, что накопилось: усталость от учебы, ссору с близким, тяжелый страх зачета или робкую надежду... Здесь вас никто не судит."
            className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white resize-none transition-all shadow-xs leading-relaxed"
          />

          {/* Quick Prompts Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Быстрый выплеск:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(prompt);
                  handleSubmitAnalysis(prompt);
                }}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-all text-left truncate max-w-xs shadow-2xs"
              >
                {prompt.slice(0, 34)}...
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            {inputText.length > 0 && `Символов: ${inputText.length}`}
          </div>

          <div className="flex items-center gap-3">
            {inputText.trim() && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Очистить
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmitAnalysis()}
              disabled={!inputText.trim() || isAnalyzing}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Анализ хроматики...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Окрасить страницу</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chromatic Response & Psychological Grounding Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Generative Digital Artwork Canvas */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  Цифровой холст эмоции
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSharePalette}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                title="Скопировать описание палитры"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copyNotice ? 'Скопировано!' : 'Поделиться'}</span>
              </button>
            </div>

            <GenerativeArtworkCanvas
              analysis={currentAnalysis}
              width={520}
              height={320}
              showCardDetails={true}
            />

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Эмоциональный тонус: <strong>{currentAnalysis.toneScore} / 10</strong></span>
              <span className="capitalize">{currentAnalysis.intensity === 'high' ? 'Высокая интенсивность' : currentAnalysis.intensity === 'low' ? 'Мягкий фон' : 'Умеренный ритм'}</span>
            </div>
          </div>
        </div>

        {/* Right: Psychological Validation & Grounding Insights */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm flex flex-col justify-between flex-1">
            <div>
              {/* Emotion Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full shadow-xs"
                  style={{ backgroundColor: currentAnalysis.palette.primaryHex }}
                />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Психологический отклик • {currentAnalysis.palette.nameRu}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                {currentAnalysis.summaryTitle}
              </h3>

              {/* Empathetic Validation */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                {currentAnalysis.psychologicalValidation}
              </p>

              {/* Micro-Grounding Exercise */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-950 mb-4">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>Микро-практика заземления прямо сейчас:</span>
                </div>
                <p className="leading-relaxed">
                  {currentAnalysis.groundingExercise}
                </p>
              </div>

              {/* Cultural Symbolism Note */}
              <div className="text-[11px] text-slate-500 italic bg-amber-50/60 p-3 rounded-xl border border-amber-100/70 mb-4">
                {currentAnalysis.culturalNote}
              </div>
            </div>

            {/* Direct Interactive Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBreathingOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Дыхание 4-7-8</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReleaseOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-100/80 hover:bg-indigo-200 text-indigo-800 text-xs font-semibold transition-colors"
              >
                <Wind className="w-3.5 h-3.5 text-indigo-600" />
                <span>Стена выплеска</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToSanctuary}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors ml-auto"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Войти в 3D Святилище</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RPG-действия + распознанные тонкие эмоции */}
      <HeroActionsPanel
        hero={hero}
        analysis={currentAnalysis}
        onHeroChange={onHeroChange}
        onGoToWorld={onNavigateToSanctuary}
      />

      {/* Modals triggered from diary shortcuts */}
      <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
      <ReleaseWallModal isOpen={isReleaseOpen} onClose={() => setIsReleaseOpen(false)} />
    </div>
  );
};
