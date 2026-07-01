# Session 22 — Assistant vocal interactif : auto-application des modifications

> **Statut :** 📋 Planifié (non démarré)
> **Numérotation :** suit les Sessions 18 → 21 déjà réalisées (le projet numérote en « Sessions », pas en « Sprints »). Ce chantier est la **Session 22**.
> **Pré-requis :** branche de session dédiée (`feat/voice-interactive`), à ouvrir depuis `main` une fois le lot vocal courant (`fix/mobile-pricing-voice`) mergé.

---

## 1. Contexte & problème

À l'issue de la Session 21, l'assistant vocal (`GlobalVoiceAssistant` + NLU `/voice/intent`) sait :

- **Générer** un contenu (remplit sujet/type/ton dans le store → `/generate?autostart=1` → génération lancée) ✅
- **Lire / Copier** le contenu courant de l'éditeur (Redux `content.editorContent`) ✅
- **Rester cadré** : rappel vocal des capacités hors périmètre ✅

**Ce qui manque (objet de cette session) :** quand l'utilisateur demande **une modification sur un contenu précis** (« améliore le dernier contenu », « traduis en anglais le post actuel », « exporte-le en PDF »), l'assistant **ouvre seulement** le contenu — il **n'exécute pas** réellement l'amélioration/traduction/export. De plus, l'échange n'est pas **multi-tour** : pas de demande de précision en cas d'ambiguïté.

Les briques serveur existent déjà :

| Action | Endpoint | Middleware |
|--------|----------|-----------|
| Améliorer | `POST /api/content/:id/improve` | `checkCredits` |
| Traduire | `POST /api/content/translate` | `checkCredits` |
| Favori | `PATCH /api/content/:id/favorite` | — |
| Mettre à jour | `PUT /api/content/:id` | — |
| Exporter | `GET /api/export/:id/:format` | `checkExportPlan` |

Le travail est donc majoritairement **côté client** (câblage + résolution de cible + boucle conversationnelle), avec quelques ajouts NLU serveur.

---

## 2. Objectifs de la Session 22

1. **Résolution de cible** — l'assistant identifie **sur quel contenu** agir : le contenu **courant** (éditeur), le **dernier généré**, ou un contenu **désigné** (« mon post LinkedIn », « le contenu d'hier »).
2. **Auto-application réelle** des modifications par la voix : `improve`, `translate`, `export`, `favorite`, `clear/regenerate` — exécutées via API avec **retour vocal** et mise à jour de l'éditeur.
3. **Boucle conversationnelle cadrée (multi-tour)** : si la demande est ambiguë ou incomplète, l'assistant **pose une question de précision** ; hors périmètre, il **rappelle ses limites** (déjà en place, à étendre au multi-tour).
4. **Robustesse produit** : états (écoute / traitement / erreur), **coût crédits** annoncé, **plan gating** respecté, échecs gérés (STT indisponible, hors ligne).

---

## 3. Périmètre

### Dans le périmètre ✅
- Cible = contenu courant (`content.savedContentId` / éditeur) **ou** dernier généré (`GET /content?limit=1`).
- Actions auto-appliquées : améliorer, traduire, exporter, favori, effacer/regénérer.
- Boucle multi-tour minimale : 1 question de précision (ex. « Vers quelle langue ? », « Quel format ? »).
- Retour vocal + visuel de chaque action ; respect crédits/plan.

