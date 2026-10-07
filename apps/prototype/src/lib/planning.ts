// Keep the duration intact when a drop is close to the end of the day.
export function movedTimeRange(start: string, end: string, hour: number) {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const length = toMinutes(end) - toMinutes(start);
  const nextStart = Math.max(0, Math.min(hour * 60, 24 * 60 - length));
  const format = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  return { start: format(nextStart), end: format(nextStart + length) };
}

// Snap the change to quarter hours, retaining at least 15 minutes of planned time.
export function resizedTimeRange(start: string, end: string, edge: "start" | "end", deltaMinutes: number) {
  const toMinutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
  const delta = Math.round(deltaMinutes / 15) * 15;
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  const next = edge === "start" ? Math.max(0, Math.min(startMinutes + delta, endMinutes - 15)) : Math.min(1440, Math.max(endMinutes + delta, startMinutes + 15));
  const formatted = `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
  return edge === "start" ? { start: formatted, end } : { start, end: formatted };
}
