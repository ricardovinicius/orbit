// Restore only records touched by one operation, preserving unrelated work.
export function restoreRecords<T extends { id: string }>(current: T[], previous: T[], ids: string[]): T[] {
  const affected = new Set(ids);
  const originals = new Map(previous.map((record) => [record.id, record]));
  const result = current.flatMap((record) => {
    if (!affected.has(record.id)) return [record];
    const original = originals.get(record.id);
    originals.delete(record.id);
    return original ? [original] : [];
  });
  return [...result, ...originals.values()];
}
