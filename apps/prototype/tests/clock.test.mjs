import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clockLabel } from '../src/lib/clock.ts';

test('clock labels distinguish midnight, noon, morning, and evening', () => {
  assert.equal(clockLabel('00:00'), '12:00 AM');
  assert.equal(clockLabel('09:05'), '9:05 AM');
  assert.equal(clockLabel('12:00'), '12:00 PM');
  assert.equal(clockLabel('13:30'), '1:30 PM');
  assert.equal(clockLabel('23:59'), '11:59 PM');
  assert.equal(clockLabel('24:00'), '12:00 AM');
});
