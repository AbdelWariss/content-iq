# Corrections UI P1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les 4 corrections UI prioritaires : sidebar pliable, raccourcis de déconnexion, bouton Retour sur PricingPage, et layout mobile de VerifyEmailPage.

**Architecture:** Toutes les modifications sont exclusivement frontend. L'état collapsed de la sidebar est géré localement via `useState` initialisé depuis `localStorage` — pas de Redux (préférence UI éphémère). Le dropdown avatar utilise `useRef` + `useEffect` pour la détection de clic extérieur.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, @testing-library/react, react-router-dom, i18next

---

## File Map

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `client/src/lib/ciq-icons.tsx` | Modifier | Ajouter icônes `chevL` et `logout` |
| `client/src/locales/fr.ts` | Modifier | Clés `sidebar.logout`, `sidebar.expand`, `sidebar.collapse` |
| `client/src/locales/en.ts` | Modifier | Mêmes clés en anglais |
| `client/src/index.css` | Modifier | Classes `.sidenav.collapsed`, `.sidenav-toggle`, `.nav-dropdown-*`, `.verify-*` |
| `client/src/components/Layout/Sidebar.tsx` | Modifier | Toggle collapsed + bouton logout |
| `client/src/components/Layout/Navbar.tsx` | Modifier | Avatar dropdown avec logout |
| `client/src/pages/Pricing/PricingPage.tsx` | Modifier | Bouton ← Retour (auth seulement) |
| `client/src/pages/Auth/VerifyEmailPage.tsx` | Modifier | Layout responsive mobile |
| `client/src/test/sidebar.test.tsx` | Créer | Tests sidebar toggle + logout |
| `client/src/test/pricingPage.test.tsx` | Créer | Test bouton Retour conditionnel |

---

## Task 1 — Icônes `chevL` et `logout` dans ciq-icons.tsx

**Files:**
- Modify: `client/src/lib/ciq-icons.tsx`

- [ ] **Étape 1 : Lire le fichier pour trouver l'endroit exact où insérer**

  Ouvrir `client/src/lib/ciq-icons.tsx`. Repérer la ligne de `chevR` (~ligne 181) et `chevD` (~ligne 186). Les deux nouvelles icônes s'insèrent juste après `chevD`.

- [ ] **Étape 2 : Ajouter les deux icônes après `chevD`**

  ```tsx
  // Après la définition de chevD :
  chevL: (
    <svg viewBox="0 0 24 24">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  ```

- [ ] **Étape 3 : Vérifier que TypeScript accepte les nouvelles icônes**

  ```bash
  pnpm --filter client typecheck
  ```
  Attendu : 0 erreur.

- [ ] **Étape 4 : Commit**

  ```bash
  git add client/src/lib/ciq-icons.tsx
  git commit -m "feat: add chevL and logout icons to ciq-icons"
  ```

---

## Task 2 — Clés i18n sidebar (fr.ts + en.ts)

**Files:**
- Modify: `client/src/locales/fr.ts`
- Modify: `client/src/locales/en.ts`

- [ ] **Étape 1 : Ajouter les 3 clés dans fr.ts**

  Dans `client/src/locales/fr.ts`, section `sidebar`, ajouter après `renewsOn`:

  ```ts
  sidebar: {
    dashboard: "Tableau de bord",
    generate: "Générer",
    history: "Historique",
    templates: "Templates",
    account: "Compte",
    profile: "Profil & voix",
    billing: "Facturation",
    credits: "Crédits",
    renewsOn: "Renouvelle {{date}}",
    voice: "voix",
    favorites: "Favoris",
    settings: "Paramètres",
    logout: "Se déconnecter",     // ← nouveau
    expand: "Déplier le menu",    // ← nouveau
    collapse: "Replier le menu",  // ← nouveau
  },
  ```

- [ ] **Étape 2 : Ajouter les mêmes clés dans en.ts**

  ```ts
  sidebar: {
    dashboard: "Dashboard",
    generate: "Generate",
    history: "History",
    templates: "Templates",
    account: "Account",
    profile: "Profile & voice",
    billing: "Billing",
    credits: "Credits",
    renewsOn: "Renews {{date}}",
    voice: "voice",
    favorites: "Favorites",
    settings: "Settings",
    logout: "Log out",            // ← nouveau
    expand: "Expand menu",        // ← nouveau
    collapse: "Collapse menu",    // ← nouveau
  },
  ```

