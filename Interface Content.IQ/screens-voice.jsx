// IQ Assistant variations + Voice modes + History + Mobile + Admin

// ─── Variation A: Floating widget (bottom-right, classic)
function AssistantWidget({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div style={{ width: 380, height: 560, position: "relative" }}>
      <div
        className="card"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--line)",
            background: "var(--bg-sunk)",
          }}
        >
          <div className="row between">
            <div className="row" style={{ gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                }}
              >
                C
              </div>
              <div className="col">
                <strong style={{ fontSize: 13.5 }}>IQ Assistant</strong>
                <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                  ● {L("en ligne · contextuel", "online · context-aware")}
                </span>
              </div>
            </div>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <span className="ico">{Icon.history}</span>
              </button>
              <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <span className="ico">{Icon.x}</span>
              </button>
            </div>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10 }}>
            <span className="pill" style={{ padding: "1px 8px", fontSize: 10.5 }}>
              {L("page : Generate", "page: Generate")}
            </span>
            <span className="pill voice" style={{ padding: "1px 8px", fontSize: 10.5 }}>
              423 cr.
            </span>
          </div>
        </div>

        {/* messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "var(--bg-sunk)",
              padding: 12,
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
            }}
          >
            {L(
              "Vous travaillez sur un post LinkedIn de 280 mots. Voulez-vous que je le rende plus accrocheur ?",
              "You're working on a 280-word LinkedIn post. Want me to make it punchier?",
            )}
          </div>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "85%",
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 13.5,
            }}
          >
            {L(
              "Oui, ajoute un hook plus fort sur la première ligne.",
              "Yes, add a stronger hook on line 1.",
            )}
          </div>
          <div
            style={{
              background: "var(--bg-sunk)",
              padding: 12,
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {L("Voici 3 propositions de hook :", "Here are 3 hook options:")}
            <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              <li style={{ marginBottom: 4 }}>
                {L(
                  "« Si vous dirigez une agence en Afrique, lisez ceci. »",
                  "“If you run an agency in Africa, read this.”",
                )}
              </li>
              <li style={{ marginBottom: 4 }}>
                {L("« On a construit ce qu'on n'a jamais eu. »", "“We built what we never had.”")}
              </li>
              <li>
                {L(
                  "« 2 000 crédits. 5 sièges. Made in Dakar. »",
                  "“2,000 credits. 5 seats. Made in Dakar.”",
                )}
              </li>
            </ol>
            <div className="row" style={{ gap: 6, marginTop: 10 }}>
              <button className="btn btn-outline btn-sm" style={{ padding: "4px 8px" }}>
                <span className="ico" style={{ width: 12, height: 12 }}>
                  {Icon.speaker}
                </span>
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                {L("Appliquer #1", "Apply #1")}
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                {L("Plus d'idées", "More ideas")}
              </button>
            </div>
          </div>
        </div>

        {/* input */}
        <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <div className="row" style={{ gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                flex: 1,
                background: "var(--bg-sunk)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              <input
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 13,
                }}
                placeholder={L("Posez une question…", "Ask anything…")}
              />
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: 8, color: "var(--accent)" }}>
              <span className="ico">{Icon.mic}</span>
            </button>
            <button className="btn btn-primary btn-sm" style={{ padding: 8 }}>
              <span className="ico">{Icon.send}</span>
            </button>
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "var(--ink-mute)",
              marginTop: 6,
              fontFamily: "var(--font-mono)",
            }}
          >
            {L(
              "messages : illimité (Pro) · contexte : 20 tours",
              "messages: unlimited (Pro) · context: 20 turns",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Variation B: Voice-first — ambient orb mode (full-screen overlay)
function VoiceOrb({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* subtle gradient backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 60%, var(--accent-soft) 0%, transparent 55%)",
          opacity: 0.6,
        }}
      ></div>

      <div
        className="row between"
        style={{ padding: "20px 28px", position: "relative", zIndex: 2 }}
      >
        <span className="t-eyebrow">
          {L("Conversation vocale · IQ Assistant", "Voice conversation · IQ Assistant")}
        </span>
        <button className="btn btn-ghost btn-sm">
          <span className="ico">{Icon.x}</span>
          {L("Fermer (Esc)", "Close (Esc)")}
        </button>
      </div>

      {/* live transcript */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          gap: 36,
          padding: "0 10%",
        }}
      >
        <span className="pill voice" style={{ padding: "5px 14px" }}>
          ● {L("L'assistant écoute", "Assistant listening")}
        </span>

        {/* the orb */}
        <div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, var(--accent) 0%, oklch(from var(--accent) l c h / 0.4) 60%, transparent 100%)",
              filter: "blur(20px)",
              animation: "orbpulse 2.4s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 50,
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: 0.35,
              animation: "orbpulse 2.4s ease-in-out infinite reverse",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 80,
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: 0.25,
            }}
          ></div>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "var(--ink)",
              color: "var(--bg)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 60px -10px var(--accent)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <MicWave size="lg" color="var(--accent)" />
          </div>
        </div>

        <div
          className="t-display"
          style={{ fontSize: 42, lineHeight: 1.15, textAlign: "center", maxWidth: 860 }}
        >
          {L(
            "« Génère trois variations du dernier post, plus courtes et avec un ton plus",
            "“Generate three variations of the last post, shorter and with a more",
          )}{" "}
          <em style={{ color: "var(--accent)" }}>{L("direct…", "direct…")}</em>
          {L(" »", "”")}
        </div>

        <div
          className="row"
          style={{
            gap: 22,
            color: "var(--ink-mute)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>0:08 / {L("écoute", "listen")}</span>
          <span>·</span>
          <span>{L("dites « stop » pour terminer", "say “stop” to finish")}</span>
          <span>·</span>
          <span>{L("voix : Aïssata · vitesse 1×", "voice: Aïssata · speed 1×")}</span>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline">
            <span className="ico">{Icon.pause}</span>
            {L("Mettre en pause", "Pause")}
          </button>
          <button className="btn btn-outline">
            <span className="ico">{Icon.refresh}</span>
            {L("Recommencer", "Restart")}
          </button>
          <button className="btn btn-primary">
            {L("Terminer & insérer", "End & insert")}
            <span className="ico">{Icon.check}</span>
          </button>
        </div>
      </div>

      {/* command hints */}
      <div
        style={{
          padding: "20px 28px",
          borderTop: "1px solid var(--line-soft)",
          background: "var(--bg-elev)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>
          {L("Essayez aussi", "Try also")}
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {[
            L("« Exporte en Word »", "“Export as Word”"),
            L("« Affiche mon historique »", "“Show my history”"),
            L("« Change le ton en humoristique »", "“Change tone to humorous”"),
            L("« Stop »", "“Stop”"),
            L("« Aide »", "“Help”"),
          ].map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes orbpulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.08); opacity: .85 } }`}</style>
    </div>
  );
}

// ─── Variation C: Voice command palette (cmd-k style overlay)
function VoiceCommandPalette({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "oklch(0 0 0 / .5)",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="card"
        style={{ width: 620, maxWidth: "92%", boxShadow: "var(--shadow-pop)", overflow: "hidden" }}
      >
        {/* mic header */}
        <div
          style={{
            padding: "20px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderBottom: "1px solid var(--line-soft)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "white",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <span className="ico" style={{ width: 22, height: 22 }}>
              {Icon.mic}
            </span>
          </div>
          <div className="col" style={{ flex: 1 }}>
            <div className="row between">
              <strong style={{ fontSize: 14 }}>{L("J'écoute…", "Listening…")}</strong>
              <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                Web Speech · 0:03
              </span>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 6, alignItems: "center" }}>
              <MicWave size="md" color="var(--accent)" />
              <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                "
                {L("Génère un post LinkedIn sur l'IA en…", "Generate a LinkedIn post about AI in…")}
                "
              </span>
            </div>
          </div>
        </div>

        {/* matching commands */}
        <div style={{ padding: 8 }}>
          <div className="t-eyebrow" style={{ padding: "10px 12px 6px" }}>
            {L("Commande détectée", "Command matched")}
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--accent-soft)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span className="ico" style={{ color: "var(--accent-ink)" }}>
              {Icon.linkedin}
            </span>
            <div className="col" style={{ flex: 1 }}>
              <strong style={{ fontSize: 13.5, color: "var(--accent-ink)" }}>
                {L("Générer post LinkedIn", "Generate LinkedIn post")}
              </strong>
              <span style={{ fontSize: 11.5, color: "var(--accent-ink)", opacity: 0.75 }}>
                {L(
                  "Sujet : « l'IA en Afrique » · ton actuel · ~280 mots",
                  "Topic: “AI in Africa” · current tone · ~280 words",
                )}
              </span>
            </div>
            <span className="t-mono" style={{ fontSize: 10.5, color: "var(--accent-ink)" }}>
              98% ↵
            </span>
          </div>

          <div className="t-eyebrow" style={{ padding: "14px 12px 6px" }}>
            {L("Autres possibilités", "Other matches")}
          </div>
          {[
            [
              Icon.blog,
              L(
                'Générer un article sur "l\'IA en Afrique"',
                "Generate an article on “AI in Africa”",
              ),
              "72%",
            ],
            [Icon.search, L("Rechercher : l'IA en Afrique", "Search: AI in Africa"), "54%"],
            [Icon.refresh, L("Régénérer (mot-clé : IA)", "Regenerate (keyword: AI)"), "31%"],
          ].map(([ic, label, pct], i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span className="ico" style={{ color: "var(--ink-mute)" }}>
                {ic}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)" }}>{label}</span>
              <span className="t-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
                {pct}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--line-soft)",
            background: "var(--bg-sunk)",
            display: "flex",
            gap: 16,
            fontSize: 11,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>↵ {L("exécuter", "execute")}</span>
          <span>⎋ {L("annuler", "cancel")}</span>
          <span>⌃⇧V {L("réactiver", "reopen")}</span>
          <span style={{ marginLeft: "auto" }}>
            {L("dites « aide » pour la liste complète", "say “help” for full list")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── History page
function History({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  const items = [
    [
      Icon.linkedin,
      L("Annonce du plan Business CONTENT.IQ", "Business plan launch announcement"),
      "LinkedIn",
      L("inspirant", "inspiring"),
      "FR",
      "1 247",
      L("12 min", "12 min"),
      true,
    ],
    [
      Icon.blog,
      L("3 raisons d'investir au Sénégal en 2026", "3 reasons to invest in Senegal in 2026"),
      L("Article", "Article"),
      L("pro", "pro"),
      "FR",
      "2 480",
      "2h",
      false,
    ],
    [
      Icon.email,
      L("Cold outreach — agences de Dakar", "Cold outreach — Dakar agencies"),
      "Email",
      L("direct", "direct"),
      "FR",
      "880",
      L("hier", "yesterday"),
      true,
    ],
    [
      Icon.twitter,
      L("Thread sur la tokenisation des crédits", "Thread on credit tokenization"),
      "X / Thread",
      L("tech", "tech"),
      "EN",
      "1 124",
      "2j",
      false,
    ],
    [
      Icon.product,
      L("Description casque audio Akoma", "Akoma headphones description"),
      L("Produit", "Product"),
      L("pro", "pro"),
      "FR",
      "412",
      "3j",
      false,
    ],
    [
      Icon.bio,
      L("Bio LinkedIn — Aïssata Mbaye", "LinkedIn bio — Aïssata Mbaye"),
      "Bio",
      L("inspirant", "inspiring"),
      "FR",
      "180",
      "5j",
      true,
    ],
  ];
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="history" lang={lang} />
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          <div className="row between" style={{ marginBottom: 18 }}>
            <h1 className="t-display" style={{ fontSize: 40, margin: 0 }}>
              {L("Historique", "History")}
            </h1>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn-outline btn-sm">
                <span className="ico">{Icon.download}</span>
                {L("Export bulk ZIP", "Bulk ZIP")}
              </button>
              <button className="btn btn-outline btn-sm">
                <span className="ico">{Icon.tag}</span>
                {L("Tagger", "Tag")}
              </button>
            </div>
          </div>

          {/* filters */}
          <div className="row" style={{ gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div
              className="row"
              style={{
                background: "var(--bg-elev)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "8px 12px",
                flex: 1,
                gap: 8,
                minWidth: 280,
              }}
            >
              <span className="ico" style={{ color: "var(--ink-mute)" }}>
                {Icon.search}
              </span>
              <input
                className="input"
                style={{ border: "none", padding: 0, background: "transparent" }}
                placeholder={L("Rechercher dans tous mes contenus…", "Search all content…")}
              />
              <span className="t-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
                ⌘K
              </span>
            </div>
            {[
              L("Tous types", "All types"),
              L("Toutes langues", "All langs"),
              L("30 derniers jours", "Last 30 days"),
              L("⭐ Favoris", "⭐ Favorites"),
              L("Tags", "Tags"),
            ].map((f, i) => (
              <button key={f} className="btn btn-outline btn-sm">
                {f} <span className="ico">{Icon.chevD}</span>
              </button>
            ))}
            <div className="seg" style={{ marginLeft: "auto" }}>
              <button className="on">{L("Liste", "List")}</button>
              <button>{L("Grille", "Grid")}</button>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div
              className="row"
              style={{
                padding: "10px 16px",
                background: "var(--bg-sunk)",
                borderBottom: "1px solid var(--line)",
                fontSize: 11,
                color: "var(--ink-mute)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                gap: 12,
              }}
            >
              <span style={{ width: 18 }}></span>
              <span style={{ flex: 1 }}>{L("Contenu", "Content")}</span>
              <span style={{ width: 100 }}>Type</span>
              <span style={{ width: 90 }}>Ton</span>
              <span style={{ width: 50 }}>Lang</span>
              <span style={{ width: 80 }}>Tokens</span>
              <span style={{ width: 80 }}>{L("Quand", "When")}</span>
              <span style={{ width: 50 }}></span>
            </div>
            {items.map(([ic, title, type, tone, lng, tk, when, fav], i) => (
              <div
                key={i}
                className="row"
                style={{
                  padding: "12px 16px",
                  gap: 12,
                  borderBottom: i < items.length - 1 ? "1px solid var(--line-soft)" : "none",
                }}
              >
                <span className="ico" style={{ color: "var(--ink-mute)", width: 18, height: 18 }}>
                  {ic}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </span>
                <span style={{ width: 100, fontSize: 12, color: "var(--ink-soft)" }}>{type}</span>
                <span style={{ width: 90 }}>
                  <span className="chip">{tone}</span>
                </span>
                <span
                  style={{
                    width: 50,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-soft)",
                  }}
                >
                  {lng}
                </span>
                <span
                  style={{
                    width: 80,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-mute)",
                  }}
                >
                  {tk}
                </span>
                <span style={{ width: 80, fontSize: 12, color: "var(--ink-mute)" }}>{when}</span>
                <span
                  className="ico"
                  style={{ width: 50, color: fav ? "var(--accent)" : "var(--ink-mute)" }}
                >
                  {Icon.star}
                </span>
              </div>
            ))}
          </div>

          <div
            className="row between"
            style={{ marginTop: 14, fontSize: 12, color: "var(--ink-mute)" }}
          >
            <span>247 {L("contenus au total", "total contents")}</span>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn btn-outline btn-sm">‹</button>
              <button
                className="btn btn-primary btn-sm"
                style={{ minWidth: 32, padding: "4px 10px" }}
              >
                1
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ minWidth: 32, padding: "4px 10px" }}
              >
                2
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ minWidth: 32, padding: "4px 10px" }}
              >
                3
              </button>
              <span style={{ padding: "0 4px" }}>…</span>
              <button
                className="btn btn-outline btn-sm"
                style={{ minWidth: 32, padding: "4px 10px" }}
              >
                21
              </button>
              <button className="btn btn-outline btn-sm">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile screens
function MobileGenerate({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <Phone>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-soft)" }}>
        <div className="row between">
          <div className="ciq-mark">
            <span className="dot" style={{ width: 18, height: 18, fontSize: 11 }}>
              C
            </span>
            <span className="name" style={{ fontSize: 12 }}>
              <b>CONTENT</b>
              <span>.IQ</span>
            </span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill" style={{ padding: "1px 6px", fontSize: 10 }}>
              423 cr.
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        <span className="t-eyebrow">Generate</span>
        <h2 className="t-display" style={{ fontSize: 24, margin: "4px 0 16px" }}>
          {L("Que créer ?", "What to make?")}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {[
            [Icon.linkedin, "LinkedIn", true],
            [Icon.blog, "Article"],
            [Icon.email, "Email"],
            [Icon.twitter, "X"],
            [Icon.product, L("Produit", "Product")],
            [Icon.yt, "YouTube"],
          ].map(([ic, n, on], i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 10,
                textAlign: "center",
                border: on ? "1.5px solid var(--ink)" : undefined,
              }}
            >
              <span className="ico">{ic}</span>
              <div style={{ fontSize: 10.5, marginTop: 2 }}>{n}</div>
            </div>
          ))}
        </div>

        <label className="label">{L("Sujet", "Topic")}</label>
        <textarea
          className="textarea"
          rows={3}
          defaultValue={L(
            "Annonce plan Business pour agences africaines",
            "Business plan launch for agencies",
          )}
        ></textarea>

        <div className="row" style={{ gap: 6, marginTop: 12 }}>
          <select className="select" style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }}>
            <option>{L("Inspirant", "Inspiring")}</option>
          </select>
          <select className="select" style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }}>
            <option>~280 m.</option>
          </select>
          <select className="select" style={{ width: 60, padding: "8px 10px", fontSize: 12.5 }}>
            <option>FR</option>
          </select>
        </div>

        <button
          className="btn btn-accent"
          style={{ width: "100%", justifyContent: "center", marginTop: 18, padding: "14px 18px" }}
        >
          <span className="ico">{Icon.sparkle}</span>
          {L("Générer · 1.4 cr.", "Generate · 1.4 cr.")}
        </button>
      </div>
      {/* Mic dock */}
      <div
        style={{
          padding: "10px 18px 14px",
          borderTop: "1px solid var(--line-soft)",
          display: "flex",
          justifyContent: "center",
          gap: 14,
          alignItems: "center",
        }}
      >
        <button className="btn btn-ghost btn-sm" style={{ padding: 10 }}>
          <span className="ico">{Icon.dash}</span>
        </button>
        <button className="btn btn-ghost btn-sm" style={{ padding: 10 }}>
          <span className="ico">{Icon.history}</span>
        </button>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "white",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 8px 24px -8px var(--accent)",
          }}
        >
          <span className="ico" style={{ width: 24, height: 24 }}>
            {Icon.mic}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ padding: 10 }}>
          <span className="ico">{Icon.templ}</span>
        </button>
        <button className="btn btn-ghost btn-sm" style={{ padding: 10 }}>
          <span className="ico">{Icon.user}</span>
        </button>
      </div>
    </Phone>
  );
}

function MobileVoice({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <Phone>
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 55%, var(--accent-soft) 0%, transparent 60%)",
            opacity: 0.7,
          }}
        ></div>
        <div
          className="row between"
          style={{ padding: "14px 18px", position: "relative", zIndex: 2 }}
        >
          <span className="t-eyebrow">{L("IQ Assistant", "IQ Assistant")}</span>
          <button className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <span className="ico">{Icon.x}</span>
          </button>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            position: "relative",
            zIndex: 2,
            padding: "0 24px",
          }}
        >
          <span className="pill voice" style={{ padding: "4px 12px" }}>
            ● {L("Écoute", "Listening")}
          </span>
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)",
                filter: "blur(16px)",
                animation: "orbpulse 2s ease-in-out infinite",
              }}
            ></div>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "var(--bg)",
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              <MicWave size="md" color="var(--accent)" />
            </div>
          </div>
          <div className="t-display" style={{ fontSize: 22, lineHeight: 1.2, textAlign: "center" }}>
            {L(
              "« Génère un post sur l'IA en Afrique avec un ton ",
              "“Generate a post about AI in Africa with an ",
            )}
            <em style={{ color: "var(--accent)" }}>{L("inspirant…", "inspiring…")}</em>
            {L(" »", "”")}
          </div>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            0:08 · {L("voix : Aïssata", "voice: Aïssata")}
          </span>
        </div>
        <div
          style={{
            padding: "16px 18px 22px",
            display: "flex",
            justifyContent: "center",
            gap: 14,
            position: "relative",
            zIndex: 2,
          }}
        >
          <button className="btn btn-outline btn-sm" style={{ padding: "10px 16px" }}>
            <span className="ico">{Icon.pause}</span>
          </button>
          <button className="btn btn-primary" style={{ padding: "10px 22px" }}>
            {L("Terminer", "End")}
          </button>
          <button className="btn btn-outline btn-sm" style={{ padding: "10px 16px" }}>
            <span className="ico">{Icon.refresh}</span>
          </button>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  AssistantWidget,
  VoiceOrb,
  VoiceCommandPalette,
  History,
  MobileGenerate,
  MobileVoice,
});
