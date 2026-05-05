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

**Total écrit à ce jour : ~152 fichiers · ~8 050 lignes de code**

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
