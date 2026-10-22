"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Check, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { ProfileAvatar, useAccount, type Profile } from "@/components/orbit/account-provider";
import { LogoutButton } from "@/components/orbit/account-menu";
import { PageHeading } from "@/components/orbit/shared";
import { useWorkspace } from "@/components/orbit/workspace";

const timezones = ["America/Maceio", "America/Sao_Paulo", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Lisbon", "Asia/Tokyo", "UTC"];

export default function ProfilePage() {
  const { profile, saveProfile, signedIn } = useAccount();
  return <div className="profile-screen"><PageHeading title="Your profile"><Badge variant="outline">{signedIn ? "Google account" : "Preview account"}</Badge></PageHeading>
    <ProfileForm key={JSON.stringify(profile)} profile={profile} saveProfile={saveProfile} />
  </div>;
}

function ProfileForm({ profile, saveProfile }: { profile: Profile; saveProfile: (profile: Profile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [nameError, setNameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const readVersion = useRef(0);
  const { notify } = useWorkspace();
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  function reset() { readVersion.current++; setDraft(profile); setNameError(""); setAvatarError(""); setReading(false); }
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const version = ++readVersion.current;
    setReading(false);
    setAvatarError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setAvatarError("Choose a JPG, PNG, or WebP image under 2 MB."); return;
    }
    setReading(true);
    const reader = new FileReader();
    const fail = () => { if (version === readVersion.current) { setReading(false); setAvatarError("We couldn’t open that image. Try another file."); } };
    reader.onerror = fail;
    reader.onload = () => {
      const url = String(reader.result);
      const image = new Image();
      image.onerror = fail;
      image.onload = () => { if (version === readVersion.current) { setDraft((value) => ({ ...value, avatar: url })); setReading(false); } };
      image.src = url;
    };
    reader.readAsDataURL(file);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) { setNameError("Enter a display name."); return; }
    saveProfile({ ...draft, name: draft.name.trim() });
    notify("Profile updated.");
  }
  return <div className="profile-layout">
    <form onSubmit={save} noValidate>
      <Card><CardHeader><CardTitle><h2>Personal details</h2></CardTitle><CardDescription>A familiar face and a name that feels like you.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field data-invalid={!!avatarError}><FieldLabel htmlFor="avatar">Profile photo</FieldLabel><div className="profile-photo-row"><ProfileAvatar profile={draft} large /><div className="flex flex-col items-start gap-2"><Input ref={input} id="avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="hidden" tabIndex={-1} aria-invalid={!!avatarError} aria-describedby={avatarError ? "avatar-error" : "avatar-help"} /><Button type="button" variant="outline" onClick={() => input.current?.click()}><Camera data-icon="inline-start" />{reading ? "Reading photo…" : "Upload photo"}</Button>{draft.avatar && <Button type="button" variant="ghost" size="sm" onClick={() => { readVersion.current++; setReading(false); setDraft({ ...draft, avatar: "" }); setAvatarError(""); }}>Remove photo</Button>}</div></div><FieldDescription id="avatar-help">JPG, PNG, or WebP, up to 2 MB. Your photo stays in this preview.</FieldDescription>{avatarError && <FieldError id="avatar-error">{avatarError}</FieldError>}</Field>
          <Field data-invalid={!!nameError}><FieldLabel htmlFor="display-name">Display name</FieldLabel><Input id="display-name" autoComplete="name" value={draft.name} maxLength={80} aria-invalid={!!nameError} aria-describedby={nameError ? "name-error" : undefined} onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setNameError(""); }} />{nameError && <FieldError id="name-error">{nameError}</FieldError>}</Field>
          <Field><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" type="email" value={draft.email} readOnly aria-describedby="email-help" /><FieldDescription id="email-help">Provided by your Google account. Email cannot be edited here.</FieldDescription></Field>
          <Field><FieldLabel htmlFor="timezone">Timezone</FieldLabel><Select value={draft.timezone} onValueChange={(timezone) => setDraft({ ...draft, timezone })}><SelectTrigger id="timezone" className="w-full" aria-describedby="timezone-help"><Globe2 /><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{timezones.map((zone) => <SelectItem key={zone} value={zone}>{zone.replaceAll("_", " ")}</SelectItem>)}</SelectGroup></SelectContent></Select><FieldDescription id="timezone-help">A preview preference; the workspace keeps its fixed demo schedule.</FieldDescription></Field>
        </FieldGroup></CardContent>
        <CardFooter className="justify-end gap-2"><Button type="button" variant="ghost" disabled={!dirty && !reading && !avatarError && !nameError} onClick={reset}>Cancel</Button><Button type="submit" disabled={!dirty || reading}><Check data-icon="inline-start" />Save changes</Button></CardFooter>
      </Card>
    </form>
    <aside className="flex flex-col gap-5"><Card><CardHeader><CardTitle>Connected account</CardTitle><CardDescription>Google</CardDescription></CardHeader><CardContent><p className="profile-email">{profile.email}</p><p className="text-sm text-muted-foreground">This demo account is used to explore your profile and sign-in experience.</p></CardContent><CardFooter><LogoutButton /></CardFooter></Card><p className="text-sm text-muted-foreground">Prototype changes last until you refresh. You can explore all workspace pages while signed out.</p></aside>
  </div>;
}
