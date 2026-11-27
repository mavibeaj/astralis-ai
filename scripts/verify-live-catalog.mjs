// Verify a published site serves the real world catalog (no fixture, no HTML 404).
// Usage: node scripts/verify-live-catalog.mjs https://<preview>.pages.dev
const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!base) {console.error('usage: verify-live-catalog.mjs <base-url>'); process.exit(2);}
const fail = m => {console.error('✖ ' + m); process.exit(1);};
const get = async path => {const r = await fetch(base + path); return {status: r.status, type: r.headers.get('content-type') ?? '', encoding: r.headers.get('content-encoding') ?? '', body: await r.text()};};
const m = await get('/geography/countries.json');
if (m.status !== 200 || !m.type.includes('json')) fail(`countries.json → HTTP ${m.status} ${m.type}`);
const j = JSON.parse(m.body);
if (j.v !== 2 || j.source !== 'geonames:world' || j.countries.length < 240) fail(`unexpected catalog: v=${j.v} source=${j.source} countries=${j.countries.length}`);
const pe = j.countries.find(c => c[0] === 'PE');
if (!pe) fail('Peru missing');
console.log(`✓ ${base}: v${j.v} ${j.source}, ${j.countries.length} countries, ${j.places} places; PE buckets=${pe[2]}; content-type=${m.type}`);
// One Peru shard must be JSON too.
const s = await get(`/geography/PE/0.json`);
console.log(`PE/0.json → HTTP ${s.status} ${s.type} ${s.encoding || '(encoding not reported)'} ${s.body.length} bytes`);
if (s.status !== 200 || !s.type.includes('json')) fail('PE shard not served as JSON');
