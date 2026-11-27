// Validates a generated catalog in public/geography (GeoNames build or offline fixture)
// through the same search code the browser uses (src/lib/geo-search.mjs).
// Expected IDs and zones come from GeoNames; coordinates are checked against coarse boxes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {parseManifest, searchPlaces} from '../src/lib/geo-search.mjs';

const ROOT = 'public/geography';
const has = existsSync(join(ROOT, 'countries.json'));
const raw = has ? JSON.parse(readFileSync(join(ROOT, 'countries.json'), 'utf8')) : null;
const countries = has ? new Map(parseManifest(raw).map(c => [c.code, c])) : new Map();
const fullGeonames = has && String(raw.source).startsWith('geonames');
const load = async path => JSON.parse(readFileSync(join('public', path), 'utf8'));
const find = async (cc, q) => (await searchPlaces(countries.get(cc), q, load, 500)).rows;
const skip = cc => !has ? 'catalog not generated' : !countries.has(cc) ? 'catalog lacks ' + cc : false;

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
  test(`geography: ${cc} ${q}`, {skip: skip(cc)}, async () => {
    const hit = (await find(cc, q)).find(p => p.id === id);
    assert.ok(hit, `${q} (${id}) not found`);
    assert.equal(hit.zone, zone);
    assert.ok(hit.latitude >= la0 && hit.latitude <= la1 && hit.longitude >= lo0 && hit.longitude <= lo1, `coordinates out of range: ${hit.latitude},${hit.longitude}`);
  });
}

// Rural Lambayeque (Peru): only present in the full GeoNames dump. Checked by name + region + coarse box.
const LAMBAYEQUE = ['Pimentel', 'Monsefú', 'Reque', 'Eten', 'Incahuasi', 'Cañaris'];
for (const q of LAMBAYEQUE) {
  test(`geography: rural Lambayeque ${q}`, {skip: !fullGeonames ? 'needs full GeoNames catalog' : skip('PE')}, async () => {
    const hits = (await find('PE', q)).filter(p => p.region === 'Lambayeque');
    assert.ok(hits.length > 0, `${q} not found in Lambayeque`);
    for (const p of hits) {
      assert.equal(p.zone, 'America/Lima');
      assert.ok(p.latitude > -7.3 && p.latitude < -5.4 && p.longitude > -80.7 && p.longitude < -78.9, `${p.name} ${p.latitude},${p.longitude}`);
    }
  });
}

test('geography: accent-insensitive and alternate-name search', {skip: skip('PE')}, async () => {
  assert.ok((await find('PE', 'ferrenafe')).some(p => p.id === '3697033'));
  assert.ok((await find('PE', 'Cusco')).some(p => p.id === '3941584'));
  assert.ok((await find('PE', 'Qusqu')).some(p => p.id === '3941584'));
});
test('geography: non-Latin alternate names', {skip: skip('JP')}, async () => {
  assert.ok((await find('JP', '東京')).some(p => p.id === '1850147'));
});
test('geography: duplicated names are returned separately with their regions', {skip: !fullGeonames ? 'needs full GeoNames catalog' : skip('PE')}, async () => {
  const hits = (await find('PE', 'San José')).filter(p => p.name === 'San José');
  assert.ok(new Set(hits.map(p => p.region)).size >= 3, 'expected several regions for San José');
});
test('geography: exact match ranks first', {skip: skip('PE')}, async () => {
  assert.equal((await find('PE', 'Chiclayo'))[0].id, '3698350');
});

test('geography: every entry has valid coordinates and an IANA zone', {skip: !has}, () => {
  const valid = new Set(Intl.supportedValuesOf('timeZone'));
  const unknown = new Set();
  for (const cc of countries.keys()) for (const f of readdirSync(join(ROOT, cc))) for (const [p] of JSON.parse(readFileSync(join(ROOT, cc, f), 'utf8')).p) {
    assert.ok(Math.abs(p[6]) <= 90 && Math.abs(p[7]) <= 180, p[1]);
    if (!valid.has(p[4])) unknown.add(p[4]);
  }
  for (const z of unknown) assert.doesNotThrow(() => new Intl.DateTimeFormat('en', {timeZone: z}), z);
});
test('geography: within Cloudflare Pages static asset limits', {skip: !has}, () => {
  let files = 0;
  const walk = d => {for (const f of readdirSync(d)) {const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else {files++; assert.ok(s.size <= 25 * 1024 * 1024, p + ' exceeds 25 MiB');}}};
  walk(ROOT);
  assert.ok(files <= 19000, `${files} files exceeds budget`);
});
