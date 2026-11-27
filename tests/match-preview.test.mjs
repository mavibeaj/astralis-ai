import {test} from 'node:test';import assert from 'node:assert/strict';import {matchPreview} from '../src/lib/match-preview.mjs';
const a={date:'1990-01-01',time:'08:00',place:'Lima, Peru',zone:'America/Lima',unknownTime:false},b={...a,date:'1992-06-01'};
test('known time preview reproducible',()=>{const x=matchPreview(a,b,'2008-11-25');assert.equal(x.status,'ok');assert.deepEqual(x,matchPreview(a,b,'2008-11-25'));assert.ok(x.result.index>=0&&x.result.index<=100)});
test('unknown time gives sampled range, no exact score',()=>{const x=matchPreview({...a,unknownTime:true,time:''},b,'2008-11-25');assert.equal(x.status,'partial');assert.ok(x.sampleCount>=1&&x.sampleCount<=10);assert.ok(x.indexRange[0]<=x.indexRange[1]);assert.equal(x.result,undefined)});
test('ordinary UTC dates yield 25 combinations',()=>assert.equal(matchPreview({...a,zone:'UTC',unknownTime:true},{...b,zone:'UTC',unknownTime:true},'2008-11-25').sampleCount,25));
test('historical sample count follows valid local instants',()=>{const x=matchPreview({...a,unknownTime:true},{...b,unknownTime:true},'2008-11-25');assert.equal(x.status,'partial');assert.ok(x.sampleCount>0&&x.sampleCount<=100)});
test('DST ambiguous time withheld',()=>assert.equal(matchPreview({...a,date:'2007-11-04',time:'01:30',zone:'America/New_York'},b,'2008-11-25').status,'ambiguous'));
