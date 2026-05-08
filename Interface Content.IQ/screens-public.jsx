// Landing + Pricing + Auth screens

function Landing({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav */}
      <div
        className="row between"
        style={{ padding: "20px 56px", borderBottom: "1px solid var(--line-soft)" }}
      >
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        <div className="row" style={{ gap: 28, fontSize: 13.5, color: "var(--ink-soft)" }}>
          <span>{L("Produit", "Product")}</span>
          <span>{L("Voix", "Voice")}</span>
          <span>{L("Templates", "Templates")}</span>
          <span>{L("Tarifs", "Pricing")}</span>
          <span>{L("Cas d'usage", "Use cases")}</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm">{L("Connexion", "Sign in")}</button>
          <button className="btn btn-primary btn-sm">
            {L("Essai gratuit", "Try free")}
            <span className="ico">{Icon.arrow}</span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          padding: "72px 56px 0",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56,
          alignItems: "center",
          maxWidth: 1320,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div>
          <span className="pill voice" style={{ marginBottom: 22 }}>
            <MicWave size="sm" />{" "}
            {L("Nouveau · IQ Assistant à la voix", "New · IQ Assistant by voice")}
          </span>
          <h1 className="t-display" style={{ fontSize: 84, margin: "10px 0 18px" }}>
            {L("Écrivez à voix", "Write at the speed")}
            <br />
            {L("haute. ", "of voice. ")}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              {L("Pas au clavier.", "Not keys.")}
            </em>
          </h1>
          <p
            style={{
              fontSize: 17.5,
              color: "var(--ink-soft)",
              lineHeight: 1.55,
              maxWidth: 520,
              margin: "0 0 28px",
            }}
          >
            {L(
              "CONTENT.IQ génère articles, posts, emails et bien plus — en streaming temps réel via Claude. Dictez vos consignes, naviguez à la voix, conversez avec l'IQ Assistant. Sans toucher au clavier.",
              "CONTENT.IQ generates articles, posts, emails and more — streamed live by Claude. Dictate your brief, navigate by voice, talk with IQ Assistant. Hands free.",
            )}
          </p>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-primary btn-lg">
              {L("Démarrer — 50 crédits offerts", "Start free — 50 credits")}
              <span className="ico">{Icon.arrow}</span>
            </button>
            <button className="btn btn-outline btn-lg">
              <span className="ico">{Icon.play}</span>
              {L("Voir la démo vocale", "Watch voice demo")} · 0:42
            </button>
          </div>
          <div
            className="row"
            style={{ gap: 24, marginTop: 36, color: "var(--ink-mute)", fontSize: 12.5 }}
          >
            <span>★★★★★ 4.9 · {L("82 avis Product Hunt", "82 PH reviews")}</span>
            <span>·</span>
            <span>{L("Sans CB", "No card")}</span>
            <span>·</span>
            <span>FR · EN · ES · AR</span>
          </div>
        </div>

        {/* Hero device — generate panel mockup */}
        <div style={{ position: "relative", height: 540 }}>
          <div
            className="card"
            style={{
              position: "absolute",
              inset: 0,
              padding: 0,
              overflow: "hidden",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <div
              className="row between"
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--line)",
                background: "var(--bg-sunk)",
                fontSize: 12,
                color: "var(--ink-mute)",
              }}
            >
              <span className="t-mono">/generate · post linkedin</span>
              <span className="row" style={{ gap: 6 }}>
                <span className="pill voice" style={{ padding: "2px 8px", fontSize: 10.5 }}>
                  <span className="swatch" style={{ background: "var(--voice)" }}></span>
                  {L("écoute…", "listening…")}
                </span>
              </span>
            </div>
            <div style={{ padding: 22 }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>
                {L("Sujet · dicté", "Topic · dictated")}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontFamily: "var(--font-serif)",
                  lineHeight: 1.4,
                  marginBottom: 18,
                }}
              >
                {L(
                  "« Annonce du lancement de notre nouveau plan Business pour les agences de communication africaines. »",
                  "“Announce the launch of our Business plan for West African communication agencies.”",
                )}
              </div>
              <div className="row" style={{ gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                <span className="chip">LinkedIn</span>
                <span className="chip">{L("Ton inspirant", "Inspiring tone")}</span>
                <span className="chip">{L("FR", "EN")}</span>
                <span className="chip">~ 280 mots</span>
              </div>
              <div className="hr" style={{ margin: "14px 0" }}></div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink)" }}>
                <strong>
                  {L(
                    "Aux agences africaines qui pensent encore que l'IA n'est pas pour elles —",
                    "To the African agencies still thinking AI isn't for them —",
                  )}
                </strong>
                <br />
                <br />
                {L(
                  "Pendant des années, les meilleurs outils ont été conçus ailleurs, pour d'autres. Aujourd'hui, on change ça.",
                  "For years, the best tools have been built elsewhere, for someone else. Today, we change that.",
                )}
                <br />
                <br />
                {L(
                  "CONTENT.IQ Business arrive avec 2 000 crédits, 5 sièges, exports en lot",
                  "CONTENT.IQ Business launches with 2,000 credits, 5 seats, bulk exports",
                )}
                <span className="caret"></span>
              </div>
              <div className="row between" style={{ marginTop: 22 }}>
                <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                  1 247 / ~2 000 tokens · 1.4 cr.
                </span>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-outline btn-sm">
                    <span className="ico">{Icon.stop}</span>Stop
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <span className="ico">{Icon.refresh}</span>
                    {L("Régénérer", "Regenerate")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating mic pill */}
          <div
            className="card"
            style={{
              position: "absolute",
              left: -28,
              bottom: 28,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--accent)",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <span className="ico">{Icon.mic}</span>
            </div>
            <div className="col" style={{ gap: 2 }}>
              <div
                style={{ fontSize: 11.5, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}
              >
                {L("Commande détectée", "Command matched")}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                "{L("Génère un post LinkedIn", "Generate a LinkedIn post")}"
              </div>
            </div>
            <MicWave size="md" color="var(--voice)" />
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ padding: "64px 56px 0", maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <div className="t-eyebrow" style={{ textAlign: "center", marginBottom: 22 }}>
          {L("Pensé pour", "Built for")}
        </div>
        <div
          className="row"
          style={{
            justifyContent: "space-around",
            gap: 32,
            color: "var(--ink-mute)",
            flexWrap: "wrap",
          }}
        >
          {[
            L("Créateurs de contenu", "Creators"),
            "Agences",
            "PME",
            "NGOs",
            "Freelances",
            "Microfinances",
          ].map((t) => (
            <div
              key={t}
              style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic" }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Three pillars */}
      <div style={{ padding: "96px 56px", maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <h2 className="t-display" style={{ fontSize: 56, margin: "0 0 14px", maxWidth: 720 }}>
          {L("Trois manières de produire. ", "Three ways to create. ")}
          <em style={{ color: "var(--ink-mute)" }}>{L("Une seule app.", "One app.")}</em>
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }}
        >
          {[
            {
              tag: "01 · GENERATE",
              icon: Icon.sparkle,
              title: L("Génération streaming", "Streaming generation"),
              body: L(
                "Token par token via SSE. Vous voyez le contenu apparaître en direct, comme une vraie conversation.",
                "Token by token over SSE. You watch the content appear live, like a real conversation.",
              ),
              meta: "Claude · 12 formats",
            },
            {
              tag: "02 · ASSIST",
              icon: Icon.brain,
              title: L("IQ Assistant context-aware", "Context-aware IQ Assistant"),
              body: L(
                "Il connaît votre page, vos crédits, votre brouillon. Il améliore, suggère, brainstorme avec vous.",
                "It knows your page, credits, draft. It improves, suggests, brainstorms with you.",
              ),
              meta: L("20 tours de contexte", "20-turn memory"),
            },
            {
              tag: "03 · VOICE",
              icon: Icon.mic,
              title: L("Tout à la voix", "Everything by voice"),
              body: L(
                "Dictez vos consignes, naviguez à la voix, écoutez les réponses. ElevenLabs + Whisper + Web Speech.",
                "Dictate briefs, navigate by voice, hear the answers. ElevenLabs + Whisper + Web Speech.",
              ),
              meta: L("25 commandes natives", "25 native commands"),
            },
          ].map((p) => (
            <div key={p.tag} className="card" style={{ padding: 26 }}>
              <div className="row between">
                <span className="t-eyebrow">{p.tag}</span>
                <span className="ico" style={{ color: "var(--accent)" }}>
                  {p.icon}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 24,
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  margin: "26px 0 10px",
                }}
              >
                {p.title}
              </h3>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.55, fontSize: 14 }}>{p.body}</p>
              <div className="hr" style={{ margin: "20px 0 12px" }}></div>
              <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                {p.meta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "var(--bg-sunk)",
          padding: "40px 56px",
          marginTop: 40,
          borderTop: "1px solid var(--line)",
        }}
      >
        <div
          className="row between"
          style={{ maxWidth: 1320, margin: "0 auto", color: "var(--ink-mute)", fontSize: 12.5 }}
        >
          <span>CODEXA Solutions · Abdel Wariss OSSENI · 2026</span>
          <span className="row" style={{ gap: 18 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>API</span>
            <span>{L("Contact", "Contact")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Pricing({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  const plans = [
    {
      name: "Free",
      price: "0",
      tag: L("Pour découvrir", "Discover"),
      bullets: [
        L("50 crédits / mois", "50 credits / month"),
        L("6 types de contenu", "6 content types"),
        L("Export PDF", "PDF export"),
        L("IQ Assistant — 5 msg/j", "IQ Assistant — 5 msg/day"),
        <s key="s">{L("Voice commands", "Voice commands")}</s>,
      ],
      cta: L("Commencer", "Get started"),
      featured: false,
    },
    {
      name: "Pro",
      price: "9.99",
      tag: L("Le plus populaire", "Most popular"),
      bullets: [
        L("500 crédits / mois", "500 credits / month"),
        L("Tous les types", "All content types"),
        L("Voice commands · 25 cmd", "Voice commands · 25 cmd"),
        L("IQ Assistant illimité", "Unlimited IQ Assistant"),
        L("Exports PDF · DOCX · MD", "PDF · DOCX · MD exports"),
        L("Templates personnalisés", "Custom templates"),
      ],
      cta: L("Choisir Pro", "Choose Pro"),
      featured: true,
    },
    {
      name: "Business",
      price: "29.99",
      tag: L("Agences & équipes", "Agencies & teams"),
      bullets: [
        L("2 000 crédits / mois", "2,000 credits / month"),
        L("5 sièges inclus", "5 team seats"),
        L("Export bulk ZIP", "Bulk ZIP export"),
        L("API · 100K req/mois", "API · 100K req/mo"),
        L("Templates partagés", "Shared templates"),
        L("Support 4h dédié", "4h priority support"),
      ],
      cta: L("Choisir Business", "Choose Business"),
      featured: false,
    },
  ];
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", overflow: "auto", padding: "60px 56px" }}
    >
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
        <span className="t-eyebrow">{L("Tarifs simples", "Simple pricing")}</span>
        <h1 className="t-display" style={{ fontSize: 64, margin: "10px 0 14px" }}>
          {L("Choisissez votre voix.", "Pick your voice.")}
        </h1>
        <p style={{ fontSize: 16.5, color: "var(--ink-soft)" }}>
          {L(
            "Mensuel ou annuel — 2 mois offerts. Annulation en un clic depuis le portail Stripe.",
            "Monthly or annual — 2 months free. Cancel any time from the Stripe portal.",
          )}
        </p>
        <div className="seg" style={{ marginTop: 22 }}>
          <button className="on">{L("Mensuel", "Monthly")}</button>
          <button>{L("Annuel · −20%", "Annual · −20%")}</button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {plans.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: 28,
              position: "relative",
              borderColor: p.featured ? "var(--ink)" : undefined,
              background: p.featured ? "var(--bg-elev)" : "var(--bg-elev)",
              boxShadow: p.featured ? "var(--shadow-pop)" : "var(--shadow-card)",
            }}
          >
            {p.featured && (
              <span className="pill accent" style={{ position: "absolute", top: -12, left: 28 }}>
                ★ {p.tag}
              </span>
            )}
            <div className="t-eyebrow">{p.tag && !p.featured ? p.tag : "PLAN"}</div>
            <div style={{ fontSize: 32, fontFamily: "var(--font-serif)", marginTop: 8 }}>
              {p.name}
            </div>
            <div className="row" style={{ alignItems: "baseline", gap: 4, margin: "16px 0 22px" }}>
              <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>$</span>
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 300,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
                className="t-tnum"
              >
                {p.price}
              </span>
              <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>/{L("mois", "mo")}</span>
            </div>
            <button
              className={`btn ${p.featured ? "btn-primary" : "btn-outline"} btn-lg`}
              style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}
            >
              {p.cta}
            </button>
            <div className="hr" style={{ marginBottom: 14 }}></div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {p.bullets.map((b, i) => (
                <li
                  key={i}
                  className="row"
                  style={{ gap: 10, fontSize: 13.5, color: "var(--ink-soft)" }}
                >
                  <span className="ico" style={{ color: "var(--accent)", flexShrink: 0 }}>
                    {Icon.check}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 56, color: "var(--ink-mute)", fontSize: 13 }}>
        {L("Crédits à la carte : ", "Pay-as-you-go credits: ")}
        <strong style={{ color: "var(--ink)" }}>$10 / 100 cr.</strong>
        {L(" · 1 crédit ≈ 350 mots générés.", " · 1 credit ≈ 350 words generated.")}
      </div>
    </div>
  );
}

function AuthLogin({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "1fr 1.1fr" }}
    >
      <div
        style={{
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        <div style={{ maxWidth: 380, width: "100%" }}>
          <h1 className="t-display" style={{ fontSize: 44, margin: "0 0 8px" }}>
            {L("Bon retour.", "Welcome back.")}
          </h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 26 }}>
            {L("Connectez-vous pour reprendre vos brouillons.", "Sign in to pick up your drafts.")}
          </p>

          <button
            className="btn btn-outline btn-lg"
            style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
          >
            <span className="ico" style={{ color: "var(--accent)" }}>
              {Icon.google}
            </span>
            {L("Continuer avec Google", "Continue with Google")}
          </button>

          <div className="row" style={{ gap: 10, margin: "18px 0" }}>
            <div className="hr" style={{ flex: 1 }}></div>
            <span style={{ fontSize: 11, color: "var(--ink-mute)" }} className="t-eyebrow">
              {L("OU", "OR")}
            </span>
            <div className="hr" style={{ flex: 1 }}></div>
          </div>

          <div className="col" style={{ gap: 12 }}>
            <div>
              <label className="label">Email</label>
              <input className="input" placeholder="abdel@codexa.app" />
            </div>
            <div>
              <div className="row between">
                <label className="label">{L("Mot de passe", "Password")}</label>
                <span className="lnk" style={{ fontSize: 11.5 }}>
                  {L("Oublié ?", "Forgot?")}
                </span>
              </div>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
            >
              {L("Se connecter", "Sign in")}
              <span className="ico">{Icon.arrow}</span>
            </button>
          </div>

          <div style={{ marginTop: 22, fontSize: 13, color: "var(--ink-soft)" }}>
            {L("Pas encore de compte ? ", "No account yet? ")}
            <span className="lnk">{L("Créer un compte", "Sign up")}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          © 2026 CODEXA · {L("Document confidentiel", "Confidential")}
        </div>
      </div>
      {/* Right side: editorial */}
      <div
        style={{
          background: "var(--bg-sunk)",
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <span className="t-eyebrow" style={{ marginBottom: 18 }}>
          ★ {L("Témoignage", "Testimonial")}
        </span>
        <div className="t-display" style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 28px" }}>
          {L(
            "« Je dicte un brief, l'article sort. ",
            "“I dictate a brief, the article comes out. ",
          )}
          <em style={{ color: "var(--accent)" }}>
            {L("On a gagné 3 jours par semaine.", "We saved 3 days a week.")}
          </em>
          {L(" »", "”")}
        </div>
        <div className="row" style={{ gap: 12 }}>
          <div className="imgph" style={{ width: 44, height: 44, borderRadius: "50%" }}>
            AM
          </div>
          <div className="col">
            <strong style={{ fontSize: 14 }}>Aïssata Mbaye</strong>
            <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
              {L("Directrice — Studio Baobab, Dakar", "Director — Studio Baobab, Dakar")}
            </span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 48, padding: 18 }}>
          <div className="row between">
            <span className="t-eyebrow">
              {L("Aujourd'hui sur CONTENT.IQ", "Today on CONTENT.IQ")}
            </span>
            <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
              06.05.26
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 16,
            }}
          >
            {[
              ["12 480", L("contenus générés", "contents generated")],
              ["94%", L("commandes vocales OK", "voice commands ok")],
              ["1.7s", L("temps de 1ᵉʳ token", "first-token latency")],
            ].map(([n, l]) => (
              <div key={l} className="col">
                <span className="t-mono" style={{ fontSize: 22, fontWeight: 600 }}>
                  {n}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthRegister({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div style={{ width: 480 }}>
        <div className="ciq-mark" style={{ marginBottom: 28, justifyContent: "center" }}>
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <h1 className="t-display" style={{ fontSize: 36, margin: "0 0 6px" }}>
            {L("Créez votre compte", "Create your account")}
          </h1>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 22px", fontSize: 14 }}>
            {L("50 crédits offerts. Sans CB.", "50 free credits. No card.")}
          </p>

          <div className="seg" style={{ width: "100%", marginBottom: 18 }}>
            <button className="on" style={{ flex: 1 }}>
              {L("Email", "Email")}
            </button>
            <button style={{ flex: 1 }}>Google</button>
          </div>

          <div className="col" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">{L("Prénom", "First name")}</label>
                <input className="input" placeholder="Abdel" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">{L("Nom", "Last name")}</label>
                <input className="input" placeholder="Osseni" />
              </div>
            </div>
            <div>
              <label className="label">Email pro</label>
              <input className="input" placeholder="abdel@codexa.app" />
            </div>
            <div>
              <label className="label">
                {L("Mot de passe", "Password")}{" "}
                <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>
                  · {L("min. 12 caractères", "min. 12 chars")}
                </span>
              </label>
              <input className="input" type="password" placeholder="••••••••••••" />
              <div className="row" style={{ gap: 4, marginTop: 6 }}>
                {[1, 1, 1, 0].map((on, i) => (
                  <i
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      background: on ? "var(--accent)" : "var(--bg-sunk)",
                      borderRadius: 2,
                    }}
                  ></i>
                ))}
                <span style={{ fontSize: 11, color: "var(--ink-mute)", marginLeft: 8 }}>
                  {L("Solide", "Strong")}
                </span>
              </div>
            </div>
            <div>
              <label className="label">{L("Vous êtes…", "You are…")}</label>
              <select className="select">
                <option>{L("Créateur de contenu", "Content creator")}</option>
                <option>{L("Agence de communication", "Comms agency")}</option>
                <option>PME / Startup</option>
                <option>Freelance</option>
              </select>
            </div>
            <label className="row" style={{ fontSize: 12, color: "var(--ink-soft)", gap: 8 }}>
              <input type="checkbox" defaultChecked />{" "}
              {L(
                "J'accepte les conditions et la politique de confidentialité.",
                "I agree to the terms and privacy policy.",
              )}
            </label>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {L("Créer mon compte", "Create my account")}
              <span className="ico">{Icon.arrow}</span>
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--ink-soft)" }}>
          {L("Déjà inscrit ? ", "Already registered? ")}
          <span className="lnk">{L("Se connecter", "Sign in")}</span>
        </p>
      </div>
    </div>
  );
}

function AuthReset({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div style={{ width: 440 }}>
        <div className="card" style={{ padding: 32 }}>
          <span className="t-eyebrow">{L("Étape 2 / 3", "Step 2 / 3")}</span>
          <h1 className="t-display" style={{ fontSize: 32, margin: "10px 0 6px" }}>
            {L("On vous a envoyé un lien.", "Check your inbox.")}
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 22 }}>
            {L("Un email a été envoyé à ", "We've sent an email to ")}
            <strong className="t-mono">a***@codexa.app</strong>.
            {L(" Le lien expire dans 1h.", " The link expires in 1h.")}
          </p>
          <div
            style={{
              background: "var(--bg-sunk)",
              border: "1px dashed var(--line)",
              borderRadius: 12,
              padding: 18,
              marginBottom: 20,
            }}
          >
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>
              {L("Pas reçu ?", "Didn't receive it?")}
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              <li>{L("Vérifiez votre dossier spam", "Check your spam folder")}</li>
              <li>{L("Patientez ~30 secondes", "Wait ~30 seconds")}</li>
              <li>{L("Renvoyez le lien ci-dessous", "Resend the link below")}</li>
            </ul>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>
              {L("Renvoyer", "Resend")} · 0:42
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              {L("Retour au login", "Back to sign in")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, Pricing, AuthLogin, AuthRegister, AuthReset });
