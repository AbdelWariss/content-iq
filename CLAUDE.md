# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev (server + client simultanément)
pnpm dev

# Build complet (shared → client → server)
pnpm build

# Lint / format (Biome)
pnpm lint
pnpm lint:fix
pnpm format

# Typecheck (client + server)
pnpm typecheck
pnpm --filter client typecheck
pnpm --filter server typecheck

# Tests
pnpm test                            # tous les tests
pnpm --filter server test            # serveur seulement
pnpm --filter client test            # client seulement
pnpm --filter server test -- --reporter=verbose  # test unique verbeux

# Seed DB (templates système + admin)
pnpm seed

# Docker (MongoDB + Redis en local)
docker-compose up -d mongodb redis
```

Le serveur tourne sur le port **5001** (5000 est réservé par AirPlay sur macOS). Le client tourne sur **5173**.

## Architecture

### Monorepo pnpm workspaces

```
contentiq/
├── client/          # React 18 + Vite + TypeScript
├── server/          # Express 5 + TypeScript
└── packages/shared/ # Types et schémas Zod partagés (compilé avec tsup)
```

`@contentiq/shared` doit être rebuild (`pnpm --filter shared build`) avant toute modification de types ou schémas, car le server et le client en dépendent.

### Backend (`server/src/`)

**Pattern request lifecycle :**
`route → middleware (authenticate / checkCredits) → controller → service → model`

- **`config/env.ts`** — validation Zod de toutes les variables d'environnement au démarrage. Le process s'arrête si une variable requise est absente.
- **`middleware/errorHandler.ts`** — classes d'erreur (`AppError`, `ValidationError`, `UnauthorizedError`, etc.) à throw dans les controllers. Le handler global les convertit en JSON `{ success: false, error: { code, message } }`.
- **`services/claude.service.ts`** — streaming SSE vers Anthropic. Les erreurs Anthropic sont sanitisées via `sanitizeStreamError()` avant d'être envoyées au client ; le message brut est loggé via `appLog()`.
- **`utils/appLog.ts`** — logging applicatif persisté en MongoDB (collection `applogs`, TTL 90 jours). Fire-and-forget : n'interrompt jamais la requête.
- **`utils/logger.ts`** — Winston : format colorisé en dev, JSON en production.

**Auth flow :**
- Access token JWT (15min) dans le header `Authorization: Bearer`.
- Refresh token JWT (7j) en cookie httpOnly `SameSite=None; Secure` (cross-domain Vercel→Render).
- Google OAuth via Passport — le callback redirige vers `CLIENT_URL/auth/callback?token=<accessToken>`.

**Toutes les routes sont prefixées `/api/`** (`/api/auth`, `/api/content`, `/api/admin`, etc.).

### Frontend (`client/src/`)

**State management :**
- **Redux** (`store/`) — état global auth, content (streaming), assistant, voice.
- **TanStack Query** — toutes les requêtes réseau sauf le streaming SSE.
- Le streaming SSE (génération de contenu) bypasse axios et utilise `fetch()` directement via `useStreaming`.

**`services/axios.ts`** — instance axios partagée avec `baseURL: VITE_API_URL`, `withCredentials: true`, et deux intercepteurs :
1. Request : attache le token depuis Redux.
2. Response : refresh silencieux sur 401 (sauf routes dans `AUTH_ROUTES`).

**Ne pas utiliser l'instance `api` (axios) dans `GoogleCallbackPage`** — utiliser `fetch()` directement pour éviter que l'intercepteur de refresh ne court-circuite le flux OAuth.

**Design system (`index.css`) :**
- Variables CSS custom : `--bg`, `--bg-elev`, `--bg-sunk`, `--ink`, `--ink-soft`, `--ink-mute`, `--accent` (coral), `--voice` (teal), `--radius`, `--font-sans`, `--font-serif`, `--font-mono`.
- Classes utilitaires : `.card`, `.btn`, `.btn-primary`, `.btn-accent`, `.btn-outline`, `.btn-ghost`, `.seg`, `.input`, `.select`, `.pill`, `.chip`, `.gauge`.
- Icônes SVG inline via `client/src/lib/ciq-icons.tsx` (`CiqIcon.*` + composant `<Ico>`). Préférer ces icônes à lucide-react pour les nouveaux composants.

**i18n :** `client/src/locales/fr.ts` et `en.ts`. Toutes les chaînes UI doivent passer par `useTranslation()`.

### `packages/shared/`

Contient les types TypeScript (`ContentType`, `UserRole`, `PlanLimits`, etc.) et les schémas Zod (`GenerateContentSchema`, `RegisterSchema`, `LoginSchema`, etc.) utilisés par le server ET le client. Modifier ici → rebuild → les deux côtés bénéficient des changements.

## Conventions

**Réponses API :** toujours `{ success: true, data: {...} }` en succès, `{ success: false, error: { code, message } }` en erreur.

**Suppression de contenu :** soft delete uniquement — `status: "archived"`. Ne jamais supprimer physiquement un document `Content`.

**Variables d'environnement côté serveur :** toutes validées par Zod dans `config/env.ts`. Accéder via `env.VARIABLE` (jamais `process.env.VARIABLE` directement).

**Variables d'environnement côté client :** préfixées `VITE_` (ex: `VITE_API_URL`).

**Tests serveur :** Vitest + Supertest. Mocker `rateLimiter`, les models Mongoose et les services email/credits. Utiliser `createApp()` directement sans connexion DB réelle.

**Linting :** Biome (remplace ESLint + Prettier). `useImportType` est enforced — utiliser `import type` pour les imports de types TypeScript.

## Déploiement

- **Frontend** → Vercel (`vercel.json` à la racine). Build : `pnpm --filter @contentiq/shared build && pnpm --filter client build`.
- **Backend** → Render, Docker (`server/Dockerfile`). pnpm fixé à `10.33.3` pour correspondre au lockfile. `pnpm deploy --prod --legacy` crée un `node_modules` autonome sans symlinks.
- **`GOOGLE_CALLBACK_URL`** doit pointer vers `https://<backend>/api/auth/google/callback`.
- **`CLIENT_URL`** sur Render ne doit pas avoir de slash final (le CORS en dépend).
