// Vẽ ảnh kết quả chia tiền bằng canvas để copy/chia sẻ vào nhóm chat.
import { t, upper } from '@/i18n.js';
import { loadImage } from './browser.js';
import {
  BW, createCard, drawBoard, drawCourt, drawHeader, fontsReady, GAP, HEAD_H, P, rgba, toPng, token, W,
} from './canvasCard.js';
import { fmtDay, num, vnd } from './format.js';
import { howRows, payGroups, ROUND_STEP, shuttleNote, surplusNote, WOMEN_RATIO } from './split.js';

// Màu từng nhóm: [vạch trên bảng tối, chữ trên nền giấy, chấm cạnh QR].
const TEAM_COLORS = {
  men: ['men', 'men-ink', 'men'],
  women: ['women', 'women-ink', 'women'],
  all: ['lime', 'court-hi', 'court-hi'],
};

function drawCard(r, qr, logo, fullFormula) {
  const display = token('display'), body = token('body');
  const ink = token('ink'), lime = token('lime'), muted = token('muted'), paper = token('paper');

  const teams = payGroups(r).filter((g) => g.count).map((g) => {
    const [color, tone, dot] = TEAM_COLORS[g.kind].map(token);
    return { ...g, label: t(`split.${g.kind}`), color, tone, dot };
  });

  const fit = qr ? Math.min(440 / qr.naturalWidth, 560 / qr.naturalHeight) : 0;
  const qw = qr ? qr.naturalWidth * fit : 0;
  const qh = qr ? qr.naturalHeight * fit : 0;

  const BOARD_H = 400;
  // "Cách tính": bật công thức đầy đủ thì có thêm các dòng tính như trên trang,
  // tắt thì chỉ còn công thức tiền mỗi người.
  const how = [
    ...(fullFormula ? howRows(r).map(([label, value]) => [label, value, ink]) : []),
    ...teams.map((team) => [team.label, team.formula, team.tone]),
  ];
  const RECEIPT_H = 520 + (how.length - 1) * 44 + 44;
  const QR_H = qr ? Math.max(qh, 320) + 80 : 0;
  const H = P + HEAD_H + BOARD_H + GAP + RECEIPT_H + (qr ? GAP + QR_H : 0) + 130;

  const card = createCard(H);
  const { canvas, ctx, text, roundRect, circle, panel } = card;
  drawCourt(card);
  drawHeader(card, { title: upper(t('split.title')), accent: upper(t('split.accent')), logo });

  // Bảng tỉ số
  let y = P + HEAD_H;
  drawBoard(card, y, BOARD_H);

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
  if (r.date) text(fmtDay(r.date), ir, y + 70, `600 26px ${body}`, ink, { align: 'right' });
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
      circle(tx2 + 8, ay - 10, 8, team.dot);
      const lw = text(team.label, tx2 + 28, ay, `500 28px ${body}`, ink);
      const ax = tx2 + 28 + Math.max(lw, 50) + 14;
      text(t('split.qr.perPerson', { amount: vnd(team.pay) }), ax, ay + 2, `700 42px ${display}`, team.tone,
        { max: P + BW - 40 - ax });
    });
    y += QR_H;
  }

  // Footer
  const rules = r.equal
    ? t('split.cardRulesEqual', { step: num(ROUND_STEP) })
    : t('split.cardRules', { ratio: WOMEN_RATIO, step: num(ROUND_STEP) });
  text(rules, W / 2, y + 62, `500 22px ${body}`, 'rgba(255, 255, 255, .6)', { align: 'center', max: BW });
  text(t('split.cardThanks'), W / 2, y + 98, `600 22px ${body}`, 'rgba(255, 255, 255, .85)', { align: 'center' });

  return canvas;
}

export async function renderCard(r, { qrSrc, logoSrc, fullFormula = true }) {
  const [, qr, logo] = await Promise.all([fontsReady(), loadImage(qrSrc), loadImage(logoSrc)]);
  return toPng(drawCard(r, qr, logo, fullFormula));
}
