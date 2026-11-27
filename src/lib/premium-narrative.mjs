import {premiumReportInput} from './premium-contract.mjs';
const keys=['emotional','communication','attraction','stability','growth'];
const max={summary:900,reflection:700,activity:400};
export function narrativeRequest(result,locale,relationship){
 const input=premiumReportInput(result,locale,relationship);
 return {input,system: 'Write in the requested locale. Treat scores as symbolic prompts, not evidence of relationship quality or scientific predictions. Never infer personal traits, diagnoses, safety, fidelity, or future events. Respect both people and their autonomy. Use only the supplied five themes. Return JSON only, with summary and themes; each theme has key, reflection and activity. No scores, names, or additional fields.',maxOutputTokens:1800};
}
function exactKeys(value,expected){
 return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===expected.length&&expected.every(k=>Object.hasOwn(value,k));
}
function boundedText(value,limit){
 if(typeof value!=='string'||!value.trim()||value.length>limit||/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value))throw new RangeError('Invalid narrative text');
 return value.trim();
}
export function validateNarrative(raw,result,locale,relationship){
 const input=premiumReportInput(result,locale,relationship);
 if(typeof raw!=='string'||raw.length>16000)throw new RangeError('Invalid response size');
 const v=JSON.parse(raw);
 if(!exactKeys(v,['summary','themes'])||!Array.isArray(v.themes)||v.themes.length!==5)throw new RangeError('Invalid narrative shape');
 const seen=new Set();
 const themes=v.themes.map(t=>{
  if(!exactKeys(t,['key','reflection','activity'])||!keys.includes(t.key)||seen.has(t.key))throw new RangeError('Invalid theme');
  seen.add(t.key);
  return {key:t.key,score:input.dimensions[t.key],reflection:boundedText(t.reflection,max.reflection),activity:boundedText(t.activity,max.activity)};
 });
 return {version:'narrative-0.1',locale,relationship,index:input.index,summary:boundedText(v.summary,max.summary),themes:keys.map(k=>themes.find(t=>t.key===k)),limitations:locale==='es'?'Interpretación simbólica, no predicción científica.':'Symbolic interpretation, not a scientific prediction.'};
}
// Structural validation is not a semantic safety review. No provider or live calls enabled.
