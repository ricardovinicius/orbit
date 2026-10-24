import { PlaceholderPage } from "@/components/layout/placeholder-page";
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
    <PlaceholderPage
      title="Today"
      description="A little clarity for the day ahead."
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your account</h2>
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
    </PlaceholderPage>
  );
}
