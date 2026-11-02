// Vẽ ảnh kết quả chia tiền bằng canvas để copy/chia sẻ vào nhóm chat.
import { t, upper } from '@/i18n.js';
import { loadImage } from './browser.js';
import { num, vnd } from './format.js';
import { SHUTTLE } from './shuttle.js';
import { howRows, payFormulas, ROUND_STEP, shuttleNote, surplusNote, WOMEN_RATIO } from './split.js';

const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function fontsReady() {
  if (!document.fonts) return Promise.resolve();
  const sample = 'CHIA TIỀN CẦU LÔNG BADMINTON Nữ người đ 0123456789';
  const display = token('display');
  const body = token('body');
  const loads = [
    `italic 800 40px ${display}`, `800 40px ${display}`, `700 40px ${display}`,
    `500 20px ${body}`, `600 20px ${body}`, `700 20px ${body}`,
  ].map((font) => document.fonts.load(font, sample).catch(() => { }));
  // Offline thì không chờ font mãi, vẽ bằng font hệ thống.
  return Promise.race([Promise.all(loads), new Promise((resolve) => setTimeout(resolve, 2000))]);
}

function drawShuttle(ctx, cx, cy, size, ink) {
  const feathers = new Path2D(SHUTTLE.feathers);
  const spines = new Path2D(SHUTTLE.spines);
  const cork = new Path2D(SHUTTLE.cork);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-32 * Math.PI / 180);
  ctx.scale(size / 64, size / 64);
  ctx.translate(-32, -29);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.fillStyle = '#fff';
  ctx.fill(feathers);
  ctx.stroke(feathers);
  ctx.stroke(spines);
  ctx.fillStyle = ink;
  ctx.fill(cork);
  ctx.stroke(cork);
  ctx.restore();
}

