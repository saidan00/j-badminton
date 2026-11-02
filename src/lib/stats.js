import { DATA_URL } from '@/config.js';

// Dưới số trận này thì vẫn hiện nhưng chưa xếp hạng, tránh 1 trận thắng 1 là 100%.
export const MIN_MATCHES = 4;
export const TYPE_LABEL = { monthly: 'Giải tháng', quarterly: 'Giải quý' };
const SIDES = ['a', 'b'];

export const rate = (s) => s.won / s.played;
const other = (side) => (side === 'a' ? 'b' : 'a');

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function fmtDate(iso) {
  const { y, m, d } = parseDate(iso);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function titleOf(t) {
  if (t.name) return t.name;
  const { y, m } = parseDate(t.date);
  return t.type === 'quarterly' ? `Giải quý ${Math.ceil(m / 3)}/${y}` : `Giải tháng ${m}/${y}`;
}

// JSON sửa tay nên dễ gõ sai: bỏ qua phần sai thay vì vỡ trang, và liệt kê lỗi để sửa.
export function validate(rawPlayers, rawTournaments) {
  const errors = [];
  const map = new Map();
  for (const p of Array.isArray(rawPlayers) ? rawPlayers : []) {
    if (!p?.id || !p?.name) {
      errors.push(`players.json: thiếu id hoặc name ở ${JSON.stringify(p)}`);
      continue;
    }
    if (map.has(p.id)) errors.push(`players.json: trùng id "${p.id}"`);
    map.set(p.id, p);
  }

  const list = [];
  for (const t of Array.isArray(rawTournaments) ? rawTournaments : []) {
    const label = `Giải ${t?.id ?? t?.date ?? '?'}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t?.date ?? '') || !TYPE_LABEL[t.type] || !Array.isArray(t.matches)) {
      errors.push(`${label}: cần date dạng YYYY-MM-DD, type là monthly hoặc quarterly, và có matches`);
      continue;
    }
    const matches = t.matches.filter((m, i) => {
      const where = `${label}, trận ${i + 1}`;
      const sides = [m?.a, m?.b];
      if (!sides.every((s) => Array.isArray(s) && s.length >= 1 && s.length <= 2)) {
        errors.push(`${where}: a và b phải có 1–2 người`);
        return false;
      }
      const unknown = sides.flat().filter((id) => !map.has(id));
      if (unknown.length) {
        errors.push(`${where}: không có ${unknown.map((u) => `"${u}"`).join(', ')} trong players.json`);
        return false;
      }
      if (new Set(sides.flat()).size !== sides.flat().length) {
        errors.push(`${where}: một người xuất hiện 2 lần`);
        return false;
      }
      const s = m.score;
      if (!Array.isArray(s) || s.length !== 2 || !s.every(Number.isInteger) || s[0] === s[1]) {
        errors.push(`${where}: score phải là [điểm A, điểm B] và không hoà`);
        return false;
      }
      return true;
    });
    list.push({ ...t, matches });
  }
  return { players: map, tournaments: list, errors };
}

// Đội A là những ai từng đứng bên a; không cố định 5 người vì đội có thể chênh người.
export function teamResult(t) {
  const rosters = { a: new Set(), b: new Set() };
  const wins = { a: 0, b: 0 };
  for (const m of t.matches) {
    for (const side of SIDES) m[side].forEach((id) => rosters[side].add(id));
    wins[m.score[0] > m.score[1] ? 'a' : 'b']++;
  }
  const winner = wins.a > wins.b ? 'a' : wins.b > wins.a ? 'b' : null;
  return { rosters, wins, winner };
}

export function buildStats(list) {
  const stats = new Map();
  const entry = (id) => {
    if (!stats.has(id)) {
      stats.set(id, { id, played: 0, won: 0, events: 0, teamWins: 0, partners: new Map(), log: [] });
    }
    return stats.get(id);
  };

  for (const t of list) {
    for (const side of SIDES) {
      for (const id of t.result.rosters[side]) {
        const s = entry(id);
        s.events++;
        if (t.result.winner === side) s.teamWins++;
      }
    }

    t.matches.forEach((m, i) => {
      for (const side of SIDES) {
        const mine = m.score[side === 'a' ? 0 : 1];
        const theirs = m.score[side === 'a' ? 1 : 0];
        const won = mine > theirs;
        for (const id of m[side]) {
          const s = entry(id);
          s.played++;
          if (won) s.won++;

          const partner = m[side].find((x) => x !== id);
          if (partner) {
            const ps = s.partners.get(partner) ?? { played: 0, won: 0, diff: 0 };
            ps.played++;
            if (won) ps.won++;
            ps.diff += mine - theirs;
            s.partners.set(partner, ps);
          }
          s.log.push({ t, i, partner, opp: m[other(side)], mine, theirs, won, decider: m.decider });
        }
      }
    });
  }
  return [...stats.values()];
}

// Cùng tỉ lệ và số trận thắng thì đồng hạng (1, 2, 2, 4…); trong cùng hạng xếp theo tên.
const sameRank = (x, y) => x.won * y.played === y.won * x.played && x.won === y.won;

export function rankRows(stats, nameOf) {
  const byRank = (x, y) => rate(y) - rate(x) || y.won - x.won
    || nameOf(x.id).localeCompare(nameOf(y.id), 'vi');
  const ranked = stats.filter((s) => s.played >= MIN_MATCHES).sort(byRank);
  const low = stats.filter((s) => s.played < MIN_MATCHES).sort(byRank);
  let rank = 0;
  return [...ranked, ...low].map((s, i) => {
    const isLow = s.played < MIN_MATCHES;
    if (!isLow && (i === 0 || !sameRank(ranked[i - 1], s))) rank = i + 1;
    return { s, isLow, rank: isLow ? null : rank };
  });
}

export function bestPartner(s) {
  return [...s.partners.entries()].sort(([, x], [, y]) =>
    rate(y) - rate(x) || y.played - x.played || y.diff - x.diff)[0] ?? null;
}

export async function loadStatsData() {
  const urls = ['players.json', 'tournaments.json'].map((f) => DATA_URL + f);
  const [rawPlayers, rawTournaments] = await Promise.all(urls.map(async (url) => {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.json().catch((err) => { throw new Error(`${url}: JSON sai cú pháp (${err.message})`); });
  }));
  const data = validate(rawPlayers, rawTournaments);
  return {
    ...data,
    tournaments: data.tournaments.map((t) => ({ ...t, result: teamResult(t) })),
  };
}
