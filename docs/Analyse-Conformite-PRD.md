# 📊 Analyse de conformité au PRD — Content.IQ

> **Date :** 2026-06-04
> **Référence :** `CODEXA Content.IQ/CONTENTIQ_Plan_Developpement.docx` (PRD v1.0, Mai 2026)
> **Méthode :** confrontation module par module du PRD au code réel (`main`, déployé en prod).
> **Auteur de l'analyse :** revue technique automatisée.

---

## A. Conformité par module

| Module PRD | État | Détail |
|---|---|---|
| **1. Auth & comptes** | 🟢 ~90 % | Email+password, OAuth Google, refresh rotation, reset, vérif email, rôles, préférences ✅ — **manque** : upload avatar Cloudinary |
| **2. Génération IA** | 🟢 ~90 % | Streaming SSE, 12 types, tons, longueurs, mots-clés, audience, stop, régénérer, améliorer, auto-save 30s ✅ |
| **3. Templates** | 🟡 ~55 % | CRUD complet + seed système ✅ — **manque** : substitution de variables `{{...}}`, import/export JSON, partage read-only Pro |
| **4. Historique & favoris** | 🟡 ~75 % | Liste, filtres, recherche full-text, tags, favoris, soft delete ✅ — **manque** : infinite scroll, actions groupées complètes |
| **5. Exports** | 🟢 ~85 % | PDF/DOCX/MD/TXT immédiats **avec gating par plan** (`checkExportPlan`) ✅ — **manque** : bulk ZIP serveur (BullMQ+Cloudinary+Socket) remplacé par jszip client |
| **6. Crédits & Stripe** | 🟡 ~60 % | Checkout abonnement, portail, webhooks, crédits proportionnels ✅ — **manque** : **reset mensuel auto**, topup à la carte, billing annuel backend, grace period auto |
| **7. IQ Assistant** | 🟢 ~85 % | Chat contextuel, historique 20 msg, limite Free 5/j, caching ✅ — contexte plan/crédits partiellement injecté |
| **8. Couche vocale** | 🟡 ~65 % | Web Speech STT, NLU (via Claude), TTS ElevenLabs, raccourci clavier ✅ — **manque** : **Whisper fallback (stub 501)**, visualiseur d'onde Canvas |
| **9. Analytics & Admin** | 🟡 ~45 % | Dashboard user (Recharts), stats admin de base, gestion users, logs ✅ — **manque** : MRR/ARR/ARPU, churn, DAU/MAU, taux d'échec API |

---

## B. Fonctionnalités PRD manquantes (par criticité)

### 🔴 Critique (logique métier cassée ou contournable)

1. **Reset mensuel des crédits non automatisé** — `credits.resetDate` est posé mais **aucun mécanisme ne réinitialise les crédits**. Le dossier `server/src/jobs/` (PRD : `creditResetWorker`) **n'existe pas**, BullMQ n'est **pas utilisé**. → Les utilisateurs ne récupèrent jamais leurs crédits mensuels.
2. **Grace period 3 jours non automatisée** — le webhook passe en `past_due` mais rien ne downgrade après 3 jours (`subscription.gracePeriodEnd` défini mais jamais exploité).

> ⚠️ **Correction (2026-06-04)** : le **gating par plan des exports**, d'abord signalé comme absent, est en réalité **implémenté** dans `export.controller.ts` via `checkExportPlan(format, role)` (vérifie `PLAN_LIMITS[role].exports` et lève `ForbiddenError`). Un Free ne peut PAS exporter DOCX/MD. Ce n'est donc **pas** une faiblesse — l'erreur initiale venait de n'avoir lu que le fichier de routes. Voir section C #1 pour la nuance restante.

### 🟠 Important (features payantes annoncées absentes)

