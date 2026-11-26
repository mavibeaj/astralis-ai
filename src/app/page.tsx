'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import LocationPicker from './location-picker';
import ChartWheel from './components/ChartWheel';
import {matchPreview, type MatchResult} from '../lib/match-preview.mjs';
import {shareCardSvg} from '../lib/share-card.mjs';
import {interpretDimensions} from '../lib/interpretation.mjs';
import {buildPremiumPreview} from '../lib/premium-preview.mjs';
import {brand, catalog} from '../config/product';
import {validateBirth, type BirthInput} from '../lib/birth-input.mjs';

type Lang = 'en' | 'es';
type Relationship = 'partner' | 'crush' | 'friendship';
const RELS: Relationship[] = ['partner', 'crush', 'friendship'];
const DIMS = ['emotional', 'communication', 'attraction', 'stability', 'growth'] as const;
const copy = {
  es: {
    nav: 'Cosmic Match', heroKicker: 'Cosmic Match · Astrología con astronomía real', lead: 'Descubre la conexión simbólica entre dos cartas natales calculadas con la posición real de los planetas en el momento y lugar exactos de cada nacimiento.',
    start: 'Descubrir nuestra conexión', demo: 'Probar con datos ficticios', pillars: [['Astronomía real', 'Sol, Luna, planetas, Ascendente y casas calculados para la fecha, hora y lugar exactos.'], ['Cinco dimensiones', 'Conexión emocional, comunicación, atracción, estabilidad y crecimiento, con evidencia trazable.'], ['Privado por diseño', 'Tus datos natales se procesan en tu navegador. No creamos cuentas ni guardamos tus respuestas.']],
    howTitle: 'Cómo funciona', how: [['Elige el tipo de vínculo', 'Pareja, crush o amistad.'], ['Ingresa ambos nacimientos', 'Fecha, hora (si la conoces) y lugar, con buscador mundial.'], ['Explora la sinastría', 'Puntuación, dimensiones, ruedas natales y aspectos entre ambos.']],
    plansTitle: 'Explora gratis. Profundiza cuando quieras.', free: 'Lectura gratuita', freeItems: ['Índice simbólico y cinco dimensiones', 'Ruedas natales y de sinastría', 'Tarjetas para compartir'], premium: 'Informe premium', premiumItems: ['Lectura personalizada por dimensión', 'Fortalezas, desafíos y preguntas', 'Actividades para compartir y PDF'], soon: 'Pagos aún no habilitados · vista previa disponible',
    disclaimer: 'Experiencia simbólica de entretenimiento y reflexión. No es una predicción ni una evaluación científica de una relación.',
    steps: ['Vínculo', 'Tus datos', 'Sus datos', 'Confirmar'], relQ: '¿Qué conexión quieres explorar?', rel: {partner: 'Pareja', crush: 'Crush', friendship: 'Amistad'},
    nickA: 'Tu nombre o apodo (opcional)', nickB: 'Su nombre o apodo (opcional)', nickHint: 'Solo se muestra en esta página; no aparece en las tarjetas para compartir.',
    you: 'Tú', them: 'Esa persona', date: 'Fecha de nacimiento', time: 'Hora de nacimiento', unknown: 'No conozco la hora exacta', unknownHint: 'Sin hora exacta se omiten la Luna, el Ascendente, el Medio Cielo y las casas.',
    next: 'Continuar', back: 'Atrás', confirmTitle: 'Revisa los datos', consent: 'Ambas personas son adultas y tengo permiso para usar estos datos.', calc: 'Calcular nuestra conexión', edit: 'Editar',
    errors: {date: 'Ingresa una fecha válida desde 1900.', time: 'Ingresa la hora o marca que no la conoces.', place: 'Selecciona un lugar o ingrésalo manualmente.', zone: 'Falta la zona horaria (Configuración avanzada).', consent: 'Confirma que tienes permiso para usar estos datos.'},
    calculating: 'Calculando posiciones planetarias…', calcSteps: ['Convirtiendo la hora local a UTC', 'Calculando planetas y ángulos', 'Comparando ambas cartas'],
    scoreTitle: 'Índice simbólico experimental', partialTitle: 'Lectura parcial', dims: {emotional: 'Emocional', communication: 'Comunicación', attraction: 'Atracción', stability: 'Estabilidad', growth: 'Crecimiento'},
    themes: 'Temas para explorar', strength: 'Fortaleza simbólica', challenge: 'Desafío simbólico', tabs: ['Sinastría', 'Carta A', 'Carta B'], details: 'Detalles astronómicos y limitaciones',
    premiumCta: 'Ver demostración gratuita', premiumHide: 'Ocultar demostración', purchase: 'Compra no habilitada todavía.', share: 'Descargar tarjeta', again: 'Nueva lectura', shareError: 'No se pudo exportar la imagen.',
    cannot: 'No se puede calcular con estos datos: verifica la zona horaria y la hora exacta.', partialNote: 'Una o ambas horas son desconocidas: se muestran rangos estimados y una carta al mediodía sin Luna, casas ni Ascendente.',
    pre1970: 'Nacimiento anterior a 1970: los husos horarios históricos pueden variar en algunas regiones; verifica la hora local.',
  },
  en: {
    nav: 'Cosmic Match', heroKicker: 'Cosmic Match · Astrology with real astronomy', lead: 'Discover the symbolic connection between two birth charts calculated from the real planetary positions at each exact time and place of birth.',
    start: 'Discover our connection', demo: 'Try with fictional data', pillars: [['Real astronomy', 'Sun, Moon, planets, Ascendant and houses calculated for the exact date, time and place.'], ['Five dimensions', 'Emotional connection, communication, attraction, stability and growth, with traceable evidence.'], ['Private by design', 'Birth details are processed in your browser. No accounts, nothing stored.']],
    howTitle: 'How it works', how: [['Choose the connection', 'Partner, crush or friendship.'], ['Enter both births', 'Date, time (if known) and place, with worldwide search.'], ['Explore the synastry', 'Score, dimensions, natal wheels and cross aspects.']],
    plansTitle: 'Explore for free. Go deeper when you want.', free: 'Free reading', freeItems: ['Symbolic index and five dimensions', 'Natal and synastry wheels', 'Shareable cards'], premium: 'Premium report', premiumItems: ['Personalised reading per dimension', 'Strengths, challenges and questions', 'Shared activities and PDF'], soon: 'Payments not enabled yet · preview available',
    disclaimer: 'A symbolic experience for entertainment and reflection. Not a prediction or scientific assessment of a relationship.',
    steps: ['Connection', 'Your details', 'Their details', 'Confirm'], relQ: 'Which connection do you want to explore?', rel: {partner: 'Partner', crush: 'Crush', friendship: 'Friendship'},
    nickA: 'Your name or nickname (optional)', nickB: 'Their name or nickname (optional)', nickHint: 'Shown on this page only; never on share cards.',
    you: 'You', them: 'Them', date: 'Birth date', time: 'Birth time', unknown: 'I do not know the exact time', unknownHint: 'Without an exact time, the Moon, Ascendant, Midheaven and houses are omitted.',
    next: 'Continue', back: 'Back', confirmTitle: 'Review the details', consent: 'Both people are adults and I have permission to use these details.', calc: 'Calculate our connection', edit: 'Edit',
    errors: {date: 'Enter a valid date from 1900.', time: 'Enter the time or tick that it is unknown.', place: 'Select a place or enter it manually.', zone: 'Time zone missing (Advanced settings).', consent: 'Confirm you have permission to use these details.'},
    calculating: 'Calculating planetary positions…', calcSteps: ['Converting local time to UTC', 'Calculating planets and angles', 'Comparing both charts'],
    scoreTitle: 'Experimental symbolic index', partialTitle: 'Partial reading', dims: {emotional: 'Emotional', communication: 'Communication', attraction: 'Attraction', stability: 'Stability', growth: 'Growth'},
    themes: 'Themes to explore', strength: 'Symbolic strength', challenge: 'Symbolic challenge', tabs: ['Synastry', 'Chart A', 'Chart B'], details: 'Astronomical details and limitations',
    premiumCta: 'View free demo', premiumHide: 'Hide demo', purchase: 'Purchases are not enabled yet.', share: 'Download card', again: 'New reading', shareError: 'Image export failed.',
    cannot: 'Cannot calculate: check the time zone and exact time.', partialNote: 'One or both times are unknown: estimated ranges are shown, with a noon chart without Moon, houses or Ascendant.',
    pre1970: 'Birth before 1970: historical time-zone offsets can vary for some regions; verify the local time.',
  },
} as const;
type T = (typeof copy)[Lang];
const empty = (): BirthInput => ({date: '', time: '', unknownTime: false, place: '', zone: ''});
const zones = ['UTC', ...(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [])];
// Fictional people; places use GeoNames coordinates (London 2643743, New York City 5128581).
const DEMO_A: BirthInput = {date: '1993-04-15', time: '12:00', unknownTime: false, place: 'London, England, United Kingdom', zone: 'Europe/London', latitude: 51.50853, longitude: -0.12574, country: 'GB', geonameId: '2643743'};
const DEMO_B: BirthInput = {date: '1995-09-22', time: '15:30', unknownTime: false, place: 'New York City, New York, United States', zone: 'America/New_York', latitude: 40.71427, longitude: -74.00597, country: 'US', geonameId: '5128581'};

