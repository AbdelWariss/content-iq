---
name: contentiq-session-close
description: "Clôture une session CODEXA Content.IQ : termine les tâches en cours, met à jour Travail Éffectué.md avec Problème/Solution/Justification, génère le handoff mémoire, met à jour MEMORY.md et project_contentiq.md. Usage : /contentiq-session-close. Se déclenche sur : 'continue et termine', 'genere un handoff', 'mets a jour le fichier travail effectue', 'termine les taches en cours'."
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# CONTENT.IQ — Session Close

## Overview

End-of-session ritual for CODEXA Content.IQ. Always run in this exact order.

## Execution Order

```
1. Finish pending tasks (from summary or context)
2. Update "Travail Éffectué.md"
3. Write handoff memory file
4. Update MEMORY.md index
5. Update project_contentiq.md state
6. (If requested) create/update skill
```

## Step 1 — Finish Pending Tasks

Check git log and session summary for incomplete work. Complete before touching documentation.

```bash
git log --oneline -5
pnpm test
pnpm typecheck
git push origin main
```

## Step 2 — Update "Travail Éffectué.md"

**File:** `CODEXA Content.IQ/Travail Éffectué.md`
**Insert position:** After file header, before the most recent session (reverse chronological order).

### Mandatory structure per session:

```markdown
### [YYYY-MM-DD] — Session N : [short title] — COMPLÉTÉ ✅
- **Session :** N
- **Statut :** Complété
- **Commits :** `hash1` · `hash2`
- **Tests :** X client / Y serveur — tous verts · TypeScript 0 erreur

---

#### Tâche N — [Task title]

**Commit :** `hash` — `commit message`

**Fichiers modifiés :** `path/to/file.tsx` · `path/to/other.ts`

**Problème :** [What was broken / missing and WHY it mattered]

**Solution :**
[Code snippet showing before/after OR key logic]

**Justification :** [WHY this specific approach — tradeoffs, alternatives rejected, constraints]

---

#### État final de la session

| Métrique | Valeur |
|----------|--------|
| Tests serveur | X/X ✓ |
| Tests client | Y/Y ✓ |
| TypeScript | 0 erreur ✓ |
| Commits pushés | N sur `main` |

**Résumé des fichiers modifiés :**
| Fichier | Type | Changement |
|---------|------|-----------|
```

### Non-negotiable rules:
- **Every task gets a Problème + Solution + Justification** — not optional
- **Code snippets** for every non-trivial implementation (before/after pattern preferred)
- **Justification explains WHY** — not what (the code already shows what)
- Never use vague language ("fixed a bug", "updated file") — be specific
- Demo/narration content stays in French (it's demo data, not UI text)

## Step 3 — Write Handoff Memory

**Directory:** `~/.claude-v3/projects/-Users-theblackprince-Projets-CODEXA-Content-IQ/memory/`
**Filename:** `session_handoff_YYYY-MM-DD.md`

```markdown
---
name: session-handoff-YYYY-MM-DD
description: "Handoff fin de session YYYY-MM-DD — [1-line summary]"
metadata:
  type: project
---

## Ce qui a été fait dans cette session

[Per-commit narrative, key technical decisions, bugs fixed with root causes]

## État du dépôt

- **Branch :** `main` — N commits pushés
- **Tests :** X client / Y serveur — tous verts
- **TypeScript :** 0 erreur

## Backlog pour prochaine session

- [ ] [Priorité 1 — avec contexte]
- [ ] [Priorité 2]

**Why:** [Why this session ended here]
**How to apply:** [What the next session should start with]
```

## Step 4 — Update MEMORY.md

**File:** `memory/MEMORY.md`
- Add new handoff line: `- [Handoff session YYYY-MM-DD](session_handoff_YYYY-MM-DD.md) — [1-line summary]`
- Keep reverse chronological order in the index

## Step 5 — Update project_contentiq.md

Update the "État des phases" and "Backlog restant" sections to reflect current state.

## Step 6 — Save Feedback Memory (if working mode discussed)

If the user asks to memorize a working mode, save a `feedback_*.md` memory:
- Lead with the rule
- **Why:** reason given
- **How to apply:** when it triggers

## Quality Bar

Before reporting done:
- [ ] All pending tasks committed and pushed
- [ ] Travail Éffectué.md has Problème + Solution + Justification for EVERY task
- [ ] Handoff memory written
- [ ] MEMORY.md updated
- [ ] project_contentiq.md reflects current state
- [ ] No vague task descriptions ("misc fixes", "various updates")
