import {synastry} from './synastry.mjs';
const themes={
 Sun:['identidad y prioridades','identity and priorities'],
 Moon:['necesidades emocionales','emotional needs'],
 Mercury:['comunicación y maneras de pensar','communication and ways of thinking'],
 Venus:['afecto y formas de valorar al otro','affection and ways of appreciating each other'],
 Mars:['iniciativa y manejo de desacuerdos','initiative and handling disagreements'],
 Jupiter:['entusiasmo y aprendizaje','enthusiasm and learning'],
 Saturn:['límites y responsabilidades','boundaries and responsibilities'],
 Ascendant:['primeras impresiones y expresión personal','first impressions and self-expression'],
};
const labels={Sun:['Sol','Sun'],Moon:['Luna','Moon'],Mercury:['Mercurio','Mercury'],Venus:['Venus','Venus'],Mars:['Marte','Mars'],Jupiter:['Júpiter','Jupiter'],Saturn:['Saturno','Saturn'],Ascendant:['Ascendente','Ascendant']};
const aspects={trine:['trígono','trine'],sextile:['sextil','sextile'],square:['cuadratura','square'],opposition:['oposición','opposition'],conjunction:['conjunción','conjunction']};
const hard=new Set(['Saturn','Mars']);
export function relationshipStory(charts,locale='es',relationship='partner',partial=false){
 const es=locale==='es',i=es?0:1;
 // The representative noon chart is not sufficient evidence for a precise partial reading.
 if(partial||!charts?.[0]||!charts?.[1])return {intro:es?'Sin las dos horas exactas, no podemos confirmar los contactos de esta lectura. Exploren sus diferencias con curiosidad, sin asumir lo que la otra persona siente.':'Without both exact times, we cannot confirm the contacts in this reading. Explore your differences with curiosity, without assuming how the other person feels.',strengths:[],challenges:[],advice:es?'Pregúntense qué esperan de este vínculo y qué les ayuda a sentirse comprendidos.':'Ask each other what you expect from this connection and what helps you feel understood.'};
 const contacts=synastry(charts[0],charts[1]).aspects.filter(a=>themes[a.personA]&&themes[a.personB]&&a.deviation<({trine:6,sextile:4,square:6,opposition:8,conjunction:8}[a.name]??0));
 const strength=contacts.filter(a=>['trine','sextile'].includes(a.name)||(a.name==='conjunction'&&!hard.has(a.personA)&&!hard.has(a.personB)));
 const challenge=contacts.filter(a=>['square','opposition'].includes(a.name)||(a.name==='conjunction'&&(hard.has(a.personA)||hard.has(a.personB))));
 const describe=(list,positive)=>{
  const seen=new Set(),out=[];
  for(const a of list){
   const key=[a.personA,a.personB].sort().join(':');if(seen.has(key))continue;seen.add(key);
   const x=themes[a.personA][i],y=themes[a.personB][i],topic=x===y?x:es?x+' y '+y:x+' and '+y;
   const emotional=[a.personA,a.personB].includes('Moon'),talk=[a.personA,a.personB].includes('Mercury');
   const advice=es?(emotional?'Compartan qué necesitan para sentirse escuchados.':talk?'Antes de responder, comprueben qué quiso decir la otra persona.':'Conversen sobre qué les funciona a ambos sin dar nada por sentado.'):(emotional?'Share what you need to feel heard.':talk?'Before responding, check what the other person meant.':'Discuss what works for both of you without taking it for granted.');
   out.push({topic,text:es?(positive?'Este contacto se interpreta como una posible facilidad para conectar en '+topic+'. Puede ser una oportunidad para apoyarse y descubrir afinidades.':'Este contacto invita a observar diferencias en '+topic+'. Podrían necesitar negociar expectativas en vez de esperar que el otro reaccione igual.'):(positive?'This contact is interpreted as a possible ease of connection around '+topic+'. It may offer a chance to support each other and discover common ground.':'This contact invites you to notice differences around '+topic+'. You may need to negotiate expectations rather than expect identical reactions.'),evidence:labels[a.personA][i]+' (A) · '+aspects[a.name][i]+' · '+labels[a.personB][i]+' (B)',advice});
   if(out.length===3)break;
  }return out;
 };
 const strengths=describe(strength,true),challenges=describe(challenge,false);
 const context=es?(relationship==='friendship'?'amistad':relationship==='crush'?'conexión que están descubriendo':'relación'):(relationship==='friendship'?'friendship':relationship==='crush'?'connection you are exploring':'relationship');
 const intro=es?'En esta '+context+', '+(strengths.length?'la lectura simbólica destaca afinidades en '+strengths[0].topic: 'no aparece un contacto favorable destacado entre los elementos seleccionados')+'. '+(challenges.length?'Al mismo tiempo, invita a prestar atención a '+challenges[0].topic+'.':'No aparecen tensiones destacadas en esta selección; eso no significa que no existan diferencias reales.'):'In this '+context+', '+(strengths.length?'the symbolic reading highlights affinity around '+strengths[0].topic:'no prominent supportive contact appears among the selected points')+'. '+(challenges.length?'It also invites you to pay attention to '+challenges[0].topic+'.':'No prominent tensions appear in this selection; that does not mean there are no real differences.');
 return {intro,strengths,challenges,advice:challenges[0]?.advice??strengths[0]?.advice??(es?'Hablen de sus expectativas y escuchen sin asumir.':'Talk about expectations and listen without assuming.')};
}
