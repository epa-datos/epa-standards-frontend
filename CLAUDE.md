# CLAUDE.md - EPA Digital Standard Frontend (NextJS)

Template de frontend NextJS con Tailwind CSS, arquitectura BFF, testing con Vitest + Playwright.

**Usa este repo como base para cualquier web app en EPA Digital.**

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/epa-datos/epa-standards-frontend.git my-app
cd my-app

# 2. Setup
npm install
cp .env.example .env.local

# 3. Run
npm run dev
# → http://localhost:3000

# 4. Test
npm run test        # Unit tests (watch)
npm run test:run    # Tests once (CI)
npm run test:e2e    # E2E tests

# 5. Read architecture
cat CLAUDE.md  # ← Leelo completo
```

## 📋 Comandos

```bash
# Development
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Vitest watch mode
npm run test:run     # Vitest one-shot (CI)
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright tests
npm run test:e2e:ui  # Playwright UI mode

# Code Quality
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npm run format       # Prettier format

# Other
npm run clean        # Remove build artifacts
```

## 🏗️ Arquitectura

**BFF Pattern:** Next.js es middleware entre UI y Go API backend.

```
┌──────────────────────────────────┐
│  UI Components                    │ ← React (Server Components)
│  (User interactions)              │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  Features                         │ ← Feature modules
│  (Auth, Dashboard, Billing, etc.) │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  Hooks (useAuth, useQuery, etc.)  │ ← React hooks
│  (State management)               │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  Services                         │ ← API calls
│  (getUser, createSubscription)    │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  lib/api-client.ts                │ ← Single HTTP client
│  apiFetch() with credentials      │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  Go Backend API                   │ ← Production data
│  (http://backend:8080/api/v1)     │
└──────────────────────────────────┘
```

**Regla de Oro:** Componentes NUNCA llaman `fetch()` directamente.

```
❌ DON'T:
fetch('/api/users')  ← Direct fetch in component

✅ DO:
const users = useUsers()  ← Hook que usa service
const users = service.getUsers()  ← Service que usa api-client
```

## 📁 Estructura

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Marketing pages (no auth)
│   │   └── page.tsx        # Landing
│   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/        # Protected routes
│   │   ├── app/            # Authenticated app
│   │   │   ├── billing/
│   │   │   └── dashboard/
│   │   └── layout.tsx      # Dashboard layout
│   ├── api/                # API routes
│   │   └── auth/           # Auth endpoints
│   └── layout.tsx          # Root layout
│
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── navbar/
│   ├── footer/
│   └── ...
│
├── features/               # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── queries/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── constants/
│   ├── billing/
│   ├── dashboard/
│   └── ...
│
├── lib/                    # Shared utilities
│   ├── api-client.ts       # HTTP client (central!)
│   ├── query-client.ts     # TanStack Query setup
│   ├── errors/
│   ├── env.ts              # Environment validation
│   └── ...
│
├── providers/              # Context providers
│   ├── query-provider.tsx
│   └── theme-provider.tsx
│
├── store/                  # Global state (Zustand)
│   └── (planned)
│
└── __tests__/              # Tests
    ├── unit/               # Unit tests
    ├── component/          # Component tests
    └── e2e/                # E2E tests
```

## 🎨 Design System

### Colors (OKLCH)

No hardcoded colors. Use semantic tokens:

```tsx
// ❌ DON'T
<div className="bg-gray-900 text-white">  {/* Hardcoded color */}

// ✅ DO
<div className="bg-background text-foreground">  {/* Semantic token */}
```

**Available tokens:**
- `background` / `foreground` - Page backgrounds
- `card` - Card/panel surfaces
- `muted` / `muted-foreground` - Disabled states
- `destructive` - Error/delete actions
- Theme-aware (light/dark automatically)

### Responsive Design

Mobile-first approach:

```tsx
// ❌ DON'T
<div className="w-full md:w-1/2">  {/* Desktop-first */}

// ✅ DO
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">  {/* Mobile-first */}
```

Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

## 🔌 API Integration

### Central HTTP Client

All API calls go through `lib/api-client.ts`:

```ts
// lib/api-client.ts
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    credentials: 'include',  // ← Include cookies (httpOnly auth)
    ...options,
  })
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }
  
  return response.json()
}
```

### Services (Call apiFetch)

```ts
// features/auth/services/auth-service.ts
import { apiFetch } from '@/lib/api-client'

export async function loginUser(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
```

### Hooks (Call Services + React Query)

```ts
// features/auth/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '../services/auth-service'

export function useLogin() {
  return useMutation({
    mutationFn: (email: string, password: string) => 
      loginUser(email, password),
  })
}
```

### Components (Call Hooks)

```tsx
// components/login-form.tsx
'use client'  // ← Only where needed

import { useLogin } from '@/features/auth/hooks/use-login'

export function LoginForm() {
  const loginMutation = useLogin()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    await loginMutation.mutateAsync(email, password)
  }
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

## 🧪 Testing

### Unit Tests (Vitest)

```tsx
// features/auth/hooks/use-login.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useLogin } from './use-login'

vi.mock('@/lib/api-client')

describe('useLogin', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useLogin())
    
    result.current.mutate('user@example.com', 'password')
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

### Component Tests (Vitest + React Testing Library)

```tsx
// components/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```ts
// __tests__/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid=email]', 'user@example.com')
  await page.fill('[data-testid=password]', 'password')
  await page.click('[data-testid=login-button]')
  
  await expect(page).toHaveURL('/app/dashboard')
})
```

## 📝 Conventions

### Files
- Components: `kebab-case.tsx` (e.g., `login-form.tsx`)
- Hooks: `use-<name>.ts` (e.g., `use-auth.ts`)
- Pages: Always `page.tsx`, `layout.tsx` (Next.js requirement)
- Feature pages: `<feature>-page.tsx` (e.g., `billing-page.tsx`)

### Components
- Keep under 200 lines
- Prefer Server Components (don't add `'use client'` unless necessary)
- Use `'use client'` only for: state, hooks, event handlers, browser APIs

### Exports
- Page files: `export default PageComponent`
- Feature pages: `export function FeaturePage() { ... }`

### Types
- Use `type` over `interface` (unless extending)
- Define in `types.ts` per feature

## 🔐 Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

⚠️ **Only `NEXT_PUBLIC_*` vars are inlined into browser bundle.** Never put secrets there.

## 🔄 Git Workflow

1. Create branch: `feature/user-auth`
2. Code → commit → push
3. Open PR to `staging`
4. CI runs: typecheck, lint, tests
5. Get 1 approval → merge
6. Auto-deploy to staging
7. Later: manual PR `staging` → `main` + release

See [BRANCHING-STRATEGY.md](../epa-standards/docs/BRANCHING-STRATEGY.md)

## 🎯 Siguientes Pasos

1. ✅ Lee esta guía completa
2. ✅ Run `npm run dev`
3. ✅ Revisa `src/app/(dashboard)/` (ejemplo de feature)
4. ✅ Revisa `src/features/auth/` (structure)
5. ✅ Revisa `src/lib/api-client.ts` (HTTP)
6. ✅ Run `npm run test` (tests)
7. ✅ Crear tu primer feature
8. ✅ PR a `staging`

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

## 🤖 Available Skills

These Claude skills are available to help you work with NextJS projects:

### `nextjs-scaffold`
Create a new NextJS repository based on this standard template.

**When to use:** Starting a new web app for EPA Digital
```
Claude: "Create a new NextJS app for the customer portal"
```

### `validate-pr-format`
Check if your PR follows EPA Digital standards before submitting.

**When to use:** Before opening a PR
```
Claude: "Validate my PR format"
```

### `git-flow-guide`
Interactive guide for EPA Digital branching and workflow.

**When to use:** Unsure about branching strategy
```
Claude: "What branch should I create for a feature?"
```

---

## ❓ Questions?

- Read CLAUDE.md (you are here)
- Check examples in `src/`
- Check tests in `__tests__/`
- Use available skills (see above)
- Ask the team

---

**Good luck!** 🚀