4. **Whisper STT (fallback voix)** — `transcribe` renvoie **501 Not Implemented**.
5. **Bulk export serveur** — PRD : BullMQ → ZIP → Cloudinary 24h → notif Socket.io. Réalisé en **client-side jszip** (Session 15). Socket.io est **câblé mais aucun producteur n'émet** d'événement.
6. **Achat de crédits à la carte** (10$/100) — `credits.routes` n'a que `getCredits`/`getHistory`, aucun checkout topup.
7. **Billing annuel** — le toggle mensuel/annuel **existe en UI** mais le backend n'a qu'un `STRIPE_PRO_PRICE_ID` mensuel → le checkout ignore l'annuel.
8. **Upload avatar Cloudinary** — aucun endpoint multer/upload (Cloudinary n'est que dans la CSP).
9. **API Access (Business, 100K req/mois)** — flag `apiAccess` dans `PLAN_LIMITS` mais **aucun système de clés API ni endpoints**.
10. **Team seats (Business, 5 sièges)** — flag `teamSeats` mais **aucun système d'équipe/invitation**.

### 🟡 Secondaire (UX / polish PRD)

11. **Variables de templates `{{...}}`** — modèle prêt, **pas d'UI** de substitution ni import/export JSON.
12. **Dashboard admin avancé** — MRR/ARR/ARPU, churn, DAU/MAU, taux d'échec Claude/ElevenLabs/Whisper.
13. **Dark mode** — non implémenté sur le design system custom.
14. **Mode plein écran éditeur** — absent.
15. **Infinite scroll historique** — pagination classique seulement.
16. **Visualiseur d'onde audio (Canvas)** — `VoiceOrb` existe mais pas de visualisation d'amplitude temps réel.

---

## C. Faiblesses techniques (qualité / sécurité / robustesse)

| # | Faiblesse | Gravité | Détail |
|---|---|---|---|
| 1 | **Gating de plan en controller, pas en middleware** | 🟡 | Le gating fonctionne (export via `checkExportPlan`, voix via `planLimits.voiceCommands`) mais est **dispersé inline** dans les controllers ; `authorize` n'est utilisé que sur `/admin`. Un oubli sur une future route passerait silencieusement. Centraliser via middleware serait plus sûr. |
| 2 | **Webhooks Stripe non idempotents** | 🟠 | Pas de déduplication par `event.id` → un webhook rejoué peut re-créditer/re-traiter. |
| 3 | **Typage fragile webhook** | 🟡 | `current_period_end` casté en `unknown` → cast manuel risqué si Stripe change. |
| 4 | **Socket.io mort** | 🟡 | Infrastructure montée (`io`, rooms) mais jamais utilisée → code non testé, fausse capacité. |
| 5 | **Aucun test E2E** | 🟠 | PRD exige Playwright/Cypress (flow Free→Pro→Generate→Export). Seuls des tests unitaires/intégration existent. |
| 6 | **Couverture de tests partielle** | 🟡 | 63 tests serveur mais services clés non testés (claude.service, stripe.controller, export.controller). |
| 7 | **Pas de monitoring d'erreurs** | 🟡 | `SENTRY_DSN` dans l'env mais Sentry non branché. |
| 8 | **Bulk client-side = limite navigateur** | 🟡 | jszip charge tout en mémoire → KO sur gros volumes (le PRD prévoyait justement BullMQ pour ça). |

> ✅ Pour rappel, la **Session 17** a déjà corrigé : facturation proportionnelle, race condition crédits, `generationTime`, validation NLU, prompt caching, evals qualité, observabilité `/health`.

---

## D. Déviations assumées (acceptables — pas des bugs)

| PRD | Réel | Verdict |
|---|---|---|
| Railway (backend) | **Render** | ✅ OK |
| React Quill | **TipTap** (`RichEditor`) | ✅ OK (plus moderne) |
| annyang.js + fuzzy | **NLU via Claude (JSON)** | ✅ Meilleur (zéro modèle à entraîner) |
| Socket.io streaming | **SSE** | ✅ Meilleur pour du unidirectionnel |
| Express 4 | **Express 5** | ✅ OK |

---

## E. Backlog priorisé pour atteindre le PRD

> Numérotation alignée sur la chronologie réelle du projet (dernière en date : Session 17). Le travail restant continue donc en **Session 18+**.

### Session 18 — Logique métier critique
- [ ] **Reset mensuel des crédits** (reset paresseux on-read, ou job BullMQ) — réactive le quota mensuel
- [ ] **Grace period 3j → downgrade auto** (exploitation `gracePeriodEnd`)
- [ ] **Idempotence des webhooks Stripe** (table d'`event.id` traités)
- [ ] _(optionnel)_ Centraliser le gating de plan via middleware (defense-in-depth)

### Session 19 — Features payantes annoncées
- [ ] **Whisper STT** (implémenter `transcribe` avec OpenAI)
- [ ] **Topup crédits à la carte** (checkout Stripe one-time)
- [ ] **Billing annuel** (price IDs annuels + passage au checkout)
- [ ] **Upload avatar Cloudinary** (multer + endpoint)
- [ ] **Bulk export serveur** (BullMQ → ZIP → Cloudinary → notif Socket.io)

### Session 20 — Complétude & qualité
- [ ] **Variables de templates `{{...}}`** + import/export JSON
- [ ] **Dashboard admin avancé** (MRR/ARR/churn/DAU/MAU, taux d'échec API)
- [ ] **Tests E2E Playwright** (flow critique) + tests services (claude/stripe/export)
- [ ] **Sentry** branché
- [ ] **API Access** (clés + quotas) et **Team seats** (si on garde ces promesses Business)

### Session 21 — Polish UX PRD
- [ ] Dark mode · mode plein écran éditeur · infinite scroll · visualiseur d'onde Canvas

### Session 22 — Correctifs UX mobile & durcissement assistant vocal ✅ (réalisée)
- [x] Page tarifs responsive · réponse vocale TTS · wake word (CODEXA, persistance, tolérance) · prononciation « IQ » · TTS natif moins robotique · assistant agit sur le contenu. Détail : `CODEXA Content.IQ/Travail Éffectué.md` (Session 22).

### Session 23 — Assistant vocal interactif (chantier dédié)
- [ ] **Auto-application vocale des modifications** : améliorer / traduire / exporter / favori / regénérer un contenu **désigné** (courant, dernier, par type) + boucle conversationnelle cadrée.
- 📄 Plan détaillé : [`docs/Session-23-Assistant-Vocal-Interactif.md`](./Session-23-Assistant-Vocal-Interactif.md)

---

## Synthèse

Le projet couvre **~71 % du PRD** et le **chemin critique (auth → génération → édition → historique → paiement)** est solide et en production. Les manques se concentrent sur **2 angles** :

1. **Automatisations backend** (reset crédits, grace period, bulk async) — les plus risqués métier.
2. **Features payantes annoncées** (Whisper, topup, annuel, API, équipe) — impact commercial/crédibilité.

Le gating de plan, lui, **fonctionne** (en controller) ; il gagnerait juste à être centralisé en middleware.