async function downloadCard(index: number, lang: Lang, format: 'story' | 'portrait') {
  const url = URL.createObjectURL(new Blob([shareCardSvg(index, lang, format)], {type: 'image/svg+xml'}));
  try {
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = format === 'story' ? 1920 : 1350;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(image, 0, 0);
    const png = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('PNG unavailable')), 'image/png'));
    const link = document.createElement('a'); const dl = URL.createObjectURL(png); link.href = dl; link.download = 'astralis-connection-' + format + '.png'; link.click(); setTimeout(() => URL.revokeObjectURL(dl), 1000);
  } finally {URL.revokeObjectURL(url);}
}

function Sky() {
  return <svg className="sky" viewBox="0 0 400 400" aria-hidden="true">
    <defs><radialGradient id="halo"><stop offset="0%" stopColor="#f3d9a4" stopOpacity=".55"/><stop offset="60%" stopColor="#7b5cd6" stopOpacity=".12"/><stop offset="100%" stopColor="#7b5cd6" stopOpacity="0"/></radialGradient></defs>
    <circle cx="200" cy="200" r="190" fill="url(#halo)"/>
    <g className="orbit-ring"><circle cx="200" cy="200" r="150"/><circle cx="350" cy="200" r="7" className="planet gold"/></g>
    <g className="orbit-ring slow"><circle cx="200" cy="200" r="105"/><circle cx="200" cy="95" r="5" className="planet lilac"/></g>
    <g className="orbit-ring fast"><circle cx="200" cy="200" r="62"/><circle cx="138" cy="200" r="4" className="planet white"/></g>
    <circle cx="200" cy="200" r="22" className="sun"/>
    {[[60, 70], [330, 60], [40, 300], [360, 330], [300, 120], [90, 180], [250, 350]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.4 : 2.2} className="star" style={{animationDelay: `${i * 0.6}s`}}/>)}
  </svg>;
}

