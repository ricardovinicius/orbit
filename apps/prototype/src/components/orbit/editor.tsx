"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Archive, CalendarDays, Check, Clock3, Flag, FolderClosed, Play, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TODAY, addDays, colors, dateLabel, duration, minutes, recurrenceLabels, timeLabel, type Recurrence } from "@/lib/mock-data";
import { useWorkspace } from "./workspace";

export type EditorRequest = { kind: "project" | "checkpoint" | "task" | "timebox" | "start" | "stop" | "session" | "session-detail"; id?: string; projectId?: string; date?: string; start?: string; taskIds?: string[]; checkpointId?: string };
export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) { return <div className="form-field"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>; }

export function Editor({ request, close }: { request: EditorRequest; close: () => void }) {
  const { data, setData, active, setActive, notify, open } = useWorkspace();
  const { kind, id } = request;
  const project = kind === "project" ? data.projects.find((p) => p.id === id) : undefined;
  const task = kind === "task" ? data.tasks.find((t) => t.id === id) : undefined;
  const checkpoint = kind === "checkpoint" ? data.checkpoints.find((c) => c.id === id) : undefined;
  const box = kind === "timebox" ? data.timeboxes.find((b) => b.id === id) : undefined;
  const session = kind === "session-detail" || kind === "session" ? data.sessions.find((s) => s.id === id) : undefined;
  const existing = task ?? checkpoint ?? box ?? session;
  const [projectId, setProjectId] = useState(existing?.projectId ?? request.projectId ?? (kind === "stop" ? active?.projectId : undefined) ?? data.projects.find((p) => !p.archived)?.id ?? "");
  const [title, setTitle] = useState(project?.name ?? task?.title ?? checkpoint?.title ?? box?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [color, setColor] = useState(project?.color ?? "sage");
  const [date, setDate] = useState(existing?.date ?? (kind === "stop" ? active?.date : request.date) ?? TODAY);
  const [start, setStart] = useState(box?.start ?? session?.start ?? (kind === "stop" ? active?.start : request.start) ?? "15:00");
  const suggestedEnd = request.start ? Math.min(minutes(request.start) + 60, 1439) : 960;
  const [end, setEnd] = useState(box?.end ?? session?.end ?? (kind === "stop" ? "15:25" : `${String(Math.floor(suggestedEnd / 60)).padStart(2, "0")}:${String(suggestedEnd % 60).padStart(2, "0")}`));
  const [checkpointId, setCheckpointId] = useState(task?.checkpointId ?? request.checkpointId ?? "");
  const [taskIds, setTaskIds] = useState<string[]>(box?.taskIds ?? session?.taskIds ?? (kind === "stop" ? active?.taskIds : request.taskIds) ?? []);
  const [recurrence, setRecurrence] = useState<Recurrence>(task?.recurrence ?? box?.recurrence ?? "none");
  const [scope, setScope] = useState("one");
  const [error, setError] = useState("");
  const [projectNotice, setProjectNotice] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const hasTitle = ["project", "checkpoint", "task", "timebox"].includes(kind);
  const hasTimes = ["timebox", "session", "stop"].includes(kind);
  const hasTasks = ["timebox", "session", "start", "stop"].includes(kind);
  const repeats = kind === "task" || kind === "timebox";
  const labels = { project: project ? "Edit Project" : "A new area of focus", checkpoint: checkpoint ? "Edit Checkpoint" : "Set a Checkpoint", task: task ? "Task details" : "Add a Task", timebox: box ? "Timebox details" : "Make time for what matters", start: "Start a Session", stop: "A little progress, recorded", session: session ? "Edit Session" : "Register a Session", "session-detail": "Session details" };
  const icons = { project: FolderClosed, checkpoint: Flag, task: Check, timebox: CalendarDays, start: Play, stop: Clock3, session: Clock3, "session-detail": Clock3 };
  const Icon = icons[kind];
  const overlap = kind === "timebox" && data.timeboxes.some((b) => b.id !== id && b.date === date && minutes(start) < minutes(b.end) && minutes(end) > minutes(b.start));

  function changeProject(value: string) { setProjectId(value); setTaskIds([]); setCheckpointId(""); setProjectNotice(true); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasTitle && !title.trim()) { setError("Please enter a name before saving."); return; }
    if (kind !== "project" && !projectId) { setError("Choose a Project to continue."); return; }
    if (hasTimes && minutes(end) <= minutes(start)) { setError("End time must be after start time. Use separate entries for work across midnight."); return; }
    if ((kind === "session" || kind === "stop") && date > TODAY) { setError("Actual activity cannot be recorded in the future."); return; }
    if (repeats && recurrence !== "none" && !date) { setError("Choose a first day for this recurring item."); return; }
    if (kind === "start") {
      if (active) { setError("Finish your active Session before starting another."); return; }
      setActive({ projectId, date: TODAY, start: "15:00", taskIds });
      notify("Session started. The demo timer shows a prepared 25-minute state."); close(); return;
    }
    const nextId = id ?? `${kind}-${crypto.randomUUID()}`;
    if (kind === "project") setData((d) => ({ ...d, projects: project ? d.projects.map((p) => p.id === id ? { ...p, name: title.trim(), description, color } : p) : [...d.projects, { id: nextId, name: title.trim(), description, color }] }));
    if (kind === "checkpoint") setData((d) => ({ ...d, checkpoints: checkpoint ? d.checkpoints.map((c) => c.id === id ? { ...c, title: title.trim(), date } : c) : [...d.checkpoints, { id: nextId, projectId, title: title.trim(), date }] }));
    if (kind === "task") setData((d) => {
      const next = { id: nextId, projectId, title: title.trim(), date, checkpointId, done: task?.done ?? false, completedDate: task?.completedDate, recurrence, seriesId: task?.seriesId ?? (recurrence !== "none" ? nextId : undefined) };
      return { ...d, tasks: task ? d.tasks.map((t) => t.id === id ? next : scope === "series" && task.seriesId && t.seriesId === task.seriesId ? { ...t, title: next.title, projectId, checkpointId, recurrence } : t) : [...d.tasks, next] };
    });
    if (kind === "timebox") setData((d) => {
      const next = { id: nextId, projectId, title: title.trim(), date, start, end, taskIds, recurrence, seriesId: box?.seriesId ?? (recurrence !== "none" ? nextId : undefined) };
      return { ...d, timeboxes: box ? d.timeboxes.map((b) => b.id === id ? next : scope === "series" && box.seriesId && b.seriesId === box.seriesId ? { ...b, projectId, title: next.title, start, end, taskIds, recurrence } : b) : [...d.timeboxes, next] };
    });
    if (kind === "session" || kind === "stop") {
      setData((d) => ({ ...d, sessions: session ? d.sessions.map((item) => item.id === id ? { ...item, projectId, date, start, end, taskIds } : item) : [...d.sessions, { id: nextId, projectId, date, start, end, taskIds, source: kind === "stop" ? "Timer" : "Manual" }] }));
      if (kind === "stop") setActive(null);
    }
    notify(kind === "stop" || kind === "session" ? `${session ? "Session updated. " : ""}${timeLabel(duration({ start, end }))} of actual time recorded.` : `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${id ? "updated" : "created"}.`);
    close();
  }

  if (session && kind === "session-detail") return <DialogContent className="editor-dialog"><DialogHeader><div className="dialog-symbol"><Clock3 size={22} /></div><DialogTitle>Session details</DialogTitle><DialogDescription>Actual time dedicated to {data.projects.find((p) => p.id === session.projectId)?.name}.</DialogDescription></DialogHeader><div className="session-detail-duration">{timeLabel(duration(session))}<span>Actual time</span></div><dl className="detail-list"><div><dt>Date</dt><dd>{dateLabel(session.date, { month: "long", day: "numeric", year: "numeric" })}</dd></div><div><dt>Time</dt><dd>{session.start}–{session.end}</dd></div><div><dt>Recorded with</dt><dd>{session.source}</dd></div></dl><h3>Associated Tasks</h3>{session.taskIds.length ? <ul className="linked-tasks">{session.taskIds.map((tid) => <li key={tid}>{data.tasks.find((t) => t.id === tid)?.title ?? "Task"}</li>)}</ul> : <p className="muted">No Tasks associated. This time still counts.</p>}<div className="form-actions"><Button variant="outline" onClick={close}>Done</Button><Button onClick={() => open({ kind: "session", id: session.id })}>Edit Session</Button></div></DialogContent>;

  return <DialogContent className="editor-dialog"><DialogHeader><div className="dialog-symbol"><Icon size={22} /></div><DialogTitle>{labels[kind]}</DialogTitle><DialogDescription>{kind === "timebox" ? "A Timebox is an intention. Record actual work separately as a Session." : kind === "stop" ? "Review the actual interval. Your planned time and Tasks stay unchanged." : kind === "start" ? "Give your attention to one Project. Tasks are optional." : kind === "session" ? "Capture work you already did, whether or not it was planned." : "Keep it simple. You can always adjust this later."}</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="editor-form">
      {kind !== "project" && <Field label="Project" htmlFor="project"><select id="project" value={projectId} required disabled={!!checkpoint} onChange={(e) => changeProject(e.target.value)}><option value="" disabled>Choose a Project</option>{data.projects.filter((p) => !p.archived || p.id === projectId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{projectNotice && <p className="field-hint">Task and Checkpoint selections were cleared for this Project.</p>}{!data.projects.length && <Button type="button" variant="link" onClick={() => open({ kind: "project" })}>Create your first Project</Button>}</Field>}
      {hasTitle && <Field label={kind === "project" ? "Project name" : kind === "task" ? "What needs to happen?" : kind === "checkpoint" ? "Checkpoint name" : "Timebox name"} htmlFor="title"><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "project" ? "e.g. Research" : kind === "task" ? "e.g. Read the next chapter" : kind === "checkpoint" ? "e.g. Paper submission" : "e.g. Deep work"} required maxLength={120} /></Field>}
      {kind === "project" && <><Field label="Description (optional)" htmlFor="description"><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this area mean to you?" rows={3} /></Field><fieldset className="form-field"><legend>Project color</legend><div className="color-options">{colors.map((c) => <button key={c} type="button" aria-label={c} aria-pressed={color === c} className={`color-option ${c} ${color === c ? "chosen" : ""}`} onClick={() => setColor(c)}>{color === c && <Check size={17} />}</button>)}</div></fieldset></>}
      {kind === "task" && <Field label="Checkpoint (optional)" htmlFor="checkpoint"><select id="checkpoint" value={checkpointId} onChange={(e) => setCheckpointId(e.target.value)}><option value="">No Checkpoint</option>{data.checkpoints.filter((c) => c.projectId === projectId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>}
      {kind !== "project" && kind !== "start" && <Field label={kind === "checkpoint" ? "Deadline" : kind === "task" ? "Assigned day (optional)" : "Date"} htmlFor="date"><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required={kind !== "task"} max={kind === "session" || kind === "stop" ? TODAY : undefined} />{kind === "task" && <p className="field-hint">Assigning a day doesn’t reserve time on your calendar.</p>}</Field>}
      {hasTimes && <div className="form-columns"><Field label="Start time" htmlFor="start"><Input id="start" type="time" value={start} required onChange={(e) => setStart(e.target.value)} /></Field><Field label="End time" htmlFor="end"><Input id="end" type="time" value={end} required onChange={(e) => setEnd(e.target.value)} /></Field></div>}
      {overlap && <p className="form-advisory">This overlaps another Timebox. You can keep both or adjust the time.</p>}
      {hasTasks && <fieldset className="form-field"><legend>Tasks (optional)</legend><div className="task-options">{data.tasks.filter((t) => t.projectId === projectId).map((t) => <label key={t.id} htmlFor={`pick-${t.id}`}><Checkbox id={`pick-${t.id}`} checked={taskIds.includes(t.id)} onCheckedChange={(checked) => setTaskIds((ids) => checked ? [...ids, t.id] : ids.filter((v) => v !== t.id))} /><span>{t.title}{t.done && <small>Completed</small>}</span></label>)}{!data.tasks.some((t) => t.projectId === projectId) && <p className="muted">No Tasks yet. You can record time for the Project itself.</p>}</div></fieldset>}
      {repeats && <><Field label="Repeat" htmlFor="recurrence"><select id="recurrence" value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>{Object.entries(recurrenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>{recurrence !== "none" && <div className="recurrence-preview"><Repeat2 size={15} /><div>{recurrenceLabels[recurrence]}{date ? `, starting ${dateLabel(date)}` : ""}<small>{date ? `Next: ${dateLabel(addDays(date, recurrence === "weekly" ? 7 : recurrence === "weekdays" && new Date(`${date}T12:00:00Z`).getUTCDay() === 5 ? 3 : 1))}. ` : ""}Repeating dates are previewed; new occurrences are not generated in this prototype.</small></div></div>}{id && (task?.recurrence !== "none" && !!task || box?.recurrence !== "none" && !!box) && <Field label="Apply changes to" htmlFor="scope"><select id="scope" value={scope} onChange={(e) => setScope(e.target.value)}><option value="one">Only this occurrence</option><option value="series">All existing occurrences in this series</option></select>{scope === "series" && <p className="field-hint">Shared details update across existing occurrences. Moving this date only reschedules this occurrence.</p>}</Field>}</>}
      {checkpoint && <div className="form-field"><h3>Associated Tasks</h3><ul className="linked-tasks">{data.tasks.filter((t) => t.checkpointId === id).map((t) => <li key={t.id}>{t.done ? "✓ " : "○ "}{t.title}</li>)}</ul>{!data.tasks.some((t) => t.checkpointId === id) && <p className="muted">No Tasks associated yet.</p>}</div>}
      {kind === "start" && active && <p className="form-advisory">You already have a Session in progress. Stop and save it first.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={kind === "start" && !!active}>{kind === "start" ? <><Play size={14} />Start Session</> : kind === "stop" ? "Save Session" : id ? "Save changes" : `Create ${kind === "session" ? "Session" : kind === "timebox" ? "Timebox" : kind === "task" ? "Task" : kind === "project" ? "Project" : "Checkpoint"}`}</Button></div>
      {box && <Button type="button" className="w-full" variant="secondary" onClick={() => open({ kind: "start", projectId: box.projectId, taskIds: box.taskIds })}><Play size={14} />Start a Session for this Timebox</Button>}
      {task && <Button type="button" variant="secondary" className="w-full" onClick={() => { setData((d) => ({ ...d, tasks: d.tasks.map((t) => t.id === task.id ? { ...t, done: !t.done, completedDate: !t.done ? TODAY : undefined } : t) })); notify(task.done ? "Task reopened." : "Task completed. No time was recorded."); close(); }}>{task.done ? "Reopen Task" : "Mark Task complete"}</Button>}
      {project && <div className="archive-control">{archiveConfirm ? <><p>Archive this Project? Its Tasks and recorded activity will remain available.</p><Button type="button" variant="destructive" onClick={() => { setData((d) => ({ ...d, projects: d.projects.map((p) => p.id === id ? { ...p, archived: true } : p) })); notify("Project archived. Your history is preserved."); close(); }}>Archive Project</Button><Button type="button" variant="ghost" onClick={() => setArchiveConfirm(false)}>Keep active</Button></> : <Button type="button" variant="ghost" onClick={() => { if (project.archived) { setData((d) => ({ ...d, projects: d.projects.map((p) => p.id === id ? { ...p, archived: false } : p) })); notify("Project reactivated."); close(); } else setArchiveConfirm(true); }}><Archive size={14} />{project.archived ? "Reactivate Project" : "Archive Project"}</Button>}</div>}
    </form>
  </DialogContent>;
}
