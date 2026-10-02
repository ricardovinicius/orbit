"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Flag, FolderClosed, MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TODAY, WEEK_START, addDays, dateLabel, duration, inRange, timeLabel } from "@/lib/mock-data";
import { useWorkspace } from "./workspace";
import { AddTaskButton, CheckpointList, EmptyState, Metric, PageHeading, PeriodBadge, SectionHeading, SessionList, TaskList, TimeboxList } from "./shared";

export function ProjectsScreen() {
  const { data, open } = useWorkspace();
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");
  const projects = data.projects.filter((p) => !!p.archived === archived && p.name.toLowerCase().includes(query.toLowerCase()));
  const end = addDays(WEEK_START, 6);
  return <><PageHeading eyebrow="THE THINGS THAT MATTER" title="Your areas of focus." description="A place for every part of your life you want to give attention to."><Button onClick={() => open({ kind: "project" })}><Plus size={16} />New Project</Button></PageHeading><div className="projects-toolbar"><div className="segmented" aria-label="Project status"><button aria-pressed={!archived} className={!archived ? "selected" : ""} onClick={() => setArchived(false)}>Active<span>{data.projects.filter((p) => !p.archived).length}</span></button><button aria-pressed={archived} className={archived ? "selected" : ""} onClick={() => setArchived(true)}>Archived<span>{data.projects.filter((p) => p.archived).length}</span></button></div><div className="search-input"><Search size={15} /><Input aria-label="Search Projects" placeholder="Find a Project…" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
    {projects.length ? <div className="projects-grid">{projects.map((p) => {
      const tasks = data.tasks.filter((t) => t.projectId === p.id);
      const checkpoint = data.checkpoints.filter((c) => c.projectId === p.id && c.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date))[0];
      const planned = data.timeboxes.filter((b) => b.projectId === p.id && inRange(b.date, WEEK_START, end)).reduce((n, b) => n + duration(b), 0);
      const actual = data.sessions.filter((s) => s.projectId === p.id && inRange(s.date, WEEK_START, end)).reduce((n, s) => n + duration(s), 0);
      return <Card key={p.id} className="project-card"><div className="project-card-top"><span className={`project-emblem ${p.color}`}><FolderClosed size={23} strokeWidth={1.5} /></span><Button variant="ghost" size="icon-sm" aria-label={`Edit ${p.name}`} onClick={() => open({ kind: "project", id: p.id })}><MoreHorizontal /></Button></div><Link className="project-card-title" href={`/projects/${p.id}`}><h2>{p.name}</h2><ArrowUpRight size={18} /></Link><p className="project-description">{p.description || "A new space for meaningful work."}</p><div className="project-task-summary"><span>{tasks.filter((t) => !t.done).length} open Tasks</span><span>{tasks.filter((t) => t.done).length} completed</span></div><div className="project-hours"><div><span><CalendarDays size={12} />Planned</span><strong>{timeLabel(planned)}</strong></div><div><span><Clock3 size={12} />Actual</span><strong>{timeLabel(actual)}</strong></div><small>This week</small></div><div className="project-next"><Flag size={14} /><span>{checkpoint?.title ?? "No upcoming Checkpoint"}</span>{checkpoint && <strong>{dateLabel(checkpoint.date)}</strong>}</div></Card>;
    })}{!archived && !query && <button className="new-project-card" onClick={() => open({ kind: "project" })}><span><Plus size={24} /></span><strong>Make room for something new</strong><p>Add an area you want to focus on.</p></button>}</div> : <Card className="panel"><EmptyState title={query ? "No matching Projects" : archived ? "No archived Projects" : "What matters to you?"} description={query ? "Try a different name." : archived ? "Archived Projects keep their history, without taking up your attention." : "Start with an area of your life you’d like to make time for."}>{!archived && !query && <Button onClick={() => open({ kind: "project" })}><Plus size={15} />Create your first Project</Button>}</EmptyState></Card>}
  </>;
}

