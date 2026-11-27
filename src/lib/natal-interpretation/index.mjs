// Public entry: evidence (Layer A) + deterministic narrative (Layer B).
export {natalEvidence, natalAspects, evidenceIds, EVIDENCE_VERSION} from './evidence.mjs';
export {personReading, coupleStory, cosmicStory, NARRATIVE_VERSION} from './narrative.mjs';
export {KB_VERSION, FORBIDDEN, ROMANTIC_WORDS} from './knowledge.mjs';
import {natalEvidence} from './evidence.mjs';
import {cosmicStory} from './narrative.mjs';
/** Build the chaptered story from a matchPreview result ('ok' or 'partial'). */
export function storyFromResult(result, {lang = 'es', names = ['A', 'B'], relationship = 'partner', premium = false, unknownTime = [false, false]} = {}) {
  if (!result?.charts) return null;
  const ev = result.charts.map((c, i) => natalEvidence(c, {unknownTime: unknownTime[i], moonSamples: c.moonSamples ?? null}));
  return {evidence: ev, ...cosmicStory(ev[0], ev[1], {lang, names, relationship, premium})};
}
