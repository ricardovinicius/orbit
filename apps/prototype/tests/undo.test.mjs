import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restoreRecords } from '../src/lib/undo.ts';

test('undo creation removes only the created record', () => {
  const unrelated = { id: 'other', title: 'Later work' };
  assert.deepEqual(restoreRecords([unrelated, { id: 'new' }], [], ['new']), [unrelated]);
});

test('undo completion restores the original completion date', () => {
  const previous = { id: 'task', done: true, completedDate: '2026-09-30' };
  assert.deepEqual(restoreRecords([{ id: 'task', done: false }], [previous], ['task']), [previous]);
});

test('undo series edit restores all affected occurrences and preserves unrelated edits', () => {
  const previous = [{ id: 'first', title: 'Original' }, { id: 'second', title: 'Original' }];
  const unrelated = { id: 'other', title: 'Edited later' };
  const current = [{ id: 'first', title: 'Changed' }, unrelated, { id: 'second', title: 'Changed' }];
  assert.deepEqual(restoreRecords(current, previous, ['first', 'second']), [previous[0], unrelated, previous[1]]);
});

test('undo deletion restores the session once and preserves other sessions', () => {
  const deleted = { id: 'deleted', start: '09:00', end: '10:00' };
  const other = { id: 'other', start: '11:00', end: '12:00' };
  const restored = restoreRecords([other], [deleted], ['deleted']);
  assert.deepEqual(restored, [other, deleted]);
  assert.deepEqual(restoreRecords(restored, [deleted], ['deleted']), restored);
});
