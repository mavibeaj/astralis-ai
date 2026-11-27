import {test} from 'node:test';import assert from 'node:assert/strict';import {shareCardSvg} from '../src/lib/share-card.mjs';
test('story size',()=>assert.match(shareCardSvg(72,'en','story'),/width="1080" height="1920"/));
test('portrait size',()=>assert.match(shareCardSvg(72,'es','portrait'),/width="1080" height="1350"/));
test('reject invalid index and untrusted locale',()=>{assert.throws(()=>shareCardSvg(101));assert.throws(()=>shareCardSvg(72,'<script>'))});
test('only selected score and fixed text in card',()=>{const svg=shareCardSvg(72);assert.match(svg,/72\/100/);assert.doesNotMatch(svg,/1990-01-01|America\/Lima|Lima, Peru/)});
