# Minimal Folder Structure

A lean, operational-focused Next.js App Router structure.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (operational)/
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/page.tsx
│   │   └── time/page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/callback/route.ts
│   └── layout.tsx
├── components/
│   ├── auth/          # Auth forms and logic
│   └── operational/   # Reusable domain components
├── lib/
│   └── supabase/
│       ├── server.ts  # Server client
│       ├── client.ts  # Browser client
│       └── middleware.ts
└── types/
    └── supabase.ts    # Generated types (already exists)
```

**Rules:**
- Logic specific to Auth lives in `(auth)`.
- Core domain logic lives in `(operational)`, which is heavily protected by middleware.
