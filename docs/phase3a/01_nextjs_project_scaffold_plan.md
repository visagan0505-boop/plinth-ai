# Next.js Project Scaffold Plan

## Core Architecture
- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript (Strict Mode).
- **Styling**: Tailwind CSS.
- **Package Manager**: pnpm (preferred for monorepo compatibility and strict dependency trees).

## Configuration Requirements
- `.npmrc`: Enforce strict-peer-dependencies.
- `tsconfig.json`: `strict: true`, `noImplicitAny: true`. Include the generated `types/supabase.ts` path aliases.
- `next.config.ts`: Disable experimental features unless strictly required. Ensure `reactStrictMode` is enabled.

## Scaffold Sequence
1. Run `npx create-next-app@latest .` with Tailwind, ESLint, TypeScript.
2. Clear placeholder CSS and pages.
3. Install `@supabase/supabase-js`, `@supabase/ssr`, `zod`.
4. Establish folder structure outlined in Phase 3.
