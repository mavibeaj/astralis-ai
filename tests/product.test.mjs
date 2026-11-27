import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Foundation smoke check, not a substitute for runtime or engine tests.
const source=readFileSync(new URL('../src/config/product.ts',import.meta.url),'utf8');
test('live payments disabled',()=>assert.match(source,/paymentsEnabled: false/));
test('provisional brand',()=>assert.match(source,/trademarkCleared: false/));
