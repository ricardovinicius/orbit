"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCheck, Clock3, Flag, Play, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { TODAY, duration, timeLabel } from "@/lib/mock-data";
import { useWorkspace } from "./workspace";
import { AddTaskButton, CheckpointList, CompletionNote, Metric, PageHeading, SectionHeading, SessionList, TaskList, TimeboxList } from "./shared";

export function TodayScreen() {
  const { data, open, active, setActive } = useWorkspace();
  const tasks = data.tasks.filter((t) => t.date === TODAY);
  const done = tasks.filter((t) => t.done);
  const overdue = data.tasks.filter((t) => t.date && t.date < TODAY && !t.done);
  const boxes = data.timeboxes.filter((b) => b.date === TODAY);
  const sessions = data.sessions.filter((s) => s.date === TODAY);
  const activeProject = data.projects.find((project) => project.id === active?.projectId);
  const activeTasks = data.tasks.filter((task) => active?.taskIds.includes(task.id));
  const availableTasks = data.tasks.filter((task) => task.projectId === active?.projectId && !task.done);
  const activeBox = boxes.find((box) => box.projectId === active?.projectId && box.start <= active.start && box.end > active.start);
  return <>
    <PageHeading title="Today"><AddTaskButton /><Button onClick={() => open({ kind: active ? "stop" : "start" })}><Play size={15} fill="currentColor" />{active ? "Review Session" : "Start Session"}</Button></PageHeading>
    {active && <Card className="today-active-session" aria-labelledby="today-active-title">
      <CardHeader><CardTitle><h2 id="today-active-title" className="today-active-label"><span className={`project-dot ${activeProject?.color ?? ""}`} />In session · {activeProject?.name ?? "Project"}</h2></CardTitle></CardHeader>
      <CardContent>
        <p className="today-active-timer" aria-label="Demo elapsed time: 25 minutes">00:25:00</p>
        <p className="today-active-context">{activeTasks.length ? activeTasks.map((task) => task.title).join(" · ") : "Project time"} · started {active.start}{activeBox && <> · Timebox until {activeBox.end}</>}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Select value={active.taskIds[0] ?? "project-time"} onValueChange={(value) => setActive((current) => current ? { ...current, taskIds: value === "project-time" ? [] : [value] } : null)}>
          <SelectTrigger aria-label="Switch task"><span>Switch task</span></SelectTrigger>
          <SelectContent><SelectGroup><SelectItem value="project-time">Project time</SelectItem>{availableTasks.map((task) => <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Button variant="secondary" onClick={() => open({ kind: "stop", projectId: active.projectId })}><Square data-icon="inline-start" fill="currentColor" />Stop session</Button>
        <span className="today-active-demo">Demo timer</span>
      </CardFooter>
    </Card>}
    <div className="metrics-grid"><Metric label="Planned time" value={timeLabel(boxes.reduce((n, b) => n + duration(b), 0))} icon={<CalendarDays size={18} />} note={`${boxes.length} Timeboxes for today`} /><Metric label="Actual time" value={timeLabel(sessions.reduce((n, s) => n + duration(s), 0))} icon={<Clock3 size={18} />} note={`${sessions.length} Sessions recorded`} accent /><Metric label="Tasks completed" value={<>{done.length}<span className="metric-denominator"> / {tasks.length}</span></>} icon={<CheckCheck size={18} />} note="One step at a time." /></div>
    <div className="today-grid"><div className="main-column">
      <Card className="panel focus-panel"><SectionHeading title="Tasks" count={tasks.filter((t) => !t.done).length}><Button variant="ghost" size="sm" onClick={() => open({ kind: "task" })}><Plus size={14} />Add Task</Button></SectionHeading><TaskList tasks={tasks.filter((t) => !t.done)} emptyText="You have a clear day ahead" />{done.length > 0 && <details className="completed-tasks" open><summary><CompletionNote done={done.length} total={tasks.length} /></summary><TaskList tasks={done} /></details>}</Card>
      {overdue.length > 0 && <Card className="panel attention-panel"><SectionHeading title="Overdue Tasks"><span className="overdue-label">From earlier</span></SectionHeading><TaskList tasks={overdue} showDate /></Card>}
      <Card className="panel"><SectionHeading title="Sessions"><Button variant="ghost" size="sm" onClick={() => open({ kind: "session" })}><Plus size={14} />Register Session</Button></SectionHeading><SessionList sessions={sessions} /><div className="panel-footnote"><Clock3 size={13} />Actual effort, recorded separately from your plan.</div></Card>
    </div><div className="right-column">
      <Card className="panel schedule-panel"><SectionHeading title="Schedule"><Button variant="ghost" size="icon-sm" aria-label="Add Timebox" onClick={() => open({ kind: "timebox" })}><Plus size={16} /></Button></SectionHeading><TimeboxList boxes={boxes} /><Button asChild variant="ghost" className="panel-link"><Link href="/week">See the whole week<ArrowRight size={14} /></Link></Button></Card>
      <Card className="panel"><SectionHeading title="Checkpoints"><Flag size={15} className="muted" /></SectionHeading><CheckpointList checkpoints={data.checkpoints.filter((c) => c.date >= TODAY).slice(0, 3)} /></Card>
    </div></div>
  </>;
}
