// Dashboard utilisateur + Templates + Profil

function Dashboard({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="dash" lang={lang} credits={{ used: 77, total: 500 }} />
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          <div className="row between" style={{ marginBottom: 28 }}>
            <div>
              <span className="t-eyebrow">{L("Tableau de bord", "Dashboard")}</span>
              <h1 className="t-display" style={{ fontSize: 40, margin: "6px 0 0" }}>
                {L("Bonjour Abdel.", "Hi Abdel.")}{" "}
                <em style={{ color: "var(--ink-mute)" }}>
                  {L("On crée quoi ?", "What are we making?")}
                </em>
              </h1>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-outline btn-sm">
                <span className="ico">{Icon.history}</span>
                {L("Historique", "History")}
              </button>
              <button className="btn btn-primary">
                <span className="ico">{Icon.sparkle}</span>
                {L("Nouveau contenu", "New content")}
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr repeat(3, 1fr)",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {/* Credits ring card */}
            <div
              className="card"
              style={{ padding: 22, display: "flex", gap: 22, alignItems: "center" }}
            >
              <svg className="ring-svg" width="92" height="92" viewBox="0 0 92 92">
                <circle className="track" cx="46" cy="46" r="38" />
                <circle
                  className="fill"
                  cx="46"
                  cy="46"
                  r="38"
                  stroke="var(--accent)"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.846)}`}
                />
              </svg>
              <div className="col" style={{ flex: 1 }}>
                <span className="t-eyebrow">{L("Crédits restants", "Remaining credits")}</span>
                <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span className="t-mono" style={{ fontSize: 36, fontWeight: 600 }}>
                    423
                  </span>
                  <span style={{ color: "var(--ink-mute)", fontSize: 13 }}>/ 500</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                  {L("Renouvelle dans 39 jours", "Resets in 39 days")}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: 10 }}
                >
                  {L("Recharger", "Top up")}
                </button>
              </div>
            </div>
            {[
              { label: L("Contenus ce mois", "This month's content"), value: "47", delta: "+12" },
              {
                label: L("Tokens consommés", "Tokens consumed"),
                value: "82.4K",
                delta: L("Moy. 1 750 / gen.", "Avg 1,750 / gen."),
              },
              {
                label: L("Cmd vocales", "Voice commands"),
                value: "138",
                delta: L("94% reconnues", "94% matched"),
              },
            ].map((k) => (
              <div key={k.label} className="card" style={{ padding: 20 }}>
                <span className="t-eyebrow">{k.label}</span>
                <div
                  className="t-mono"
                  style={{ fontSize: 30, fontWeight: 600, margin: "10px 0 4px" }}
                >
                  {k.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* charts row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 18 }}
          >
            <div className="card" style={{ padding: 22 }}>
              <div className="row between">
                <div>
                  <span className="t-eyebrow">
                    {L("Activité — 30 jours", "Activity — 30 days")}
                  </span>
                </div>
                <div className="seg">
                  <button className="on">30j</button>
                  <button>7j</button>
                  <button>{L("an", "y")}</button>
                </div>
              </div>
              {/* fake bar chart */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 3,
                  height: 160,
                  marginTop: 22,
                }}
              >
                {[
                  18, 24, 12, 30, 22, 8, 14, 28, 36, 20, 18, 32, 40, 26, 14, 22, 30, 38, 44, 32, 24,
                  18, 28, 36, 42, 30, 24, 36, 48, 38,
                ].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: h * 2 + "px",
                      background: i === 28 ? "var(--accent)" : "var(--ink)",
                      opacity: i === 28 ? 1 : 0.18,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
              <div
                className="row between"
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span>06.04</span>
                <span>15.04</span>
                <span>25.04</span>
                <span>06.05</span>
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <span className="t-eyebrow">{L("Types les plus utilisés", "Most used types")}</span>
              <div className="col" style={{ gap: 12, marginTop: 18 }}>
                {[
                  ["LinkedIn", 38, "var(--accent)"],
                  [L("Article blog", "Blog post"), 24, "var(--ink)"],
                  [L("Email mkt", "Marketing email"), 18, "var(--voice)"],
                  ["Twitter/X", 12, "var(--ink-soft)"],
                  [L("Autres", "Other"), 8, "var(--ink-mute)"],
                ].map(([n, p, c]) => (
                  <div key={n} className="col" style={{ gap: 4 }}>
                    <div className="row between" style={{ fontSize: 12.5 }}>
                      <span>{n}</span>
                      <span className="t-mono">{p}%</span>
                    </div>
                    <div className="gauge">
                      <i style={{ width: p + "%", background: c }}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent + voice log */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">{L("Derniers contenus", "Recent content")}</span>
                <span className="lnk" style={{ fontSize: 12 }}>
                  {L("Tout voir", "See all")} →
                </span>
              </div>
              <div className="col" style={{ gap: 4 }}>
                {[
                  [
                    Icon.linkedin,
                    L("Annonce du plan Business CONTENT.IQ", "Business plan launch announcement"),
                    "LinkedIn",
                    L("il y a 12 min", "12 min ago"),
                    true,
                  ],
                  [
                    Icon.blog,
                    L(
                      "3 raisons d'investir au Sénégal en 2026",
                      "3 reasons to invest in Senegal in 2026",
                    ),
                    L("Article blog", "Blog post"),
                    L("il y a 2h", "2h ago"),
                    false,
                  ],
                  [
                    Icon.email,
                    L("Cold outreach — agences de Dakar", "Cold outreach — Dakar agencies"),
                    L("Email mkt", "Marketing email"),
                    L("hier", "yesterday"),
                    true,
                  ],
                  [
                    Icon.twitter,
                    L("Thread sur la tokenisation des crédits", "Thread on credit tokenization"),
                    "Twitter/X",
                    L("il y a 2 jours", "2 days ago"),
                    false,
                  ],
                ].map(([ic, title, type, when, fav], i) => (
                  <div
                    key={i}
                    className="row"
                    style={{
                      gap: 12,
                      padding: "10px 8px",
                      borderRadius: 8,
                      borderBottom: i < 3 ? "1px solid var(--line-soft)" : "none",
                    }}
                  >
                    <span
                      className="ico"
                      style={{ color: "var(--ink-mute)", width: 18, height: 18 }}
                    >
                      {ic}
                    </span>
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                        {type} · {when}
                      </span>
                    </div>
                    {fav && (
                      <span className="ico" style={{ color: "var(--accent)" }}>
                        {Icon.star}
                      </span>
                    )}
                    <span className="ico" style={{ color: "var(--ink-mute)" }}>
                      {Icon.chevR}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">{L("Voix · journal", "Voice · log")}</span>
                <span className="pill voice" style={{ padding: "1px 8px", fontSize: 11 }}>
                  <MicWave size="sm" listening={false} /> 138
                </span>
              </div>
              <div className="col" style={{ gap: 10 }}>
                {[
                  [
                    L(
                      "Génère un article sur l'IA en Afrique",
                      "Generate an article on AI in Africa",
                    ),
                    "100%",
                    true,
                  ],
                  [L("Change le ton en humoristique", "Change the tone to humorous"), "98%", true],
                  [L("Exporte en Word", "Export as Word"), "100%", true],
                  [L("Affiche mes brouillons", "Show my drafts"), "62%", false],
                ].map(([cmd, conf, ok], i) => (
                  <div key={i} className="col" style={{ gap: 4 }}>
                    <div className="row between" style={{ fontSize: 12.5 }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                        "{cmd}"
                      </span>
                      <span
                        className="t-mono"
                        style={{ color: ok ? "var(--ink-soft)" : "var(--accent)" }}
                      >
                        {conf}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Templates({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  const cats = [
    L("Tous", "All"),
    "Marketing",
    "Social",
    "Business",
    L("Créatif", "Creative"),
    L("Mes templates", "My templates"),
  ];
  const tmpl = [
    {
      ic: Icon.linkedin,
      name: L("Post LinkedIn engageant", "Engaging LinkedIn post"),
      desc: L("Hook + storytelling + CTA optimisé", "Hook + story + optimized CTA"),
      tag: "Social",
      uses: 1248,
      sys: true,
    },
    {
      ic: Icon.blog,
      name: L("Article SEO long format", "Long-form SEO article"),
      desc: L("H1/H2/H3 + balises méta intégrées", "H1/H2/H3 + meta tags built-in"),
      tag: "Marketing",
      uses: 982,
      sys: true,
    },
    {
      ic: Icon.email,
      name: L("Cold outreach B2B", "Cold outreach B2B"),
      desc: L("Prospection 4-étapes, ton direct", "4-step prospecting, direct tone"),
      tag: "Marketing",
      uses: 743,
      sys: true,
    },
    {
      ic: Icon.twitter,
      name: L("Thread X viral · 10 tweets", "Viral X thread · 10 tweets"),
      desc: L("Hook fort + payoff numéroté", "Strong hook + numbered payoff"),
      tag: "Social",
      uses: 612,
      sys: true,
    },
    {
      ic: Icon.product,
      name: L("Description produit e-commerce", "E-commerce product description"),
      desc: L("Bénéfices + caractéristiques", "Benefits + features"),
      tag: "Marketing",
      uses: 521,
      sys: true,
    },
    {
      ic: Icon.pitch,
      name: L("Pitch investisseur", "Investor pitch"),
      desc: L("Problème · solution · marché · équipe", "Problem · solution · market · team"),
      tag: "Business",
      uses: 384,
      sys: true,
    },
    {
      ic: Icon.email,
      name: L("Newsletter — Studio Baobab", "Newsletter — Studio Baobab"),
      desc: L("Mon template perso · 3 sections", "My custom template · 3 sections"),
      tag: "Mine",
      uses: 18,
      sys: false,
    },
    {
      ic: Icon.bio,
      name: L("Bio LinkedIn — agences", "LinkedIn bio — agencies"),
      desc: L("Variables : {{secteur}} {{ville}}", "Variables: {{sector}} {{city}}"),
      tag: "Mine",
      uses: 9,
      sys: false,
    },
  ];
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="templ" lang={lang} />
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <h1 className="t-display" style={{ fontSize: 40, margin: 0 }}>
              {L("Templates", "Templates")}
            </h1>
            <button className="btn btn-primary">
              <span className="ico">{Icon.plus}</span>
              {L("Créer un template", "Create template")}
            </button>
          </div>
          <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
            {L(
              "10 templates système · 2 personnels · partagez les vôtres avec votre équipe.",
              "10 system templates · 2 custom · share yours with your team.",
            )}
          </p>

          <div className="row" style={{ gap: 12, marginBottom: 22 }}>
            <div
              className="row"
              style={{
                background: "var(--bg-elev)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "8px 12px",
                flex: 1,
                gap: 8,
                maxWidth: 400,
              }}
            >
              <span className="ico" style={{ color: "var(--ink-mute)" }}>
                {Icon.search}
              </span>
              <input
                className="input"
                style={{ border: "none", padding: 0, background: "transparent" }}
                placeholder={L("Rechercher un template…", "Search a template…")}
              />
            </div>
            <div className="seg">
              {cats.map((c, i) => (
                <button key={c} className={i === 0 ? "on" : ""}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {tmpl.map((t, i) => (
              <div key={i} className="card" style={{ padding: 20, position: "relative" }}>
                <div className="row between" style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: t.sys ? "var(--bg-sunk)" : "var(--accent-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: t.sys ? "var(--ink)" : "var(--accent-ink)",
                    }}
                  >
                    <span className="ico">{t.ic}</span>
                  </div>
                  {!t.sys && (
                    <span className="pill accent" style={{ padding: "1px 8px", fontSize: 10 }}>
                      {L("perso", "mine")}
                    </span>
                  )}
                  {t.sys && (
                    <span className="pill" style={{ padding: "1px 8px", fontSize: 10 }}>
                      {t.tag}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 16, margin: "0 0 4px", fontWeight: 600 }}>{t.name}</h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    margin: "0 0 14px",
                    lineHeight: 1.5,
                  }}
                >
                  {t.desc}
                </p>
                <div className="hr" style={{ margin: "12px 0" }}></div>
                <div className="row between" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                  <span className="t-mono">
                    ↗ {t.uses.toLocaleString()} {L("util.", "uses")}
                  </span>
                  <button className="btn btn-ghost btn-sm">{L("Utiliser", "Use")} →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="profile" lang={lang} />
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto", maxWidth: 980 }}>
          <h1 className="t-display" style={{ fontSize: 40, margin: "0 0 6px" }}>
            {L("Profil & préférences vocales", "Profile & voice preferences")}
          </h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
            {L(
              "Configurez votre identité, votre voix et votre micro.",
              "Set up your identity, voice and microphone.",
            )}
          </p>

          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <span className="t-eyebrow">{L("Compte", "Account")}</span>
            <div className="row" style={{ gap: 18, marginTop: 16, alignItems: "flex-start" }}>
              <div
                className="imgph"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  fontSize: 24,
                  color: "var(--ink)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                AW
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">{L("Nom", "Name")}</label>
                  <input className="input" defaultValue="Abdel Wariss Osseni" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" defaultValue="abdel@codexa.app" />
                </div>
                <div>
                  <label className="label">{L("Bio courte", "Short bio")}</label>
                  <input className="input" defaultValue="The Black Prince — CODEXA Solutions" />
                </div>
                <div>
                  <label className="label">{L("Langue interface", "UI language")}</label>
                  <select className="select">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Voice prefs */}
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span className="t-eyebrow">{L("Voix de l'IQ Assistant", "IQ Assistant voice")}</span>
              <span className="pill voice">
                <MicWave size="sm" listening={false} /> ElevenLabs
              </span>
            </div>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 18 }}>
              {L(
                "Choisissez la voix qui répondra à vos questions. Cliquez pour entendre un échantillon.",
                "Pick the voice that will answer your questions. Click to hear a sample.",
              )}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                ["Aïssata", "FR · F", true],
                ["Camille", "FR · F"],
                ["Théo", "FR · M"],
                ["Olivia", "EN · F"],
                ["Marcus", "EN · M"],
              ].map(([name, meta, on]) => (
                <div
                  key={name}
                  className="card"
                  style={{
                    padding: 14,
                    border: on ? "1.5px solid var(--ink)" : undefined,
                    cursor: "pointer",
                  }}
                >
                  <div className="row between">
                    <strong style={{ fontSize: 14 }}>{name}</strong>
                    <span className="ico" style={{ color: "var(--ink-mute)" }}>
                      {Icon.play}
                    </span>
                  </div>
                  <div
                    className="t-mono"
                    style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}
                  >
                    {meta}
                  </div>
                  <MicWave size="sm" listening={false} />
                </div>
              ))}
            </div>
            <div className="hr" style={{ margin: "20px 0" }}></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <div>
                <label className="label">{L("Vitesse de lecture", "Playback speed")}</label>
                <div className="seg" style={{ width: "100%" }}>
                  {["0.75×", "1×", "1.25×", "1.5×"].map((s, i) => (
                    <button key={s} className={i === 1 ? "on" : ""} style={{ flex: 1 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">
                  {L("Lecture auto des réponses", "Auto-play answers")}
                </label>
                <div
                  className="row between"
                  style={{
                    background: "var(--bg-sunk)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <span style={{ fontSize: 13 }}>
                    {L(
                      "L'assistant lit ses réponses à voix haute.",
                      "Assistant reads answers aloud.",
                    )}
                  </span>
                  <span
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 999,
                      background: "var(--ink)",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        right: 2,
                        top: 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--bg)",
                      }}
                    ></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mic input */}
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <span className="t-eyebrow">
              {L("Microphone & reconnaissance", "Microphone & recognition")}
            </span>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 18 }}
            >
              <div>
                <label className="label">
                  {L("Langue de reconnaissance", "Recognition language")}
                </label>
                <select className="select">
                  <option>Français (FR-FR)</option>
                  <option>English (EN-US)</option>
                  <option>Español</option>
                  <option>العربية</option>
                </select>
              </div>
              <div>
                <label className="label">{L("Moteur principal", "Primary engine")}</label>
                <div className="seg" style={{ width: "100%" }}>
                  <button className="on" style={{ flex: 1 }}>
                    Web Speech
                  </button>
                  <button style={{ flex: 1 }}>Whisper</button>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="row between">
                  <label className="label">{L("Sensibilité du micro", "Mic sensitivity")}</label>
                  <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    −42 dB
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--bg-sunk)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      background: "var(--bg)",
                      borderRadius: 2,
                      position: "relative",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "62%",
                        top: -6,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--ink)",
                      }}
                    ></div>
                  </div>
                  <div
                    className="row between"
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span>{L("Plus sensible", "More sensitive")}</span>
                    <span>{L("Test live", "Live test")}</span>
                    <span>{L("Plus tolérant au bruit", "Noise-tolerant")}</span>
                  </div>
                  <div className="row" style={{ gap: 12, marginTop: 14, alignItems: "center" }}>
                    <button className="btn btn-outline btn-sm">
                      <span className="ico">{Icon.mic}</span>
                      {L("Tester mon micro", "Test my mic")}
                    </button>
                    <MicWave size="md" color="var(--voice)" />
                    <span className="t-mono" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                      {L("Bonjour, ceci est un test…", "Hello, this is a test…")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="card" style={{ padding: 24 }}>
            <div className="row between">
              <div>
                <span className="t-eyebrow">{L("Abonnement", "Subscription")}</span>
                <div className="row" style={{ gap: 10, marginTop: 8 }}>
                  <span className="pill accent">Pro</span>
                  <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                    $9.99 / {L("mois", "mo")} ·{" "}
                    {L("renouvelle 14 juin 2026", "renews Jun 14, 2026")}
                  </span>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-outline">{L("Portail Stripe", "Stripe portal")}</button>
                <button className="btn btn-primary">
                  {L("Passer Business", "Upgrade Business")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Templates, Profile });
