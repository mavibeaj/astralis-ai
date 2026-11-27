// Pinned geography catalog: install, hash refusal, missing lock and unsafe bundles.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
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
