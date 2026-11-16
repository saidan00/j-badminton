// Khung chung cho các ảnh copy (chia tiền, bảng xếp hạng, kết quả giải): nền sân, header CLB,
// bảng tối và các hàm vẽ chữ/khối. Ảnh rộng 1080px, mọi màu lấy từ CSS token cho khớp với trang.
import { t, upper } from '@/i18n.js';
import { SHUTTLE } from './shuttle.js';

export const W = 1080;
export const P = 60;
export const GAP = 24;
export const BW = W - P * 2;
export const HEAD_H = 180;

export const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

export const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function fontsReady() {
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

// Canvas cao H kèm các hàm vẽ hay dùng; text() trả về bề rộng đã vẽ để xếp chữ nối tiếp.
export function createCard(H) {
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

  return { canvas, ctx, text, roundRect, circle, panel };
}

// Nền sân cầu lông phủ cả ảnh.
export function drawCourt({ ctx, canvas }) {
  const H = canvas.height;
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
}

// Header cao HEAD_H: logo quả cầu, tên CLB, tiêu đề (phần accent màu chanh) và logo CLB.
export function drawHeader({ ctx, text, circle }, { title, accent, logo }) {
  const display = token('display'), body = token('body');
  const ink = token('ink'), lime = token('lime');
  const y = P;
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

  const head = accent ? `${title} ` : title;
  let size = 92;
  const fitTitle = () => `italic 800 ${size}px ${display}`;
  ctx.font = fitTitle();
  while (ctx.measureText(head + (accent ?? '')).width > textMax && size > 50) {
    size -= 2;
    ctx.font = fitTitle();
  }
  const w1 = text(head, tx, y + 136, fitTitle(), '#fff');
  if (accent) text(accent, tx + w1, y + 136, fitTitle(), lime);
}

// Bảng tối có chấm lưới như bảng tỉ số trên trang.
export function drawBoard({ ctx, roundRect, panel }, y, h) {
  panel(P, y, BW, h, token('board'));
  ctx.save();
  roundRect(P, y, BW, h, 36);
  ctx.clip();
  const g = ctx.createRadialGradient(W / 2, y, 0, W / 2, y, BW);
  g.addColorStop(0, token('board-2'));
  g.addColorStop(1, token('board'));
  ctx.fillStyle = g;
  ctx.fillRect(P, y, BW, h);
  ctx.fillStyle = 'rgba(255, 255, 255, .05)';
  for (let dy = y + 4; dy < y + h; dy += 8) {
    for (let dx = P + 4; dx < P + BW; dx += 8) ctx.fillRect(dx, dy, 1.6, 1.6);
  }
  ctx.restore();
}

export function toPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
