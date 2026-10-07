"use client";

import { useRef, useState, type DragEvent, type PointerEvent } from "react";
import { Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duration, minutes, type Timebox } from "@/lib/mock-data";
import { resizedTimeRange } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { PlannedTasks } from "./shared";
import { useWorkspace } from "./workspace";

type Edge = "start" | "end";

export function CalendarTimebox({ box, lane, columns, firstHour, lastHour, dragging, onDragStart, onOpen }: {
  box: Timebox; lane: number; columns: number; firstHour: number; lastHour: number;
  dragging: boolean; onDragStart: (event: DragEvent) => void; onOpen: () => void;
}) {
  const { data, setData, notify, undoFor } = useWorkspace();
  const [preview, setPreview] = useState<ReturnType<typeof resizedTimeRange> | null>(null);
  const gesture = useRef<{ edge: Edge; y: number; scroll: number; original: Timebox; undo: () => void } | null>(null);
  const suppressClick = useRef(false);
  const shown = preview ? { ...box, ...preview } : box;
  const project = data.projects.find((p) => p.id === box.projectId);

  function begin(event: PointerEvent<HTMLButtonElement>, edge: Edge) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const viewport = event.currentTarget.closest(".calendar-time-scroll");
    gesture.current = { edge, y: event.clientY, scroll: viewport?.scrollTop ?? 0, original: box, undo: undoFor("timeboxes", [box.id]) };
    suppressClick.current = true;
    setPreview({ start: box.start, end: box.end });
  }
  function range(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current) return null;
    const scroll = event.currentTarget.closest(".calendar-time-scroll")?.scrollTop ?? 0;
    return resizedTimeRange(current.original.start, current.original.end, current.edge, (event.clientY - current.y + scroll - current.scroll) / 54 * 60);
  }
  function finish(event: PointerEvent<HTMLButtonElement>, cancel = false) {
    const current = gesture.current;
    if (!current) return;
    const next = cancel ? null : range(event);
    gesture.current = null;
    setPreview(null);
    if (next && (next.start !== current.original.start || next.end !== current.original.end)) {
      setData((dataset) => ({ ...dataset, timeboxes: dataset.timeboxes.map((b) => b.id === box.id ? { ...b, ...next } : b) }));
      notify(`${box.title}: ${next.start}–${next.end}. Only this occurrence resized.`, current.undo);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setTimeout(() => { suppressClick.current = false; }, 0);
  }
  function resizeByKeyboard(edge: Edge, delta: number) {
    const next = resizedTimeRange(box.start, box.end, edge, delta);
    if (next.start === box.start && next.end === box.end) return;
    const undo = undoFor("timeboxes", [box.id]);
    setData((dataset) => ({ ...dataset, timeboxes: dataset.timeboxes.map((b) => b.id === box.id ? { ...b, ...next } : b) }));
    notify(`${box.title}: ${next.start}–${next.end}. Only this occurrence resized.`, undo);
  }
  function handle(edge: Edge) {
    return <Button variant="ghost" className={cn("timebox-resize-handle", `resize-${edge}`)}
      aria-label={`Resize ${edge} of ${box.title}, ${shown[edge]}. Use Up and Down arrows to adjust by 15 minutes.`}
      onPointerDown={(event) => begin(event, edge)}
      onPointerMove={(event) => { const next = range(event); if (next) setPreview(next); }}
      onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)}
      onLostPointerCapture={(event) => finish(event, true)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") { gesture.current = null; setPreview(null); suppressClick.current = false; }
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          resizeByKeyboard(edge, event.key === "ArrowUp" ? -15 : 15);
        }
      }}><span aria-hidden="true" /></Button>;
  }

  return <div className={cn("calendar-block", project?.color, dragging && "is-dragging", preview && "is-resizing", duration(shown) < 60 && "is-compact", duration(shown) < 30 && "is-short")}
    style={{ top: (Math.max(minutes(shown.start), firstHour * 60) - firstHour * 60) / 60 * 54,
      height: Math.max((Math.min(minutes(shown.end), lastHour * 60) - Math.max(minutes(shown.start), firstHour * 60)) / 60 * 54 - 3, 22),
      left: `calc(${lane / columns * 100}% + 3px)`, width: `calc(${100 / columns}% - 6px)` }}>
    <Button variant="ghost" size="sm" className="h-auto whitespace-normal calendar-block-content" draggable={!preview} onDragStart={onDragStart} aria-describedby="week-drag-help"
      aria-label={`${box.title}, planned time ${shown.start}–${shown.end}. ${box.taskIds.map((id) => data.tasks.find((t) => t.id === id)?.title).filter(Boolean).join(", ") || "Project time"}`}
      onClick={() => { if (!suppressClick.current) onOpen(); }}>
      <strong><span>{project?.name}</span>{box.recurrence !== "none" && <Repeat2 size={11} />}</strong>
      <span>{shown.start}–{shown.end}{duration(shown) >= 60 && <> · {preview ? "Resizing" : "Planned"}</>}</span>
      {duration(shown) >= 60 && <small>{duration(shown) < 90 ? box.taskIds.length ? `${box.taskIds.length} planned ${box.taskIds.length === 1 ? "Task" : "Tasks"}` : "Project time" : box.title}</small>}
      {duration(shown) >= 90 && <PlannedTasks box={box} compact />}
    </Button>
    {minutes(box.start) >= firstHour * 60 && handle("start")}
    {handle("end")}
    <span className="sr-only" role="status">{preview ? `${shown.start} to ${shown.end}` : ""}</span>
  </div>;
}
