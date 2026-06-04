# 📋 Rapport de comparaison — Fonctionnalités EN PRODUCTION vs PRÉVUES (PRD)

> **Date :** 2026-06-04
> **Production :** branche `main` déployée (Vercel + Render), commit vérifié via `/health`.
> **Référence prévue :** PRD `CONTENTIQ_Plan_Developpement.docx` v1.0.
> **Légende :** ✅ En production · 🟡 Partiel en production · ❌ Prévu, non livré · ➕ Livré en plus (hors PRD)

---

## 1. Tableau de bord exécutif (scorecard)

| Module | Features prévues | ✅ En prod | 🟡 Partiel | ❌ Manquant | Couverture |
|---|---:|---:|---:|---:|---:|
| 1. Auth & comptes | 9 | 8 | 0 | 1 | 🟢 ~90 % |
| 2. Génération IA | 11 | 10 | 1 | 0 | 🟢 ~90 % |
| 3. Templates | 6 | 3 | 1 | 2 | 🟡 ~55 % |
| 4. Historique & favoris | 8 | 6 | 1 | 1 | 🟡 ~75 % |
| 5. Exports | 6 | 5 | 0 | 1 | 🟢 ~85 % |
| 6. Crédits & Stripe | 9 | 5 | 1 | 3 | 🟡 ~60 % |
| 7. IQ Assistant | 7 | 6 | 1 | 0 | 🟢 ~85 % |
| 8. Couche vocale | 9 | 5 | 2 | 2 | 🟡 ~65 % |
| 9. Analytics & Admin | 8 | 4 | 0 | 4 | 🟡 ~45 % |
| **TOTAL** | **73** | **52** | **7** | **14** | **🟡 ~71 %** |

> **Lecture :** ~71 % des features prévues sont pleinement en production, ~10 % partiellement, ~19 % restent à livrer. Le **chemin critique (auth → génération → édition → historique → paiement abonnement)** est intégralement en production.

---

## 2. Comparaison détaillée par module

### Module 1 — Authentification & comptes
| Fonctionnalité prévue (PRD) | Statut prod |
|---|---|
| Inscription email + vérification email | ✅ |
| Connexion OAuth Google | ✅ |
| Refresh token silencieux (rotation) | ✅ |
| Reset mot de passe (lien email 1h) | ✅ |
| Rôles Free/Pro/Business/Admin | ✅ |
| Profil : nom, bio | ✅ |
| Préférences langue interface (FR/EN) | ✅ |
| Préférences vocales (voix, vitesse, autoTTS) | ✅ |
| Avatar (upload Cloudinary) | ❌ |

### Module 2 — Génération de contenu IA
| Fonctionnalité prévue | Statut prod |
|---|---|
| 12 types de contenu | ✅ |
| Langues sortie (FR/EN/ES/AR) | ✅ |
| 6 tons | ✅ |
| Longueurs (court/moyen/long/perso) | ✅ |
| Mots-clés, audience, contexte | ✅ |
| Streaming token-par-token (SSE) | ✅ |
| Bouton Stop | ✅ |
| Auto-save brouillon 30s | ✅ |
| Bouton Régénérer | ✅ |
| Bouton Améliorer | ✅ |
| Éditeur rich text (undo/redo, compteur mots) | 🟡 TipTap ✅ ; **mode plein écran ❌** |

### Module 3 — Templates
| Fonctionnalité prévue | Statut prod |
|---|---|
| Templates système (10+) | ✅ (seed) |
| CRUD templates personnalisés | ✅ |
| Catégorisation | ✅ |
| Variables dynamiques `{{...}}` (substitution) | ❌ |
| Partage read-only (Pro → Free) | 🟡 modèle prêt, UI partielle |
| Import/Export JSON | ❌ |

### Module 4 — Historique & favoris
| Fonctionnalité prévue | Statut prod |
|---|---|
| Sauvegarde auto des générations | ✅ |
| Titre auto-généré par IA | ✅ |
| Métadonnées (date, type, tokens, durée) | ✅ |
| Recherche full-text | ✅ |
| Filtres (type, langue, date, favori, tag) | ✅ |
| Tags libres | ✅ |
| Vue liste/grille + pagination | 🟡 pagination ✅ ; **infinite scroll ❌** |
| Actions groupées (export/suppr/tag) | 🟡 export ZIP ✅ ; reste partiel |

