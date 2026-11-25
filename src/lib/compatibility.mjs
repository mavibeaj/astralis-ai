// Symbolic rules v0.1; not scientific probabilities. Inputs must be verified tropical longitudes.
export const VERSION = 'symbolic-0.1';
export const WEIGHTS = Object.freeze({emotional:25,communication:20,attraction:20,stability:20,growth:15});
const ASPECTS = [{name:'conjunction',angle:0,orb:8,value:0.4},{name:'sextile',angle:60,orb:4,value:0.6},{name:'square',angle:90,orb:6,value:-0.7},{name:'trine',angle:120,orb:6,value:1},{name:'opposition',angle:180,orb:8,value:-0.5}];
const RULES = {emotional:[['Moon','Moon'],['Sun','Moon']],communication:[['Mercury','Mercury'],['Mercury','Moon']],attraction:[['Venus','Mars'],['Venus','Venus']],stability:[['Saturn','Venus'],['Sun','Sun']],growth:[['Jupiter','Sun'],['Saturn','Moon']]};
const valid = n => typeof n==='number' && Number.isFinite(n) && n>=0 && n<360;
export function angularDistance(a,b){if(!valid(a)||!valid(b))throw new RangeError('Invalid longitude');const d=Math.abs(a-b);return Math.min(d,360-d)}
export function aspectBetween(a,b){const distance=angularDistance(a,b);for(const rule of ASPECTS){const deviation=Math.abs(distance-rule.angle);if(deviation<=rule.orb)return {name:rule.name, distance, deviation, contribution:rule.value*(1-deviation/rule.orb)}}return null}
export function compatibility(a,b){
 const dimensions={};let weighted=0,available=0;const seen=new Set();
 for(const [dimension,rules] of Object.entries(RULES)){
  let sum=0,count=0,possible=0;const evidence=[];
  for(const [x,y] of rules){
   for(const [p,q] of x===y?[[x,y]]:[[x,y],[y,x]]){
    const key=p+':'+q;if(seen.has(key))continue;seen.add(key);possible++;
    if(!valid(a?.[p])||!valid(b?.[q]))continue;
    count++;const aspect=aspectBetween(a[p],b[q]);sum+=aspect?.contribution??0;
    if(aspect)evidence.push({personA:p,personB:q,...aspect});
   }
  }
  const score=count?Math.round(50+50*sum/count):null;
  dimensions[dimension]={score,coverage:count/possible,evidence};
  if(score!==null){weighted+=score*WEIGHTS[dimension];available+=WEIGHTS[dimension]}
 }
 return {version:VERSION,index:available?Math.round(weighted/available):null,weightCoverage:available/100,dimensions,disclaimer:'Symbolic interpretation index, not a probability or scientific assessment.'};
}
