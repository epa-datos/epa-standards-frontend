# EPA Digital - Standard Frontend (NextJS)

Template de web app NextJS con Tailwind CSS, arquitectura BFF, testing completo.

**Usa este repo como base para cualquier frontend web en EPA Digital.**

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
npm run test        # Unit tests
npm run test:e2e    # E2E tests

# 5. Read guide
cat CLAUDE.md  # ← Léelo completo
```

## 📚 Documentación

**Antes de empezar, lee:**
- **[CLAUDE.md](./CLAUDE.md)** - Guía arquitectura y desarrollo
- **[CONTRIBUTING.md](../epa-standards/CONTRIBUTING.md)** - Cómo contribuir
- **[BRANCHING-STRATEGY.md](../epa-standards/docs/BRANCHING-STRATEGY.md)** - Git workflow

## 🏗️ Estructura

```
src/
├── app/                    # NextJS App Router
│   ├── (public)/           # Marketing pages
│   ├── (auth)/             # Auth pages
│   ├── (dashboard)/        # Protected routes
│   └── layout.tsx          # Root layout
├── components/             # Shared components
├── features/               # Feature modules
├── lib/                    # Utilities (api-client, etc.)
├── providers/              # Context providers
└── __tests__/              # Tests

configuration files:
- next.config.ts           # NextJS config
- tailwind.config.ts       # Tailwind (OKLCH)
- tsconfig.json            # TypeScript
- eslint.config.mjs        # Linting
- postcss.config.mjs       # PostCSS
```

## 🔍 Qué Hay Dentro

### Ejemplos Clave

1. **API Client** (`src/lib/api-client.ts`)
   - Central HTTP client (apiFetch)
   - Error handling
   - Credential management

2. **Features** (Ejemplo: `auth`)
   - `features/auth/hooks/` - useAuth, useLogin
   - `features/auth/services/` - API calls
   - `features/auth/components/` - UI components
   - `features/auth/types.ts` - Types

3. **Components**
   - Shared UI components
   - Layout components

4. **Testing**
   - Vitest for unit tests
   - Playwright for E2E

### Configuración

- `package.json` - Dependencies (minimal)
- `tailwind.config.ts` - OKLCH color tokens
- `tsconfig.json` - TypeScript strict mode
- `.env.example` - Environment variables
- `next.config.ts` - NextJS configuration

## 🛠️ Desarrollo

### Crear Nuevo Feature

Sigue el patrón de `auth`:

1. **Estructura**
   ```
   src/features/<feature>/
   ├── components/
   ├── hooks/
   ├── services/
   ├── queries/
   ├── types.ts
   ├── constants/
   └── __tests__/
   ```

2. **Flujo: Component → Hook → Service → API Client → Backend**

   ```tsx
   // components/login-form.tsx
   'use client'
   import { useLogin } from '../hooks/use-login'
   
   export function LoginForm() {
     const { mutate } = useLogin()
     // ...
   }
   ```

   ```ts
   // hooks/use-login.ts
   import { useMutation } from '@tanstack/react-query'
   import { loginUser } from '../services/auth-service'
   
   export function useLogin() {
     return useMutation({ mutationFn: loginUser })
   }
   ```

   ```ts
   // services/auth-service.ts
   import { apiFetch } from '@/lib/api-client'
   
   export async function loginUser(email: string, password: string) {
     return apiFetch<AuthResponse>('/auth/login', {
       method: 'POST',
       body: JSON.stringify({ email, password }),
     })
   }
   ```

### Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Colors & Theming

No hardcoded colors:

```tsx
// ❌ DON'T
<div className="bg-white text-black">

// ✅ DO
<div className="bg-background text-foreground">
```

Tokens: `background`, `foreground`, `card`, `muted`, `destructive`, etc.

### Responsive Design

Mobile-first:

```tsx
// ❌ DON'T
<div className="w-full md:w-1/2">

// ✅ DO
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

## 🔄 Git Workflow

1. Create branch: `feature/new-feature`
2. Code, test locally
3. Commit: `git commit -m "feat: add feature"`
4. Push → open PR to `staging`
5. CI runs tests
6. Get approval → merge
7. Auto-deploy to staging

See [BRANCHING-STRATEGY.md](../epa-standards/docs/BRANCHING-STRATEGY.md)

## 📝 Convenciones

- **Files:** kebab-case.tsx (e.g., `login-form.tsx`)
- **Hooks:** use-<name>.ts (e.g., `use-auth.ts`)
- **Pages:** Always `page.tsx`, `layout.tsx`
- **Components:** PascalCase exported
- **Exports:** Feature pages as `export function`, pages as `export default`

## 🔐 Environment

```bash
cp .env.example .env.local
```

Variables:
- `NEXT_PUBLIC_API_BASE_URL` - Go backend URL
- `NEXT_PUBLIC_SITE_URL` - Frontend URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth client

⚠️ Only `NEXT_PUBLIC_*` are exposed to browser. Never put secrets there.

## 📊 Stack

- **Framework:** Next.js 15
- **UI:** Tailwind CSS 3
- **Colors:** OKLCH (via CSS variables)
- **State:** TanStack React Query
- **Testing:** Vitest + Playwright
- **Linting:** ESLint
- **Formatting:** Prettier

## 📈 Performance

- Server Components by default (don't add `'use client'` unless necessary)
- Image optimization via `next/image`
- CSS with Tailwind (zero runtime)
- Code splitting automatic

## 🎯 Próximos Pasos

1. ✅ Lee `CLAUDE.md`
2. ✅ Run `npm run dev`
3. ✅ Revisa `src/features/auth/` (estructura)
4. ✅ Revisa `src/lib/api-client.ts` (HTTP)
5. ✅ Run `npm run test` (tests)
6. ✅ Crear tu primer feature
7. ✅ PR a `staging`

## 📞 Preguntas?

- Lee `CLAUDE.md` (contiene respuestas comunes)
- Revisa ejemplos en `src/`
- Revisa tests en `__tests__/`
- Pregunta al equipo

---

**Good luck!** 🚀
