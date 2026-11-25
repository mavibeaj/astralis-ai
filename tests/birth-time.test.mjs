import {test} from 'node:test';import assert from 'node:assert/strict';import {resolveLocalTime} from '../src/lib/birth-time.mjs';
test('Lima conversion',()=>assert.deepEqual(resolveLocalTime('2000-01-01','08:00','America/Lima'),{status:'unique',candidates:['2000-01-01T13:00:00.000Z']}));
test('New York spring gap',()=>assert.equal(resolveLocalTime('2024-03-10','02:30','America/New_York').status,'nonexistent'));
test('New York fall overlap',()=>assert.deepEqual(resolveLocalTime('2024-11-03','01:30','America/New_York').candidates,['2024-11-03T05:30:00.000Z','2024-11-03T06:30:00.000Z']));
test('Kathmandu fractional offset',()=>assert.deepEqual(resolveLocalTime('2020-01-01','08:00','Asia/Kathmandu').candidates,['2020-01-01T02:15:00.000Z']));
test('invalid zone rejected',()=>assert.throws(()=>resolveLocalTime('2000-01-01','08:00','Not/AZone')));
test('pre-1970 unsupported',()=>assert.throws(()=>resolveLocalTime('1969-12-31','08:00','America/Lima')));
