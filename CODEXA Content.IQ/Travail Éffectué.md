# Travail Éffectué — CODEXA Content.IQ

Répertoire détaillé de toutes les tâches effectuées au cours des sessions de développement du projet CODEXA Content.IQ, incluant les fichiers créés/modifiés, les numéros de lignes et les décisions techniques.

---

## Sessions de développement

---

### [2026-05-05] — Phase 0 : Setup & Infrastructure — COMPLÉTÉ ✅
- **Session :** 1
- **Statut :** Complété
- **Durée estimée :** 3 jours (réalisé en 1 session)

#### Description
Mise en place du monorepo CONTENT.IQ avec améliorations technologiques vs plan initial :
TypeScript 5.7 strict partout · pnpm workspaces · Biome v1.9 (remplace ESLint+Prettier) · Express 5 · Winston · Zod env validation · Docker Compose · GitHub Actions CI · Husky pre-commit

#### Fichiers créés — lignes de code

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `/package.json` | 1–30 | Workspace root : scripts dev/build/lint/test, devDeps Biome+Husky+concurrently |
| `/pnpm-workspace.yaml` | 1–4 | Déclare les 3 workspaces : client, server, packages/* |
| `/biome.json` | 1–75 | Config linting+formatting : indentWidth=2, lineWidth=100, quoteStyle=double, organizeImports=true |
| `/.gitignore` | 1–35 | Exclusions : node_modules, dist, .env, logs, coverage, *.tsbuildinfo |
| `/.env.example` | 1–65 | Template de toutes les variables d'environnement avec commentaires |
| `/docker-compose.yml` | 1–58 | Services : MongoDB 8.0 + Redis 7.4 + serveur Node avec healthchecks |
| `/README.md` | 1–70 | Guide démarrage, stack technique, scripts pnpm |
| `/.husky/pre-commit` | 1 | `pnpm lint-staged` — déclenche Biome sur les fichiers stagés |
| `/.github/workflows/ci.yml` | 1–90 | Pipeline CI : lint → typecheck → test-server → test-client → build |
| `/scripts/seed.ts` | 1–15 | Seed DB (à compléter Phase 5) |

**packages/shared — Types et schémas partagés**

| Fichier | Lignes clés | Contenu |
|---------|-------------|---------|
| `/packages/shared/src/types/index.ts` | L1–75 | `UserRole`, `ContentType` (12 valeurs), `ContentTone`, `ContentLength`, `ContentLanguage`, `ContentStatus`, `ExportFormat`, `PlanLimits`, constante `PLAN_LIMITS` avec limites par plan |
| `/packages/shared/src/schemas/index.ts` | L1–100 | Schémas Zod : `GenerateContentSchema`, `RegisterSchema`, `LoginSchema`, `ResetPasswordSchema`, `UpdateProfileSchema`, `AssistantMessageSchema`, `TemplateSchema`, `PaginationSchema` |
| `/packages/shared/src/index.ts` | L1–2 | Re-export `types/index.ts` + `schemas/index.ts` |

**server — Structure complète**

| Fichier | Lignes | Points clés |
|---------|--------|-------------|
| `/server/src/config/env.ts` | L1–60 | `EnvSchema` Zod avec 25 variables — arrêt du process si invalide (L18 `process.exit(1)`) |
| `/server/src/config/db.ts` | L1–30 | `connectDB()` + events `error`/`disconnected` Mongoose + `disconnectDB()` |
| `/server/src/config/redis.ts` | L1–35 | Singleton Redis IORedis + `connectRedis()` + `disconnectRedis()` |
| `/server/src/config/stripe.ts` | L1–18 | Client Stripe lazy-init (instancié seulement si clé présente) |
| `/server/src/utils/logger.ts` | L1–30 | Winston : format colorisé dev (L12–20) / format JSON prod (L22) / transports fichier en prod (L27–29) |
| `/server/src/utils/requestHelpers.ts` | L1–9 | `getAuthUser(req)` : cast `req.user` → `AuthPayload` avec throw `UnauthorizedError` si absent |
| `/server/src/middleware/errorHandler.ts` | L1–92 | Classes : `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `InsufficientCreditsError` · Handler global L52–92 : ZodError → 422, AppError → statusCode, autres → 500 |
| `/server/src/middleware/rateLimiter.ts` | L1–28 | 4 limiteurs : `authLimiter` (5 req/15min), `apiLimiter` (60 req/min), `generateLimiter` (10 req/min), `voiceLimiter` (20 req/min) |
| `/server/src/middleware/authenticate.ts` | L1–33 | Vérifie header `Authorization: Bearer <token>` · jwt.verify() · cast → AuthPayload |
| `/server/src/middleware/authorize.ts` | L1–35 | Hiérarchie rôles L8–13 : free=0, pro=1, business=2, admin=3 · `authorize(...roles)` + `requireAdmin()` |
| `/server/src/middleware/checkCredits.ts` | L1–22 | Vérifie `user.credits.remaining >= 1` avant génération · admin exempt L16 |
| `/server/src/models/User.model.ts` | L1–117 | 25 champs Mongoose : email, passwordHash, googleId, name, avatarUrl, role, credits{remaining,total,resetDate}, subscription{stripeCustomerId,status,currentPeriodEnd}, voicePreferences{ttsVoice,speed,autoTts,language}, refreshTokens[], lastLoginAt · toJSON L104–112 : masque passwordHash, refreshTokens, emailVerificationToken, passwordResetToken |
| `/server/src/models/Content.model.ts` | L1–80 | Champs : userId (ref User), type (12 enum), title, body (HTML), bodyPlain (texte pour search), prompt{subject,tone,language,length,keywords,audience,context}, tokensUsed, generationTime, tags[], isFavorite, status, exportHistory[] · Index L68–72 : userId+createdAt, userId+status, userId+isFavorite, text index sur bodyPlain+title |
| `/server/src/models/Template.model.ts` | L1–55 | userId nullable (null = template système), promptSchema avec variables `{{key}}`, isPublic, isPro, usageCount |
| `/server/src/models/AssistantSession.model.ts` | L1–40 | messages[] avec role/content/timestamp/isVoice, pageContext, editorSnapshot (500 chars max) |
| `/server/src/models/CreditTransaction.model.ts` | L1–38 | amount (négatif=consommation), type enum 5 valeurs, contentId ref, balanceAfter |
| `/server/src/models/VoiceCommand.model.ts` | L1–32 | transcript, matchedCommand, confidence (0–1), source (web_speech/whisper), success, executionTime |
| `/server/src/app.ts` | L1–110 | Express app factory : helmet L26–38, cors L41–48, cookieParser L51, passport.initialize() L54, raw body Stripe L57, json+urlencoded L60–61, morgan L64–67, apiLimiter L70, health check L73–80, montage 9 routes L83–94, 404 L97, errorHandler L102 |
| `/server/src/index.ts` | L1–60 | Bootstrap : connectDB() + connectRedis() → createApp() → Socket.io → listen() · graceful shutdown SIGTERM/SIGINT L42–54 |

**client — Structure frontend**

| Fichier | Lignes clés | Contenu |
|---------|-------------|---------|
| `/client/src/main.tsx` | L1–22 | Provider Redux + QueryClientProvider + BrowserRouter + Toaster |
| `/client/src/index.css` | L1–80 | Variables CSS HSL pour thème clair/sombre L1–50, utilities : scrollbar-thin L55–66, gradient-brand L68–72, text-gradient-brand L74–78 |
| `/client/src/store/index.ts` | L1–20 | `configureStore` : 4 slices (auth, content, assistant, voice) · `useAppDispatch` + `useAppSelector` typés |
| `/client/vite.config.ts` | L1–55 | Alias `@/*` → `./src/*` · proxy `/api` → `http://localhost:5001` + `/socket.io` ws · manualChunks L38–45 : vendor, redux, query, ui, editor, charts |
| `/client/tailwind.config.ts` | L1–75 | Extension couleurs brand (indigo 50–950) · keyframes wave-pulse + shimmer · fontFamily Inter + JetBrains Mono |
| `/client/src/components/ui/PageLoader.tsx` | L1–10 | Spinner centré plein écran |
| `/client/src/components/Layout/ProtectedRoute.tsx` | L1–28 | Lecture `isLoading` → PageLoader · `isAuthenticated` → redirect `/login` · `requiredRole` → vérif hiérarchie |
| `/client/src/components/Layout/Sidebar.tsx` | L1–75 | NavLink actif avec style primary · compteur crédits bas L60–72 : barre de progression dynamique |
| `/client/src/lib/queryClient.ts` | L1–18 | staleTime 5min, gcTime 10min · retry=false sur 401/403/404 · refetchOnWindowFocus=false |
| `/client/src/lib/utils.ts` | L1–30 | `cn()` clsx+twMerge · `formatCredits()` Intl · `stripHtml()` · `truncate()` · `debounce()` |

---

### [2026-05-05] — Phase 1 : Authentification & Core MERN — COMPLÉTÉ ✅
- **Session :** 1 (suite)
- **Statut :** Complété

#### Fichiers créés — lignes de code (Serveur)

**`/server/src/utils/token.ts` — 38 lignes**
- L1–12 : `generateAccessToken(payload)` → `jwt.sign()` avec `JWT_ACCESS_SECRET` + expiry 15min
- L14–18 : `generateRefreshToken(payload)` → `jwt.sign()` avec `JWT_REFRESH_SECRET` + expiry 7j
- L20–22 : `verifyRefreshToken(token)` → `jwt.verify()` avec JWT_REFRESH_SECRET
- L24–26 : `generateSecureToken()` → `crypto.randomBytes(32).toString('hex')`
- L28–30 : `hashToken(token)` → `SHA-256` avant stockage en base
- L32–38 : `REFRESH_TOKEN_COOKIE` + `COOKIE_OPTIONS` (httpOnly, secure en prod, sameSite)

**`/server/src/config/passport.ts` — 73 lignes**
- L13–54 : GoogleStrategy avec clientID/Secret/callbackURL
- L22–47 : Callback : cherche user par googleId OU email · crée si inexistant · met à jour lastLoginAt
- L56–68 : serialize/deserialize avec cast `unknown as PassportUser` (évite conflit IUser/Express.User)

**`/server/src/services/email.service.ts` — 110 lignes**
- L8–20 : `sendWithResend()` via SDK Resend officiel
- L22–33 : `sendWithNodemailer()` fallback SMTP
- L35–46 : `sendEmail()` : utilise Resend si clé dispo, sinon log en console (dev)
- L48–65 : `sendVerificationEmail()` : HTML avec lien tokenisé, expiration 24h
- L67–80 : `sendPasswordResetEmail()` : lien reset, expiration 1h
- L82–94 : `sendWelcomeEmail()` : email de bienvenue avec 50 crédits offerts
- L96–110 : `sendLowCreditsAlert()` : alerte 20% crédits restants

**`/server/src/controllers/auth.controller.ts` — 262 lignes**
- L28–29 : constantes `MAX_REFRESH_TOKENS=5`, `SALT_ROUNDS=12`
- L31–36 : helper `buildAuthPayload()` → `{ userId, role, email }`
- L38–75 : `register()` : RegisterSchema.parse → vérif doublon email → bcrypt.hash → generateSecureToken → hashToken → User.create → sendVerificationEmail → generateAccessToken+RefreshToken → set cookie → 201
- L77–111 : `login()` : LoginSchema.parse → User.findOne → bcrypt.compare → rotation refresh token (slice -4 + push nouveau) → set cookie → 200
- L113–132 : `logout()` : retire refresh token hashé de `user.refreshTokens` → clearCookie
- L134–164 : `refresh()` : verifyRefreshToken → User.findOne avec refreshTokens:hashed → génère nouveaux tokens → rotation → set cookie
- L166–183 : `googleCallback()` : extrait user Passport → buildAuthPayload → tokens → push refreshToken → redirect client avec accessToken en query param
- L185–208 : `forgotPassword()` : génère token → hashToken → save → sendPasswordResetEmail · réponse identique si email inexistant (sécurité)
- L210–228 : `resetPassword()` : ResetPasswordSchema → find par tokenHash+expiry → bcrypt.hash → clear tokens → clearCookie
- L230–252 : `verifyEmail()` : find par tokenHash+expiry → emailVerified=true → sendWelcomeEmail
- L254–260 : `getMe()` : getAuthUser → User.findById → 200

**`/server/src/controllers/user.controller.ts` — 52 lignes**
- L6–11 : `getProfile()` : getAuthUser → User.findById → toJSON()
- L13–33 : `updateProfile()` : UpdateProfileSchema → updateFields dynamique avec dot notation (`voicePreferences.ttsVoice`) → findByIdAndUpdate
- L35–49 : `updateAvatar()` : getAuthUser → validate avatarUrl → findByIdAndUpdate

**`/server/src/routes/auth.routes.ts` — 20 lignes** (mis à jour depuis stub)
- L9 : `POST /register` → authLimiter + register
- L10 : `POST /login` → authLimiter + login
- L11 : `POST /logout` → authenticate + logout
- L12 : `POST /refresh` → refresh (cookie only, pas de Bearer)
- L14–15 : `GET /google` + `GET /google/callback` → Passport Google
- L17–19 : `POST /forgot-password` + `POST /reset-password` + `GET /verify-email/:token`
- L20 : `GET /me` → authenticate + getMe

**`/server/src/app.ts` — modifications lignes 1–10 + 51–54 + 86**
- L4 : `import passport from "passport"` ajouté
- L5 : `import cookieParser from "cookie-parser"` ajouté
- L7 : `import { configurePassport }` ajouté
- L11 : `import userRoutes` ajouté
- L25 : `configurePassport()` appelé au démarrage
- L51 : `app.use(cookieParser())` ajouté
- L54 : `app.use(passport.initialize())` ajouté
- L86 : `app.use("/api/users", userRoutes)` ajouté

#### Fichiers créés — lignes de code (Client)

**`/client/src/store/authSlice.ts` — 66 lignes**
- L1–20 : Interface `UserState` (id, name, email, role, avatarUrl, credits, language) + `AuthState` (user, accessToken, isAuthenticated, isLoading=true)
- L28–36 : `setCredentials()` : hydrate user + accessToken + isAuthenticated=true + isLoading=false
- L37–41 : `updateUser()` : partial update user
- L42–46 : `updateCredits()` : update credits.remaining seul
- L47–51 : `logout()` : remet tout à null/false
- L52–54 : `setLoading()` : contrôle l'état de chargement initial

**`/client/src/store/contentSlice.ts` — 86 lignes**
- L35–39 : `startGeneration()` : isGenerating=true, streamedContent="", tokensGenerated=0
- L40–43 : `appendToken()` : streamedContent += token, tokensGenerated++
- L44–47 : `stopGeneration()` : isGenerating=false, editorContent=streamedContent
- L48–51 : `setParams()` : merge currentParams
- L52–54 : `setEditorContent()` : sync éditeur vers Redux
- L55–60 : `resetEditor()` : remet tout à zéro

**`/client/src/services/axios.ts` — 89 lignes**
- L4–6 : `AUTH_ROUTES` : liste des routes qui ne déclenchent PAS le refresh silencieux (login, register, refresh, forgot/reset-password)
- L7 : `isAuthRoute()` : prédicat de détection
- L13–18 : Instance axios avec baseURL=VITE_API_URL, timeout=30s, withCredentials=true
- L21–25 : Intercepteur request : attach `Authorization: Bearer <token>` si présent
- L40–50 : Guard : si `isAuthRoute(url)` → reject directement sans refresh
- L52–73 : Refresh silencieux : AbortController pattern avec queue des requêtes en attente · dispatch setCredentials sur succès · dispatch logout + redirect /login sur échec

**`/client/src/hooks/useAuth.ts` — 75 lignes**
- L15–30 : `initAuth()` : si token présent → getMe() → dispatch setCredentials · sinon → dispatch setLoading(false)
- L32–34 : `useEffect` : appelle initAuth() si `auth.isLoading === true`
- L36–55 : `login()` : authService.login() → dispatch setCredentials → navigate('/dashboard')
- L56–75 : `register()` : authService.register() → dispatch setCredentials → toast bienvenue → navigate('/dashboard')
- L77–86 : `logout()` : authService.logout() (try) → toujours dispatch logoutAction + navigate('/login')

**`/client/src/App.tsx` — 72 lignes** (mis à jour)
- L8 : `import { useAuth }` ajouté
- L24–27 : Composant `AuthInitializer` : appelle `useAuth()` pour déclencher `initAuth()` au démarrage → résout le bug "Chargement..." infini
- L31 : `<AuthInitializer />` placé avant `<Suspense>`

**Pages Auth — lignes clés**

| Fichier | Lignes clés |
|---------|-------------|
| `LoginPage.tsx` | L40–75 : form RHF+Zod · L50–60 : Input email+password avec Eye toggle · L62 : Button loading · L76–93 : Bouton Google OAuth redirect |
| `RegisterPage.tsx` | L28–35 : PASSWORD_RULES 4 critères · L85–100 : indicateur force mot de passe conditionnel · L110 : message "50 crédits offerts" |
| `ForgotPasswordPage.tsx` | L45–55 : state `sent` → affichage confirmation avec icône Mail · L57 : réponse identique email existant ou non |
| `ResetPasswordPage.tsx` | L18–25 : schéma Zod avec `.refine()` pour vérif confirmation mot de passe · L65–70 : state `success` → redirect automatique /login après 3s |
| `VerifyEmailPage.tsx` | L13–18 : useEffect → appel API auto sur mount avec token URL · L20–45 : états loading/success/error |
| `ProfilePage.tsx` | L45–60 : avatar avec initiale · L65–85 : form update profil · L90–100 : jauge crédits dynamique `creditsPercent` · L104–110 : bouton déconnexion rouge |

**Composants UI Shadcn — lignes clés**

| Fichier | Lignes | Points clés |
|---------|--------|-------------|
| `button.tsx` | L8–30 | `buttonVariants` CVA : 6 variantes (default/destructive/outline/secondary/ghost/link/brand) · prop `loading` : spinner inline L44–48 |
| `input.tsx` | L8–20 | Prop `error?: string` → border-destructive + ring-destructive |
| `card.tsx` | L1–65 | 6 sous-composants : Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `badge.tsx` | L8–20 | 6 variantes dont `success` (vert) et `warning` (jaune) pour les plans |
| `toast.tsx` | L1–90 | Radix Toast complet : 3 variantes (default/destructive/success) |

---

### [2026-05-05] — Configuration infrastructure cloud — COMPLÉTÉ ✅
- **Session :** 1 (suite)
- **Statut :** Complété

#### Fichiers modifiés — lignes exactes

**`/.env` — modifications**
- L12 : `MONGODB_URI` → remplacé `localhost:27017` par `mongodb+srv://Admin_Content_IQ:<password>@contentiq-cluster.p7wzint.mongodb.net/contentiq?retryWrites=true&w=majority&appName=contentiq-cluster`
- L12 : Correction critique — password URL-encodé : `&` → `%26`, `@` → `%40` (caractères spéciaux cassaient le parsing URI)
- L15 : `REDIS_URL` → remplacé `redis://localhost:6379` par `rediss://default:<password>@apparent-macaque-115575.upstash.io:6379` (double `s` = TLS obligatoire Upstash)
- L31 : `ANTHROPIC_API_KEY` → clé réelle renseignée
- L7 : `PORT` → changé de `5000` à `5001` (port 5000 réservé par AirPlay Receiver macOS)

**`/client/.env` — modifications**
- L1 : `VITE_API_URL` → `http://localhost:5001/api` (mis à jour port 5001)
- L2 : `VITE_SOCKET_URL` → `http://localhost:5001` (mis à jour port 5001)

**`/client/vite.config.ts` — L23 + L28`**
- L23 : `target: "http://localhost:5001"` (proxy /api)
- L28 : `target: "http://localhost:5001"` (proxy socket.io)

**`/server/package.json` — L7`**
- L7 : `"dev"` script → ajout `--env-file=../.env` : `"tsx watch --env-file=../.env src/index.ts"` (tsx ne charge pas automatiquement le .env racine du monorepo)

**`/server/src/models/User.model.ts` — L115`**
- L115 : Suppression des `UserSchema.index({ email: 1 })` et `UserSchema.index({ googleId: 1 })` dupliqués (déjà déclarés via `index: true` dans les champs → warning Mongoose)

---

### [2026-05-05] — Phase 2 : Génération IA + Streaming SSE + Éditeur TipTap + Historique — COMPLÉTÉ ✅
- **Session :** 1 (suite)
- **Statut :** Complété

#### Fichiers créés — lignes de code (Serveur)

**`/server/src/services/claude.service.ts` — 208 lignes**
- L1–7 : Imports Anthropic SDK, types partagés
- L9–13 : `MAX_TOKENS` map : short=400, medium=900, long=2200, custom=2200
- L15–30 : `CONTENT_TYPE_LABELS` : labels en 4 langues (fr/en/es/ar) pour les 12 types
- L32–45 : `TONE_LABELS` : labels en 4 langues pour les 6 tons
- L47–52 : `LANG_INSTRUCTIONS` : instructions natives par langue injectées dans le system prompt
- L54–58 : `getSystemPrompt()` : system prompt expert copywriting + instruction langue
- L60–105 : `buildUserPrompt()` : construction prompt utilisateur avec tous les paramètres + instructions spécifiques par type (blog=H1/H2/H3, linkedin=hook+CTA, twitter=10 tweets numérotés, youtube=intro30s+outro...)
- L107–145 : `streamContentGeneration()` : headers SSE L113–117 → `client.messages.stream()` L126–132 → boucle `for await` L134–148 : event `content_block_delta` → `res.write("data: ...")` → event `message_delta` → tokensUsed → `res.write("[DONE]")` L150
- L147–175 : `improveContent()` : même mécanique SSE avec prompt "améliore ce contenu + instruction"
- L177–195 : `generateTitle()` : appel Claude non-streaming, max_tokens=20, retourne 5 mots max

**`/server/src/services/credits.service.ts` — 68 lignes**
- L8–30 : `deductCredits()` : `findByIdAndUpdate` avec `$inc: {"credits.remaining": -amount}` → CreditTransaction.create → vérif seuil 20% → `sendLowCreditsAlert()` asynchrone
- L32–55 : `addCredits()` : `$inc: +amount` → CreditTransaction.create (pour recharges Stripe Phase 4)

**`/server/src/controllers/content.controller.ts` — 175 lignes**
- L12–40 : `generate()` : GenerateContentSchema.parse → `streamContentGeneration()` → post-stream : generateTitle + Content.create + deductCredits (tout en arrière-plan pour ne pas bloquer la réponse SSE)
- L42–62 : `listContents()` : PaginationSchema + filtres dynamiques (type, language, favorite, tag, status) → `Content.find().sort().skip().limit().select("-body")` + `countDocuments` en parallèle → réponse avec pagination
- L64–70 : `getContent()` : find + vérif ownership `String(content.userId) !== userId` → ForbiddenError
- L72–86 : `updateContent()` : mise à jour body+bodyPlain (strip HTML) + tags
- L88–96 : `deleteContent()` : `content.status = "archived"` (soft delete, récupérable 30j)
- L98–106 : `toggleFavorite()` : `content.isFavorite = !content.isFavorite`
- L108–120 : `searchContents()` : `$text: { $search: q }` avec score metadata pour tri par pertinence
- L122–140 : `improveContentHandler()` : récupère bodyPlain → `improveContent()` SSE → save → deductCredits

**`/server/src/routes/content.routes.ts` — 29 lignes** (remplacement total du stub)
- L8 : `POST /generate` → generateLimiter + checkCredits + generate
- L9 : `GET /` → listContents
- L10 : `GET /search` → searchContents (**avant** `/:id` pour éviter conflit de routing)
- L11 : `GET /:id` → getContent
- L12 : `PUT /:id` → updateContent
- L13 : `DELETE /:id` → deleteContent
- L14 : `PATCH /:id/favorite` → toggleFavorite
- L15 : `POST /:id/improve` → checkCredits + improveContentHandler

#### Fichiers créés — lignes de code (Client)

**`/client/src/hooks/useStreaming.ts` — 110 lignes**
- L1–4 : Imports useCallback, useRef, useAppDispatch, useAppSelector
- L14 : `accessToken = useAppSelector(s => s.auth.accessToken)` — token lu depuis Redux directement
- L17–25 : Setup AbortController + dispatch(startGeneration())
- L27–37 : `fetch()` avec headers Authorization Bearer + signal AbortController
- L38–43 : Gestion erreur HTTP non-2xx : parse JSON erreur → throw Error
- L45–70 : Lecture stream ReadableStream : TextDecoder → buffer → split "\n" → filtre "data: " → JSON.parse → dispatch(appendToken) ou dispatch(stopGeneration)
- L74–78 : Catch AbortError → dispatch(stopGeneration) silencieux
- L79–83 : Autres erreurs → toast destructive
- L90–93 : `stop()` : `abortRef.current?.abort()`

**`/client/src/components/Editor/EditorToolbar.tsx` — 174 lignes**
- L11–30 : `ToolbarButton` : `onMouseDown` avec `e.preventDefault()` (empêche la perte de focus éditeur) · états active/disabled
- L32–34 : `Divider` : séparateur vertical 1px
- L40–165 : Groupes de boutons : Gras/Italique/Souligné/Barré · H1/H2/H3 · AlignLeft/Center/Right · BulletList/OrderedList · Highlight · Undo/Redo
- L167–170 : Compteur de mots `editor.storage.characterCount.words()` affiché en haut droite

**`/client/src/components/Editor/RichEditor.tsx` — 85 lignes**
- L10–22 : `useEditor()` : extensions StarterKit (history depth=100), Underline, TextAlign(heading+paragraph), Highlight, Placeholder, CharacterCount
- L23–27 : editorProps : classe CSS `prose prose-sm max-w-none focus:outline-none min-h-300px px-4 py-3`
- L30–39 : `useEffect` sync content : en mode streaming → `setContent(content, false)` (false = pas d'historique undo) · en mode édition → sync si HTML différent
- L41–45 : `useEffect` : `editor.setEditable(!readonly && !streaming)` — verrouille pendant le streaming
- L52–65 : Rendu : bordure `ring-primary` si streaming · `<EditorToolbar>` si non-readonly · `<EditorContent>`

**`/client/src/pages/Generate/GeneratePage.tsx` — 367 lignes**
- L10–30 : Constantes `CONTENT_TYPES` (12 avec emoji), `TONES` (6), `LANGUAGES` (4 avec drapeaux), `LENGTHS` (3 avec description)
- L45–65 : `useForm` RHF avec defaultValues depuis Redux `currentParams`
- L66–80 : State local `keywords[]` séparé du form (gestion tags dynamiques)
- L82–100 : `onSubmit()` : dispatch(setParams) → dispatch(resetEditor) → `stream(url, {...data, keywords})`
- L102–107 : `handleRegenerate()` : `handleSubmit(onSubmit)()`
- L109–115 : `handleCopy()` : `content.replace(/<[^>]*>/g, "")` → clipboard → toast + état `copied` 2s
- L117–125 : `addKeyword()` + `removeKeyword()` : gestion tableau keywords avec limite 10
- L127–133 : `useEffect` auto-save : `setTimeout(30000)` → dispatch(setEditorContent) · cleanup sur chaque changement
- L136–195 : Formulaire gauche : sélecteur type grid 2 colonnes · Input sujet · pills ton · select langue · pills longueur · keywords Input+Badge · audience · textarea contexte
- L197–220 : Bouton conditionnel : si `isGenerating` → bouton Stop rouge · sinon → bouton Générer brand
- L222–280 : Panneau droit : barre d'actions top · indicateur streaming avec compteur tokens · boutons Régénérer+Copier · `<RichEditor streaming={isGenerating}>`

**`/client/src/pages/History/HistoryPage.tsx` — 244 lignes**
- L13–25 : `TYPE_LABELS` + `TYPE_COLORS` : couleurs bg par type (blog=bleu, linkedin=ciel, instagram=rose...)
- L28–85 : `ContentCard` : 2 variantes (grid/list) · badge type coloré · `formatDistanceToNow(fr)` · toggle favori Heart · suppression Trash2
- L90–105 : `useQuery` TanStack Query avec queryKey `["contents", {page, type, favorite}]`
- L107–113 : `useQuery` recherche : enabled seulement si `search.length >= 2` (évite appels inutiles)
- L115–120 : `useMutation` toggleFavorite : `invalidateQueries(["contents"])` on success
- L122–127 : `useMutation` delete : invalidate + toast "Contenu archivé"
- L129–133 : `items` : si search active → données recherche · sinon → données list
- L150–175 : Filtres : Input recherche avec icône Search · select type → reset page=1 · bouton Favoris toggle
- L177–210 : Grid/list conditionnel : Skeleton×6 si loading · message vide avec icône · map items → ContentCard
- L212–225 : Pagination : boutons Précédent/Suivant avec disabled + `page/pages`

**`/client/src/services/content.service.ts` — 60 lignes**
- L30–34 : `list()` : `GET /content` avec params page/limit/type/favorite/tag
- L36–39 : `getById()` : `GET /content/:id`
- L41–44 : `update()` : `PUT /content/:id`
- L46–49 : `delete()` : `DELETE /content/:id`
- L51–54 : `toggleFavorite()` : `PATCH /content/:id/favorite`
- L56–59 : `search()` : `GET /content/search?q=...`
- L61–63 : `getGenerateUrl()` : retourne l'URL complète pour le fetch SSE (ne passe pas par axios)

#### Corrections apportées en Phase 2

**`/client/src/services/axios.ts` — L4–7 ajoutés**
- Ajout `AUTH_ROUTES` + `isAuthRoute()` L4–7
- L40–43 : Guard `if (isAuthRoute(url)) return Promise.reject(error)` — empêche le refresh silencieux de se déclencher sur les erreurs 401 du login (bug : boucle login → refresh → logout → redirect)

**`/client/src/App.tsx` — L8 + L24–27 + L31`**
- L8 : `import { useAuth }`
- L24–27 : `function AuthInitializer() { useAuth(); return null; }` — déclenche `initAuth()` au premier render
- L31 : `<AuthInitializer />` — résout le bug spinner infini (isLoading restait true car useAuth n'était jamais appelé)

---

### [2026-05-05] — Phase 3 : IQ Assistant + Templates + Voix — COMPLÉTÉ ✅
- **Session :** 2
- **Statut :** Complété

#### Fichiers créés — lignes de code (Serveur)

**`/server/src/services/assistant.service.ts` — 75 lignes**
- L1–6 : Imports Anthropic SDK, types
- L8–20 : `SYSTEM_PROMPT` : expert copywriting + multilingue + contextuel
- L22–65 : `streamAssistantChat()` : SSE headers → boucle `for await` → injection contexte page + snapshot éditeur dans le system prompt → limite 20 messages dans le contexte

**`/server/src/controllers/assistant.controller.ts` — 70 lignes**
- L8–38 : `chat()` : `AssistantMessageSchema.parse` → vérif limite quotidienne free (PLAN_LIMITS) → get/create session → inject contexte → `streamAssistantChat()` → save user+assistant messages → trim 100 messages max
- L40–48 : `getSession()` : `AssistantSession.findOne` → retourne messages + sessionId
- L50–56 : `clearSession()` : `AssistantSession.deleteOne`

**`/server/src/controllers/template.controller.ts` — 80 lignes**
- L6–27 : `listTemplates()` : filtre `$or [isPublic, userId]` + pagination + filtre category/type
- L29–39 : `getTemplate()` : vérif ownership si non-public → `NotFoundError` / `ForbiddenError`
- L41–56 : `createTemplate()` : vérif `planLimits.customTemplates` → `TemplateSchema.safeParse` → `Template.create`
- L58–73 : `updateTemplate()` : ownership check → partial update
- L75–82 : `deleteTemplate()` : ownership check → `template.deleteOne()`
- L84–96 : `useTemplate()` : `$inc: { usageCount: 1 }` → retourne template

**`/server/src/controllers/voice.controller.ts` — 110 lignes**
- L10–18 : `SynthesizeSchema` + `CommandSchema` Zod
- L30–65 : `synthesize()` : vérif plan Pro → ElevenLabs API si clé disponible → fallback `useNativeTts: true`
- L67–81 : `getVoices()` : ElevenLabs /voices → fallback voix navigateur
- L83–115 : `executeCommand()` : Claude parse commande vocale → JSON `{command, params, confidence}` → `VoiceCommand.create` pour analytics
- L117–122 : `transcribe()` : stub Whisper (navigateur Web Speech API recommandé)

**Routes mises à jour :**
- `/server/src/routes/assistant.routes.ts` : POST /chat + GET /session + DELETE /session → handlers réels
- `/server/src/routes/template.routes.ts` : GET/ + GET/:id + POST/ + PUT/:id + DELETE/:id + POST/:id/use → handlers réels
- `/server/src/routes/voice.routes.ts` : transcribe + synthesize + voices + command → handlers réels

#### Fichiers créés — lignes de code (Client)

**`/client/src/services/assistant.service.ts` — 20 lignes**
- `getChatUrl()` : URL SSE pour le fetch direct
- `getSession()` : GET /assistant/session
- `clearSession()` : DELETE /assistant/session

**`/client/src/services/template.service.ts` — 55 lignes**
- Interface `Template` typée avec `ContentType` du shared package
- `list()`, `getById()`, `create()`, `update()`, `delete()`, `use()`

**`/client/src/hooks/useAssistant.ts` — 85 lignes**
- `sendMessage(content, context?)` : dispatch addMessage user → addMessage assistant vide → fetch SSE → dispatch appendToLastMessage → setStreaming
- `stop()` : AbortController
- `clear()` : API + dispatch clearSession

**`/client/src/hooks/useVoice.ts` — 110 lignes**
- Interfaces Speech API définies localement (SpeechRecognitionInstance, etc.) pour compatibilité TypeScript
- `getSpeechRecognition()` : détection `window.SpeechRecognition ?? window.webkitSpeechRecognition`
- `startListening(onResult, lang)` → dispatch setStatus/setTranscript/setPermissionGranted
- `stopListening()` : `recognition.stop()`
- `speak(text, lang)` → `SpeechSynthesisUtterance` navigateur
- `stopSpeaking()` : `speechSynthesis.cancel()`

**`/client/src/components/Assistant/AssistantPanel.tsx` — 175 lignes**
- Panneau flottant slide-in bottom-right 360×540px
- Header avec icône + contexte page courant + boutons effacer/fermer
- Messages scrollables avec `MessageBubble` (user=primary, assistant=muted+Bot icon)
- État vide avec suggestions rapides cliquables (3 questions prédéfinies)
- Input textarea + bouton mic (VoiceButton inline) + bouton envoyer/stop
- Compteur messages du jour

**`/client/src/components/Voice/VoiceButton.tsx` — 35 lignes**
- Bouton mic réutilisable : idle → listening (rouge, pulse) → isTtsSpeaking (Volume2 icon)

**`/client/src/pages/Templates/TemplatesPage.tsx` — 280 lignes**
- Filtre catégories (marketing/social/business/créatif) + recherche texte
- `TemplateCard` : emoji type + badge catégorie coloré + variables affichées + bouton Utiliser
- `CreateTemplateModal` : name + description + type + catégorie + promptSchema textarea + isPublic checkbox
- `handleUse()` : `templateService.use()` + dispatch setParams + navigate /generate + toast
- Plan upgrade notice si plan free

**`/client/src/components/Layout/AppLayout.tsx` — mis à jour**
- Ajout `<AssistantPanel />` (panneau flottant) + `<AssistantToggle />` (bouton sparkles fixe bottom-right)
- Bouton toggle change d'apparence selon `isOpen` Redux state

#### Corrections & améliorations

**`/client/src/hooks/useStreaming.ts` — L80-84 fix**
- Suppression `dispatch(updateCredits({ remaining: -1 }))` qui référençait une action non importée

**`/client/src/services/content.service.ts` — L65 fix**
- `search()` : ajout type de retour `Promise<ContentListResponse>` → résout TS7006 sur HistoryPage

**`/client/vite.config.ts` — refactoring**
- Suppression bloc `test` (déplacé dans vitest.config.ts dédié)

**`/client/vitest.config.ts` — nouveau fichier**
- Config Vitest séparée avec `/// <reference types="vitest" />` + `defineConfig` de `vitest/config`

**`/client/tsconfig.node.json` — fix**
- `"lib": ["ES2022", "DOM"]` — ajout DOM pour résoudre `Worker` type error

**`/scripts/seed.ts` — implémenté**
- 8 templates système publics + création admin `admin@contentiq.app`

---

### [2026-05-05] — Phase 4 : Stripe + Exports + Dashboard Analytics + Admin — COMPLÉTÉ ✅
- **Session :** 3
- **Statut :** Complété

#### Fichiers créés / modifiés — lignes de code (Serveur)

**`/server/src/config/stripe.ts` — modifié (L5–10)**
- `getStripe()` retourne désormais `Stripe | null` (au lieu de lancer une Error) — cohérent avec les checks `if (!stripe)` dans le controller

**`/server/src/controllers/admin.controller.ts` — 95 lignes (nouveau)**
- L10–30 : `getAdminStats()` — 4 agrégations parallèles : users par rôle, total contenus, crédits consommés, nouveaux users 7j
- L32–55 : `listUsers()` — pagination + search regex nom/email + filtre par rôle
- L57–75 : `updateUserRole()` — validation rôle + guard anti-self-modification
- L77–95 : `banUser()` — vide `refreshTokens[]`, reset role="free", credits.remaining=0 (soft ban)

**`/server/src/routes/admin.routes.ts` — remplacé (stubs → handlers réels)**
- `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id/role`, `POST /admin/users/:id/ban`

**`/server/src/controllers/export.controller.ts` — fix TypeScript**
- Ajout helper `paramId(req)` L12–15 : extrait `req.params.id` en `string` (corrige `string | string[]` TS2345)

#### Fichiers créés / modifiés — lignes de code (Client)

**`/client/src/services/admin.service.ts` — 55 lignes (nouveau)**
- Interfaces `AdminUser` + `AdminStats` typées
- `getStats()`, `listUsers(params)`, `updateRole(userId, role)`, `banUser(userId)`

**`/client/src/pages/Admin/AdminPage.tsx` — 295 lignes (remplacé stub)**
- 4 cartes stats : total users, contenus, crédits consommés, répartition plans
- Filtres : recherche temps réel par nom/email + select par rôle
- Table utilisateurs : RoleSelect inline avec mutation, bouton Bannir + modal de confirmation
- Pagination serveur (15 users/page)
- Guard : l'admin ne peut pas modifier/bannir son propre compte

**`/client/src/App.tsx` — modifié**
- Route `/pricing` déplacée dans `ProtectedRoute > AppLayout` (suppression route publique sans layout)
- La sidebar naviguait vers `/pricing` mais sans sidebar — corrigé

#### Vérifications
- `pnpm --filter server typecheck` → **0 erreur**
- `pnpm --filter client typecheck` → **0 erreur**
- `biome check` sur les 7 fichiers modifiés → **0 erreur**

---

## Résumé de l'avancement

| Phase | Contenu | Fichiers | Lignes | Statut |
|-------|---------|----------|--------|--------|
| 0 | Setup & Infrastructure | 40+ fichiers | ~2 000 lignes | ✅ |
| 1 | Auth complète JWT + OAuth | 25 fichiers | ~1 500 lignes | ✅ |
| Infra | MongoDB Atlas + Redis Upstash | 4 fichiers modifiés | ~10 lignes | ✅ |
| 2 | Génération IA + Streaming + Éditeur + Historique | 13 fichiers | ~1 800 lignes | ✅ |
| 3 | IQ Assistant + Templates + Voix | 18 fichiers | ~1 400 lignes | ✅ |
| 4 | Stripe + Exports + Dashboard + Admin | 9 fichiers | ~600 lignes | ✅ |
| 5 | QA + Déploiement | 12 fichiers | ~750 lignes | ✅ |
| Déploiement Live | Render + Vercel | 6 fichiers | ~50 lignes | ✅ |

**Total écrit à ce jour : ~158 fichiers · ~8 100 lignes de code**

---

### [2026-05-05] — Phase 5 : Tests + Déploiement — COMPLÉTÉ ✅
- **Session :** 3 (suite)
- **Statut :** Complété

#### Tests Serveur — Vitest + Supertest — 41 tests ✅

| Fichier | Tests | Couvre |
|---------|-------|--------|
| `server/src/test/utils.test.ts` | 11 | `generateAccessToken`, `generateRefreshToken`, `verifyRefreshToken`, `generateSecureToken`, `hashToken` |
| `server/src/test/middleware.test.ts` | 10 | `authenticate` (valid/invalid token), `authorize` (hiérarchie rôles), `requireAdmin` |
| `server/src/test/auth.test.ts` | 11 | `POST /auth/login` (422/401/200), `POST /auth/register` (422/4xx/201), `GET /auth/me` (401/200), `POST /auth/logout` (401/200) |
| `server/src/test/admin.test.ts` | 9 | `GET /admin/stats` (401/403/200), `GET /admin/users` (401/403/200+pagination), `PUT /admin/users/:id/role` (400/400/200) |

**Décisions techniques :**
- Mock du rateLimiter (`vi.mock("../middleware/rateLimiter.js")`) pour éviter les 429 en test
- `User.findOne` mocké avec chaînage `.select()` (login utilise `.select("+passwordHash +refreshTokens")`)
- `createApp()` utilisé directement sans connexion DB (DB mockée au niveau des models)

#### Tests Client — Vitest + Testing Library — 25 tests ✅

| Fichier | Tests | Couvre |
|---------|-------|--------|
| `client/src/test/utils.test.ts` | 13 | `cn()`, `stripHtml()`, `truncate()`, `formatCredits()`, `debounce()` |
| `client/src/test/authSlice.test.ts` | 6 | Reducers Redux : `setCredentials`, `updateUser`, `updateCredits`, `logout`, `setLoading` |
| `client/src/components/ui/button.test.tsx` | 6 | Rendu, variante destructive, disabled, loading spinner (span.animate-spin), click handler |

#### Fichiers Déploiement

| Fichier | Rôle |
|---------|------|
| `vercel.json` | Config Vercel : build client, outputDirectory, SPA rewrites, cache headers assets |
| `railway.toml` | Config Railway : Dockerfile build, healthcheck `/health`, restart policy |
| `server/Dockerfile` | Fix : ajout `pnpm-lock.yaml`, EXPOSE 5001 (au lieu de 5000), copie packages/shared/node_modules |

#### Fix appliqués
- `client/src/pages/Pricing/PricingPage.tsx` — Guard `if (loading !== null) return` + `finally` pour reset loading (corrige les appels Stripe en rafale)

---

### [2026-05-06] — Redesign UI v2 : Design System + Tous les écrans — COMPLÉTÉ ✅
- **Session :** 4 & 5
- **Statut :** Complété
- **Objectif :** Implémenter intégralement le design system custom (tokens CSS, icônes SVG inline, typographie, animations) et refondre tous les écrans de l'application en se basant sur les références `Interface Content.IQ/`.

---

#### 1. Système de design — `client/src/index.css`

**Tokens CSS ajoutés / restructurés :**
```
--bg           → #f8f7f5 (fond global chaud)
--bg-elev      → #fdfcfb (cartes élevées)
--bg-sunk      → #f1ede8 (zones enfoncées)
--line         → rgba(58,47,37,.12) (bordures)
--line-soft    → rgba(58,47,37,.07)
--ink          → #3a2f25 (texte principal)
--ink-soft     → #7a6a5a (texte secondaire)
--ink-mute     → #b0a090 (texte atténué)
--accent       → #E5704C (coral — CTA, accentuation)
--accent-soft  → rgba(229,112,76,.12)
--accent-ink   → #c95a33
--voice        → #2d7a80 (teal — éléments voix)
--voice-soft   → rgba(45,122,128,.10)
--font-sans    → 'Inter', system-ui
--font-serif   → 'Instrument Serif', Georgia
--font-mono    → 'JetBrains Mono', monospace
--radius       → 14px
--shadow-card  → 0 1px 3px rgba(...)
--shadow-pop   → 0 8px 30px rgba(...)
```

**Classes utilitaires ajoutées :**
- `.row` / `.col` — flex helpers
- `.card` — bg-elev + border + radius + shadow
- `.btn` / `.btn-primary` / `.btn-outline` / `.btn-ghost` / `.btn-accent` / `.btn-sm` / `.btn-lg`
- `.pill` / `.pill.accent` / `.pill.voice`
- `.chip` — tags inline
- `.input` / `.select` / `.textarea` / `.label`
- `.seg` / `.seg button` / `.seg button.active` — segmented control
- `.sidenav` / `.sidenav a` / `.sidenav a.active`
- `.t-display` / `.t-eyebrow` / `.t-mono` — échelle typographique
- `.ciq-mark` / `.dot` / `.name` — logo mark
- `.imgph` — image placeholder avec initiales
- `.gauge` / `.gauge-fill` — barre de progression crédits
- `.wave` / `.wave span` — animation ondes voix (4 barres)
- `.hr` — séparateur horizontal
- `.caret` — curseur clignotant texte
- `.lnk` — lien inline avec underline
- `.scrollbar-thin` — scrollbar discrète WebKit

**Keyframes ajoutés :**
- `@keyframes caretBlink` (L≈ fin fichier) : `0%,100% opacity:1; 50% opacity:0` — curseur texte
- `@keyframes orbpulse` : `0%,100% scale(1) opacity(1); 50% scale(1.08) opacity(.85)` — orbe voix pulsant
- `@keyframes fadeSlideIn` : `from opacity:0 translateY(10px); to opacity:1 translateY(0)` — transition formulaires auth

---

#### 2. Système d'icônes — `client/src/lib/ciq-icons.tsx` (NOUVEAU — 180 lignes)

**`CiqIcon` — objet de constantes SVG (ReactNode) :**
- `sparkle`, `brain`, `mic`, `micOff`, `send`, `stop`, `refresh`, `copy`, `check`, `arrow`, `play`
- `linkedin`, `blog`, `email`, `twitter`, `insta`, `product`, `yt`, `bio`
- `speaker`, `chevron`, `close`, `trash`, `heart`, `star`, `settings`
- `google` — SVG multicolore (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) avec fills non-stroke

**Composant `Ico`** (L≈80–100) :
```tsx
function Ico({ icon, size = 15, style, className }: IcoProps) {
  // Clone SVG avec width/height/style injectés
  return <span className={`ico ${className}`} style={style}>{cloneElement(icon, { width: size, height: size })}</span>
}
```

**Composant `MicWave`** (L≈100–130) :
- Props : `size: "sm" | "md" | "lg"`, `color`
- Rendu : 4 barres `<span>` avec `animation: wave Xs ease-in-out infinite` décalées (0.1s, 0.2s, 0.3s, 0.4s)
- Tailles sm=10px, md=14px, lg=20px (hauteur des barres)

---

#### 3. AssistantPanel — `client/src/components/Assistant/AssistantPanel.tsx` (REFONTE — 175 lignes)

**Suppression :** tous imports `lucide-react`.

**Widget flottant 380×560px :**
- Header (L≈30–55) : `background: var(--bg-sunk)`, cercle `C` (`background: var(--ink)`, white, serif 18px), titre "IQ Assistant", compteur messages monoespace, boutons Effacer + Fermer
- Messages scrollables (L≈60–110) : messages assistant sur fond `var(--bg-sunk)`, messages user sur `var(--ink)` avec texte blanc, `borderRadius` asymétrique (8px/16px)
- État vide (L≈112–125) : suggestions rapides 3 boutons `.btn.btn-ghost` cliquables
- Footer (L≈130–170) : textarea auto-resize + bouton mic accent ghost + bouton envoyer primary, footer mono "X msg · session"

---

#### 4. AuthLayout — `client/src/components/Layout/AuthLayout.tsx` (SIMPLIFIÉ)

Réduit à un wrapper plein-écran :
```tsx
export function AuthLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <div style={{ width: "100vw", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Outlet />
    </div>
  );
}
```

---

#### 5. Page Auth unifiée — `client/src/pages/Auth/AuthPage.tsx` (NOUVEAU — 563 lignes)

**Remplacement de LoginPage + RegisterPage + ForgotPasswordPage par un seul composant.**

**Hook `useTypewriter(text, speed=28, startDelay=200)`** (L52–68) :
- `setInterval` révèle le texte caractère par caractère
- Reset complet + délai de départ à chaque changement de `text`

**Hook `useCounter(target, duration=1600, decimals=0, active=true)`** (L70–88) :
- `requestAnimationFrame` avec cubic ease-out : `eased = 1 - Math.pow(1 - progress, 3)`
- `setValue(0)` + restart animation à chaque changement de `active`

**Composant `StatCounter`** (L92–102) :
- Affiche valeur animée depuis 0 jusqu'à `target`
- `fontSize: 34`, `fontWeight: 700`, `letterSpacing: -0.03em`
- Format FR pour entiers : `.toLocaleString("fr-FR")`

**Composant `DynamicPanel`** (L104–212) — Panneau droit :
- 3 témoignages dans `TESTIMONIALS[]`, rotation toutes les 8s via `setInterval`
- Navigation dots cliquables (dot actif = largeur 24px, inactif = 7px, transition 0.35s)
- Citation typewriter à `fontSize: 52`, `minHeight: 220`, serif
- Texte accent (dernière phrase) en `color: var(--accent)` + curseur `.caret` pendant la frappe
- Auteur fade-in à 65% de la citation tapée (`opacity: displayedQuote.length >= t.quote.length * 0.65 ? 1 : 0`)
- Stats card fade-in à 45% (`opacity: displayedQuote.length >= t.quote.length * 0.45 ? 1 : 0`)
- `statsActive` reset (false → true avec 100ms délai) à chaque rotation → relance les compteurs
- Stats : `{ target: 12480, label: "contenus générés" }`, `{ target: 94, suffix: "%", ... }`, `{ target: 1.7, decimals: 1, suffix: "s", ... }`

**LoginForm** (L216–297) :
- h1 "Bon retour." serif, bouton Google OAuth redirect, séparateur OU, email + password avec toggle visibilité, lien "Oublié ?" → switch mode, submit btn-primary btn-lg pleine largeur

**RegisterForm** (L299–398) :
- h1 "Créez votre compte", Google OAuth, email + nom + password avec jauge force (4 segments couleur), select "Vous êtes…", checkbox CGU, submit

**ForgotForm** (L400–501) :
- Deux états : `sent=false` (formulaire email) et `sent=true` (confirmation avec timer 60s compte à rebours + resend)
- Masquage email partiel : `email.replace(/^(.).*@/, (_, c) => c + "***@")`

**Main `AuthPage`** (L511–562) :
- Grille 2 colonnes `gridTemplateColumns: "1fr 1.1fr"`
- Panneau gauche : CSS Grid `gridTemplateRows: "auto 1fr auto"` (logo | form centré | copyright)
- `pathToMode(pathname)` : dérive le mode depuis l'URL
- `switchMode()` : change mode + `navigate(paths[m], { replace: true })`
- `useEffect` sur `location.pathname` : sync mode si navigation externe (bouton retour)
- Animation `fadeSlideIn 0.3s` sur le bloc formulaire avec `key={mode}`

---

#### 6. Landing Page — `client/src/pages/Landing/LandingPage.tsx` (NOUVEAU — 211 lignes)

**Navbar sticky** (L34–53) : logo CiqMark, liens Produit/Voix/Templates/Tarifs, boutons Connexion + "Essai gratuit →"

**Hero** (L55–147) : grille 2 colonnes, h1 84px `t-display`, pill voix MicWave, sous-titre, CTA + démo ; mockup app (`/generate · post linkedin`) avec streaming en cours + caret animé + floating mic pill

**Trust bar** (L149–157) : audience types en `fontFamily: var(--font-serif), fontStyle: italic`

**Three pillars** (L159–179) : grille 3 colonnes avec cards (GENERATE / ASSIST / VOICE), tag `t-eyebrow`, `Ico` accent, titre serif 24px, meta `t-mono`

**CTA band** (L181–194) : `background: var(--ink)`, h2 48px, accent italic, button accent plein

**Footer** (L196–208) : copyright CODEXA, liens Privacy/Terms/API/Connexion

---

#### 7. App.tsx — `client/src/App.tsx` (MIS À JOUR — 83 lignes)

- **`RootRoute`** (L33–38) : affiche `<LandingPage />` si non connecté, `<Navigate to="/dashboard">` si connecté
- **Routes `/login` + `/register` + `/forgot-password`** : toutes mappées sur `<AuthPage />` (même composant)
- Import `LandingPage` en lazy

---

#### 8. GeneratePage — `client/src/pages/Generate/GeneratePage.tsx` (MIS À JOUR — 450 lignes)

**Ajouts par rapport à la version Phase 2 :**
- Import `VoiceOrb`, `useVoice`, `MicWave`
- State : `showVoiceOrb`, `voiceTranscript`, `voiceElapsed`, `voiceTimer (useRef)`
- `handleFloatingMic()` : toggle VoiceOrb + démarrage timer elapsed + `startListening` callback → `setVoiceTranscript`
- `handleVoiceEnd()` : ferme orb + `setValue("subject", voiceTranscript)` + toast "Brief dicté !"
- **FloatingMic** (L336–387) : bouton `position: absolute; left: 406; bottom: 28; zIndex: 10` — cercle 36px ink/accent + label mono + MicWave si listening
- **VoiceOrb overlay** : rendu conditionnel `{showVoiceOrb && <VoiceOrb ... />}`
- Icônes migrées de `lucide-react` vers `CiqIcon` / `Ico`

---

#### 9. VoiceOrb — `client/src/components/Voice/VoiceOrb.tsx` (NOUVEAU — 95 lignes)

**Overlay plein écran :**
- Backdrop `position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdropFilter: blur(6px)`
- 3 cercles concentriques animés (`orbpulse`) : 200px/160px/120px, opacité décroissante
- `MicWave lg` dans cercle central blanc
- Transcript live en `t-display; fontSize: 42`
- Hints bar bottom : chips commandes ("Génère…", "Stop", "Copie", "Recommence")
- Props : `transcript`, `elapsed`, `onClose`, `onEnd`, `onPause`, `onRestart`

---

#### 10. VoiceCommandPalette — `client/src/components/Voice/VoiceCommandPalette.tsx` (NOUVEAU — 85 lignes)

**Overlay cmd-K :**
- Backdrop `backdropFilter: blur(8px)`
- Card 620px : header `MicWave md` + transcript + confidence %
- Liste commandes matchées avec icône + nom + raccourci clavier
- `useEffect` : Escape → `onClose()`, Enter → `onExecute(matched[0])`
- Footer : hint "↵ Exécuter · Esc Fermer"

---

#### 11. PricingPage — `client/src/pages/Pricing/PricingPage.tsx` (REFONTE — 200 lignes)

- h2 `t-display; fontSize: 64` centré
- Toggle facturation `.seg` (Mensuel / Annuel -20%) avec state `annual`
- 3 plans : Free / Pro (featured, `borderColor: var(--ink)`, `boxShadow: var(--shadow-pop)`) / Business
- Features avec `CiqIcon.check` (inclus) et `color: var(--ink-mute)` (exclus avec texte barré)
- Prix dynamiques : `price.monthly` vs `price.annual`
- Boutons Stripe : `stripeService.createCheckout(plan)` pour upgrades

---

#### 12. ProfilePage — `client/src/pages/Profile/ProfilePage.tsx` (REFONTE — 250 lignes)

**4 sections :**
1. **Compte** (grille 2 colonnes) : `imgph` avatar 80px avec initiales, form nom/email/langue, bouton save
2. **Voix ElevenLabs** : grille 5 colonnes de voice cards — sélectionnée = `border: 1.5px solid var(--ink)` + badge
3. **Micro & reconnaissance** : slider sensibilité + `.seg` moteur (Web Speech / Whisper)
4. **Abonnement** : pill plan couleur + date renouvellement + `stripeService.openPortal()` + bouton rouge déconnexion

---

#### 13. DashboardPage, HistoryPage, TemplatesPage — mises à jour design

- Remplacement des classes Tailwind/Shadcn par le nouveau design system (`.card`, `.btn`, `.pill`, `.t-display`, `.t-eyebrow`, `.chip`, etc.)
- Couleurs : `var(--ink)`, `var(--accent)`, `var(--bg-sunk)`, `var(--line)`
- Icônes : migration vers `CiqIcon` + `Ico`

---

#### 14. Sidebar & Navbar — mises à jour design

**`client/src/components/Layout/Sidebar.tsx`** :
- Logo `.ciq-mark` avec `.dot` + `.name`
- Navigation `.sidenav` avec `Ico` pour chaque lien
- Jauge crédits `.gauge` + `.gauge-fill` en bas
- Couleur active : `background: var(--bg-elev); color: var(--ink)`

**`client/src/components/Layout/Navbar.tsx`** :
- Background `var(--bg)`, bordure `var(--line-soft)`
- Bouton IQ Assistant avec `MicWave sm`

---

#### Corrections TypeScript May 6

- `pnpm exec tsc --noEmit` → **0 erreur** après tous les changements
- `vite build` → succès en 3.77s

---

### [2026-05-07] — Corrections UI AuthPage : centrage + agrandissement — COMPLÉTÉ ✅
- **Session :** 6
- **Statut :** Complété
- **Objectif :** Corriger les problèmes visuels de la page auth signalés via captures d'écran.

---

#### Problème 1 — Centrage vertical du formulaire (screenshot signalé)

**Cause :** layout flexbox avec `justifyContent: "space-between"` créait un espace vide au-dessus du titre.

**Fix — `client/src/pages/Auth/AuthPage.tsx` (L531–556) :**

Avant :
```tsx
<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "44px 64px" }}>
```
Après — CSS Grid 3 lignes :
```tsx
<div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", padding: "44px 64px", overflowY: "auto" }}>
  {/* Logo — row 1 : hauteur naturelle */}
  <Link to="/">...</Link>
  {/* Form — row 2 : 1fr → prend tout l'espace restant, centré avec alignItems: center */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div className="auth-form" style={{ width: "100%", maxWidth: 500, animation: "fadeSlideIn 0.3s ease" }} key={mode}>
      ...
    </div>
  </div>
  {/* Copyright — row 3 : hauteur naturelle */}
  <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>© 2026 CODEXA</div>
</div>
```

---

#### Problème 2 — Éléments trop petits (screenshot signalé)

**Fix — `client/src/pages/Auth/AuthPage.tsx` (L92–101 StatCounter) :**
- `fontSize: 22` → `fontSize: 34`, ajout `fontWeight: 700, letterSpacing: "-0.03em"`

**Fix — `client/src/pages/Auth/AuthPage.tsx` (L158–160 quote) :**
- `fontSize: 38` → `fontSize: 52`
- `minHeight` → `220px`
- `margin` → `"0 0 36px"`
- Padding `DynamicPanel` → `"64px 72px"`
- Avatar auteur → 52px, nom → 16px
- Stats card padding → `"24px 28px"`, gap → 24

---

#### Problème 3 — Formulaire aligné à gauche au lieu d'être centré (screenshot signalé)

**Fix — `client/src/pages/Auth/AuthPage.tsx` (L546) :**
```tsx
// Avant
justifyContent: "flex-start"
// Après
justifyContent: "center"
```
- `maxWidth` : `420` → `500`

---

#### Problème 4 — Tous les éléments du panneau gauche trop petits (screenshot signalé)

**Fix 1 — `client/src/index.css` (fin fichier, ~L510) :**
```css
/* Auth left panel — enlarged form elements */
.auth-form .label { font-size: 14px; margin-bottom: 8px; }
.auth-form .input, .auth-form .select { font-size: 16px; padding: 14px 16px; }
.auth-form .btn-lg { padding: 17px 28px; font-size: 17px; border-radius: 14px; }
```

**Fix 2 — `client/src/pages/Auth/AuthPage.tsx` — LoginForm (L237–297) :**

| Élément | Avant | Après |
|---------|-------|-------|
| h1 "Bon retour." | `fontSize: 44` | `fontSize: 58` |
| Sous-titre p | `fontSize: 14` | `fontSize: 17` |
| Icône Google | `size={18}` | `size={22}` |
| Séparateur "OU" | `fontSize: 11` | `fontSize: 13` |
| Col gap formulaire | `gap: 12` | `gap: 16` |
| Lien "Oublié ?" | `fontSize: 11.5` | `fontSize: 13.5` |
| Messages d'erreur | `fontSize: 11` | `fontSize: 13` |
| Icône flèche submit | `size={16}` | `size={18}` |
| Texte bas "Pas de compte" | `fontSize: 13` | `fontSize: 15` |

**Fix 3 — `client/src/pages/Auth/AuthPage.tsx` — RegisterForm (L323–398) :**

| Élément | Avant | Après |
|---------|-------|-------|
| h1 "Créez votre compte" | `fontSize: 40` | `fontSize: 54` |
| Sous-titre | `fontSize: 14` | `fontSize: 17` |
| Icône Google | `size={18}` | `size={22}` |
| Séparateur "OU PAR EMAIL" | `fontSize: 11` | `fontSize: 13` |
| Col gap | `gap: 12` | `gap: 16` |
| Barres force mot de passe | `height: 4` | `height: 5` |
| Label force | `fontSize: 11` | `fontSize: 13` |
| Erreurs | `fontSize: 11` | `fontSize: 13` |
| Checkbox CGU | `fontSize: 12` | `fontSize: 14` |
| Texte bas | `fontSize: 13` | `fontSize: 15` |

**Fix 4 — `client/src/pages/Auth/AuthPage.tsx` — ForgotForm (L475–501) :**

| Élément | Avant | Après |
|---------|-------|-------|
| h1 "Mot de passe oublié" | `fontSize: 40` | `fontSize: 54` |
| h1 état envoyé | `fontSize: 36` | `fontSize: 50` |
| Sous-titre | `fontSize: 14` | `fontSize: 17` |
| Col gap | `gap: 14` | `gap: 18` |
| Icône send | `size={15}` | `size={17}` |
| Erreur | `fontSize: 11` | `fontSize: 13` |
| Lien retour | `fontSize: 13` | `fontSize: 15` |

**Fix 5 — Copyright panneau gauche :**
- `fontSize: 12` → `fontSize: 14`

---

#### Vérification TypeScript May 7

```
pnpm exec tsc --noEmit → 0 erreur (sortie vide)
```

---

## Résumé global d'avancement (mis à jour 2026-05-07)

| Phase | Contenu | Statut |
|-------|---------|--------|
| 0 | Setup & Infrastructure (monorepo, TypeScript, Biome, CI) | ✅ |
| 1 | Auth JWT + OAuth Google + pages auth | ✅ |
| Infra | MongoDB Atlas + Redis Upstash + ports | ✅ |
| 2 | Génération IA + Streaming SSE + TipTap + Historique | ✅ |
| 3 | IQ Assistant + Templates + Voix | ✅ |
| 4 | Stripe + Exports + Dashboard Analytics + Admin | ✅ |
| 5 | Tests (66) + Déploiement (Vercel + Railway) | ✅ |
| UI v2 | Design system complet + tous les écrans redesignés | ✅ |
| UI v2 fix | Corrections AuthPage (centrage, tailles) | ✅ |

**Total à ce jour : ~172 fichiers · ~9 800 lignes de code**

---

### [2026-05-07] — Phase 6 (suite) : ElevenLabs Preview + Export PDF/DOCX bout-en-bout — COMPLÉTÉ ✅
- **Session :** 7
- **Statut :** Complété

---

#### Tâche 1 — ElevenLabs TTS preview depuis ProfilePage

**Problème :** Les cards de voix ElevenLabs (Aïssata, Camille, Théo, Olivia, Marcus) affichaient une icône lecture sans aucune action.

**Fichier modifié : `client/src/pages/Profile/ProfilePage.tsx`**

Changements :
- **VOICES** : ajout champs `voiceId` (ID ElevenLabs réel) et `lang` à chaque voix
  - Aïssata FR·F → `21m00Tcm4TlvDq8ikWAM` (Rachel multilingue)
  - Camille FR·F → `EXAVITQu4vr4xnSDxMaL` (Bella multilingue)
  - Théo FR·M → `ErXwobaYiN019PkySvjV` (Antoni multilingue)
  - Olivia EN·F → `MF3mGyEYCl7XYWbV9V6O` (Elli)
  - Marcus EN·M → `TxGEqnHWrfWFTfGW9XjX` (Josh)
- Ajout `previewing: string | null` state + `currentAudioRef` pour stopper l'audio précédent
- Fonction `previewVoice(name, voiceId, lang)` :
  - POST `/voice/synthesize` avec `responseType: "arraybuffer"`
  - Si `Content-Type: audio/mpeg` → Blob → URL.createObjectURL → `new Audio(url).play()`
  - Si JSON `{useNativeTts: true}` → `SpeechSynthesisUtterance` navigateur
  - Clic sur carte déjà en cours → stop/cancel
- Voice card : bouton play/stop séparé (stopPropagation pour ne pas changer la sélection) + `MicWave listening={isPlaying}` animé + bordure `var(--voice)` quand en lecture

---

#### Tâche 2 — Export PDF/DOCX bout-en-bout

**Problème :** Le `contentId` n'était jamais retourné au client après génération. Le client ne pouvait donc pas appeler `GET /export/:id/pdf`.

**Architecture de la correction (3 couches) :**

**`server/src/services/claude.service.ts` — `streamContentGeneration()` modifié**
- Ajout paramètre optionnel `onComplete?: (content, tokensUsed) => Promise<{contentId?: string}>`
- Quand présent : appelle le callback AVANT d'envoyer l'événement SSE `{done: true}`, ce qui permet de sauvegarder en DB et inclure `contentId` dans le done : `{done: true, tokensUsed, contentId}`

**`server/src/controllers/content.controller.ts` — `generate()` restructuré**
- Suppression du bloc post-stream save
- La sauvegarde (Content.create + deductCredits) se fait dans le callback `onComplete` passé à `streamContentGeneration`
- Retourne `{contentId: String(saved._id)}` pour inclusion dans le SSE done event

**`client/src/store/contentSlice.ts` — ajouts**
- Nouveau champ `savedContentId: string | null` dans l'état
- `stopGeneration` accepte maintenant un payload optionnel `string` (le contentId) → `state.savedContentId = action.payload`
- `resetEditor` remet `savedContentId` à null

**`client/src/hooks/useStreaming.ts` — captures `contentId`**
- SSE parsed type étendu : `contentId?: string`
- `dispatch(stopGeneration(parsed.contentId))` — passe l'ID au slice
- `options.onDone?.(parsed.tokensUsed ?? 0, parsed.contentId)` — remonte l'ID aux callbacks

**`client/src/pages/Generate/GeneratePage.tsx` — Export dropdown ajouté**
- Import `exportService` ajouté
- États `isExporting` + `showExportMenu`
- `handleExport(format)` : `exportService.download(savedContentId, format, subject)` + toast
- Bouton "Exporter" visible dans la toolbar dès que `savedContentId !== null`
- Dropdown inline avec options : PDF / Word (.docx) / Markdown / Texte (.txt)

**HistoryPage déjà câblé :** Le composant `ExportMenu` avec les 4 formats était déjà présent et utilisé à la ligne 352.

---

#### Vérification TypeScript — Build May 7 (session 7)

```
pnpm tsc --noEmit → 0 erreur
pnpm build       → ✓ built in 3.37s (client + server)
```

**Total à ce jour : ~175 fichiers · ~10 050 lignes de code**

---

### [2026-05-08] — Phase 6 (suite) : Démo Landing + Effet Liquid Glass — COMPLÉTÉ ✅
- **Session :** 8
- **Statut :** Complété

---

#### Tâche 1 — Bouton "Voir la démo" → narration audio + modal

**Problème :** Le bouton "Voir la démo" n'avait aucune action (pas de `onClick`), et aucun système de démo n'existait.

**Fichier modifié : `client/src/pages/Landing/LandingPage.tsx`**

**Ajouts globaux :**
- Imports : `useCallback`, `useEffect`, `useRef`, `useState`
- `DEMO_SCENES` (L29–51) : 3 scènes (Brief / Generate / Export) avec tag, title, voice quote, result, icon
- `DEMO_NARRATION` (L53–67) : 12 phrases courtes séparées par `.` pour rythme TTS naturel, joinées en une string (`DEMO_DURATION_MS = 42000`)
- `findSentenceStart(text, fromChar)` (L71–79) : remonte à la phrase précédente pour reprendre proprement après pause
- `pickBestFrenchVoice()` (L81–94) : sélection de la voix française la plus naturelle dans l'ordre : Google français > Google (other) > Microsoft Hortense/Julie/Sylvie/Henri > Apple Amélie/Léa/Thomas/Marie > première FR disponible
- `state showDemo` dans `LandingPage` + `onClick={() => setShowDemo(true)}` sur le bouton hero
- `{showDemo && <DemoModal onClose={() => setShowDemo(false)} />}` en haut du render

**Composant `DemoModal`** (L97–373) :
- Layout : overlay fixe 100vw/100vh `background: rgba(0,0,0,0.68) backdropFilter: blur(12px)` + card 780px
- Header : bouton pause/play + pill "En lecture / En pause" + barre de progression + `0:XX / 0:42` + bouton fermer
- Corps : scène animée avec tag eyebrow + h3 + bubble commande vocale + result line + dots navigation
- Footer : label "Narration · Web Speech API · fr-FR" + bouton Fermer + CTA "Essayer gratuitement →"

---

#### Tâche 2 — Amélioration qualité voix TTS

**Problème :** La voix navigateur par défaut était robotique (Microsoft Anna en anglais sur Windows).

**Fix :** Fonction `pickBestFrenchVoice()` ci-dessus + paramètres SpeechSynthesisUtterance :
- `utt.rate = 0.88` (légèrement ralentie pour clarté)
- `utt.pitch = 1.05` (légèrement plus chaleureux)
- `utt.lang = "fr-FR"`

---

#### Tâche 3 — Bouton pause/resume dans la démo modal

**Ajouts :**
- État `isPaused` (React state) + `isPausedRef` (ref pour closures)
- Bouton circulaire 32px avec icône SVG play (triangle) ou pause (deux barres) selon état
- Pill "En lecture" (classe `voice`) vs "En pause" (classe normale)
- Barre de progression grise quand en pause, teal quand en lecture

---

#### Tâche 4 — Correction : reprise depuis la pause (Chrome speechSynthesis bug)

**Problème :** `speechSynthesis.pause()` + `resume()` cassé dans Chrome — `resume()` ne fait rien silencieusement.

**Fix (pattern cancel+recreate) :**
- À la **pause** : `isPausedRef.current = true` (avant `cancel()` pour bloquer `onend`) → `speechSynthesis.cancel()` → `clearInterval` + `clearTimeout` scènes
- À la **reprise** : `speakFrom(speechPlayedMsRef.current)` recréé une nouvelle `SpeechSynthesisUtterance` à la position estimée → `scheduleScenes(playedMs)` repart avec les délais ajustés → `startProgressInterval()` relance le tick

---

#### Tâche 5 — Correction : synchronisation progress bar + estimation position

**Problème :** La barre de progression était désynchronisée après pause+reprise : `onboundary` ne fire pas pour les voix Google (les plus naturelles), et `Date.now() - startMs` dériait après `speakFrom()`.

**Fix (tracking par segment, sans `onboundary`) :**
- `segOffsetMsRef` : ms audio joué au début de l'utterance courante
- `segStartRef` : `Date.now()` au moment du début de l'utterance
- `speechPlayedMsRef` : total ms joué = `segOffsetMsRef + (Date.now() - segStartRef)`, mis à jour toutes les 100ms par l'intervalle
- `speakFrom()` recalibre `segOffsetMsRef` au char snappé (`findSentenceStart`), reset `segStartRef = Date.now()`
- Progress = `speechPlayedMsRef.current / DEMO_DURATION_MS` — toujours exact quel que soit le nombre de pauses/reprises

---

#### Tâche 6 — Effet Liquid Glass / Glassmorphism sur le widget hero

**Problème (signalé via screenshot) :** L'utilisateur a demandé un effet "liquid glass" sur le widget app mockup dans le hero, sans toucher au header.

**Fichier modifié : `client/src/pages/Landing/LandingPage.tsx` — section hero mockup**

**Architecture du glass effect :**

1. **3 blobs gradient flous** (z-index 0, `position: absolute, inset: -24, overflow: hidden`) — donnent au `backdropFilter` de la matière visuelle à réfracter :
   - Blob 1 : `var(--accent-soft)`, 55%×55%, `blur(48px)`, opacity 0.9 (en haut à gauche)
   - Blob 2 : `var(--voice-soft)`, 45%×45%, `blur(44px)`, opacity 0.85 (en bas à droite)
   - Blob 3 : `rgba(255,220,160,0.22)`, 35%×35%, `blur(36px)` (centre, touche chaleureuse)

2. **Glass card** (z-index 1) :
   ```
   background: rgba(255,255,255,0.42)
   backdropFilter: blur(28px) saturate(180%) brightness(1.04)
   border: 1px solid rgba(255,255,255,0.58)
   boxShadow: 0 8px 40px rgba(58,47,37,0.10), inset 0 1.5px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)
   ```
   - Highlight inset en haut (presque blanc) + ombre inset subtile en bas = effet "épaisseur" du verre
   - Header interne `background: var(--bg-sunk)` conservé intact (bande sombre en haut de la carte)
   - Contenu `background: transparent` pour laisser voir les blobs à travers

3. **Floating mic pill** (z-index 2) : même traitement glass avec `blur(20px) saturate(180%) rgba(255,255,255,0.52)`

**Contrainte respectée :** Le navbar `<div className="row between" ... background: "var(--bg)">` n'a pas été modifié.

---

#### Vérification TypeScript — Session 8

```
pnpm exec tsc --noEmit → 0 erreur
```

**Total à ce jour : ~175 fichiers · ~10 300 lignes de code**

---

### [2026-05-08] — Enhanced Visual Effects v2 : Grid · Liquid Glass · Colored Shadows — COMPLÉTÉ ✅
- **Session :** 8 (suite)
- **Statut :** Complété

#### Fichier modifié : `client/src/index.css`

**Technique cascade :** Règles ajoutées en fin de fichier — même spécificité que les règles d'origine → les nouvelles gagnent systématiquement. Aucun `!important` nécessaire.

**1 — Motif quadrillé sur tous les arrières-plans**
- `body` et `.app` : grille 40×40px, `rgba(58,47,37,0.042)` en mode clair, `rgba(255,255,255,0.026)` en mode sombre
- `.card` : grille plus fine 28×28px, `rgba(58,47,37,0.030)` — texture micro sur toutes les surfaces de carte
- Dark mode : override `[data-theme="dark"]` pour les deux classes
- Technique : `background-image: linear-gradient(...)` × 2 (H + V) + `background-size` — le `background-color` hérité des règles précédentes reste intact grâce à la cascade par propriété

**2 — Liquid glass sur TOUS les boutons**
- `position: relative; overflow: hidden` déplacé de `.btn-primary/.btn-accent` vers `.btn` base
- `backdrop-filter: blur(14px) saturate(160%) brightness(1.02)` sur `.btn` base → s'applique à tous les variants
- **Shine sweep** déplacé vers `.btn::after` / `.btn:hover::after` → sweep visible sur tous les boutons
- `.btn::after` (spécificité 0,1,1) écrase l'ancien `.btn-primary::after` et `.btn-accent::after` (même spécificité, vient après)
- **Primary glass :** `rgba(58,47,37,0.88)` + `border: 1px solid rgba(255,255,255,0.13)` + inset top highlight `rgba(255,255,255,0.16)`
- **Accent glass :** `rgba(229,112,76,0.88)` + `border: 1px solid rgba(255,255,255,0.26)` + inset top highlight `rgba(255,255,255,0.32)`
- **Outline glass :** `rgba(255,255,255,0.46)` + `border: rgba(255,255,255,0.66)` + fort inset highlight
- **Ghost glass :** `rgba(248,247,245,0.44)` + `border: rgba(255,255,255,0.40)` + subtle inset
- Dark mode overrides pour `.btn-outline` et `.btn-ghost` (fond sombre translucide)

**3 — Drop shadows colorées renforcées (×2 vs session précédente)**
- `.card` base : ombre ambiante coral+teal sur toutes les cartes : `0 4px 18px rgba(229,112,76,0.08), 0 8px 32px rgba(107,184,189,0.05)` + `inset 0 1px 0 rgba(255,255,255,0.68)`
- `.btn-primary:hover` : ombre ink renforcée `0 6px 28px rgba(58,47,37,0.48)` (était 0.30)
- `.btn-accent:hover` : ombre coral `0 6px 30px rgba(229,112,76,0.72)` (était 0.50)
- `.card-landing:hover` : ombre coral `0 14px 44px rgba(229,112,76,0.24)` (était 0.12) + lift -4px
- `.card-voice-hover:hover` : ombre teal `0 12px 40px rgba(107,184,189,0.30)` (était 0.18) + lift -3px

**4 — Fichier modifié : `client/src/pages/Landing/LandingPage.tsx`** (session précédente, rappel)
- Blob décoratifs avec `z-index: -1` à l'intérieur d'un stacking context `position: relative; zIndex: 0`
- Glass card hero : ombre corail ambiante `rgba(229,112,76,0.12)`
- Pill mic : ombre teal `rgba(107,184,189,0.22)`
- CTA button : classe `btn-accent` ajoutée (bénéfice automatique du glass + shine)

#### Vérification
```
pnpm --filter client exec tsc --noEmit → 0 erreur
```

**Total à ce jour : ~175 fichiers · ~10 500 lignes de code**

---

### [2026-05-08] — Visual Polish v3 : Aurora Backgrounds · Frosted Headers · Landing Nav — COMPLÉTÉ ✅
- **Session :** 9
- **Statut :** Complété

#### 1 — Aurora gradients sur les arrières-plans principaux (`client/src/index.css`)

**Technique multi-couches :** `background-image` accepte des couches séparées par des virgules. Chaque couche a son propre `background-size` et `background-repeat`. Les layers d'aurora sont `no-repeat / 100% 100%` pour couvrir toute la hauteur.

- **`body`** : 3 couches — grille H+V (40×40px) + `linear-gradient(180deg, rgba(229,112,76,0.22) 0%, transparent 42%, rgba(107,184,189,0.18) 100%)` — dégradé coral en haut → cream → teal en bas
- **`.app`** : 4 couches — grille H+V + deux `radial-gradient` aux coins : teal haut-droit `(94% 3%)` + coral bas-gauche `(6% 97%)` — effet aurora de coin
- **`.card`** : 3 couches — grille H+V + `linear-gradient(148deg, rgba(229,112,76,0.07) 0%, transparent 52%)` — texture warm subtile sur chaque carte
- Drop shadows des cartes modérées : `0 4px 22px rgba(229,112,76,0.11), 0 8px 36px rgba(107,184,189,0.08)`

#### 2 — Headers frosted glass

**`client/src/pages/Landing/LandingPage.tsx` — navbar sticky (L402)**
- `background: "rgba(248,247,245,0.70)"` — semi-transparent sur l'aurora du body
- `backdropFilter: "blur(22px) saturate(180%) brightness(1.02)"` + `-webkit-` prefix
- `borderBottom: "1px solid rgba(255,255,255,0.25)"` — remplace `var(--line)` dur

**`client/src/components/Layout/Navbar.tsx` — navbar app (L24–29)**
- `background: "rgba(253,252,249,0.68)"` — légèrement plus opaque que landing
- Même `backdropFilter: blur(22px) saturate(180%) brightness(1.02)`
- `borderBottom: "1px solid rgba(255,255,255,0.25)"`

**`client/src/components/Layout/AppLayout.tsx` — main content area (L40)**
- `background: "transparent"` — le fond aurora du `.app` (radial coins) traverse maintenant toute la zone de contenu

#### 3 — Section Voice : gradient teal (Image #6 style)

**`client/src/pages/Landing/LandingPage.tsx` — `#voice` div (L584)**
- `background: "linear-gradient(165deg, rgba(107,184,189,0.28) 0%, rgba(107,184,189,0.08) 50%, var(--bg-sunk) 100%)"` — ambiance turquoise vive en haut gauche, dégradé vers cream

