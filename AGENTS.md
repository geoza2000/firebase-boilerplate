# AI Agent Instructions for $$PROJECT_NAME$$

This document provides guidelines for AI agents working on this Firebase monorepo project.

## Project Architecture

```
/
├── packages/
│   ├── shared/       # Shared types, constants (used by frontend and backend)
│   ├── functions/    # Firebase Cloud Functions (backend)
│   ├── dashboard/    # React PWA dashboard (main app)
│   └── website/      # Marketing/landing page
├── firebase.json     # Firebase configuration
├── firestore.rules   # Firestore security rules
└── firestore.indexes.json
```

---

## Code Organization Rules

### 1. File Size Limits
- **Maximum 500 lines** for files
- Extract components into separate files when approaching limit
- Use barrel exports (`index.ts`) for clean imports

### 2. Functions: One Per File
Each Cloud Function goes in `packages/functions/src/fn/`:
```
src/fn/
├── healthCheck.ts    # Single function per file
├── createItem.ts
└── processTask.ts
```

### 3. Services: Domain Separation
Each service handles ONE business domain and uses a **folder structure**:
```
src/services/
├── user/
│   ├── constants.ts      # CONSTS, secrets definitions, config values
│   ├── messages.ts       # Dictionary and user-facing messages (if applicable)
│   ├── types.ts          # Service-specific types (shared types go in @$$PROJECT_NAME$$/shared)
│   ├── userCore.ts       # Core user operations (split when exceeding 500 lines)
│   └── userValidation.ts # Validation logic (splited file bacause userCore exceeded 500 lines)
├── email/
│   ├── constants.ts
│   ├── messages.ts
│   └── emailSender.ts
└── index.ts              # Barrel exports
```

**Rules:**
- Services should NOT import from other services
- Functions orchestrate multiple services
- Shared logic goes in utility files
- Split service logic into multiple files if exceeding 500 lines
- Shared types MUST be in `@$$PROJECT_NAME$$/shared`, service-specific types stay local

### 4. Shared Package
Types shared between frontend and backend live in `@$$PROJECT_NAME$$/shared`:
```typescript
import type { User } from '@$$PROJECT_NAME$$/shared';
```

---

## Frontend Guidelines

### Dashboard is PWA + Mobile-First
- Design mobile layouts FIRST
- Use responsive classes: `sm:`, `md:`, `lg:`
- Test on mobile devices

### Always Use shadcn/ui
```bash
cd packages/dashboard
npx shadcn@latest add [component-name]
```

### Component Structure
```
src/components/
├── ui/           # shadcn components
├── [feature]/    # Feature-specific components
```

### Data Fetching with React Query
All Firebase function calls MUST use React Query in dedicated hook files:
```
src/hooks/
├── queries/
│   ├── useUserQuery.ts       # User-related queries
│   ├── useItemsQuery.ts      # Item-related queries
│   └── index.ts              # Barrel exports
├── mutations/
│   ├── useCreateItem.ts      # Mutation hooks
│   └── index.ts
└── index.ts
```

**Rules:**
- One hook file per domain/feature
- Use optimized cache invalidation with proper `queryKey` patterns
- Leverage `staleTime`, `cacheTime`, and `refetchOnWindowFocus` appropriately
- Group related queries in the same file
- Export query keys for reuse in invalidations

### Client State with Zustand
Use Zustand stores for client-side state (UI state, optimistic updates):
```
src/stores/
├── uiStore.ts           # UI state (modals, sidebars, etc.)
├── [feature]Store.ts    # Feature-specific client state
└── index.ts             # Barrel exports
```

**Rules:**
- React Query handles server state, Zustand handles client state
- Use Zustand for cross-component state sharing
- Implement optimistic updates with error rollback

---

## Environment Variables

### Dashboard
- Use `VITE_` prefix for all variables
- Keep `.env.development` and `.env.production` separate

### Functions
- Use `process.env.VARIABLE_NAME`
- Keep secrets in `.env.local` (gitignored)

**NEVER commit `.env` or `.env.local` files**

---

## Common Commands

```bash
# Development
npm run dev           # Dashboard
npm run dev:website   # Website
npm run emulate       # With emulators

# Build
npm run build:shared  # Build shared first
npm run sync:functions # Sync shared to functions

# Deploy
npm run deploy        # Everything
npm run deploy:functions
npm run deploy:hosting
```

---

## Best Practices

1. **TypeScript**: Enable strict mode, use explicit types
2. **Error Handling**: Use `HttpsError` in functions
3. **Logging**: Use `logger` from firebase-functions
4. **Git**: Follow conventional commits (feat:, fix:, etc.)
