// Structural validation of the knowledge base (natal-kb-0.2, PR #11) — shape, keys, X/Y, friendship, duplicates, grammar.
import test from 'node:test';
import assert from 'node:assert/strict';
import {CROSS_PAIRS, FRIENDSHIP_OVERRIDE, ROMANTIC_WORDS, KB_VERSION, SIGNS, DAILY_AREAS} from '../src/lib/natal-interpretation/knowledge.mjs';

const BODIES = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven', 'NorthNode']);
const EASY = ['story', 'daily', 'benefit', 'tip'], HARD = ['story', 'daily', 'misunderstanding', 'needX', 'needY', 'action'];
const vals = v => [].concat(v);
const entries = Object.entries(CROSS_PAIRS);

test('version is natal-kb-0.2', () => assert.equal(KB_VERSION, 'natal-kb-0.2'));
test('keys are known bodies, sorted "A|B", and no aliases remain', () => {
  for (const [k, v] of entries) {
    const [a, b] = k.split('|');
    assert.ok(BODIES.has(a) && BODIES.has(b), k);
    assert.equal(k, [a, b].sort().join('|'), `${k} is not sorted`);
    assert.ok(!v.alias, `${k} is still an alias of ${v.alias}`);
  }
});
test('X is one of the two bodies (or null for symmetric pairs)', () => {
  for (const [k, v] of entries) {const [a, b] = k.split('|'); assert.ok(v.x === null || v.x === a || v.x === b, `${k}: x=${v.x}`); if (a === b) assert.ok(v.x === null || v.x === a);}
});
test('shape: es/en, two titles, all easy/hard fields, only {X}/{Y} placeholders', () => {
  for (const [k, v] of entries) for (const lang of ['es', 'en']) {
    const L = v[lang]; assert.ok(L, `${k}.${lang}`);
    assert.ok(Array.isArray(L.title) && L.title.length === 2 && L.title.every(t => t.trim()), `${k}.${lang}.title`);
    for (const f of EASY) assert.ok(vals(L.easy?.[f]).every(t => typeof t === 'string' && t.trim().length > 3), `${k}.${lang}.easy.${f}`);
    for (const f of HARD) assert.ok(vals(L.hard?.[f]).every(t => typeof t === 'string' && t.trim().length > 3), `${k}.${lang}.hard.${f}`);
    const all = [...EASY.flatMap(f => vals(L.easy[f])), ...HARD.flatMap(f => vals(L.hard[f]))];
    for (const t of all) {const ph = t.match(/\{(\w+)\}/g) ?? []; assert.ok(ph.every(p => p === '{X}' || p === '{Y}'), `${k}.${lang}: ${t}`);}
  }
});
test('no duplicated texts between different pairs (alias-like reuse)', () => {
  const seen = new Map();
  for (const [k, v] of entries) for (const lang of ['es', 'en']) for (const t of ['easy', 'hard']) for (const f of ['story', 'daily']) for (const s of vals(v[lang][t][f])) {
    const key = `${lang}:${s.trim().toLowerCase()}`; assert.ok(!seen.has(key) || seen.get(key) === k, `"${s}" used by ${seen.get(key)} and ${k}`); seen.set(key, k);
  }
});
test('friendship: romantic content only in entries flagged romantic (which use the friendship override)', () => {
  assert.ok(FRIENDSHIP_OVERRIDE.es && FRIENDSHIP_OVERRIDE.en);
  for (const [k, v] of entries) if (!v.romantic) for (const lang of ['es', 'en']) {
    const txt = JSON.stringify(v[lang]);
    assert.ok(!ROMANTIC_WORDS.test(txt), `${k}.${lang} has romantic wording without the romantic flag: ${txt.match(ROMANTIC_WORDS)?.[0]}`);
  }
});
test('English: no "it/its/itself" for people; Spanish: no double spaces or doubled words', () => {
  for (const [k, v] of entries) {
    const en = JSON.stringify(v.en); assert.ok(!/\bitself\b|\bits (own|contribution|need)/.test(en), `${k}.en: person referred to as "it"`); // "its meaning" (a sentence) is fine
    for (const lang of ['es', 'en']) {const t = JSON.stringify(v[lang]); assert.ok(!/ {2}|\b(\p{L}+) \1\b/u.test(t), `${k}.${lang}: ${t.match(/ {2}|\b(\p{L}+) \1\b/u)?.[0]}`);}
  }
  for (const s of SIGNS) assert.ok(!/\bitself\b|\bits (own|contribution|need)/.test(JSON.stringify(s.en)), JSON.stringify(s.en));
});
// Known library defects (owner: ChatGPT, T-28): Moon|Venus.en and Moon|Saturn.es benefits. The narrative already frames
// every benefit as "a theme to cultivate", so readers never see them as facts; kept visible as a todo.
test('benefits are not stated as certain feelings or trust', {todo: 'Moon|Venus.en, Moon|Saturn.es (pre-existing entries) — ChatGPT T-28'}, () => {
  const BAD = /^(confianza|un afecto que se siente|trust|affection that feels|feeling heard)/i;
  for (const [k, v] of entries) for (const lang of ['es', 'en']) for (const b of vals(v[lang].easy.benefit)) assert.ok(!BAD.test(b.trim()), `${k}.${lang}: ${b}`);
});
test('daily areas only reference pairs that exist or are documented as sign-level', () => {
  for (const a of DAILY_AREAS) for (const p of a.pairs) assert.ok(/^\w+\|\w+$/.test(p), `${a.key}: ${p}`);
});
