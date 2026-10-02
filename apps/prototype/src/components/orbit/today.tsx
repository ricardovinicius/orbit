"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCheck, Clock3, Flag, Play, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TODAY, duration, timeLabel } from "@/lib/mock-data";
import { useWorkspace } from "./workspace";
import { AddTaskButton, CheckpointList, CompletionNote, Metric, PageHeading, SectionHeading, SessionList, TaskList, TimeboxList } from "./shared";

export function TodayScreen() {
  const { data, open, active } = useWorkspace();
  const tasks = data.tasks.filter((t) => t.date === TODAY);
  const done = tasks.filter((t) => t.done);
  const overdue = data.tasks.filter((t) => t.date && t.date < TODAY && !t.done);
  const boxes = data.timeboxes.filter((b) => b.date === TODAY);
  const sessions = data.sessions.filter((s) => s.date === TODAY);
  return <>
    <PageHeading eyebrow="THURSDAY, OCTOBER 1" title="A little focus. Meaningful progress." description="Make room for the things that matter to you today."><AddTaskButton /><Button onClick={() => open({ kind: active ? "stop" : "start" })}><Play size={15} fill="currentColor" />{active ? "Review Session" : "Start Session"}</Button></PageHeading>
    <div className="metrics-grid"><Metric label="Planned time" value={timeLabel(boxes.reduce((n, b) => n + duration(b), 0))} icon={<CalendarDays size={18} />} note={`${boxes.length} Timeboxes for today`} /><Metric label="Actual time" value={timeLabel(sessions.reduce((n, s) => n + duration(s), 0))} icon={<Clock3 size={18} />} note={`${sessions.length} Sessions recorded`} accent /><Metric label="Tasks completed" value={<>{done.length}<span className="metric-denominator"> / {tasks.length}</span></>} icon={<CheckCheck size={18} />} note="One step at a time." /></div>
    <div className="today-grid"><div className="main-column">
      <Card className="panel focus-panel"><SectionHeading title="Today’s Tasks" count={tasks.filter((t) => !t.done).length}><Button variant="ghost" size="sm" onClick={() => open({ kind: "task" })}><Plus size={14} />Add Task</Button></SectionHeading><TaskList tasks={tasks.filter((t) => !t.done)} emptyText="You have a clear day ahead" />{done.length > 0 && <details className="completed-tasks" open><summary><CompletionNote done={done.length} total={tasks.length} /></summary><TaskList tasks={done} /></details>}</Card>
      {overdue.length > 0 && <Card className="panel attention-panel"><SectionHeading title="Needs a little attention"><span className="overdue-label">From earlier</span></SectionHeading><TaskList tasks={overdue} showDate /></Card>}
      <Card className="panel"><SectionHeading title="Time you’ve invested"><Button variant="ghost" size="sm" onClick={() => open({ kind: "session" })}><Plus size={14} />Register Session</Button></SectionHeading><SessionList sessions={sessions} /><div className="panel-footnote"><Clock3 size={13} />Actual effort, recorded separately from your plan.</div></Card>
    </div><div className="right-column">
      <Card className="panel schedule-panel"><SectionHeading title="Your day, planned"><Button variant="ghost" size="icon-sm" aria-label="Add Timebox" onClick={() => open({ kind: "timebox" })}><Plus size={16} /></Button></SectionHeading><div className="section-subtitle"><Sun size={14} />A little structure. Room to adjust.</div><TimeboxList boxes={boxes} /><Button asChild variant="ghost" className="panel-link"><Link href="/week">See the whole week<ArrowRight size={14} /></Link></Button></Card>
      <Card className="panel"><SectionHeading title="On the horizon"><Flag size={15} className="muted" /></SectionHeading><CheckpointList checkpoints={data.checkpoints.filter((c) => c.date >= TODAY).slice(0, 3)} /></Card>
    </div></div>
  </>;
}
