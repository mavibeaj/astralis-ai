'use client';
import type {CosmicStory, Section, CrossCard} from '../../lib/natal-interpretation/index.mjs';
import {SIGN_NAMES, BODY_NAMES, ASPECT_NAMES} from '../../lib/natal-interpretation/knowledge.mjs';

type Lang = 'es' | 'en';
type Rel = 'partner' | 'crush' | 'friendship';
const T = {
  es: {kicker: 'Su lectura cósmica', chapters: 'Capítulos', ch: ['El universo de', 'El universo de', 'La historia de ambos', 'Afinidades simbólicas', 'Diferencias y desafíos', 'En la vida cotidiana', 'Consejos para ustedes', 'Su historia en breve'],
    basis: '¿En qué se basa?', daily: 'En el día a día', benefit: 'Qué puede aportar', tip: 'Prueben esto', care: 'A tener en cuenta', intense: 'Conexiones intensas o mixtas', complement: 'Cómo se complementan', misunderstanding: 'Posible malentendido', understand: 'Lo que conviene comprender', helps: 'Qué puede ayudar',
    noAff: 'No encontramos afinidades directas entre sus cartas en esta lectura. No significa que no existan: están por descubrirse en la convivencia.', noTen: 'No aparecen tensiones directas entre sus cartas. Aun así, toda relación tiene diferencias que vale la pena conversar.',
    status: {evidence: 'Con evidencia', signs: 'Por estilos', conversation: 'Para conversar'}, comm: 'Comunicación', needs: 'Expresar necesidades', diff: 'Conversar las diferencias', shared: 'Intereses compartidos', space: 'Espacios individuales', questions: 'Preguntas para hacerse', activities: 'Actividades para explorar el vínculo',
    uncertain: 'Algunos elementos no se interpretan porque falta la hora exacta de nacimiento: preferimos no inventar.', disclaimer: 'Lectura simbólica para conversar y reflexionar. No es una predicción ni una evaluación científica de la relación.', words: 'palabras', open: 'Abrir', more: 'Más detalle'},
  en: {kicker: 'Your cosmic reading', chapters: 'Chapters', ch: ['The universe of', 'The universe of', 'Your story together', 'Symbolic affinities', 'Differences and challenges', 'In everyday life', 'Advice for you both', 'Your story in brief'],
    basis: 'What is this based on?', daily: 'Day to day', benefit: 'What it can bring', tip: 'Try this', care: 'Worth keeping in mind', intense: 'Intense or mixed connections', complement: 'How they complement each other', misunderstanding: 'Possible misunderstanding', understand: 'Worth understanding', helps: 'What can help',
    noAff: 'We found no direct affinities between your charts in this reading. That does not mean there are none: they are still to be discovered.', noTen: 'No direct tensions appear between your charts. Still, every relationship has differences worth talking about.',
    status: {evidence: 'With evidence', signs: 'By style', conversation: 'To discuss'}, comm: 'Communication', needs: 'Expressing needs', diff: 'Talking about differences', shared: 'Shared interests', space: 'Personal space', questions: 'Questions to ask each other', activities: 'Activities to explore the bond',
    uncertain: 'Some elements are not interpreted because the exact birth time is missing: we prefer not to invent.', disclaimer: 'A symbolic reading for conversation and reflection. Not a prediction or a scientific assessment of the relationship.', words: 'words', open: 'Open', more: 'More detail'},
};

