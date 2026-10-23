const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify, HttpError } = require('./common.cjs');
process.env.LAB_SIGNING_KEY = 'unit-test-only-signing-key';
test('signed demo tokens verify', () => {
  const p = { sub:'alice', role:'traveler', exp:Date.now()+5000 };
  assert.equal(verify(sign(p)).sub, 'alice');
});
test('tampered signed demo tokens are rejected', () => {
  const signed=sign({sub:'alice',role:'traveler',exp:Date.now()+5000});
  assert.throws(()=>verify(signed.slice(0,-2)+'AA'), HttpError);
});
test('expired tokens are rejected', () => {
  assert.throws(()=>verify(sign({sub:'alice',role:'traveler',exp:1})), HttpError);
});
