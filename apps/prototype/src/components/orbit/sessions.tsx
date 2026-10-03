"use client";

import { useRef, useState } from "react";
import { CalendarDays, Clock3, FolderClosed, History, Pencil, Play, Plus, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TODAY, WEEK_START, addDays, dateLabel, duration, timeLabel, type Session } from "@/lib/mock-data";
import { PageHeading, ProjectTag } from "./shared";
import { useWorkspace } from "./workspace";

export function SessionsScreen() {
  const { data, setData, active, open, notify } = useWorkspace();
  const [project, setProject] = useState("all");
  const [period, setPeriod] = useState("week");
  const [from, setFrom] = useState(WEEK_START);
  const [to, setTo] = useState(TODAY);
  const [visibleDays, setVisibleDays] = useState(7);
  const [deleting, setDeleting] = useState<Session | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const deleted = useRef(false);
  const historyHeading = useRef<HTMLHeadingElement | null>(null);
  const rangeError = !from || !to ? "Choose both dates to filter Sessions." : from > to ? "End date must be on or after start date." : "";
  const invalidRange = period === "custom" && !!rangeError;
  const sessions = data.sessions
    .filter((session) => !invalidRange && (project === "all" || session.projectId === project) && (period === "all" || session.date >= from && session.date <= to))
    .sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`));
  const groups = new Map<string, Session[]>();
  for (const session of sessions) groups.set(session.date, [...(groups.get(session.date) ?? []), session]);
  const days = [...groups.entries()];
  const total = sessions.reduce((sum, session) => sum + duration(session), 0);
  const projectCount = new Set(sessions.map((session) => session.projectId)).size;
  const hasProjects = data.projects.some((p) => !p.archived);

  function changePeriod(value: string) {
    setPeriod(value);
    setVisibleDays(7);
    if (value === "week") { setFrom(WEEK_START); setTo(TODAY); }
    if (value === "month") { setFrom(addDays(TODAY, -29)); setTo(TODAY); }
  }

  function clearFilters() {
    setProject("all");
    changePeriod("all");
  }

  function logSession() {
    open({ kind: "session", projectId: project === "all" ? undefined : project });
  }

  return <>
    <PageHeading title="Sessions">
      <Button variant="outline" disabled={!!active || !hasProjects} onClick={() => open({ kind: "start", projectId: project === "all" ? undefined : project })}><Play data-icon="inline-start" />{active ? "Session in progress" : "Start Session"}</Button>
      <Button onClick={hasProjects ? logSession : () => open({ kind: "project" })}><Plus data-icon="inline-start" />{hasProjects ? "Log Session" : "Create Project"}</Button>
    </PageHeading>

    <section aria-label="Session filters" className="sessions-filters">
      <FieldGroup className="sessions-filter-fields">
        <Field>
          <FieldLabel htmlFor="sessions-project">Project</FieldLabel>
          <Select value={project} onValueChange={(value) => { setProject(value); setVisibleDays(7); }}>
            <SelectTrigger id="sessions-project"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="all">All Projects</SelectItem>{data.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}{p.archived ? " (archived)" : ""}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="sessions-period">Period</FieldLabel>
          <Select value={period} onValueChange={changePeriod}>
            <SelectTrigger id="sessions-period"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="week">This week</SelectItem><SelectItem value="month">Last 30 days</SelectItem><SelectItem value="all">All time</SelectItem><SelectItem value="custom">Custom dates</SelectItem></SelectGroup></SelectContent>
          </Select>
        </Field>
        {period === "custom" && <>
          <Field data-invalid={invalidRange}>
            <FieldLabel htmlFor="sessions-from">From</FieldLabel>
            <Input id="sessions-from" type="date" value={from} aria-invalid={invalidRange} aria-describedby={invalidRange ? "sessions-range-error" : undefined} onChange={(event) => { setFrom(event.target.value); setVisibleDays(7); }} />
          </Field>
          <Field data-invalid={invalidRange}>
            <FieldLabel htmlFor="sessions-to">To</FieldLabel>
            <Input id="sessions-to" type="date" value={to} aria-invalid={invalidRange} aria-describedby={invalidRange ? "sessions-range-error" : undefined} onChange={(event) => { setTo(event.target.value); setVisibleDays(7); }} />
          </Field>
        </>}
      </FieldGroup>
      <Button variant="ghost" onClick={clearFilters} disabled={project === "all" && period === "all"}>Clear filters</Button>
    </section>
    {invalidRange && <FieldError id="sessions-range-error">{rangeError}</FieldError>}

    <div className="sessions-summary" aria-label="Filtered Session totals">
      {[
        { label: "Recorded time", value: invalidRange ? "—" : timeLabel(total), note: "Actual time in this selection", icon: Clock3 },
        { label: "Sessions", value: invalidRange ? "—" : sessions.length, note: `${days.length} ${days.length === 1 ? "day" : "days"} with recorded activity`, icon: CalendarDays },
        { label: "Projects", value: invalidRange ? "—" : projectCount, note: "Areas you made time for", icon: FolderClosed },
      ].map(({ label, value, note, icon: Icon }) => <Card key={label}>
        <CardHeader><CardDescription>{label}</CardDescription><CardAction><Icon size={17} className="muted" /></CardAction></CardHeader>
        <CardContent><p className="sessions-stat">{value}</p><p className="sessions-stat-note">{note}</p></CardContent>
      </Card>)}
    </div>

    <section aria-labelledby="sessions-history-title">
      <div className="sessions-history-heading">
        <div><h2 id="sessions-history-title" ref={historyHeading} tabIndex={-1}>Session history</h2><p>{invalidRange ? "Choose a valid date range to see your history." : period === "all" ? "All recorded activity · newest first" : `${dateLabel(from, { month: "short", day: "numeric", year: "numeric" })} – ${dateLabel(to, { month: "short", day: "numeric", year: "numeric" })} · newest first`}</p></div>
        <span role="status" className="sessions-result-count">{invalidRange ? "Invalid date range" : `${sessions.length} ${sessions.length === 1 ? "Session" : "Sessions"}`}</span>
      </div>
      <div className="sessions-history">
        {days.slice(0, visibleDays).map(([date, entries]) => <section key={date} className="sessions-day" aria-labelledby={`sessions-day-${date}`}>
          <h3 id={`sessions-day-${date}`} className="sessions-day-heading">{date === TODAY ? "Today" : date === addDays(TODAY, -1) ? "Yesterday" : dateLabel(date, { month: "short", day: "numeric", year: "numeric" })}</h3>
          <ol className="sessions-timeline">
            {entries.map((session) => {
              const name = data.projects.find((p) => p.id === session.projectId)?.name ?? "Project";
              const label = `${name}, ${dateLabel(date)}, ${session.start}`;
              const tasks = session.taskIds.map((id) => data.tasks.find((task) => task.id === id)?.title ?? "Task");
              return <li key={session.id} className="sessions-entry">
                <span className="sessions-timeline-icon" aria-hidden="true"><Timer size={14} /></span>
                <div className="sessions-entry-body">
                  <div className="sessions-entry-top">
                    <button className="sessions-detail-link" aria-label={`View Session: ${label}`} onClick={() => open({ kind: "session-detail", id: session.id })}>{session.start} – {session.end}</button>
                    <span className="sessions-entry-duration">{timeLabel(duration(session))}</span>
                  </div>
                  {tasks.length > 0 && <p className="sessions-task-names">{tasks.join(" · ")}</p>}
                  <div className="sessions-entry-project"><ProjectTag id={session.projectId} /></div>
                </div>
                <div className="sessions-row-actions">
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit Session: ${label}`} title="Edit Session" onClick={() => open({ kind: "session", id: session.id })}><Pencil /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete Session: ${label}`} title="Delete Session" onClick={(event) => { deleted.current = false; deleteTrigger.current = event.currentTarget; setDeleting(session); }}><Trash2 /></Button>
                </div>
              </li>;
            })}
          </ol>
        </section>)}
        {!days.length && <Card><CardContent>
          <Empty className="py-12"><EmptyHeader><EmptyMedia variant="icon"><History /></EmptyMedia><EmptyTitle>{invalidRange ? "Check your date range" : data.sessions.length ? "No Sessions match these filters" : "Your effort starts here"}</EmptyTitle><EmptyDescription>{invalidRange ? "Choose a start date that is on or before the end date." : data.sessions.length ? "Try another Project or a wider date range to find your recorded time." : "Log time you’ve already spent, or start a Session when you’re ready."}</EmptyDescription></EmptyHeader><EmptyContent>
            {data.sessions.length || invalidRange ? <Button variant="outline" onClick={clearFilters}>Show all Sessions</Button> : <Button onClick={hasProjects ? logSession : () => open({ kind: "project" })}><Plus data-icon="inline-start" />{hasProjects ? "Log your first Session" : "Create your first Project"}</Button>}
          </EmptyContent></Empty>
        </CardContent></Card>}
      </div>
      {days.length > visibleDays && <div className="sessions-load-more"><Button variant="outline" onClick={() => setVisibleDays((count) => count + 7)}>Show older Sessions</Button><p>Showing {visibleDays} of {days.length} days. Totals include all matching Sessions.</p></div>}
    </section>

    <AlertDialog open={!!deleting} onOpenChange={(value) => { if (!value) setDeleting(null); }}>
      <AlertDialogContent onCloseAutoFocus={(event) => { event.preventDefault(); if (deleted.current) historyHeading.current?.focus(); else deleteTrigger.current?.focus(); }}>
        <AlertDialogHeader><AlertDialogTitle>Delete this Session?</AlertDialogTitle><AlertDialogDescription>{deleting && <>{data.projects.find((p) => p.id === deleting.projectId)?.name} · {dateLabel(deleting.date)} · {deleting.start}–{deleting.end}. This removes {timeLabel(duration(deleting))} from your recorded time. Your Tasks and planned Timeboxes stay unchanged.</>}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Keep Session</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => {
          if (!deleting) return;
          setData((current) => ({ ...current, sessions: current.sessions.filter((session) => session.id !== deleting.id) }));
          deleted.current = true;
          notify("Session deleted. Recorded time has been updated.");
        }}>Delete Session</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
