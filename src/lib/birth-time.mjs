// Explicit IANA zone required; never infer a zone from free-text city.
// Supports 1900 onward. Pre-1970 offsets were cross-checked against Python zoneinfo for
// canonical zones (see QA_REPORT.md) but differ for tzdb link zones, so they are flagged.
export function resolveLocalTime(date,time,zone){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'1900-01-01'||typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||typeof zone!=='string'||!zone.trim())throw new RangeError('Unsupported local date, time or zone');
 const target=date+'T'+time;const nominal=new Date(target+':00Z');
 if(!Number.isFinite(nominal.getTime())||nominal.toISOString().slice(0,16)!==target)throw new RangeError('Invalid date');
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,calendar:'gregory',numberingSystem:'latn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 function local(ms){const p=Object.fromEntries(formatter.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute+':'+p.second}
 // Collect candidate offsets around the requested time, including transition days.
 const offsets=new Set();for(let h=-48;h<=48;h+=3){const ms=nominal.getTime()+h*3600000;offsets.add(new Date(local(ms)+'Z').getTime()-ms)}
 const candidates=[...offsets].map(offset=>nominal.getTime()-offset).filter(ms=>local(ms)===target+':00').sort((a,b)=>a-b).map(ms=>new Date(ms).toISOString());
 return {status:candidates.length===1?'unique':candidates.length===0?'nonexistent':'ambiguous',candidates,tzdbConfidence:date<'1970-01-01'?'historical-unverified':'standard'};
}
