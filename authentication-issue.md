# Implement authentication with Google SSO

## Context

Users need to sign in to Orbit to access their workspace and personal data. The existing prototype simulates Google sign-in; the main app needs a working authentication flow using Google SSO through Supabase Auth.

Use the prototype as the visual reference and follow `docs/DESIGN.md`. Authentication screens should render outside the shared application shell.

## Requirements

- Provide a sign-in page with a “Continue with Google” action. Use the same flow for first-time and returning users.
- Integrate Google sign-in through Supabase Auth, including the callback flow and application session creation.
- Create an account on the first successful sign-in and reuse the existing account on subsequent sign-ins with the same Google identity.
- Maintain the session across page reloads and support session refresh. Return users to sign-in when their session can no longer be renewed.
- Protect application pages and private server-side operations using a validated session. Keep the sign-in page and authentication callback accessible without a session.
- After sign-in, return users to the protected page they originally requested, or the application home page when no destination is provided. Accept only safe internal return destinations.
- Redirect authenticated users away from the sign-in page to their workspace.
- Provide a sign-out action that ends the current application session and returns the user to sign-in.
- Show loading and recoverable error states for sign-in failures, denied consent, and invalid or expired callbacks. Allow users to retry.
- Use authenticated user identity for access to private data and enforce user isolation at the data layer for resources included in this implementation.
- Configure Google and Supabase callback and redirect URLs for local development and deployment. Keep provider secrets and privileged keys server-side and out of version control.
- Document the minimal setup needed to run Google sign-in locally, including required environment variables and provider configuration.
- Limit scope to Google authentication. Email/password login, additional providers, account deletion, role management, and Google API access are outside this issue.

## Acceptance Criteria

- [ ] A new user can sign in with Google and access the application.
- [ ] A returning user signs in to the same Orbit account without creating duplicates.
- [ ] Successful sign-in returns the user to the requested internal page or the application home page.
- [ ] External or malformed return destinations cannot redirect users away from Orbit.
- [ ] Unauthenticated users cannot access protected pages or private server-side operations.
- [ ] Authenticated users visiting the sign-in page are redirected to their workspace.
- [ ] Sessions survive page reloads, refresh when possible, and require sign-in again when no longer valid.
- [ ] Signing out prevents subsequent access to protected content with the ended session.
- [ ] Cancelled sign-in, provider failures, and invalid callbacks show clear feedback and allow retrying.
- [ ] Authentication controls are keyboard accessible, have visible focus states, and communicate loading and error states.
- [ ] Private data access covered by this issue is restricted to its owner.
- [ ] Local and deployment configuration requirements are documented without exposing credentials.
- [ ] Relevant checks pass, with session handling, route protection, redirect validation, and user isolation covered according to `docs/TESTING.md`.
- [ ] The real Google sign-in and sign-out flow is manually verified; automated tests do not depend on interacting with Google's consent screen.
