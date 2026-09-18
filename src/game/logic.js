// Core game logic for OQZUMI: The Climb.
// Ported directly from the HTML prototype — pure functions, no UI, no storage.
// This is the part that matters most: keep these formulas intact when porting further.

export const RANKS = [
  { name: 'Bronze', from: 1, color: '#C6873D' },
  { name: 'Silver', from: 51, color: '#7C879E' },
  { name: 'Gold', from: 151, color: '#D69A00' },
  { name: 'Platinum', from: 301, color: '#0E9E8E' },
  { name: 'Diamond', from: 501, color: '#3B82C4' },
  { name: 'Mind Master', from: 751, color: '#7C3AED' },
];

export function rankFor(level) {
  let r = RANKS[0];
  for (const rank of RANKS) if (level >= rank.from) r = rank;
  return r;
}

export function nextRank(level) {
  return RANKS.find((r) => r.from > level) || null;
}

export const TYPE_LABEL = { memory: 'Memory', math: 'Math', attention: 'Attention', logic: 'Logic' };
export const TYPES = ['memory', 'math', 'attention', 'logic'];

export function checkpointFor(lvl) {
  return Math.max(1, Math.floor(lvl / 10) * 10);
}
export function checkpointList(bestLevel) {
  const top = checkpointFor(bestLevel);
  const list = [1];
  for (let c = 10; c <= top; c += 10) list.push(c);
  return list;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  return arr
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map((p) => p[1]);
}

export function pickType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

export function genMemory(lvl) {
  const len = Math.min(9, 3 + Math.floor(lvl / 5));
  const seq = [];
  for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 9));
  const inputMs = Math.max(1800, 6500 - lvl * 18);
  return { type: 'memory', seq, inputMs };
}

function finalizeMath(text, ans, lvl) {
  const opts = [ans];
  while (opts.length < 3) {
    const delta = rand(1, Math.max(2, Math.floor(Math.abs(ans) * 0.2) + 3));
    const cand = Math.random() < 0.5 ? ans + delta : ans - delta;
    if (!opts.includes(cand)) opts.push(cand);
  }
  const timeMs = Math.max(2500, 9000 - lvl * 14);
  return { type: 'math', text, opts: shuffle(opts), answer: ans, timeMs };
}

export function genMath(lvl) {
  let a, b, op, ans, text;
  if (lvl < 40) {
    a = rand(2, 20); b = rand(2, 20); op = Math.random() < 0.5 ? '+' : '-';
  } else if (lvl < 120) {
    a = rand(5, 40); b = rand(2, 15); op = ['+', '-', '\u00D7'][rand(0, 2)];
    if (op === '\u00D7') { a = rand(2, 12); b = rand(2, 12); }
  } else if (lvl < 260) {
    op = ['\u00D7', '-', '+'][rand(0, 2)];
    if (op === '\u00D7') { a = rand(4, 15); b = rand(4, 15); } else { a = rand(20, 90); b = rand(5, 50); }
  } else {
    const x = rand(2, 12), y = rand(2, 12), z = rand(2, 20);
    const useAdd = Math.random() < 0.5;
    ans = useAdd ? x * y + z : x * y - z;
    text = `${x} \u00D7 ${y} ${useAdd ? '+' : '\u2212'} ${z}`;
    return finalizeMath(text, ans, lvl);
  }
  if (op === '+') ans = a + b; else if (op === '-') ans = a - b; else ans = a * b;
  text = `${a} ${op} ${b}`;
  return finalizeMath(text, ans, lvl);
}

export function genLogic(lvl) {
  const mode = rand(0, 2);
  let seq = [], answer;
  if (mode === 0) {
    const start = rand(1, 10), step = rand(2, 4 + Math.floor(lvl / 60));
    for (let i = 0; i < 4; i++) seq.push(start + i * step);
    answer = start + 4 * step;
  } else if (mode === 1) {
    const s = rand(1, 3 + Math.floor(lvl / 150)), r = rand(2, 3);
    for (let i = 0; i < 4; i++) seq.push(s * Math.pow(r, i));
    answer = s * Math.pow(r, 4);
  } else {
    const a = rand(1, 5), b = rand(1, 5);
    seq = [a, b];
    for (let i = 0; i < 2; i++) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
    answer = seq[seq.length - 1] + seq[seq.length - 2];
  }
  const opts = [answer];
  while (opts.length < 3) {
    const delta = rand(1, Math.max(2, Math.floor(answer * 0.15) + 2));
    const cand = Math.random() < 0.5 ? answer + delta : Math.max(0, answer - delta);
    if (!opts.includes(cand)) opts.push(cand);
  }
  const timeMs = Math.max(3000, 9500 - lvl * 13);
  return { type: 'logic', seq, opts: shuffle(opts), answer, timeMs };
}

export function genAttention(lvl) {
  const n = Math.min(6, 3 + Math.floor(lvl / 70));
  const total = n * n;
  const oddIndex = rand(0, total - 1);
  const baseHue = rand(180, 260);
  const baseSat = 60, baseLight = 42;
  const delta = Math.max(3, 18 - Math.floor(lvl / 45));
  const timeMs = Math.max(3200, 8500 - lvl * 12);
  return { type: 'attention', n, total, oddIndex, baseHue, baseSat, baseLight, delta, timeMs };
}

export function genPuzzle(type, lvl) {
  if (type === 'memory') return genMemory(lvl);
  if (type === 'math') return genMath(lvl);
  if (type === 'logic') return genLogic(lvl);
  return genAttention(lvl);
}

// lifetime = { totalRuns, totalCorrect, totalAttempts, bestStreak, perType: {memory:{c,t}, ...} }
export function weakestSkill(lifetime) {
  const sampled = TYPES
    .filter((k) => lifetime.perType[k].t >= 5)
    .map((k) => ({ k, pct: lifetime.perType[k].c / lifetime.perType[k].t }));
  if (sampled.length === 0) return null;
  sampled.sort((a, b) => a.pct - b.pct);
  const worst = sampled[0];
  const avgOthers = sampled.length > 1
    ? sampled.slice(1).reduce((s, x) => s + x.pct, 0) / (sampled.length - 1)
    : worst.pct;
  if (sampled.length > 1 && avgOthers - worst.pct < 0.08) return null;
  return worst.k;
}

export function emptyLifetime() {
  return {
    totalRuns: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    bestStreak: 0,
    perType: { memory: { c: 0, t: 0 }, math: { c: 0, t: 0 }, attention: { c: 0, t: 0 }, logic: { c: 0, t: 0 } },
  };
}