#### 4 — Navbar Landing : lien "Cas d'usage" + hover animé

**`client/src/pages/Landing/LandingPage.tsx` — navbar links (L407–412)**
- Classe `landing-nav-link` appliquée à tous les 5 liens (remplace style inline)
- Nouveau lien : `<a href="#usecases">Cas d'usage</a>` — pointe vers `id="usecases"` sur le div des commandes vocales (L620)
- Anchor `id="usecases"` ajouté sur le div "Right — command demos" à l'intérieur de la section `#voice`

**`client/src/index.css` (fin de fichier)**
- `.landing-nav-link` : `color: var(--ink-soft)`, `transition: color 0.18s`
- `.landing-nav-link::after` : underline coral animée — `width: 0 → 100%` sur hover via `cubic-bezier(0.4, 0, 0.2, 1)` 0.22s
- `.landing-nav-link:hover` : `color: var(--ink)` — assombrit le lien au survol

#### Liens de navigation (tous fonctionnels)
| Lien | Destination | Type |
|------|-------------|------|
| Produit | `#product` (Three pillars section, L562) | Anchor scroll |
| Voix | `#voice` (Voice section, L584) | Anchor scroll |
| Templates | `/templates` | React Router Link |
| Tarifs | `/pricing` | React Router Link |
| Cas d'usage | `#usecases` (Command demos, L620) | Anchor scroll |
| Connexion | `/login` | React Router Link |
| Essai gratuit → | `/register` via `navigate()` | Programmatic nav |

