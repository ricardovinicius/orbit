"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Check, Clock3, Flag, FolderClosed, MoreHorizontal, Plus, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { clockLabel } from "@/lib/clock";
import { TODAY, dateLabel, duration, minutes, timeLabel, type Checkpoint, type Session, type Task, type Timebox } from "@/lib/mock-data";
import { CurrentTimeLine, useCurrentTime } from "./current-time";
import { useWorkspace } from "./workspace";

export function PageHeading({ title, children }: { title: string; children?: ReactNode }) { return <div className="page-heading"><h1>{title}</h1>{children && <div className="heading-actions">{children}</div>}</div>; }
export function SectionHeading({ title, count, children }: { title: string; count?: number; children?: ReactNode }) { return <div className="section-heading"><h2><span className="section-heading-title">{title}</span>{count !== undefined && <span className="count-pill">{count}</span>}</h2><div>{children}</div></div>; }
export function ProjectTag({ id, link = true }: { id: string; link?: boolean }) { const { data } = useWorkspace(); const project = data.projects.find((p) => p.id === id); if (!project) return null; const content = <><span className={`project-dot ${project.color}`} />{project.name}</>; return link ? <Link href={`/projects/${id}`} className="project-tag">{content}</Link> : <span className="project-tag">{content}</span>; }
export function EmptyState({ title, description, children, compact = false }: { title: string; description: string; children?: ReactNode; compact?: boolean }) { return <Empty className={`empty-state ${compact ? "compact" : ""}`}><EmptyHeader><EmptyMedia variant="icon"><FolderClosed /></EmptyMedia><EmptyTitle><h3>{title}</h3></EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{children && <EmptyContent>{children}</EmptyContent>}</Empty>; }
export function Metric({ icon, label, value, note, accent }: { icon: ReactNode; label: string; value: ReactNode; note: ReactNode; accent?: boolean }) { return <Card className={`metric ${accent ? "metric-accent" : ""}`}><div className="metric-top"><span>{label}</span>{icon}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></Card>; }

export function TaskList({ tasks, showDate = false, emptyText = "A little breathing room." }: { tasks: Task[]; showDate?: boolean; emptyText?: string }) {
  const { data, setData, open, notify, undoFor } = useWorkspace();
  if (!tasks.length) return <EmptyState compact title={emptyText} description="Add a Task when you’re ready to take the next step." />;
  return <div className="task-list">{tasks.map((t) => {
    const checkpoint = data.checkpoints.find((c) => c.id === t.checkpointId);
    return <div key={t.id} className={`task-row ${t.done ? "task-done" : ""}`}><Checkbox checked={t.done} aria-label={`${t.done ? "Reopen" : "Complete"} ${t.title}`} onCheckedChange={() => { setData((d) => ({ ...d, tasks: d.tasks.map((item) => item.id === t.id ? { ...item, done: !item.done, completedDate: !item.done ? TODAY : undefined } : item) })); notify(t.done ? "Task reopened." : "Task completed. No time was recorded.", undoFor("tasks", [t.id])); }} /><div className="task-body"><Button variant="ghost" size="sm" className="h-auto whitespace-normal task-title" onClick={() => open({ kind: "task", id: t.id })}>{t.title}</Button><div className="task-meta"><ProjectTag id={t.projectId} />{checkpoint && <><span className="meta-divider">·</span><span className="checkpoint-meta"><Flag size={11} />{checkpoint.title}</span></>}{t.recurrence !== "none" && <Tooltip><TooltipTrigger asChild><span tabIndex={0} className="inline-flex"><Repeat2 size={13} /><span className="sr-only">Recurring Task</span></span></TooltipTrigger><TooltipContent>Recurring Task</TooltipContent></Tooltip>}</div></div>{showDate && <span className={`task-date ${t.date && t.date < TODAY && !t.done ? "overdue-text" : ""}`}>{t.date ? t.date === TODAY ? "Today" : dateLabel(t.date) : "Unscheduled"}</span>}<Button variant="ghost" size="icon-sm" aria-label={`Edit or reschedule ${t.title}`} onClick={() => open({ kind: "task", id: t.id })}><MoreHorizontal size={17} /></Button></div>;
  })}</div>;
}

