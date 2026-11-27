// LAYER A — deterministic natal evidence. Pure function of engine output; no text, no AI.
// Every fact carries a stable id so narrative claims can be traced back to it.
import {signElement, signModality, ASPECT_TONE, KB_VERSION} from './knowledge.mjs';
import {sampler, stableSign, aspectPersists} from './uncertainty.mjs';
import {meanNode} from '../houses.mjs';

export const EVIDENCE_VERSION = 'natal-evidence-0.1';
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const OUTER = new Set(['Uranus', 'Neptune', 'Pluto']);
const PERSONAL = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant']);
const ANGLES = {conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180};
// Natal orbs by the wider class of the pair (conj/opp, trine/square, sextile).
const ORB = {luminary: [8, 7, 5], personal: [7, 6, 4], social: [6, 5, 3], angle: [6, 5, 3], outer: [5, 4, 3]};
const CLASS = p => (p === 'Sun' || p === 'Moon') ? 'luminary' : ['Mercury', 'Venus', 'Mars'].includes(p) ? 'personal' : ['Jupiter', 'Saturn'].includes(p) ? 'social' : (p === 'Ascendant' || p === 'Midheaven') ? 'angle' : 'outer';
const RANK = ['outer', 'social', 'angle', 'personal', 'luminary'];
// Weights for the elemental/modal balance (outer planets are generational and excluded).
const WEIGHT = {Sun: 3, Moon: 3, Ascendant: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1, Saturn: 1, Midheaven: 1};
const norm = x => ((x % 360) + 360) % 360;
const valid = n => typeof n === 'number' && Number.isFinite(n);
const signOf = lon => Math.floor(norm(lon) / 30);

function placement(lon, house) {
  const sign = signOf(lon);
  return {lon: norm(lon), sign, degree: Math.round((norm(lon) - sign * 30) * 100) / 100, element: signElement(sign), modality: signModality(sign), ...(house ? {house} : {})};
}

export function natalAspects(points) {
  const out = [], keys = Object.keys(points);
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = keys[i], b = keys[j];
    if (OUTER.has(a) && OUTER.has(b)) continue; // generational, same for everyone born near the same years
    if ((a === 'Ascendant' && b === 'Midheaven') || (a === 'Midheaven' && b === 'Ascendant')) continue;
    const cls = [CLASS(a), CLASS(b)].sort((x, y) => RANK.indexOf(y) - RANK.indexOf(x))[0];
    const d = Math.abs(norm(points[a] - points[b])); const dist = d > 180 ? 360 - d : d;
    for (const [type, angle] of Object.entries(ANGLES)) {
      const orb = ORB[cls][type === 'conjunction' || type === 'opposition' ? 0 : type === 'sextile' ? 2 : 1];
      const deviation = Math.abs(dist - angle);
      if (deviation <= orb) {
        const [x, y] = [a, b].sort();
        // CTO C-02: conjunctions are blended — always 'mixed'. Mars/Saturn/Uranus/Pluto only shift the
        // emphasis toward intensity; they never make the contact intrinsically negative.
        const intense = type === 'conjunction' && ['Saturn', 'Pluto', 'Mars', 'Uranus'].some(p => p === a || p === b) && !([a, b].includes('Mars') && [a, b].includes('Venus'));
        const tone = ASPECT_TONE[type] === 'blend' ? 'mixed' : ASPECT_TONE[type];
        const emphasis = tone === 'mixed' ? (intense ? 'intense' : 'constructive') : undefined;
        // Priority: personal points first, tighter orbs first.
        const priority = (PERSONAL.has(a) ? 2 : 0) + (PERSONAL.has(b) ? 2 : 0) + (1 - deviation / orb);
        out.push({id: `aspect:${x}-${y}:${type}`, a: x, b: y, type, deviation: Math.round(deviation * 100) / 100, orb, tone, ...(emphasis ? {emphasis} : {}), priority: Math.round(priority * 1000) / 1000});
        break;
      }
    }
  }
  return out.sort((p, q) => q.priority - p.priority || p.id.localeCompare(q.id));
}

/**
 * @param chart engine chart (longitudes, angles?, placidus?, nodes?)
 * @param opts {unknownTime} — with an unknown time, chart.dayWindow ({startMs,endMs}) must be present;
 *   only facts proven for the whole local day are kept (uncertainty.mjs).
 */
