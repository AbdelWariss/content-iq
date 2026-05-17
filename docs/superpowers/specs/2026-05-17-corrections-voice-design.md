# Design Spec — Corrections UI + Voice + Traduction
**Date :** 2026-05-17  
**Statut :** Approuvé  
**Scope :** 4 corrections immédiates + 3 nouvelles features

---

## 1. Sidebar pliable

### Comportement
- Un bouton toggle `◀` / `▶` est ajouté dans le header de la sidebar, à droite du logo
- **Expanded** (défaut) : largeur 220px, icônes + labels, carte crédits complète, bouton logout texte
- **Collapsed** : largeur 56px, icônes seules centrées, tooltip au survol de chaque item, badge crédits minimal, bouton logout icône seule
- L'état est persisté dans `localStorage` sous la clé `ciq-sidebar-collapsed` (boolean)
- Transition CSS `width 0.22s ease` sur `.sidenav`

### Composants touchés
- `client/src/components/Layout/Sidebar.tsx` — toggle + états conditionnels
- `client/src/components/Layout/AppLayout.tsx` — passer `isCollapsed` à la sidebar
- `client/src/index.css` — classes `.sidenav.collapsed`, `.nav-item .label`, `.sidenav-toggle`

### Comportement collapsed
- Carte crédits → petit badge rond avec le nombre restant
- Section header "COMPTE" masquée
- Labels nav masqués (`opacity: 0`, `width: 0`)
- Tooltip natif via `title` attribute sur chaque `NavLink`

---

## 2. Raccourci de déconnexion

### Sidebar
- Bouton fixé tout en bas de la sidebar, sous la carte crédits
- Expanded : `🚪 Se déconnecter` (rouge doux, `color: var(--err)`)
- Collapsed : icône seule `🚪` centrée + tooltip "Se déconnecter"
- Appelle `useAuth().logout()`

### Navbar — dropdown avatar
- L'avatar (initiales) en haut à droite devient cliquable
- Clic → menu déroulant avec :
  - `👤 Mon profil` → `/profile`
  - Séparateur
  - `🚪 Se déconnecter` (rouge doux)
- Clic en dehors → fermeture (hook `useClickOutside`)
- Visible sur desktop uniquement (`hide-mobile`)

### Composants touchés
- `client/src/components/Layout/Sidebar.tsx` — bouton logout en bas
- `client/src/components/Layout/Navbar.tsx` — avatar dropdown

---

## 3. PricingPage — Bouton Retour (utilisateurs connectés)

### Comportement
- Affiché uniquement si `isAuthenticated === true`
- Positionné en haut à gauche de la page, avant le titre
- `← Retour` appelle `navigate(-1)`
- Style : `btn btn-ghost btn-sm`

### Composants touchés
- `client/src/pages/Pricing/PricingPage.tsx` — ajouter le bouton conditionnel

---

## 4. VerifyEmailPage — Layout mobile

### Desktop (≥768px)
- Comportement inchangé : 2 colonnes (`1fr 1.1fr`), `DynamicPanel` à droite

### Mobile (<768px)
- Colonne droite (`DynamicPanel`) masquée via CSS media query
- Colonne gauche : fond quadrillé `40px × 40px` (var `--bg` + grid), blobs floutés bleu/teal/gold positionnés en absolu
- Card centrée avec liquid glass (même style `.card` avec `backdrop-filter`, `box-shadow` coloré bleu/teal)
- Logo CONTENT.IQ centré en haut de la card

### 3 états de la card mobile

| État | Icône | Couleur icône | CTA |
|------|-------|---------------|-----|
| Loading | `〜` | Teal (`--voice`) | Aucun |
| Success | `✓` | Bleu (`--accent`) | "Accéder à mon espace →" (btn-primary) |
| Error | `✕` | Rouge (`#f87171`) | "← Retour à la connexion" (btn-outline) |

### Blobs de fond (mobile uniquement)
```
Blob 1 : top-left,  rgba(59,130,246,0.13), blur(44px), 180×180px
Blob 2 : mid-right, rgba(107,184,189,0.11), blur(38px), 150×150px
Blob 3 : bottom,    rgba(255,200,120,0.09), blur(35px), 130×130px
```

### Composants touchés
- `client/src/pages/Auth/VerifyEmailPage.tsx` — restructurer en layout responsive
- `client/src/index.css` — classes `.verify-mobile-bg`, `.verify-card-mobile`

---

## 5. Fonctionnalités vocales *(nouvelle feature)*

### 5a. TTS amélioré — Lecture du contenu généré
- Bouton `🔊 Lire` sur chaque contenu généré (GeneratePage + HistoryPage)
- **Free** : Web Speech API native (gratuit, langue détectée depuis le contenu)
- **Pro/Business** : ElevenLabs avec la voix sélectionnée dans le Profil
- État de lecture géré dans `voiceSlice` Redux (`isTtsSpeaking`, `currentTtsContentId`)
- Bouton devient `⏹ Arrêter` pendant la lecture

