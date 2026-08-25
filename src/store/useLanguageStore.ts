import { create } from 'zustand';
import { Language, translations } from '../i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['kh'];
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'kh', // Default Khmer as requested!
  t: translations['kh'],
  setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
  toggleLanguage: () => {
    const nextLang = get().language === 'kh' ? 'en' : 'kh';
    set({ language: nextLang, t: translations[nextLang] });
  },
}));