export function natalEvidence(chart, {unknownTime = false} = {}) {
  const timeKnown = !unknownTime && !!chart?.angles;
  const cusps = timeKnown ? (chart.placidus?.cusps ?? null) : null;
  const houseSystem = timeKnown ? (chart.placidus ? 'placidus' : 'whole-sign') : null;
  const houseOf = lon => {
    if (!timeKnown) return undefined;
    if (cusps) {for (let i = 0; i < 12; i++) {const s = cusps[i], e = cusps[(i + 1) % 12]; if (norm(lon - s) < norm(e - s)) return i + 1;}}
    return ((signOf(lon) - signOf(chart.angles.ascendant) + 12) % 12) + 1;
  };
  const placements = {}, points = {}, facts = [], uncertainty = [];
  const win = !timeKnown ? chart?.dayWindow ?? null : null;
  const at = win ? sampler() : null;
  let moon = {status: 'unknown'};
  for (const p of PLANETS) {
    if (win) {
      const st = stableSign(at, p, win.startMs, win.endMs);
      if (!st.stable) {
        if (p === 'Moon') moon = {status: 'uncertain', signs: st.signs};
        uncertainty.push(p === 'Moon' ? 'moon-sign' : 'sign:' + p);
        continue;
      }
      // Sign-level only: no degree or house claims without a birth time.
      placements[p] = {sign: st.sign, element: signElement(st.sign), modality: signModality(st.sign), stableOnly: true};
      if (p === 'Moon') moon = {status: 'stable-sign', signs: [st.sign], method: 'speed-bound'};
      points[p] = at(Math.floor((win.startMs + win.endMs) / 2), p);
      continue;
    }
    const lon = chart?.longitudes?.[p];
    if (!valid(lon)) continue;
    placements[p] = placement(lon, houseOf(lon));
    points[p] = lon;
    if (p === 'Moon') moon = {status: 'exact'};
  }
  if (!win && !timeKnown && !placements.Moon) uncertainty.push('moon-sign');
  if (timeKnown) {
    placements.Ascendant = placement(chart.angles.ascendant, 1); points.Ascendant = chart.angles.ascendant;
    placements.Midheaven = placement(chart.angles.midheaven, 10); points.Midheaven = chart.angles.midheaven;
  } else uncertainty.push('ascendant', 'midheaven', 'houses');
  if (win) {
    // The mean node moves linearly (monotonically), so equal signs at both ends of the day prove stability.
    const s0 = signOf(meanNode(new Date(win.startMs))), s1 = signOf(meanNode(new Date(win.endMs)));
    if (s0 === s1) placements.NorthNode = {sign: s0, element: signElement(s0), modality: signModality(s0), stableOnly: true};
    else uncertainty.push('sign:NorthNode');
  } else if (valid(chart?.nodes?.north)) placements.NorthNode = placement(chart.nodes.north, houseOf(chart.nodes.north));
  for (const [k, v] of Object.entries(placements)) facts.push({id: `placement:${k}`, point: k, ...v});

  let aspects = natalAspects(points);
  // Unknown time: keep an aspect only if it is proven within orb for the whole local day.
  if (win) aspects = aspects.filter(a => aspectPersists({at, body: a.a, a: win.startMs, b: win.endMs}, {at, body: a.b, a: win.startMs, b: win.endMs}, a.type, a.orb, {same: true}));
  // Elements & modalities (Moon counts if exact or stable sign).
  const elements = {fire: 0, earth: 0, air: 0, water: 0}, modalities = {cardinal: 0, fixed: 0, mutable: 0};
  for (const [k, w] of Object.entries(WEIGHT)) {const pl = placements[k]; if (!pl) continue; elements[pl.element] += w; modalities[pl.modality] += w;}
  // CTO C-03: report ties and coverage; "less represented in the available chart", never a deficit.
  const totalW = Object.values(elements).reduce((s, x) => s + x, 0);
  const maxW = Object.values(WEIGHT).reduce((s, x) => s + x, 0);
  const tops = o => {const m = Math.max(...Object.values(o)); return m > 0 ? Object.keys(o).filter(k => o[k] === m) : [];};
  // Ties are broken by the Sun's element/modality when it is among the tied (documented editorial rule), else fixed order.
  const pickTop = (list, sunValue) => list.length ? (list.includes(sunValue) ? sunValue : list[0]) : null;
  const dominantElements = tops(elements), dominantModalities = tops(modalities);
  const dominantElement = pickTop(dominantElements, placements.Sun?.element), dominantModality = pickTop(dominantModalities, placements.Sun?.modality);
  const personalInElement = e => ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'].some(k => placements[k]?.element === e);
  const lessRepresented = totalW ? Object.keys(elements).filter(e => !personalInElement(e) && elements[e] <= 1) : [];
  // Stelliums: 3+ planets in one sign (exact positions only).
  const bySign = {};
  for (const p of PLANETS) if (placements[p]) (bySign[placements[p].sign] ??= []).push(p);
  const stelliums = Object.entries(bySign).filter(([, ps]) => ps.length >= 3).map(([sign, ps]) => ({id: `stellium:${sign}`, sign: Number(sign), bodies: ps}));
  const byHouse = {};
  for (const p of PLANETS) if (placements[p]?.house) (byHouse[placements[p].house] ??= []).push(p);
  const emphasisHouses = Object.entries(byHouse).filter(([, ps]) => ps.length >= 3).map(([h, ps]) => ({id: `house-emphasis:${h}`, house: Number(h), bodies: ps}));
  return {version: EVIDENCE_VERSION, kb: KB_VERSION, timeKnown, houseSystem, dayWindow: win, moon, placements, aspects, facts,
    balance: {elements, modalities, totalWeight: totalW, coverage: Math.round(totalW / maxW * 100) / 100, dominantElement, dominantElements, dominantModality, dominantModalities, lessRepresented,
      ids: [...(dominantElement ? [`element:${dominantElement}`] : []), ...(dominantModality ? [`modality:${dominantModality}`] : []), ...lessRepresented.map(e => `less:${e}`)]},
    stelliums, emphasisHouses, uncertainty};
}

/** All evidence ids available for tracing. */
export function evidenceIds(ev) {
  return new Set([...ev.facts.map(f => f.id), ...ev.aspects.map(a => a.id), ...ev.balance.ids, ...ev.stelliums.map(s => s.id), ...ev.emphasisHouses.map(h => h.id)]);
}
