import {resolveLocalTime} from './birth-time.mjs';
import {natalAngles,validCoordinates,wholeSignHouse} from './natal-angles.mjs';
import {calculateUtc} from './ephemeris.mjs';
import {compatibility} from './compatibility.mjs';
import {placidusCusps,houseOf,meanNode} from './houses.mjs';
import {validateBirth} from './birth-input.mjs';
// Unknown-time results are sampled estimates, not guaranteed mathematical bounds.
export function matchPreview(a,b,cutoff){
 for(const p of [a,b])if(validateBirth(p,cutoff))return {status:'invalid'};
 const samples=[];
 for(const p of [a,b]){
  const times=p.unknownTime?['00:00','06:00','12:00','18:00','23:59']:[p.time];
  const charts=[];
  for(const time of times){
   let resolved;try{resolved=resolveLocalTime(p.date,time,p.zone)}catch{return {status:'invalid-time-zone-or-date'}}
   if(resolved.status!=='unique'&&!p.unknownTime)return {status:resolved.status};
   for(const instant of resolved.candidates){
    const chart=calculateUtc(new Date(instant));
    if(p.unknownTime)delete chart.longitudes.Moon;
    if(!p.unknownTime&&validCoordinates(p.latitude,p.longitude)){
     chart.angles=natalAngles(new Date(instant),p.latitude,p.longitude);
     if(chart.angles)chart.houses=Object.fromEntries(Object.entries(chart.longitudes).map(([key,lon])=>[key,wholeSignHouse(lon,chart.angles.ascendant)]));
     const placidus=chart.angles?placidusCusps(new Date(instant),p.latitude,p.longitude,chart.angles):null;
     if(placidus)chart.placidus={cusps:placidus.cusps,houses:Object.fromEntries(Object.entries(chart.longitudes).map(([key,lon])=>[key,houseOf(lon,placidus.cusps)]))};
    }
    {const north=meanNode(new Date(instant));chart.nodes={type:'mean',north,south:(north+180)%360}}
    charts.push(chart);
   }
  }
  if(!charts.length)return {status:'nonexistent'};
  samples.push(charts);
 }
 const limitations=['Local angles and houses require known time and coordinates; Placidus omitted beyond 66° latitude; mean lunar node only; no Chiron.','Planet longitudes and ASC/MC cross-checked against Swiss Ephemeris (Moshier) within 20 arcseconds for 12 reference cases; broader validation pending.','Symbolic score, not a scientific probability.'];
 if(a.date<'1970-01-01'||b.date<'1970-01-01')limitations.push('Birth before 1970: historical time-zone offsets vary between tzdb builds for some zones; verify the local offset.');
 if(a.unknownTime||b.unknownTime){
  const results=samples[0].flatMap(x=>samples[1].map(y=>compatibility(x.longitudes,y.longitudes)));
  const range=values=>{const numbers=values.filter(x=>typeof x==='number'&&Number.isFinite(x));return numbers.length?[Math.min(...numbers),Math.max(...numbers)]:null};
  const dimensions=Object.fromEntries(Object.keys(results[0].dimensions).map(k=>[k,range(results.map(x=>x.dimensions[k].score))]));
  return {status:'partial',engineVersion:samples[0][0].version,indexRange:range(results.map(x=>x.index)),dimensions,sampleCount:results.length,limitations:[...limitations,'Unknown time: Moon excluded for affected profile; sampled ranges are estimates, not guaranteed bounds.']};
 }
 return {status:'ok',engineVersion:samples[0][0].version,result:compatibility(samples[0][0].longitudes,samples[1][0].longitudes),charts:[samples[0][0],samples[1][0]],limitations};
}
