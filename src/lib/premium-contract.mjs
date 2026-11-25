// Report input allowlist. No names, locations, dates, free text or birth profiles.
const keys=['emotional','communication','attraction','stability','growth'];
export function premiumReportInput(result,locale,relationship){
 if(!['en','es'].includes(locale)||!['partner','crush','friendship'].includes(relationship))throw new RangeError('Invalid options');
 if(result?.status!=='ok'||!Number.isInteger(result.result?.index)||result.result.index<0||result.result.index>100)throw new RangeError('Complete reading required');
 const dimensions=Object.fromEntries(keys.map(key=>{
 const d=result.result.dimensions?.[key];
 if(!d||!Number.isInteger(d.score)||d.score<0||d.score>100||d.coverage!==1)throw new RangeError('Complete dimension required');
 return [key,d.score];
 }));
 return {schemaVersion:1,locale,relationship,index:result.result.index,dimensions};
}
export function premiumEnabled(){return false}