/** Human-readable label for an evidence id. */
function label(id: string, story: CosmicStory, lang: Lang, names: [string, string]) {
  const B = BODY_NAMES[lang] as Record<string, string>, S = SIGN_NAMES[lang], A = ASPECT_NAMES[lang] as Record<string, string>;
  let who = '', ev = story.evidence[0], raw = id;
  if (id.startsWith('A:') || id.startsWith('B:')) {who = id[0] === 'A' ? names[0] : names[1]; ev = story.evidence[id[0] === 'A' ? 0 : 1]; raw = id.slice(2);}
  const [kind, rest] = raw.split(/:(.*)/s);
  if (kind === 'placement') {const p = ev.placements[rest]; if (!p) return raw; return `${who ? who + ': ' : ''}${B[rest]} ${lang === 'es' ? 'en' : 'in'} ${S[p.sign]}${p.stableOnly ? '' : ` ${Math.floor(p.degree)}°`}${p.house ? ` · ${lang === 'es' ? 'casa' : 'house'} ${p.house}` : ''}`;}
  if (kind === 'aspect') {const a = ev.aspects.find((x: {id: string}) => x.id === raw); return a ? `${who ? who + ': ' : ''}${B[a.a]} ${A[a.type]} ${B[a.b]} (${lang === 'es' ? 'orbe' : 'orb'} ${a.deviation}°)` : raw;}
  if (kind === 'cross') {const c = [...story.couple.affinities, ...(story.couple.intense ?? []), ...story.couple.tensions].find(x => x.id === id); return c ? c.technical : raw;}
  if (kind === 'element') return `${who ? who + ': ' : ''}${lang === 'es' ? 'elemento predominante' : 'dominant element'} ${rest}`;
  if (kind === 'modality') return `${lang === 'es' ? 'modalidad predominante' : 'dominant modality'} ${rest}`;
  if (kind === 'less') return `${who ? who + ': ' : ''}${lang === 'es' ? 'elemento menos representado en la carta disponible' : 'least represented element in the available chart'}: ${rest}`;
  if (kind === 'stellium') return `${lang === 'es' ? 'concentración de planetas en' : 'planet cluster in'} ${S[Number(rest)]}`;
  return raw;
}

function Basis({ids, story, lang, names}: {ids: string[]; story: CosmicStory; lang: Lang; names: [string, string]}) {
  if (!ids.length) return null;
  return <details className="basis"><summary>{T[lang].basis}</summary><ul>{ids.map(id => <li key={id}>{label(id, story, lang, names)}</li>)}</ul></details>;
}

function Person({idx, story, lang, names}: {idx: 0 | 1; story: CosmicStory; lang: Lang; names: [string, string]}) {
  const p = story.people[idx];
  const prefixed = (sec: Section) => sec.evidence.map(e => (idx === 0 ? 'A:' : 'B:') + e);
  return <div className="person-grid">
    {p.sections.map(sec => <article key={sec.key} className={`story-card ${sec.key}`}>
      <h4>{sec.title}</h4><p>{sec.text}</p><Basis ids={prefixed(sec)} story={story} lang={lang} names={names}/>
    </article>)}
    {p.details.length > 0 && <details className="story-card wide"><summary>{T[lang].more}</summary>{p.details.map(d => <p key={d.point}>{d.text}</p>)}</details>}
  </div>;
}

function Card({c, story, lang, names}: {c: CrossCard; story: CosmicStory; lang: Lang; names: [string, string]}) {
  const t = T[lang];
  return <article className={`story-card cross ${c.tone}`}>
    <h4>{c.title}</h4><p>{c.story}</p>
    <dl>
      <dt>{t.daily}</dt><dd>{c.daily}</dd>
      {c.benefit && <><dt>{t.benefit}</dt><dd>{c.benefit}</dd></>}
      {c.tip && <><dt>{t.tip}</dt><dd>{c.tip}</dd></>}
      {c.care && <><dt>{t.care}</dt><dd>{c.care}</dd></>}
      {c.misunderstanding && <><dt>{t.misunderstanding}</dt><dd>{c.misunderstanding}</dd></>}
      {c.needX && <><dt>{t.understand}</dt><dd>{c.needX} {c.needY}</dd></>}
      {c.action && <><dt>{t.helps}</dt><dd>{c.action}</dd></>}
    </dl>
    <Basis ids={c.evidence} story={story} lang={lang} names={names}/>
  </article>;
}

