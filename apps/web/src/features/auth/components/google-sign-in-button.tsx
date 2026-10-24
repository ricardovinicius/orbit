"use client";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { startGoogleSignIn } from "../actions";

export function GoogleSignInButton({
  next,
}: {
  next: string;
}): React.JSX.Element {
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  async function handleSignIn(): Promise<void> {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(undefined);
    try {
      const result = await startGoogleSignIn(next);
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      setError(result.error ?? "We couldn’t start sign-in. Please try again.");
    } catch {
      setError("We couldn’t reach Orbit. Please try again.");
    }
    submitting.current = false;
    setPending(false);
  }
  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" disabled={pending} onClick={handleSignIn}>
        {pending ? (
          <Spinner data-icon="inline-start" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">G</span>
        )}
        Continue with Google
        <ArrowRight data-icon="inline-end" />
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {pending ? "Taking you to Google…" : ""}
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
