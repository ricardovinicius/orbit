"use client";
import { useEffect, useState } from "react";
export function useCurrentTime() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setTime(new Date());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, []);
  return time ? { minutes: time.getHours() * 60 + time.getMinutes(), label: `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}` } : null;
}
export function CurrentTimeLine({ label, top }: { label: string; top?: number | string }) {
  return <div className="current-time-line" style={top === undefined ? undefined : { position: "absolute", top }} aria-label={`Current local time ${label}`}><span className="current-time-label">{label}</span><span className="current-time-rule" aria-hidden="true" /></div>;
}
