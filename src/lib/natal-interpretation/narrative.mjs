// LAYER B (deterministic) — chaptered narrative built only from Layer A evidence.
// Every section lists the evidence ids it relies on. No scores are produced or changed here.
import {SIGNS, SIGN_NAMES, ELEMENT_TEXT, MODALITY_TEXT, HOUSES as HOUSES_ALL, HOUSES_FRIENDSHIP, ROMANTIC_WORDS, DOMAINS, DOMAINS_ART, BODY_NAMES, ASPECT_NAMES, NATAL_NATURE, NATAL_PAIRS, CROSS_PAIRS, FRIENDSHIP_OVERRIDE, DAILY_AREAS, COUPLE_TITLES, KB_VERSION} from './knowledge.mjs';
import {natalAspects} from './evidence.mjs';
import {sampler, aspectPersists} from './uncertainty.mjs';

export const NARRATIVE_VERSION = 'cosmic-story-0.2';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const hash = s => {let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h;};
// Library fields may be a string or an array of variants; the variant is chosen deterministically from the evidence id.
const variant = (v, key) => Array.isArray(v) ? v[hash(key) % v.length] : v;
const fill = (s, map) => (s ?? '').replace(/\{(\w+)\}/g, (_, k) => map[k] ?? '');
const words = s => (s.match(/[\p{L}\p{N}’']+/gu) ?? []).length;

const TITLES = {
  es: ['En esencia', 'Su mundo emocional', 'Cómo le perciben los demás', 'Cómo piensa y se comunica', 'Cómo expresa y recibe cariño', 'Qué podría motivarle', 'Cómo podría reaccionar ante las diferencias', 'Fortalezas simbólicas', 'Posibles desafíos', 'Contrastes internos', 'Oportunidades de crecimiento', 'En pocas palabras'],
  en: ['In essence', 'Emotional world', 'How others perceive them', 'How they think and communicate', 'How they give and receive affection', 'What might motivate them', 'How they might respond to differences', 'Symbolic strengths', 'Possible challenges', 'Inner contrasts', 'Growth opportunities', 'In a few words'],
};
const KEYS = ['essence', 'emotional', 'perceived', 'mind', 'affection', 'motivation', 'differences', 'strengths', 'challenges', 'contrasts', 'growth', 'summary'];

// How initiative tends to meet disagreement, by Mars's element (temperament, not prediction).
const ACT = {
  fire: {es: 'actuar y resolver rápido antes que dar muchas vueltas', en: 'acting and resolving quickly rather than going round in circles'},
  earth: {es: 'buscar una solución práctica y concreta antes que discutir en abstracto', en: 'finding a practical, concrete solution rather than arguing in the abstract'},
  air: {es: 'hablarlo y buscar alternativas nuevas antes de detenerse en los detalles', en: 'talking it through and looking for new alternatives before dwelling on details'},
  water: {es: 'tomarse un tiempo para sentir lo que pasa antes de responder', en: 'taking time to feel what is happening before responding'},
};
let HOUSES = HOUSES_ALL, FRIENDSHIP = false; // set per call (pure: reset on every entry point)
function aspectText(asp, lang) {
  const key = [asp.a, asp.b].sort().join('|');
  const lib = NATAL_PAIRS[key]?.[lang];
  const mixedTail = asp.emphasis === 'intense'
    ? (lang === 'es' ? '; esa unión puede aportar determinación e intensidad y, a veces, reacciones más fuertes' : '; that union can bring determination and intensity and, at times, stronger reactions')
    : (lang === 'es' ? '; esa unión puede dar coherencia y fuerza, y también pedir equilibrio entre ambas funciones' : '; that union can bring coherence and strength, and also call for balance between both functions');
  if (asp.tone === 'mixed') return fill(NATAL_NATURE[lang].conjunction, {a: DOMAINS[lang][asp.a], b: DOMAINS[lang][asp.b]}) + mixedTail;
  const text = lib?.[asp.tone === 'harmonious' ? 'easy' : 'hard'];
  if (text && !(FRIENDSHIP && ROMANTIC_WORDS.test(text))) return text;
  const base = fill(NATAL_NATURE[lang][asp.type], {a: DOMAINS[lang][asp.a], b: DOMAINS[lang][asp.b]});
  return base;
}

/** Individual reading for one person (chapter 1 / 2). */
export function personReading(ev, {lang = 'es', name, premium = false, relationship = 'partner'} = {}) {
  FRIENDSHIP = relationship === 'friendship'; HOUSES = FRIENDSHIP ? HOUSES_FRIENDSHIP : HOUSES_ALL;
  const es = lang === 'es', N = name, P = ev.placements, S = i => SIGNS[i][lang], sn = i => SIGN_NAMES[lang][i];
  const used = new Set(); // avoid repeating the same sign phrase twice
  const phrase = (sign, fields) => {for (const f of fields) {const k = sign + ':' + f; if (!used.has(k)) {used.add(k); return S(sign)[f];}} return null;};
  // Like phrase(), but also says which field was used so the sentence can stay grammatical:
  // `style` is an adjective phrase (agrees with a feminine noun), `gift` a noun phrase.
  const field = (sign, fields) => {for (const f of fields) {const k = sign + ':' + f; if (!used.has(k)) {used.add(k); return {f, t: S(sign)[f]};}} return null;};
  const sections = [];
  const add = (i, parts, evidence) => {
    const text = parts.filter(Boolean).join(' ').trim();
    sections.push({key: KEYS[i], title: TITLES[lang][i], text: text || (es ? 'Con la información disponible no hay elementos suficientes para este apartado.' : 'With the available information there is not enough for this section.'), evidence: [...new Set(evidence)]});
  };
  const aspFor = (body, tone) => ev.aspects.filter(a => (a.a === body || a.b === body) && (!tone || a.tone === tone));
  const usedAsp = new Set();
  const takeAsp = list => {const a = list.find(x => !usedAsp.has(x.id)); if (a) usedAsp.add(a.id); return a;};
  const dom = ev.balance.dominantElement, mod = ev.balance.dominantModality;
  const changed = body => es ? `El día de su nacimiento, ${({Sun: 'el Sol', Moon: 'la Luna'})[body] ?? BODY_NAMES.es[body]} cambió de signo y, sin la hora exacta, no podemos saber cuál le corresponde; por eso no lo interpretamos.` : `On their birth day, ${({Sun: 'the Sun', Moon: 'the Moon'})[body] ?? BODY_NAMES.en[body]} changed sign and, without the exact time, we cannot know which applies; so we do not interpret it.`;

  // 1 Essence — Sun
  const sun = P.Sun;
  if (!sun) add(0, [changed('Sun')], []);
  else {
    const parts = [es ? `${N} tiene el Sol en ${sn(sun.sign)}: una identidad ${phrase(sun.sign, ['style'])}. Su recurso más visible es ${phrase(sun.sign, ['gift'])}.` : `${N} has the Sun in ${sn(sun.sign)}: an identity that is ${phrase(sun.sign, ['style'])}. Their most visible resource is ${phrase(sun.sign, ['gift'])}.`];
    const ids = ['placement:Sun'];
    if (sun.house) {parts.push(es ? `Esa energía tiende a dirigirse hacia ${HOUSES.es[sun.house - 1]}.` : `That energy tends to flow toward ${HOUSES.en[sun.house - 1]}.`);}
    const st = ev.stelliums.find(s => s.bodies.includes('Sun'));
    if (st && premium) {parts.push(es ? `Además, varios planetas se reúnen en ${sn(st.sign)}, lo que intensifica este tono.` : `Several planets also gather in ${sn(st.sign)}, intensifying this tone.`); ids.push(st.id);}
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
      parts.push(es ? `Aunque no conocemos la hora exacta, la Luna permaneció todo ese día en ${sn(P.Moon.sign)}: su mundo emocional busca ${phrase(P.Moon.sign, ['need'])}. ` : `Although the exact time is unknown, the Moon stayed in ${sn(P.Moon.sign)} all that day: their emotional world seeks ${phrase(P.Moon.sign, ['need'])}. `);
      ids.push('placement:Moon');
    } else {
      const signs = (ev.moon.signs ?? []).map(sn);
      parts.push(signs.length > 1 ? (es ? `Sin hora exacta, la Luna pudo estar en ${signs.join(' o en ')} ese día, así que no describimos su mundo emocional con certeza. Es un buen tema para que ${N} lo cuente con sus propias palabras.` : `Without an exact time, the Moon could have been in ${signs.join(' or ')} that day, so we do not describe their emotional world with certainty. It is a good topic for ${N} to describe in their own words.`)
        : (es ? `Sin hora exacta no describimos su mundo emocional con certeza.` : `Without an exact time we do not describe their emotional world with certainty.`));
    }
    const a = premium && P.Moon && !P.Moon.stableOnly ? takeAsp(aspFor('Moon')) : null;
    if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(1, parts, ids);
  }
  // 3 Perceived — Ascendant
  {
    const parts = [], ids = [];
    if (P.Ascendant) {
      const ph = field(P.Ascendant.sign, ['style', 'gift']);
      parts.push(es ? `Con el Ascendente en ${sn(P.Ascendant.sign)}, la primera impresión que transmite ${!ph ? 'lleva el mismo sello de ese signo' : ph.f === 'style' ? `suele ser ${ph.t}` : `suele mostrar ${ph.t}`}.` : `With the Ascendant in ${sn(P.Ascendant.sign)}, the first impression they give ${!ph ? 'carries that same sign\'s signature' : ph.f === 'style' ? `tends to be ${ph.t}` : `tends to show ${ph.t}`}.`);
      const el = k => ELEMENT_TEXT[P[k].element][lang];
      if (sun) parts.push(P.Ascendant.element === sun.element ? (es ? `Ascendente y Sol comparten el elemento ${el('Sun').name}, así que lo que muestra y lo que es por dentro suelen parecerse.` : `Ascendant and Sun share the element ${P.Ascendant.element}, so what they show and who they are inside tend to match.`) : (es ? `Quienes le conocen poco podrían ver primero ese lado de ${el('Ascendant').theme} (${sn(P.Ascendant.sign)}) antes de descubrir su Sol en ${sn(sun.sign)}, más ligado a ${el('Sun').theme}.` : `People who know them a little might first see that side of ${el('Ascendant').theme} (${sn(P.Ascendant.sign)}) before discovering their Sun in ${sn(sun.sign)}, more linked to ${el('Sun').theme}.`));
      ids.push('placement:Ascendant', ...(sun ? ['placement:Sun'] : []));
    } else {
      parts.push(es ? 'Sin la hora de nacimiento no podemos calcular el Ascendente, que describe la primera impresión.' : 'Without the birth time we cannot calculate the Ascendant, which describes first impressions.');
      if (sun) {parts.push(es ? `Lo más estable es su Sol en ${sn(sun.sign)}, que suele notarse cuando hay confianza.` : `The most stable element is their Sun in ${sn(sun.sign)}, which tends to show once trust is built.`); ids.push('placement:Sun');}
    }
    add(2, parts, ids);
  }
  // 4 Mind — Mercury
  if (!P.Mercury) add(3, [changed('Mercury')], []);
  else {
    const m = P.Mercury, ids = ['placement:Mercury'];
    const same = !!sun && m.sign === sun.sign;
    const ph = same ? null : field(m.sign, ['style', 'gift']);
    const how = es ? (same || !ph ? 'tiende a ser coherente con su Sol, con el mismo sello de ese signo' : ph.f === 'style' ? `tiende a ser ${ph.t}` : `suele apoyarse en ${ph.t}`) : (same || !ph ? 'tends to be consistent with their Sun, sharing that sign\'s signature' : ph.f === 'style' ? `tends to be ${ph.t}` : `tends to draw on ${ph.t}`);
    const parts = [es ? `Su manera de pensar y comunicar, con Mercurio en ${sn(m.sign)}, ${how}.` : `Their way of thinking and communicating, with Mercury in ${sn(m.sign)}, ${how}.`];
    const a = premium ? takeAsp(aspFor('Mercury')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(3, parts, ids);
  }
  // 5 Affection — Venus
  if (!P.Venus) add(4, [changed('Venus')], []);
  else {
    const v = P.Venus, ids = ['placement:Venus'];
    const parts = [es ? `Con Venus en ${sn(v.sign)}, suele expresar el cariño ${S(v.sign).love}.` : `With Venus in ${sn(v.sign)}, they tend to express affection ${S(v.sign).love}.`];
    const need = phrase(v.sign, ['need']);
    if (need) parts.push(es ? `Para sentir que le quieren de verdad, valora ${need}.` : `To feel truly loved, they value ${need}.`);
    const a = premium ? takeAsp(aspFor('Venus')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(4, parts, ids);
  }
  // 6 Motivation — Sun need, Midheaven, Jupiter
  {
    const parts = [], ids = sun ? ['placement:Sun'] : [];
    const need = sun ? phrase(sun.sign, ['need']) : null;
    if (need) parts.push(es ? `Desde su Sol en ${sn(sun.sign)}, lo que suele impulsarle tiene que ver con ${need}.` : `From their Sun in ${sn(sun.sign)}, what tends to drive them has to do with ${need}.`);
    else if (sun) parts.push(es ? `Su Sol en ${sn(sun.sign)} comparte signo con otros puntos ya descritos, así que su motivación suele ir en la misma línea: ${ELEMENT_TEXT[sun.element].es.gift} puesta al servicio de lo que le importa.` : `Their Sun in ${sn(sun.sign)} shares its sign with points already described, so their motivation tends to run the same way: ${ELEMENT_TEXT[sun.element].en.gift} put at the service of what matters to them.`);
    if (!premium && !need && P.Jupiter) {parts.push(es ? `Júpiter en ${sn(P.Jupiter.sign)} sugiere que le entusiasma crecer a través de ${S(P.Jupiter.sign).gift}.` : `Jupiter in ${sn(P.Jupiter.sign)} suggests they are enthused by growing through ${S(P.Jupiter.sign).gift}.`); ids.push('placement:Jupiter');}
    if (premium && P.Midheaven) {parts.push(es ? `En lo vocacional, el Medio Cielo en ${sn(P.Midheaven.sign)} apunta a metas que piden ${S(P.Midheaven.sign).gift}.` : `Vocationally, the Midheaven in ${sn(P.Midheaven.sign)} points to goals that call for ${S(P.Midheaven.sign).gift}.`); ids.push('placement:Midheaven');}
    if (premium && P.Jupiter) {parts.push(es ? `Con Júpiter en ${sn(P.Jupiter.sign)}, crece a través de ${S(P.Jupiter.sign).gift}.` : `With Jupiter in ${sn(P.Jupiter.sign)}, they grow through ${S(P.Jupiter.sign).gift}.`); ids.push('placement:Jupiter');}
    if (!parts.length) parts.push(es ? 'Con la información disponible no podemos describir con seguridad qué le motiva; es una buena pregunta para hacerle directamente.' : 'With the available information we cannot reliably describe what motivates them; it is a good question to ask them directly.');
    add(5, parts, ids);
  }
  // 7 Differences — Mars
  if (!P.Mars) add(6, [changed('Mars')], []);
  else {
    const ma = P.Mars, ids = ['placement:Mars'];
    const ph = field(ma.sign, ['style', 'gift']);
    const parts = [es ? `En una lectura de Marte en ${sn(ma.sign)}, la iniciativa podría expresarse ${!ph ? 'con el mismo tono ya descrito' : ph.f === 'style' ? `de forma ${ph.t}` : `mediante ${ph.t}`}. Ante un desacuerdo, puede ser útil observar si ${N} prefiere ${ACT[ma.element].es}.` : `In a reading of Mars in ${sn(ma.sign)}, initiative might be expressed ${!ph ? 'in the same tone described above' : ph.f === 'style' ? `in a way that is ${ph.t}` : `through ${ph.t}`}. In a disagreement, it may help to notice whether ${N} prefers ${ACT[ma.element].en}.`];
    const sh = phrase(ma.sign, ['shadow']);
    if (sh) parts.push(es ? `Un punto a cuidar podría ser ${sh}.` : `A point to watch might be ${sh}.`);
    const a = premium ? takeAsp(aspFor('Mars', 'tense')) : null; if (a) {parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    add(6, parts, ids);
  }
  // 8 Strengths — harmonious aspects + dominant element
  {
    const parts = [], ids = dom ? [`element:${dom}`] : [];
    const list = ev.aspects.filter(a => (a.tone === 'harmonious' || (a.tone === 'mixed' && a.emphasis === 'constructive')) && !usedAsp.has(a.id)).slice(0, premium ? 4 : 1);
    for (const a of list) {usedAsp.add(a.id); parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    if (dom) {
      const ties = ev.balance.dominantElements.filter(e => e !== dom);
      parts.push(es ? `${ties.length ? `Con la información disponible, ${[dom, ...ties].map(e => ELEMENT_TEXT[e].es.name).join(' y ')} aparecen con el mismo peso; ` : 'Su elemento predominante, '}${ELEMENT_TEXT[dom].es.name}, aporta ${ELEMENT_TEXT[dom].es.gift}.`.replace('peso; agua', 'peso; el agua').replace(/peso; (\w)/, 'peso; el $1')
        : (ties.length ? `With the available information, ${[dom, ...ties].join(' and ')} carry equal weight; ${dom} brings ${ELEMENT_TEXT[dom].en.gift}.` : `Their dominant element, ${dom}, brings ${ELEMENT_TEXT[dom].en.gift}.`));
    }
    add(7, parts, ids);
  }
  // 9 Challenges — tense aspects (never invented)
  {
    const parts = [], ids = [];
    const list = ev.aspects.filter(a => a.tone === 'tense' && !usedAsp.has(a.id)).slice(0, premium ? 4 : 1);
    for (const a of list) {usedAsp.add(a.id); parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    if (!list.length && sun) {parts.push(es ? `No aparecen tensiones internas marcadas entre sus puntos principales; su reto podría estar más bien en ${S(sun.sign).shadow}.` : `No marked inner tensions appear among their main points; their challenge might rather lie in ${S(sun.sign).shadow}.`); ids.push('placement:Sun');}
    add(8, parts, ids);
  }
  // 10 Inner contrasts — mixed conjunctions and element contrasts between core points (C-02, Gate 3)
  {
    const parts = [], ids = [];
    const mixed = ev.aspects.filter(a => a.tone === 'mixed' && !usedAsp.has(a.id)).slice(0, premium ? 3 : 1);
    for (const a of mixed) {usedAsp.add(a.id); parts.push(cap(aspectText(a, lang)) + '.'); ids.push(a.id);}
    const el = k => P[k] && ELEMENT_TEXT[P[k].element][lang].name;
    if (!premium && parts.length) {/* free edition: one contrast is enough */}
    else if (sun && P.Moon && P.Moon.element !== sun.element) {parts.push(es ? `Su Sol en ${sn(sun.sign)} (${el('Sun')}) y su Luna en ${sn(P.Moon.sign)} (${el('Moon')}) hablan lenguajes distintos: lo que le impulsa y lo que le da calma pueden pedir cosas diferentes, y reconocerlo ayuda a no forzar ninguna de las dos.` : `Their Sun in ${sn(sun.sign)} (${el('Sun')}) and Moon in ${sn(P.Moon.sign)} (${el('Moon')}) speak different languages: what drives them and what calms them may ask for different things, and recognising it helps not to force either.`); ids.push('placement:Sun', 'placement:Moon');}
    else if (sun && P.Moon) {parts.push(es ? `Su Sol y su Luna comparten el elemento ${el('Sun')}: lo que le impulsa y lo que le da calma suelen ir en la misma dirección.` : `Their Sun and Moon share the element ${el('Sun')}: what drives them and what calms them tend to go the same way.`); ids.push('placement:Sun', 'placement:Moon');}
    if (!parts.length) parts.push(es ? 'Con la información disponible no aparecen contrastes internos marcados entre sus puntos principales.' : 'With the available information no marked inner contrasts appear among their main points.');
    add(9, parts, ids);
  }
  // 11 Growth — North Node, less-represented element, Saturn (premium)
  {
    const parts = [], ids = [];
    if (P.NorthNode) {parts.push(es ? `Su Nodo Norte en ${sn(P.NorthNode.sign)} señala como camino de crecimiento ${S(P.NorthNode.sign).gift}.` : `Their North Node in ${sn(P.NorthNode.sign)} points to a growth path of ${S(P.NorthNode.sign).gift}.`); ids.push('placement:NorthNode');}
    const less = ev.balance.lessRepresented[0];
    if (less) {parts.push(es ? `El elemento menos representado en su carta disponible es ${ELEMENT_TEXT[less].es.name}: un camino de crecimiento podría ser ${ELEMENT_TEXT[less].es.lack}, sin que eso indique una carencia.` : `The least represented element in their available chart is ${less}: a growth path could be ${ELEMENT_TEXT[less].en.lack}, without implying a lack.`); ids.push(`less:${less}`);}
    if (premium && P.Saturn) {parts.push(es ? `Saturno en ${sn(P.Saturn.sign)} indica dónde construye madurez con el tiempo: ${S(P.Saturn.sign).gift}.` : `Saturn in ${sn(P.Saturn.sign)} shows where maturity is built over time: ${S(P.Saturn.sign).gift}.`); ids.push('placement:Saturn');}
    add(10, parts, ids);
  }
  // 12 Summary
  {
    const core = sun ? [`${es ? 'Sol' : 'Sun'} ${es ? 'en' : 'in'} ${sn(sun.sign)}`] : [];
    if (P.Moon) core.push(`${es ? 'Luna' : 'Moon'} ${es ? 'en' : 'in'} ${sn(P.Moon.sign)}`);
    if (P.Ascendant) core.push(`${es ? 'Ascendente' : 'Ascendant'} ${es ? 'en' : 'in'} ${sn(P.Ascendant.sign)}`);
    const parts = [dom && mod ? (es ? `En síntesis, ${N} combina ${ELEMENT_TEXT[dom].es.gift} con ${MODALITY_TEXT[mod].es}.` : `In short, ${N} combines ${ELEMENT_TEXT[dom].en.gift} with ${MODALITY_TEXT[mod].en}.`) : (es ? `En síntesis, la información disponible de ${N} es parcial; lo descrito arriba es lo que puede afirmarse con seguridad.` : `In short, the available information for ${N} is partial; what is described above is what can be stated reliably.`),
      es ? `${core.join(', ').replace(/, ([^,]*)$/, ' y $1')} forman el núcleo de su carta.` : `${core.join(', ').replace(/, ([^,]*)$/, ' and $1')} form the core of their chart.`];
    if (!premium) parts.pop();
    add(11, parts, [...(dom ? [`element:${dom}`] : []), ...(mod ? [`modality:${mod}`] : []), ...['Sun', 'Moon', 'Ascendant'].filter(k => P[k]).map(k => `placement:${k}`)]);
  }
  // Premium: planet-by-planet detail with houses.
  const details = [];
  if (premium) {
    for (const k of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
      const pl = P[k]; if (!pl) continue;
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
const PLANET_SET = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
// Cross aspects. With an unknown time, a contact counts only if proven for every instant of that
// person's local birth day (both days when both times are unknown).
function crossAspects(evA, evB, orbs) {
  const side = ev => {
    const win = ev.dayWindow, at = win ? sampler() : null, mid = win ? Math.floor((win.startMs + win.endMs) / 2) : 0;
    return Object.entries(ev.placements).filter(([k, p]) => k !== 'NorthNode' && (win ? PLANET_SET.has(k) : !p.stableOnly && p.lon !== undefined))
      .map(([k, p]) => ({k, lon: win ? at(mid, k) : p.lon, probe: win ? {at, body: k, a: win.startMs, b: win.endMs} : {at: () => p.lon, body: k, a: 0, b: 0}, uncertain: !!win}));
  };
  const A = side(evA), B = side(evB), out = [];
  for (const pa of A) for (const pb of B) {
    const ka = pa.k, kb = pb.k;
    if (OUTER.has(ka) && OUTER.has(kb)) continue;
    if (ka === kb && ka === 'Midheaven') continue;
    const asp = natalAspects(ka === kb ? {[ka]: pa.lon, [kb + '\u0000']: pb.lon} : {[ka]: pa.lon, [kb]: pb.lon}, orbs)[0];
    if (!asp) continue;
    if ((pa.uncertain || pb.uncertain) && !aspectPersists(pa.probe, pb.probe, asp.type, asp.orb)) continue;
    const key = [ka, kb].sort().join('|');
    out.push({id: `cross:A.${ka}-B.${kb}:${asp.type}`, a: ka, b: kb, key, type: asp.type, deviation: asp.deviation, orb: asp.orb, tone: asp.tone, priority: asp.priority});
  }
  return out.sort((p, q) => (CROSS_PAIRS[q.key] ? 1 : 0) - (CROSS_PAIRS[p.key] ? 1 : 0) || q.priority - p.priority || p.id.localeCompare(q.id));
}
// Open questions for daily-life areas without evidence (Gate 4: questions, not conclusions).
const OPEN_Q = {
  es: {emotional: '¿Qué necesita cada uno para sentirse acompañado o acompañada en un mal día?', communication: '¿Cómo prefiere cada uno hablar de un tema difícil: enseguida o con tiempo?', affection: '¿Qué gesto cotidiano le hace sentir más querido o querida a cada uno?', intimacy: '¿Qué ritmo de cercanía le resulta cómodo a cada uno?', trust: '¿Qué hace que cada uno sienta que puede confiar plenamente?', conflict: '¿Qué ayuda a cada uno a calmarse antes de retomar una discusión?', living: '¿Cómo imagina cada uno un día cotidiano compartido?', values: '¿Qué significa para cada uno la seguridad material?', family: '¿Qué lugar ocupa la familia en los planes de cada uno?', independence: '¿Cuánto espacio propio necesita cada uno para sentirse bien?', commitment: '¿Qué significa comprometerse para cada uno?', growth: '¿En qué le gustaría a cada uno crecer con apoyo del otro?'},
  en: {emotional: 'What does each of you need to feel accompanied on a bad day?', communication: 'How does each of you prefer to discuss a hard topic: right away or with time?', affection: 'Which everyday gesture makes each of you feel most loved?', intimacy: 'What pace of closeness feels comfortable to each of you?', trust: 'What makes each of you feel you can fully trust?', conflict: 'What helps each of you calm down before returning to an argument?', living: 'How does each of you picture an ordinary shared day?', values: 'What does material security mean to each of you?', family: 'What place does family have in each of your plans?', independence: 'How much personal space does each of you need to feel well?', commitment: 'What does commitment mean to each of you?', growth: 'Where would each of you like to grow with the other\'s support?'},
};
const elementRelation = (e1, e2) => e1 === e2 ? 'same' : [e1, e2].sort().join('|') === 'air|fire' || [e1, e2].sort().join('|') === 'earth|water' ? 'complementary' : 'different';

// Everyday contexts per point, used to make generic cross readings concrete.
const CONTEXT = {
  es: {Sun: 'los proyectos personales', Moon: 'los días de cansancio o de necesitar cuidado', Mercury: 'las conversaciones y los planes', Venus: 'los gustos y los gestos de cariño', Mars: 'las decisiones y los desacuerdos', Jupiter: 'los planes a futuro', Saturn: 'las responsabilidades y los compromisos', Uranus: 'la necesidad de espacio y los cambios', Neptune: 'los sueños y los ideales', Pluto: 'las conversaciones profundas', Ascendant: 'las primeras impresiones', Midheaven: 'las metas profesionales'},
  en: {Sun: 'personal projects', Moon: 'tired days or moments of needing care', Mercury: 'conversations and plans', Venus: 'tastes and gestures of affection', Mars: 'decisions and disagreements', Jupiter: 'future plans', Saturn: 'responsibilities and commitments', Uranus: 'the need for space and change', Neptune: 'dreams and ideals', Pluto: 'deep conversations', Ascendant: 'first impressions', Midheaven: 'career goals'},
};
const signOfPl = (ev, k) => ev.placements[k]?.sign;

// Roles used to make cards specific to the real contact (identity, emotional needs, values, initiative…).
const ROLE = {
  es: {Sun: 'la identidad y el propósito', Moon: 'las necesidades emocionales', Mercury: 'la forma de pensar y conversar', Venus: 'los valores y la forma de dar cariño', Mars: 'la iniciativa', Jupiter: 'las ganas de crecer', Saturn: 'el sentido de responsabilidad', Uranus: 'la necesidad de libertad', Neptune: 'la sensibilidad y los ideales', Pluto: 'la intensidad', Ascendant: 'la manera de presentarse', Midheaven: 'las metas'},
  en: {Sun: 'identity and purpose', Moon: 'emotional needs', Mercury: 'way of thinking and talking', Venus: 'values and way of giving affection', Mars: 'initiative', Jupiter: 'wish to grow', Saturn: 'sense of responsibility', Uranus: 'need for freedom', Neptune: 'sensitivity and ideals', Pluto: 'intensity', Ascendant: 'way of presenting themselves', Midheaven: 'goals'},
};
const SHORT = {
  es: {Sun: 'Identidad', Moon: 'Emociones', Mercury: 'Conversación', Venus: 'Afecto', Mars: 'Iniciativa', Jupiter: 'Crecimiento', Saturn: 'Responsabilidad', Uranus: 'Libertad', Neptune: 'Ideales', Pluto: 'Intensidad', Ascendant: 'Primera impresión', Midheaven: 'Metas'},
  en: {Sun: 'Identity', Moon: 'Emotions', Mercury: 'Conversation', Venus: 'Affection', Mars: 'Initiative', Jupiter: 'Growth', Saturn: 'Responsibility', Uranus: 'Freedom', Neptune: 'Ideals', Pluto: 'Intensity', Ascendant: 'First impressions', Midheaven: 'Goals'},
};
const TYPE_HOW = {
  es: {trine: 'con naturalidad', sextile: 'si ambos lo cultivan'},
  en: {trine: 'naturally', sextile: 'if both cultivate it'},
};
// Library wording that asserts feelings or attraction as fact is softened (CTO: one aspect never proves them).
const HEDGE = [[/^hay magnetismo/i, 'puede haber magnetismo'], [/^there is magnetism/i, 'there may be magnetism']];
const hedge = s => HEDGE.reduce((t, [r, v]) => t.replace(r, v), s);
const lower1 = s => s.charAt(0).toLowerCase() + s.slice(1);

function crossCard(c, {lang, names, relationship, evA, evB, premium = true}) {
  const es = lang === 'es', friendship = relationship === 'friendship';
  let lib = CROSS_PAIRS[c.key];
  // An alias reuses another contact's reading (e.g. Ascendant–Moon → Sun–Moon). Use a reading built for this contact instead.
  if (lib?.alias) lib = null;
  const tone = c.tone === 'tense' ? 'hard' : c.tone === 'mixed' ? 'mixed' : 'easy';
  let src = lib ? (friendship && lib.romantic ? FRIENDSHIP_OVERRIDE[lang] : lib[lang]) : null;
  const xIsA = !lib?.x || c.a === lib.x;
  const map = {X: xIsA ? names[0] : names[1], Y: xIsA ? names[1] : names[0], A: names[0], B: names[1]};
  const technical = `${BODY_NAMES[lang][c.a]} (${names[0]}) · ${ASPECT_NAMES[lang][c.type]} · ${BODY_NAMES[lang][c.b]} (${names[1]}) · ${c.deviation}° / ${c.orb}°`;
  const sa = signOfPl(evA, c.a), sb = signOfPl(evB, c.b), SN = SIGN_NAMES[lang];
  const rel = sa !== undefined && sb !== undefined ? elementRelation(ELEMENTS_OF(sa), ELEMENTS_OF(sb)) : 'different';
  const R = ROLE[lang], ctx = CONTEXT[lang], sh = SHORT[lang];
  const whoA = es ? `${R[c.a]} de {A}${sa !== undefined ? ` (${BODY_NAMES.es[c.a]} en ${SN[sa]})` : ''}` : `{A}'s ${R[c.a]}${sa !== undefined ? ` (${BODY_NAMES.en[c.a]} in ${SN[sa]})` : ''}`;
  const whoB = es ? `${R[c.b]} de {B}${sb !== undefined ? ` (${BODY_NAMES.es[c.b]} en ${SN[sb]})` : ''}` : `{B}'s ${R[c.b]}${sb !== undefined ? ` (${BODY_NAMES.en[c.b]} in ${SN[sb]})` : ''}`;
  const titles = es
    ? {easy: c.a === c.b ? `${sh[c.a]} en sintonía` : `${sh[c.a]} y ${lower1(sh[c.b])}`, hard: c.a === c.b ? `${sh[c.a]}: dos ritmos` : `${sh[c.a]} frente a ${lower1(sh[c.b])}`, mixed: `${sh[c.a]} y ${lower1(sh[c.b])}: una unión intensa`}
    : {easy: c.a === c.b ? `${sh[c.a]} in tune` : `${sh[c.a]} and ${lower1(sh[c.b])}`, hard: c.a === c.b ? `${sh[c.a]}: two rhythms` : `${sh[c.a]} versus ${lower1(sh[c.b])}`, mixed: `${sh[c.a]} and ${lower1(sh[c.b])}: an intense union`};
  const fill1 = s => s ? cap(fill(hedge(s), map)) : undefined;
  const pickV = (v, k) => variant(v, c.id + k);
  let card;
  if (src && tone !== 'mixed') {
    const t = Object.fromEntries(Object.entries(src[tone]).map(([k, v]) => [k, pickV(v, k)]));
    card = {title: src.title[tone === 'easy' ? 0 : 1], story: fill1(t.story) + '.', daily: fill1(t.daily) + '.',
      ...(tone === 'easy' ? {benefit: fill1((es ? 'tema por cultivar: ' : 'a theme to cultivate: ') + lower1(t.benefit)) + '.', tip: fill1(t.tip) + '.'}
        : {misunderstanding: fill1(t.misunderstanding) + '.', needX: fill1(t.needX) + '.', needY: fill1(t.needY) + '.', action: fill1(t.action) + '.'})};
  } else if (src) { // mixed with a library entry: both possibilities, neither stated as fact
    const e = Object.fromEntries(Object.entries(src.easy).map(([k, v]) => [k, pickV(v, k)])), h = Object.fromEntries(Object.entries(src.hard).map(([k, v]) => [k, pickV(v, k)]));
    card = {title: titles.mixed, story: fill1(e.story) + (es ? '; al mismo tiempo, ' : '; at the same time, ') + fill(lower1(hedge(h.story)), map) + '.', daily: fill1(e.daily) + '.',
      benefit: fill1((es ? 'posibilidad: ' : 'possibility: ') + lower1(e.benefit)) + '.', care: fill1(h.action) + '.'};
  } else { // reading built for this exact contact
    const relEs = {same: 'comparten un mismo clima de elemento', complementary: 'vienen de elementos que suelen complementarse', different: 'vienen de climas distintos'}[rel];
    const relEn = {same: 'share the same elemental climate', complementary: 'come from elements that tend to complement each other', different: 'come from different climates'}[rel];
    if (tone === 'easy') card = es
      ? {title: titles.easy, story: `${cap(whoA)} y ${whoB} ${relEs} y pueden apoyarse ${TYPE_HOW.es[c.type] ?? 'con facilidad'}`, daily: `puede notarse en ${ctx[c.a]} de {A} y en ${ctx[c.b]} de {B}`, benefit: c.a === c.b ? `entenderse con pocas palabras en ${ctx[c.a]} es un tema por cultivar` : `${ctx[c.a]} de uno pueden encontrar apoyo en ${ctx[c.b]} del otro`, tip: `cuando aparezcan ${ctx[c.a]}, pidan la mirada del otro`}
      : {title: titles.easy, story: `${cap(whoA)} and ${whoB} ${relEn} and can support each other ${TYPE_HOW.en[c.type] ?? 'easily'}`, daily: `it may show in {A}'s ${ctx[c.a]} and {B}'s ${ctx[c.b]}`, benefit: c.a === c.b ? `understanding each other with few words in ${ctx[c.a]} is a theme to cultivate` : `one's ${ctx[c.a]} may find support in the other's ${ctx[c.b]}`, tip: `when ${ctx[c.a]} come up, ask for the other's view`};
    else if (tone === 'hard') card = es
      ? {title: titles.hard, story: `${cap(whoA)} y ${whoB} pueden pedir cosas distintas, ${{same: 'aunque compartan un mismo clima de elemento', complementary: 'aunque sus signos vengan de elementos que suelen complementarse', different: 'y además sus signos vienen de climas distintos'}[rel]}`, daily: `puede notarse en ${ctx[c.a]} de {A} frente a ${ctx[c.b]} de {B}`, misunderstanding: `suponer que el otro vive ${R[c.b]} del mismo modo en que uno vive ${R[c.a]}`, needX: `{A} puede necesitar explicar qué le importa en ${ctx[c.a]}`, needY: `{B} puede necesitar contar qué le pide ${R[c.b]}`, action: 'conversen sobre este tema sin buscar quién tiene razón'}
      : {title: titles.hard, story: `${cap(whoA)} and ${whoB} may ask for different things, ${{same: 'even though they share the same elemental climate', complementary: 'even though their signs come from elements that tend to complement each other', different: 'and their signs also come from different climates'}[rel]}`, daily: `it may show in {A}'s ${ctx[c.a]} versus {B}'s ${ctx[c.b]}`, misunderstanding: `assuming the other experiences ${R[c.b]} the way one experiences ${R[c.a]}`, needX: `{A} may need to explain what matters to them in ${ctx[c.a]}`, needY: `{B} may need to say what their ${R[c.b]} asks for`, action: 'talk about this topic without looking for who is right'};
    else card = es
      ? {title: titles.mixed, story: `${cap(whoA)} y ${whoB} se funden en una conjunción: puede sumar fuerza en este terreno y, a la vez, pedir que ninguno imponga su ritmo`, daily: `puede notarse en ${ctx[c.a]} de {A} y en ${ctx[c.b]} de {B}`, benefit: `posibilidad: sentirse equipo en ${ctx[c.a]}`, care: 'cuiden que esa intensidad compartida no se convierta en presión'}
      : {title: titles.mixed, story: `${cap(whoA)} and ${whoB} merge in a conjunction: it can add strength here and, at the same time, ask that neither imposes their pace`, daily: `it may show in {A}'s ${ctx[c.a]} and {B}'s ${ctx[c.b]}`, benefit: `possibility: feeling like a team in ${ctx[c.a]}`, care: 'make sure that shared intensity does not turn into pressure'};
    card = Object.fromEntries(Object.entries(card).map(([k, v]) => [k, k === 'title' ? v : cap(fill(v, map)) + '.']));
  }
  // Free edition: what each may need to understand is a premium detail (keeps the free reading readable on mobile).
  if (!premium) {delete card.needX; delete card.needY;}
  return {id: c.id, key: c.key, area: lib?.area ?? 'general', tone: c.tone, ...card, technical, evidence: [c.id]};
}
const ELEMENTS_OF = sign => ['fire', 'earth', 'air', 'water'][sign % 4];

export function coupleStory(evA, evB, {lang = 'es', names = ['A', 'B'], relationship = 'partner', premium = false, synastryOrbs} = {}) {
  FRIENDSHIP = relationship === 'friendship'; HOUSES = FRIENDSHIP ? HOUSES_FRIENDSHIP : HOUSES_ALL;
  const es = lang === 'es', E = ELEMENT_TEXT, sn = i => SIGN_NAMES[lang][i];
  const cross = crossAspects(evA, evB, synastryOrbs); // undefined → approved natal orbs
  const seen = new Set();
  const pick = tones => cross.filter(c => tones.includes(c.tone) && !seen.has(c.key) && (seen.add(c.key), true));
  const card = c => crossCard(c, {lang, names, relationship, evA, evB, premium});
  // Three groups (CTO block 3): symbolic affinities, differences/tensions, intense or mixed connections.
  const affinitiesAll = pick(['harmonious']).map(card);
  const tensionsAll = pick(['tense']).map(card);
  const intenseAll = pick(['mixed']).map(card);
  // Free edition keeps five cards in total, as before: the intense one takes an affinity slot.
  const intense = intenseAll.slice(0, premium ? 4 : 1);
  const affinities = affinitiesAll.slice(0, premium ? 8 : (intense.length ? 2 : 3)), tensions = tensionsAll.slice(0, premium ? 6 : 2);
  // Distinct titles: when two contacts would share a heading, the second names its bodies.
  const seenTitles = new Set();
  for (const c of [...affinities, ...intense, ...tensions]) {
    if (seenTitles.has(c.title)) {const [ba, bb] = c.key.split('|'); c.title = `${c.title} (${BODY_NAMES[lang][ba]}–${BODY_NAMES[lang][bb]})`;}
    seenTitles.add(c.title);
  }
  const dA = evA.balance.dominantElement, dB = evB.balance.dominantElement;
  const title = dA && dB ? COUPLE_TITLES[[dA, dB].sort().join('|')][lang] : (es ? 'Dos universos por descubrir' : 'Two universes to discover');
  const rel = dA && dB ? elementRelation(dA, dB) : null;
  // Chapter transitions (evidence-based, one sentence each).
  const modTxt = m => m ? MODALITY_TEXT[m][lang] : '';
  const bridges = {
    1: dA ? (es ? `Antes de mirar el vínculo, empecemos por ${names[0]}: una carta donde predomina ${E[dA].es.name}.` : `Before looking at the bond, let us begin with ${names[0]}: a chart where ${dA} prevails.`) : (es ? `Empecemos por ${names[0]}, con la información disponible.` : `Let us begin with ${names[0]}, with the information available.`),
    2: dB ? (es ? `Ahora, ${names[1]}. ${dA === dB ? `Su carta comparte el predominio de ${E[dB].es.name}, lo que anticipa un lenguaje común.` : `Su carta tiene otro clima, con predominio de ${E[dB].es.name}, lo que anticipa una conversación entre estilos distintos.`}` : `Now, ${names[1]}. ${dA === dB ? `Their chart shares the prevalence of ${dB}, hinting at a common language.` : `Their chart has another climate, with ${dB} prevailing, hinting at a dialogue between different styles.`}`) : (es ? `Ahora, ${names[1]}, con la información disponible.` : `Now, ${names[1]}, with the information available.`),
    3: es ? `Con ambos universos sobre la mesa, esta es la historia de «${title}».` : `With both universes on the table, this is the story of "${title}".`,
    4: affinities.length ? (es ? `La lectura identifica ${affinities.length === 1 ? 'un tema simbólico de afinidad' : `${affinities.length} temas simbólicos de afinidad`}, cada uno apoyado en un contacto concreto entre sus cartas.` : `The reading identifies ${affinities.length === 1 ? 'one symbolic theme of affinity' : `${affinities.length} symbolic themes of affinity`}, each resting on a specific contact between their charts.`) : '',
    intense: intense.length ? (es ? 'Algunas conexiones son intensas o mixtas: pueden ofrecer posibilidades y desafíos a la vez, según cómo las vivan.' : 'Some connections are intense or mixed: they can offer possibilities and challenges at once, depending on how they are lived.') : '',
    5: tensions.length ? (es ? 'Y estas son las diferencias que conviene conocer, no para temerlas sino para conversarlas.' : 'And these are the differences worth knowing, not to fear them but to talk about them.') : '',
    6: es ? `Así podrían verse en el día a día; donde no hay un contacto que lo sustente, lo planteamos como pregunta.` : `This is how it might look day to day; where no contact supports an area, we pose it as a question.`,
    7: es ? (tensions[0] ? `Algunas ideas concretas, empezando por «${tensions[0].title.toLowerCase()}».` : affinities[0] ? `Algunas ideas concretas para cultivar «${affinities[0].title.toLowerCase()}».` : 'Algunas ideas concretas para conocerse mejor.') : (tensions[0] ? `Some concrete ideas, starting with "${tensions[0].title.toLowerCase()}".` : affinities[0] ? `Some concrete ideas to cultivate "${affinities[0].title.toLowerCase()}".` : 'Some concrete ideas to get to know each other better.'),
  };
  // Chapter 3 — joint story.
  const story = [];
  if (dA && dB) story.push({text: es ? `${names[0]} trae a este vínculo ${E[dA].es.gift}, y ${names[1]} aporta ${dA === dB ? 'esa misma base, vivida a su manera' : E[dB].es.gift}. ${rel === 'same' ? 'Comparten un mismo elemento predominante, lo que puede dar una sensación de lenguaje común.' : rel === 'complementary' ? 'Sus elementos predominantes suelen complementarse: lo que a uno le sobra, al otro puede servirle.' : 'Sus elementos predominantes son distintos, y esa diferencia puede ser tanto un descubrimiento como un aprendizaje.'}`
    : `${names[0]} brings ${E[dA].en.gift} to this bond, and ${names[1]} contributes ${dA === dB ? 'that same foundation, lived in their own way' : E[dB].en.gift}. ${rel === 'same' ? 'They share the same dominant element, which may feel like a common language.' : rel === 'complementary' ? 'Their dominant elements tend to complement each other: what one has plenty of may help the other.' : 'Their dominant elements differ, and that difference can be both a discovery and a lesson.'}`, evidence: [`A:element:${dA}`, `B:element:${dB}`]});
  if (evA.placements.Sun && evB.placements.Sun) story.push({text: es ? `${names[0]} podría descubrir en ${names[1]} ${SIGNS[evB.placements.Sun.sign].es.gift}; ${names[1]} podría encontrar en ${names[0]} ${SIGNS[evA.placements.Sun.sign].es.gift}.` : `${names[0]} might discover in ${names[1]} ${SIGNS[evB.placements.Sun.sign].en.gift}; ${names[1]} might find in ${names[0]} ${SIGNS[evA.placements.Sun.sign].en.gift}.`, evidence: ['A:placement:Sun', 'B:placement:Sun']});
  if (affinities[0]) story.push({text: es ? `El tema simbólico de afinidad más claro tiene que ver con «${affinities[0].title.toLowerCase()}», que se desarrolla en el capítulo de afinidades.` : `The clearest symbolic theme of affinity relates to "${affinities[0].title.toLowerCase()}", developed in the affinities chapter.`, evidence: affinities[0].evidence});
  if (intense[0]) story.push({text: es ? `Hay también una conexión intensa, «${intense[0].title.toLowerCase()}», que puede aportar fuerza y pedir cuidado a la vez.` : `There is also an intense connection, "${intense[0].title.toLowerCase()}", which can bring strength and call for care at once.`, evidence: intense[0].evidence});
  if (tensions[0]) story.push({text: es ? `Al mismo tiempo, la lectura invita a cuidar un punto: «${tensions[0].title.toLowerCase()}», que vale la pena conversar.` : `At the same time, the reading invites care around one point: "${tensions[0].title.toLowerCase()}", worth talking about.`, evidence: tensions[0].evidence});
  const mA = evA.placements.Moon, mB = evB.placements.Moon;
  if (mA && mB) story.push({text: es ? `En lo emocional, ${names[0]} busca ${SIGNS[mA.sign].es.need}, mientras ${names[1]} busca ${SIGNS[mB.sign].es.need}. ${mA.element === mB.element ? 'Son necesidades parecidas, aunque cada uno las exprese a su manera.' : 'Son necesidades distintas, y conviene nombrarlas para no interpretarlas como falta de interés.'}` : `Emotionally, ${names[0]} seeks ${SIGNS[mA.sign].en.need}, while ${names[1]} seeks ${SIGNS[mB.sign].en.need}. ${mA.element === mB.element ? 'These needs are similar, even if each expresses them differently.' : 'These needs differ, and naming them helps avoid reading them as disinterest.'}`, evidence: ['A:placement:Moon', 'B:placement:Moon']});
  else story.push({text: es ? 'Como no podemos fijar con seguridad la Luna de ambos, no comparamos sus necesidades emocionales: es un tema ideal para conversar directamente.' : 'Since we cannot reliably fix both Moons, we do not compare their emotional needs: it is an ideal topic to discuss directly.', evidence: []});
  // How they complement each other (Gate 4): one's prevailing element is the other's least represented.
  const complement = [];
  for (const [g, r, gi, ri] of [[evA, evB, 0, 1], [evB, evA, 1, 0]]) {
    const el = g.balance.dominantElement;
    if (el && r.balance.lessRepresented.includes(el)) complement.push(es ? `Lo que en la carta de ${names[ri]} aparece menos representado (${E[el].es.name}) es justamente lo que predomina en la de ${names[gi]}: ${names[gi]} puede mostrarle otra forma de ${E[el].es.lack}.` : `What is least represented in ${names[ri]}'s chart (${el}) is precisely what prevails in ${names[gi]}'s: ${names[gi]} can show another way of ${E[el].en.lack}.`);
  }
  if (!complement.length && rel) complement.push(es ? (rel === 'complementary' ? `Sus elementos predominantes (${E[dA].es.name} y ${E[dB].es.name}) suelen alimentarse mutuamente.` : rel === 'same' ? `Comparten el elemento ${E[dA].es.name}: su complementariedad estará más en los matices de cada carta que en el clima general.` : `Sus elementos (${E[dA].es.name} y ${E[dB].es.name}) son distintos: la complementariedad no es automática, se construye conversando.`) : (rel === 'complementary' ? `Their prevailing elements (${dA} and ${dB}) tend to feed each other.` : rel === 'same' ? `They share ${dA}: complementarity will lie more in each chart's nuances than in the overall climate.` : `Their elements (${dA} and ${dB}) differ: complementarity is not automatic, it is built by talking.`));
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
  const usedDaily = new Set(), usedCompare = new Set();
  const daily = DAILY_AREAS.filter(a => !(a.romantic && relationship === 'friendship')).map(area => {
    const ev = [...affinitiesAll, ...intenseAll, ...tensionsAll].filter(c => area.pairs.includes(c.key) && !usedDaily.has(c.id));
    if (ev.length) {
      const c = ev[0]; usedDaily.add(c.id);
      // The card already tells the story; here only how it may look day to day (no repetition).
      return {key: area.key, title: area[lang], status: 'evidence', tone: c.tone, text: (es ? `«${c.title}»: ` : `“${c.title}”: `) + lower1(c.daily) + (premium ? ' ' + (c.tip ?? c.care ?? c.action) : ''), evidence: [c.id]};
    }
    const pa = area.compare && evA.placements[area.compare], pb = area.compare && evB.placements[area.compare];
    if (pa && pb && !usedCompare.has(area.compare)) { // sign-level comparison, also valid when only the sign is known (stable all day); once per body
      usedCompare.add(area.compare);
      const r = elementRelation(pa.element, pb.element);
      const body = BODY_NAMES[lang][area.compare];
      return {key: area.key, title: area[lang], status: 'signs', tone: r === 'different' ? 'tense' : 'harmonious',
        text: es ? `${body} de ${names[0]} en ${sn(pa.sign)} y de ${names[1]} en ${sn(pb.sign)}: ${r === 'same' ? 'un estilo parecido en este terreno' : r === 'complementary' ? 'estilos que pueden complementarse' : 'estilos distintos que conviene conocer'} (lectura secundaria por signos, sin un aspecto que la confirme).` : `${body} of ${names[0]} in ${sn(pa.sign)} and of ${names[1]} in ${sn(pb.sign)}: ${r === 'same' ? 'a similar style here' : r === 'complementary' ? 'styles that may complement each other' : 'different styles worth getting to know'} (secondary sign-based reading, not confirmed by an aspect).`,
        evidence: [`A:placement:${area.compare}`, `B:placement:${area.compare}`]};
    }
    return {key: area.key, title: area[lang], status: 'conversation', tone: 'neutral', text: OPEN_Q[lang][area.key], evidence: []}; // the 'To discuss' badge already says there is no evidence (bridge 6 explains it)
  });
  // Chapter 7 — advice, adapted to the relationship.
  const relWord = es ? {partner: 'como pareja', crush: 'mientras se conocen', friendship: 'como amigos'}[relationship] : {partner: 'as a couple', crush: 'while getting to know each other', friendship: 'as friends'}[relationship];
  const merc = cross.find(c => c.key === 'Mercury|Mercury' || c.key === 'Mercury|Moon');
  const advice = {
    communication: es ? (merc?.tone === 'tense' ? `Para comunicarse mejor ${relWord}, repitan con sus palabras lo que entendieron antes de responder.` : `Para comunicarse mejor ${relWord}, aprovechen la conversación también para hablar de emociones, no solo de planes.`) : (merc?.tone === 'tense' ? `To communicate better ${relWord}, repeat in your own words what you understood before replying.` : `To communicate better ${relWord}, use conversation for feelings too, not only plans.`),
    needs: mA && mB ? (es ? `${names[0]} puede pedir ${SIGNS[mA.sign].es.need}; ${names[1]} puede pedir ${SIGNS[mB.sign].es.need}. Decirlo en voz alta evita suposiciones.` : `${names[0]} can ask for ${SIGNS[mA.sign].en.need}; ${names[1]} can ask for ${SIGNS[mB.sign].en.need}. Saying it out loud avoids assumptions.`) : (es ? 'Cuéntense qué necesita cada uno para sentirse bien en un día difícil.' : 'Tell each other what you each need to feel well on a hard day.'),
    differences: tensions[0] ? tensions[0].action : (es ? 'Cuando surja una diferencia, busquen primero entender antes que convencer.' : 'When a difference arises, seek to understand before convincing.'),
    shared: affinities[0] ? affinities[0].tip : intense[0] ? intense[0].care : (es ? 'Prueben juntos una actividad nueva para descubrir gustos en común.' : 'Try a new activity together to discover shared tastes.'),
    // Fixed advice text appears only in premium; the free reading keeps advice tied to their charts.
    ...(premium ? {space: es ? 'Respeten los espacios individuales: tener intereses propios también nutre el vínculo.' : 'Respect individual space: having your own interests also nourishes the bond.'} : {}),
    questions: es ? ['¿Qué te hace sentir valorado o valorada en este vínculo?', '¿Qué te gustaría que hiciéramos más seguido?', '¿Cómo prefieres que hablemos de un desacuerdo?'] : ['What makes you feel valued in this bond?', 'What would you like us to do more often?', 'How do you prefer we talk about a disagreement?'],
    activities: (es ? {partner: ['Una cena sin pantallas para contarse un deseo para este año.', 'Escribir cada uno tres gestos que le hacen sentir querido o querida.', 'Planear juntos una salida que ninguno haya hecho.'], crush: ['Un paseo para conversar sobre lo que a cada uno le apasiona.', 'Compartir una canción o un libro importante y contar por qué.', 'Proponer un plan sencillo que muestre el mundo del otro.'], friendship: ['Elegir juntos un taller o actividad nueva.', 'Compartir una recomendación (libro, serie, lugar) y comentarla después.', 'Preguntarse en qué proyecto personal podría apoyarse cada uno.']} : {partner: ['A screen-free dinner where each shares a wish for this year.', 'Each write three gestures that make you feel loved.', 'Plan an outing neither of you has done.'], crush: ['A walk to talk about what each of you is passionate about.', 'Share an important song or book and explain why.', 'Propose a simple plan that shows the other your world.'], friendship: ['Choose a new class or activity together.', 'Share a recommendation (book, show, place) and discuss it later.', 'Ask each other which personal project you could support.']})[relationship],
  };
  // Chapter 8 — closing.
  const closing = es ? `${names[0]} y ${names[1]} no comparten un destino escrito: comparten la posibilidad de conocerse mejor. ${affinities.length ? `La lectura identifica temas simbólicos de afinidad, como «${affinities[0].title.toLowerCase()}», ` : 'Los temas de afinidad están por descubrirse, '}${tensions.length ? `y también diferencias que, conversadas con cuidado, pueden convertirse en aprendizaje.` : 'y las diferencias que aparezcan pueden abordarse con curiosidad.'} Esta lectura es simbólica: lo que construyan dependerá de cómo se escuchen.`
    : `${names[0]} and ${names[1]} do not share a written fate: they share the chance to know each other better. ${affinities.length ? `The reading identifies symbolic themes of affinity, such as "${affinities[0].title.toLowerCase()}", ` : 'Themes of affinity are still to be discovered, '}${tensions.length ? 'and differences that, discussed with care, can become learning.' : 'and any differences that appear can be approached with curiosity.'} This reading is symbolic: what they build will depend on how they listen to each other.`;
  const text = [Object.values(bridges).join(' '), complement.join(' '), story.map(s => s.text).join(' '), [...affinities, ...intense, ...tensions].map(c => [c.story, c.daily, c.benefit, c.tip, c.care, c.misunderstanding, c.needX, c.needY, c.action].filter(Boolean).join(' ')).join(' '), daily.map(d => d.text).join(' '), overlays.map(o => o.text).join(' '), Object.values(advice).flat().join(' '), closing].join(' ');
  return {version: NARRATIVE_VERSION, kb: KB_VERSION, title, bridges, complement, story, affinities, intense, tensions, daily, advice, closing, overlays, crossAspectIds: cross.map(c => c.id), words: words(text)};
}

/** Full chaptered reading. */
export function cosmicStory(evA, evB, {lang = 'es', names = ['A', 'B'], relationship = 'partner', premium = false, synastryOrbs} = {}) {
  const a = personReading(evA, {lang, name: names[0], premium, relationship});
  const b = personReading(evB, {lang, name: names[1], premium, relationship});
  const couple = coupleStory(evA, evB, {lang, names, relationship, premium, synastryOrbs});
  return {version: NARRATIVE_VERSION, premium, people: [a, b], couple, words: a.words + b.words + couple.words,
    uncertainty: [...evA.uncertainty.map(u => 'A:' + u), ...evB.uncertainty.map(u => 'B:' + u)]};
}
