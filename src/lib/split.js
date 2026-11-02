import { t, upper } from '@/i18n.js';
import { dec, num, vnd } from './format.js';

export const SHUTTLES_PER_TUBE = 12;
export const WOMEN_RATIO = 0.8;
export const ROUND_STEP = 500;
export const DEFAULTS = { men: 4, women: 2, court: 240000, shuttles: 3, tubePrice: 325000, water: 0 };

export const splitRules = () => [
  t('split.rules.men'),
  t('split.rules.women', { ratio: WOMEN_RATIO }),
  t('split.rules.water'),
  t('split.rules.rounding', { step: num(ROUND_STEP) }),
];

export const roundUp = (n) => Math.ceil(n / ROUND_STEP - 1e-9) * ROUND_STEP;
export const shuttleCost = (shuttles, tubePrice) => shuttles / SHUTTLES_PER_TUBE * tubePrice;
export const totalWeight = (men, women) => men + women * WOMEN_RATIO;

export function split({ men, women, court, shuttles, tubePrice, water }) {
  const shuttleTotal = shuttleCost(shuttles, tubePrice);
  const total = court + shuttleTotal + water;
  const weight = totalWeight(men, women);
  // Nước chỉ chia cho nam; không có nam thì đành chia chung theo hệ số.
  const waterToMen = men > 0;
  const pool = waterToMen ? court + shuttleTotal : total;
  const unit = pool / weight;
  const waterEach = waterToMen ? water / men : 0;
  const menExact = unit + waterEach;
  const womenExact = unit * WOMEN_RATIO;
  const menPay = men > 0 ? roundUp(menExact) : 0;
  const womenPay = women > 0 ? roundUp(womenExact) : 0;
  const collected = menPay * men + womenPay * women;

  return {
    men, women, court, shuttles, tubePrice, water,
    shuttleCost: shuttleTotal, total, weight, pool, unit, waterToMen, waterEach,
    menExact, womenExact, menPay, womenPay, collected,
    surplus: collected - total,
  };
}

export const shuttleNote = (r) => `${r.shuttles}/${SHUTTLES_PER_TUBE} × ${num(r.tubePrice)}`;
export const surplusNote = (r) => (r.surplus > 0.5 ? t('split.receipt.surplus', { amount: vnd(r.surplus) }) : '');

// Các dòng "Cách tính" dùng chung cho trang và ảnh kết quả.
export function howRows(r) {
  const rows = [
    [t('split.how.weight'), `${r.men} + ${r.women}×${WOMEN_RATIO} = ${dec(r.weight)}`],
    [t('split.how.unit'), `${num(r.pool)} / ${dec(r.weight)} = ${vnd(r.unit)}`],
  ];
  if (r.water > 0) {
    rows.push(r.waterToMen
      ? [t('split.how.waterEach'), `${num(r.water)} / ${r.men} = ${vnd(r.waterEach)}`]
      : [t('split.how.water'), t('split.how.waterShared')]);
  }
  return rows;
}

// Công thức ra số tiền mỗi người; null khi bên đó không có ai.
export function payFormulas(r) {
  return {
    men: !r.men ? null : r.waterEach > 0
      ? `${num(r.unit)} + ${num(r.waterEach)} = ${num(r.menExact)} → ${vnd(r.menPay)}`
      : `${num(r.unit)} → ${vnd(r.menPay)}`,
    women: r.women ? `${num(r.unit)} × ${WOMEN_RATIO} = ${num(r.womenExact)} → ${vnd(r.womenPay)}` : null,
  };
}

export function summary(r) {
  const line = (label, value) => `${label}: ${value}`;
  const lines = [
    `🏸 ${upper(`${t('split.title')} ${t('split.accent')}`)}`,
    '',
    line(t('split.receipt.court'), vnd(r.court)),
    line(t('split.receipt.shuttles'), `${shuttleNote(r)} = ${vnd(r.shuttleCost)}`),
    line(t('split.receipt.water'), vnd(r.water)),
    '──────────────',
    line(t('split.receipt.total'), vnd(r.total)),
    '',
    line(t('split.men'), t('split.people', r.men)),
    line(t('split.women'), t('split.people', r.women)),
    '',
    line(t('split.how.weight'), dec(r.weight)),
    line(t('split.how.unit'), vnd(r.unit)),
  ];
  if (r.waterToMen && r.water > 0) lines.push(line(t('split.how.waterEach'), vnd(r.waterEach)));
  lines.push('');
  if (r.men) lines.push(`👨 ${line(t('split.men'), t('split.qr.perPerson', { amount: vnd(r.menPay) }))}`);
  if (r.women) lines.push(`👩 ${line(t('split.women'), t('split.qr.perPerson', { amount: vnd(r.womenPay) }))}`);
  return lines.join('\n');
}
