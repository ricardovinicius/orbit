"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, LoaderCircle, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { ProfileAvatar, useAccount } from "@/components/orbit/account-provider";
import { ThemeToggle } from "@/components/orbit/theme-toggle";

export default function AuthPage() {
  const { profile, signIn, loggedOut } = useAccount();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => { signIn(); router.push("/"); }, 800);
    return () => clearTimeout(timer);
  }, [pending, signIn, router]);
  function close() { setOpen(false); setPending(false); }
  return <div className="auth-screen">
    <header className="auth-header"><Link href="/" className="brand" aria-label="Orbit home"><Orbit /><span>orbit<span className="brand-period">.</span></span></Link><ThemeToggle /></header>
    <div className="auth-layout">
      <section className="auth-intro"><Badge variant="secondary">A little more intention</Badge><h1>Make time for<br />what matters.</h1><p>A calmer place for your projects, your plans, and the time you give them.</p><ul><li><Check />Give your day a little direction</li><li><Check />Keep your projects moving</li><li><Check />See where your time goes</li></ul></section>
      <Card className="auth-card">
        <CardHeader><CardTitle><h2>Your space to focus</h2></CardTitle><CardDescription>Sign in or get started with your Google account.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          {loggedOut && <p role="status" className="text-muted-foreground">You’re logged out. See you next time.</p>}
          <Button size="lg" onClick={() => { setError(""); setOpen(true); }}><span aria-hidden="true">G</span>Continue with Google<ArrowRight data-icon="inline-end" /></Button>
          {error && <FieldError>{error}</FieldError>}
          <p className="text-sm text-muted-foreground">One account for everything you’re making time for.</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3"><Badge variant="outline">Prototype</Badge><p className="text-sm text-muted-foreground">Google sign-in is simulated. No Google account is connected.</p><Button asChild variant="link" className="p-0"><Link href="/">Explore the workspace</Link></Button></CardFooter>
      </Card>
    </div>
    <Dialog open={open} onOpenChange={(value) => { if (!value) close(); }}><DialogContent>
      <DialogHeader><DialogTitle>Continue to Orbit</DialogTitle><DialogDescription>Use this demo account to preview Google sign-in.</DialogDescription></DialogHeader>
      <div className="auth-demo-account"><ProfileAvatar profile={profile} /><div><strong>{profile.name}</strong><p>{profile.email}</p></div></div>
      <p role="status" className="text-sm text-muted-foreground">{pending ? "Signing you in…" : "This is a simulation; no request is sent to Google."}</p>
      <DialogFooter><Button variant="outline" onClick={close}>Cancel</Button><Button disabled={pending} onClick={() => setPending(true)}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}Continue</Button></DialogFooter>
      <Button variant="link" disabled={pending} onClick={() => { close(); setError("We couldn’t sign you in. Please try again."); }}>Preview sign-in failure</Button>
    </DialogContent></Dialog>
  </div>;
}
