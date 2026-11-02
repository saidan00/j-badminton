import { dec, num, vnd } from './format.js';

export const SHUTTLES_PER_TUBE = 12;
export const WOMEN_RATIO = 0.8;
export const ROUND_STEP = 500;
export const DEFAULTS = { men: 4, women: 2, court: 240000, shuttles: 3, tubePrice: 325000, water: 0 };

export const SPLIT_RULES = [
  'Nam ×1.0',
  `Nữ ×${WOMEN_RATIO}`,
  'Nước: chỉ chia nam',
  `Làm tròn lên ${num(ROUND_STEP)}đ`,
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

// Các dòng "Cách tính" dùng chung cho trang và ảnh kết quả.
export function howRows(r) {
  const rows = [
    ['Tổng hệ số', `${r.men} + ${r.women}×${WOMEN_RATIO} = ${dec(r.weight)}`],
    ['Tiền 1 hệ số', `${num(r.pool)} / ${dec(r.weight)} = ${vnd(r.unit)}`],
  ];
  if (r.water > 0) {
    rows.push(r.waterToMen
      ? ['Nước mỗi nam', `${num(r.water)} / ${r.men} = ${vnd(r.waterEach)}`]
      : ['Tiền nước', 'không có nam → chia chung']);
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
  const lines = [
    '🏸 CHIA TIỀN CẦU LÔNG',
    '',
    `Tiền sân: ${vnd(r.court)}`,
    `Tiền cầu: ${r.shuttles}/${SHUTTLES_PER_TUBE} × ${num(r.tubePrice)} = ${vnd(r.shuttleCost)}`,
    `Tiền nước: ${vnd(r.water)}`,
    '──────────────',
    `Tổng tiền: ${vnd(r.total)}`,
    '',
    `Nam: ${r.men} người`,
    `Nữ: ${r.women} người`,
    '',
    `Tổng hệ số: ${dec(r.weight)}`,
    `Tiền 1 hệ số: ${vnd(r.unit)}`,
  ];
  if (r.waterToMen && r.water > 0) lines.push(`Nước mỗi nam: ${vnd(r.waterEach)}`);
  lines.push('');
  if (r.men) lines.push(`👨 Nam: ${vnd(r.menPay)}/người`);
  if (r.women) lines.push(`👩 Nữ: ${vnd(r.womenPay)}/người`);
  return lines.join('\n');
}
