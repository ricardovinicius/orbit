"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUpDown, LogIn, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ProfileAvatar, useAccount } from "./account-provider";
import { useWorkspace } from "./workspace";

export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { profile, signedIn } = useAccount();
  const { requestLogout, confirmation } = useLogout();
  return <><DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" className={compact ? "mobile-account-trigger" : "account-trigger"} aria-label="Account menu">
      <ProfileAvatar profile={profile} />
      {!compact && <><span className="account-copy"><span>{profile.name}</span><small>{signedIn ? "Personal workspace" : "Preview account"}</small></span><ChevronsUpDown data-icon="inline-end" /></>}
    </Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel><div className="account-menu-identity"><span>{profile.name}</span><small>{profile.email}</small></div></DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild><Link href="/profile"><UserRound />Profile</Link></DropdownMenuItem>
        {!signedIn && <DropdownMenuItem asChild><Link href="/auth"><LogIn />Sign in with Google</Link></DropdownMenuItem>}
        {signedIn && <DropdownMenuItem onSelect={requestLogout}><LogOut />Log out</DropdownMenuItem>}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>{confirmation}</>;
}

export function LogoutButton() {
  const { requestLogout, confirmation } = useLogout();
  return <><Button variant="outline" onClick={requestLogout}><LogOut data-icon="inline-start" />Log out</Button>{confirmation}</>;
}

function useLogout() {
  const { signOut } = useAccount();
  const { active, setActive } = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  function logout() { setActive(null); signOut(); router.push("/auth"); }
  return { requestLogout: () => { if (active) setConfirm(true); else logout(); }, confirmation: <AlertDialog open={confirm} onOpenChange={setConfirm}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Leave your active Session?</AlertDialogTitle><AlertDialogDescription>Your Session has not been recorded. Return to the workspace to stop and save it, or log out and discard it.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Keep working</AlertDialogCancel><AlertDialogAction onClick={logout}>Discard & log out</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog> };
}
