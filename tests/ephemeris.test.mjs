import {test} from 'node:test';import assert from 'node:assert/strict';import {calculateUtc} from '../src/lib/ephemeris.mjs';
test('ten bodies bounded and deterministic',()=>{const d=new Date('2000-01-01T12:00:00Z');const a=calculateUtc(d);assert.equal(Object.keys(a.longitudes).length,10);assert.deepEqual(a,calculateUtc(d));for(const x of Object.values(a.longitudes))assert.ok(x>=0&&x<360)});
test('J2000 approximate solar sanity check',()=>{assert.ok(Math.abs(calculateUtc(new Date('2000-01-01T12:00:00Z')).longitudes.Sun-280.4)<0.5)});
test('invalid instant rejected',()=>assert.throws(()=>calculateUtc(new Date('invalid'))));
