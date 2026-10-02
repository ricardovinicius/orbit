## Tech Stack

- Frontend: TypeScript + Next.js
- Backend: Supabase + PostgreSQL

## UI Prototype

The standalone Next.js prototype is in [`apps/prototype`](apps/prototype/README.md).
It is reserved for non-functional screens using mock data; no pages are implemented yet.

With Node.js and pnpm installed, run from the repository root:

```sh
make prototype
```

This installs dependencies and starts the development server at http://localhost:3000.
For subsequent starts, use `make prototype-dev`. Run `make help` to list available commands.
