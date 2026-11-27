// Pinned geography catalog: install, hash refusal, missing lock and unsafe bundles.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync, spawn} from 'node:child_process';
import {mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

const SCRIPT = resolve('scripts/fetch-geography-release.py');
const py = (cwd, env = {}) => spawnSync('python3', [SCRIPT], {cwd, env: {...process.env, ...env}, encoding: 'utf8'});
const sha = f => createHash('sha256').update(readFileSync(f)).digest('hex');

function bundle(dir, {evil = false} = {}) {
  const src = join(dir, 'src');
  mkdirSync(join(src, 'geography', 'PE'), {recursive: true});
  writeFileSync(join(src, 'geography', 'countries.json'), JSON.stringify({version: 2, source: 'test:fixture', countries: []}));
  writeFileSync(join(src, 'geography', 'PE', '0.json'), '[]');
  writeFileSync(join(src, 'geography-stats.json'), '{"countries":0}');
  const out = join(dir, 'geo.tar.gz');
  const code = evil
    ? `import tarfile,io;t=tarfile.open(${JSON.stringify(out)},'w:gz');i=tarfile.TarInfo('../escape.txt');d=b'x';i.size=1;t.addfile(i,io.BytesIO(d));t.close()`
    : `import tarfile;t=tarfile.open(${JSON.stringify(out)},'w:gz');t.add(${JSON.stringify(join(src, 'geography'))},'geography');t.add(${JSON.stringify(join(src, 'geography-stats.json'))},'geography-stats.json');t.close()`;
  assert.equal(spawnSync('python3', ['-c', code]).status, 0);
  return out;
}
const lock = (dir, file, hash) => writeFileSync(join(dir, 'geography.lock.json'), JSON.stringify({version: 'test-1', url: 'file://' + file, sha256: hash ?? sha(file)}));

test('pinned bundle installs public/geography and stats', () => {
  const d = mkdtempSync(join(tmpdir(), 'geo-')); const b = bundle(d); lock(d, b);
  const r = py(d);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(d, 'public/geography/countries.json')) && existsSync(join(d, 'public/geography/PE/0.json')));
  assert.ok(existsSync(join(d, 'geography-stats.json')));
});
test('a bundle whose SHA-256 differs from the lock is refused (no silent fallback)', () => {
  const d = mkdtempSync(join(tmpdir(), 'geo-')); const b = bundle(d); lock(d, b, '0'.repeat(64));
  const r = py(d);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /SHA-256 mismatch/);
  assert.ok(!existsSync(join(d, 'public/geography')));
});
test('no lock file → exit 3 so the build falls back to a GeoNames rebuild', () => {
  const d = mkdtempSync(join(tmpdir(), 'geo-'));
  assert.equal(py(d).status, 3);
});
test('bundle members escaping the target directory are refused', () => {
  const d = mkdtempSync(join(tmpdir(), 'geo-')); const b = bundle(d, {evil: true}); lock(d, b);
  const r = py(d);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /unsafe bundle member/);
});

test('private repo: token → API asset URL → redirect fetched WITHOUT the token; token never printed', async () => {
  const {createServer} = await import('node:http');
  const d = mkdtempSync(join(tmpdir(), 'geo-')); const b = bundle(d); const body = readFileSync(b);
  const TOKEN = 'tok_' + Math.random().toString(36).slice(2);
  let leakedToStorage = false;
  const srv = createServer((req, res) => {
    if (req.url === '/api/asset') {
      if (req.headers.authorization !== `Bearer ${TOKEN}` || req.headers.accept !== 'application/octet-stream') {res.writeHead(404); return res.end();}
      res.writeHead(302, {Location: `http://127.0.0.1:${srv.address().port}/storage/blob`}); return res.end();
    }
    if (req.url === '/storage/blob') {if (req.headers.authorization) {leakedToStorage = true; res.writeHead(400); return res.end();} res.writeHead(200); return res.end(body);}
    res.writeHead(404); res.end();
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  writeFileSync(join(d, 'geography.lock.json'), JSON.stringify({version: 't', url: `http://127.0.0.1:${port}/public-unavailable`, assetApiUrl: `http://127.0.0.1:${port}/api/asset`, sha256: sha(b)}));
  const r = await new Promise(res => {const p = spawn('python3', [SCRIPT], {cwd: d, env: {...process.env, GEOGRAPHY_TOKEN: TOKEN}}); let out = ''; p.stdout.on('data', x => out += x); p.stderr.on('data', x => out += x); p.on('close', code => res({code, out}));});
  srv.close();
  assert.equal(r.code, 0, r.out);
  assert.ok(!leakedToStorage, 'token must not be sent to the storage redirect');
  assert.ok(!r.out.includes(TOKEN), 'token must never be printed');
  assert.ok(existsSync(join(d, 'public/geography/countries.json')));
  // Wrong token: fails without printing it.
  const bad = spawnSync('python3', [SCRIPT], {cwd: d, env: {...process.env, GEOGRAPHY_TOKEN: 'wrong_' + TOKEN}, encoding: 'utf8'});
  assert.notEqual(bad.status, 0); assert.ok(!(bad.stdout + bad.stderr).includes(TOKEN));
});
