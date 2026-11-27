// Gate 5 — editorial evaluation corpus (10 fictional pairs) + automatic quality metrics.
// Writes EDITORIAL_CASES.md (full free readings for rubric scoring) and editorial-metrics.json.
// Cases are found deterministically by search over seeded fictional births; places use GeoNames coordinates.
import {writeFileSync} from 'node:fs';
import {matchPreview} from '../src/lib/match-preview.mjs';
import {storyFromResult, FORBIDDEN, ROMANTIC_WORDS} from '../src/lib/natal-interpretation/index.mjs';
import {CROSS_PAIRS, SIGN_NAMES, BODY_NAMES} from '../src/lib/natal-interpretation/knowledge.mjs';

const CUT = '2026-11-27';
const P = {lima: ['Lima', -12.04318, -77.02824, 'America/Lima'], chiclayo: ['Chiclayo', -6.77008, -79.84088, 'America/Lima'], cusco: ['Cusco', -13.53188, -71.96701, 'America/Lima'], london: ['London', 51.50853, -0.12574, 'Europe/London'], nyc: ['New York City', 40.71427, -74.00597, 'America/New_York'], tokyo: ['Tokyo', 35.6895, 139.69171, 'Asia/Tokyo'], saopaulo: ['Sao Paulo', -23.5475, -46.63611, 'America/Sao_Paulo']};
const birth = (date, time, place) => {const [p, latitude, longitude, zone] = P[place]; return {date, time: time ?? '', unknownTime: !time, place: p, zone, latitude, longitude};};
let seed = 7;
const rnd = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32;};
const pad = n => String(n).padStart(2, '0');
const randomBirth = (place, known = true) => birth(`${1970 + Math.floor(rnd() * 35)}-${pad(1 + Math.floor(rnd() * 12))}-${pad(1 + Math.floor(rnd() * 28))}`, known ? `${pad(Math.floor(rnd() * 24))}:${pad(Math.floor(rnd() * 60))}` : null, place);
const build = (a, b, opts) => {const r = matchPreview(a, b, CUT); return {r, s: storyFromResult(r, {...opts, unknownTime: [a.unknownTime, b.unknownTime]})};};
function search(pred, places, opts, known = [true, true]) {
  for (let i = 0; i < 400; i++) {const a = randomBirth(places[0], known[0]), b = randomBirth(places[1], known[1]); const x = build(a, b, opts); if (x.s && pred(x.s)) return {a, b, ...x};}
  throw new Error('no case found');
}
function searchMin(score, places, opts, n = 300, known = [true, true]) {
  let best = null;
  for (let i = 0; i < n; i++) {const a = randomBirth(places[0], known[0]), b = randomBirth(places[1], known[1]); const x = build(a, b, opts); if (x.s && (!best || score(x.s) < score(best.s))) best = {a, b, ...x};}
  return best;
}
const es = {lang: 'es', names: ['Ana', 'Leo']}, en = {lang: 'en', names: ['Maya', 'Noah']};
const CASES = [
  ['C01 Cartas similares (mismo elemento predominante) · pareja · ES', () => search(s => s.evidence[0].balance.dominantElement === s.evidence[1].balance.dominantElement, ['lima', 'cusco'], {...es, relationship: 'partner'})],
  ['C02 Cartas contrastantes (elementos sin complementariedad) · pareja · ES', () => search(s => {const a = s.evidence[0].balance.dominantElement, b = s.evidence[1].balance.dominantElement; return a && b && a !== b && !['air|fire', 'earth|water'].includes([a, b].sort().join('|'));}, ['chiclayo', 'saopaulo'], {...es, relationship: 'partner'})],
  ['C03 Mismo signo solar, configuraciones distintas · crush · ES', () => search(s => s.evidence[0].placements.Sun?.sign === s.evidence[1].placements.Sun?.sign && s.evidence[0].placements.Moon?.sign !== s.evidence[1].placements.Moon?.sign, ['lima', 'london'], {...es, relationship: 'crush'})],
  ['C04 Horas conocidas · pareja · EN', () => ({a: birth('1988-06-21', '09:15', 'london'), b: birth('1990-12-03', '22:40', 'nyc'), ...build(birth('1988-06-21', '09:15', 'london'), birth('1990-12-03', '22:40', 'nyc'), {...en, relationship: 'partner'})})],
  ['C05 Hora desconocida (persona A) · pareja · ES', () => search(() => true, ['chiclayo', 'lima'], {...es, relationship: 'partner'}, [false, true])],
  ['C06 Ambas horas desconocidas · amistad · EN', () => search(() => true, ['tokyo', 'london'], {...en, relationship: 'friendship'}, [false, false])],
  ['C07 Afinidades y tensiones simultáneas · pareja · ES', () => ({a: birth('1990-03-06', '07:45', 'chiclayo'), b: birth('1995-09-22', '15:30', 'tokyo'), ...build(birth('1990-03-06', '07:45', 'chiclayo'), birth('1995-09-22', '15:30', 'tokyo'), {...es, relationship: 'partner'})})],
  ['C08 Escasa evidencia (ambas horas desconocidas; menos contactos entre 300 parejas) · crush · ES', () => searchMin(s => s.couple.crossAspectIds.length, ['cusco', 'saopaulo'], {...es, relationship: 'crush'}, 300, [false, false])],
  ['C09 Amistad · ES', () => search(s => s.couple.affinities.length > 0, ['lima', 'nyc'], {...es, relationship: 'friendship'})],
  ['C10 Crush · EN', () => search(s => s.couple.tensions.length > 0, ['saopaulo', 'tokyo'], {...en, relationship: 'crush'})],
];

