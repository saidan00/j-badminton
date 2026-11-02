import { currentLocale } from '@/i18n.js';

// 240.000 khi xem tiếng Việt, 240,000 khi xem tiếng Anh.
const formatters = {};
const numberFormat = () => {
  const tag = currentLocale() === 'en' ? 'en-US' : 'vi-VN';
  formatters[tag] ??= new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
  return formatters[tag];
};

export const num = (n) => numberFormat().format(Math.round(n));
export const vnd = (n) => num(n) + 'đ';
export const dec = (n) => String(Math.round(n * 100) / 100);
export const digits = (s) => String(s).replace(/\D/g, '');
export const pct = (r) => Math.round(r * 100) + '%';

export const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
