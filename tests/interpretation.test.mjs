import {test} from 'node:test';import assert from 'node:assert/strict';import {interpretDimensions} from '../src/lib/interpretation.mjs';
const d={emotional:{score:80,coverage:1},communication:{score:30,coverage:1},growth:{score:100,coverage:0.3}};
test('selects supported themes only',()=>{const x=interpretDimensions(d,'es');assert.equal(x.strength.key,'emotional');assert.equal(x.challenge.key,'communication');assert.equal(x.questions.length,2)});
test('neutral scores do not invent strengths or challenges',()=>{const x=interpretDimensions({emotional:{score:50,coverage:1}});assert.equal(x.strength,null);assert.equal(x.challenge,null)});
test('missing dimensions are safe',()=>assert.deepEqual(interpretDimensions({}).questions,[]));
test('localized and deterministic',()=>{assert.deepEqual(interpretDimensions(d,'en'),interpretDimensions(d,'en'));assert.notEqual(interpretDimensions(d,'en').strength.label,interpretDimensions(d,'es').strength.label)});
