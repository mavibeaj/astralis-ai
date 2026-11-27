import {test} from 'node:test';import assert from 'node:assert/strict';import {premiumReportInput,premiumEnabled} from '../src/lib/premium-contract.mjs';
const dimensions=Object.fromEntries(['emotional','communication','attraction','stability','growth'].map(k=>[k,{score:60,coverage:1}]));
const result={status:'ok',result:{index:60,dimensions},name:'Private',birthDate:'1990-01-01'};
test('allowlist removes personal fields',()=>{const x=premiumReportInput(result,'es','partner');assert.deepEqual(Object.keys(x),['schemaVersion','locale','relationship','index','dimensions']);assert.doesNotMatch(JSON.stringify(x),/Private|1990/)});
test('partial results rejected',()=>assert.throws(()=>premiumReportInput({status:'partial'},'en','friendship')));
test('invalid options rejected',()=>assert.throws(()=>premiumReportInput(result,'xx','partner')));
test('premium remains disabled',()=>assert.equal(premiumEnabled(),false));
