import { JournalEntry, UserProfile, EmotionKey } from '../types';
import { INITIAL_ARCHIVE_ENTRIES } from '../data/colorMatrix';
import { analyzeEmotionalText } from './sentimentAnalyzer';
import { AVATAR_PRESETS } from '../data/pixelParts';

const USER_STORAGE_KEY = 'sukaire_user_profile';
const ENTRIES_STORAGE_KEY = 'sukaire_journal_entries';

// Generate a random AES-256 representation key for client verification
export function generateLocalEncryptionKey(): string {
  const chars = '0123456789ABCDEF';
  let key = 'AES256-';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
    if (i % 8 === 7 && i !== 31) key += '-';
  }
  return key;
}

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Migration: old profiles stored abstract archetypes instead of pixel avatars
    if (!parsed || typeof parsed !== 'object' || !parsed.avatar || !parsed.avatar.hairStyle) {
      return {
        nickname: parsed?.nickname || 'Странник',
        avatar: { ...AVATAR_PRESETS[0].cfg },
        auraColor: parsed?.auraColor || AVATAR_PRESETS[0].cfg.auraColor,
        realmPreference: parsed?.realmPreference || 'forest',
        createdAt: parsed?.createdAt || Date.now(),
        encryptedKey: parsed?.encryptedKey || generateLocalEncryptionKey()
      };
    }

    return parsed as UserProfile;
  } catch (e) {
    console.error('Failed to parse user profile', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load journal entries', e);
  }

  // Prepopulate with initial entries so the timeline is beautiful on first load
  const initialData: JournalEntry[] = INITIAL_ARCHIVE_ENTRIES.map(item => {
    const analysis = analyzeEmotionalText(item.rawText);
    return {
      id: item.id,
      timestamp: item.timestamp,
      dateString: item.dateString,
      rawText: item.rawText,
      dominantEmotion: item.dominantEmotion as EmotionKey,
      secondaryEmotion: item.secondaryEmotion as EmotionKey,
      toneScore: item.toneScore,
      analysis: analysis,
      isVoiceInput: false
    };
  });

  saveJournalEntries(initialData);
  return initialData;
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save journal entries', e);
  }
}

export function addJournalEntry(entry: JournalEntry): JournalEntry[] {
  const current = loadJournalEntries();
  const updated = [entry, ...current];
  saveJournalEntries(updated);
  return updated;
}

export function removeJournalEntry(id: string): JournalEntry[] {
  const current = loadJournalEntries();
  const updated = current.filter(e => e.id !== id);
  saveJournalEntries(updated);
  return updated;
}

export function exportJournalAsJSON(): void {
  const entries = loadJournalEntries();
  const profile = loadUserProfile();
  const data = {
    app: 'Sukaire Emotion Chromatica',
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    profile,
    entries
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sukaire-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