export default function StoryReading({story, lang, names, relLabel}: {story: CosmicStory; lang: Lang; names: [string, string]; relationship: Rel; relLabel: string}) {
  const t = T[lang], C = story.couple;
  const chapters = [`${t.ch[0]} ${names[0]}`, `${t.ch[1]} ${names[1]}`, ...t.ch.slice(2)];
  const bridges = C.bridges as Record<string | number, string>;
  const sec = (n: number, body: React.ReactNode, open = true) => <details className="chapter" id={`ch-${n + 1}`} open={open}>
    <summary><span className="ch-num">{String(n + 1).padStart(2, '0')}</span><span className="ch-title">{chapters[n]}</span></summary>
    <div className="chapter-body">{bridges[n + 1] && <p className="bridge">{bridges[n + 1]}</p>}{body}</div>
  </details>;
  return <div className="story">
    <header className="story-cover card">
      <p className="kicker">{t.kicker} · {relLabel}</p>
      <h1>{C.title}</h1>
      <p className="cover-names">{names[0]} <span aria-hidden="true">✦</span> {names[1]}</p>
      <nav aria-label={t.chapters} className="chapter-nav">{chapters.map((c, i) => <a key={c} href={`#ch-${i + 1}`}>{String(i + 1).padStart(2, '0')} · {c}</a>)}</nav>
      {story.uncertainty.length > 0 && <p className="notice" role="note">{t.uncertain}</p>}
    </header>
    {sec(0, <Person idx={0} story={story} lang={lang} names={names}/>)}
    {sec(1, <Person idx={1} story={story} lang={lang} names={names}/>)}
    {sec(2, <div className="prose">{C.story.map((s, i) => <p key={i}>{s.text}</p>)}
      {C.complement.length > 0 && <aside className="complement"><h4>{t.complement}</h4>{C.complement.map(x => <p key={x}>{x}</p>)}</aside>}<Basis ids={C.story.flatMap(s => s.evidence).filter(id => /^(cross|A:placement|B:placement)/.test(id))} story={story} lang={lang} names={names}/>
      {C.overlays.length > 0 && <details className="basis"><summary>{lang === 'es' ? 'Cómo se activan sus casas' : 'How you activate each other\'s houses'}</summary>{C.overlays.map(o => <p key={o.id}>{o.text}</p>)}</details>}</div>)}
    {sec(3, <>{C.affinities.length ? <div className="card-grid">{C.affinities.map(c => <Card key={c.id} c={c} story={story} lang={lang} names={names}/>)}</div> : <p>{t.noAff}</p>}
      {(C.intense ?? []).length > 0 && <section className="intense-block"><h3>{t.intense}</h3>{C.bridges.intense && <p className="bridge">{C.bridges.intense}</p>}<div className="card-grid">{C.intense.map(c => <Card key={c.id} c={c} story={story} lang={lang} names={names}/>)}</div></section>}</>)}
    {sec(4, C.tensions.length ? <div className="card-grid">{C.tensions.map(c => <Card key={c.id} c={c} story={story} lang={lang} names={names}/>)}</div> : <p>{t.noTen}</p>)}
    {sec(5, <div className="area-grid">{C.daily.map(d => <article key={d.key} className={`area ${d.status} ${d.tone}`}><h4>{d.title}</h4><span className="badge">{t.status[d.status]}</span><p>{d.text}</p></article>)}</div>, false)}
    {sec(6, <div className="advice">
      <dl><dt>{t.comm}</dt><dd>{C.advice.communication}</dd><dt>{t.needs}</dt><dd>{C.advice.needs}</dd><dt>{t.diff}</dt><dd>{C.advice.differences}</dd><dt>{t.shared}</dt><dd>{C.advice.shared}</dd>{C.advice.space && <><dt>{t.space}</dt><dd>{C.advice.space}</dd></>}</dl>
      <h4>{t.questions}</h4><ul>{C.advice.questions.map(q => <li key={q}>{q}</li>)}</ul>
      <h4>{t.activities}</h4><ul>{C.advice.activities.map(q => <li key={q}>{q}</li>)}</ul>
    </div>, false)}
    {sec(7, <div className="closing"><p>{C.closing}</p><small className="fine">{t.disclaimer}</small></div>)}
  </div>;
}
