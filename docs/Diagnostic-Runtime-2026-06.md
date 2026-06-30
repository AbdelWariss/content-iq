# 🔬 Diagnostic runtime — Content.IQ

> **Date :** 2026-06-10
> **Méthode :** exécution réelle de la stack (typecheck, lint, tests + couverture, build, eval LLM live, inspection boot/config). Pas d'analyse purement statique.
> **Commit prod au moment du diagnostic :** `3a58002` (vérifié via `/health`).

---

## 1. Résultats des tests runtime exécutés

| Test runtime | Résultat | Verdict |
|---|---|---|
| `pnpm typecheck` (client+server) | 0 erreur | ✅ |
| `pnpm test` | 104 verts (72 serveur + 32 client) | ✅ |
| `pnpm --filter server run eval:content` (Claude réel, 6 cas) | **100 % — 0 erreur API** | ✅ chaîne IA saine |
| `pnpm build` | ~11 s, 17 chunks lazy | ✅ |
| `pnpm lint` | exit 0, 116 warnings (code suivi) | 🟡 |
| Couverture serveur | 17 % global (polluée par `dist/`) | 🔴 |
| Boot serveur (`index.ts`) | `connectDB()` avant HTTP → `exit(1)` si DB down | 🔴 |
| Bundles (`client/dist`) | JS total 1507 KB / ~433 KB gzip | 🟡 |

**Couverture par couche (serveur, hors dist) :**
| Couche | Couverture |
|---|---|
| `models` | 98 % ✅ |
| `utils` | 96 % ✅ |
| `middleware` | 60 % 🟡 |
| `controllers` | **16 %** 🔴 |
| `services` | **22 %** 🔴 |

**Bundles JS notables :** `vendor` 526 KB · `editor` (TipTap, lazy) 288 KB · `index` 166 KB · **`HistoryPage` 114 KB** (jszip importé statiquement) · `i18n` 70 KB.

> Le **cœur produit (génération IA) est excellent** : 100 % de pass à l'eval live (format HTML, langue, longueur tous conformes). Les faiblesses sont **périphériques** au cœur.

---

## 2. Faiblesses identifiées

### 🔴 Critiques

**F1 — Couverture de tests très basse sur la logique métier.** Controllers 16 %, services 22 %. Les chemins critiques (webhooks Stripe, `claude.service`, `stripe.controller`, `content.controller`, `export.controller`, `assistant`) sont quasi non testés. La **facturation** (bug = perte d'argent) est la moins couverte.

**F2 — Zéro résilience au démarrage.** `index.ts` fait `await connectDB()` **avant** de créer le serveur HTTP ; `db.ts` fait `process.exit(1)` en cas d'échec. Un hoquet Atlas/Upstash = crash total, `/health` injoignable, pas de mode dégradé.

**F3 — Le `.env` local pointe sur la PROD.** `MONGODB_URI` → Atlas (`contentiq-cluster…mongodb.net`), `REDIS_URL` → Upstash. Un `pnpm dev` ou surtout `pnpm seed` lancé en local **écrit dans la base de production**. Aucun fichier d'env dev/staging séparé.

### 🟠 Importantes

**F4 — Couverture faussée par `dist/`.** La config de couverture inclut le code compilé (`server/dist/*` à 0 %) → métriques trompeuses + run plus lent.

**F5 — Infrastructure morte.** `socket.io` + `global.io` câblés dans `index.ts` « pour les workers BullMQ » qui n'existent pas. Code non utilisé, non testé, capacité fictive.

**F6 — Bundle `HistoryPage` 114 KB.** `import JSZip from "jszip"` (statique) embarqué dans le chunk de la page → devrait être un `import()` dynamique (chargé seulement à l'export ZIP).

**F7 — Aucun test E2E** (Playwright/Cypress) malgré l'exigence PRD — flux Free→Pro→Generate→Export jamais validé bout-en-bout.

**F8 — Whisper STT = stub `501`** (`voice.controller.ts`) — feature vocale annoncée non livrée.

### 🟡 Mineures

**F9 — 116 warnings lint** (code suivi), dominés par `useExhaustiveDependencies` (deps de hooks React, surtout composants Voice) → risque de closures périmées.

**F10 — Sentry non branché** malgré `SENTRY_DSN` dans l'env → aucune visibilité erreurs prod.

**F11 — Typage fragile** du webhook Stripe (`as unknown` sur `current_period_end`).

---

## 3. Recommandations priorisées

| Priorité | Action | Faiblesse | État |
|---|---|---|---|
| **P0** | `.env.development` séparé (Mongo/Redis locaux) + garde anti-prod sur `seed` | F3 | ✅ `18e31ba` |
| **P0** | Tests services/controllers : webhooks Stripe (idempotence, grace, reset), réconciliation crédits | F1 | ✅ `1385802` |
| **P1** | Boot résilient : HTTP avant DB + `/health` reflétant l'état DB + retry au lieu de `exit(1)` | F2 | ✅ `ac011f5` |
| **P1** | Exclure `dist/` de la couverture | F4 | ✅ `18e31ba` |
| **P2** | `jszip` dynamique (HistoryPage 114→21 KB) | F6 | ✅ `315572a` |
| **P2** | Brancher Sentry (init conditionnel `SENTRY_DSN`) | F10 | ✅ `aa4c67c` |
| **P2** | Trancher socket.io | F5 | ✅ conservé + documenté `aa4c67c` |
| **P2** | Corriger hook deps Voice (anti-closures périmées) | F9 | ✅ `1353766` |

### Reste ouvert (hors périmètre prioritaire initial)

| Faiblesse | Statut | Note |
|---|---|---|
| **F7** — Aucun test E2E (Playwright/Cypress) | ⏳ non traité | Flux Free→Pro→Generate→Export non validé bout-en-bout |
| **F8** — Whisper STT stub `501` | ⏳ non traité | Feature vocale annoncée, non livrée |
| **F11** — Typage fragile webhook Stripe (`as unknown`) | ⏳ non traité | Cosmétique, sans impact runtime |

> **Décision F5 :** socket.io conservé volontairement comme point d'ancrage temps-réel, mais annoté `INFRA EN ATTENTE D'USAGE` dans `index.ts` (aucun producteur d'événement aujourd'hui).

---

## 4. Synthèse

Cœur **solide** (IA 100 %, build/types/tests verts) mais **dette de fiabilité périphérique** : tests insuffisants là où ça compte (billing), pas de résilience au démarrage, config locale dangereuse. Le travail correctif suit l'ordre P0 → P1 → P2.
