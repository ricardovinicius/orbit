import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { ownProfile } from "@/features/profile/api";
import { ProfileIdentity } from "@/features/profile/components/profile-identity";

export default async function Home(): Promise<React.JSX.Element> {
  const profile = await ownProfile();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Your workspace</h1>
          </CardTitle>
          <CardDescription>You’re signed in to Orbit.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileIdentity profile={profile} />
        </CardContent>
        <CardFooter>
          <SignOutButton />
        </CardFooter>
      </Card>
    </main>
  );
}
