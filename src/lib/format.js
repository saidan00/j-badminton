const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

export const num = (n) => nf.format(Math.round(n));
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
