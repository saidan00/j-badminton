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

// Ngày chơi in trên bill: "Thứ Hai, 16/11/2026" / "Mon 16 Nov 2026".
const dayFormats = {};
export function fmtDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const en = currentLocale() === 'en';
  const tag = en ? 'en-GB' : 'vi-VN';
  dayFormats[tag] ??= new Intl.DateTimeFormat(tag, en
    ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
    : { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  return dayFormats[tag].format(new Date(y, m - 1, d));
}

export const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
