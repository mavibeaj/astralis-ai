// Deployment gate: fail the build unless the exported site contains a complete, real catalog.
// Usage: node scripts/verify-geography-artifact.mjs [outDir] [--allow-fixture]
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--')) ?? 'out';
const allowFixture = args.includes('--allow-fixture');
const fail = m => {console.error('✖ Geography gate: ' + m); process.exit(1);};
const manifestPath = join(out, 'geography', 'countries.json');
if (!existsSync(manifestPath)) fail(`${manifestPath} missing. The deploy build must run "npm run build" (which generates the GeoNames catalog), not "next build".`);
let m;
try {m = JSON.parse(readFileSync(manifestPath, 'utf8'));} catch {fail('countries.json is not valid JSON');}
if (m.v !== 2 || !Array.isArray(m.countries)) fail('countries.json has an unexpected format');
const source = String(m.source || '');
if (source.startsWith('fixture') && !allowFixture) fail(`catalog source is "${source}" (test fixture). Refusing to publish fixture data as the real catalog.`);
if (source === 'geonames:world' && m.countries.length < 240) fail(`only ${m.countries.length} countries in a world build`);
if (source.startsWith('geonames:') && source !== 'geonames:world') {
  const subset = process.env.GEOGRAPHY_COUNTRIES;
  if (!subset || `geonames:${subset}` !== source) fail(`catalog was built for a subset (${source}) but GEOGRAPHY_COUNTRIES does not request it`);
  console.warn(`⚠ Geography gate: partial catalog (${source}). Acceptable for CI only.`);
}
let shardFiles = 0;
for (const [code, , buckets] of m.countries) {
  const dir = join(out, 'geography', code);
  if (!existsSync(dir)) fail(`no shards for ${code}`);
  const files = readdirSync(dir);
  shardFiles += files.length;
  if (files.length === 0 || files.length > buckets) fail(`${code}: ${files.length} shards for ${buckets} buckets`);
}
let total = 0, biggest = 0;
const walk = d => {for (const f of readdirSync(d)) {const p = join(d, f), s = statSync(p); if (s.isDirectory()) walk(p); else {total++; biggest = Math.max(biggest, s.size);}}};
walk(out);
if (total > 20000) fail(`${total} files exceed the Cloudflare Pages limit of 20,000`);
if (biggest > 25 * 1024 * 1024) fail('a file exceeds 25 MiB');
console.log(`✓ Geography gate: ${m.countries.length} countries, ${m.places} places, ${shardFiles} shards, ${total} files in ${out} (source ${source}).`);