function ScoreRing({value, label}: {value: number | null; label: string}) {
  const r = 70, c = 2 * Math.PI * r, v = value ?? 0;
  return <div className="score" role="img" aria-label={`${label}: ${value ?? '—'}/100`}>
    <svg viewBox="0 0 180 180"><defs><linearGradient id="scoreGrad" x1="0" x2="1"><stop offset="0%" stopColor="#b89cff"/><stop offset="100%" stopColor="#f3d9a4"/></linearGradient></defs>
      <circle cx="90" cy="90" r={r} className="track"/><circle cx="90" cy="90" r={r} className="value" stroke="url(#scoreGrad)" strokeDasharray={`${c * v / 100} ${c}`} transform="rotate(-90 90 90)"/></svg>
    <div><strong>{value ?? '—'}</strong><small>/100</small></div>
  </div>;
}

function DimensionChart({dims, t, ranges}: {dims: Record<string, {score: number | null}> | null; t: T; ranges?: Record<string, [number, number] | null>}) {
  return <div className="dim-chart">{DIMS.map(k => {
    const score = dims?.[k]?.score ?? null, range = ranges?.[k] ?? null;
    return <div className="dim-row" key={k}>
      <span className="dim-label">{t.dims[k]}</span>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="100" height="6" rx="3" className="bar-bg"/>
        {range ? <rect x={range[0]} y="2" width={Math.max(2, range[1] - range[0])} height="6" rx="3" className="bar"/> : score !== null && <rect x="0" y="2" width={score} height="6" rx="3" className="bar"/>}</svg>
      <span className="dim-value">{range ? `${range[0]}–${range[1]}` : score ?? '—'}</span>
    </div>;
  })}</div>;
}

