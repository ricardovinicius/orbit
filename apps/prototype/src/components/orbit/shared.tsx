"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Check, Clock3, Flag, FolderClosed, MoreHorizontal, Plus, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TODAY, dateLabel, duration, timeLabel, type Checkpoint, type Session, type Task, type Timebox } from "@/lib/mock-data";
import { useWorkspace } from "./workspace";

export function PageHeading({ title, children }: { title: string; children?: ReactNode }) { return <div className="page-heading"><h1>{title}</h1>{children && <div className="heading-actions">{children}</div>}</div>; }
export function SectionHeading({ title, count, children }: { title: string; count?: number; children?: ReactNode }) { return <div className="section-heading"><h2>{title}{count !== undefined && <span className="count-pill">{count}</span>}</h2><div>{children}</div></div>; }
export function ProjectTag({ id, link = true }: { id: string; link?: boolean }) { const { data } = useWorkspace(); const project = data.projects.find((p) => p.id === id); if (!project) return null; const content = <><span className={`project-dot ${project.color}`} />{project.name}</>; return link ? <Link href={`/projects/${id}`} className="project-tag">{content}</Link> : <span className="project-tag">{content}</span>; }
export function EmptyState({ title, description, children, compact = false }: { title: string; description: string; children?: ReactNode; compact?: boolean }) { return <div className={`empty-state ${compact ? "compact" : ""}`}><div className="empty-icon"><FolderClosed size={23} strokeWidth={1.4} /></div><h3>{title}</h3><p>{description}</p>{children}</div>; }
export function Metric({ icon, label, value, note, accent }: { icon: ReactNode; label: string; value: ReactNode; note: ReactNode; accent?: boolean }) { return <Card className={`metric ${accent ? "metric-accent" : ""}`}><div className="metric-top"><span>{label}</span>{icon}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></Card>; }

export function TaskList({ tasks, showDate = false, emptyText = "A little breathing room." }: { tasks: Task[]; showDate?: boolean; emptyText?: string }) {
  const { data, setData, open, notify } = useWorkspace();
  if (!tasks.length) return <EmptyState compact title={emptyText} description="Add a Task when you’re ready to take the next step." />;
  return <div className="task-list">{tasks.map((t) => {
    const checkpoint = data.checkpoints.find((c) => c.id === t.checkpointId);
    return <div key={t.id} className={`task-row ${t.done ? "task-done" : ""}`}><Checkbox checked={t.done} aria-label={`${t.done ? "Reopen" : "Complete"} ${t.title}`} onCheckedChange={() => { setData((d) => ({ ...d, tasks: d.tasks.map((item) => item.id === t.id ? { ...item, done: !item.done, completedDate: !item.done ? TODAY : undefined } : item) })); notify(t.done ? "Task reopened." : "Task completed. No time was recorded."); }} /><div className="task-body"><button className="task-title" onClick={() => open({ kind: "task", id: t.id })}>{t.title}</button><div className="task-meta"><ProjectTag id={t.projectId} />{checkpoint && <><span className="meta-divider">·</span><span className="checkpoint-meta"><Flag size={11} />{checkpoint.title}</span></>}{t.recurrence !== "none" && <Tooltip><TooltipTrigger asChild><span tabIndex={0} className="inline-flex"><Repeat2 size={13} /><span className="sr-only">Recurring Task</span></span></TooltipTrigger><TooltipContent>Recurring Task</TooltipContent></Tooltip>}</div></div>{showDate && <span className={`task-date ${t.date && t.date < TODAY && !t.done ? "overdue-text" : ""}`}>{t.date ? t.date === TODAY ? "Today" : dateLabel(t.date) : "Unscheduled"}</span>}<Button variant="ghost" size="icon-sm" aria-label={`Edit or reschedule ${t.title}`} onClick={() => open({ kind: "task", id: t.id })}><MoreHorizontal size={17} /></Button></div>;
  })}</div>;
}

export function CheckpointList({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const { data, open } = useWorkspace();
  if (!checkpoints.length) return <EmptyState compact title="Room for your next milestone" description="Add a Checkpoint to give your work a direction." />;
  return <div className="checkpoint-list">{[...checkpoints].sort((a, b) => a.date.localeCompare(b.date)).map((c) => {
    const p = data.projects.find((p) => p.id === c.projectId);
    const tasks = data.tasks.filter((t) => t.checkpointId === c.id);
    return <button className="checkpoint-row" key={c.id} onClick={() => open({ kind: "checkpoint", id: c.id })}><span className={`checkpoint-icon ${p?.color}`}><Flag size={16} /></span><span className="checkpoint-body"><strong>{c.title}</strong><span>{p?.name}<span className="meta-divider">·</span>{tasks.filter((t) => t.done).length}/{tasks.length} Tasks</span></span><span className={`checkpoint-date ${c.date < TODAY ? "overdue-text" : ""}`}>{dateLabel(c.date)}<small>{c.date < TODAY ? "Overdue" : c.date === "2026-10-02" ? "Tomorrow" : "Deadline"}</small></span></button>;
  })}</div>;
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const { open, data } = useWorkspace();
  if (!sessions.length) return <EmptyState compact title="Your effort starts here" description="Start a Session or register time you’ve already spent." />;
  return <div className="session-list">{[...sessions].sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)).map((s) => <button className="session-row" key={s.id} onClick={() => open({ kind: "session-detail", id: s.id })}><span className="session-icon"><Clock3 size={16} /></span><span className="session-body"><strong>{data.projects.find((p) => p.id === s.projectId)?.name}</strong><span>{s.date === TODAY ? "Today" : dateLabel(s.date)}<span className="meta-divider">·</span>{s.start}–{s.end}</span></span><span className="session-duration">{timeLabel(duration(s))}<small>Actual</small></span><ArrowRight size={14} className="muted" /></button>)}</div>;
}

export function TimeboxList({ boxes }: { boxes: Timebox[] }) {
  const { data, open } = useWorkspace();
  if (!boxes.length) return <EmptyState compact title="An open schedule" description="Reserve a little time for a Project that matters." />;
  return <div className="timebox-list">{[...boxes].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).map((b) => {
    const p = data.projects.find((p) => p.id === b.projectId);
    return <div key={b.id} className="timebox-row"><div className="timebox-time"><strong>{b.start}</strong><span>{b.end}</span>{b.date !== TODAY && <small>{dateLabel(b.date)}</small>}</div><button className={`timebox-card ${p?.color}`} onClick={() => open({ kind: "timebox", id: b.id })}><div><strong>{p?.name}</strong><span>{timeLabel(duration(b))}{b.recurrence !== "none" && <Repeat2 size={12} />}</span></div><p>{b.title}</p><small>{b.taskIds.length ? `${b.taskIds.length} ${b.taskIds.length === 1 ? "Task" : "Tasks"}` : "Project time"}<span>Planned</span></small></button></div>;
  })}</div>;
}

export function AddTaskButton({ projectId, date = TODAY }: { projectId?: string; date?: string }) { const { open } = useWorkspace(); return <Button variant="outline" onClick={() => open({ kind: "task", projectId, date })}><Plus size={15} />Add Task</Button>; }
export function PeriodBadge() { return <Badge variant="outline" className="period-badge"><CalendarDays size={12} />This week</Badge>; }
export function CompletionNote({ done, total }: { done: number; total: number }) { return <span className="completion-note"><Check size={12} />{done} of {total} completed</span>; }
