import {resolveLocalTime} from './birth-time.mjs';
import {calculateUtc} from './ephemeris.mjs';
import {compatibility} from './compatibility.mjs';
import {validateBirth} from './birth-input.mjs';
export function matchPreview(a,b,cutoff){
 for(const p of [a,b]){
  if(validateBirth(p,cutoff))return {status:'invalid'};
  if(p.unknownTime)return {status:'unknown-time-unsupported'};
 }
 const charts=[];
 for(const p of [a,b]){
  let resolved;try{resolved=resolveLocalTime(p.date,p.time,p.zone)}catch{return {status:'invalid-time-zone-or-date'}}
  if(resolved.status!=='unique')return {status:resolved.status};
  charts.push(calculateUtc(new Date(resolved.candidates[0])));
 }
 return {status:'ok',engineVersion:charts[0].version,result:compatibility(charts[0].longitudes,charts[1].longitudes),limitations:['No houses, ascendant, nodes or Chiron.','Prototype pending independent ephemeris validation.','Symbolic score, not a scientific probability.']};
}
