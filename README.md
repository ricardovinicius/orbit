## Tech Stack

- Frontend: TypeScript + Next.js
- Backend: Supabase + PostgreSQL

## Web App

The Next.js web application is in [`apps/web`](apps/web/README.md), initialized with TypeScript, Tailwind CSS, Biome, and shadcn (Radix Nova), matching the prototype's foundation. Google sign-in and a private workspace placeholder are available; configure authentication using the web app README.

```sh
make web
```

This installs dependencies and starts the web app at http://localhost:3000. For subsequent starts, use `make web-dev`.

## Docker and Local Supabase

With Docker running and Node.js and pnpm installed:

```sh
make supabase-start
make docker-up
```

The web app runs at http://localhost:3000, Supabase Studio at http://localhost:54323, and the Supabase API at http://localhost:54321. The first start downloads the required images. Use `make supabase-status` to see local endpoints and keys.

`make docker-up` builds and runs the production web app. Use `make web-dev` for development with hot reload. Set `WEB_PORT` to use a different web container port, for example `WEB_PORT=3001 make docker-up`.

Stop the services with `make docker-down` and `make supabase-stop`; Supabase keeps local database data. Configure Google sign-in and apply the profile migration using the [web app setup instructions](apps/web/README.md#google-sign-in-setup).

## UI Prototype

The standalone Next.js prototype is in [`apps/prototype`](apps/prototype/README.md).
It is reserved for screens using mock data and temporary UI state.

With Node.js and pnpm installed, run from the repository root:

```sh
make prototype
```

This installs dependencies and starts the development server at http://localhost:3000. To run both apps together, start one on another port, for example `pnpm --dir apps/prototype dev --port 3001`.
For subsequent starts, use `make prototype-dev`. Run `make help` to list available commands.
