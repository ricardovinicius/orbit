"use client";

import { useLayoutEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Flag, GripVertical, PanelRight, Plus, Repeat2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { TODAY, WEEK_START, addDays, dateLabel, duration, inRange, minutes, timeLabel, type Checkpoint, type Timebox } from "@/lib/mock-data";
import { movedTimeRange } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { CalendarTimebox } from "./calendar-timebox";
import { CurrentTimeLine, useCurrentTime } from "./current-time";
import { useWorkspace } from "./workspace";
import { EmptyState, PageHeading, ProjectTag, SectionHeading, TaskList, TimeboxList } from "./shared";

function CheckpointMarker({ checkpoint }: { checkpoint: Checkpoint }) {
  const { data, open } = useWorkspace();
  const project = data.projects.find((p) => p.id === checkpoint.projectId);
  const overdue = checkpoint.date < TODAY;

  return (
    <Button
      variant="ghost"
      className={`calendar-checkpoint ${project?.color ?? "sage"}`}
      aria-label={`${checkpoint.title}, ${project?.name ?? "Project"}, due ${dateLabel(checkpoint.date)}${overdue ? ", overdue" : ""}. View Checkpoint and associated Tasks.`}
      onClick={() => open({ kind: "checkpoint", id: checkpoint.id })}
    >
      <Flag size={13} aria-hidden="true" />
      <span className="calendar-checkpoint-content">
        <strong>{checkpoint.title}</strong>
        <small>{project?.name}</small>
        {overdue && <small className="overdue-text">Overdue</small>}
      </span>
    </Button>
  );
}

function placeBoxes(boxes: Timebox[]) {
  const sorted = [...boxes].sort((a, b) => a.start.localeCompare(b.start));
  const groups: Timebox[][] = [];
  for (const box of sorted) {
    const last = groups.at(-1);
    if (!last || minutes(box.start) >= Math.max(...last.map((b) => minutes(b.end)))) groups.push([box]);
    else last.push(box);
  }
  return groups.flatMap((group) => {
    const ends: number[] = [];
    const placed = group.map((b) => {
      let lane = ends.findIndex((end) => end <= minutes(b.start));
      if (lane < 0) lane = ends.length;
      ends[lane] = minutes(b.end);
      return { box: b, lane };
    });
    return placed.map((p) => ({ ...p, columns: ends.length }));
  });
}

export function WeekScreen() {
  const { data, setData, open, notify, undoFor } = useWorkspace();
  const [dragged, setDragged] = useState<{ kind: "task" | "timebox"; id: string } | null>(null);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const dragRef = useRef<typeof dragged>(null);
  const suppressClick = useRef(false);
  function resetDrag() {
    dragRef.current = null;
    setDragged(null);
    setDropTarget(null);
    // Browsers may synthesize a click after dropping.
    setTimeout(() => { suppressClick.current = false; }, 0);
  }
  function startDrag(event: DragEvent, kind: "task" | "timebox", id: string) {
    dragRef.current = { kind, id };
    setDragged({ kind, id });
    suppressClick.current = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-orbit-plan", JSON.stringify({ kind, id }));
  }
  function targetProps(date: string, hour?: number) {
    const key = hour === undefined ? date : `${date}-${hour}`;
    const accepts = !!dragged && (dragged.kind === "task" ? hour === undefined : hour !== undefined);
    return {
      "data-drop-active": accepts && dropTarget === key,
      "data-drop-available": accepts,
      onDragOver: (event: DragEvent) => {
        const item = dragRef.current;
        if (!item || (item.kind === "task" ? hour !== undefined : hour === undefined)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropTarget(key);
      },
      onDragLeave: (event: DragEvent) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDropTarget((current) => current === key ? null : current);
      },
      onDrop: (event: DragEvent) => {
        const item = dragRef.current;
        if (!item || (item.kind === "task" ? hour !== undefined : hour === undefined)) return;
        event.preventDefault();
        event.stopPropagation();
        if (item.kind === "task") {
          const task = data.tasks.find((t) => t.id === item.id);
          if (task && task.date !== date) {
            const undo = undoFor("tasks", [task.id]);
            setData((current) => ({ ...current, tasks: current.tasks.map((t) => t.id === task.id ? { ...t, date } : t) }));
            notify(`${task.title}: ${date ? dateLabel(date) : "Unscheduled"}.`, undo);
          }
        } else {
          const box = data.timeboxes.find((b) => b.id === item.id);
          if (box && hour !== undefined) {
            const { start, end } = movedTimeRange(box.start, box.end, hour);
            if (box.date !== date || box.start !== start) {
              const undo = undoFor("timeboxes", [box.id]);
              setData((current) => ({ ...current, timeboxes: current.timeboxes.map((b) => b.id === box.id ? { ...b, date, start, end } : b) }));
              notify(`${box.title}: ${dateLabel(date)}, ${start}–${end}. Only this occurrence moved.`, undo);
            }
          }
        }
        resetDrag();
      },
    };
  }
  const now = useCurrentTime();
  const [week, setWeek] = useState(WEEK_START);
  const [project, setProject] = useState("all");
  const [mobileDay, setMobileDay] = useState(3);
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const [todayScrollRequest, setTodayScrollRequest] = useState(0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const boxes = data.timeboxes.filter((b) => inRange(b.date, week, addDays(week, 6)) && (project === "all" || b.projectId === project));
  const checkpoints = data.checkpoints
    .filter((c) => inRange(c.date, week, addDays(week, 6)) && (project === "all" || c.projectId === project))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const dayCheckpoints = checkpoints.filter((c) => c.date === days[mobileDay]);
  const tasks = data.tasks.filter((t) => !t.done && (project === "all" || t.projectId === project));
  const unscheduled = tasks.filter((t) => !t.date);
  const firstHour = 12;
  const lastHour = 24;
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => i + firstHour);
  useLayoutEffect(() => {
    if (!todayScrollRequest) return;
    const viewport = calendarScrollRef.current;
    if (!viewport || !viewport.clientHeight) return;
    const current = new Date();
    const currentMinutes = current.getHours() * 60 + current.getMinutes();
    const lineTop = (currentMinutes - firstHour * 60) / 60 * 54;
    viewport.scrollTo({
      top: Math.max(0, Math.min(lineTop - viewport.clientHeight / 2, viewport.scrollHeight - viewport.clientHeight)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [todayScrollRequest, firstHour]);

  const planned = boxes.reduce((n, b) => n + duration(b), 0);
  return <Sheet open={planningOpen} onOpenChange={setPlanningOpen} modal={false}><div className="week-screen" data-planning-open={planningOpen} onDragEnd={resetDrag}>
    <PageHeading title="Week">
      <div className="week-toolbar"><div className="week-navigation"><div className="arrow-group"><Button variant="ghost" size="icon-sm" aria-label="Previous week" onClick={() => setWeek(addDays(week, -7))}><ChevronLeft /></Button><Button variant="ghost" size="icon-sm" aria-label="Next week" onClick={() => setWeek(addDays(week, 7))}><ChevronRight /></Button></div><h2>{dateLabel(week)} – {dateLabel(addDays(week, 6))}, 2026</h2><Button variant="outline" size="sm" onClick={() => { setWeek(WEEK_START); setMobileDay(3); setTodayScrollRequest((request) => request + 1); }}>Today</Button></div><Select value={project} onValueChange={setProject}><SelectTrigger aria-label="Filter calendar by Project" size="sm" className="compact-select"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All Projects</SelectItem>{data.projects.map((p) => <SelectItem value={p.id} key={p.id}>{p.name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
      <Button onClick={() => open({ kind: "timebox", date: days[mobileDay], projectId: project === "all" ? undefined : project })}><Plus size={16} />Add Timebox</Button>
    </PageHeading>
    <p className="drag-instructions" id="week-drag-help"><GripVertical size={14} aria-hidden="true" />Drag Tasks to a day or Unscheduled. Drag Timeboxes to an hour; drag their edges to resize. Click to edit.</p>
    <div className="week-layout"><div>
      <Card className="calendar-panel"><div className="calendar-desktop"><div className="calendar-head"><div className="calendar-timezone">LOCAL</div>{days.map((d) => <div className={`calendar-day ${d === TODAY ? "is-today" : ""}`} key={d}><span>{dateLabel(d, { weekday: "short" })}</span><strong>{Number(d.slice(-2))}</strong>{d === TODAY && <small>Today</small>}</div>)}</div>
        <section className="calendar-checkpoint-strip" aria-label="Checkpoint deadlines">
          <div className="checkpoint-strip-label"><Flag size={13} aria-hidden="true" /><span>DUE</span></div>
          {days.map((d) => {
            const due = checkpoints.filter((c) => c.date === d);
            return (
              <div className="checkpoint-day-cell" key={d} role="group" aria-label={`Checkpoints due ${dateLabel(d)}`}>
                {due.length ? due.map((c) => <CheckpointMarker key={c.id} checkpoint={c} />) : <span className="checkpoint-day-empty" aria-label="No Checkpoints due">—</span>}
              </div>
            );
          })}
        </section>
        <div className="calendar-task-strip"><span className="task-strip-label">TASKS</span>{days.map((d) => <div key={d} {...targetProps(d)} aria-label={`Tasks for ${dateLabel(d)}`}>{tasks.filter((t) => t.date === d).map((t) => <Button variant="ghost" size="sm" className={cn("h-auto whitespace-normal calendar-task", dragged?.id === t.id && "is-dragging")} key={t.id} title={t.title} draggable onDragStart={(e) => startDrag(e, "task", t.id)} aria-describedby="week-drag-help" onClick={() => { if (!suppressClick.current) open({ kind: "task", id: t.id }); }}><span className={`project-dot ${data.projects.find((p) => p.id === t.projectId)?.color}`} /><span className="calendar-task-title">{t.title}</span></Button>)}<Button variant="ghost" size="sm" className="h-auto whitespace-normal calendar-add-task" aria-label={`Add Task for ${dateLabel(d)}`} onClick={() => open({ kind: "task", date: d, projectId: project === "all" ? undefined : project })}><Plus size={11} /></Button></div>)}</div>
        <div ref={calendarScrollRef} className="calendar-time-scroll" role="region" aria-label="Calendar hours from 12pm to 11pm" tabIndex={0}><div className="calendar-body" style={{ height: hours.length * 54 }}><div className="hour-labels">{hours.map((hour) => <span key={hour} style={{ top: (hour - firstHour) * 54 }}>{String(hour).padStart(2, "0")}:00</span>)}</div>{days.map((d) => <div key={d} className={`calendar-column ${d === TODAY ? "today-column" : ""}`}>
          {d === TODAY && now && now.minutes >= firstHour * 60 && now.minutes < lastHour * 60 && <CurrentTimeLine label={now.label} top={(now.minutes - firstHour * 60) / 60 * 54} />}
          {hours.map((hour) => <Button variant="ghost" size="sm" {...targetProps(d, hour)} className="h-auto whitespace-normal calendar-slot" key={hour} style={{ top: (hour - firstHour) * 54 }} aria-label={`Plan ${dateLabel(d)} at ${hour}:00`} onClick={() => open({ kind: "timebox", date: d, start: `${String(hour).padStart(2, "0")}:00`, projectId: project === "all" ? undefined : project })}><Plus size={13} /></Button>)}
          {placeBoxes(boxes.filter((b) => b.date === d && minutes(b.end) > firstHour * 60 && minutes(b.start) < lastHour * 60)).map(({ box: b, lane, columns }) => <CalendarTimebox key={b.id} box={b} lane={lane} columns={columns} firstHour={firstHour} lastHour={lastHour} dragging={dragged?.id === b.id} onDragStart={(e) => startDrag(e, "timebox", b.id)} onOpen={() => { if (!suppressClick.current) open({ kind: "timebox", id: b.id }); }} />)}
        </div>)}</div></div></div>
        <div className="calendar-mobile">
          <ToggleGroup type="single" className="mobile-day-picker" value={String(mobileDay)} onValueChange={(value) => { if (value) setMobileDay(Number(value)); }} aria-label="Calendar day">{days.map((d, i) => <ToggleGroupItem key={d} value={String(i)}><span>{dateLabel(d, { weekday: "short" })}</span><strong>{Number(d.slice(-2))}</strong></ToggleGroupItem>)}</ToggleGroup>
          <div className="mobile-agenda">
            <h3>{dateLabel(days[mobileDay], { weekday: "long", month: "short", day: "numeric" })}</h3>
            <section className="mobile-checkpoints" aria-labelledby="mobile-checkpoints-heading">
              <h4 id="mobile-checkpoints-heading"><Flag size={13} aria-hidden="true" />Checkpoint deadlines</h4>
              {dayCheckpoints.length ? dayCheckpoints.map((c) => <CheckpointMarker key={c.id} checkpoint={c} />) : <p>No Checkpoints due this day.</p>}
            </section>
            <TaskList tasks={tasks.filter((t) => t.date === days[mobileDay])} />
            <TimeboxList boxes={boxes.filter((b) => b.date === days[mobileDay])} trackCurrentTime={days[mobileDay] === TODAY} />
          </div>
        </div>
        <div className="calendar-legend"><span><Flag size={12} />Checkpoint deadline · no time reserved</span><span><span className="legend-planned" />Timeboxes show planned time</span><span><Repeat2 size={12} />Recurring commitment</span><SheetTrigger asChild><Button variant="outline" size="sm" className="calendar-planning-trigger" onDragOver={(event) => { if (dragRef.current?.kind === "task") { event.preventDefault(); setPlanningOpen(true); } }}><PanelRight data-icon="inline-start" />Planning<Badge variant="secondary">{unscheduled.length}</Badge></Button></SheetTrigger></div>
      </Card>
    </div></div>
    <SheetContent side="right" className="week-planning-drawer" onInteractOutside={(event) => event.preventDefault()} onDragEnd={resetDrag}>
      <SheetHeader><SheetTitle>Week planning</SheetTitle><SheetDescription>{dateLabel(week)} – {dateLabel(addDays(week, 6))} · {project === "all" ? "All Projects" : data.projects.find((p) => p.id === project)?.name}</SheetDescription></SheetHeader>
      <div className="week-side week-planning-content">
      <p className="planning-drawer-hint">Drag a Task onto a calendar day, or use Assign day.</p>
      <Card className="panel"><SectionHeading title="Unscheduled Tasks" count={unscheduled.length}><Button variant="ghost" size="icon-xs" aria-label="Add unscheduled Task" onClick={() => open({ kind: "task", date: "", projectId: project === "all" ? undefined : project })}><Plus /></Button></SectionHeading><div className="unscheduled-list" {...targetProps("")} aria-label="Unscheduled Tasks">{unscheduled.map((t) => <div className={cn("unscheduled-task", dragged?.id === t.id && "is-dragging")} key={t.id}><div className="unscheduled-task-heading"><Button variant="ghost" size="icon-xs" className="task-drag-handle" draggable onDragStart={(e) => startDrag(e, "task", t.id)} aria-label={`Drag ${t.title} to a day; click to assign day`} aria-describedby="week-drag-help" onClick={() => { if (!suppressClick.current) open({ kind: "task", id: t.id }); }}><GripVertical /></Button><ProjectTag id={t.projectId} /></div><strong>{t.title}</strong><Button variant="ghost" size="sm" onClick={() => open({ kind: "task", id: t.id })}>Assign day<ArrowRight size={13} /></Button></div>)}{!unscheduled.length && <EmptyState compact title="Everything has a place" description="Unscheduled Tasks will appear here." />}</div></Card>
      <Card className="panel week-summary"><span className="eyebrow">PLANNED TIME</span><div className="week-total">{timeLabel(planned)}<small>planned</small></div><div className="allocation-list">{data.projects.filter((p) => boxes.some((b) => b.projectId === p.id)).map((p) => { const amount = boxes.filter((b) => b.projectId === p.id).reduce((n, b) => n + duration(b), 0); return <div key={p.id}><div><ProjectTag id={p.id} /><span>{timeLabel(amount)}</span></div><div className="allocation-track"><span className={p.color} style={{ width: `${planned ? amount / planned * 100 : 0}%` }} /></div></div>; })}</div><Button asChild variant="ghost"><Link href="/progress">Review actual time<ArrowRight size={14} /></Link></Button></Card>
    </div></SheetContent>
  </div></Sheet>;
}
