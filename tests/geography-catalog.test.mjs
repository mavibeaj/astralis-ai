// Validates a generated catalog in public/geography (full GeoNames build or offline fixture).
// Skips when no catalog has been generated. Expected values are taken from GeoNames itself
// (geonameid + IANA zone); coordinates are only checked against coarse bounding boxes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = 'public/geography';
const has = existsSync(join(ROOT, 'countries.json'));
const normalize = s => s.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').replace(/ς/g, 'σ');
function bucket(s) {let h = 0; for (const b of new TextEncoder().encode(Array.from(normalize(s)).slice(0, 2).join(''))) h = (h * 31 + b) % 64; return String(h);}
function search(cc, query) {
  const q = normalize(query);
  const path = join(ROOT, cc, bucket(q) + '.json');
  if (!existsSync(path)) return [];
  const map = new Map();
  for (const [p, aliases] of JSON.parse(readFileSync(path, 'utf8'))) if (aliases.some(a => a.startsWith(q))) map.set(p[0], p);
  return [...map.values()];
}
const countries = has ? new Set(JSON.parse(readFileSync(join(ROOT, 'countries.json'), 'utf8')).map(c => c[0])) : new Set();

// [country, query, geonameid, IANA zone, latMin, latMax, lonMin, lonMax]
const CASES = [
  ['PE', 'Lima', '3936456', 'America/Lima', -12.5, -11.5, -77.5, -76.5],
  ['PE', 'Chiclayo', '3698350', 'America/Lima', -7.2, -6.4, -80.2, -79.5],
  ['PE', 'Arequipa', '3947322', 'America/Lima', -16.8, -16, -72, -71.2],
  ['PE', 'Cuzco', '3941584', 'America/Lima', -14, -13, -72.5, -71.5],
  ['PE', 'Trujillo', '3691175', 'America/Lima', -8.5, -7.8, -79.4, -78.7],
  ['PE', 'Ferreñafe', '3697033', 'America/Lima', -7, -6.3, -80.2, -79.4],
  ['JP', 'Tokyo', '1850147', 'Asia/Tokyo', 35, 36.5, 139, 140.5],
  ['KE', 'Nairobi', '184745', 'Africa/Nairobi', -1.6, -1, 36.5, 37.2],
  ['IS', 'Reykjavik', '3413829', 'Atlantic/Reykjavik', 63.8, 64.4, -22.3, -21.4],
  ['AU', 'Alice Springs', '2077895', 'Australia/Darwin', -24.2, -23.2, 133.4, 134.4],
  ['BR', 'São Paulo', '3448439', 'America/Sao_Paulo', -24, -23, -47.2, -46],
  ['US', 'Anchorage', '5879400', 'America/Anchorage', 60.8, 61.6, -150.5, -149.3],
  ['ES', 'Cádiz', '2520600', 'Europe/Madrid', 36.2, 36.8, -6.6, -6],
];

for (const [cc, q, id, zone, la0, la1, lo0, lo1] of CASES) {
  test(`geography: ${cc} ${q}`, {skip: !has || !countries.has(cc) ? 'catalog not generated for ' + cc : false}, () => {
    const hit = search(cc, q).find(p => p[0] === id);
    assert.ok(hit, `${q} (${id}) not found`);
    assert.equal(hit[4], zone);
    assert.ok(hit[6] >= la0 && hit[6] <= la1 && hit[7] >= lo0 && hit[7] <= lo1, `coordinates out of range: ${hit[6]},${hit[7]}`);
  });
}

test('geography: accent-insensitive and alternate-name search', {skip: !has || !countries.has('PE')}, () => {
  assert.ok(search('PE', 'ferrenafe').some(p => p[0] === '3697033'));
  assert.ok(search('PE', 'Cusco').some(p => p[0] === '3941584'));
  assert.ok(search('PE', 'Qusqu').some(p => p[0] === '3941584'));
});

test('geography: every entry has valid coordinates and an IANA zone', {skip: !has}, () => {
  const valid = new Set(Intl.supportedValuesOf('timeZone'));
  const unknown = new Set();
  for (const cc of countries) for (const f of readdirSync(join(ROOT, cc))) for (const [p] of JSON.parse(readFileSync(join(ROOT, cc, f), 'utf8'))) {
    assert.ok(Math.abs(p[6]) <= 90 && Math.abs(p[7]) <= 180, p[1]);
    if (!valid.has(p[4])) unknown.add(p[4]);
  }
  // Aliases (e.g. legacy names) can be missing from Intl's canonical list but must still resolve.
  for (const z of unknown) assert.doesNotThrow(() => new Intl.DateTimeFormat('en', {timeZone: z}), z);
});

test('geography: within Cloudflare Pages static asset limits', {skip: !has}, () => {
  let files = 0;
  const walk = d => {for (const f of readdirSync(d)) {const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else {files++; assert.ok(s.size <= 25 * 1024 * 1024, p + ' exceeds 25 MiB');}}};
  walk(ROOT);
  assert.ok(files <= 20000, `${files} files exceeds 20,000`);
});
