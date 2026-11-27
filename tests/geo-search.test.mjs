import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {normalize, keyFor, h32, parseManifest, searchPlaces, cachedLoader} from '../src/lib/geo-search.mjs';

const SAMPLES = ['lima', 'chiclayo', 'ferreñafe', 'Ñaña', 'São Paulo', 'Straße', 'Ρέθυμνο', '東京', 'दिल्ली', 'กรุงเทพ', 'Reykjavík', 'qusqu'];
test('normalize, key and hash match the Python catalog writer', () => {
  const py = `import json,sys\nsys.path.insert(0,'scripts')\nfrom geography_catalog import norm,key_for,h32\nsplit={'sa','san'}\nprint(json.dumps([[norm(s),key_for(norm(s),split),h32(key_for(norm(s),split))] for s in json.loads(sys.argv[1])]))`;
  const expected = JSON.parse(execFileSync('python3', ['-c', py, JSON.stringify([...SAMPLES, 'San Martín', 'Santa Cruz', 'sa'])], {encoding: 'utf8'}));
  const split = new Set(['sa', 'san']);
  for (const [i, s] of [...SAMPLES, 'San Martín', 'Santa Cruz', 'sa'].entries()) {
    const n = normalize(s);
    assert.deepEqual([n, keyFor(n, split), h32(keyFor(n, split))], expected[i], s);
  }
});
test('keyFor deepens only through split prefixes', () => {
  const split = new Set(['sa', 'san']);
  assert.equal(keyFor('lima', split), 'li');
  assert.equal(keyFor('santa', split), 'sant');
  assert.equal(keyFor('salta', split), 'sal');
  assert.equal(keyFor('sa', split), 'sa');
});
test('parseManifest rejects missing or legacy catalogs', () => {
  assert.throws(() => parseManifest(null));
  assert.throws(() => parseManifest([['PE', 'Peru']]));
  assert.throws(() => parseManifest({v: 2, countries: []}));
  assert.equal(parseManifest({v: 2, countries: [['PE', 'Peru', 1, []]]})[0].code, 'PE');
});
test('searchPlaces filters by full query and reports short/empty/more states', async () => {
  const country = parseManifest({v: 2, countries: [['XX', 'Test', 1, ['sa']]]})[0];
  const shard = {p: [[['1', 'Santa Ana', 'R1', '', 'UTC', 10, 1, 2], ['santa ana']], [['2', 'Salta', 'R2', '', 'UTC', 99, 3, 4], ['salta']]], k: {san: [0], sal: [1]}};
  const load = async () => shard;
  assert.equal((await searchPlaces(country, 's', load)).status, 'short');
  const r = await searchPlaces(country, 'Santa', load);
  assert.deepEqual(r.rows.map(x => x.id), ['1']);
  assert.equal(r.rows[0].country, 'XX');
  assert.equal((await searchPlaces(country, 'sa', load)).status, 'more');
  assert.equal((await searchPlaces(country, 'sanx', load)).status, 'empty');
});
test('cachedLoader rejects HTML 404 pages and retries after failure', async () => {
  let calls = 0;
  const responses = [new Response('<html>', {status: 404, headers: {'content-type': 'text/html'}}), new Response('<html>', {status: 200, headers: {'content-type': 'text/html'}}), new Response('{"v":2}', {status: 200, headers: {'content-type': 'application/json'}})];
  const load = cachedLoader(async () => responses[calls++]);
  await assert.rejects(load('/x'));
  await new Promise(r => setTimeout(r));
  await assert.rejects(load('/x'), /content type/);
  await new Promise(r => setTimeout(r));
  assert.deepEqual(await load('/x'), {v: 2});
  assert.deepEqual(await load('/x'), {v: 2});
  assert.equal(calls, 3);
});
