## General Instructions

* Always prefer writing good code, maintanable, and clean
* Suggest design paterns when suitable

### Commit

* Prefer small commits 
* Use conventional commits standard for commit messages
* Prefer small commit messages, with a single sentence

### Documentation

* Avoid bloated documentation, with a lot of information
* Use natural and clean tone
* Do not document API at markdown, prefer using FastAPI own integration with OpenAPI and Swagger for this
* `README.md` must be simple, human-centric documentation, that must be limited to simple usage. Use AGENTS.md for explanation of technical decisions and instructions.
* Do not manually wrap documentation lines to meet a character limit. Use line breaks for paragraphs and structure.

## UI/UX Design

Refer to @docs/DESIGN.md file for UI/UX Design instructions. Always look this documentation before doing any design task, including implement screens, or prototype in Figma.

## CLI Tools

Always prefer to use CLI tools provided by frameworks or libraries over scaffolding manually files related to configuration.

Example, for Next.js:

`pnpm create next-app@latest my-app --yes`

## Testing Strategy

Refer to @docs/TESTING.md for testing instructions.