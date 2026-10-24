# Architecture

```mermaid
flowchart TB
    subgraph Clients["Client Interfaces"]
        Web["Web Application"]
    end

    subgraph Application["Application — Next.js"]
        direction TB
        Server["Application Server"]
        Services["Business Services<br/>Projects · Checkpoints · Tasks<br/>Timeboxes · Sessions · Progress"]
        Adapters["Integration Adapters (Future)"]
    end

    subgraph Infrastructure["Infrastructure & External Services"]
        direction LR
        Auth["Supabase Auth"]
        API["Supabase Data API"]
        DB[("PostgreSQL<br/>Row Level Security")]
        Tools["Activity Trackers (Future)<br/>Coding · Fitness · Reading · Focus"]
    end

    Web <-->|HTTPS| Server
    Server <-->|Authentication| Auth
    Server <--> Services
    Services <-->|Queries and mutations| API
    API <--> DB
    Tools <-.->|External activity| Adapters
    Adapters -.->|Normalized Sessions| Services

    classDef interface fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef application fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef infrastructure fill:#f3e8ff,stroke:#9333ea,color:#581c87

    class Web interface
    class Server,Services,Adapters application
    class Auth,API,DB,Tools infrastructure
```

## Tech Stack

**Frontend:**

Next.js is the main framework of frontend.

Use Biome for linting and formatting.

Vitest for Unittests.

React Testing Library for Component Tests.

Playwright for E2E tests.

Shadcn as Component Library.

**Backend:**

Supabase is the BaaS of this project.

## Frontend Codebase Structure

@ apps/web

src/
    app/        Next.js App Router routes and layouts
        (workspace)/    Application pages sharing the application shell
        (auth)/         Authentication pages outside the application shell
    features/
        {feature}/
            components/     Specific Components of this feature
            api.ts          
            page.tsx        Main page component
            hooks.ts        Feature Specific Hooks
            types.ts        Feature specific Types
    components/     Shared Components
        ui/
        layout/
    lib/    Shared Libraries
        supabase/
    hooks/  Shared Hooks
    test/   Vitest Unit Tests
e2e/        Playwright E2E Tests
    {feature}.spec.ts

The root `src/app/layout.tsx` owns the document and global styles. The `(workspace)` layout composes shared components from `src/components/layout`; the `(auth)` group remains outside that shell. Route groups do not change public URLs. Keep route files thin and feature behavior in `src/features`; use client components for interactive navigation controls while preserving server components where possible.


## Supabase Codebase Structure

@ apps/supabase

config.toml
migrations/
seed.sql