function drawCard(r, qr, logo) {
  const W = 1080, P = 60, GAP = 24, BW = W - P * 2;
  const display = token('display'), body = token('body');
  const ink = token('ink'), lime = token('lime'), muted = token('muted'), paper = token('paper');

  const formulas = payFormulas(r);
  const teams = [
    r.men && {
      label: t('split.men'), count: r.men, pay: r.menPay, formula: formulas.men,
      color: token('men'), tone: token('men-ink'),
    },
    r.women && {
      label: t('split.women'), count: r.women, pay: r.womenPay, formula: formulas.women,
      color: token('women'), tone: token('women-ink'),
    },
  ].filter(Boolean);

  const fit = qr ? Math.min(440 / qr.naturalWidth, 560 / qr.naturalHeight) : 0;
  const qw = qr ? qr.naturalWidth * fit : 0;
  const qh = qr ? qr.naturalHeight * fit : 0;

  const HEAD_H = 180;
  const BOARD_H = 400;
  // "Cách tính" đầy đủ như trên trang: hệ số, tiền nước rồi công thức Nam/Nữ.
  const how = [
    ...howRows(r).map(([label, value]) => [label, value, ink]),
    ...teams.map((team) => [team.label, team.formula, team.tone]),
  ];
  const RECEIPT_H = 520 + (how.length - 1) * 44 + 44;
  const QR_H = qr ? Math.max(qh, 320) + 80 : 0;
  const H = P + HEAD_H + BOARD_H + GAP + RECEIPT_H + (qr ? GAP + QR_H : 0) + 130;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const text = (str, x, y, font, color, { align = 'left', spacing = 0, max } = {}) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
    if (max) ctx.fillText(str, x, y, max);
    else ctx.fillText(str, x, y);
    const width = ctx.measureText(str).width;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    return max ? Math.min(width, max) : width;
  };
  const roundRect = (x, y, w, h, rad) => {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  };
  const circle = (x, y, rad, color) => {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };
  const panel = (x, y, w, h, color) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, .35)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = color;
    roundRect(x, y, w, h, 36);
    ctx.fill();
    ctx.restore();
  };

  // Nền sân
  ctx.fillStyle = token('court');
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(W / 2, -100, 0, W / 2, -100, H * 0.7);
  g.addColorStop(0, token('court-hi'));
  g.addColorStop(1, rgba(token('court-hi'), 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W / 2, H + 100, 0, W / 2, H + 100, H * 0.6);
  g.addColorStop(0, token('court-deep'));
  g.addColorStop(1, rgba(token('court-deep'), 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  const s = (H * 0.94) / 1340;
  ctx.translate(W / 2 - 305 * s, H / 2 - 670 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(255, 255, 255, .12)';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, 610, 1340);
  ctx.beginPath();
  for (const x of [46, 564]) { ctx.moveTo(x, 0); ctx.lineTo(x, 1340); }
  for (const y of [76, 472, 868, 1264]) { ctx.moveTo(0, y); ctx.lineTo(610, y); }
  ctx.moveTo(305, 0); ctx.lineTo(305, 472);
  ctx.moveTo(305, 868); ctx.lineTo(305, 1340);
  ctx.stroke();
  ctx.setLineDash([3, 8]);
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, .25)';
  ctx.beginPath();
  ctx.moveTo(-30, 670); ctx.lineTo(640, 670);
  ctx.stroke();
  ctx.restore();

  // Header
  let y = P;
  const lx = P + 66, ly = y + 74;
  circle(lx, ly, 82, rgba(lime, .16));
  circle(lx, ly, 66, lime);
  drawShuttle(ctx, lx, ly, 86, ink);

  const rx = W - P - 66;
  if (logo) {
    circle(rx, ly, 82, 'rgba(59, 130, 246, 0.22)');
    circle(rx, ly, 70, 'rgba(24, 38, 61, 0.9)');
    circle(rx, ly, 66, '#070d1b');
    ctx.save();
    ctx.beginPath();
    ctx.arc(rx, ly, 66, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logo, rx - 57, ly - 57, 114, 114);
    ctx.restore();
  }

  const tx = P + 170;
  const textMax = (logo ? rx - 82 - 24 : W - P) - tx;
  text(upper(t('club')), tx, y + 44, `600 24px ${body}`, lime, { spacing: 4, max: textMax });

  const title = `${upper(t('split.title'))} `;
  const accent = upper(t('split.accent'));
  let size = 92;
  const fitTitle = () => `italic 800 ${size}px ${display}`;
  ctx.font = fitTitle();
  while (ctx.measureText(title + accent).width > textMax && size > 50) {
    size -= 2;
    ctx.font = fitTitle();
  }
  const w1 = text(title, tx, y + 136, fitTitle(), '#fff');
  text(accent, tx + w1, y + 136, fitTitle(), lime);

  // Bảng tỉ số
  y = P + HEAD_H;
  panel(P, y, BW, BOARD_H, token('board'));
  ctx.save();
  roundRect(P, y, BW, BOARD_H, 36);
  ctx.clip();
  g = ctx.createRadialGradient(W / 2, y, 0, W / 2, y, BW);
  g.addColorStop(0, token('board-2'));
  g.addColorStop(1, token('board'));
  ctx.fillStyle = g;
  ctx.fillRect(P, y, BW, BOARD_H);
  ctx.fillStyle = 'rgba(255, 255, 255, .05)';
  for (let dy = y + 4; dy < y + BOARD_H; dy += 8) {
    for (let dx = P + 4; dx < P + BW; dx += 8) ctx.fillRect(dx, dy, 1.6, 1.6);
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = lime;
  ctx.shadowBlur = 14;
  circle(P + 44, y + 52, 7, lime);
  ctx.restore();
  text(upper(t('split.result')), P + 64, y + 60, `700 22px ${body}`, 'rgba(255, 255, 255, .7)', { spacing: 4 });
  const totalW = text(vnd(r.total), P + BW - 40, y + 63, `700 38px ${display}`, lime, { align: 'right' });
  text(upper(t('split.total')), P + BW - 40 - totalW - 14, y + 60, `700 22px ${body}`, 'rgba(255, 255, 255, .7)',
    { align: 'right', spacing: 4 });
  ctx.fillStyle = 'rgba(255, 255, 255, .09)';
  ctx.fillRect(P + 40, y + 92, BW - 80, 1.5);

  const colW = BW / teams.length;
  teams.forEach((team, i) => {
    const cx = P + colW * i + colW / 2;
    ctx.save();
    ctx.shadowColor = team.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = team.color;
    roundRect(cx - 32, y + 126, 64, 8, 4);
    ctx.fill();
    ctx.restore();
    text(upper(team.label), cx, y + 184, `800 46px ${display}`, '#fff', { align: 'center', spacing: 7 });
    text(t('split.people', team.count), cx, y + 222, `500 24px ${body}`, 'rgba(255, 255, 255, .55)', { align: 'center' });
    ctx.save();
    ctx.shadowColor = rgba(team.color, .55);
    ctx.shadowBlur = 40;
    text(num(team.pay), cx, y + 340, `700 136px ${display}`, '#fff', { align: 'center', max: colW - 48 });
    ctx.restore();
    text(t('split.perPerson'), cx, y + 376, `500 24px ${body}`, 'rgba(255, 255, 255, .55)', { align: 'center' });
  });
  if (teams.length === 2) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(P + BW / 2, y + 124);
    ctx.lineTo(P + BW / 2, y + 370);
    ctx.stroke();
    ctx.restore();
  }

  // Chi phí
  y += BOARD_H + GAP;
  panel(P, y, BW, RECEIPT_H, paper);
  const ix = P + 48, ir = P + BW - 48;
  text(upper(t('split.receipt.costs')), ix, y + 70, `800 26px ${display}`, muted, { spacing: 5 });
  const rows = [
    [t('split.receipt.court'), vnd(r.court)],
    [t('split.receipt.shuttles'), vnd(r.shuttleCost), shuttleNote(r)],
    [t('split.receipt.water'), vnd(r.water)],
  ];
  rows.forEach(([label, value, note], i) => {
    const ry = y + 132 + i * 62;
    const lw = text(label, ix, ry, `500 30px ${body}`, muted);
    if (note) text(note, ix + lw + 14, ry, `500 22px ${body}`, rgba(muted, .8));
    text(value, ir, ry + 2, `700 42px ${display}`, ink, { align: 'right' });
  });
  ctx.fillStyle = ink;
  ctx.fillRect(ix, y + 290, ir - ix, 4);
  text(upper(t('split.receipt.total')), ix, y + 360, `700 28px ${body}`, ink, { spacing: 3 });
  text(vnd(r.total), ir, y + 364, `700 66px ${display}`, ink, { align: 'right' });

  ctx.fillStyle = token('paper-2');
  roundRect(ix - 18, y + 392, ir - ix + 36, 72, 18);
  ctx.fill();
  text(t('split.receipt.collected'), ix, y + 438, `500 26px ${body}`, muted);
  const surplus = surplusNote(r);
  const collected = vnd(r.collected) + (surplus ? ` ${surplus}` : '');
  text(collected, ir, y + 438, `600 26px ${body}`, ink, { align: 'right' });

  how.forEach(([label, value, color], i) => {
    const hy = y + 520 + i * 44;
    text(label, ix, hy, `500 25px ${body}`, muted);
    text(value, ir, hy, `600 25px ${body}`, color, { align: 'right' });
  });
  y += RECEIPT_H;

  // QR
  if (qr) {
    y += GAP;
    panel(P, y, BW, QR_H, paper);
    const qx = P + 40;
    const qy = y + (QR_H - qh) / 2;
    ctx.save();
    roundRect(qx, qy, qw, qh, 20);
    ctx.clip();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(qr, qx, qy, qw, qh);
    ctx.restore();

    const tx2 = qx + qw + 44;
    const maxW = P + BW - 40 - tx2;
    const ty = y + (QR_H - 300) / 2;
    text(t('split.qr.cardLine1'), tx2, ty + 52, `italic 800 60px ${display}`, ink, { max: maxW });
    text(t('split.qr.cardLine2'), tx2, ty + 112, `italic 800 60px ${display}`, ink, { max: maxW });
    text(t('split.qr.note'), tx2, ty + 158, `500 24px ${body}`, muted, { max: maxW });
    teams.forEach((team, i) => {
      const ay = ty + 230 + i * 60;
      circle(tx2 + 8, ay - 10, 8, team.color);
      const lw = text(team.label, tx2 + 28, ay, `500 28px ${body}`, ink);
      const ax = tx2 + 28 + Math.max(lw, 50) + 14;
      text(t('split.qr.perPerson', { amount: vnd(team.pay) }), ax, ay + 2, `700 42px ${display}`, team.tone,
        { max: P + BW - 40 - ax });
    });
    y += QR_H;
  }

  // Footer
  const rules = t('split.cardRules', { ratio: WOMEN_RATIO, step: num(ROUND_STEP) });
  text(rules, W / 2, y + 62, `500 22px ${body}`, 'rgba(255, 255, 255, .6)', { align: 'center', max: BW });
  text(t('split.cardThanks'), W / 2, y + 98, `600 22px ${body}`, 'rgba(255, 255, 255, .85)', { align: 'center' });

  return canvas;
}

export async function renderCard(r, { qrSrc, logoSrc }) {
  const [, qr, logo] = await Promise.all([fontsReady(), loadImage(qrSrc), loadImage(logoSrc)]);
  const canvas = drawCard(r, qr, logo);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
