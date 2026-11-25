// Deterministic reflection prompts. Never infer actual relationship quality.
export const VERSION='reflection-0.1';
const COPY={
 emotional:{en:['Emotional connection','What helps each of you feel heard and supported?'],es:['Conexión emocional','¿Qué ayuda a cada persona a sentirse escuchada y acompañada?']},
 communication:{en:['Communication','How could you express a disagreement without making assumptions?'],es:['Comunicación','¿Cómo podrían expresar un desacuerdo sin hacer suposiciones?']},
 attraction:{en:['Symbolic attraction','Which shared activities bring you closer?'],es:['Atracción simbólica','¿Qué actividades compartidas les permiten conectar mejor?']},
 stability:{en:['Values and stability','Which expectations and boundaries matter most to each of you?'],es:['Valores y estabilidad','¿Qué expectativas y límites son importantes para cada persona?']},
 growth:{en:['Growth','What could you learn from your differences?'],es:['Crecimiento','¿Qué podrían aprender de sus diferencias?']}
};
export function interpretDimensions(dimensions,locale='en'){
 if(!['en','es'].includes(locale))throw new RangeError('Unsupported locale');
 const ranked=Object.keys(COPY).flatMap(key=>{
 const d=dimensions?.[key];return typeof d?.score==='number'&&Number.isFinite(d.score)&&d.score>=0&&d.score<=100&&d.coverage===1?[{key,score:d.score,label:COPY[key][locale][0],question:COPY[key][locale][1]}]:[];
 }).sort((a,b)=>b.score-a.score);
 const highest=ranked[0],lowest=ranked.at(-1);
 return {version:VERSION,strength:highest&&highest.score>50?highest:null,challenge:lowest&&lowest.score<50?lowest:null,questions:ranked.slice(0,2).map(x=>x.question),disclaimer:locale==='es'?'Temas simbólicos para conversar, no conclusiones sobre la relación.':'Symbolic conversation themes, not conclusions about the relationship.'};
}
