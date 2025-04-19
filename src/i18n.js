import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

// Çevirileri içeren kaynaklar
const resources = {
  en: {
    translation: translationEN
  },
  tr: {
    translation: translationTR
  }
};

i18n
  // Dil algılama modülünü kullan
  .use(LanguageDetector)
  // React i18next modülünü başlat
  .use(initReactI18next)
  // i18next'i başlat
  .init({
    resources,
    fallbackLng: 'tr', // Varsayılan dil
    debug: true,
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
