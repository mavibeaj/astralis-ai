'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {cachedLoader, parseManifest, searchPlaces, type CatalogCountry, type PlaceResult} from '../lib/geo-search.mjs';

export type PlaceSelection = {place: string; zone: string; latitude?: number; longitude?: number; country?: string; geonameId?: string};
type Props = PlaceSelection & {es: boolean; idPrefix: string; onChange: (v: PlaceSelection) => void};
type CatalogState = 'loading' | 'ready' | 'unavailable';
type SearchState = 'idle' | 'short' | 'loading' | 'ready' | 'empty' | 'more' | 'error';

const load = cachedLoader();
let manifestPromise: Promise<CatalogCountry[]> | null = null;
function loadManifest() {
  manifestPromise ??= load('/geography/countries.json').then(parseManifest).catch(e => {manifestPromise = null; throw e;});
  return manifestPromise;
}
const regionName = (code: string, fallback: string, es: boolean) => {
  try {return new Intl.DisplayNames([es ? 'es' : 'en'], {type: 'region'}).of(code) || fallback;} catch {return fallback;}
};

export default function LocationPicker({es, idPrefix, place, zone, latitude, longitude, country: selectedCountry, geonameId, onChange}: Props) {
  const [catalog, setCatalog] = useState<CatalogState>('loading');
  const [countries, setCountries] = useState<CatalogCountry[]>([]);
  const [country, setCountry] = useState(selectedCountry ?? '');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<PlaceResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [manual, setManual] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const advanced = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let live = true;
    setCatalog('loading');
    loadManifest().then(list => {if (live) {setCountries(list); setCatalog('ready');}}).catch(() => {if (live) {setCatalog('unavailable'); setManual(true);}});
    return () => {live = false;};
  }, [attempt]);
  useEffect(() => {setCountry(selectedCountry ?? '');}, [selectedCountry]);

  const sorted = useMemo(() => countries.map(c => ({...c, label: regionName(c.code, c.name, es)})).sort((a, b) => a.label.localeCompare(b.label, es ? 'es' : 'en')), [countries, es]);
  const current = countries.find(c => c.code === country);

  useEffect(() => {
    setRows([]);
    if (manual || !current) {setState('idle'); return;}
    if (Array.from(query.trim()).length < 2) {setState(query.trim() ? 'short' : 'idle'); return;}
    let live = true;
    setState('loading');
    const timer = setTimeout(() => {
      searchPlaces(current, query, load).then(r => {if (live) {setRows(r.rows); setState(r.status);}}).catch(() => {if (live) setState('error');});
    }, 200);
    return () => {live = false; clearTimeout(timer);};
  }, [current, query, manual]);

  const countryLabel = current ? regionName(current.code, current.name, es) : '';
  function choose(p: PlaceResult) {
    const label = [p.name, p.district, p.region, countryLabel].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(', ');
    onChange({place: label, zone: p.zone, latitude: p.latitude, longitude: p.longitude, country: p.country, geonameId: p.id});
    setQuery(''); setRows([]); setState('idle');
  }
  const set = (patch: Partial<PlaceSelection>) => onChange({place, zone, latitude, longitude, country, geonameId, ...patch});
  const fromCatalog = !!geonameId && !manual;
  const id = (s: string) => `${idPrefix}-${s}`;

  return <div className="location-picker">
    {catalog === 'loading' && <small role="status">{es ? 'Cargando catálogo de lugares…' : 'Loading place catalog…'}</small>}
    {catalog === 'unavailable' && <div role="alert" className="notice">
      <p>{es ? 'El catálogo de lugares no está disponible en este momento. Puedes ingresar el lugar, la zona horaria y las coordenadas manualmente.' : 'The place catalog is unavailable right now. You can enter the place, time zone and coordinates manually.'}</p>
      <button type="button" onClick={() => setAttempt(a => a + 1)}>{es ? 'Reintentar' : 'Retry'}</button>
    </div>}
    {catalog === 'ready' && <label htmlFor={id('country')}>{es ? 'País de nacimiento' : 'Birth country'}
      <select id={id('country')} value={country} onChange={e => {setCountry(e.target.value); setQuery(''); onChange({place: '', zone: '', country: e.target.value});}}>
        <option value="">{es ? 'Selecciona un país' : 'Select a country'}</option>
        {sorted.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select></label>}
    {catalog === 'ready' && !manual && <>
      <label htmlFor={id('query')}>{es ? 'Ciudad, distrito o pueblo' : 'City, district or village'}
        <input id={id('query')} value={query} disabled={!country} autoComplete="off" placeholder={country ? (es ? 'Escribe al menos 2 letras' : 'Type at least 2 letters') : (es ? 'Primero elige un país' : 'Choose a country first')} onChange={e => setQuery(e.target.value)} aria-describedby={id('search-status')}/></label>
      <small id={id('search-status')} role="status">{({
        idle: '', short: es ? 'Escribe al menos 2 letras.' : 'Type at least 2 letters.', loading: es ? 'Buscando…' : 'Searching…',
        ready: es ? `${rows.length} coincidencias` : `${rows.length} matches`, more: es ? 'Sigue escribiendo para ver resultados.' : 'Keep typing to see results.',
        empty: es ? 'No encontramos ese lugar. Revisa la escritura o ingrésalo manualmente.' : 'No place found. Check the spelling or enter it manually.',
        error: es ? 'No se pudo consultar el catálogo. Inténtalo de nuevo o ingrésalo manualmente.' : 'The catalog could not be reached. Try again or enter it manually.',
      } as Record<SearchState, string>)[state]}</small>
      {rows.length > 0 && <ul className="location-results" aria-label={es ? 'Coincidencias' : 'Matches'}>{rows.map(p => <li key={p.id}><button type="button" onClick={() => choose(p)}>
        <strong>{p.name}</strong><small>{[p.district, p.region, countryLabel].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · ')}</small></button></li>)}</ul>}
    </>}
    {fromCatalog && place && <p className="place-confirmed" aria-live="polite">✓ {place} <small>({zone})</small></p>}
    {catalog === 'ready' && <button type="button" className="link" onClick={() => {setManual(v => !v); if (!manual && advanced.current) advanced.current.open = true;}}>
      {manual ? (es ? 'Buscar en el catálogo' : 'Search the catalog') : (es ? '¿No aparece? Ingresar manualmente' : 'Not listed? Enter manually')}</button>}
    {manual && <label htmlFor={id('place')}>{es ? 'Lugar de nacimiento' : 'Birthplace'}
      <input id={id('place')} required maxLength={150} value={place} onChange={e => set({place: e.target.value, geonameId: undefined})}/></label>}
    <details ref={advanced} open={manual || undefined} className="advanced">
      <summary>{es ? 'Configuración avanzada (zona horaria y coordenadas)' : 'Advanced settings (time zone and coordinates)'}</summary>
      <label htmlFor={id('zone')}>{es ? 'Zona horaria de nacimiento' : 'Birth time zone'}
        <input id={id('zone')} required list="astralis-timezones" value={zone} onChange={e => set({zone: e.target.value, geonameId: undefined})} placeholder="America/Lima"/></label>
      <div className="profiles">
        <label htmlFor={id('lat')}>{es ? 'Latitud' : 'Latitude'}<input id={id('lat')} type="number" min="-90" max="90" step="any" value={latitude ?? ''} onChange={e => set({latitude: e.target.value === '' ? undefined : Number(e.target.value), geonameId: undefined})}/></label>
        <label htmlFor={id('lon')}>{es ? 'Longitud' : 'Longitude'}<input id={id('lon')} type="number" min="-180" max="180" step="any" value={longitude ?? ''} onChange={e => set({longitude: e.target.value === '' ? undefined : Number(e.target.value), geonameId: undefined})}/></label>
      </div>
      <small>{es ? 'Sin coordenadas no se calculan Ascendente, Medio Cielo ni casas.' : 'Without coordinates, Ascendant, Midheaven and houses are not calculated.'}</small>
    </details>
    <small>{es ? 'Datos geográficos: ' : 'Geographic data: '}<a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> (CC BY 4.0). {es ? 'Las solicitudes del catálogo pueden quedar en registros del alojamiento.' : 'Catalog requests may be logged by hosting.'}</small>
  </div>;
}