function BirthStep({who, value, onChange, t, es, id, version}: {who: string; value: BirthInput; onChange: (v: BirthInput) => void; t: T; es: boolean; id: string; version: number}) {
  return <fieldset className="card step-card"><legend>{who}</legend>
    <div className="grid2">
      <label>{t.date}<input type="date" min="1900-01-01" value={value.date} onChange={e => onChange({...value, date: e.target.value})}/></label>
      <label>{t.time}<input type="time" disabled={value.unknownTime} value={value.time} onChange={e => onChange({...value, time: e.target.value})}/></label>
    </div>
    <label className="check"><input type="checkbox" checked={value.unknownTime} onChange={e => onChange({...value, unknownTime: e.target.checked, time: e.target.checked ? '' : value.time})}/>{t.unknown}</label>
    {value.unknownTime && <small className="hint">{t.unknownHint}</small>}
    <LocationPicker key={version} idPrefix={id} es={es} place={value.place} zone={value.zone} latitude={value.latitude} longitude={value.longitude} country={value.country} geonameId={value.geonameId} onChange={sel => onChange({...value, ...sel})}/>
  </fieldset>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>('es');
  const [view, setView] = useState<'landing' | 'form' | 'calculating' | 'result'>('landing');
  const [step, setStep] = useState(0);
  const [rel, setRel] = useState<Relationship>('partner');
  const [nick, setNick] = useState<[string, string]>(['', '']);
  const [a, setA] = useState<BirthInput>(empty);
  const [b, setB] = useState<BirthInput>(empty);
  const [version, setVersion] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [tab, setTab] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  const [shareError, setShareError] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const t = copy[lang], es = lang === 'es';

  useEffect(() => {
    let initial: Lang = navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
    try {const saved = localStorage.getItem('astralis-lang'); if (saved === 'es' || saved === 'en') initial = saved;} catch {}
    setLang(initial);
  }, []);
  useEffect(() => {document.documentElement.lang = lang; try {localStorage.setItem('astralis-lang', lang);} catch {}}, [lang]);
  const scrollTop = () => top.current?.scrollIntoView({behavior: 'smooth', block: 'start'});

  const names: [string, string] = [nick[0].trim() || t.you, nick[1].trim() || t.them];
  function stepError(v: BirthInput): string | null {
    const e = validateBirth(v, new Date().toISOString().slice(0, 10));
    if (e) return t.errors[e];
    if (!v.zone.trim()) return t.errors.zone;
    return null;
  }
  function next() {
    const e = step === 1 ? stepError(a) : step === 2 ? stepError(b) : null;
    setError(e);
    if (!e) {setStep(s => s + 1); scrollTop();}
  }
  function startNew(demo = false) {
    setVersion(v => v + 1); setResult(null); setShowPremium(false); setShareError(false); setError(null); setTab(0);
    if (demo) {setA(DEMO_A); setB(DEMO_B); setNick(['Ana', 'Leo']); setConsent(true); setStep(3);} else {setA(empty()); setB(empty()); setNick(['', '']); setConsent(false); setStep(0);}
    setView('form'); setTimeout(scrollTop, 0);
  }
  function calculate() {
    if (!consent) {setError(t.errors.consent); return;}
    const e = stepError(a) ?? stepError(b);
    if (e) {setError(e); return;}
    setError(null); setView('calculating'); scrollTop();
    const candidate = new URLSearchParams(window.location.search).get('scoring') === '0.2';
    setTimeout(() => {setResult(matchPreview(a, b, new Date().toISOString().slice(0, 10), {candidate})); setView('result'); scrollTop();}, 1400);
  }

  const exact = result?.status === 'ok' ? result.result : null;
  const reflection = exact ? interpretDimensions(exact.dimensions, lang) : null;
  const premium = useMemo(() => {if (!showPremium || !result) return null; try {return buildPremiumPreview(result, lang, rel);} catch {return null;}}, [showPremium, result, lang, rel]);
  const charts = result && (result.status === 'ok' || result.status === 'partial') ? result.charts : null;
  const price = ((catalog.find(x => x.id === 'match-premium')?.priceCents ?? 999) / 100).toFixed(2);

  return <div className="app" ref={top}>
    <datalist id="astralis-timezones">{zones.map(z => <option key={z} value={z}/>)}</datalist>
    <header className="topbar">
      <button type="button" className="brand" onClick={() => setView('landing')} aria-label={brand.name}><span className="brand-mark" aria-hidden="true">✦</span>{brand.name}</button>
      <div className="lang" role="group" aria-label="Language"><button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button><button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button></div>
    </header>

    {view === 'landing' && <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">{t.heroKicker}</p>
          <h1>{brand.tagline[lang]}</h1>
          <p className="lead">{t.lead}</p>
          <div className="cta-row"><button type="button" className="primary" onClick={() => startNew()}>{t.start}</button><button type="button" className="ghost" onClick={() => startNew(true)}>{t.demo}</button></div>
          <small className="fine">{t.disclaimer}</small>
        </div>
        <Sky/>
      </section>
      <section className="pillars">{t.pillars.map(([h, p], i) => <article key={h} className="card"><span className="pillar-icon" aria-hidden="true">{['☉', '✧', '☾'][i]}</span><h2>{h}</h2><p>{p}</p></article>)}</section>
      <section className="how"><h2>{t.howTitle}</h2><ol>{t.how.map(([h, p]) => <li key={h}><strong>{h}</strong><span>{p}</span></li>)}</ol></section>
      <section className="plans"><h2>{t.plansTitle}</h2><div className="plan-grid">
        <article className="card plan"><h3>{t.free}</h3><p className="price">USD 0</p><ul>{t.freeItems.map(x => <li key={x}>{x}</li>)}</ul><button type="button" className="primary" onClick={() => startNew()}>{t.start}</button></article>
        <article className="card plan featured"><h3>{t.premium}</h3><p className="price">USD {price}</p><ul>{t.premiumItems.map(x => <li key={x}>{x}</li>)}</ul><small>{t.soon}</small></article>
      </div></section>
    </main>}

    {view === 'form' && <main className="flow">
      <ol className="stepper" aria-label="Progress">{t.steps.map((s, i) => <li key={s} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : i === step ? 'current' : ''}><span>{i + 1}</span>{s}</li>)}</ol>
      {step === 0 && <section className="card step-card">
        <h2>{t.relQ}</h2>
        <div className="seg" role="radiogroup">{RELS.map(r => <button key={r} type="button" role="radio" aria-checked={rel === r} aria-pressed={rel === r} onClick={() => setRel(r)}>{t.rel[r]}</button>)}</div>
        <div className="grid2"><label>{t.nickA}<input maxLength={30} value={nick[0]} onChange={e => setNick([e.target.value, nick[1]])}/></label><label>{t.nickB}<input maxLength={30} value={nick[1]} onChange={e => setNick([nick[0], e.target.value])}/></label></div>
        <small className="hint">{t.nickHint}</small>
      </section>}
      {step === 1 && <BirthStep who={names[0]} value={a} onChange={v => {setA(v); setError(null);}} t={t} es={es} id="a" version={version}/>}
      {step === 2 && <BirthStep who={names[1]} value={b} onChange={v => {setB(v); setError(null);}} t={t} es={es} id="b" version={version}/>}
      {step === 3 && <section className="card step-card">
        <h2>{t.confirmTitle}</h2>
        <p className="pill">{t.rel[rel]}</p>
        <div className="grid2 summary">{[a, b].map((p, i) => <article key={i}><h3>{names[i]}</h3><dl>
          <dt>{t.date}</dt><dd>{p.date || '—'}</dd><dt>{t.time}</dt><dd>{p.unknownTime ? t.unknown : p.time || '—'}</dd>
          <dt>{es ? 'Lugar' : 'Place'}</dt><dd>{p.place || '—'}</dd><dt>{es ? 'Zona horaria' : 'Time zone'}</dt><dd>{p.zone || '—'}</dd>
        </dl><button type="button" className="link" onClick={() => setStep(i + 1)}>{t.edit}</button></article>)}</div>
        {(a.date < '1970-01-01' && a.date) || (b.date < '1970-01-01' && b.date) ? <p className="notice" role="note">{t.pre1970}</p> : null}
        <label className="check"><input type="checkbox" checked={consent} onChange={e => {setConsent(e.target.checked); setError(null);}}/>{t.consent}</label>
      </section>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="nav-row">
        {step > 0 && <button type="button" className="ghost" onClick={() => {setStep(s => s - 1); setError(null);}}>{t.back}</button>}
        {step < 3 ? <button type="button" className="primary" onClick={next}>{t.next}</button> : <button type="button" className="primary" onClick={calculate}>{t.calc}</button>}
      </div>
    </main>}

    {view === 'calculating' && <main className="calculating" aria-live="polite"><Sky/><h2>{t.calculating}</h2><ul>{t.calcSteps.map((s, i) => <li key={s} style={{animationDelay: `${i * 0.4}s`}}>{s}</li>)}</ul></main>}

    {view === 'result' && result && <main className="results">
      {(result.status === 'ok' || result.status === 'partial') ? <>
        <section className="card result-hero">
          <p className="pill">{t.rel[rel]} · {names[0]} &amp; {names[1]}</p>
          {result.status === 'ok' ? <><ScoreRing value={exact!.index} label={t.scoreTitle}/><h2>{t.scoreTitle}</h2></>
            : <><ScoreRing value={result.indexRange ? Math.round((result.indexRange[0] + result.indexRange[1]) / 2) : null} label={t.partialTitle}/><h2>{t.partialTitle}: {result.indexRange?.join('–') ?? '—'}/100</h2><p className="notice">{t.partialNote}</p></>}
          <DimensionChart t={t} dims={exact ? exact.dimensions : null} ranges={result.status === 'partial' ? result.dimensions : undefined}/>
          <small className="fine">{t.disclaimer}</small>
        </section>
        {reflection && <section className="card"><h2>{t.themes}</h2>
          {reflection.strength && <p><strong>{t.strength}: {reflection.strength.label}.</strong> {reflection.strength.question}</p>}
          {reflection.challenge && <p><strong>{t.challenge}: {reflection.challenge.label}.</strong> {reflection.challenge.question}</p>}
          {reflection.questions.length > 0 && <ul>{reflection.questions.map(q => <li key={q}>{q}</li>)}</ul>}
          <small className="fine">{reflection.disclaimer}</small></section>}
        {charts && <section className="card wheels">
          <div className="tabs" role="tablist">{t.tabs.map((x, i) => <button key={x} type="button" role="tab" aria-selected={tab === i} aria-pressed={tab === i} onClick={() => setTab(i)}>{i === 0 ? x : i === 1 ? `${x} · ${names[0]}` : `${x} · ${names[1]}`}</button>)}</div>
          {tab === 0 && <ChartWheel es={es} title={`${t.tabs[0]}: ${names[0]} & ${names[1]}`} inner={charts[0]} outer={charts[1]} innerLabel={names[0]} outerLabel={names[1]}/>}
          {tab === 1 && <ChartWheel es={es} title={`${t.tabs[1]} · ${names[0]}`} inner={charts[0]}/>}
          {tab === 2 && <ChartWheel es={es} title={`${t.tabs[2]} · ${names[1]}`} inner={charts[1]}/>}
        </section>}
        {result.candidate && <section className="card candidate" aria-label="symbolic-0.2"><h2>{es ? 'Metodología experimental' : 'Experimental methodology'} · {result.candidate.version}: {result.candidate.index ?? '—'}/100</h2>
          <small className="fine">{es ? 'Solo para revisión interna. El índice oficial sigue siendo symbolic-0.1.' : 'Internal review only. The official index remains symbolic-0.1.'}</small>
          <DimensionChart t={t} dims={result.candidate.dimensions}/>
          {DIMS.map(k => {const d = result.candidate!.dimensions[k]; return <details key={k}><summary>{t.dims[k]}: +{d.supportive} / {d.challenging} · {es ? 'cobertura' : 'coverage'} {Math.round(d.coverage * 100)}%</summary><ul>{d.evidence.slice(0, 8).map((e, i) => <li key={i}>{e.kind === 'aspect' ? `${String(e.personA)} (A) ${String(e.aspect)} ${String(e.personB)} (B) · ${String(e.deviation)}°/${String(e.orb)}°` : `${String(e.body)} ${e.direction === 'aInB' ? 'A→B' : 'B→A'} ${es ? 'casa' : 'house'} ${String(e.house)}`} · {e.contribution > 0 ? '+' : ''}{e.contribution}</li>)}</ul></details>;})}
        </section>}
        <section className="card premium-panel">
          <div><h2>Cosmic Match Premium</h2><p>{es ? 'Explora las cinco dimensiones en profundidad con un informe personalizado.' : 'Explore all five dimensions in depth with a personalised report.'}</p></div>
          <p className="price">USD {price}</p><small>{t.purchase}</small>
          <button type="button" className="primary" aria-expanded={showPremium} onClick={() => setShowPremium(v => !v)}>{showPremium ? t.premiumHide : t.premiumCta}</button>
          {showPremium && (premium ? <div className="premium-demo"><p>{premium.summary}</p>{premium.themes.map(th => <article key={th.key}><h3>{th.label} · {th.score}/100</h3><p>{th.reflection}</p><p className="activity">{th.activity}</p></article>)}<small className="fine">{premium.limitations}</small></div> : <p>{es ? 'La demostración requiere una lectura completa (horas conocidas).' : 'The demo requires a complete reading (known times).'}</p>)}
        </section>
        {exact?.index != null && <section className="card share"><h2>{es ? 'Comparte tu resultado' : 'Share your result'}</h2><p className="fine">{es ? 'Las tarjetas muestran solo el índice: sin nombres, fechas ni lugares.' : 'Cards show only the index: no names, dates or places.'}</p>
          <div className="cta-row">{(['story', 'portrait'] as const).map(f => <button key={f} type="button" className="ghost" onClick={() => {setShareError(false); void downloadCard(exact.index!, lang, f).catch(() => setShareError(true));}}>{t.share} · {f === 'story' ? '9:16' : '4:5'}</button>)}</div>
          {shareError && <p role="alert" className="error">{t.shareError}</p>}</section>}
        <details className="card tech"><summary>{t.details}</summary><ul>{result.limitations.map(l => <li key={l}>{l}</li>)}</ul>{charts?.map((c, i) => <p key={i} className="fine">{names[i]} · UTC {c.utc}</p>)}</details>
      </> : <section className="card"><p role="status" className="error">{t.cannot} ({result.status})</p></section>}
      <div className="nav-row"><button type="button" className="ghost" onClick={() => {setView('form'); setStep(3);}}>{t.edit}</button><button type="button" className="primary" onClick={() => startNew()}>{t.again}</button></div>
    </main>}

    <footer className="footer"><p>{t.disclaimer}</p><small>{brand.name} · {t.nav} · {es ? 'Datos geográficos' : 'Geographic data'}: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> (CC BY 4.0) · {es ? 'Efemérides' : 'Ephemeris'}: Astronomy Engine (MIT)</small></footer>
  </div>;
}