export function ProjectScreen({ id }: { id: string }) {
  const { data, open } = useWorkspace();
  const [filter, setFilter] = useState("open");
  const project = data.projects.find((p) => p.id === id);
  if (!project) return <EmptyState title="This Project isn’t in this workspace" description="Choose a Project or create a new area of focus."><Button asChild variant="outline"><Link href="/projects">Back to Projects</Link></Button></EmptyState>;
  const tasks = data.tasks.filter((t) => t.projectId === id);
  const checkpoints = data.checkpoints.filter((c) => c.projectId === id);
  const boxes = data.timeboxes.filter((b) => b.projectId === id);
  const sessions = data.sessions.filter((s) => s.projectId === id);
  const end = addDays(WEEK_START, 6);
  const planned = boxes.filter((b) => inRange(b.date, WEEK_START, end)).reduce((n, b) => n + duration(b), 0);
  const actual = sessions.filter((s) => inRange(s.date, WEEK_START, end)).reduce((n, s) => n + duration(s), 0);
  const filtered = tasks.filter((t) => filter === "all" || (filter === "completed" ? t.done : !t.done));
  return <><Link href="/projects" className="back-link"><ArrowLeft size={14} />All Projects</Link><div className="project-heading"><span className={`project-emblem large ${project.color}`}><FolderClosed size={29} strokeWidth={1.4} /></span><PageHeading title={project.name} description={project.description || "Make space for this part of your life."}><Badge variant="outline">{project.archived ? "Archived" : "Active"}</Badge><Button variant="outline" onClick={() => open({ kind: "project", id })}>Edit Project</Button><AddTaskButton projectId={id} /></PageHeading></div>
    <div className="section-heading period-heading"><h2>A little perspective</h2><PeriodBadge /></div><div className="metrics-grid"><Metric label="Planned time" value={timeLabel(planned)} note="Time you intended to dedicate" icon={<CalendarDays size={18} />} /><Metric label="Actual time" value={timeLabel(actual)} note="Time you actually invested" icon={<Clock3 size={18} />} accent /><Metric label="Completed Tasks" value={tasks.filter((t) => t.done && t.completedDate && inRange(t.completedDate, WEEK_START, end)).length} note="Meaningful steps forward this week" icon={<Flag size={18} />} /></div>
    <div className="project-detail-grid"><div className="main-column"><Card className="panel"><SectionHeading title="Tasks" count={tasks.length}><div className="segmented small">{["open", "completed", "all"].map((f) => <button key={f} className={filter === f ? "selected" : ""} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div></SectionHeading>{filtered.length ? [...checkpoints.map((c) => ({ id: c.id, title: c.title })), { id: "", title: "No Checkpoint" }].filter((c) => filtered.some((t) => t.checkpointId === c.id)).map((c) => <div key={c.id} className="task-group"><div className="task-group-title"><Flag size={13} />{c.title}<Button variant="ghost" size="icon-xs" aria-label={`Add Task to ${c.title}`} onClick={() => open({ kind: "task", projectId: id, checkpointId: c.id })}><Plus /></Button></div><TaskList tasks={filtered.filter((t) => t.checkpointId === c.id)} showDate /></div>) : <EmptyState compact title={filter === "completed" ? "Progress will show up here" : "Space for your next step"} description="Add a Task or choose another filter." />}</Card><Card className="panel"><SectionHeading title="Recent Sessions"><Button variant="ghost" size="sm" onClick={() => open({ kind: "session", projectId: id })}><Plus />Register Session</Button></SectionHeading><SessionList sessions={[...sessions].sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)).slice(0, 4)} /><div className="panel-footer-actions"><Button variant="outline" onClick={() => open({ kind: "start", projectId: id })}>Start Session</Button></div></Card></div><div className="right-column"><Card className="panel"><SectionHeading title="Checkpoints"><Button variant="ghost" size="icon-sm" aria-label="Add Checkpoint" onClick={() => open({ kind: "checkpoint", projectId: id })}><Plus /></Button></SectionHeading><CheckpointList checkpoints={checkpoints} /></Card><Card className="panel"><SectionHeading title="Time ahead"><Button variant="ghost" size="icon-sm" aria-label="Plan Timebox" onClick={() => open({ kind: "timebox", projectId: id })}><Plus /></Button></SectionHeading><TimeboxList boxes={boxes.filter((b) => b.date >= TODAY).slice(0, 3)} /><Button asChild variant="ghost" className="panel-link"><Link href="/week">Open weekly planner<ArrowUpRight size={14} /></Link></Button></Card></div></div>
  </>;
}
