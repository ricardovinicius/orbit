export const TODAY = "2026-10-01";
export const WEEK_START = "2026-09-28";
export type Recurrence = "none" | "daily" | "weekdays" | "weekly";
export type Project = { id: string; name: string; description: string; color: string; archived?: boolean };
export type Checkpoint = { id: string; projectId: string; title: string; date: string };
export type Task = { id: string; projectId: string; title: string; checkpointId: string; date: string; done: boolean; completedDate?: string; recurrence: Recurrence; seriesId?: string };
export type Timebox = { id: string; projectId: string; title: string; date: string; start: string; end: string; taskIds: string[]; recurrence: Recurrence; seriesId?: string };
export type Session = { id: string; projectId: string; date: string; start: string; end: string; taskIds: string[]; source: "Timer" | "Manual" };
export type Dataset = { projects: Project[]; checkpoints: Checkpoint[]; tasks: Task[]; timeboxes: Timebox[]; sessions: Session[] };
export const colors = ["sage", "violet", "blue", "amber", "rose"];
export function addDays(date: string, count: number) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0, 10); }
export function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) { return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { ...options, timeZone: "UTC" }); }
export function minutes(time: string) { const [h, m] = time.split(":").map(Number); return h * 60 + m; }
export function duration(item: { start: string; end: string }) { return Math.max(0, minutes(item.end) - minutes(item.start)); }
export function timeLabel(total: number) { const h = Math.floor(total / 60); const m = total % 60; return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`; }
export function inRange(date: string, start: string, end: string) { return date >= start && date <= end; }
export const recurrenceLabels: Record<Recurrence, string> = { none: "Does not repeat", daily: "Every day", weekdays: "Every weekday", weekly: "Every week" };

const projects: Project[] = [
  { id: "research", name: "Research", description: "Make room for curiosity. Turn questions into meaningful discoveries.", color: "sage" },
  { id: "university", name: "University", description: "Learn deeply, connect ideas, and prepare for what comes next.", color: "violet" },
  { id: "work", name: "Work", description: "Thoughtful work on things that make a difference.", color: "blue" },
  { id: "fitness", name: "Fitness", description: "Build a stronger body and a clearer mind, a little at a time.", color: "amber" },
  { id: "personal", name: "Personal Projects", description: "A space to experiment, make things, and follow an idea.", color: "rose" },
];
const checkpoints: Checkpoint[] = [
  { id: "paper", projectId: "research", title: "Paper submission", date: "2026-10-09" },
  { id: "exam", projectId: "university", title: "Statistics midterm", date: "2026-10-05" },
  { id: "sprint", projectId: "work", title: "Sprint review", date: "2026-10-02" },
  { id: "mvp", projectId: "personal", title: "First working prototype", date: "2026-10-16" },
  { id: "outline", projectId: "research", title: "Review paper outline", date: "2026-09-30" },
];
const tasks: Task[] = [
  { id: "t1", projectId: "research", title: "Review literature on attention", checkpointId: "paper", date: TODAY, done: false, recurrence: "none" },
  { id: "t2", projectId: "university", title: "Work through practice problems", checkpointId: "exam", date: TODAY, done: false, recurrence: "none" },
  { id: "t3", projectId: "work", title: "Prepare notes for sprint review", checkpointId: "sprint", date: TODAY, done: false, recurrence: "none" },
  { id: "t4", projectId: "fitness", title: "Get outside for a 30-minute walk", checkpointId: "", date: TODAY, done: false, recurrence: "daily", seriesId: "walk" },
  { id: "t5", projectId: "work", title: "Review the onboarding flow", checkpointId: "sprint", date: TODAY, done: true, completedDate: TODAY, recurrence: "none" },
  { id: "t6", projectId: "research", title: "Organize reading notes", checkpointId: "paper", date: TODAY, done: true, completedDate: TODAY, recurrence: "none" },
  { id: "t7", projectId: "research", title: "Send outline to advisor", checkpointId: "outline", date: "2026-09-30", done: false, recurrence: "none" },
  { id: "t8", projectId: "personal", title: "Sketch the first dashboard", checkpointId: "mvp", date: "", done: false, recurrence: "none" },
  { id: "t9", projectId: "research", title: "Draft the methods section", checkpointId: "paper", date: "", done: false, recurrence: "none" },
  { id: "t10", projectId: "university", title: "Summarize lecture notes", checkpointId: "exam", date: "2026-10-02", done: false, recurrence: "weekly" },
  { id: "t11", projectId: "fitness", title: "Get outside for a 30-minute walk", checkpointId: "", date: "2026-10-02", done: false, recurrence: "daily", seriesId: "walk" },
  { id: "t12", projectId: "research", title: "Collect reference papers", checkpointId: "paper", date: "2026-09-29", done: true, completedDate: "2026-09-29", recurrence: "none" },
];
const timeboxes: Timebox[] = [
  { id: "b1", projectId: "work", title: "A clear start", date: TODAY, start: "09:00", end: "10:30", taskIds: ["t5"], recurrence: "weekdays", seriesId: "work-morning" },
  { id: "b2", projectId: "university", title: "Study time", date: TODAY, start: "11:00", end: "12:00", taskIds: ["t2"], recurrence: "none" },
  { id: "b3", projectId: "research", title: "Deep work", date: TODAY, start: "13:00", end: "15:00", taskIds: ["t1", "t6"], recurrence: "weekly" },
  { id: "b4", projectId: "fitness", title: "A little movement", date: TODAY, start: "17:00", end: "17:45", taskIds: ["t4"], recurrence: "daily" },
  { id: "b5", projectId: "research", title: "Reading & notes", date: "2026-09-28", start: "10:00", end: "12:00", taskIds: [], recurrence: "none" },
  { id: "b6", projectId: "work", title: "A clear start", date: "2026-09-29", start: "09:00", end: "10:30", taskIds: [], recurrence: "weekdays", seriesId: "work-morning" },
  { id: "b7", projectId: "university", title: "Study time", date: "2026-09-29", start: "13:00", end: "15:00", taskIds: [], recurrence: "none" },
  { id: "b8", projectId: "personal", title: "Explore an idea", date: "2026-09-30", start: "10:00", end: "12:00", taskIds: ["t8"], recurrence: "none" },
  { id: "b9", projectId: "research", title: "Draft & refine", date: "2026-10-02", start: "13:00", end: "15:00", taskIds: ["t9"], recurrence: "none" },
  { id: "b10", projectId: "work", title: "A clear start", date: "2026-10-02", start: "09:00", end: "10:30", taskIds: ["t3"], recurrence: "weekdays", seriesId: "work-morning" },
  { id: "b11", projectId: "fitness", title: "Weekend reset", date: "2026-10-03", start: "10:00", end: "11:00", taskIds: [], recurrence: "weekly" },
];
const sessions: Session[] = [
  { id: "s1", projectId: "work", date: TODAY, start: "09:05", end: "10:20", taskIds: ["t5"], source: "Timer" },
  { id: "s2", projectId: "research", date: TODAY, start: "13:12", end: "14:43", taskIds: ["t1", "t6"], source: "Timer" },
  { id: "s3", projectId: "research", date: "2026-09-28", start: "10:10", end: "11:55", taskIds: ["t12"], source: "Manual" },
  { id: "s4", projectId: "work", date: "2026-09-29", start: "09:00", end: "10:40", taskIds: [], source: "Timer" },
  { id: "s5", projectId: "university", date: "2026-09-29", start: "13:05", end: "14:45", taskIds: [], source: "Manual" },
  { id: "s6", projectId: "personal", date: "2026-09-30", start: "10:00", end: "11:30", taskIds: [], source: "Timer" },
  { id: "s7", projectId: "fitness", date: "2026-09-30", start: "17:00", end: "17:35", taskIds: [], source: "Manual" },
];
// Deterministic historical fixtures, shared by the heatmap and all date-range totals.
for (let i = 0; i < 85; i++) {
  if (i % 7 === 5 || i % 11 === 0) continue;
  const hours = 1 + i % 3;
  sessions.push({ id: `history-${i}`, projectId: projects[i % projects.length].id, date: addDays("2026-07-01", i), start: "10:00", end: `${10 + hours}:00`, taskIds: [], source: "Manual" });
}
export const initialData: Dataset = { projects, checkpoints, tasks, timeboxes, sessions };
export const emptyData: Dataset = { projects: [], checkpoints: [], tasks: [], timeboxes: [], sessions: [] };
