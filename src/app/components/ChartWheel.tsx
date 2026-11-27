'use client';
import {useMemo, useState} from 'react';
import {wheelModel, polar, formatPosition, SIGNS, BODY_GLYPHS} from '../../lib/chart-wheel.mjs';
import type {NatalChart} from '../../lib/match-preview.mjs';

const SIGNS_ES = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const BODY_ES: Record<string, string> = {Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón', NorthNode: 'Nodo Norte', Ascendant: 'Ascendente', Midheaven: 'Medio Cielo'};
const ASPECT_ES: Record<string, string> = {conjunction: 'conjunción', sextile: 'sextil', square: 'cuadratura', trine: 'trígono', opposition: 'oposición'};
const ELEMENT = ['fire', 'earth', 'air', 'water'];

type Props = {inner: NatalChart; outer?: NatalChart | null; es: boolean; title: string; innerLabel?: string; outerLabel?: string};
type Body = {key: string; lon: number; display: number; glyph: string; r: number; angle: number; trueAngle: number};

export default function ChartWheel({inner, outer = null, es, title, innerLabel, outerLabel}: Props) {
  const m = useMemo(() => wheelModel(inner, outer, {size: 520}), [inner, outer]);
  const [focus, setFocus] = useState<string | null>(null);
  const name = (k: string) => (es ? BODY_ES[k] : k.replace('NorthNode', 'North Node')) ?? k;
  const signNames = es ? SIGNS_ES : SIGNS;
  const {cx, cy, ring} = m;
  const P = (r: number, a: number) => polar(cx, cy, r, a);
  const line = (r1: number, r2: number, a: number) => {const [x1, y1] = P(r1, a), [x2, y2] = P(r2, a); return {x1, y1, x2, y2};};
  const arc = (r1: number, r2: number, a1: number, a2: number) => {
    const [x1, y1] = P(r1, a1), [x2, y2] = P(r1, a2), [x3, y3] = P(r2, a2), [x4, y4] = P(r2, a1);
    return `M${x1},${y1} A${r1},${r1} 0 0 0 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 0 1 ${x4},${y4} Z`;
  };
  const visibleAspects = m.aspects.filter(a => !focus || a.a === focus || a.b === focus || a.a + '·A' === focus || a.b + '·B' === focus).slice(0, outer ? 24 : 18);
  const renderBodies = (bodies: Body[], who: 'A' | 'B', color: string) => bodies.map(b => {
    const [gx, gy] = P(b.r, b.angle);
    const [tx, ty] = P(ring.zodiacInner, b.trueAngle);
    const [lx, ly] = P(b.r + 12, b.trueAngle);
    const id = outer ? `${b.key}·${who}` : b.key;
    const label = `${name(b.key)}${outer ? ` (${who === 'A' ? innerLabel : outerLabel})` : ''}: ${formatPosition(b.lon, signNames)}`;
    return <g key={id} className={`body ${focus === id ? 'active' : ''}`} tabIndex={0} role="img" aria-label={label}
      onMouseEnter={() => setFocus(id)} onMouseLeave={() => setFocus(null)} onFocus={() => setFocus(id)} onBlur={() => setFocus(null)}>
      <line x1={tx} y1={ty} x2={lx} y2={ly} className="tick" stroke={color}/>
      <circle cx={gx} cy={gy} r={13} className="body-bg"/>
      <text x={gx} y={gy} className={`glyph ${b.glyph.length > 1 ? 'small' : ''}`} fill={color}>{b.glyph}</text>
      <title>{label}</title>
    </g>;
  });
  const focusBody = [...m.bodiesInner.map(b => ({...b, who: 'A'})), ...m.bodiesOuter.map(b => ({...b, who: 'B'}))].find(b => (outer ? `${b.key}·${b.who}` : b.key) === focus);

  return <figure className="wheel">
    <figcaption>{title}</figcaption>
    <svg viewBox={`0 0 ${m.size} ${m.size}`} role="group" aria-label={title}>
      <defs><radialGradient id="wheelGlow"><stop offset="0%" stopColor="#2a1f52"/><stop offset="100%" stopColor="#0f0c26"/></radialGradient></defs>
      <circle cx={cx} cy={cy} r={ring.zodiacOuter} fill="url(#wheelGlow)" className="ring"/>
      {m.signs.map((s, i) => <g key={s.name}>
        <path d={arc(ring.zodiacOuter, ring.zodiacInner, s.startAngle, s.startAngle + 30)} className={`sign ${ELEMENT[i % 4]}`}><title>{signNames[i]}</title></path>
        <text {...(() => {const [x, y] = P((ring.zodiacOuter + ring.zodiacInner) / 2, s.mid); return {x, y};})()} className="sign-glyph">{s.glyph}</text>
      </g>)}
      <circle cx={cx} cy={cy} r={ring.zodiacInner} className="ring"/>
      {outer && <circle cx={cx} cy={cy} r={(ring.outerBodies + ring.innerBodies) / 2 + 4} className="ring faint"/>}
      <circle cx={cx} cy={cy} r={ring.aspect} className="ring faint"/>
      {m.houses?.cusps.map(c => {const isAxis = c.house === 1 || c.house === 4 || c.house === 7 || c.house === 10; const [hx, hy] = P(ring.aspect + 10, c.angle + (m.houses!.cusps[c.house % 12].angle - c.angle + 360) % 360 / 2);
        return <g key={c.house}><line {...line(ring.aspect, ring.zodiacInner, c.angle)} className={isAxis ? 'cusp axis' : 'cusp'}/><text x={hx} y={hy} className="house-num">{c.house}</text></g>;})}
      {visibleAspects.map((a, i) => {const [x1, y1] = P(ring.aspect, a.aAngle), [x2, y2] = P(ring.aspect, a.bAngle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={`aspect ${a.tone} ${a.aspect}`}><title>{`${name(a.a)} ${es ? ASPECT_ES[a.aspect] : a.aspect} ${name(a.b)} (${a.deviation}°)`}</title></line>;})}
      {m.axes && <>
        <text {...(() => {const [x, y] = P(ring.zodiacOuter + 0, m.axes!.asc); return {x: x + 2, y: y - 8};})()} className="axis-label" textAnchor="start">AC</text>
      </>}
      {renderBodies(m.bodiesInner as Body[], 'A', '#f4e7c3')}
      {outer && renderBodies(m.bodiesOuter as Body[], 'B', '#c9b6ff')}
      {focusBody && <g className="tooltip" pointerEvents="none"><rect x={cx - 120} y={cy - 22} width={240} height={44} rx={10}/><text x={cx} y={cy - 4}>{name(focusBody.key)}{outer ? ` · ${focusBody.who === 'A' ? innerLabel : outerLabel}` : ''}</text><text x={cx} y={cy + 14} className="muted">{formatPosition(focusBody.lon, signNames)}</text></g>}
    </svg>
    <div className="wheel-legend">
      {outer && <span><i className="dot a"/> {innerLabel} · <i className="dot b"/> {outerLabel}</span>}
      <span><i className="ln supportive"/> {es ? 'aspecto armónico' : 'harmonious aspect'} · <i className="ln challenging"/> {es ? 'aspecto tenso' : 'tense aspect'}</span>
      <span>{m.houses ? (es ? `Casas ${m.houses.system === 'placidus' ? 'Placidus' : 'de signo completo'}` : `${m.houses.system === 'placidus' ? 'Placidus' : 'Whole-sign'} houses`) : (es ? 'Sin hora exacta: sin casas ni Ascendente; rueda orientada a 0° Aries' : 'No exact time: no houses or Ascendant; wheel oriented to 0° Aries')}</span>
    </div>
    <details className="positions"><summary>{es ? 'Grados exactos' : 'Exact degrees'}</summary>
      <table><tbody>{[...m.bodiesInner.map(b => ({...b, who: innerLabel})), ...m.bodiesOuter.map(b => ({...b, who: outerLabel}))].map(b => <tr key={b.key + b.who}><th scope="row">{BODY_GLYPHS[b.key as keyof typeof BODY_GLYPHS]} {name(b.key)}{outer ? ` · ${b.who}` : ''}</th><td>{formatPosition(b.lon, signNames)}</td></tr>)}</tbody></table>
    </details>
  </figure>;
}
