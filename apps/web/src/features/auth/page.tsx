import { Check, Orbit } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "./components/google-sign-in-button";

export function SignInPage({
  next,
  error,
}: {
  next: string;
  error?: string;
}): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
      <header>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-xl font-semibold focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          aria-label="Orbit home"
        >
          <Orbit aria-hidden="true" />
          orbit.
        </Link>
      </header>
      <div className="grid flex-1 content-center items-center gap-12 py-16 md:grid-cols-2 md:gap-20">
        <section className="flex flex-col items-start gap-6">
          <Badge variant="secondary">A little more intention</Badge>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight sm:text-5xl">
            Make time for
            <br />
            what matters.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            A calmer place for your projects, your plans, and the time you give
            them.
          </p>
          <ul className="flex flex-col gap-3 text-muted-foreground">
            {[
              "Give your day a little direction",
              "Keep your projects moving",
              "See where your time goes",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <Check className="size-4 shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Your space to focus</h2>
            </CardTitle>
            <CardDescription>
              Sign in or get started with your Google account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <GoogleSignInButton next={next} />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              One account for everything you’re making time for.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
