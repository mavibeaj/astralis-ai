// C-05 — LLM narrative PROTOTYPE with a mock model. No provider, no network, no cost.
// 1) mockModel: deterministic stand-in that writes paragraphs from the anonymous request.
// 2) checkGrounding: semantic checks beyond structure — every sign, body, aspect and tone a
//    paragraph mentions must follow from the evidence it cites; certainty/prediction is rejected.
// 3) estimateCost: token/cost model with PLACEHOLDER prices (not any provider's price list).
import {SIGN_NAMES, BODY_NAMES, ASPECT_NAMES} from './knowledge.mjs';

export const PLACEHOLDER_PRICING = Object.freeze({inputUsdPerMillion: 3, outputUsdPerMillion: 15, note: 'placeholder for planning only'});
const lower = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const HARMONY = /\b(armoni|fluy|fluid|facilidad|afinidad|se apoyan|harmon|flow|ease|support each other)/;
const TENSION = /\b(tension|friccion|choque|chocar|tiran en direcciones|conflict|friction|clash|pull in different)/;
const CERTAINTY = /\b(siempre|nunca|definitivamente|sin duda|seguramente|always|never|definitely|certainly|without doubt)\b/;
const PREDICTION = /\b(va a|van a|ocurrira|sucedera|terminaran|will (?!not\b)\w+|is going to|are going to)\b/;

/** Index the request so a cited id can be resolved to its astrological content. */
function resolve(request) {
  const map = new Map();
  for (const who of ['A', 'B']) {
    const p = request.persons[who];
    for (const [body, pl] of Object.entries(p.placements)) map.set(`${who}:placement:${body}`, {bodies: [body], signs: [pl.sign]});
    for (const a of p.aspects) map.set(`${who}:${a.id}`, {bodies: [a.a, a.b], types: [a.type], tones: [a.tone]});
    if (p.balance.dominantElement) map.set(`${who}:element:${p.balance.dominantElement}`, {elements: [p.balance.dominantElement]});
  }
  return map;
}

export function checkGrounding(text, cited, request, lang = 'es') {
  const ev = resolve(request), t = lower(text);
  const facts = cited.map(id => ev.get(id)).filter(Boolean);
  const bodies = new Set(facts.flatMap(f => f.bodies ?? [])), signs = new Set(facts.flatMap(f => f.signs ?? []));
  const types = new Set(facts.flatMap(f => f.types ?? [])), tones = new Set(facts.flatMap(f => f.tones ?? []));
  const problems = [];
  for (const L of ['es', 'en']) {
    SIGN_NAMES[L].forEach((name, i) => {if (new RegExp(`\\b${lower(name)}\\b`).test(t) && !signs.has(i)) problems.push(`sign ${name} not in cited evidence`);});
    for (const [k, name] of Object.entries(BODY_NAMES[L])) if (new RegExp(`\\b${lower(name)}\\b`).test(t) && !bodies.has(k)) problems.push(`body ${name} not in cited evidence`);
    for (const [k, name] of Object.entries(ASPECT_NAMES[L])) if (new RegExp(`\\b${lower(name)}`).test(t) && !types.has(k)) problems.push(`aspect ${name} not in cited evidence`);
  }
  if (tones.size && HARMONY.test(t) && !tones.has('harmonious') && !tones.has('mixed')) problems.push('harmony language over tense evidence');
  if (tones.size && TENSION.test(t) && !tones.has('tense') && !tones.has('mixed')) problems.push('tension language over harmonious evidence');
  if (CERTAINTY.test(t)) problems.push('certainty language');
  if (PREDICTION.test(t)) problems.push('prediction language');
  void lang;
  return [...new Set(problems)];
}

/** Deterministic stand-in for a model: one paragraph per strongest aspect of each person. */
export function mockModel(request) {
  const es = request.locale === 'es';
  const chapters = [];
  for (const [who, key] of [['A', 'personA'], ['B', 'personB']]) {
    const p = request.persons[who];
    const paragraphs = p.aspects.slice(0, 3).map(a => {
      const b1 = BODY_NAMES[request.locale][a.a], b2 = BODY_NAMES[request.locale][a.b], asp = ASPECT_NAMES[request.locale][a.type];
      const tone = a.tone === 'harmonious' ? (es ? 'suelen colaborar con facilidad' : 'tend to cooperate with ease') : a.tone === 'tense' ? (es ? 'pueden generar cierta fricción creativa' : 'may create some creative friction') : (es ? 'actúan muy unidos' : 'act closely together');
      return {text: es ? `En la carta de ${who}, ${b1} y ${b2} forman una ${asp}: ${tone}.` : `In ${who}'s chart, ${b1} and ${b2} form a ${asp}: they ${tone}.`, evidence: [`${who}:${a.id}`]};
    });
    if (paragraphs.length) chapters.push({key, paragraphs});
  }
  return JSON.stringify({chapters});
}

/** Rough token and cost model (≈4 characters per token). */
export function estimateCost(request, responseText, pricing = PLACEHOLDER_PRICING) {
  const inputTokens = Math.ceil(JSON.stringify(request).length / 4), outputTokens = Math.ceil(responseText.length / 4);
  const usd = inputTokens / 1e6 * pricing.inputUsdPerMillion + outputTokens / 1e6 * pricing.outputUsdPerMillion;
  return {inputTokens, outputTokens, usd: Math.round(usd * 1e5) / 1e5, placeholder: true};
}
