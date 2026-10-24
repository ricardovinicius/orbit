import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "../api";

export function safeAvatar(value: string | null): string | undefined {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function ProfileIdentity({
  profile,
}: {
  profile: Profile;
}): React.JSX.Element {
  const name = profile.name?.trim() || "Your account";
  const initials =
    profile.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "O";
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar size="lg">
        <AvatarImage
          src={safeAvatar(profile.avatar_url)}
          alt={name}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium break-words">{name}</p>
        <p className="text-sm text-muted-foreground break-all">
          {profile.email || "Email unavailable"}
        </p>
      </div>
    </div>
  );
}
