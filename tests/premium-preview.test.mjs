import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPremiumPreview} from '../src/lib/premium-preview.mjs';
const fixture=()=>({status:'ok',result:{index:60,dimensions:Object.fromEntries(['emotional','communication','attraction','stability','growth'].map((k,i)=>[k,{score:80-i*10,coverage:1}]))}});
test('premium preview includes five themes and preserves scores',()=>{const p=buildPremiumPreview(fixture(),'en','partner');assert.equal(p.index,60);assert.equal(p.themes.length,5);assert.equal(p.strength,'emotional');assert.equal(p.challenge,'growth');assert.deepEqual(p.themes.map(t=>t.score),[80,70,60,50,40]);});
test('Spanish preview provides Spanish activities and limitations',()=>{const p=buildPremiumPreview(fixture(),'es','friendship');assert.equal(p.themes[0].label,'Conexión emocional');assert.match(p.limitations,/sin IA generativa/);assert.ok(p.themes.every(t=>t.activity.length>0));});
test('partial, invalid locale and incomplete dimensions are rejected',()=>{assert.throws(()=>buildPremiumPreview({status:'partial'},'en','partner'));assert.throws(()=>buildPremiumPreview(fixture(),'fr','partner'));const f=fixture();f.result.dimensions.growth.coverage=.5;assert.throws(()=>buildPremiumPreview(f,'en','partner'));});
test('premium preview never copies identifying input fields',()=>{const f=fixture();f.name='private-name';f.result.birthDate='1990-01-01';const p=JSON.stringify(buildPremiumPreview(f,'en','crush'));assert.ok(!p.includes('private-name'));assert.ok(!p.includes('1990-01-01'));assert.equal(JSON.parse(p).kind,'deterministic-preview');});
