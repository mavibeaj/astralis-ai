// Client-side search over the static GeoNames catalog (format v2).
// Mirrors scripts/geography_catalog.py: normalize(), keyFor(), h32(). Any change must be made in both.
export const normalize = s => s.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').replace(/ς/g, 'σ').trim();
const chars = s => Array.from(s);
export function keyFor(q, split) {
  const c = chars(q);
  let k = c.slice(0, 2).join('');
  while (split.has(k) && c.length > chars(k).length) k = c.slice(0, chars(k).length + 1).join('');
  return k;
}
export function h32(s) {
  let h = 0;
  for (const b of new TextEncoder().encode(s)) h = (Math.imul(h, 31) + b) >>> 0;
  return h;
}
/** Parse and validate countries.json (v2). Throws on anything unexpected. */
export function parseManifest(json) {
  if (!json || json.v !== 2 || !Array.isArray(json.countries) || json.countries.length === 0) throw new Error('Invalid geography manifest');
  return json.countries.map(([code, name, buckets, split]) => ({code, name, buckets, split: new Set(split)}));
}
export function shardPath(country, q) {
  const k = keyFor(q, country.split);
  return {key: k, path: `/geography/${country.code}/${h32(k) % country.buckets}.json`, needsMore: country.split.has(k)};
}
/**
 * @param country entry from parseManifest
 * @param query user text
 * @param load (path) => Promise<shard json>
 * @returns {Promise<{status:'short'|'ready'|'empty'|'more', rows: object[]}>}
 */
export async function searchPlaces(country, query, load, limit = 30) {
  const q = normalize(query);
  if (chars(q).length < 2) return {status: 'short', rows: []};
  const {key, path, needsMore} = shardPath(country, q);
  const shard = await load(path);
  const seen = new Map();
  for (const i of shard.k?.[key] ?? []) {
    const [p, aliases] = shard.p[i];
    if (!seen.has(p[0]) && aliases.some(a => a.startsWith(q))) seen.set(p[0], p);
  }
  const rows = [...seen.values()]
    .sort((a, b) => Number(normalize(b[1]) === q) - Number(normalize(a[1]) === q) || Number(normalize(b[1]).startsWith(q)) - Number(normalize(a[1]).startsWith(q)) || b[5] - a[5])
    .slice(0, limit)
    .map(([id, name, region, district, zone, population, latitude, longitude]) => ({id, name, region, district, zone, population, latitude, longitude, country: country.code}));
  return {status: rows.length ? 'ready' : needsMore ? 'more' : 'empty', rows};
}
/** Fetch JSON with a per-session cache; failed requests are evicted so they can be retried. */
export function cachedLoader(fetchImpl = fetch) {
  const cache = new Map();
  return path => {
    if (!cache.has(path)) {
      const p = fetchImpl(path).then(r => {
        if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), {status: r.status});
        if (!(r.headers.get('content-type') || '').includes('json')) throw new Error('Unexpected content type');
        return r.json();
      });
      p.catch(() => cache.delete(path));
      cache.set(path, p);
    }
    return cache.get(path);
  };
}