#### Vérification
```
npx tsc --noEmit → 0 erreur
```

---

### [2026-05-08 → 2026-05-09] — Corrections & Améliorations majeures (Session 4) ✅

- **Session :** 4
- **Statut :** Complété
- **Durée :** 2 sessions longues

---

#### 1 — Auth : persistence + Google OAuth + icône œil

**`client/src/hooks/useAuth.ts`**
- `initAuth()` : appelle `authService.refresh()` au lieu de vérifier `auth.accessToken` en mémoire → l'utilisateur reste connecté après refresh de page (cookie httpOnly)
- Helper `buildUser()` factorisé pour éviter la duplication

**`client/src/pages/Auth/GoogleCallbackPage.tsx`** — NOUVEAU
- Page intermédiaire `/auth/callback` : appelle `refresh()` pour obtenir un access token depuis le cookie posé par Google OAuth
- Dispatche `setCredentials` puis redirige `/dashboard`

**`client/src/App.tsx`**
- Import lazy `GoogleCallbackPage` + route `<Route path="/auth/callback" element={<GoogleCallbackPage />} />`

**`client/src/pages/Auth/AuthPage.tsx`**
- Composant `EyeIcon({ open })` : SVG œil ouvert (password visible) / œil barré (password masqué)
- Appliqué dans `LoginForm` (L368) et `RegisterForm` (L540) — remplace les caractères ● / ○

