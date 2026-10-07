import assert from 'node:assert/strict';
import { test } from 'node:test';
import { movedTimeRange, resizedTimeRange } from '../src/lib/planning.ts';
import { restoreRecords } from '../src/lib/undo.ts';

test('moving a timebox preserves a duration with partial hours', () => {
  assert.deepEqual(movedTimeRange('17:00', '17:45', 13), { start: '13:00', end: '13:45' });
});

test('late drop shifts the start to preserve duration within the day', () => {
  assert.deepEqual(movedTimeRange('13:00', '15:30', 23), { start: '21:30', end: '24:00' });
});

test('undo a moved recurrence preserves its siblings and unrelated edits', () => {
  const original = { id: 'first', seriesId: 'weekly', date: '2026-10-01', start: '13:00', end: '15:00' };
  const sibling = { ...original, id: 'second', date: '2026-10-08' };
  const laterEdit = { id: 'other', title: 'Edited after drop' };
  const moved = { ...original, date: '2026-10-02', ...movedTimeRange(original.start, original.end, 16) };
  assert.deepEqual(restoreRecords([moved, sibling, laterEdit], [original], ['first']), [original, sibling, laterEdit]);
});

test('resizing either edge snaps the change to 15 minutes and keeps the other edge', () => {
  assert.deepEqual(resizedTimeRange('13:00', '15:00', 'end', 22), { start: '13:00', end: '15:15' });
  assert.deepEqual(resizedTimeRange('13:00', '15:00', 'start', -24), { start: '12:30', end: '15:00' });
});

test('resizing cannot cross the opposite edge or leave the day', () => {
  assert.deepEqual(resizedTimeRange('13:00', '15:00', 'start', 180), { start: '14:45', end: '15:00' });
  assert.deepEqual(resizedTimeRange('13:00', '15:00', 'end', -180), { start: '13:00', end: '13:15' });
  assert.deepEqual(resizedTimeRange('00:30', '15:00', 'start', -180), { start: '00:00', end: '15:00' });
  assert.deepEqual(resizedTimeRange('13:00', '23:30', 'end', 180), { start: '13:00', end: '24:00' });
});