### Hors périmètre ❌ (sessions ultérieures)
- Édition ciblée d'un **passage** du contenu (« change le 2e paragraphe ») — nécessite ancrage sémantique.
- Résolution par **recherche libre** floue (« le truc sur le marketing de la semaine dernière ») au-delà d'un simple « dernier / actuel / par type ».
- **STT sur iOS** (limite plateforme documentée — hors de notre contrôle).
- Voix premium ElevenLabs (dépend d'un **plan payant ElevenLabs** — décision commerciale séparée).

---

## 4. Découpage en tâches

### T1 — Contexte de contenu partagé pour l'assistant
- Exposer au `GlobalVoiceAssistant` : `savedContentId`, `editorContent`, et un helper `resolveTargetContent()` qui renvoie `{ id, body, source: "current" | "last" | "byType" }`.
- « dernier généré » : `contentService.list({ limit: 1, sort: -createdAt })` (endpoint existant).
- **Livrable :** hook/util `useVoiceContentTarget()`.

### T2 — Étendre le NLU pour la cible + la langue/format
- `VOICE_COMMANDS_PROMPT` (`voice.controller.ts`) : ajouter aux `params` des commandes `improve/translate/export` un champ `target` (`"current" | "last" | "byType:<type>"`) et compléter `translate.targetLang` / `export.format`.
- Étendre `VoiceCommandResultSchema` (Zod) en conséquence.
- **Livrable :** NLU renvoie la cible + les paramètres nécessaires.

### T3 — Exécuteurs d'actions (client)
- Dans `executeCommand`, brancher réellement :
  - `improve` → `POST /content/:id/improve` → remplace l'éditeur (dispatch `setEditorContent`) + retour vocal.
  - `translate` → `contentService.translate(id, lang)` → affiche/insère la traduction.
  - `export` → `exportService.download(id, format)`.
  - `favorite` → `PATCH /content/:id/favorite`.
  - `clear/regenerate` → reset + relance génération avec mêmes params.
- Gérer `isProcessing`, erreurs (toast + vocal), et **crédits** (message si insuffisant).
- **Livrable :** les 5 actions s'exécutent par la voix bout-en-bout.

### T4 — Boucle conversationnelle multi-tour
- Machine à états légère : `idle → listening → needClarification → executing → done`.
- Si `translate` sans langue → demande vocale « Vers quelle langue ? » puis ré-écoute (une relance).
- Si aucune cible résoluble → « Je n'ai pas trouvé de contenu à modifier. Voulez-vous en générer un ? ».
- Hors périmètre → rappel des capacités (réutiliser `voice.cmdScope`).
- **Livrable :** un aller-retour de précision fonctionnel.

### T5 — États, coûts & garde-fous
- Annonce du coût crédits avant une action facturée (improve/translate/generate).
- Respect `plan gating` (déjà via `checkCredits`/`checkExportPlan` côté serveur ; refléter côté vocal).
- États visuels dans l'overlay (traitement, succès, erreur) alignés au retour vocal.
- **Livrable :** parcours robuste, pas d'action silencieuse.

### T6 — Tests & docs
- Tests client : `executeCommand` (mock API) pour chaque action + résolution de cible.
- Test serveur : NLU renvoie `target`/`targetLang`/`format` sur cas types.
- MAJ `Travail Éffectué.md` (Session 22) + handoff mémoire.
- **Livrable :** vert (typecheck 0, lint 0), doc à jour.

---

## 5. Design technique (résumé)

```
Voix → STT (Web Speech) → /voice/intent (NLU: command + target + params)
     → resolveTargetContent(target) → { id, body }
     → executor(command, id, params)  [improve|translate|export|favorite|clear]
     → maj éditeur (Redux) + retour vocal (speak) + toast
     ↳ si params manquants → needClarification → relance écoute (1 tour)
```

- **Source de vérité contenu :** Redux `content` (déjà partagé entre routes).
- **Réutilisation :** endpoints existants (aucune nouvelle route serveur, sauf éventuel `GET /content?limit=1` déjà couvert par la liste).
- **Coûts :** improve/translate/generate passent par `checkCredits` — le vocal doit refléter un éventuel refus.

---

## 6. Critères d'acceptation

- [ ] « Améliore le dernier contenu » → l'éditeur est **réellement** mis à jour + confirmation vocale.
- [ ] « Traduis-le en anglais » (contenu courant) → traduction affichée + vocale.
- [ ] « Exporte en PDF » → téléchargement déclenché.
- [ ] « Traduis-le » sans langue → l'assistant **demande** la langue puis exécute.
- [ ] Aucune cible → message clair (proposer de générer).
- [ ] Hors périmètre → rappel des capacités.
- [ ] Crédits insuffisants / plan insuffisant → message explicite, aucune action silencieuse.
- [ ] typecheck 0 · lint 0 · tests verts.

---

## 7. Risques & dépendances

| Risque | Mitigation |
|--------|-----------|
| STT indisponible (iOS) | Documenté ; parcours au **bouton micro** ; cette session ne dépend pas d'iOS. |
| Voix TTS robotique (ElevenLabs plan gratuit) | Repli natif « meilleure voix » (déjà livré) ; voix premium = décision plan payant. |
| Ambiguïté de cible | Limiter à `current/last/byType` en Session 22 ; recherche floue plus tard. |
| Coût crédits inattendu | Annonce du coût + confirmation pour les actions facturées. |

---

## 8. Estimation indicative

| Tâche | Charge |
|-------|--------|
| T1 Contexte cible | S |
| T2 NLU cible/params | S |
| T3 Exécuteurs | M |
| T4 Boucle multi-tour | M |
| T5 États & garde-fous | S |
| T6 Tests & docs | S |

**Total :** ~1 session de développement focalisée. Livrable mergeable en une PR.
