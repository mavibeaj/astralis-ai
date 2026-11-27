// Future LLM narrative layer — PREPARED, NOT ENABLED. No provider, no network, no cost.
// The model only receives structured evidence (no names, dates, places, coordinates or degrees)
// and must return paragraphs that cite evidence ids. It cannot change scores or add aspects.
import {FORBIDDEN, ROMANTIC_WORDS} from './knowledge.mjs';
import {evidenceIds} from './evidence.mjs';

export const LLM_ENABLED = false;
export const STORY_CHAPTERS = ['personA', 'personB', 'together', 'affinities', 'differences', 'daily', 'advice', 'closing'];
const MAX_PARAGRAPH = 900;

/** Minimised, anonymous evidence payload. */
export function buildStoryRequest(evA, evB, {lang, relationship}) {
  const strip = ev => ({
    timeKnown: ev.timeKnown,
    moon: ev.moon.status,
    placements: Object.fromEntries(Object.entries(ev.placements).map(([k, p]) => [k, {sign: p.sign, ...(p.house ? {house: p.house} : {})}])),
    aspects: ev.aspects.map(a => ({id: a.id, a: a.a, b: a.b, type: a.type, tone: a.tone})),
    balance: {dominantElement: ev.balance.dominantElement, dominantModality: ev.balance.dominantModality, lacking: ev.balance.lackingElements},
  });
  return {
    schemaVersion: 1, locale: lang, relationship,
    persons: {A: strip(evA), B: strip(evB)},
    allowedEvidence: [...evidenceIds(evA)].map(x => 'A:' + x).concat([...evidenceIds(evB)].map(x => 'B:' + x)),
    instructions: 'Write in the requested locale using the labels "A" and "B" only. Every paragraph must cite one or more allowedEvidence ids. Symbolic language only: no predictions, diagnoses, fate, infidelity, breakups, health, pregnancy or death. No numeric scores. For friendship, no romantic or sexual content. Return JSON {"chapters":[{"key":string,"paragraphs":[{"text":string,"evidence":[string]}]}]}.',
    maxOutputTokens: 6000,
  };
}

/** Validate a model response against the request. Throws on any violation. */
export function validateStoryResponse(raw, request, names = ['A', 'B']) {
  if (typeof raw !== 'string' || raw.length > 60000) throw new RangeError('Invalid response size');
  let v; try {v = JSON.parse(raw);} catch {throw new RangeError('Response is not JSON');}
  if (!v || !Array.isArray(v.chapters) || Object.keys(v).length !== 1) throw new RangeError('Unexpected shape');
  const allowed = new Set(request.allowedEvidence);
  const out = [];
  for (const ch of v.chapters) {
    if (!STORY_CHAPTERS.includes(ch?.key) || !Array.isArray(ch.paragraphs) || !ch.paragraphs.length) throw new RangeError('Invalid chapter');
    for (const p of ch.paragraphs) {
      if (typeof p?.text !== 'string' || !p.text.trim() || p.text.length > MAX_PARAGRAPH || /[<>]/.test(p.text)) throw new RangeError('Invalid paragraph text');
      if (!Array.isArray(p.evidence) || !p.evidence.length || !p.evidence.every(id => allowed.has(id))) throw new RangeError('Paragraph cites unknown evidence');
      if (FORBIDDEN.some(r => r.test(p.text))) throw new RangeError('Forbidden claim');
      if (/\b\d{1,3}\s*(\/\s*100|%)/.test(p.text)) throw new RangeError('Scores are not allowed in narrative');
      if (request.relationship === 'friendship' && ROMANTIC_WORDS.test(p.text)) throw new RangeError('Romantic content in friendship reading');
    }
    out.push({key: ch.key, paragraphs: ch.paragraphs.map(p => ({text: p.text.trim().replace(/\bA\b/g, names[0]).replace(/\bB\b/g, names[1]), evidence: p.evidence}))});
  }
  return out;
}
