"use client";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "../actions";

export function SignOutButton(): React.JSX.Element {
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  async function handleSignOut(): Promise<void> {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(undefined);
    try {
      const result = await signOut();
      if (!result.error) {
        window.location.replace("/auth");
        return;
      }
      setError(result.error);
    } catch {
      setError("We couldn’t reach Orbit. Please try again.");
    }
    submitting.current = false;
    setPending(false);
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outline" disabled={pending} onClick={handleSignOut}>
        {pending && <Spinner data-icon="inline-start" aria-hidden="true" />}Sign
        out
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {pending ? "Signing out…" : ""}
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