const sentences = t => t.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length > 3);
const NAMES_RE = new RegExp(`\\b(${[...SIGN_NAMES.es, ...SIGN_NAMES.en, ...Object.values(BODY_NAMES.es), ...Object.values(BODY_NAMES.en), 'Ana', 'Leo', 'Maya', 'Noah', 'casa', 'house'].join('|')})\\b`);
function texts(s) {
  const C = s.couple;
  return [...Object.values(C.bridges), ...s.people.flatMap(p => p.sections.map(x => x.text)), ...C.complement, ...C.story.map(x => x.text), ...[...C.affinities, ...C.intense, ...C.tensions].flatMap(c => [c.story, c.daily, c.benefit, c.tip, c.care, c.misunderstanding, c.needX, c.needY, c.action].filter(Boolean)), ...C.daily.map(d => d.text), C.advice.communication, C.advice.needs, C.advice.differences, C.advice.shared, C.advice.space ?? "", ...C.advice.questions, ...C.advice.activities, C.closing].filter(Boolean);
}
const results = [], md = ['# Editorial evaluation corpus (Gate 5)', '', 'Ten fictional pairs (no real people), free edition, each in Spanish and English (20 readings; mirrors use the same births). Generated by `node scripts/editorial-corpus.mjs`. Score each case 1–5 on depth, specificity, variety, coherence, usefulness, naturalness, safety and traceability.', ''];
// Block 4: every case in BOTH languages (same fictional births), so ES and EN repetition are measured on 10
// comparable readings each. Shared = a sentence (names masked) found in ≥ 4 of the 10 readings of that language.
const allSentences = {es: new Map(), en: new Map()};
const relOf = label => /amistad|riendship/i.test(label) ? 'friendship' : /crush/i.test(label) ? 'crush' : 'partner';
const norm = x => x.replace(/\b(Ana|Leo|Maya|Noah)\b/g, 'X');
for (const [label, make] of CASES) {
  const c = make(), primary = / · EN$/.test(label) ? 'en' : 'es';
  for (const lang of [primary, primary === 'es' ? 'en' : 'es']) {
    const s = lang === primary ? c.s : build(c.a, c.b, {...(lang === 'es' ? es : en), relationship: relOf(label)}).s;
    const sent = texts(s).flatMap(sentences);
    for (const x of new Set(sent.map(norm))) allSentences[lang].set(x, (allSentences[lang].get(x) ?? 0) + 1);
    results.push({label: lang === primary ? label : label.replace(/ · (ES|EN)$/, '') + ` · ${lang.toUpperCase()} (mirror)`, lang, c, s, sent});
  }
}
for (const {label, lang, c, s, sent} of results) {
  const cards = [...s.couple.affinities, ...s.couple.intense, ...s.couple.tensions];
  const all = texts(s).join('\n');
  const m = {
    words: s.words,
    personWords: s.people.map(p => p.words),
    specificity: +(sent.filter(x => NAMES_RE.test(x)).length / sent.length * 100).toFixed(1),
    lang, sharedAcrossCases: +(sent.filter(x => allSentences[lang].get(norm(x)) >= 4).length / sent.length * 100).toFixed(1),
    crossContacts: s.couple.crossAspectIds.length,
    affinities: s.couple.affinities.length, intense: s.couple.intense.length, tensions: s.couple.tensions.length,
    genericCards: cards.filter(x => !CROSS_PAIRS[x.key] || CROSS_PAIRS[x.key].alias).length,
    duplicateCardStories: cards.length - new Set(cards.map(x => x.story.replace(/\b(Ana|Leo|Maya|Noah)\b/g, 'X'))).size,
    duplicateTitles: cards.length - new Set(cards.map(x => x.title)).size,
    emptySections: s.people.flatMap(p => p.sections).filter(x => !x.text.trim()).length,
    dailyEvidence: s.couple.daily.filter(d => d.status === 'evidence').length, dailySigns: s.couple.daily.filter(d => d.status === 'signs').length, dailyConversation: s.couple.daily.filter(d => d.status === 'conversation').length,
    sectionsWithEvidence: +(s.people.flatMap(p => p.sections).filter(x => x.evidence.length).length / s.people.flatMap(p => p.sections).length * 100).toFixed(1),
    forbidden: FORBIDDEN.filter(r => r.test(all)).length,
    romanticInFriendship: label.includes('mistad') || label.includes('riendship') ? (ROMANTIC_WORDS.test(all) ? 1 : 0) : null,
    uncertainty: s.uncertainty,
  };
  results.find(r => r.label === label).metrics = m;
  const C = s.couple, N = c.s.people.map(p => p.name);
  md.push(`## ${label}`, '', `Fictional births: A ${c.a.date} ${c.a.time || '(hora desconocida)'} ${c.a.place} · B ${c.b.date} ${c.b.time || '(hora desconocida)'} ${c.b.place}`, '',
    `Metrics: ${m.words} words · specificity ${m.specificity}% · sentences shared with ≥3 other cases ${m.sharedAcrossCases}% · cross contacts ${m.crossContacts} (aff ${m.affinities}, ten ${m.tensions}, generic cards ${m.genericCards}) · daily evidence/signs/conversation ${m.dailyEvidence}/${m.dailySigns}/${m.dailyConversation} · forbidden ${m.forbidden}`, '',
    `### ${C.title}`, '', ...s.people.flatMap((p, i) => [`**${C.bridges[i + 1]}**`, '', ...p.sections.map(x => `- *${x.title}:* ${x.text}`), '']),
    `**${C.bridges[3]}**`, '', ...C.story.map(x => x.text), '', ...C.complement.map(x => `> ${x}`), '',
    ...[...C.affinities.map(x => ['+', x]), ...C.intense.map(x => ['±', x]), ...C.tensions.map(x => ['−', x])].map(([t, x]) => `- ${t} **${x.title}.** ${x.story} ${x.daily} ${x.benefit ?? x.misunderstanding ?? ''} ${x.tip ?? x.action ?? ''} ${x.care ?? ''} _(${x.technical})_`), '',
    ...C.daily.map(d => `- ${d.title} [${d.status}]: ${d.text}`), '', `*${C.advice.communication}* ${C.advice.needs} ${C.advice.differences}`, '', C.closing, '');
}
const table = ['| Case | Words | Spec. % | Shared % | Contacts | Generic cards | Daily ev/sign/conv | Sections w/ evidence % | Forbidden |', '|---|---|---|---|---|---|---|---|---|',
  ...results.map(({label, lang, metrics: m}) => `| ${label.split(' ')[0]} ${lang.toUpperCase()}${/mirror/.test(label) ? '*' : ''} | ${m.words} | ${m.specificity} | ${m.sharedAcrossCases} | ${m.crossContacts} | ${m.genericCards} | ${m.dailyEvidence}/${m.dailySigns}/${m.dailyConversation} | ${m.sectionsWithEvidence} | ${m.forbidden}${m.romanticInFriendship ? ' (romance!)' : ''} |`)];
md.splice(4, 0, '## Automatic metrics', '', ...table, '', 'Specificity = sentences that name a sign, planet, house or person. Shared = sentences (names masked) that appear verbatim in at least 4 of the 10 readings of the same language, a genericity signal; ES and EN are measured separately.', '');
writeFileSync('EDITORIAL_CASES.md', md.join('\n'));
writeFileSync('editorial-metrics.json', JSON.stringify(results.map(r => ({label: r.label, ...r.metrics})), null, 1));
console.log(table.join('\n'));
