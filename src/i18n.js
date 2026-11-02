import { createI18n } from 'vue-i18n';
import { storage } from './lib/browser.js';
import en from './locales/en.js';
import vi from './locales/vi.js';

export const LOCALES = ['vi', 'en'];
const LOCALE_KEY = 'badminton:locale';

const saved = storage.get(LOCALE_KEY);

export const i18n = createI18n({
  legacy: false,
  locale: LOCALES.includes(saved) ? saved : 'vi',
  fallbackLocale: 'vi',
  messages: { vi, en },
});

// Dùng được cả ngoài component (lib vẽ ảnh, tính tiền, thống kê).
export const t = (...args) => i18n.global.t(...args);
export const currentLocale = () => i18n.global.locale.value;
export const upper = (s) => s.toLocaleUpperCase(currentLocale());

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  storage.set(LOCALE_KEY, locale);
  document.documentElement.lang = locale;
}

document.documentElement.lang = currentLocale();
