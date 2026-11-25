'use client';
import { useEffect, useState } from 'react';
import { matchPreview, type MatchResult } from '../lib/match-preview.mjs';
import { shareCardSvg } from '../lib/share-card.mjs';
import { brand } from '../config/product';
import { validateBirth, type BirthInput } from '../lib/birth-input.mjs';
const copy = {
 en: { lead: 'Explore the symbolic connection between you and someone special.', choose: 'Choose your connection', modes: ['Partner','Crush','Friendship'], note: 'A symbolic experience for entertainment and reflection. Not a scientific prediction.', pending: 'Your inputs are valid. The calculation engine is not ready; no result has been generated.', first: 'Your birth details', second: 'Their birth details', date: 'Birth date', time: 'Birth time', unknown: 'I do not know the birth time', place: 'Birth city and country', check: 'Validate details', clear: 'Clear details', consent: 'Both people are adults and I have permission to use these details.', privacy: 'Preview only: details stay in this page and are not submitted or saved.', invalid: 'Check the birth details and confirm permission.' },
 es: { lead: 'Explora la conexión simbólica entre tú y alguien especial.', choose: 'Elige tu conexión', modes: ['Pareja','Crush','Amistad'], note: 'Una experiencia simbólica de entretenimiento y reflexión. No es una predicción científica.', pending: 'Tus datos son válidos. El motor de cálculo aún no está disponible; no se ha generado un resultado.', first: 'Tus datos natales', second: 'Sus datos natales', date: 'Fecha de nacimiento', time: 'Hora de nacimiento', unknown: 'No conozco la hora de nacimiento', place: 'Ciudad y país de nacimiento', check: 'Validar datos', clear: 'Borrar datos', consent: 'Ambas personas son adultas y tengo permiso para usar estos datos.', privacy: 'Vista previa: los datos permanecen en esta página y no se envían ni guardan.', invalid: 'Revisa los datos natales y confirma el permiso.' }
} as const;
const empty = (): BirthInput => ({date:'',time:'',unknownTime:false,place:'',zone:''});
type Labels = typeof copy[keyof typeof copy];
function Profile({title,value,onChange,t}: {title:string;value:BirthInput;onChange:(v:BirthInput)=>void;t:Labels}){
 return <fieldset className="profile"><legend>{title}</legend>
 <label>{t.date}<input required type="date" min="1970-01-01" value={value.date} onChange={e=>onChange({...value,date:e.target.value})}/></label>
 <label>{t.time}<input type="time" required={!value.unknownTime} disabled={value.unknownTime} value={value.time} onChange={e=>onChange({...value,time:e.target.value})}/></label>
 <label className="check"><input type="checkbox" checked={value.unknownTime} onChange={e=>onChange({...value,unknownTime:e.target.checked,time:e.target.checked?'':value.time})}/>{t.unknown}</label>
 <label>{t.place}<input required maxLength={150} value={value.place} onChange={e=>onChange({...value,place:e.target.value})}/></label><label>{t.date==='Birth date'?'Birth time zone (IANA)':'Zona horaria natal (IANA)'}<input required placeholder="America/Lima" value={value.zone} onChange={e=>onChange({...value,zone:e.target.value})}/></label></fieldset>
}
async function downloadCard(index:number,lang:'en'|'es',format:'story'|'portrait'){
 const svg=shareCardSvg(index,lang,format);
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=format==='story'?1920:1350;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.drawImage(image,0,0);
  const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG unavailable')),'image/png'));
  const link=document.createElement('a');const downloadUrl=URL.createObjectURL(png);link.href=downloadUrl;link.download='astralis-connection-'+format+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
 }finally{URL.revokeObjectURL(url)}
}
export default function Home(){
 const [lang,setLang]=useState<'en'|'es'>('en'); const [mode,setMode]=useState<number|null>(null);
 const [a,setA]=useState<BirthInput>(empty); const [b,setB]=useState<BirthInput>(empty);
 const [consent,setConsent]=useState(false); const [status,setStatus]=useState<'valid'|'invalid'|null>(null); const [result,setResult]=useState<MatchResult|null>(null);
 const [shareError,setShareError]=useState(false); const t=copy[lang]; useEffect(()=>{document.documentElement.lang=lang},[lang]);
 function clear(){setA(empty());setB(empty());setConsent(false);setStatus(null);setResult(null);setShareError(false)}
 return <main className="shell"><header><strong>{brand.name}</strong><div aria-label="Language"><button aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button> / <button aria-pressed={lang==='es'} onClick={()=>setLang('es')}>ES</button></div></header><section className="hero"><div className="orbit" aria-hidden="true"><span>✧</span></div><h1>{brand.tagline[lang]}</h1><p>{t.lead}</p><h2>{t.choose}</h2><div className="choices">{t.modes.map((m,i)=><button key={i} aria-pressed={mode===i} onClick={()=>{setMode(i);clear()}}>{m}</button>)}</div>
 {mode!==null&&<form className="birth-form" onSubmit={e=>{e.preventDefault();const now=new Date();const cutoff=new Date(Date.UTC(now.getFullYear()-18,now.getMonth(),now.getDate())).toISOString().slice(0,10);const valid=consent&&!validateBirth(a,cutoff)&&!validateBirth(b,cutoff);setStatus(valid?'valid':'invalid');setResult(null);if(valid){try{setResult(matchPreview(a,b,cutoff))}catch{setStatus('invalid')}}}}>
 <p>{t.privacy}</p><div className="profiles"><Profile title={t.first} value={a} onChange={v=>{setA(v);setStatus(null);setResult(null)}} t={t}/><Profile title={t.second} value={b} onChange={v=>{setB(v);setStatus(null);setResult(null)}} t={t}/></div>
 <label className="check"><input type="checkbox" required checked={consent} onChange={e=>{setConsent(e.target.checked);setStatus(null);setResult(null)}}/>{t.consent}</label><div className="choices"><button type="submit">{t.check}</button><button type="button" onClick={clear}>{t.clear}</button></div>{status==='invalid'&&<p role="status">{t.invalid}</p>}{result?.status==='ok'&&<section aria-live="polite"><h2>{lang==='es'?'Índice simbólico experimental':'Experimental symbolic index'}: {result.result.index??'—'}/100</h2>{Object.entries(result.result.dimensions).map(([key,d])=><p key={key}>{({emotional:lang==='es'?'Emocional':'Emotional',communication:lang==='es'?'Comunicación':'Communication',attraction:lang==='es'?'Atracción':'Attraction',stability:lang==='es'?'Estabilidad':'Stability',growth:lang==='es'?'Crecimiento':'Growth'} as Record<string,string>)[key]}: {d.score??'—'}/100</p>)}<p>{lang==='es'?'Prototipo sin validación astronómica independiente. No incluye casas, ascendente, nodos ni Quirón.':'Prototype pending independent astronomical validation. No houses, ascendant, nodes or Chiron.'}</p>{result.result.index!==null&&<div className="choices">{(['story','portrait'] as const).map(format=><button key={format} type="button" onClick={()=>{setShareError(false);const index=result.result.index;if(index!==null)void downloadCard(index,lang,format).catch(()=>setShareError(true))}}>{lang==='es'?'Descargar tarjeta':'Download card'} · {format==='story'?'9:16':'4:5'}</button>)}</div>}{shareError&&<p role="alert">{lang==='es'?'No se pudo exportar la imagen.':'Image export failed.'}</p>}</section>}{result?.status==='partial'&&<section aria-live="polite"><h2>{lang==='es'?'Lectura parcial: rango estimado':'Partial reading: sampled range'}: {result.indexRange?.join('–')??'—'}/100</h2><p>{lang==='es'?'Se comparan varias horas posibles; se omite la Luna del perfil sin hora. El rango no garantiza todos los resultados posibles.':'Several possible times are sampled; the Moon is omitted for profiles without a known time. The range is not a guaranteed bound.'}</p></section>}{result&&result.status!=='ok'&&result.status!=='partial'&&<p role="status">{lang==='es'?'No se puede calcular con estos datos: verifica la zona horaria y la hora exacta.':'Cannot calculate: check the time zone and exact time.'} ({result.status})</p>}</form>}
 <small>{t.note}</small></section></main>
}