### Module 5 — Exports
| Fonctionnalité prévue | Statut prod |
|---|---|
| Export PDF | ✅ |
| Export DOCX | ✅ (gating Pro+ via `checkExportPlan`) |
| Export Markdown | ✅ (gating Pro+) |
| Export TXT | ✅ |
| Gating par plan (DOCX/MD = Pro+) | ✅ (`checkExportPlan`, en controller) |
| Bulk ZIP (BullMQ + Cloudinary + Socket) | ❌ (remplacé par jszip client) |

### Module 6 — Crédits & Stripe
| Fonctionnalité prévue | Statut prod |
|---|---|
| Checkout abonnement (Pro/Business) | ✅ |
| Portail client Stripe | ✅ |
| Webhooks (succeeded/updated/deleted/failed) | ✅ |
| Déduction crédits à la génération | ✅ (proportionnelle aux tokens) |
| Alerte 20 % crédits restants | ✅ |
| Reset mensuel automatique des crédits | ❌ |
| Achat crédits à la carte (10$/100) | ❌ |
| Billing annuel (toggle backend) | 🟡 UI ✅ ; **backend mensuel seul** |
| Grace period 3j → downgrade auto | ❌ |

### Module 7 — IQ Assistant
| Fonctionnalité prévue | Statut prod |
|---|---|
| Widget chat flottant toutes pages | ✅ |
| Context-aware (page, éditeur) | ✅ |
| Historique multi-tours (max 20) | ✅ |
| Sauvegarde `AssistantSession` | ✅ |
| Limite Free 5 msg/jour | ✅ |
| Reset conversation (DELETE session) | ✅ |
| Injection plan + crédits restants | 🟡 page/éditeur ✅ ; plan/crédits partiel |

### Module 8 — Couche vocale
| Fonctionnalité prévue | Statut prod |
|---|---|
| Voice commands (Web Speech STT) | ✅ |
| Matching commandes → actions | ✅ (NLU via Claude, ≠ annyang) |
| Raccourci clavier | ✅ |
| Conversation vocale avec l'assistant | ✅ |
| TTS ElevenLabs (+ fallback natif) | ✅ |
| Préférences voix (5 voix, vitesse) | 🟡 vitesse ✅ ; sélection voix partielle |
| Whisper STT (fallback) | ❌ (stub 501) |
| Visualiseur d'onde (Canvas amplitude) | ❌ (orb sans amplitude) |
| Gestion permissions/erreurs/timeout | 🟡 permissions ✅ ; timeout partiel |

### Module 9 — Analytics & Admin
| Fonctionnalité prévue | Statut prod |
|---|---|
| Dashboard user (jauge crédits, graphes Recharts) | ✅ |
| Répartition types (camembert) | ✅ |
| Activité journalière (barres) | ✅ |
| Score qualité moyen (admin) | ➕ ✅ (ajouté hors PRD, Session 17) |
| Gestion utilisateurs (recherche, plan, ban) | ✅ |
| Logs (commandes vocales, app logs) | ✅ |
| Métriques business (MRR/ARR/ARPU/churn) | ❌ |
| DAU/MAU + taux d'échec API (Claude/11L/Whisper) | ❌ |

---

## 3. Livré EN PLUS du PRD (➕ bonus)

Fonctionnalités présentes en production mais non demandées par le PRD :

- ➕ **i18n complète FR/EN** (toutes pages, tous toasts) — Session 16
- ➕ **Evals de qualité LLMOps** non bloquants + score persisté + carte admin — Session 17
- ➕ **Prompt caching** Anthropic sur l'historique assistant — Session 17
- ➕ **Runner d'eval offline** (`pnpm eval:content`) — Session 17
- ➕ **Observabilité déploiement** : `/health` expose le SHA du commit — Session 17
- ➕ **Logging applicatif persisté** (`AppLog`, TTL 90j) — au-delà du PRD
- ➕ **Version Mobile** (écrans responsive dédiés + MobileTabBar)

---

## 4. Conclusion du rapport

| Indicateur | Valeur |
|---|---|
| Features PRD pleinement en prod | **52 / 73 (~71 %)** |
| Features partielles | **7 / 73 (~10 %)** |
| Features non livrées | **14 / 73 (~19 %)** |
| Chemin critique utilisateur | ✅ **100 % en production** |
| Features bonus hors PRD | **7** |

**Verdict :** Content.IQ est un **produit fonctionnel et commercialisable en production**, couvrant l'essentiel du PRD. Les 21 % manquants sont surtout des **automatisations backend** (reset crédits, grace period, bulk async) et des **promesses payantes avancées** (Whisper, topup, API, équipe). Aucune fonctionnalité du parcours principal n'est bloquante.

> Détail des causes et plan d'action : voir `docs/Analyse-Conformite-PRD.md`.
