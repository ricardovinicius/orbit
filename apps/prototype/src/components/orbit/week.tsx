"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Flag, Plus, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TODAY, WEEK_START, addDays, dateLabel, duration, inRange, minutes, timeLabel, type Checkpoint, type Timebox } from "@/lib/mock-data";
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
  const { data, open } = useWorkspace();
  const [week, setWeek] = useState(WEEK_START);
  const [project, setProject] = useState("all");
  const [mobileDay, setMobileDay] = useState(3);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const boxes = data.timeboxes.filter((b) => inRange(b.date, week, addDays(week, 6)) && (project === "all" || b.projectId === project));
  const checkpoints = data.checkpoints
    .filter((c) => inRange(c.date, week, addDays(week, 6)) && (project === "all" || c.projectId === project))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const dayCheckpoints = checkpoints.filter((c) => c.date === days[mobileDay]);
  const tasks = data.tasks.filter((t) => !t.done && (project === "all" || t.projectId === project));
  const unscheduled = tasks.filter((t) => !t.date);
  const firstHour = Math.min(8, ...boxes.map((b) => Math.floor(minutes(b.start) / 60)));
  const lastHour = Math.max(19, ...boxes.map((b) => Math.ceil(minutes(b.end) / 60)));
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => i + firstHour);
  const planned = boxes.reduce((n, b) => n + duration(b), 0);
  return <>
    <PageHeading eyebrow="MAKE SPACE FOR WHAT MATTERS" title="Your week, with intention." description="Give your Projects a place in your week. Leave a little room for life."><Button onClick={() => open({ kind: "timebox", date: days[mobileDay], projectId: project === "all" ? undefined : project })}><Plus size={16} />Add Timebox</Button></PageHeading>
    <div className="week-toolbar"><div className="week-navigation"><div className="arrow-group"><Button variant="ghost" size="icon-sm" aria-label="Previous week" onClick={() => setWeek(addDays(week, -7))}><ChevronLeft /></Button><Button variant="ghost" size="icon-sm" aria-label="Next week" onClick={() => setWeek(addDays(week, 7))}><ChevronRight /></Button></div><h2>{dateLabel(week)} – {dateLabel(addDays(week, 6))}, 2026</h2><Button variant="outline" size="sm" onClick={() => { setWeek(WEEK_START); setMobileDay(3); }}>Today</Button></div><select aria-label="Filter calendar by Project" className="compact-select" value={project} onChange={(e) => setProject(e.target.value)}><option value="all">All Projects</option>{data.projects.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}</select></div>
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
        <div className="calendar-task-strip"><span className="task-strip-label">TASKS</span>{days.map((d) => <div key={d}>{tasks.filter((t) => t.date === d).map((t) => <button className="calendar-task" key={t.id} onClick={() => open({ kind: "task", id: t.id })}><span className={`project-dot ${data.projects.find((p) => p.id === t.projectId)?.color}`} />{t.title}</button>)}<button className="calendar-add-task" aria-label={`Add Task for ${dateLabel(d)}`} onClick={() => open({ kind: "task", date: d, projectId: project === "all" ? undefined : project })}><Plus size={11} /></button></div>)}</div>
        <div className="calendar-body" style={{ height: hours.length * 54 }}><div className="hour-labels">{hours.map((hour) => <span key={hour} style={{ top: (hour - firstHour) * 54 }}>{String(hour).padStart(2, "0")}:00</span>)}</div>{days.map((d) => <div key={d} className={`calendar-column ${d === TODAY ? "today-column" : ""}`}>
          {hours.map((hour) => <button className="calendar-slot" key={hour} style={{ top: (hour - firstHour) * 54 }} aria-label={`Plan ${dateLabel(d)} at ${hour}:00`} onClick={() => open({ kind: "timebox", date: d, start: `${String(hour).padStart(2, "0")}:00`, projectId: project === "all" ? undefined : project })}><Plus size={13} /></button>)}
          {placeBoxes(boxes.filter((b) => b.date === d)).map(({ box: b, lane, columns }) => <button key={b.id} className={`calendar-block ${data.projects.find((p) => p.id === b.projectId)?.color}`} style={{ top: (minutes(b.start) - firstHour * 60) / 60 * 54, height: Math.max(duration(b) / 60 * 54 - 3, 22), left: `calc(${lane / columns * 100}% + 3px)`, width: `calc(${100 / columns}% - 6px)` }} onClick={() => open({ kind: "timebox", id: b.id })}><strong>{data.projects.find((p) => p.id === b.projectId)?.name}{b.recurrence !== "none" && <Repeat2 size={11} />}</strong><span>{b.start}–{b.end}</span>{duration(b) >= 60 && <small>{b.title}</small>}{duration(b) >= 90 && <em>Planned</em>}</button>)}
        </div>)}</div></div>
        <div className="calendar-mobile">
          <div className="mobile-day-picker">{days.map((d, i) => <button key={d} className={i === mobileDay ? "selected" : ""} aria-pressed={i === mobileDay} onClick={() => setMobileDay(i)}><span>{dateLabel(d, { weekday: "short" })}</span><strong>{Number(d.slice(-2))}</strong></button>)}</div>
          <div className="mobile-agenda">
            <h3>{dateLabel(days[mobileDay], { weekday: "long", month: "short", day: "numeric" })}</h3>
            <section className="mobile-checkpoints" aria-labelledby="mobile-checkpoints-heading">
              <h4 id="mobile-checkpoints-heading"><Flag size={13} aria-hidden="true" />Checkpoint deadlines</h4>
              {dayCheckpoints.length ? dayCheckpoints.map((c) => <CheckpointMarker key={c.id} checkpoint={c} />) : <p>No Checkpoints due this day.</p>}
            </section>
            <TaskList tasks={tasks.filter((t) => t.date === days[mobileDay])} />
            <TimeboxList boxes={boxes.filter((b) => b.date === days[mobileDay])} />
          </div>
        </div>
        <div className="calendar-legend"><span><Flag size={12} />Checkpoint deadline · no time reserved</span><span><span className="legend-planned" />Timeboxes show planned time</span><span><Repeat2 size={12} />Recurring commitment</span></div>
      </Card>
    </div><div className="week-side">
      <Card className="panel"><SectionHeading title="Ready to plan" count={unscheduled.length}><Button variant="ghost" size="icon-xs" aria-label="Add unscheduled Task" onClick={() => open({ kind: "task", date: "", projectId: project === "all" ? undefined : project })}><Plus /></Button></SectionHeading><p className="section-subtitle">Small steps looking for a day.</p><div className="unscheduled-list">{unscheduled.map((t) => <div className="unscheduled-task" key={t.id}><ProjectTag id={t.projectId} /><strong>{t.title}</strong><Button variant="ghost" size="sm" onClick={() => open({ kind: "task", id: t.id })}>Assign day<ArrowRight size={13} /></Button></div>)}{!unscheduled.length && <EmptyState compact title="Everything has a place" description="Unscheduled Tasks will appear here." />}</div></Card>
      <Card className="panel week-summary"><span className="eyebrow">THIS WEEK’S INTENTION</span><div className="week-total">{timeLabel(planned)}<small>planned</small></div><div className="allocation-list">{data.projects.filter((p) => boxes.some((b) => b.projectId === p.id)).map((p) => { const amount = boxes.filter((b) => b.projectId === p.id).reduce((n, b) => n + duration(b), 0); return <div key={p.id}><div><ProjectTag id={p.id} /><span>{timeLabel(amount)}</span></div><div className="allocation-track"><span className={p.color} style={{ width: `${planned ? amount / planned * 100 : 0}%` }} /></div></div>; })}</div><p className="gentle-note"><Clock3 size={16} />A plan is a starting point. It’s okay if your week unfolds differently.</p><Button asChild variant="ghost"><Link href="/progress">Review actual time<ArrowRight size={14} /></Link></Button></Card>
    </div></div>
  </>;
}
