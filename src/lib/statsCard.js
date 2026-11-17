// Vẽ ảnh bảng xếp hạng và kết quả từng giải để copy vào nhóm chat, cùng khung với ảnh chia tiền.
import { t, upper } from '@/i18n.js';
import { loadImage } from './browser.js';
import {
  BW, createCard, drawBoard, drawCourt, drawHeader, fontsReady, GAP, HEAD_H, P, rgba, toPng, token, W,
} from './canvasCard.js';
import { pct, today } from './format.js';
import { fmtDate, MIN_MATCHES, rate, titleOf, winnerSide } from './stats.js';

const IX = P + 48;
const IR = P + BW - 48;
const CX = W / 2;

// Biểu tượng nữ giống FemaleIcon trên trang, (x, y) là góc trên trái.
function drawFemale(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(12, 9, 5.5, 0, Math.PI * 2);
  ctx.moveTo(12, 14.5);
  ctx.lineTo(12, 22);
  ctx.moveTo(8.5, 18.5);
  ctx.lineTo(15.5, 18.5);
  ctx.stroke();
  ctx.restore();
}

// Chia danh sách tên thành các dòng vừa maxWidth, không cắt đôi một tên.
function wrapNames(ctx, font, names, sep, maxWidth) {
  ctx.font = font;
  const lines = [];
  let line = '';
  for (const name of names) {
    const next = line ? line + sep + name : name;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = name;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Dòng ngày + chấm sáng ở đầu bảng tối.
function drawBoardTop({ ctx, text, circle }, y, label) {
  const lime = token('lime');
  ctx.save();
  ctx.shadowColor = lime;
  ctx.shadowBlur = 14;
  circle(P + 44, y + 52, 7, lime);
  ctx.restore();
  text(label, P + 64, y + 60, `700 22px ${token('body')}`, 'rgba(255, 255, 255, .7)', { spacing: 4 });
  ctx.fillStyle = 'rgba(255, 255, 255, .09)';
  ctx.fillRect(P + 40, y + 92, BW - 80, 1.5);
}

function drawRanking({ rows, nameOf, isFemale, subtitle }, logo) {
  const display = token('display'), body = token('body');
  const ink = token('ink'), muted = token('muted'), lime = token('lime');
  const ROW_H = 66, LIST_TOP = 196;
  const hasLow = rows.some((row) => row.isLow);
  const PANEL_H = LIST_TOP + rows.length * ROW_H + (hasLow ? 80 : 30);
  const H = P + HEAD_H + PANEL_H + 120;

  const card = createCard(H);
  const { canvas, ctx, text, circle, panel } = card;
  drawCourt(card);
  drawHeader(card, { title: upper(t('stats.title')), accent: upper(t('stats.accent')), logo });

  const y = P + HEAD_H;
  panel(P, y, BW, PANEL_H, token('paper'));
  const nw = text('01', IX, y + 76, `italic 800 44px ${display}`, token('court-hi'));
  const tw = text(upper(t('stats.ranking.title')), IX + nw + 12, y + 76, `800 44px ${display}`, ink, { spacing: 2 });
  if (subtitle) {
    text(subtitle, IR, y + 72, `600 24px ${body}`, muted, { align: 'right', max: IR - (IX + nw + tw + 40) });
  }
  text(t('stats.ranking.hint', { n: MIN_MATCHES }), IX, y + 118, `500 24px ${body}`, muted);

  const colWins = IR - 150;
  const head = `600 20px ${body}`;
  text('#', IX + 24, y + 176, head, muted, { align: 'center' });
  text(upper(t('stats.ranking.player')), IX + 70, y + 176, head, muted, { spacing: 2 });
  text(upper(t('stats.ranking.wins')), colWins, y + 176, head, muted, { align: 'right', spacing: 2 });
  text(upper(t('stats.ranking.rate')), IR, y + 176, head, muted, { align: 'right', spacing: 2 });
  ctx.fillStyle = ink;
  ctx.fillRect(IX, y + 192, IR - IX, 3);

  rows.forEach(({ s, isLow, rank }, i) => {
    const top = y + LIST_TOP + i * ROW_H;
    const base = top + 44;
    // Chưa đủ số trận thì vẽ mờ như trên trang.
    ctx.globalAlpha = isLow ? 0.5 : 1;
    if (rank === 1) {
      circle(IX + 24, top + ROW_H / 2, 27, rgba(lime, .3));
      circle(IX + 24, top + ROW_H / 2, 22, lime);
    }
    text(isLow ? '–' : String(rank), IX + 24, base, `800 28px ${display}`, rank === 1 ? token('lime-ink') : ink,
      { align: 'center' });
    const name = text(nameOf(s.id), IX + 70, base - 2, `600 30px ${body}`, ink, { max: colWins - 160 - IX - 70 });
    if (isFemale(s.id)) drawFemale(ctx, IX + 70 + name + 8, top + 20, 24, token('female'));
    text(`${s.won}/${s.played}`, colWins, base, `700 34px ${display}`, ink, { align: 'right' });
    text(pct(rate(s)), IR, base, `700 34px ${display}`, ink, { align: 'right' });
    ctx.globalAlpha = 1;
    ctx.fillStyle = token('rule');
    ctx.fillRect(IX, top + ROW_H - 1, IR - IX, 1.5);
  });

  if (hasLow) {
    text(t('stats.ranking.lowNote', { n: MIN_MATCHES }), IX, y + LIST_TOP + rows.length * ROW_H + 52,
      `500 22px ${body}`, muted, { max: IR - IX });
  }

  text(t('stats.copy.updated', { date: fmtDate(today()) }), CX, y + PANEL_H + 72, `600 22px ${body}`,
    'rgba(255, 255, 255, .75)', { align: 'center' });
  return canvas;
}

function drawTournament(tournament, nameOf, logo) {
  const display = token('display'), body = token('body');
  const ink = token('ink'), muted = token('muted'), lime = token('lime');
  const result = tournament.result;
  const groups = tournament.format === 'groups';
  const pairName = (ids) => ids.map(nameOf).join(' & ');

  // Cặp đánh đôi ghi mỗi người một dòng như bảng BWF; chiều cao từng phần tính trước để biết cỡ canvas.
  const LINE_H = 34, CHAMP_LINE_H = 88;
  const champLines = result.champion?.length ?? 1;
  const BOARD_H = groups ? 330 + (champLines - 1) * CHAMP_LINE_H : 440;
  const TITLE_H = 64, SECTION_GAP = 26;
  const standH = (row) => 30 + row.pair.length * LINE_H;
  // Trận có nhãn (Bán kết, Quyết định…) dưới tỉ số thì chừa chỗ để nhãn không đè lên đường kẻ.
  const matchH = ([m, , note]) => Math.max(30 + Math.max(m.a.length, m.b.length) * LINE_H, note ? 90 : 64);
  const sections = groups
    ? [
      ...result.groups.map((g) => ({
        title: t('stats.stage.group', { group: g.name }), rows: g.rows, matches: g.matches.map((m, i) => [m, i + 1, '']),
      })),
      ...(result.knockout.length ? [{
        title: t('stats.history.knockout'), rows: [],
        matches: result.knockout.map((m) => [m, '', t(`stats.stage.${m.stage}`)]),
      }] : []),
    ]
    : [{ title: '', rows: [], matches: tournament.matches.map((m, i) => [m, i + 1, m.decider ? t('stats.history.decider') : '']) }];
  const sectionH = (sec) => (sec.title ? TITLE_H : 0) + sec.rows.reduce((sum, row) => sum + standH(row), 0)
    + (sec.rows.length ? 12 : 0)
    + sec.matches.reduce((sum, entry) => sum + matchH(entry), 0);
  const PAPER_H = 30 + sections.reduce((sum, sec) => sum + sectionH(sec), 0) + (sections.length - 1) * SECTION_GAP + 26;
  const H = P + HEAD_H + BOARD_H + GAP + PAPER_H + 80;

  const card = createCard(H);
  const { canvas, ctx, text, roundRect, circle, panel } = card;
  drawCourt(card);
  // "GIẢI THÁNG 11/2026": phần cuối (tháng/quý) tô màu chanh.
  const heading = upper(titleOf(tournament));
  const cut = heading.lastIndexOf(' ');
  drawHeader(card, cut > 0
    ? { title: heading.slice(0, cut), accent: heading.slice(cut + 1), logo }
    : { title: heading, logo });

  // Bảng tối: nhà vô địch (giải chia bảng) hoặc tỉ số 2 đội.
  let y = P + HEAD_H;
  drawBoard(card, y, BOARD_H);
  drawBoardTop(card, y, fmtDate(tournament.date));

  if (groups) {
    text(upper(t('stats.history.champion')), CX, y + 158, `800 30px ${display}`, lime, { align: 'center', spacing: 8 });
    ctx.save();
    ctx.shadowColor = rgba(lime, .45);
    ctx.shadowBlur = 40;
    (result.champion?.map(nameOf) ?? ['—']).forEach((name, k) => {
      text(upper(name), CX, y + 246 + k * CHAMP_LINE_H, `800 86px ${display}`, '#fff',
        { align: 'center', spacing: 3, max: BW - 80 });
    });
    ctx.restore();
    if (result.final) {
      const [win, lose] = winnerSide(result.final) === 'a' ? result.final.score : [...result.final.score].reverse();
      text(t('stats.history.finalLine', { score: `${win}–${lose}`, opponents: pairName(result.runnerUp) }),
        CX, y + 298 + (champLines - 1) * CHAMP_LINE_H, `500 26px ${body}`, 'rgba(255, 255, 255, .6)',
        { align: 'center', max: BW - 80 });
    }
  } else {
    const colW = BW / 2;
    ['a', 'b'].forEach((side, i) => {
      const cx = P + colW * i + colW / 2;
      const color = token(`team-${side}`);
      const won = result.winner === side;
      const lost = result.winner && !won;
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      roundRect(cx - 32, y + 126, 64, 8, 4);
      ctx.fill();
      ctx.restore();
      const label = tournament.teams?.[side] ?? t('stats.history.team', { side: side.toUpperCase() });
      text(upper(label), cx, y + 184, `800 44px ${display}`, '#fff', { align: 'center', spacing: 6, max: colW - 48 });
      const roster = wrapNames(ctx, `500 24px ${body}`, [...result.rosters[side]].map(nameOf), ' · ', colW - 72);
      roster.slice(0, 2).forEach((line, j) => {
        text(line, cx, y + 224 + j * 32, `500 24px ${body}`, 'rgba(255, 255, 255, .6)', { align: 'center' });
      });
      ctx.save();
      ctx.globalAlpha = lost ? 0.4 : 1;
      if (!lost) {
        ctx.shadowColor = rgba(color, .55);
        ctx.shadowBlur = 40;
      }
      text(String(result.wins[side]), cx, y + 376, `700 120px ${display}`, '#fff', { align: 'center' });
      ctx.restore();
      if (won) {
        ctx.font = `800 22px ${display}`;
        const label2 = upper(t('stats.history.win'));
        const tagW = ctx.measureText(label2).width + 40;
        ctx.fillStyle = lime;
        roundRect(cx - tagW / 2, y + 392, tagW, 34, 8);
        ctx.fill();
        text(label2, cx, y + 416, `800 22px ${display}`, token('lime-ink'), { align: 'center', spacing: 4 });
      }
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(CX, y + 124);
    ctx.lineTo(CX, y + 400);
    ctx.stroke();
    ctx.restore();
    if (!result.winner) {
      text(upper(t('stats.history.draw')), P + BW - 40, y + 60, `700 22px ${body}`, lime, { align: 'right', spacing: 4 });
    }
  }

  // Phần giấy: bảng xếp hạng từng bảng và danh sách trận.
  y += BOARD_H + GAP;
  panel(P, y, BW, PAPER_H, token('paper'));
  const winColor = groups ? { a: ink, b: ink } : { a: token('team-a-ink'), b: token('team-b-ink') };
  const courtHi = token('court-hi');
  const FORM_X = IX + 250;

  // Tên các người trong một bên, mỗi người một dòng, căn giữa theo chiều dọc quanh mid.
  const names = (ids, x, mid, font, color, opts) => {
    ids.forEach((id, k) => {
      text(nameOf(id), x, mid + (k - (ids.length - 1) / 2) * LINE_H + 9, font, color, opts);
    });
  };

  const matchRow = (entry, top) => {
    const [m, no, note] = entry;
    const mid = top + matchH(entry) / 2;
    const base = mid + 13 - (note ? 10 : 0);
    const aWon = winnerSide(m) === 'a';
    if (no !== '') text(String(no), IX, mid + 8, `700 22px ${display}`, rgba(muted, .7));
    names(m.a, CX - 66, mid, `${aWon ? 700 : 500} 27px ${body}`, aWon ? winColor.a : muted,
      { align: 'right', max: CX - 66 - (IX + 40) });
    names(m.b, CX + 66, mid, `${aWon ? 500 : 700} 27px ${body}`, aWon ? muted : winColor.b,
      { max: IR - (CX + 66) });
    // Tỉ số: số của bên thắng đậm màu chữ, bên thua nhạt.
    const font = `700 36px ${display}`;
    ctx.font = font;
    const [l, r] = m.score.map(String);
    const wl = ctx.measureText(l).width, wd = ctx.measureText('–').width, wr = ctx.measureText(r).width;
    let x = CX - (wl + wd + wr) / 2;
    x += text(l, x, base + 2, font, aWon ? ink : muted);
    x += text('–', x, base + 2, font, muted);
    text(r, x, base + 2, font, aWon ? muted : ink);
    if (note) text(upper(note), CX, base + 26, `700 15px ${body}`, token('court-hi'), { align: 'center', spacing: 1 });
  };

  let cy = y + 30;
  sections.forEach((sec, si) => {
    if (si > 0) cy += SECTION_GAP;
    if (sec.title) {
      text(upper(sec.title), IX, cy + 42, `800 32px ${display}`, ink, { spacing: 3 });
      if (sec.rows.length) {
        text(t('stats.history.standings'), IR, cy + 40, `600 22px ${body}`, muted, { align: 'right' });
      }
      cy += TITLE_H;
    }
    sec.rows.forEach((row, i) => {
      const h = standH(row);
      const mid = cy + (h - 8) / 2;
      ctx.fillStyle = row.through ? rgba(lime, .32) : token('paper-2');
      roundRect(IX - 8, cy, IR - IX + 16, h - 8, 14);
      ctx.fill();
      text(String(i + 1), IX + 18, mid + 9, `700 24px ${display}`, muted, { align: 'center' });
      names(row.pair, IX + 52, mid, `600 27px ${body}`, ink, { max: FORM_X - 24 - IX - 52 });
      // Chuỗi T/B từng trận vòng bảng, thẳng hàng giữa các cặp như trên trang.
      row.results.forEach((r, k) => {
        const cx = FORM_X + 18 + k * 46;
        if (r.won) {
          circle(cx, mid, 18, courtHi);
        } else {
          ctx.save();
          ctx.strokeStyle = rgba(muted, .45);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, mid, 17, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        text(t(r.won ? 'stats.detail.wonShort' : 'stats.detail.lostShort'), cx, mid + 7, `700 19px ${display}`,
          r.won ? '#fff' : muted, { align: 'center' });
      });
      text(String(row.won), IR - 14, mid + 12, `700 34px ${display}`, ink, { align: 'right' });
      cy += h;
    });
    if (sec.rows.length) cy += 12;
    sec.matches.forEach((entry, i) => {
      matchRow(entry, cy);
      const h = matchH(entry);
      if (i < sec.matches.length - 1) {
        ctx.save();
        ctx.strokeStyle = token('rule');
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.moveTo(IX, cy + h);
        ctx.lineTo(IR, cy + h);
        ctx.stroke();
        ctx.restore();
      }
      cy += h;
    });
  });
  return canvas;
}

export async function renderRanking(data, { logoSrc }) {
  const [, logo] = await Promise.all([fontsReady(), loadImage(logoSrc)]);
  return toPng(drawRanking(data, logo));
}

export async function renderTournament(tournament, { nameOf, logoSrc }) {
  const [, logo] = await Promise.all([fontsReady(), loadImage(logoSrc)]);
  return toPng(drawTournament(tournament, nameOf, logo));
}
