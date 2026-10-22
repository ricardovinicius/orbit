"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Profile = { name: string; email: string; timezone: string; avatar: string };
export const demoProfile: Profile = { name: "Ricardo", email: "ricardo@example.com", timezone: "America/Maceio", avatar: "" };
type Account = {
  profile: Profile;
  saveProfile: (profile: Profile) => void;
  signedIn: boolean;
  loggedOut: boolean;
  signIn: () => void;
  signOut: () => void;
};
const AccountContext = createContext<Account | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [profile, saveProfile] = useState(demoProfile);
  const [signedIn, setSignedIn] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  return <AccountContext.Provider value={{ profile, saveProfile, signedIn, loggedOut,
    signIn: () => { setSignedIn(true); setLoggedOut(false); },
    signOut: () => { setSignedIn(false); setLoggedOut(true); },
  }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("Account provider is required");
  return account;
}

export function ProfileAvatar({ profile, large = false }: { profile: Profile; large?: boolean }) {
  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <Avatar className={large ? "size-20" : "size-8"}>
    <AvatarImage src={profile.avatar || undefined} alt={profile.name} className="object-cover" />
    <AvatarFallback>{initials || "R"}</AvatarFallback>
  </Avatar>;
}