### 5b. Assistant vocal naturel
- Zone d'écoute dans `VoiceCommandPalette` ou composant `VoiceAssistant` dédié
- Flux : Micro ON → Web Speech transcrit → POST `/api/voice/intent` (transcript) → Claude (`claude-sonnet-4-6`) côté serveur interprète l'intention → réponse JSON → action exécutée côté client
- **Intentions supportées :**
  - `GENERATE` : *"Génère un script YouTube sur l'IA en Afrique, ton professionnel"* → pré-remplit GeneratePage + déclenche la génération
  - `READ` : *"Lis le contenu à voix haute"* → lance TTS
  - `IMPROVE` : *"Améliore le texte généré"* → appelle le service d'amélioration
  - `NAVIGATE` : *"Va sur l'historique"* → `navigate('/history')`
  - `HELP` : *"Aide"* → affiche liste des commandes
- Réponse : `{ intent, params }` — nouveau endpoint `server/src/routes/voice.routes.ts` + `server/src/services/voice.service.ts`
- Fallback : si intent non reconnu → affiche le transcript brut dans le chat IQ Assistant

### 5c. Page Voice dédiée (`/voice`)
- Déjà dans `MobileVoiceScreen.tsx` — à compléter et adapter desktop
- Interface : bouton micro central → enregistrement → transcription affichée → actions disponibles
- Actions : `Générer du contenu`, `Améliorer`, `Lire`, `Copier la transcription`
- Indicateur visuel d'écoute (MicWave animé)
- Accessible depuis la sidebar (item "Voice") et la MobileTabBar

### 5d. Dictée formulaires — Correction UX
- Corriger `useVoice` : `startListening` doit s'arrêter proprement via `stopListening` sans laisser le mic actif
- Insérer le transcript au curseur dans l'input (pas en remplacement total)
- Feedback visuel pendant l'écoute sur le champ actif (bordure `--accent` pulsante)

### 5e. Commandes vocales étendues
Nouvelles commandes à ajouter dans `useVoice` / `VoiceCommandPalette` :
- Navigation : "Tableau de bord", "Historique", "Templates", "Favoris", "Profil", "Tarifs"
- Génération : "Génère [type] sur [sujet]", "Nouveau contenu"
- Export : "Exporte en PDF/DOCX/MD"
- Lecture : "Lis le contenu", "Stop"
- Assistant : "Ouvre l'assistant"

### Upload documents (futur — hors scope immédiat)
- Prévu : uploader PDF/DOCX → améliorer ou modifier via paramètres vocaux
- À implémenter dans une phase ultérieure

---

## 6. Modèles de voix *(amélioration Profile)*

### Choix du moteur TTS
- Nouveau toggle dans les paramètres voix du Profil : **ElevenLabs HD** vs **Web Speech natif**
- ElevenLabs : disponible uniquement Pro/Business (consomme 1 crédit par lecture)
- Web Speech : disponible tous plans, qualité inférieure, 0 crédit
- Persisté dans `user.voicePreferences.engine` (nouveau champ)

### Voix par contexte
Trois slots de voix dans le Profil :
- **Lecture de contenu** : voix douce/narrative (défaut : Aïssata FR ou Camille FR)
- **Commandes vocales** : non applicable (Web Speech API uniquement pour la reconnaissance)
- **Assistant conversationnel** : voix conversationnelle (défaut : Théo FR ou Marcus EN)

### Page sélection de voix enrichie
- Section voix dans ProfilePage restructurée :
  - Onglets ou filtres : `FR` / `EN` / `Autres`
  - Filtre genre : `Tous` / `F` / `M`
  - Filtre style : `Naturelle` / `Narrative` / `Formelle`
  - Card voix : nom, meta (langue · genre), bouton `▶ Preview` (lit phrase d'exemple)
  - Voix actuelle mise en avant avec badge "Sélectionnée"
  - Voix recommandée selon le contenu généré le plus souvent

---

## 7. Traduction + génération multilingue *(nouvelle feature)*

### Génération dans une langue précise
- Sélecteur `Langue de sortie` dans GeneratePage : `Français (défaut)` / `English`
- Le `prompt` envoyé à Claude inclut l'instruction de langue : *"Respond in English"*
- Champ `outputLanguage` ajouté au schéma `GenerateContentSchema` dans `@contentiq/shared`

### Traduction de texte généré
- Bouton `🌐 Traduire en anglais` sur le contenu généré (GeneratePage + HistoryPage)
- Appelle un endpoint `/api/content/translate` (POST `{ contentId, targetLang: "en" }`)
- Retourne le texte traduit — affiché dans un panneau latéral ou en remplacement (au choix via toggle)
- Côté serveur : appel Claude avec instruction de traduction, pas de streaming (traduction rapide)

### Scope immédiat
- Langues supportées : **FR** et **EN** uniquement
- Traduction PDF/documents : **futur** (hors scope)

---

## Priorisation d'implémentation

| Priorité | Item | Complexité |
|----------|------|------------|
| 🔴 P1 | Sidebar pliable | Moyenne |
| 🔴 P1 | Logout shortcuts | Faible |
| 🔴 P1 | Pricing bouton Retour | Très faible |
| 🔴 P1 | VerifyEmailPage mobile | Faible |
| 🟡 P2 | TTS lecture contenu | Moyenne |
| 🟡 P2 | Dictée formulaires fix | Faible |
| 🟡 P2 | Commandes vocales étendues | Moyenne |
| 🟡 P2 | Voix par contexte + page enrichie | Moyenne |
| 🟠 P3 | Assistant vocal naturel | Élevée |
| 🟠 P3 | Page Voice dédiée | Élevée |
| 🟠 P3 | Génération multilingue + traduction | Élevée |
| ⚪ Futur | Upload documents | Très élevée |