export function CheckpointList({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const { data, open } = useWorkspace();
  if (!checkpoints.length) return <EmptyState compact title="Room for your next milestone" description="Add a Checkpoint to give your work a direction." />;
  return <div className="checkpoint-list">{[...checkpoints].sort((a, b) => a.date.localeCompare(b.date)).map((c) => {
    const p = data.projects.find((p) => p.id === c.projectId);
    const tasks = data.tasks.filter((t) => t.checkpointId === c.id);
    return <Button variant="ghost" size="sm" className="h-auto whitespace-normal checkpoint-row" key={c.id} onClick={() => open({ kind: "checkpoint", id: c.id })}><span className={`checkpoint-icon ${p?.color}`}><Flag size={16} /></span><span className="checkpoint-body"><strong>{c.title}</strong><span>{p?.name}<span className="meta-divider">·</span>{tasks.filter((t) => t.done).length}/{tasks.length} Tasks</span></span><span className={`checkpoint-date ${c.date < TODAY ? "overdue-text" : ""}`}>{dateLabel(c.date)}<small>{c.date < TODAY ? "Overdue" : c.date === "2026-10-02" ? "Tomorrow" : "Deadline"}</small></span></Button>;
  })}</div>;
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const { open, data } = useWorkspace();
  if (!sessions.length) return <EmptyState compact title="Your effort starts here" description="Start a Session or register time you’ve already spent." />;
  return <div className="session-list">{[...sessions].sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)).map((s) => <Button variant="ghost" size="sm" className="h-auto whitespace-normal session-row" key={s.id} onClick={() => open({ kind: "session-detail", id: s.id })}><span className="session-icon"><Clock3 size={16} /></span><span className="session-body"><strong>{data.projects.find((p) => p.id === s.projectId)?.name}</strong><span>{s.date === TODAY ? "Today" : dateLabel(s.date)}<span className="meta-divider">·</span>{s.start}–{s.end}</span></span><span className="session-duration">{timeLabel(duration(s))}<small>Actual</small></span><ArrowRight size={14} className="muted" /></Button>)}</div>;
}

export function PlannedTasks({ box, compact = false }: { box: Timebox; compact?: boolean }) {
  const { data } = useWorkspace();
  const tasks = box.taskIds.flatMap((id) => {
    const task = data.tasks.find((t) => t.id === id);
    return task ? [task] : [];
  });
  if (!tasks.length) return <span className="timebox-project-time">Project time</span>;
  const visible = compact ? tasks.slice(0, 1) : tasks;
  return <span className="timebox-tasks">{visible.map((task) => <span className="timebox-task" key={task.id}><span aria-hidden="true">{task.done ? <Check size={12} /> : <span className="planned-task-marker" />}</span><span>{task.title}</span></span>)}{compact && tasks.length > 1 && <span className="timebox-task-more">+{tasks.length - 1} more Tasks</span>}</span>;
}

export function TimeboxList({ boxes, trackCurrentTime = false }: { boxes: Timebox[]; trackCurrentTime?: boolean }) {
  const { data, open } = useWorkspace();
  const now = useCurrentTime();
  const current = trackCurrentTime ? now : null;
  const sorted = [...boxes].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  const markerIndex = current ? sorted.findIndex((b) => minutes(b.end) > current.minutes) : -1;
  if (!boxes.length) return <>{current && <div className="timebox-list"><CurrentTimeLine label={clockLabel(current.label)} /></div>}<EmptyState compact title="An open schedule" description="Reserve a little time for a Project that matters." /></>;
  return <div className="timebox-list">{sorted.map((b, index) => {
    const p = data.projects.find((p) => p.id === b.projectId);
    return <div key={b.id} className="timebox-current-row">{current && index === markerIndex && <CurrentTimeLine label={clockLabel(current.label)} top={current.minutes > minutes(b.start) ? `${(current.minutes - minutes(b.start)) / duration(b) * 100}%` : 0} />}<div className="timebox-row"><div className="timebox-time"><strong>{clockLabel(b.start)}</strong><span>{clockLabel(b.end)}</span>{b.date !== TODAY && <small>{dateLabel(b.date)}</small>}</div><Button variant="ghost" size="sm" className={`h-auto whitespace-normal timebox-card ${p?.color}`} onClick={() => open({ kind: "timebox", id: b.id })}><div><strong>{p?.name}</strong><span>{timeLabel(duration(b))}{b.recurrence !== "none" && <Repeat2 size={12} />}</span></div><p>{b.title}</p><PlannedTasks box={b} /><small><span>Planned time</span></small></Button></div></div>;
  })}{current && markerIndex === -1 && <CurrentTimeLine label={clockLabel(current.label)} />}</div>;
}

export function AddTaskButton({ projectId, date = TODAY }: { projectId?: string; date?: string }) { const { open } = useWorkspace(); return <Button variant="outline" onClick={() => open({ kind: "task", projectId, date })}><Plus size={15} />Add Task</Button>; }
export function PeriodBadge() { return <Badge variant="outline" className="period-badge"><CalendarDays size={12} />This week</Badge>; }
export function CompletionNote({ done, total }: { done: number; total: number }) { return <span className="completion-note"><Check size={12} />{done} of {total} completed</span>; }
