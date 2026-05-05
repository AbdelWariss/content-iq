# CONTENT.IQ

**Plateforme SaaS de génération de contenu IA avec assistant conversationnel et commandes vocales**

> Un projet CODEXA Solutions — Abdel Wariss OSSENI

---

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18 · TypeScript · Vite 6 · TailwindCSS · Shadcn/ui · Redux Toolkit · TanStack Query |
| Voix | Web Speech API · OpenAI Whisper · ElevenLabs · annyang.js |
| Backend | Node.js · Express 5 · TypeScript · Mongoose · Socket.io · BullMQ |
| IA | Claude API (Anthropic) · Streaming SSE |
| Données | MongoDB Atlas · Redis (Upstash) |
| Paiements | Stripe (abonnements + crédits) |
| Déploiement | Vercel (frontend) · Railway (backend) · GitHub Actions CI/CD |

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Docker & Docker Compose (pour MongoDB + Redis en local)

### Installation

```bash
# Cloner le repo
git clone https://github.com/codexa/contentiq.git
cd contentiq

# Installer les dépendances (tous les packages)
pnpm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# → Éditer .env avec vos clés API

# Démarrer MongoDB + Redis via Docker
docker-compose up -d mongodb redis

# Lancer le développement (serveur + client)
pnpm dev
```

Le frontend sera disponible sur `http://localhost:5173`  
L'API sera disponible sur `http://localhost:5000`

### Sans Docker

Si vous n'avez pas Docker, installez MongoDB et Redis localement :

```bash
# macOS avec Homebrew
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis
```

---

## Structure du projet

```
contentiq/
├── client/              # React + Vite + TypeScript (frontend)
├── server/              # Node.js + Express + TypeScript (API)
├── packages/
│   └── shared/          # Types et schémas Zod partagés
├── scripts/             # Seed DB, utilitaires
├── .github/workflows/   # GitHub Actions CI/CD
├── docker-compose.yml
└── .env.example
```

---

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance client + serveur en parallèle |
| `pnpm build` | Build de production |
| `pnpm lint` | Vérification Biome |
| `pnpm lint:fix` | Correction automatique |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm test` | Tests Vitest (client + serveur) |
| `pnpm seed` | Seed de la base de données |

---

## Plans tarifaires

| Plan | Prix | Crédits/mois |
|------|------|-------------|
| Free | Gratuit | 50 crédits |
| Pro | 9,99$/mois | 500 crédits |
| Business | 29,99$/mois | 2 000 crédits |

*1 crédit ≈ 500 tokens Claude ≈ 350 mots générés*

---

*Document confidentiel — CODEXA Solutions — Version 1.0 — Mai 2026*