- [ ] **Étape 3 : Commit**

  ```bash
  git add client/src/locales/fr.ts client/src/locales/en.ts
  git commit -m "i18n: add sidebar.logout, expand, collapse keys"
  ```

---

## Task 3 — CSS : sidebar collapsed, dropdown navbar, verify mobile

**Files:**
- Modify: `client/src/index.css`

- [ ] **Étape 1 : Trouver la règle `.sidenav` existante (~ligne 436)**

  Elle définit `width: 256px`. La transition sera ajoutée ici.

- [ ] **Étape 2 : Modifier la règle `.sidenav` pour ajouter la transition**

  Remplacer le bloc `.sidenav { width: 256px; ... }` existant pour ajouter `transition`:

  ```css
  .sidenav {
    width: 256px;
    padding: 22px 16px;
    gap: 3px;
    display: flex;
    flex-direction: column;
    background: var(--bg-sunk);
    border-right: 1px solid var(--line);
    flex-shrink: 0;
    transition: width 0.22s ease, padding 0.22s ease;
  }
  ```

- [ ] **Étape 3 : Ajouter les nouvelles classes CSS après la règle `.sidenav .nav-section`**

  Repérer la ligne `/* ─── Voice waveform ─── */` (~ligne 478) et insérer avant elle :

  ```css
  /* ─── Sidebar — état collapsed ─── */
  .sidenav.collapsed {
    width: 64px;
    padding: 22px 8px;
  }
  .sidenav.collapsed .nav-item {
    justify-content: center;
    padding: 10px 8px;
    gap: 0;
  }

  /* Bouton toggle sidebar */
  .sidenav-toggle {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid var(--line);
    background: var(--bg-elev);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    color: var(--ink-mute);
    transition: background 0.12s, color 0.12s;
  }
  .sidenav-toggle:hover {
    background: var(--bg);
    color: var(--ink);
  }

  /* ─── Navbar — dropdown avatar ─── */
  .nav-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background 0.1s;
    white-space: nowrap;
  }
  .nav-dropdown-item:hover {
    background: var(--bg-sunk);
  }
  .nav-dropdown-item.danger {
    color: #e05252;
  }
  .nav-dropdown-item.danger:hover {
    background: rgba(224,82,82,0.07);
  }
  .nav-avatar-btn {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--bg-sunk);
    border: 1px solid var(--line);
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    color: var(--ink);
    transition: border-color 0.12s, background 0.12s;
  }
  .nav-avatar-btn:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  /* ─── VerifyEmailPage — mobile layout ─── */
  .verify-layout {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    height: 100%;
  }
  .verify-panel-left {
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 44px 64px;
    overflow-y: auto;
    position: relative;
  }
  .verify-panel-right {
    /* visible par défaut */
  }
  .verify-mobile-blobs {
    display: none;
  }

  @media (max-width: 768px) {
    .verify-layout {
      grid-template-columns: 1fr;
    }
    .verify-panel-right {
      display: none;
    }
    .verify-panel-left {
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      background-image:
        linear-gradient(rgba(58, 47, 37, 0.024) 1px, transparent 1px),
        linear-gradient(90deg, rgba(58, 47, 37, 0.024) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .verify-logo,
    .verify-footer {
      display: none;
    }
    .verify-mobile-blobs {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    .verify-blob {
      position: absolute;
      border-radius: 50%;
    }
    .verify-blob-1 {
      top: -20px;
      left: -30px;
      width: 180px;
      height: 180px;
      background: rgba(59, 130, 246, 0.13);
      filter: blur(44px);
    }
    .verify-blob-2 {
      top: 100px;
      right: -40px;
      width: 150px;
      height: 150px;
      background: rgba(107, 184, 189, 0.11);
      filter: blur(38px);
    }
    .verify-blob-3 {
      bottom: 0;
      left: 20px;
      width: 130px;
      height: 130px;
      background: rgba(255, 200, 120, 0.09);
      filter: blur(35px);
    }
    .verify-card-mobile {
      position: relative;
      z-index: 1;
      background-color: rgba(253, 252, 249, 0.78);
      background-image:
        linear-gradient(rgba(58, 47, 37, 0.016) 1px, transparent 1px),
        linear-gradient(90deg, rgba(58, 47, 37, 0.016) 1px, transparent 1px);
      background-size: 28px 28px;
      backdrop-filter: blur(18px) saturate(180%) brightness(1.02);
      -webkit-backdrop-filter: blur(18px) saturate(180%) brightness(1.02);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.82),
        0 1px 3px rgba(58, 47, 37, 0.06),
        0 4px 22px rgba(59, 130, 246, 0.14),
        0 8px 36px rgba(8, 145, 178, 0.1);
      border-radius: 20px;
      padding: 28px 24px;
      margin: 20px;
      max-width: 320px;
      text-align: center;
      animation: fadeSlideIn 0.3s ease;
    }
  }
  ```

