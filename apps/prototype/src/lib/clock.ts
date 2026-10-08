// Display clock times in 12-hour notation; stored values stay in HH:mm format.
export function clockLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour % 24 < 12 ? "AM" : "PM"}`;
}
