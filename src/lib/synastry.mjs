import {aspectBetween} from './compatibility.mjs';
import {wholeSignHouse} from './natal-angles.mjs';
const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<360;
function points(chart){
 const entries=bodies.filter(k=>valid(chart?.longitudes?.[k])).map(k=>[k,chart.longitudes[k]]);
 for(const [key,field] of [['Ascendant','ascendant'],['Midheaven','midheaven']])if(valid(chart?.angles?.[field]))entries.push([key,chart.angles[field]]);
 return entries;
}
function overlay(source,target){
 const asc=target?.angles?.ascendant;
 if(!valid(asc)||target.angles.houseSystem!=='whole-sign')return null;
 return bodies.filter(k=>valid(source?.longitudes?.[k])).map(body=>({body,house:wholeSignHouse(source.longitudes[body],asc)}));
}
export function synastry(a,b){
 const aspects=[];
 for(const [personA,x] of points(a))for(const [personB,y] of points(b)){
  const aspect=aspectBetween(x,y);
  if(aspect)aspects.push({personA,personB,...aspect});
 }
 aspects.sort((x,y)=>x.deviation-y.deviation||x.personA.localeCompare(y.personA)||x.personB.localeCompare(y.personB));
 return {version:'synastry-0.1',aspects,overlays:{aInB:overlay(a,b),bInA:overlay(b,a)},houseSystem:'whole-sign',disclaimer:'Symbolic aspects, not a scientific assessment. Existing compatibility index is unchanged.'};
}