**`.env` (racine)**
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` configurés
- `GOOGLE_CALLBACK_URL` corrigée de port 5000 → 5001

---

#### 2 — Génération : formatage HTML + dictée + mots-clés

**`server/src/services/claude.service.ts`**
- `getSystemPrompt()` : instruction explicite HTML (`<h1>`, `<h2>`, `<p>`, `<ul>`, `<li>`, `<strong>`, `<em>`) — Claude ne génère plus de markdown

**`client/src/lib/markdownToHtml.ts`** — NOUVEAU
- Fonction `markdownToHTML(text)` : convertit markdown legacy → HTML (headings, bold/italic, listes, paragraphes)
- Détecte si déjà HTML (early return)

**`client/src/store/contentSlice.ts`**
- Action `setStreamedContent(html)` ajoutée pour mettre à jour le contenu streamé avec HTML converti

**`client/src/hooks/useStreaming.ts`**
- Import `markdownToHTML` depuis lib partagée
- Au `parsed.done` : `markdownToHTML(localContent)` → dispatche `setStreamedContent(html)` avant `stopGeneration`
- Variable locale `localContent` pour tracker le contenu accumulé sans dépendre de Redux

**`client/src/pages/Generate/GeneratePage.tsx`**
- Import `markdownToHTML` → appliqué sur `c.body` en view mode (`dispatch(setEditorContent(markdownToHTML(c.body ?? "")))`)
- Bouton "Dicter le brief" (form header) : `onClick={handleFloatingMic}` branché
- Input mots-clés : virgule comme séparateur automatique (ajoute le chip sans Enter)
- Auto-suggestion keywords : debounce 1500ms → `POST /content/suggest-keywords` → chips suggérés cliquables

**`server/src/controllers/content.controller.ts`** + **`server/src/routes/content.routes.ts`**
- `suggestKeywordsHandler` : reçoit `{subject, type}`, appelle `suggestKeywords()` Claude, retourne `string[]`
- Route `POST /suggest-keywords` enregistrée avant les routes `/:id`

---

#### 3 — Page Historique — réécriture complète

**`client/src/pages/History/HistoryPage.tsx`**
- Import `useNavigate` + `handleRowClick(item)` → `navigate('/generate?view=${item._id}')`
- `deleteConfirmId` state + `DeleteConfirmDialog` modal (overlay + Annuler/Supprimer)
- `viewMode: "list" | "grid"` state + toggle fonctionnel dans la barre de filtres
- Vue grille : `gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))"`, cartes cliquables
- Colonne actions : largeur 100px, icônes 13px, `e.stopPropagation()` sur chaque action
- Boutons "Export bulk ZIP" et "Tagger" : toast "Feature en développement"