- [ ] **Étape 4 : Vérifier qu'il n'y a pas d'erreur Biome**

  ```bash
  pnpm lint
  ```

- [ ] **Étape 5 : Commit**

  ```bash
  git add client/src/index.css
  git commit -m "style: sidebar collapsed, nav dropdown, verify mobile CSS"
  ```

---

## Task 4 — Sidebar : toggle collapsed + bouton logout

**Files:**
- Modify: `client/src/components/Layout/Sidebar.tsx`
- Test: `client/src/test/sidebar.test.tsx`

- [ ] **Étape 1 : Écrire le test qui va échouer**

  Créer `client/src/test/sidebar.test.tsx` :

  ```tsx
  import { describe, it, expect, beforeEach, vi } from "vitest";
  import { render, screen, fireEvent } from "@testing-library/react";
  import { MemoryRouter } from "react-router-dom";
  import { Provider } from "react-redux";
  import { configureStore } from "@reduxjs/toolkit";
  import authReducer from "@/store/authSlice";
  import { Sidebar } from "@/components/Layout/Sidebar";

  // Mock useAuth
  vi.mock("@/hooks/useAuth", () => ({
    useAuth: () => ({ logout: vi.fn() }),
  }));

  // Mock i18next
  vi.mock("react-i18next", () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: "fr" },
    }),
  }));

  function makeStore(user = { name: "Test User", credits: { total: 500, remaining: 250, resetDate: null }, role: "free", emailVerified: true }) {
    return configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user, token: "tok", loading: false } },
    });
  }

  function renderSidebar(props = {}) {
    const store = makeStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Sidebar {...props} />
        </MemoryRouter>
      </Provider>
    );
  }

  describe("Sidebar", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("affiche le bouton logout", () => {
      renderSidebar();
      expect(screen.getByTitle("sidebar.collapse")).toBeInTheDocument();
    });

    it("se replie au clic sur le toggle et persiste dans localStorage", () => {
      renderSidebar();
      const toggle = screen.getByTitle("sidebar.collapse");
      fireEvent.click(toggle);
      expect(localStorage.getItem("ciq-sidebar-collapsed")).toBe("true");
    });

    it("se déplie si localStorage contient 'true' et le toggle est cliqué", () => {
      localStorage.setItem("ciq-sidebar-collapsed", "true");
      renderSidebar();
      const toggle = screen.getByTitle("sidebar.expand");
      fireEvent.click(toggle);
      expect(localStorage.getItem("ciq-sidebar-collapsed")).toBe("false");
    });

    it("affiche le bouton Se déconnecter", () => {
      renderSidebar();
      expect(screen.getByText("sidebar.logout")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**

  ```bash
  pnpm --filter client test -- sidebar --reporter=verbose
  ```
  Attendu : FAIL — `sidebar.logout` not found, toggle button not found.

- [ ] **Étape 3 : Implémenter le Sidebar modifié**

  Remplacer le contenu de `client/src/components/Layout/Sidebar.tsx` :

  ```tsx
  import { useAuth } from "@/hooks/useAuth";
  import { CiqIcon, Ico } from "@/lib/ciq-icons";
  import { cn } from "@/lib/utils";
  import { useAppSelector } from "@/store/index";
  import { format } from "date-fns";
  import { enUS, fr } from "date-fns/locale";
  import { useState } from "react";
  import { useTranslation } from "react-i18next";
  import { NavLink } from "react-router-dom";

  interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
  }

  export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { t, i18n } = useTranslation();
    const user = useAppSelector((s) => s.auth.user);
    const { logout } = useAuth();
    const dateLocale = i18n.language === "en" ? enUS : fr;

    const [collapsed, setCollapsed] = useState<boolean>(() => {
      return localStorage.getItem("ciq-sidebar-collapsed") === "true";
    });

    const toggleCollapsed = () => {
      const next = !collapsed;
      setCollapsed(next);
      localStorage.setItem("ciq-sidebar-collapsed", String(next));
    };

    const used = user?.credits ? user.credits.total - user.credits.remaining : 0;
    const total = user?.credits?.total ?? 500;
    const remaining = user?.credits?.remaining ?? 0;
    const pct = total > 0 ? Math.round((used / total) * 100) : 0;

    const resetDateFormatted = user?.credits?.resetDate
      ? format(new Date(user.credits.resetDate), "d MMM", { locale: dateLocale })
      : "—";

    const isAdmin = user?.role === "admin";

    const mainItems = [
      { to: "/dashboard", icon: CiqIcon.dash, label: t("sidebar.dashboard") },
      { to: "/generate", icon: CiqIcon.sparkle, label: t("sidebar.generate") },
      { to: "/history", icon: CiqIcon.history, label: t("sidebar.history") },
      { to: "/templates", icon: CiqIcon.templ, label: t("sidebar.templates") },
      { to: "/favorites", icon: CiqIcon.star, label: t("sidebar.favorites") },
    ];

    const accountItems = [
      { to: "/profile", icon: CiqIcon.user, label: "Profil & Paramètres" },
      { to: "/pricing", icon: CiqIcon.card, label: t("sidebar.billing") },
    ];

    return (
      <aside className={cn("sidenav", isOpen && "mobile-open", collapsed && "collapsed")}>
        {/* ─── Logo + toggle ─── */}
        <div
          className="ciq-mark"
          style={{
            padding: "0 4px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <span className="dot" style={{ flexShrink: 0 }}>C</span>
            {!collapsed && (
              <span className="name" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                <b>CONTENT</b>
                <span>.IQ</span>
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {/* Desktop toggle — masqué sur mobile */}
            <button
              type="button"
              className="sidenav-toggle hide-mobile"
              onClick={toggleCollapsed}
              title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            >
              <Ico icon={collapsed ? CiqIcon.chevR : CiqIcon.chevL} size={13} />
            </button>
            {/* Mobile close */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg-elev)",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
              aria-label="Fermer le menu"
            >
              <Ico icon={CiqIcon.x} size={14} />
            </button>
          </div>
        </div>

        {/* ─── Main nav ─── */}
        {mainItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
            onClick={onClose}
            title={collapsed ? it.label : undefined}
          >
            <Ico icon={it.icon} size={18} />
            {!collapsed && it.label}
          </NavLink>
        ))}

        {/* ─── Account section ─── */}
        {!collapsed && (
          <div className="nav-section" style={{ fontSize: 11, marginTop: 8 }}>
            {t("sidebar.account")}
          </div>
        )}

        {accountItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
            onClick={onClose}
            title={collapsed ? it.label : undefined}
          >
            <Ico icon={it.icon} size={18} />
            {!collapsed && it.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
            onClick={onClose}
            title={collapsed ? "Admin" : undefined}
          >
            <Ico icon={CiqIcon.shield} size={18} />
            {!collapsed && "Admin"}
          </NavLink>
        )}

        {/* ─── Spacer ─── */}
        <div style={{ flex: 1 }} />

        {/* ─── Crédits ─── */}
        {collapsed ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "8px 0",
            }}
            title={`${remaining}/${total} crédits`}
          >
            <Ico icon={CiqIcon.zap} size={14} style={{ color: "var(--accent)" }} />
            <span className="t-mono" style={{ fontSize: 9, color: "var(--ink-mute)" }}>
              {remaining}
            </span>
          </div>
        ) : (
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="t-eyebrow" style={{ fontSize: 11 }}>
                {t("sidebar.credits")}
              </span>
              <span className="t-mono" style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                {remaining}/{total}
              </span>
            </div>
            <div className="gauge accent">
              <i style={{ width: `${100 - pct}%` }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6 }}>
              {t("sidebar.renewsOn", { date: resetDateFormatted })}
            </div>
          </div>
        )}

        {/* ─── Logout ─── */}
        <button
          type="button"
          className="nav-item"
          onClick={logout}
          title={collapsed ? t("sidebar.logout") : undefined}
          style={{ color: "#e05252", marginTop: 4, border: "none", background: "none" }}
        >
          <Ico icon={CiqIcon.logout} size={18} />
          {!collapsed && t("sidebar.logout")}
        </button>
      </aside>
    );
  }
  ```

- [ ] **Étape 4 : Lancer les tests**

  ```bash
  pnpm --filter client test -- sidebar --reporter=verbose
  ```
  Attendu : 4 tests PASS.

- [ ] **Étape 5 : Vérifier TypeScript**

  ```bash
  pnpm --filter client typecheck
  ```
  Attendu : 0 erreur.

- [ ] **Étape 6 : Commit**

  ```bash
  git add client/src/components/Layout/Sidebar.tsx client/src/test/sidebar.test.tsx
  git commit -m "feat: sidebar collapsible toggle + logout button"
  ```

---

## Task 5 — Navbar : avatar dropdown avec logout

**Files:**
- Modify: `client/src/components/Layout/Navbar.tsx`

- [ ] **Étape 1 : Ajouter les imports manquants en haut de Navbar.tsx**

  Les imports actuels sont : `CiqIcon, Ico`, `api`, `updateUser`, `useAppDispatch/useAppSelector`, `useTranslation`, `useLocation, useNavigate`. Ajouter :

  ```tsx
  import { useAuth } from "@/hooks/useAuth";
  import { useEffect, useRef, useState } from "react";
  ```

- [ ] **Étape 2 : Ajouter l'état dropdown et le ref dans la fonction `Navbar`**

  Après la ligne `const location = useLocation();`, ajouter :

  ```tsx
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);
  ```

- [ ] **Étape 3 : Remplacer le `<div>` avatar statique par le bouton + dropdown**

  Dans le JSX de Navbar, trouver le bloc avatar (actuellement une `<div className="hide-mobile">` avec les initiales) et le remplacer par :

  ```tsx
  {/* Avatar + dropdown — masqué sur mobile */}
  <div ref={menuRef} className="hide-mobile" style={{ position: "relative" }}>
    <button
      type="button"
      className="nav-avatar-btn"
      onClick={() => setMenuOpen((o) => !o)}
      aria-label="Menu compte"
      aria-expanded={menuOpen}
    >
      {initials}
    </button>
    {menuOpen && (
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 0,
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          boxShadow: "var(--shadow-pop)",
          padding: 4,
          minWidth: 172,
          zIndex: 50,
        }}
      >
        <button
          type="button"
          className="nav-dropdown-item"
          onClick={() => { navigate("/profile"); setMenuOpen(false); }}
        >
          <Ico icon={CiqIcon.user} size={15} />
          Mon profil
        </button>
        <div className="hr" style={{ margin: "4px 0" }} />
        <button
          type="button"
          className="nav-dropdown-item danger"
          onClick={() => { logout(); setMenuOpen(false); }}
        >
          <Ico icon={CiqIcon.logout} size={15} />
          {t("profile.logoutBtn")}
        </button>
      </div>
    )}
  </div>
  ```

- [ ] **Étape 4 : Vérifier TypeScript**

  ```bash
  pnpm --filter client typecheck
  ```
  Attendu : 0 erreur.

- [ ] **Étape 5 : Vérifier manuellement**

  Lancer `pnpm dev`, naviguer dans l'app, cliquer sur l'avatar en haut à droite.
  - Le dropdown doit apparaître avec "Mon profil" et "Se déconnecter"
  - Cliquer en dehors doit le fermer
  - "Se déconnecter" doit déconnecter et rediriger vers `/login`

- [ ] **Étape 6 : Commit**

  ```bash
  git add client/src/components/Layout/Navbar.tsx
  git commit -m "feat: avatar dropdown with logout in navbar"
  ```

---

## Task 6 — PricingPage : bouton Retour pour utilisateurs connectés

**Files:**
- Modify: `client/src/pages/Pricing/PricingPage.tsx`
- Test: `client/src/test/pricingPage.test.tsx`

- [ ] **Étape 1 : Écrire le test qui va échouer**

  Créer `client/src/test/pricingPage.test.tsx` :

  ```tsx
  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { MemoryRouter } from "react-router-dom";
  import { Provider } from "react-redux";
  import { configureStore } from "@reduxjs/toolkit";
  import authReducer from "@/store/authSlice";

  vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
  }));
  vi.mock("@/services/stripe.service", () => ({
    stripeService: { createCheckout: vi.fn(), openPortal: vi.fn() },
  }));
  vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));

  // mock useNavigate
  const mockNavigate = vi.fn();
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
  });

  import PricingPage from "@/pages/Pricing/PricingPage";

  function renderWithStore(user: object | null) {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { user, token: user ? "tok" : null, loading: false },
      },
    });
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      </Provider>
    );
  }

  describe("PricingPage", () => {
    it("affiche le bouton Retour quand l'utilisateur est connecté", () => {
      renderWithStore({ name: "Test", role: "free", credits: { total: 50, remaining: 50, resetDate: null } });
      expect(screen.getByRole("button", { name: /retour/i })).toBeInTheDocument();
    });

    it("masque le bouton Retour quand l'utilisateur n'est pas connecté", () => {
      renderWithStore(null);
      expect(screen.queryByRole("button", { name: /retour/i })).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**

  ```bash
  pnpm --filter client test -- pricingPage --reporter=verbose
  ```
  Attendu : FAIL — button "Retour" not found.

- [ ] **Étape 3 : Ajouter le bouton Retour dans PricingPage.tsx**

  Dans `client/src/pages/Pricing/PricingPage.tsx`, juste après le bloc header public (`{!isAuthenticated && ( ... )}`) et avant le `<div style={{ padding: "60px 56px" ... }}>`, insérer :

  ```tsx
  {/* ── Bouton Retour — visible uniquement si connecté ── */}
  {isAuthenticated && (
    <div style={{ padding: "16px 56px 0" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(-1)}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <Ico icon={CiqIcon.chevL} size={15} />
        Retour
      </button>
    </div>
  )}
  ```

- [ ] **Étape 4 : Vérifier que les tests passent**

  ```bash
  pnpm --filter client test -- pricingPage --reporter=verbose
  ```
  Attendu : 2 tests PASS.

- [ ] **Étape 5 : Vérifier TypeScript**

  ```bash
  pnpm --filter client typecheck
  ```
  Attendu : 0 erreur.

- [ ] **Étape 6 : Commit**

  ```bash
  git add client/src/pages/Pricing/PricingPage.tsx client/src/test/pricingPage.test.tsx
  git commit -m "feat: back button on pricing page for authenticated users"
  ```

---

## Task 7 — VerifyEmailPage : layout responsive mobile

**Files:**
- Modify: `client/src/pages/Auth/VerifyEmailPage.tsx`

- [ ] **Étape 1 : Restructurer VerifyEmailPage.tsx**

  Remplacer le contenu complet de `client/src/pages/Auth/VerifyEmailPage.tsx` :

  ```tsx
  import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
  import api from "@/services/axios";
  import { updateUser } from "@/store/authSlice";
  import { useAppDispatch } from "@/store/index";
  import { useEffect, useState } from "react";
  import { Link, useSearchParams } from "react-router-dom";
  import { DynamicPanel } from "./AuthPage";

  export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const token = searchParams.get("token");
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (!token) {
        setStatus("error");
        return;
      }
      api
        .get(`/auth/verify-email/${token}`)
        .then(() => {
          dispatch(updateUser({ emailVerified: true }));
          setStatus("success");
        })
        .catch(() => setStatus("error"));
    }, [token, dispatch]);

    return (
      <div className="verify-layout">
        {/* ── Panneau gauche — statut ── */}
        <div className="verify-panel-left">
          {/* Blobs décoratifs — visibles uniquement sur mobile */}
          <div className="verify-mobile-blobs" aria-hidden="true">
            <div className="verify-blob verify-blob-1" />
            <div className="verify-blob verify-blob-2" />
            <div className="verify-blob verify-blob-3" />
          </div>

          <Link to="/" className="verify-logo" style={{ textDecoration: "none" }}>
            <div className="ciq-mark">
              <span className="dot">C</span>
              <span className="name">
                <b>CONTENT</b>
                <span>.IQ</span>
              </span>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              className="auth-form verify-card-mobile"
              style={{
                width: "100%",
                maxWidth: 500,
                animation: "fadeSlideIn 0.3s ease",
                textAlign: "center",
              }}
            >
              {status === "loading" && (
                <div>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "var(--voice-soft)",
                      border: "2px solid var(--voice)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 28px",
                    }}
                  >
                    <MicWave size="md" color="var(--voice)" />
                  </div>
                  <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                    Vérification en cours…
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: 17 }}>
                    Validation de votre adresse email.
                  </p>
                </div>
              )}

              {status === "success" && (
                <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "var(--accent-soft)",
                      border: "2px solid var(--accent)",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 28px",
                    }}
                  >
                    <Ico icon={CiqIcon.check} size={32} style={{ color: "var(--accent)" }} />
                  </div>
                  <h1 className="t-display" style={{ fontSize: 52, margin: "0 0 12px" }}>
                    Email vérifié !
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                    Votre compte est actif. Bonne génération !
                  </p>
                  <Link
                    to="/dashboard"
                    className="btn btn-primary btn-lg"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Accéder à mon espace
                    <Ico icon={CiqIcon.arrow} size={18} />
                  </Link>
                </div>
              )}

              {status === "error" && (
                <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "rgba(248,113,113,0.1)",
                      border: "2px solid rgba(248,113,113,0.4)",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 28px",
                    }}
                  >
                    <Ico icon={CiqIcon.x} size={32} style={{ color: "#f87171" }} />
                  </div>
                  <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                    Lien invalide
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                    Ce lien est invalide ou a expiré (24h). Demandez un nouveau lien depuis la
                    connexion.
                  </p>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-lg"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    ← Retour à la connexion
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="verify-footer" style={{ fontSize: 14, color: "var(--ink-mute)" }}>
            © 2026 CODEXA · Document confidentiel
          </div>
        </div>

        {/* ── Panneau droit — dynamique ── */}
        <div className="verify-panel-right">
          <DynamicPanel />
        </div>
      </div>
    );
  }
  ```

- [ ] **Étape 2 : Vérifier TypeScript**

  ```bash
  pnpm --filter client typecheck
  ```
  Attendu : 0 erreur.

- [ ] **Étape 3 : Vérifier manuellement sur desktop**

  ```bash
  pnpm dev
  ```
  Naviguer vers `/verify-email?token=test` — le layout 2 colonnes doit être intact.

- [ ] **Étape 4 : Vérifier manuellement sur mobile**

  Dans les DevTools du navigateur, passer en vue mobile (≤768px).
  - Seule la colonne gauche s'affiche
  - Fond quadrillé + blobs visibles
  - Card liquid glass centrée
  - Logo et footer masqués

- [ ] **Étape 5 : Vérifier les 3 états en mobile**

  - Modifier temporairement `setStatus("success")` directement → card bleu + CTA
  - Modifier en `setStatus("error")` → card rouge + lien retour
  - Remettre `"loading"` → cercle teal animé

- [ ] **Étape 6 : Vérifier Biome**

  ```bash
  pnpm lint
  ```
  Attendu : aucune erreur.

- [ ] **Étape 7 : Commit**

  ```bash
  git add client/src/pages/Auth/VerifyEmailPage.tsx
  git commit -m "feat: verify email page responsive mobile layout"
  ```

---

## Task 8 — Validation finale

- [ ] **Étape 1 : Lancer tous les tests client**

  ```bash
  pnpm --filter client test
  ```
  Attendu : tous les tests existants (25+) + les nouveaux passent.

- [ ] **Étape 2 : Lancer tous les tests serveur**

  ```bash
  pnpm --filter server test
  ```
  Attendu : 41/41 passent (aucune régression backend).

- [ ] **Étape 3 : Typecheck complet**

  ```bash
  pnpm typecheck
  ```
  Attendu : 0 erreur client + server.

- [ ] **Étape 4 : Lint Biome**

  ```bash
  pnpm lint
  ```
  Attendu : 0 erreur.

- [ ] **Étape 5 : Build de production**

  ```bash
  pnpm --filter @contentiq/shared build && pnpm --filter client build
  ```
  Attendu : build sans erreur.

- [ ] **Étape 6 : Commit final + push**

  ```bash
  git push origin main
  ```

---

## Récapitulatif des commits

| Commit | Fichiers |
|--------|---------|
| `feat: add chevL and logout icons to ciq-icons` | ciq-icons.tsx |
| `i18n: add sidebar.logout, expand, collapse keys` | fr.ts, en.ts |
| `style: sidebar collapsed, nav dropdown, verify mobile CSS` | index.css |
| `feat: sidebar collapsible toggle + logout button` | Sidebar.tsx, sidebar.test.tsx |
| `feat: avatar dropdown with logout in navbar` | Navbar.tsx |
| `feat: back button on pricing page for authenticated users` | PricingPage.tsx, pricingPage.test.tsx |
| `feat: verify email page responsive mobile layout` | VerifyEmailPage.tsx |
