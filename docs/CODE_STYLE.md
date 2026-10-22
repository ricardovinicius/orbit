## Frontend Code Style

**Tools:**
- Formatting: Biome
- Linting: Biome
- Type Checking: TypeScript Native Checker

**Instructions:**
- Prefer unknown over any and narrow values
- Validate external data at application boundaries.
- Use type-only imports for types
- Use function components and hooks
- Follow the Rules of Hooks and declare effect dependencies accurately
- Keep state close to the components that use it
- Handle loading, empty and error stats explicitly
- Use kebab-case for files and folders, except framework-required names.
- Use PascalCase for components and type names.
- Use camelCase for functions, variables, and props.
- Prefix custom hooks with use.
- Name event-handler props onAction and their implementations handleAction