## Tech Stack

- Frontend: TypeScript + Next.js
- Backend: Supabase + PostgreSQL

## Web App

The Next.js web application is in [`apps/web`](apps/web/README.md), initialized with TypeScript, Tailwind CSS, ESLint, and shadcn (Radix Nova), matching the prototype's foundation. Product screens are not implemented yet.

```sh
make web
```

This installs dependencies and starts the web app at http://localhost:3000. For subsequent starts, use `make web-dev`.

## UI Prototype

The standalone Next.js prototype is in [`apps/prototype`](apps/prototype/README.md).
It is reserved for screens using mock data and temporary UI state.

With Node.js and pnpm installed, run from the repository root:

```sh
make prototype
```

This installs dependencies and starts the development server at http://localhost:3000. To run both apps together, start one on another port, for example `pnpm --dir apps/prototype dev --port 3001`.
For subsequent starts, use `make prototype-dev`. Run `make help` to list available commands.
