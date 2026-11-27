// Guard: tracked files must not contain personal data. Patterns come from the PRIVATE_PATTERNS
// environment variable (newline- or "||"-separated regexes; set as a CI secret or locally) so
// that the values themselves are never committed. Skips when unset.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const raw = process.env.PRIVATE_PATTERNS ?? '';
const patterns = raw.split(/\n|\|\|/).map(s => s.trim()).filter(Boolean).map(s => new RegExp(s, 'i'));

test('no personal data in tracked files', {skip: patterns.length ? false : 'PRIVATE_PATTERNS not set'}, () => {
  const files = execFileSync('git', ['ls-files'], {encoding: 'utf8'}).split('\n').filter(f => f && !/\.(png|jpg|gz|zip|woff2?)$/.test(f));
  const hits = [];
  for (const f of files) {
    let text; try {text = readFileSync(f, 'utf8');} catch {continue;}
    patterns.forEach((p, i) => {if (p.test(text)) hits.push(`${f} (pattern #${i + 1})`);});
  }
  assert.deepEqual(hits, [], 'personal data found — values are not printed');
});
