"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BarChart3, CalendarDays, CircleHelp, FlaskConical, FolderClosed, Orbit, Play, Plus, SlidersHorizontal, Square, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initialData, emptyData, TODAY, type Dataset, type Session } from "@/lib/mock-data";
import { ThemeToggle } from "./theme-toggle";
import { Editor, type EditorRequest } from "./editor";

export type ActiveSession = Omit<Session, "end" | "id" | "source">;
type Workspace = {
  data: Dataset;
  setData: React.Dispatch<React.SetStateAction<Dataset>>;
  active: ActiveSession | null;
  setActive: React.Dispatch<React.SetStateAction<ActiveSession | null>>;
  open: (request: EditorRequest) => void;
  notify: (message: string) => void;
};
const WorkspaceContext = createContext<Workspace | null>(null);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace provider is required");
  return value;
}

const navigation = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/projects", label: "Projects", icon: FolderClosed },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(initialData);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [editor, setEditor] = useState<EditorRequest | null>(null);
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState(false);
  const [state, setState] = useState("populated");
  const trigger = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const title = navigation.find((item) => item.href === pathname)?.label ?? "Project";
  function open(request: EditorRequest) {
    trigger.current = document.activeElement as HTMLElement;
    setEditor(request);
  }
  function close() { setEditor(null); requestAnimationFrame(() => trigger.current?.focus()); }
  function fixture(next: string) {
    setState(next);
    setData(next === "empty" ? emptyData : initialData);
    setActive(next === "active" ? { projectId: "research", date: TODAY, start: "15:00", taskIds: ["t1"] } : null);
    setReview(false);
    setNotice("");
  }
  const activeProject = data.projects.find((p) => p.id === active?.projectId);
  return (
    <WorkspaceContext.Provider value={{ data, setData, active, setActive, open, notify: setNotice }}>
      <TooltipProvider>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="app-shell">
          <aside className="sidebar">
            <Link href="/" className="brand" aria-label="Orbit home"><Orbit size={29} strokeWidth={1.5} /><span>orbit<span className="brand-period">.</span></span></Link>
            <div className="workspace-label"><span className="workspace-avatar">R</span><div>My workspace<small>A little more intentional.</small></div></div>
            <div className="nav-label">WORKSPACE</div>
            <nav aria-label="Main navigation">
              {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-item ${pathname === href || (href === "/projects" && pathname.startsWith("/projects/")) ? "selected" : ""}`} aria-current={pathname === href || (href === "/projects" && pathname.startsWith("/projects/")) ? "page" : undefined}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{label === "Today" && <span className="nav-count">{data.tasks.filter((t) => t.date === TODAY && !t.done).length}</span>}</Link>)}
            </nav>
            <div className="nav-label project-nav-heading">YOUR PROJECTS<Button variant="ghost" size="icon-xs" aria-label="New Project" onClick={() => open({ kind: "project" })}><Plus /></Button></div>
            <nav aria-label="Project navigation" className="project-nav">
              {data.projects.filter((p) => !p.archived).map((p) => <Link href={`/projects/${p.id}`} key={p.id} className={`project-link ${pathname === `/projects/${p.id}` ? "current" : ""}`}><span className={`project-dot ${p.color}`} />{p.name}</Link>)}
              {data.projects.length === 0 && <p className="sidebar-empty">Your focus areas will live here.</p>}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note"><Orbit size={23} strokeWidth={1.3} /><p>Make time for<br /><strong>what matters.</strong></p></div>
              <button className="review-button" onClick={() => setReview(true)}><SlidersHorizontal size={16} />Prototype controls<ArrowUpRight size={13} /></button>
              <div className="profile"><span className="profile-avatar">R</span><div>Personal workspace<small>Just you. Your own pace.</small></div></div>
            </div>
          </aside>
          <div className="app-body">
            <header className="topbar"><div className="breadcrumb">My workspace<span>/</span><strong>{title}</strong></div><div className="topbar-right"><ThemeToggle /><button className="prototype-tag" onClick={() => setReview(true)}><span />Prototype</button><span className="topbar-date">Thursday, October 1</span></div></header>
            {active && <div className="active-banner" role="status"><div><span className="live-dot" /><strong>{activeProject?.name}</strong><span>Session in progress</span><span className="timer-readout">00:25:00</span><small>Demo timer</small></div><Button size="sm" onClick={() => open({ kind: "stop", projectId: active.projectId })}><Square size={12} fill="currentColor" />Stop & review</Button></div>}
            <main id="main-content" className="main-content">
              {state === "loading" ? <div className="loading-state" role="status" aria-label="Loading workspace"><div className="skeleton heading-skeleton" /><div className="metrics-grid">{[0, 1, 2].map((i) => <div key={i} className="skeleton metric-skeleton" />)}</div><div className="skeleton content-skeleton" /><Button variant="outline" onClick={() => fixture("populated")}>Finish loading preview</Button></div> : state === "error" ? <div className="empty-state error-state"><CircleHelp /><h1>We couldn’t load your workspace</h1><p>Your work hasn’t changed. Try loading it again.</p><Button onClick={() => fixture("populated")}>Try again</Button></div> : children}
              <footer className="page-footer"><span><Orbit size={13} /> A little intention goes a long way.</span><span>October 2026</span></footer>
            </main>
          </div>
        </div>
        {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={16} /></button></div>}
        <Dialog open={!!editor} onOpenChange={(value) => { if (!value) close(); }}>
          {editor && <Editor key={`${editor.kind}-${editor.id ?? "new"}-${editor.projectId ?? ""}`} request={editor} close={close} />}
        </Dialog>
        <Dialog open={review} onOpenChange={setReview}><DialogContent className="review-dialog"><DialogHeader><DialogTitle>Prototype controls</DialogTitle><DialogDescription>Explore the screens with prepared data. Changes last until you reload or switch a scenario.</DialogDescription></DialogHeader><div className="fixture-options">{[{ id: "populated", name: "A week in motion", text: "Projects, plans, and recorded activity", icon: CalendarDays }, { id: "active", name: "An active Session", text: "Preview the persistent Session control", icon: Play }, { id: "empty", name: "A fresh start", text: "Create your first Project and plan", icon: Plus }, { id: "loading", name: "Loading", text: "Review the loading treatment", icon: Orbit }, { id: "error", name: "Load failure", text: "Review the retry experience", icon: CircleHelp }].map(({ id, name, text, icon: Icon }) => <button key={id} onClick={() => fixture(id)} className="fixture-option"><Icon size={19} /><div><strong>{name}</strong><small>{text}</small></div><ArrowUpRight size={16} /></button>)}</div><p className="muted text-xs flex gap-2"><FlaskConical size={14} />Fixed demo date: October 1, 2026. No data is sent or saved.</p></DialogContent></Dialog>
      </TooltipProvider>
    </WorkspaceContext.Provider>
  );
}