---

#### 4 — Templates — icônes colorées + préchargement params

**`client/src/pages/Templates/TemplatesPage.tsx`**
- Bloc `template.variables.length > 0` retiré des cartes
- `TypeBadge` composant : 36×36px avec couleurs de marque (LinkedIn #0077B5, YouTube #FF0000, Instagram gradient, Twitter/X noir, Email #3b82f6, Blog/Press amber, etc.)
- `handleUse` : dispatche `tone` + `length` par défaut selon `template.type` (ex: LinkedIn → inspiring/medium, Blog → professional/long)

---

#### 5 — Page Favoris — NOUVELLE PAGE

**`client/src/pages/Favorites/FavoritesPage.tsx`** — NOUVEAU
- Vue grille par défaut + toggle liste/grille
- Cartes cliquables → `/generate?view=id`
- Actions : unfavorite (⭐ étoile colorée), copier, exporter (PDF/DOCX/MD/TXT)
- Recherche + filtre par type, pagination, état vide avec lien vers historique
- Query `favorite: true` toujours active, filtre côté client sur résultats de recherche

**`client/src/App.tsx`** : import lazy + route `/favorites`

**`client/src/components/Layout/Sidebar.tsx`** : lien Favoris → `/favorites` (était `/history?favorite=true`)

---

#### 6 — Dashboard — ring + responsive

**`client/src/pages/Dashboard/DashboardPage.tsx`**
- Ring crédits : `data=[{ value: Math.round(ringPct * 100) }]` — plein = crédits pleins
- Classes CSS responsives : `.dashboard-kpi-grid`, `.dashboard-charts-grid`, `.dashboard-bottom-grid`
- Skeleton loading : même classes responsives
- `.page-pad` : padding 32/40px → 20/16px sur mobile

---

#### 7 — Responsive mobile — sidebar drawer + layouts

**`client/src/components/Layout/AppLayout.tsx`**
- State `sidebarOpen` + overlay `.sidebar-overlay`
- Hamburger ☰ visible uniquement sur mobile/tablette (`.mobile-menu-btn`)

**`client/src/components/Layout/Sidebar.tsx`**
- Props `isOpen?: boolean`, `onClose?: () => void`
- `className={cn("sidenav", isOpen && "mobile-open")}`
- Bouton ✕ dans l'en-tête du sidebar (mobile seulement)
- `onClick={onClose}` sur chaque NavLink

**`client/src/index.css`**
- `.sidenav` : `transition: transform 0.25s ease`, drawer fixe < 1024px, `.mobile-open` → `transform: translateX(0)`
- `.sidebar-overlay` : backdrop blur fixe, visible via `.visible`
- `.generate-layout`, `.generate-form-panel`, `.generate-mic-float`, `.generate-editor-panel` : responsive < 900px (layout vertical)
- `.auth-layout`, `.auth-panel-left/right` : grid responsive, panneau droit masqué < 1024px
- `.auth-card { background-image: none }` : retire le quadrillage de la card formulaire

---

#### 8 — Page Auth — redesign visuel

**`client/src/components/Layout/AuthLayout.tsx`**
- Fond `var(--bg)` + quadrillage 40px (`background-image: linear-gradient(...)`)
- 5 blobs animés : coral (#e5704c, 0.16, haut-gauche), teal (#6bb8bd, 0.14, haut-droite), gold (#c9a24f, 0.11, centre), coral atténué (bas-gauche), teal doux (bas-droite)
- Animations : `floatA/B/C` 18–26s avec delays décalés

**`client/src/pages/Auth/AuthPage.tsx`**
- Formulaire dans `.card.auth-card` (glass) avec drop shadow coloré : `0 4px 24px rgba(229,112,76,0.18), 0 12px 48px rgba(107,184,189,0.14)`
- `maxWidth: 560px`, `padding: 28px 40px 24px`
- Espacement réduit dans RegisterForm (gap 10px, margins réduits)
- `DynamicPanel` :
  - Fond transparent, `justifyContent: flex-start`, `padding: "80px 72px 64px"`
  - Quote 58px, auteur juste sous le quote (même bloc `key={index}`)
  - `statsEverShown` : `useState(false)` irréversible → carte visible en permanence
  - Carte stats : `maxWidth: 420px`, `marginTop: auto`, `marginBottom: 108px`
  - `gridTemplateColumns: "repeat(3, auto)"`, `justifyContent: "start"`
- Logo : `transform: scale(1.28)` depuis `transformOrigin: "left center"`
- Footer : "© 2026 CODEXA Solutions · Tous droits réservés"

#### Vérification
```
pnpm exec tsc --noEmit → 0 erreur TypeScript
pnpm exec biome check → warnings pre-existants uniquement (no errors)
```

**Total à ce jour : ~175 fichiers · ~10 600 lignes de code**

---

### [2026-05-09] — Déploiement Live : Render + Vercel — COMPLÉTÉ ✅
- **Session :** 6
- **Statut :** Complété

#### Contexte
Premier déploiement live de l'application en production. Choix de Render (backend gratuit + Docker) + Vercel (frontend) en remplacement de Railway (payant).

#### URLs de production
- **Frontend** : `https://content-iq-client.vercel.app`
- **Backend** : `https://codexa-content-iq-backend.onrender.com`
- **GitHub** : `https://github.com/AbdelWariss/content-iq`

#### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `server/Dockerfile` | Pin pnpm@10.33.3 · copie `.npmrc` + `.pnpmfile.cjs` · `pnpm deploy --prod --legacy` · stage production autonome |
| `server/tsconfig.build.json` | `rootDir: ./src` + `include: [src]` + paths vers shared dist → `dist/index.js` à la racine |
| `client/vite.config.ts` | `manualChunks` objet → fonction (compliance type Rollup) |
| `client/tsconfig.node.json` | `skipLibCheck: true` (supprime erreur chai/vitest) |
| `pnpm-lock.yaml` | Mis à jour pour correspondre à pnpm 10.33.3 |
| `vercel.json` | Déjà configuré (build shared+client, SPA rewrites) |

#### Problèmes résolus (dans l'ordre)

1. **Dockerfile path** : Render cherchait `./Dockerfile` → configuré `./server/Dockerfile` dans Settings
2. **pnpm lockfile mismatch** : `pnpmfileChecksum` ne correspondait pas → ajout `.pnpmfile.cjs` + `.npmrc` dans `COPY`
3. **pnpm version** : version non fixée → `pnpm@10.33.3` (version locale)
4. **dist/index.js manquant** : `include: ["../packages/shared/src"]` dans tsconfig décalait le rootDir → override dans `tsconfig.build.json`
5. **socket.io introuvable** : symlinks pnpm cassés en prod → `pnpm deploy --prod --legacy` crée un `node_modules` autonome
6. **pnpm deploy pnpm v10** : flag `--legacy` requis depuis pnpm v10
7. **manualChunks TypeScript** : objet → fonction pour correspondre au type `ManualChunksFunction`
8. **tsup not found** : stage build avait besoin de `COPY --from=deps /app/packages ./packages`
9. **tsc not found** : stage build avait besoin de `COPY --from=deps /app/server/node_modules ./server/node_modules`

#### État post-déploiement
- Backend : **Live** (Render Free, cold start ~50s après inactivité)
- Frontend : **Live** (Vercel, chargement lent dû au cold start backend)
- `CLIENT_URL` sur Render : à mettre à jour → `https://content-iq-client.vercel.app`
- `GOOGLE_CALLBACK_URL` sur Render : à mettre à jour → `https://codexa-content-iq-backend.onrender.com/api/auth/google/callback`
- **UptimeRobot** : à configurer pour éviter la mise en veille du backend

#### Prochaines actions immédiates
1. Mettre à jour `CLIENT_URL` et `GOOGLE_CALLBACK_URL` dans Render → Environment
2. Mettre à jour `GOOGLE_CALLBACK_URL` dans Google Cloud Console (OAuth credentials)
3. Configurer UptimeRobot (ping toutes les 5 min sur `/health`)

---

### [2026-05-09] — Post-déploiement : corrections prod + Admin Logs + Mobile UI — COMPLÉTÉ ✅
- **Session :** 7 post-deploy
- **Statut :** Complété

---

#### 1 — CLAUDE.md — guide de codebase pour Claude Code

**Fichier créé : `CLAUDE.md` (racine)**
- Scripts pnpm (dev, build, lint, typecheck, test, seed)
- Architecture monorepo (client / server / packages/shared)
- Pattern lifecycle requête backend (route → middleware → controller → service → model)
- Auth flow (JWT 15min + refresh 7j cookie httpOnly SameSite=None)
- Design system CSS (tokens, classes utilitaires)
- Conventions (réponses API, soft delete, variables d'env, tests)
- Notes déploiement (Vercel + Render, pnpm deploy --legacy)

---

#### 2 — Corrections Google OAuth cross-domain

**Problème :** OAuth Google retournait un cookie httpOnly, mais Render (backend) et Vercel (frontend) sont sur des domaines différents → `SameSite=Lax` bloquait le cookie.

**`server/src/controllers/auth.controller.ts` — `googleCallback()`**
- Cookie `SameSite=None; Secure` pour cross-domain
- Stratégie : access token passé en query param `?token=<accessToken>` dans la redirect → `CLIENT_URL/auth/callback?token=...`

**`client/src/pages/Auth/GoogleCallbackPage.tsx`**
- Lit `token` depuis `URLSearchParams`
- Appelle `fetch()` directement (PAS l'instance axios) pour éviter que l'intercepteur de refresh court-circuite le flux OAuth
- Dispatche `setCredentials` et redirige `/dashboard`

**`client/src/services/axios.ts`**
- `AUTH_ROUTES` étendu pour inclure `/auth/google/callback`

---

#### 3 — Correction forme réponse `getMe`

**`server/src/controllers/auth.controller.ts` — `getMe()`**
- Réponse corrigée : `{ success: true, data: { user: ... } }` au lieu de `{ success: true, data: ... }`

**`client/src/hooks/useAuth.ts`**
- `res.data.data.user` au lieu de `res.data.data` pour extraire l'utilisateur

---

#### 4 — Correction CORS trailing slash

**`server/src/app.ts` — configuration CORS**
- `origin.replace(/\/$/, "")` — supprime le slash final de `CLIENT_URL` avant comparaison → élimine les erreurs CORS liées à la configuration Render

---

#### 5 — Sanitisation des erreurs API (sécurité)

**`server/src/services/claude.service.ts`**
- `sanitizeStreamError(err)` : masque les détails techniques Anthropic/API avant de les envoyer au client
- Log serveur (`appLog()`) pour garder la trace complète côté backend

---

#### 6 — Admin Logs Page

**Nouveau fichier : `server/src/utils/appLog.ts`**
- `appLog({ level, message, meta })` : écrit en MongoDB (collection `applogs`, TTL 90 jours)
- Fire-and-forget — ne bloque jamais la requête principale
- Niveaux : `info`, `warn`, `error`

**Nouveau modèle : `server/src/models/AppLog.model.ts`**
- Champs : `level`, `message`, `meta` (JSON), `createdAt` (TTL index 90j)

**`server/src/controllers/admin.controller.ts`**
- Nouveau handler `getLogs()` : pagination + filtre par niveau + recherche texte
- Instrumentation dans `generate()`, `login()`, `register()` → appels `appLog()`

**`client/src/pages/Admin/AdminPage.tsx`**
- Nouvel onglet "Logs" avec tableau filtrable (niveau, recherche, date)
- Pagination + color-coding (info=gris, warn=amber, error=coral)

**Fix : `client/src/services/admin.service.ts`**
- Déballage `.data` corrigé pour préserver la compatibilité de type `AdminPage`

---

#### 7 — Interface Mobile complète (11 écrans)

**Commits :** `58035d6` (bottom tab bar) + `2ad45c3` (11 écrans fidèles)

**`client/src/components/Layout/MobileTabBar.tsx`** — NOUVEAU
- Bottom tab bar fixe : Dashboard / Generate (FAB coral) / History / Profile
- Visible uniquement `≤ 640px` via `.mobile-tab-bar` dans `index.css`
- `NavLink` actif avec couleur accent, inactif `var(--ink-mute)`
- FAB Generate : cercle 56px coral, `boxShadow: 0 4px 16px rgba(229,112,76,0.4)`

**`client/src/index.css`** — Ajouts responsive mobile (≤ 640px)
- `.sidenav { display: none }` — sidebar masqué sur mobile (remplacé par tab bar)
- `.mobile-tab-bar { display: flex }` — tab bar visible
- `.hide-mobile { display: none !important }` / `.mobile-only { display: flex !important }`
- Layouts adaptatifs : `.dashboard-kpi-grid` 2 colonnes, `.generate-layout` vertical
- `.page-pad` réduit à 16px mobile
- `.dashboard-voice-journal` : supprimé `display: none !important` (visible sur mobile)

**Écrans adaptés (layouts mobiles) :**

| Page | Adaptation |
|------|-----------|
| DashboardPage | KPI 2 colonnes, suppression section Brouillons, "Derniers contenus" `overflow: hidden` |
| GeneratePage | Layout vertical (form + éditeur empilés), toolbar condensée |
| HistoryPage | Liste condensée, actions inline sur ligne |
| TemplatesPage | Filtres `.seg` scrollable horizontal, cartes pleine largeur |
| ProfilePage | iOS-style sections, SectionHeader + SettingsRow + InlineSelector |
| FavoritesPage | Grille 1 col, actions condensées |

---

#### 8 — Vérification TypeScript — Session May 9

```
pnpm --filter client typecheck → 0 erreur
pnpm --filter server typecheck → 0 erreur
```

**Total à ce jour : ~185 fichiers · ~11 200 lignes de code**

---

### [2026-05-10] — Anti-abus Auth + Email Templates + Visual Polish Icons — COMPLÉTÉ ✅
- **Session :** 8
- **Statut :** Complété

---

#### 1 — Anti-abus auth + corrections accès

**Commit :** `4d287ba` — mobile UI, anti-abuse auth, export fixes, subdomain config

**`client/src/pages/Auth/AuthPage.tsx` — RegisterForm**
- Checkbox CGU : `required` → bloqué à la soumission si non coché
- Message d'erreur visible si tentative de submit sans cocher

**Export DOCX :** correction du déclenchement (le content-type retourné par le serveur était mal lu côté client dans certains navigateurs).

---

#### 2 — Correction build TypeScript Vercel

**Commit :** `16aa1ed`

**`client/tsconfig.node.json`** + **`client/vite.config.ts`**
- Résolution d'erreurs bloquant le build Vercel (types Rollup `manualChunks`, `skipLibCheck`)
- Tous les types TypeScript résolus → build Vercel vert

---

#### 3 — Email verification banner + refonte templates email

**Commit :** `50970ec`

**`server/src/services/email.service.ts`**
- `sendVerificationEmail()` : HTML entièrement refondu (design brand coral + teal, structure claire)
- `sendPasswordResetEmail()` : même refonte visuelle
- `sendWelcomeEmail()` : mise à jour avec nouvelle charte
- `sendLowCreditsAlert()` : design cohérent

**`client/src/components/Layout/AppLayout.tsx` — `VerifyEmailBanner`**
- Bannière visible si `!user.emailVerified` : fond `var(--warn)`, message + bouton "Renvoyer l'email"
- Bouton désactivé après envoi (évite spam)

**`server/src/controllers/auth.controller.ts` — `resendVerification()`**
- Erreur remontée correctement au client (avant : swallowed silently)
- Toast d'erreur explicite si échec d'envoi

---

#### 4 — Correction affichage crédits

**Commit :** `50f2991`

- Formule corrigée dans la sidebar : `remaining/total` affiché au lieu de `used/total`
- Compteur `Derniers contenus` dashboard : total correct depuis la query

---

#### 5 — Dashboard empty state + icônes Sparkle

**Commits :** `3e5711c`, `ee5b42f`, `8567cb8`

**`client/src/pages/Dashboard/DashboardPage.tsx`**
- Empty state : suppression du cercle sombre, icône sparkle agrandie, couleur `var(--accent)` (coral)
- Correction glow clipping (overflow: visible sur le conteneur)

**`client/src/components/Layout/AppLayout.tsx` — `AssistantToggle`**
- Icône sparkle : `size={20}` → `size={36}` pour remplir le cercle 48px
- Couleur : texte `text-background` (blanc) quand bouton fermé

---

#### 6 — Sparkle icons sur les boutons Generate

**Commit :** `4f3d3d5`

**`client/src/pages/Generate/GeneratePage.tsx`**
- Bouton "Générer" principal : icône sparkle agrandie pour correspondre à la hauteur du bouton
- Icônes de types de contenu dans le form : taille harmonisée

---

#### 7 — Mobile Tab Bar FAB : icône agrandie

**Commit :** `6df0e30`

**`client/src/components/Layout/MobileTabBar.tsx`**
- Icône sparkle FAB Generate : `22px` → `42px` pour remplir le cercle 50px
- Visuellement cohérent avec la taille du bouton

---

#### Vérification TypeScript — Session May 10

```
pnpm --filter client typecheck → 0 erreur
```

**Total à ce jour : ~185 fichiers · ~11 400 lignes de code**

---

### [2026-05-11] — Polish UI : Templates, History, Profile (iOS mobile + fonctionnel) — COMPLÉTÉ ✅
- **Session :** 9
- **Statut :** Complété

---

#### 1 — Templates : CiqIcon TypeBadge + icônes Generate agrandies

**Commit :** `92aed0f`

**`client/src/pages/Templates/TemplatesPage.tsx`**
- `TypeBadge` : abandon du style couleur-par-réseau (LinkedIn bleu, Instagram gradient, etc.) → unification avec `CiqIcon.*` + design system (`.pill`, `.chip`, couleurs `var(--accent-soft)`)
- Icônes de types dans `GeneratePage` : taille augmentée pour meilleure lisibilité

---

#### 2 — Templates : icônes, boutons mobiles, badges rectangulaires

**Commit :** `3d2fad0`

**`client/src/pages/Templates/TemplatesPage.tsx`**
- Icônes des cartes templates : taille augmentée (`size={22}` → `size={28}`)
- Boutons actions mobile (Utiliser / Détails) : alignement corrigé, hauteur harmonisée
- Badges de type : `borderRadius: 999` → `borderRadius: 8` (rectangulaire avec coins arrondis)

---

#### 3 — History page : icônes, suppression frames, actions mobile

**Commit :** `001d4145`

**`client/src/pages/History/HistoryPage.tsx`**
- Boutons d'action (copier, favori, supprimer) : suppression des frames `.btn-ghost` → icônes nues plus propres
- Taille icônes : 13px → 18px
- Mobile : ajout d'un menu d'actions inline sur chaque ligne (glissement ou tap)

---

#### 4 — Templates mobile : filtres seg scrollable

**Commit :** `34ab407`

**`client/src/pages/Templates/TemplatesPage.tsx`**
- Filtres mobile : remplacement des chips par un `.seg` horizontal scrollable (cohérent avec le design system)
- CSS `.templates-mobile-seg` : `overflow-x: auto`, `scrollbar-width: none`, `flex-wrap: nowrap`

---

#### 5 — Unification filtres templates desktop/mobile + Dashboard overflow

**Commit :** `776455b`

**`client/src/pages/Templates/TemplatesPage.tsx`**
- `TYPE_FILTERS` unifié (même options desktop et mobile) :
  ```ts
  [all, système, Mes templates, LinkedIn, Réseaux Sociaux, Article, Email, Produit, Bio]
  ```
- Groupe "Réseaux Sociaux" : filtre `["twitter", "instagram", "youtube"]` côté client
- LinkedIn gardé séparé (réseau professionnel distinct)
- Query : `templateService.list(undefined)` — charge tous les templates, filtre côté client

**`client/src/pages/Dashboard/DashboardPage.tsx`**
- Section "Derniers contenus" : `style={{ minWidth: 0, overflow: "hidden" }}` sur la carte et les items → plus de débordement hors écran sur mobile

---

#### 6 — Refonte majeure Profile + Dashboard + Generate + Sidebar

**Commit :** `3f59cf8` — multiple UI improvements

**`client/src/pages/Dashboard/DashboardPage.tsx`**
- Suppression du KPI "Brouillons" — simplifie la lecture du tableau de bord

**`client/src/pages/Generate/GeneratePage.tsx`**
- **Bouton "Sauvegarder"** : visible dès que `savedContentId` existe → appelle `contentService.update(savedContentId, { body: editorContent })`
- **Bouton "Template"** : visible dès que du contenu est généré → ouvre modal de création de template personnel
- **Modal "Sauvegarder comme template"** : input nom + bouton save → `templateService.create({ name, type, category: "marketing", promptSchema: subject, variables: [], isPublic: false })`
- État : `isSavingContent`, `showSaveTemplate`, `templateName`, `isSavingTemplate`

**`client/src/components/Layout/Sidebar.tsx`**
- `accountItems` réduit de 3 à 2 : `/profile` ("Profil & Paramètres") + `/pricing` (facturation)
- Bouton "Paramètres" supprimé (fusionné dans "Profil & Paramètres")

**`client/src/pages/Profile/ProfilePage.tsx`** — refonte structure mobile (iOS-style)
- Nouveaux composants helpers :
  - `Toggle` : toggle iOS animé (width 44, borderRadius 999)
  - `SectionHeader` : eyebrow text uppercase 11px pour regrouper les sections
  - `SettingsRow` : ligne label + valeur + chevron + `onClick`
  - `InlineSelector` : modal centré (overlay blur) avec liste d'options checkées
  - `PlanBadge` : badge plan (rectangulaire, borderRadius 8)
- **Layout dual** : `<div className="hide-mobile">` (desktop) + `<div className="mobile-only">` (mobile) dans un seul composant

**`client/src/lib/ciq-icons.tsx`**
- Ajout icône `edit` (crayon SVG) utilisée dans le bouton d'édition mobile du profil

**`client/src/index.css`**
- Suppression `.dash-voice-journal { display: none !important }` → section "Voix · Journal" visible sur mobile

---

#### 7 — Profile : restauration layout desktop, iOS mobile uniquement

**Commit :** `4d96ed6`

**`client/src/pages/Profile/ProfilePage.tsx`**
- Layout desktop restauré depuis `git show HEAD~1` (4 sections verticales : Compte / Voix / Micro / Abonnement)
- Pattern `hide-mobile` / `mobile-only` : desktop et mobile coexistent dans le même composant
- Desktop : `maxWidth: 980, margin: "0 auto"` (rétabli ensuite via commit `295f0ba`)

---

#### 8 — Profile mobile : bouton édition + toggle autoplay + abonnement desktop fusionné

**Commit :** `63126a1`

**`client/src/pages/Profile/ProfilePage.tsx`**

**Ajout — bouton édition profil mobile :**
- Bouton crayon (`CiqIcon.edit`) sur la carte identité → ouvre une bottom-sheet modal
- Bottom-sheet : formulaire nom + email (readonly) + bio + langue → `onSubmit` → save + fermer

**Ajout — toggle "Lecture auto des réponses" mobile :**
- Composant `Toggle` avec état `autoPlay` + handler `handleAutoPlayChange`
- Sauvegardé en backend via `api.put("/users/me", { voicePreferences: { autoTts: val } })`

**Desktop — widget Abonnement supprimé, fusionné dans la carte Compte :**
- Footer de la carte Compte : `PlanBadge` + texte plan + bouton "Gérer" (Stripe Portal) + bouton "Mettre à niveau"
- Widget Abonnement standalone supprimé

---

#### 9 — Profile : options fonctionnelles + full-width desktop + badge rectangulaire

**Commit :** `8253100`

**`client/src/pages/Profile/ProfilePage.tsx`** — réécriture complète (636 lignes)

**Chargement des préférences au montage :**
```ts
useEffect(() => {
  api.get("/users/me").then(res => {
    // Hydrate selectedVoice, selectedSpeed, autoPlay, micLang, uiLang depuis voicePreferences
  });
}, []);
```

**Handlers fonctionnels (tous sauvegardés) :**

| Handler | Sauvegarde |
|---------|-----------|
| `handleVoiceChange(name)` | `voicePreferences.ttsVoice` → backend |
| `handleSpeedChange(speedV)` | `voicePreferences.speed` → backend |
| `handleAutoPlayChange(val)` | `voicePreferences.autoTts` → backend |
| `handleMicLangChange(lang)` | `voicePreferences.language` → backend |
| `handleUiLangChange(lang)` | `language` → backend + `i18n.changeLanguage()` live |
| `handleMicSensChange(val)` | `localStorage.ciq_mic_sens` |
| `handleActivationWordChange(val)` | `localStorage.ciq_activation` |
| `toggleMicTest()` | `navigator.mediaDevices.getUserMedia({ audio: true })` |

**Desktop :**
- `maxWidth: 980` retiré du wrapper global → widgets pleine largeur
- Grille voix préférences : `gridTemplateColumns: "1fr 1fr 1fr"` (vitesse / lecture auto / langue interface)

**`PlanBadge` :**
- `borderRadius: 8` (rectangulaire avec coins arrondis, non pill)
- `fontSize: 14, fontWeight: 600`
- Bordure subtile `rgba(229,112,76,0.25)`

**CTA :** "Passer Pro" → "Mettre à niveau" partout (desktop et mobile)

**Redux sync :** `dispatch(updateUser({ name }))` après sauvegarde nom

---

#### 10 — Corrections de largeur (desktop + mobile)

**Commits :** `295f0ba` + `10c586d`

**Profile desktop :** `maxWidth: 980, margin: "0 auto"` rétabli sur `<div className="hide-mobile">` → widgets centrés à 980px max

**Profile mobile :** `width: "100%", boxSizing: "border-box"` ajouté sur `<div className="mobile-only">` → les cartes occupent toute la largeur de l'écran sans débordement

---

#### 11 — Voix : aperçu automatique au clic + icône agrandie

**Commits :** `e30dab5` + `3505a59`

**`client/src/pages/Profile/ProfilePage.tsx`**

**Auto-preview au clic sur une carte voix :**
- `onClick` de la carte : `handleVoiceChange(name)` + `previewVoice(name, voiceId, lang)` simultanément
- Bouton play séparé supprimé → icône play/stop (`size={22}`) dans un `<span>` non-cliquable (indicateur visuel uniquement)
- Double clic → arrêt lecture

**`previewVoice()` — fallback TTS natif genré :**
- `setPreviewing(name)` placé AVANT l'appel API → icône bascule immédiatement
- En l'absence d'ElevenLabs (`useNativeTts: true`) :
  - `speechSynthesis.getVoices()` → cherche une voix correspondant au genre (regex `/female|femme/i` ou `/male|homme/i`) + langue
  - `utt.pitch = 1.25` (voix féminines) / `utt.pitch = 0.72` (voix masculines)
  - `utt.rate = 0.92`
- Résultat : voix distinctes même sans ElevenLabs configuré

---

#### Vérification TypeScript — Session May 11

```
pnpm --filter client typecheck → 0 erreur (toutes les sessions)
```

**Total à ce jour : ~188 fichiers · ~12 000 lignes de code**

---

## Résumé global d'avancement (mis à jour 2026-05-11)

| Phase | Contenu | Statut |
|-------|---------|--------|
| 0 | Setup & Infrastructure | ✅ |
| 1 | Auth JWT + OAuth Google | ✅ |
| 2 | Génération IA + Streaming SSE + Historique | ✅ |
| 3 | IQ Assistant + Templates + Voix | ✅ |
| 4 | Stripe + Exports + Dashboard + Admin | ✅ |
| 5 | Tests (66) + Déploiement Vercel/Render | ✅ |
| UI v2 | Design system + redesign complet | ✅ |
| UI v3 | Responsive mobile (11 écrans + tab bar) | ✅ |
| Post-deploy | Google OAuth cross-domain, CORS, Admin logs | ✅ |
| Polish May 10 | Email templates, anti-abus, sparkle icons | ✅ |
| Polish May 11 | Templates/History/Profile UI + voix fonctionnelle | ✅ |

**Total estimé : ~188 fichiers · ~12 000 lignes de code · 46 commits (May 9–11)**

---

### [2026-05-11] — Analyse architecture + Décision paiement KKiaPay → Stripe — CLÔTURÉ ✅
- **Session :** 10 (fin de journée)
- **Statut :** Complété

---

#### 1 — Analyse complète de l'architecture du projet

Exploration et documentation de l'ensemble du projet :
- Structure monorepo (`client` / `server` / `packages/shared`)
- Cycle de vie des requêtes backend (route → middleware → controller → service → model)
- Toutes les routes `/api/*` documentées (auth, users, content, voice, assistant, export, templates, credits, webhooks, admin, stats, stripe)
- Flux de génération SSE (useStreaming → appendToken → stopGeneration → savedContentId)
- State management Redux (4 slices : auth, content, assistant, voice)
- Design system CSS (tokens, classes utilitaires, responsive mobile)
- Infra de déploiement (Vercel + Render + MongoDB Atlas + Redis Upstash)

---

#### 2 — Évaluation intégration KKiaPay (écarté)

**Contexte :** Exploration de KKiaPay comme alternative à Stripe pour les utilisateurs d'Afrique de l'Ouest.

**Recherche effectuée :**
- SDK Node.js : `@kkiapay-org/nodejs-sdk` (installé puis désinstallé)
- API : paiements uniques uniquement, pas d'abonnements récurrents natifs
- Widget frontend : popup JS (`openKkiapayWidget`) ou redirection
- Webhook : `POST` avec `{ transactionId, isPaymentSucces, amount }` + header `x-kkiapay-secret`

**Décision finale :** KKiaPay écarté — absence de support abonnements récurrents automatiques.

**Stripe conservé** — l'intégration existante reste en place.

**SDK désinstallé :** `pnpm --filter server remove @kkiapay-org/nodejs-sdk`

---

#### 3 — Prochaine évolution Stripe prévue

Afficher les prix en **EUR ou USD** selon la devise de l'utilisateur :
- Détection automatique (IP géolocalisation ou `Intl.NumberFormat` navigateur)
- Passer `currency` au `createCheckoutSession` côté backend
- Affichage dynamique des prix sur `PricingPage` et `ProfilePage`

---

#### Mises à jour mémoire

- `memory/project_contentiq.md` : décision KKiaPay documentée, prochaine tâche Stripe multi-devises enregistrée

---

### [2026-05-15] — Corrections UX auth + Refonte code couleur — COMPLÉTÉ ✅
- **Session :** 11
- **Statut :** Complété

---

#### 1 — Correction rate limiting à l'inscription

**Problème :** L'ancien `authLimiter` (5 tentatives / 15 min) était partagé entre `/register` et `/login`. Un utilisateur soumettant un mot de passe faible lors de l'inscription consommait son quota et se retrouvait bloqué 15 minutes.

**Fix :**

| Fichier | Modification |
|---------|-------------|
| `server/src/middleware/rateLimiter.ts` | Supprimé `authLimiter` ; créé `loginLimiterShort` (5 tentatives/5 min), `loginLimiterLong` (10/15 min), `authGenericLimiter` (10/15 min) |
| `server/src/routes/auth.routes.ts` | `/register` → seulement `registerLimiter` ; `/login` → `loginLimiterShort + loginLimiterLong` (progressif) ; `/refresh`, `/forgot-password`, `/reset-password` → `authGenericLimiter` |
| `server/src/test/auth.test.ts` | Mock mis à jour : `authLimiter` → nouveaux exportés |
| `server/src/test/admin.test.ts` | Idem |

---

#### 2 — Refonte code couleur

**Passage de coral (#e5704c) → système bi-chrome bleu + teal**

**Couleur accent principale :** Bleu `#3B82F6` (bleu-500, intensité modérée)
- Hover/variante foncée : `#2563EB`
- Ink/texte : `#1d4ed8`
- Fond doux : `#eff8ff`

**Couleur accent secondaire (voix) :** Teal `#0891B2` (enrichi depuis `#6bb8bd`)
- Hover : `#0e7490`
- Fond doux : `#e0f9ff`

**Dégradé brand :** Teal → Bleu `#0891B2 → #3B82F6`

**Fichiers modifiés :**

| Fichier | Modifications |
|---------|-------------|
| `client/src/index.css` | Variables CSS complètes (accent, voice, primary Tailwind, ring, sélection, shadows, aurora, boutons, gradients) |
| `client/tailwind.config.ts` | Palette `brand` (bleu-500), nouvelle palette `teal`, `voice` sur `--voice-tw` |
| `client/src/components/Layout/AuthLayout.tsx` | Blobs fond : violet → bleu + teal |
| `client/src/pages/Landing/LandingPage.tsx` | Couleurs inline |
| `client/src/pages/Auth/AuthPage.tsx` | Couleurs inline |
| `client/src/pages/Auth/VerifyEmailPage.tsx` | Couleurs inline |
| `client/src/pages/Profile/ProfilePage.tsx` | Couleurs inline |
| `client/src/pages/Generate/GeneratePage.tsx` | Couleurs inline |
| `client/src/pages/Favorites/FavoritesPage.tsx` | Couleurs inline |
| `client/src/components/Layout/MobileTabBar.tsx` | Couleurs inline |

**Variables CSS finales :**
```
--accent: #3B82F6        --voice: #0891B2
--accent-ink: #1d4ed8    --voice-soft: #e0f9ff
--accent-soft: #eff8ff   --primary: 217 91% 60%
```

**Tests :** 41/41 serveur ✓ · TypeScript 0 erreur client et serveur ✓
