// LAYER B (deterministic) — chaptered narrative built only from Layer A evidence.
// Every section lists the evidence ids it relies on. No scores are produced or changed here.
import {SIGNS, SIGN_NAMES, ELEMENT_TEXT, MODALITY_TEXT, HOUSES as HOUSES_ALL, HOUSES_FRIENDSHIP, ROMANTIC_WORDS, DOMAINS, DOMAINS_ART, BODY_NAMES, ASPECT_NAMES, NATAL_NATURE, NATAL_PAIRS, CROSS_PAIRS, FRIENDSHIP_OVERRIDE, DAILY_AREAS, COUPLE_TITLES, KB_VERSION} from './knowledge.mjs';
import {natalAspects} from './evidence.mjs';

export const NARRATIVE_VERSION = 'cosmic-story-0.1';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (s, map) => s.replace(/\{(\w+)\}/g, (_, k) => map[k] ?? '');
const words = s => (s.match(/[\p{L}\p{N}’']+/gu) ?? []).length;

const TITLES = {
  es: ['En esencia', 'Su mundo emocional', 'Cómo le perciben los demás', 'Cómo piensa y se comunica', 'Cómo expresa y recibe cariño', 'Qué podría motivarle', 'Cómo podría reaccionar ante las diferencias', 'Fortalezas simbólicas', 'Posibles desafíos', 'Oportunidades de crecimiento', 'Su historia en breve'],
  en: ['In essence', 'Emotional world', 'How others perceive them', 'How they think and communicate', 'How they give and receive affection', 'What might motivate them', 'How they might respond to differences', 'Symbolic strengths', 'Possible challenges', 'Growth opportunities', 'Their story in brief'],
};
const KEYS = ['essence', 'emotional', 'perceived', 'mind', 'affection', 'motivation', 'differences', 'strengths', 'challenges', 'growth', 'summary'];

let HOUSES = HOUSES_ALL, FRIENDSHIP = false; // set per call (pure: reset on every entry point)
function aspectText(asp, lang) {
  const key = [asp.a, asp.b].sort().join('|');
  const lib = NATAL_PAIRS[key]?.[lang];
  const text = lib?.[asp.tone === 'harmonious' ? 'easy' : 'hard'];
  if (text && !(FRIENDSHIP && ROMANTIC_WORDS.test(text))) return text;
  const base = fill(NATAL_NATURE[lang][asp.type], {a: DOMAINS[lang][asp.a], b: DOMAINS[lang][asp.b]});
  // A conjunction with Mars/Saturn/Uranus/Pluto is read as tense: say why.
  return asp.type === 'conjunction' && asp.tone === 'tense' ? base + (lang === 'es' ? ', lo que puede volver más intensas sus reacciones' : ', which can make reactions more intense') : base;
}

/** Individual reading for one person (chapter 1 / 2). */
export function personReading(ev, {lang = 'es', name, premium = false, relationship = 'partner'} = {}) {
  FRIENDSHIP = relationship === 'friendship'; HOUSES = FRIENDSHIP ? HOUSES_FRIENDSHIP : HOUSES_ALL;
  const es = lang === 'es', N = name, P = ev.placements, S = i => SIGNS[i][lang], sn = i => SIGN_NAMES[lang][i];
  const used = new Set(); // avoid repeating the same sign phrase twice
  const phrase = (sign, fields) => {for (const f of fields) {const k = sign + ':' + f; if (!used.has(k)) {used.add(k); return S(sign)[f];}} return null;};
  const sections = [];
  const add = (i, parts, evidence) => sections.push({key: KEYS[i], title: TITLES[lang][i], text: parts.filter(Boolean).join(' '), evidence: [...new Set(evidence)]});
  const aspFor = (body, tone) => ev.aspects.filter(a => (a.a === body || a.b === body) && (!tone || a.tone === tone));
  const usedAsp = new Set();
  const takeAsp = list => {const a = list.find(x => !usedAsp.has(x.id)); if (a) usedAsp.add(a.id); return a;};
  const dom = ev.balance.dominantElement, mod = ev.balance.dominantModality;

  // 1 Essence — Sun
  const sun = P.Sun;
  {
    const parts = [es ? `${N} tiene el Sol en ${sn(sun.sign)}: una identidad ${phrase(sun.sign, ['style'])}. Su recurso más visible es ${phrase(sun.sign, ['gift'])}.` : `${N} has the Sun in ${sn(sun.sign)}: an identity that is ${phrase(sun.sign, ['style'])}. Their most visible resource is ${phrase(sun.sign, ['gift'])}.`];
    const ids = ['placement:Sun'];
    if (sun.house) {parts.push(es ? `Esa energía tiende a dirigirse hacia ${HOUSES.es[sun.house - 1]}.` : `That energy tends to flow toward ${HOUSES.en[sun.house - 1]}.`);}
    const st = ev.stelliums.find(s => s.bodies.includes('Sun'));
    if (st) {parts.push(es ? `Además, varios planetas se reúnen en ${sn(st.sign)}, lo que intensifica este tono.` : `Several planets also gather in ${sn(st.sign)}, intensifying this tone.`); ids.push(st.id);}
    if (premium) {const a = takeAsp(aspFor('Sun')); if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}}
    add(0, parts, ids);
  }
  // 2 Emotional world — Moon (exact, stable sign, or uncertain)
  {
    const parts = [], ids = [];
    if (P.Moon && !P.Moon.stableOnly) {
      parts.push(es ? `Con la Luna en ${sn(P.Moon.sign)}, su mundo emocional busca ${phrase(P.Moon.sign, ['need'])}.` : `With the Moon in ${sn(P.Moon.sign)}, their emotional world seeks ${phrase(P.Moon.sign, ['need'])}.`);
      const sh = phrase(P.Moon.sign, ['shadow']);
      if (sh) parts.push(es ? `En momentos difíciles, podría tender a ${sh}.` : `In difficult moments, they might tend toward ${sh}.`);
      if (premium && P.Moon.house) parts.push(es ? `Sus emociones se mueven especialmente en torno a ${HOUSES.es[P.Moon.house - 1]}.` : `Their emotions move especially around ${HOUSES.en[P.Moon.house - 1]}.`);
      ids.push('placement:Moon');
    } else if (P.Moon?.stableOnly) {
      parts.push(es ? `Aunque no conocemos la hora exacta, la Luna permaneció todo ese día en ${sn(P.Moon.sign)}: su mundo emocional busca ${phrase(P.Moon.sign, ['need'])}. No afirmamos detalles que dependan del grado exacto.` : `Although the exact time is unknown, the Moon stayed in ${sn(P.Moon.sign)} all that day: their emotional world seeks ${phrase(P.Moon.sign, ['need'])}. We make no claims that depend on the exact degree.`);
      ids.push('placement:Moon');
    } else {
      const signs = (ev.moon.signs ?? []).map(sn);
      parts.push(signs.length > 1 ? (es ? `Sin hora exacta, la Luna pudo estar en ${signs.join(' o en ')} ese día, así que no describimos su mundo emocional con certeza. Es un buen tema para que ${N} lo cuente con sus propias palabras.` : `Without an exact time, the Moon could have been in ${signs.join(' or ')} that day, so we do not describe their emotional world with certainty. It is a good topic for ${N} to describe in their own words.`)
        : (es ? `Sin hora exacta no describimos su mundo emocional con certeza.` : `Without an exact time we do not describe their emotional world with certainty.`));
    }
    const a = P.Moon && !P.Moon.stableOnly ? takeAsp(aspFor('Moon')) : null;
    if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(1, parts, ids);
  }
  // 3 Perceived — Ascendant
  {
    const parts = [], ids = [];
    if (P.Ascendant) {
      parts.push(es ? `Con el Ascendente en ${sn(P.Ascendant.sign)}, la primera impresión que transmite suele ser ${phrase(P.Ascendant.sign, ['style', 'gift'])}.` : `With the Ascendant in ${sn(P.Ascendant.sign)}, the first impression they give tends to be ${phrase(P.Ascendant.sign, ['style', 'gift'])}.`);
      parts.push(P.Ascendant.element === sun.element ? (es ? 'Lo que muestra y lo que es por dentro suelen parecerse.' : 'What they show and who they are inside tend to match.') : (es ? `Quienes le conocen poco podrían percibir algo distinto de lo que ${N} vive por dentro.` : `People who know them a little might perceive something different from what ${N} lives inside.`));
      ids.push('placement:Ascendant', 'placement:Sun');
    } else {
      parts.push(es ? `Sin la hora de nacimiento no podemos calcular el Ascendente, que describe la primera impresión. Lo más estable es su Sol en ${sn(sun.sign)}, que suele notarse cuando hay confianza.` : `Without the birth time we cannot calculate the Ascendant, which describes first impressions. The most stable element is their Sun in ${sn(sun.sign)}, which tends to show once trust is built.`);
      ids.push('placement:Sun');
    }
    add(2, parts, ids);
  }
  // 4 Mind — Mercury
  {
    const m = P.Mercury, ids = ['placement:Mercury'];
    const same = m.sign === sun.sign;
    const parts = [es ? `Su manera de pensar y comunicar, con Mercurio en ${sn(m.sign)}, tiende a ser ${same ? 'coherente con su Sol' : phrase(m.sign, ['style', 'gift'])}${same ? ', con el mismo sello de ese signo' : ''}.` : `Their way of thinking and communicating, with Mercury in ${sn(m.sign)}, tends to be ${same ? 'consistent with their Sun' : phrase(m.sign, ['style', 'gift'])}${same ? ', sharing that sign\'s signature' : ''}.`];
    const a = premium ? takeAsp(aspFor('Mercury')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(3, parts, ids);
  }
  // 5 Affection — Venus
  {
    const v = P.Venus, ids = ['placement:Venus'];
    const parts = [es ? `Con Venus en ${sn(v.sign)}, suele expresar el cariño ${S(v.sign).love}.` : `With Venus in ${sn(v.sign)}, they tend to express affection ${S(v.sign).love}.`];
    const need = phrase(v.sign, ['need']);
    if (need) parts.push(es ? `Para sentir que le quieren de verdad, valora ${need}.` : `To feel truly loved, they value ${need}.`);
    const a = premium ? takeAsp(aspFor('Venus')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(4, parts, ids);
  }
  // 6 Motivation — Sun need, Midheaven, Jupiter
  {
    const parts = [], ids = ['placement:Sun'];
    const need = phrase(sun.sign, ['need']);
    if (need) parts.push(es ? `Lo que más le motiva, según su Sol: ${need}.` : `What motivates them most, according to their Sun: ${need}.`);
    if (P.Midheaven) {parts.push(es ? `En lo vocacional, el Medio Cielo en ${sn(P.Midheaven.sign)} apunta a metas que piden ${S(P.Midheaven.sign).gift}.` : `Vocationally, the Midheaven in ${sn(P.Midheaven.sign)} points to goals that call for ${S(P.Midheaven.sign).gift}.`); ids.push('placement:Midheaven');}
    if (premium && P.Jupiter) {parts.push(es ? `Con Júpiter en ${sn(P.Jupiter.sign)}, crece a través de ${S(P.Jupiter.sign).gift}.` : `With Jupiter in ${sn(P.Jupiter.sign)}, they grow through ${S(P.Jupiter.sign).gift}.`); ids.push('placement:Jupiter');}
    add(5, parts, ids);
  }
  // 7 Differences — Mars
  {
    const ma = P.Mars, ids = ['placement:Mars'];
    const parts = [es ? `Frente a las diferencias, Marte en ${sn(ma.sign)} sugiere una forma de actuar ${phrase(ma.sign, ['style', 'gift']) ?? 'con el mismo tono ya descrito'}.` : `Facing differences, Mars in ${sn(ma.sign)} suggests a way of acting that is ${phrase(ma.sign, ['style', 'gift']) ?? 'in the same tone described above'}.`];
    const sh = phrase(ma.sign, ['shadow']);
    if (sh) parts.push(es ? `Un punto a cuidar podría ser ${sh}.` : `A point to watch might be ${sh}.`);
    const a = premium ? takeAsp(aspFor('Mars', 'tense')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(6, parts, ids);
  }
  // 8 Strengths — harmonious aspects + dominant element
  {
    const parts = [], ids = [`element:${dom}`];
    const list = ev.aspects.filter(a => a.tone === 'harmonious' && !usedAsp.has(a.id)).slice(0, premium ? 4 : 1);
    for (const a of list) {usedAsp.add(a.id); parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    parts.push(es ? `Su elemento predominante, ${ELEMENT_TEXT[dom].es.name}, aporta ${ELEMENT_TEXT[dom].es.gift}.` : `Their dominant element, ${dom}, brings ${ELEMENT_TEXT[dom].en.gift}.`);
    add(7, parts, ids);
  }
  // 9 Challenges — tense aspects (never invented)
  {
    const parts = [], ids = [];
    const list = ev.aspects.filter(a => a.tone === 'tense' && !usedAsp.has(a.id)).slice(0, premium ? 4 : 1);
    for (const a of list) {usedAsp.add(a.id); parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    if (!list.length) {parts.push(es ? `No aparecen tensiones internas marcadas entre sus puntos principales; su reto podría estar más bien en ${S(sun.sign).shadow}.` : `No marked inner tensions appear among their main points; their challenge might rather lie in ${S(sun.sign).shadow}.`); ids.push('placement:Sun');}
    add(8, parts, ids);
  }
  // 10 Growth — North Node, lacking element, Saturn (premium)
  {
    const parts = [], ids = [];
    if (P.NorthNode) {parts.push(es ? `Su Nodo Norte en ${sn(P.NorthNode.sign)} señala como camino de crecimiento ${S(P.NorthNode.sign).gift}.` : `Their North Node in ${sn(P.NorthNode.sign)} points to a growth path of ${S(P.NorthNode.sign).gift}.`); ids.push('placement:NorthNode');}
    const lack = ev.balance.lackingElements[0];
    if (lack) {parts.push(es ? `También podría beneficiarse de ${ELEMENT_TEXT[lack].es.lack}.` : `They might also benefit from ${ELEMENT_TEXT[lack].en.lack}.`); ids.push(`lacking:${lack}`);}
    if (premium && P.Saturn) {parts.push(es ? `Saturno en ${sn(P.Saturn.sign)} indica dónde construye madurez con el tiempo: ${S(P.Saturn.sign).gift}.` : `Saturn in ${sn(P.Saturn.sign)} shows where maturity is built over time: ${S(P.Saturn.sign).gift}.`); ids.push('placement:Saturn');}
    add(9, parts, ids);
  }
  // 11 Summary
  {
    const core = [`${es ? 'Sol' : 'Sun'} ${es ? 'en' : 'in'} ${sn(sun.sign)}`];
    if (P.Moon) core.push(`${es ? 'Luna' : 'Moon'} ${es ? 'en' : 'in'} ${sn(P.Moon.sign)}`);
    if (P.Ascendant) core.push(`${es ? 'Ascendente' : 'Ascendant'} ${es ? 'en' : 'in'} ${sn(P.Ascendant.sign)}`);
    const parts = [es ? `En síntesis, ${N} combina ${ELEMENT_TEXT[dom].es.gift} con ${MODALITY_TEXT[mod].es}.` : `In short, ${N} combines ${ELEMENT_TEXT[dom].en.gift} with ${MODALITY_TEXT[mod].en}.`,
      es ? `${core.join(', ').replace(/, ([^,]*)$/, ' y $1')} forman el núcleo de su carta.` : `${core.join(', ').replace(/, ([^,]*)$/, ' and $1')} form the core of their chart.`];
    if (!premium) parts.pop();
    add(10, parts, [`element:${dom}`, `modality:${mod}`, ...core.map((_, i) => `placement:${['Sun', 'Moon', 'Ascendant'].filter(k => P[k])[i]}`)]);
  }
  // Premium: planet-by-planet detail with houses.
  const details = [];
  if (premium) {
    for (const k of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
      const pl = P[k]; if (!pl || pl.stableOnly) continue;
      const house = pl.house ? (es ? ` En la casa ${pl.house}, este tema se expresa sobre todo en ${HOUSES.es[pl.house - 1]}.` : ` In house ${pl.house}, this theme is expressed mostly through ${HOUSES.en[pl.house - 1]}.`) : '';
      details.push({point: k, text: (es ? `${BODY_NAMES.es[k]} en ${sn(pl.sign)}: su ${DOMAINS.es[k]} adopta un tono ${S(pl.sign).style}.` : `${BODY_NAMES.en[k]} in ${sn(pl.sign)}: their ${DOMAINS.en[k]} takes on a ${S(pl.sign).style} tone.`) + house, evidence: [`placement:${k}`]});
    }
  }
  if (premium) {
    const el = ev.balance.elements, md = ev.balance.modalities, t = ev.balance.totalWeight || 1;
    const pct = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${es ? (ELEMENT_TEXT[k]?.es.name ?? {cardinal: 'cardinal', fixed: 'fija', mutable: 'mutable'}[k]) : k} ${Math.round(v / t * 100)}%`).join(', ');
    details.push({point: 'balance', text: es ? `Distribución simbólica de energías (ponderada por Sol, Luna, Ascendente y planetas personales): ${pct(el)}. Modalidades: ${pct(md)}. Predomina ${MODALITY_TEXT[mod].es}.` : `Symbolic distribution of energies (weighted by Sun, Moon, Ascendant and personal planets): ${pct(el)}. Modalities: ${pct(md)}. Dominant: ${MODALITY_TEXT[mod].en}.`, evidence: ev.balance.ids});
    for (const h of ev.emphasisHouses) details.push({point: 'house-' + h.house, text: es ? `Varios planetas (${h.bodies.map(b => BODY_NAMES.es[b]).join(', ')}) se concentran en la casa ${h.house}: ${HOUSES.es[h.house - 1]} es un escenario importante en su carta.` : `Several planets (${h.bodies.map(b => BODY_NAMES.en[b]).join(', ')}) gather in house ${h.house}: ${HOUSES.en[h.house - 1]} is an important stage in their chart.`, evidence: [h.id]});
  }
  const all = sections.map(s => s.text).join(' ') + ' ' + details.map(d => d.text).join(' ');
  return {name: N, sections, details, words: words(all)};
}

// ---------- Couple ----------
const OUTER = new Set(['Uranus', 'Neptune', 'Pluto']);
function crossAspects(evA, evB) {
  const pts = ev => Object.fromEntries(Object.entries(ev.placements).filter(([k, p]) => !p.stableOnly && k !== 'NorthNode' && p.lon !== undefined).map(([k, p]) => [k, p.lon]));
  const A = pts(evA), B = pts(evB), out = [];
  // Reuse the natal orb logic by evaluating each cross pair as a two-point chart.
  for (const [ka, la] of Object.entries(A)) for (const [kb, lb] of Object.entries(B)) {
    if (OUTER.has(ka) && OUTER.has(kb)) continue;
    if (ka === kb && ka === 'Midheaven') continue;
    const asp = natalAspects(ka === kb ? {[ka]: la, [kb + '\u0000']: lb} : {[ka]: la, [kb]: lb})[0];
    if (!asp) continue;
    const key = [ka, kb].sort().join('|');
    out.push({id: `cross:A.${ka}-B.${kb}:${asp.type}`, a: ka, b: kb, key, type: asp.type, deviation: asp.deviation, orb: asp.orb, tone: ka === kb && asp.type === 'conjunction' ? 'harmonious' : asp.tone, priority: asp.priority});
  }
  return out.sort((p, q) => (CROSS_PAIRS[q.key] ? 1 : 0) - (CROSS_PAIRS[p.key] ? 1 : 0) || q.priority - p.priority || p.id.localeCompare(q.id));
}
const elementRelation = (e1, e2) => e1 === e2 ? 'same' : [e1, e2].sort().join('|') === 'air|fire' || [e1, e2].sort().join('|') === 'earth|water' ? 'complementary' : 'different';

function crossCard(c, {lang, names, relationship}) {
  const es = lang === 'es', lib = CROSS_PAIRS[c.key];
  const tone = c.tone === 'harmonious' ? 'easy' : 'hard';
  const friendship = relationship === 'friendship';
  let src = lib ? (friendship && lib.romantic ? FRIENDSHIP_OVERRIDE[lang] : lib[lang]) : null;
  // {X} owns lib.x body; for same-body pairs person A is {X}.
  const xIsA = !lib?.x || c.a === lib.x;
  const map = {X: xIsA ? names[0] : names[1], Y: xIsA ? names[1] : names[0]};
  const technical = `${BODY_NAMES[lang][c.a]} (${names[0]}) · ${ASPECT_NAMES[lang][c.type]} · ${BODY_NAMES[lang][c.b]} (${names[1]}) · ${c.deviation}° / ${c.orb}°`;
  if (!src) {
    const art = DOMAINS_ART[lang];
    const g = es ? {title: [`${cap(art[c.a])} y ${art[c.b]}`, `${cap(art[c.a])} frente a ${art[c.b]}`],
      easy: {story: `${art[c.a]} de {A} y ${art[c.b]} de {B} tienden a armonizar`, daily: 'puede notarse como facilidad para coincidir en este tema', benefit: 'un punto de encuentro natural', tip: 'reconozcan juntos este punto de encuentro y apóyense en él'},
      hard: {story: `${art[c.a]} de {A} y ${art[c.b]} de {B} pueden pedir cosas distintas`, daily: 'puede notarse como pequeñas fricciones en este tema', misunderstanding: 'suponer que el otro reacciona igual', needX: '{A} puede necesitar explicar qué le importa en este tema', needY: '{B} puede necesitar hacer lo mismo desde su lado', action: 'conversen sobre este tema sin buscar quién tiene razón'}}
      : {title: [`${cap(art[c.a])} and ${art[c.b]}`, `${cap(art[c.a])} versus ${art[c.b]}`],
      easy: {story: `{A}'s ${art[c.a]} and {B}'s ${art[c.b]} tend to harmonise`, daily: 'it may show as ease in agreeing on this topic', benefit: 'a natural meeting point', tip: 'acknowledge this meeting point together and lean on it'},
      hard: {story: `{A}'s ${art[c.a]} and {B}'s ${art[c.b]} may ask for different things`, daily: 'it may show as small frictions on this topic', misunderstanding: 'assuming the other reacts the same way', needX: '{A} may need to explain what matters to them here', needY: '{B} may need to do the same from their side', action: 'talk about this topic without looking for who is right'}};
    src = g; map.A = names[0]; map.B = names[1]; map.X = names[0]; map.Y = names[1];
  }
  const t = src[tone];
  const f = s => s ? cap(fill(s, map)) : undefined;
  return {id: c.id, key: c.key, area: lib?.area ?? 'general', tone: c.tone, title: src.title[tone === 'easy' ? 0 : 1], story: f(t.story) + '.', daily: f(t.daily) + '.',
    ...(tone === 'easy' ? {benefit: f(t.benefit) + '.', tip: f(t.tip) + '.'} : {misunderstanding: f(t.misunderstanding) + '.', needX: f(t.needX) + '.', needY: f(t.needY) + '.', action: f(t.action) + '.'}),
    technical, evidence: [c.id]};
}

export function coupleStory(evA, evB, {lang = 'es', names = ['A', 'B'], relationship = 'partner', premium = false} = {}) {
  FRIENDSHIP = relationship === 'friendship'; HOUSES = FRIENDSHIP ? HOUSES_FRIENDSHIP : HOUSES_ALL;
  const es = lang === 'es', E = ELEMENT_TEXT, sn = i => SIGN_NAMES[lang][i];
  const cross = crossAspects(evA, evB);
  const seen = new Set();
  const pick = tone => cross.filter(c => c.tone === tone && !seen.has(c.key) && (seen.add(c.key), true));
  const affinitiesAll = pick('harmonious').map(c => crossCard(c, {lang, names, relationship}));
  const tensionsAll = pick('tense').map(c => crossCard(c, {lang, names, relationship}));
  const affinities = affinitiesAll.slice(0, premium ? 8 : 3), tensions = tensionsAll.slice(0, premium ? 6 : 2);
  const dA = evA.balance.dominantElement, dB = evB.balance.dominantElement;
  const title = COUPLE_TITLES[[dA, dB].sort().join('|')][lang];
  // Chapter 3 — joint story.
  const rel = elementRelation(dA, dB);
  const story = [];
  story.push({text: es ? `${names[0]} trae a este vínculo ${E[dA].es.gift}, y ${names[1]} aporta ${dA === dB ? 'esa misma base, vivida a su manera' : E[dB].es.gift}. ${rel === 'same' ? 'Comparten un mismo elemento predominante, lo que puede dar una sensación de lenguaje común.' : rel === 'complementary' ? 'Sus elementos predominantes suelen complementarse: lo que a uno le sobra, al otro puede servirle.' : 'Sus elementos predominantes son distintos, y esa diferencia puede ser tanto un descubrimiento como un aprendizaje.'}`
    : `${names[0]} brings ${E[dA].en.gift} to this bond, and ${names[1]} contributes ${dA === dB ? 'that same foundation, lived in their own way' : E[dB].en.gift}. ${rel === 'same' ? 'They share the same dominant element, which may feel like a common language.' : rel === 'complementary' ? 'Their dominant elements tend to complement each other: what one has plenty of may help the other.' : 'Their dominant elements differ, and that difference can be both a discovery and a lesson.'}`, evidence: [`A:element:${dA}`, `B:element:${dB}`]});
  // What each may discover in the other: the other's Sun gift.
  story.push({text: es ? `${names[0]} podría descubrir en ${names[1]} ${SIGNS[evB.placements.Sun.sign].es.gift}; ${names[1]} podría encontrar en ${names[0]} ${SIGNS[evA.placements.Sun.sign].es.gift}.` : `${names[0]} might discover in ${names[1]} ${SIGNS[evB.placements.Sun.sign].en.gift}; ${names[1]} might find in ${names[0]} ${SIGNS[evA.placements.Sun.sign].en.gift}.`, evidence: ['A:placement:Sun', 'B:placement:Sun']});
  if (affinities[0]) story.push({text: es ? `Su afinidad más clara tiene que ver con «${affinities[0].title.toLowerCase()}». ${affinities[0].story}` : `Their clearest affinity relates to "${affinities[0].title.toLowerCase()}". ${affinities[0].story}`, evidence: affinities[0].evidence});
  if (tensions[0]) story.push({text: es ? `Al mismo tiempo, la lectura invita a cuidar un punto: «${tensions[0].title.toLowerCase()}». ${tensions[0].story}` : `At the same time, the reading invites care around one point: "${tensions[0].title.toLowerCase()}". ${tensions[0].story}`, evidence: tensions[0].evidence});
  // Needs interpreted differently: Moon signs if both available.
  const mA = evA.placements.Moon, mB = evB.placements.Moon;
  if (mA && mB) story.push({text: es ? `En lo emocional, ${names[0]} busca ${SIGNS[mA.sign].es.need}, mientras ${names[1]} busca ${SIGNS[mB.sign].es.need}. ${mA.element === mB.element ? 'Son necesidades parecidas, aunque cada uno las exprese a su manera.' : 'Son necesidades distintas, y conviene nombrarlas para no interpretarlas como falta de interés.'}` : `Emotionally, ${names[0]} seeks ${SIGNS[mA.sign].en.need}, while ${names[1]} seeks ${SIGNS[mB.sign].en.need}. ${mA.element === mB.element ? 'These needs are similar, even if each expresses them differently.' : 'These needs differ, and naming them helps avoid reading them as disinterest.'}`, evidence: ['A:placement:Moon', 'B:placement:Moon']});
  else story.push({text: es ? 'Como al menos una hora de nacimiento es desconocida, no comparamos sus lunas con precisión; sus necesidades emocionales son un tema ideal para conversar directamente.' : 'Since at least one birth time is unknown, we do not compare their Moons precisely; their emotional needs are an ideal topic to discuss directly.', evidence: []});
  // Growth: one's dominant element covers the other's lacking one.
  const gives = [];
  for (const [g, r, gi, ri] of [[evA, evB, 0, 1], [evB, evA, 1, 0]]) {
    const lack = r.balance.lackingElements.find(e => e === g.balance.dominantElement);
    if (lack) gives.push(es ? `${names[gi]} puede ayudar a ${names[ri]} con ${E[lack].es.lack}` : `${names[gi]} can help ${names[ri]} with ${E[lack].en.lack}`);
  }
  if (gives.length) story.push({text: cap(gives.join(es ? '; y ' : '; and ')) + '.', evidence: ['A:balance', 'B:balance']});
  // Premium: bidirectional whole-sign house overlays (only into charts with a known Ascendant).
  const overlays = [];
  if (premium) for (const [src, dst, si, di] of [[evA, evB, 0, 1], [evB, evA, 1, 0]]) {
    const asc = dst.placements.Ascendant; if (!asc) continue;
    for (const body of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']) {
      const pl = src.placements[body]; if (!pl || pl.stableOnly) continue;
      const house = ((pl.sign - asc.sign + 12) % 12) + 1;
      overlays.push({id: `overlay:${'AB'[si]}.${body}-in-${'AB'[di]}.H${house}`, text: es ? `${DOMAINS_ART.es[body].replace(/^la |^el /, m => m === 'la ' ? 'La ' : 'El ')} de ${names[si]} (${BODY_NAMES.es[body]}) toca la casa ${house} de ${names[di]}: puede activar en ${names[di]} temas de ${HOUSES.es[house - 1]}.` : `${names[si]}'s ${DOMAINS_ART.en[body]} (${BODY_NAMES.en[body]}) falls in ${names[di]}'s house ${house}: it may stir ${names[di]}'s themes of ${HOUSES.en[house - 1]}.`});
    }
  }
  // Chapter 6 — daily life areas.
  const usedDaily = new Set();
  const daily = DAILY_AREAS.filter(a => !(a.romantic && relationship === 'friendship')).map(area => {
    const ev = [...affinitiesAll, ...tensionsAll].filter(c => area.pairs.includes(c.key) && !usedDaily.has(c.id));
    if (ev.length) {
      const c = ev[0]; usedDaily.add(c.id);
      return {key: area.key, title: area[lang], status: 'evidence', tone: c.tone, text: premium ? c.story + ' ' + (c.tone === 'harmonious' ? c.tip : c.action) : c.story, evidence: [c.id]};
    }
    const pa = area.compare && evA.placements[area.compare], pb = area.compare && evB.placements[area.compare];
    if (pa && pb && !pa.stableOnly && !pb.stableOnly) {
      const r = elementRelation(pa.element, pb.element);
      const body = BODY_NAMES[lang][area.compare];
      return {key: area.key, title: area[lang], status: 'signs', tone: r === 'different' ? 'tense' : 'harmonious',
        text: es ? `${body} de ${names[0]} en ${sn(pa.sign)} y de ${names[1]} en ${sn(pb.sign)}: ${r === 'same' ? 'un estilo parecido en este terreno' : r === 'complementary' ? 'estilos que pueden complementarse' : 'estilos distintos que conviene conocer'}. No hay un aspecto directo que lo confirme, así que tómenlo como punto de partida para conversar.` : `${body} of ${names[0]} in ${sn(pa.sign)} and of ${names[1]} in ${sn(pb.sign)}: ${r === 'same' ? 'a similar style here' : r === 'complementary' ? 'styles that may complement each other' : 'different styles worth getting to know'}. No direct aspect confirms it, so take it as a starting point for conversation.`,
        evidence: [`A:placement:${area.compare}`, `B:placement:${area.compare}`]};
    }
    return {key: area.key, title: area[lang], status: 'conversation', tone: 'neutral', text: es ? 'No hay evidencia astrológica suficiente en este terreno: es un tema para conversar, no una conclusión.' : 'There is not enough astrological evidence here: it is a topic to discuss, not a conclusion.', evidence: []};
  });
  // Chapter 7 — advice, adapted to the relationship.
  const relWord = es ? {partner: 'como pareja', crush: 'mientras se conocen', friendship: 'como amigos'}[relationship] : {partner: 'as a couple', crush: 'while getting to know each other', friendship: 'as friends'}[relationship];
  const merc = cross.find(c => c.key === 'Mercury|Mercury' || c.key === 'Mercury|Moon');
  const advice = {
    communication: es ? (merc?.tone === 'tense' ? `Para comunicarse mejor ${relWord}, repitan con sus palabras lo que entendieron antes de responder.` : `Para comunicarse mejor ${relWord}, aprovechen la conversación también para hablar de emociones, no solo de planes.`) : (merc?.tone === 'tense' ? `To communicate better ${relWord}, repeat in your own words what you understood before replying.` : `To communicate better ${relWord}, use conversation for feelings too, not only plans.`),
    needs: mA && mB ? (es ? `${names[0]} puede pedir ${SIGNS[mA.sign].es.need}; ${names[1]} puede pedir ${SIGNS[mB.sign].es.need}. Decirlo en voz alta evita suposiciones.` : `${names[0]} can ask for ${SIGNS[mA.sign].en.need}; ${names[1]} can ask for ${SIGNS[mB.sign].en.need}. Saying it out loud avoids assumptions.`) : (es ? 'Cuéntense qué necesita cada uno para sentirse bien en un día difícil.' : 'Tell each other what you each need to feel well on a hard day.'),
    differences: tensions[0] ? tensions[0].action : (es ? 'Cuando surja una diferencia, busquen primero entender antes que convencer.' : 'When a difference arises, seek to understand before convincing.'),
    shared: affinities[0] ? affinities[0].tip : (es ? 'Prueben juntos una actividad nueva para descubrir gustos en común.' : 'Try a new activity together to discover shared tastes.'),
    space: es ? 'Respeten los espacios individuales: tener intereses propios también nutre el vínculo.' : 'Respect individual space: having your own interests also nourishes the bond.',
    questions: es ? ['¿Qué te hace sentir valorado o valorada en este vínculo?', '¿Qué te gustaría que hiciéramos más seguido?', '¿Cómo prefieres que hablemos de un desacuerdo?'] : ['What makes you feel valued in this bond?', 'What would you like us to do more often?', 'How do you prefer we talk about a disagreement?'],
    activities: (es ? {partner: ['Una cena sin pantallas para contarse un deseo para este año.', 'Escribir cada uno tres gestos que le hacen sentir querido o querida.', 'Planear juntos una salida que ninguno haya hecho.'], crush: ['Un paseo para conversar sobre lo que a cada uno le apasiona.', 'Compartir una canción o un libro importante y contar por qué.', 'Proponer un plan sencillo que muestre el mundo del otro.'], friendship: ['Elegir juntos un taller o actividad nueva.', 'Compartir una recomendación (libro, serie, lugar) y comentarla después.', 'Preguntarse en qué proyecto personal podría apoyarse cada uno.']} : {partner: ['A screen-free dinner where each shares a wish for this year.', 'Each write three gestures that make you feel loved.', 'Plan an outing neither of you has done.'], crush: ['A walk to talk about what each of you is passionate about.', 'Share an important song or book and explain why.', 'Propose a simple plan that shows the other your world.'], friendship: ['Choose a new class or activity together.', 'Share a recommendation (book, show, place) and discuss it later.', 'Ask each other which personal project you could support.']})[relationship],
  };
  // Chapter 8 — closing.
  const closing = es ? `${title}. ${names[0]} y ${names[1]} no comparten un destino escrito: comparten la posibilidad de conocerse mejor. ${affinities.length ? `Tienen puntos de encuentro reales, como «${affinities[0].title.toLowerCase()}», ` : 'Sus puntos de encuentro están por descubrirse, '}${tensions.length ? `y también diferencias que, conversadas con cuidado, pueden convertirse en aprendizaje.` : 'y las diferencias que aparezcan pueden abordarse con curiosidad.'} Esta lectura es simbólica: lo que construyan dependerá de cómo se escuchen.`
    : `${title}. ${names[0]} and ${names[1]} do not share a written fate: they share the chance to know each other better. ${affinities.length ? `They have real meeting points, such as "${affinities[0].title.toLowerCase()}", ` : 'Their meeting points are still to be discovered, '}${tensions.length ? 'and differences that, discussed with care, can become learning.' : 'and any differences that appear can be approached with curiosity.'} This reading is symbolic: what they build will depend on how they listen to each other.`;
  const text = [story.map(s => s.text).join(' '), [...affinities, ...tensions].map(c => [c.story, c.daily, c.benefit, c.tip, c.misunderstanding, c.needX, c.needY, c.action].filter(Boolean).join(' ')).join(' '), daily.map(d => d.text).join(' '), overlays.map(o => o.text).join(' '), Object.values(advice).flat().join(' '), closing].join(' ');
  return {version: NARRATIVE_VERSION, kb: KB_VERSION, title, story, affinities, tensions, daily, advice, closing, overlays, crossAspectIds: cross.map(c => c.id), words: words(text)};
}

/** Full chaptered reading. */
export function cosmicStory(evA, evB, {lang = 'es', names = ['A', 'B'], relationship = 'partner', premium = false} = {}) {
  const a = personReading(evA, {lang, name: names[0], premium, relationship});
  const b = personReading(evB, {lang, name: names[1], premium, relationship});
  const couple = coupleStory(evA, evB, {lang, names, relationship, premium});
  return {version: NARRATIVE_VERSION, premium, people: [a, b], couple, words: a.words + b.words + couple.words,
    uncertainty: [...evA.uncertainty.map(u => 'A:' + u), ...evB.uncertainty.map(u => 'B:' + u)]};
}
