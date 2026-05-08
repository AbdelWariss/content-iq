// Page Generate — 3 variations: split-screen, conversational, full-width

// Shared content blocks
function GenForm({ lang, compact = false }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row between">
        <span className="t-eyebrow">{L("Brief de génération", "Generation brief")}</span>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }}>
          <span className="ico">{Icon.mic}</span>
          {L("Dicter le brief", "Dictate brief")}
        </button>
      </div>

      <div>
        <label className="label">{L("Type de contenu", "Content type")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {[
            [Icon.linkedin, "LinkedIn", true],
            [Icon.blog, L("Article", "Article"), false],
            [Icon.email, "Email", false],
            [Icon.twitter, "X / Thread", false],
            [Icon.insta, "Instagram", false],
            [Icon.product, L("Produit", "Product"), false],
            [Icon.yt, "YouTube", false],
            [Icon.bio, "Bio", false],
          ].map(([ic, n, on], i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: "10px 8px",
                textAlign: "center",
                border: on ? "1.5px solid var(--ink)" : undefined,
                background: on ? "var(--bg-elev)" : "var(--bg-sunk)",
              }}
            >
              <span className="ico" style={{ color: on ? "var(--ink)" : "var(--ink-mute)" }}>
                {ic}
              </span>
              <div
                style={{
                  fontSize: 11.5,
                  marginTop: 4,
                  color: on ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                {n}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">{L("Sujet", "Topic")}</label>
        <textarea
          className="textarea"
          rows={compact ? 2 : 3}
          defaultValue={L(
            "Annonce du lancement de notre nouveau plan Business pour les agences de communication africaines.",
            "Announce our Business plan launch for West African communication agencies.",
          )}
        ></textarea>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label className="label">{L("Ton", "Tone")}</label>
          <select className="select" defaultValue="inspire">
            <option value="pro">{L("Professionnel", "Professional")}</option>
            <option value="cas">{L("Décontracté", "Casual")}</option>
            <option value="inspire">{L("Inspirant", "Inspiring")}</option>
            <option value="tech">{L("Technique", "Technical")}</option>
            <option value="hum">{L("Humoristique", "Humorous")}</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">{L("Longueur", "Length")}</label>
          <select className="select">
            <option>{L("Moyen · 300–800 mots", "Medium · 300–800 words")}</option>
          </select>
        </div>
        <div style={{ flex: 0.7 }}>
          <label className="label">{L("Langue", "Language")}</label>
          <select className="select">
            <option>FR</option>
            <option>EN</option>
            <option>ES</option>
            <option>AR</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">{L("Mots-clés à inclure", "Required keywords")}</label>
        <div
          className="row"
          style={{
            gap: 6,
            flexWrap: "wrap",
            padding: "6px 8px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            background: "var(--bg-elev)",
          }}
        >
          <span
            className="chip"
            style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none" }}
          >
            agences africaines
          </span>
          <span
            className="chip"
            style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none" }}
          >
            5 sièges
          </span>
          <span
            className="chip"
            style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "none" }}
          >
            2 000 crédits
          </span>
          <input
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              fontSize: 13,
              padding: "2px 4px",
            }}
            placeholder="+ ajouter…"
          />
        </div>
      </div>

      {!compact && (
        <div>
          <label className="label">{L("Audience cible", "Target audience")}</label>
          <input
            className="input"
            defaultValue={L(
              "Directeurs d'agences de communication, 30–50 ans, Afrique de l'Ouest francophone",
              "Communication agency directors, 30–50, French-speaking West Africa",
            )}
          />
        </div>
      )}
    </div>
  );
}

function GenStreamingPreview({ lang }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <>
      <div
        className="row between"
        style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}
      >
        <div className="row" style={{ gap: 10 }}>
          <span className="pill accent" style={{ padding: "2px 10px" }}>
            ● {L("Génération en cours", "Generating")}
          </span>
          <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            1 247 / ~2 000 tokens · 1.4 cr.
          </span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-outline btn-sm">
            <span className="ico">{Icon.copy}</span>
            {L("Copier", "Copy")}
          </button>
          <button className="btn btn-outline btn-sm">
            <span className="ico">{Icon.download}</span>PDF
          </button>
          <button className="btn btn-outline btn-sm">
            <span className="ico">{Icon.refresh}</span>
            {L("Régénérer", "Regenerate")}
          </button>
          <button className="btn btn-primary btn-sm">
            <span className="ico">{Icon.stop}</span>Stop
          </button>
        </div>
      </div>
      {/* Quill toolbar */}
      <div
        className="row"
        style={{
          gap: 4,
          padding: "10px 0",
          borderBottom: "1px solid var(--line)",
          fontSize: 12,
          color: "var(--ink-soft)",
        }}
      >
        <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontWeight: 700 }}>
          B
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 8px", fontStyle: "italic" }}
        >
          I
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 8px", textDecoration: "underline" }}
        >
          U
        </button>
        <span className="hr" style={{ width: 1, height: 18, background: "var(--line)" }}></span>
        <button className="btn btn-ghost btn-sm">H1</button>
        <button className="btn btn-ghost btn-sm">H2</button>
        <button className="btn btn-ghost btn-sm">H3</button>
        <span className="hr" style={{ width: 1, height: 18, background: "var(--line)" }}></span>
        <button className="btn btn-ghost btn-sm">≡</button>
        <button className="btn btn-ghost btn-sm">•</button>
        <span style={{ flex: 1 }}></span>
        <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
          347 mots
        </span>
      </div>

      <div
        style={{ flex: 1, overflowY: "auto", padding: "20px 0", lineHeight: 1.65, fontSize: 14.5 }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            margin: "0 0 16px",
            fontWeight: 400,
          }}
        >
          {L(
            "Aux agences africaines qui pensent encore que l'IA n'est pas pour elles",
            "To the African agencies still thinking AI isn't for them",
          )}
        </h2>
        <p>
          {L(
            "Pendant des années, les meilleurs outils de production de contenu ont été conçus ailleurs, pour d'autres réalités, dans d'autres langues. Aujourd'hui, on change ça.",
            "For years, the best content tools have been built elsewhere, for other realities, in other languages. Today, we change that.",
          )}
        </p>
        <p>
          {L(
            "CONTENT.IQ Business arrive avec ce que vous nous avez demandé : 2 000 crédits par mois, 5 sièges inclus pour votre équipe, exports en lot ZIP, et un accès API pour intégrer vos workflows existants.",
            "CONTENT.IQ Business launches with what you asked for: 2,000 credits per month, 5 seats for your team, bulk ZIP exports, and API access to plug into your existing workflows.",
          )}
        </p>
        <p>
          {L(
            "Mais surtout — et c'est ce qui change la donne — vous pouvez tout faire à la voix. Dictez le brief, dirigez l'éditeur, parlez à l'assistant. En français. Au pluriel des accents.",
            "But above all — and this is the game-changer — you can do everything by voice. Dictate the brief, direct the editor, talk to the assistant. In French. Across accents.",
          )}
          <span className="caret"></span>
        </p>
      </div>
    </>
  );
}

// VARIATION 1 — Split-screen classique
function GenerateSplit({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="generate" lang={lang} />
        <div
          style={{ flex: 1, display: "grid", gridTemplateColumns: "420px 1fr", overflow: "hidden" }}
        >
          {/* Left — form */}
          <div
            style={{
              padding: "24px 24px 90px",
              overflowY: "auto",
              borderRight: "1px solid var(--line)",
              background: "var(--bg-sunk)",
            }}
          >
            <h2 className="t-display" style={{ fontSize: 28, margin: "0 0 14px" }}>
              {L("Nouveau contenu", "New content")}
            </h2>
            <GenForm lang={lang} />
            <button
              className="btn btn-accent btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
            >
              <span className="ico">{Icon.sparkle}</span>
              {L("Générer · 1.4 crédits", "Generate · 1.4 credits")}
            </button>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-mute)",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              ⌘ + ↵ {L("ou dites « génère »", "or say “generate”")}
            </div>
          </div>

          {/* Right — editor */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "24px 32px",
              overflow: "hidden",
            }}
          >
            <GenStreamingPreview lang={lang} />
          </div>
        </div>
      </div>
      {/* Floating mic */}
      <FloatingMic lang={lang} state="listening" />
    </div>
  );
}

// VARIATION 2 — Conversational (chat-first)
function GenerateConversational({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="generate" lang={lang} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px 8% 220px",
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 980,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* assistant prompt */}
            <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                }}
              >
                C
              </div>
              <div className="col" style={{ gap: 6 }}>
                <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>IQ Assistant · 09:41</div>
                <div style={{ fontSize: 15.5, lineHeight: 1.55, maxWidth: 620 }}>
                  {L(
                    "Bonjour Abdel. On part sur quel format aujourd'hui ? Vous pouvez me dicter un brief, ou choisir un template.",
                    "Hi Abdel. What format are we going for? You can dictate a brief, or pick a template.",
                  )}
                </div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  <span className="chip">{L("Article SEO", "SEO article")}</span>
                  <span className="chip">{L("Post LinkedIn", "LinkedIn post")}</span>
                  <span className="chip">Email</span>
                  <span className="chip">{L("Voir les 12", "See all 12")}</span>
                </div>
              </div>
            </div>

            {/* user voice message */}
            <div
              className="row"
              style={{ gap: 12, alignItems: "flex-start", justifyContent: "flex-end" }}
            >
              <div className="col" style={{ alignItems: "flex-end", gap: 6 }}>
                <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                  {L("Vous · vocal", "You · voice")} · 09:42
                </div>
                <div
                  className="card"
                  style={{
                    padding: "12px 16px",
                    maxWidth: 540,
                    background: "var(--ink)",
                    color: "var(--bg)",
                    border: "none",
                  }}
                >
                  <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                    <MicWave size="sm" color="var(--accent)" listening={false} />
                    <span style={{ fontSize: 11, opacity: 0.7, fontFamily: "var(--font-mono)" }}>
                      0:08 · transcrit
                    </span>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.45 }}>
                    {L(
                      "« Génère un post LinkedIn inspirant pour annoncer notre nouveau plan Business, ciblé sur les agences de communication africaines. »",
                      "“Generate an inspiring LinkedIn post to announce our Business plan, aimed at West African communication agencies.”",
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* assistant working — emerging editor card */}
            <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                }}
              >
                C
              </div>
              <div className="col" style={{ gap: 10, flex: 1 }}>
                <div className="row" style={{ gap: 8, fontSize: 13, color: "var(--ink-mute)" }}>
                  <span>{L("J'ai compris. Voici le post :", "Got it. Here's the post:")}</span>
                  <span className="pill accent" style={{ padding: "1px 8px", fontSize: 10 }}>
                    LinkedIn · {L("inspirant", "inspiring")} · ~280 mots
                  </span>
                </div>
                <div
                  className="card"
                  style={{ padding: 22, maxWidth: 700, boxShadow: "var(--shadow-pop)" }}
                >
                  <div
                    className="row between"
                    style={{
                      marginBottom: 14,
                      paddingBottom: 12,
                      borderBottom: "1px solid var(--line-soft)",
                    }}
                  >
                    <div className="row" style={{ gap: 8 }}>
                      <span className="ico" style={{ color: "var(--ink-mute)" }}>
                        {Icon.linkedin}
                      </span>
                      <strong style={{ fontSize: 14 }}>
                        {L("Post LinkedIn — brouillon", "LinkedIn post — draft")}
                      </strong>
                    </div>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                        <span className="ico">{Icon.copy}</span>
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                        <span className="ico">{Icon.download}</span>
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                        <span className="ico">{Icon.refresh}</span>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65 }}>
                    <strong>
                      {L(
                        "Aux agences africaines qui pensent encore que l'IA n'est pas pour elles —",
                        "To the African agencies still thinking AI isn't for them —",
                      )}
                    </strong>
                    <br />
                    <br />
                    {L(
                      "Pendant des années, les meilleurs outils ont été conçus ailleurs, pour d'autres réalités. Aujourd'hui, on change ça.",
                      "For years, the best tools have been built elsewhere, for other realities. Today, we change that.",
                    )}
                    <br />
                    <br />
                    {L(
                      "CONTENT.IQ Business arrive avec ce que vous nous avez demandé : 2 000 crédits",
                      "CONTENT.IQ Business launches with what you asked for: 2,000 credits",
                    )}
                    <span className="caret"></span>
                  </div>
                  <div
                    className="row between"
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px solid var(--line-soft)",
                      fontSize: 11.5,
                      color: "var(--ink-mute)",
                    }}
                  >
                    <span className="t-mono">streaming · 247 / ~480 tokens</span>
                    <button className="btn btn-outline btn-sm">
                      {L("Ouvrir dans l'éditeur", "Open in editor")} →
                    </button>
                  </div>
                </div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  <button className="btn btn-outline btn-sm">{L("Plus court", "Shorter")}</button>
                  <button className="btn btn-outline btn-sm">
                    {L("Ton plus direct", "More direct tone")}
                  </button>
                  <button className="btn btn-outline btn-sm">
                    {L("Variante humoristique", "Humorous variant")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Composer at bottom */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "20px 8% 28px",
              background: "linear-gradient(to bottom, transparent, var(--bg) 30%)",
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: 980,
                margin: "0 auto",
                padding: 14,
                boxShadow: "var(--shadow-pop)",
              }}
            >
              <textarea
                className="textarea"
                rows={2}
                style={{ border: "none", padding: 4, resize: "none" }}
                placeholder={L(
                  "Décrivez votre besoin, ou appuyez sur le micro pour dicter…",
                  "Describe what you need, or hit the mic to dictate…",
                )}
              ></textarea>
              <div className="row between" style={{ marginTop: 8 }}>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-outline btn-sm">
                    <span className="ico">{Icon.templ}</span>
                    {L("Template", "Template")}
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <span className="ico">{Icon.gear}</span>
                    {L("Réglages", "Settings")}
                  </button>
                  <span className="pill voice" style={{ padding: "3px 9px" }}>
                    FR · {L("inspirant", "inspiring")} · ~500 mots
                  </span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: 8, color: "var(--accent)" }}
                  >
                    <span className="ico">{Icon.mic}</span>
                  </button>
                  <button className="btn btn-primary">
                    <span className="ico">{Icon.send}</span>
                    {L("Générer", "Generate")} · 1.4 cr.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingMic lang={lang} state="idle" />
    </div>
  );
}

// VARIATION 3 — Full-width (form on top, editor below)
function GenerateFullWidth({ lang = "fr" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  return (
    <div
      className="app"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <TopBar plan="Pro" credits={423} lang={lang} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav active="generate" lang={lang} />
        <div style={{ flex: 1, padding: "24px 32px", overflow: "auto" }}>
          {/* Brief bar */}
          <div className="card" style={{ padding: 18, marginBottom: 18 }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <h2 className="t-display" style={{ fontSize: 26, margin: 0 }}>
                {L("Brief", "Brief")}
              </h2>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-outline btn-sm">
                  <span className="ico">{Icon.templ}</span>
                  {L("Charger un template", "Load template")}
                </button>
                <button className="btn btn-outline btn-sm" style={{ color: "var(--accent)" }}>
                  <span className="ico">{Icon.mic}</span>
                  {L("Dicter", "Dictate")}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 0.7fr 0.9fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div>
                <label className="label">{L("Sujet", "Topic")}</label>
                <input
                  className="input"
                  defaultValue={L(
                    "Annonce du plan Business pour les agences",
                    "Business plan launch for agencies",
                  )}
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="select">
                  <option>LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="label">Ton</label>
                <select className="select">
                  <option>{L("Inspirant", "Inspiring")}</option>
                </select>
              </div>
              <div>
                <label className="label">{L("Lang", "Lang")}</label>
                <select className="select">
                  <option>FR</option>
                </select>
              </div>
              <div>
                <label className="label">{L("Longueur", "Length")}</label>
                <select className="select">
                  <option>~280 mots</option>
                </select>
              </div>
            </div>

            <div className="row between">
              <div className="row" style={{ gap: 6 }}>
                <span
                  className="chip"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-ink)",
                    border: "none",
                  }}
                >
                  + agences africaines
                </span>
                <span
                  className="chip"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-ink)",
                    border: "none",
                  }}
                >
                  + 5 sièges
                </span>
                <span
                  className="chip"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-ink)",
                    border: "none",
                  }}
                >
                  + 2 000 crédits
                </span>
                <span className="chip" style={{ background: "var(--bg-sunk)" }}>
                  + {L("ajouter un mot-clé", "add keyword")}
                </span>
              </div>
              <button className="btn btn-accent">
                <span className="ico">{Icon.sparkle}</span>
                {L("Générer · 1.4 cr.", "Generate · 1.4 cr.")}
              </button>
            </div>
          </div>

          {/* Editor + side panel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
            <div
              className="card"
              style={{
                padding: "0 24px 24px",
                display: "flex",
                flexDirection: "column",
                minHeight: 480,
              }}
            >
              <GenStreamingPreview lang={lang} />
            </div>
            <div className="col" style={{ gap: 14 }}>
              <div className="card" style={{ padding: 18 }}>
                <span className="t-eyebrow">{L("Améliorer", "Improve")}</span>
                <div className="col" style={{ gap: 6, marginTop: 12 }}>
                  {[
                    L("Plus court (-30%)", "Shorter (-30%)"),
                    L("Ton plus direct", "More direct tone"),
                    L("Ajouter des emojis", "Add emojis"),
                    L("Variante anglaise", "English variant"),
                    L("Format Twitter (thread)", "Twitter thread format"),
                  ].map((t) => (
                    <button
                      key={t}
                      className="btn btn-outline btn-sm"
                      style={{ justifyContent: "flex-start", width: "100%" }}
                    >
                      <span className="ico" style={{ color: "var(--accent)" }}>
                        {Icon.sparkle}
                      </span>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <span className="t-eyebrow">{L("Versions", "Versions")}</span>
                <div className="col" style={{ gap: 8, marginTop: 12 }}>
                  {[
                    ["v3", L("Version actuelle", "Current"), "09:42", true],
                    ["v2", L("Plus court", "Shorter"), "09:38", false],
                    ["v1", L("Brouillon initial", "Initial draft"), "09:34", false],
                  ].map(([v, t, time, on]) => (
                    <div
                      key={v}
                      className="row"
                      style={{
                        gap: 10,
                        padding: 8,
                        borderRadius: 8,
                        background: on ? "var(--bg-sunk)" : "transparent",
                      }}
                    >
                      <span
                        className="t-mono"
                        style={{ fontSize: 11, color: "var(--ink-mute)", width: 22 }}
                      >
                        {v}
                      </span>
                      <div className="col" style={{ flex: 1 }}>
                        <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 400 }}>{t}</span>
                        <span
                          className="t-mono"
                          style={{ fontSize: 10.5, color: "var(--ink-mute)" }}
                        >
                          {time}
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
      <FloatingMic lang={lang} state="idle" />
    </div>
  );
}

// ─── Floating mic — discrete variation
function FloatingMic({ lang = "fr", state = "idle" }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  const colors = {
    idle: { bg: "var(--ink)", fg: "var(--bg)" },
    listening: { bg: "var(--accent)", fg: "white" },
  };
  const c = colors[state] || colors.idle;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: c.bg,
          color: c.fg,
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--shadow-pop)",
          border: "none",
          position: "relative",
        }}
      >
        <span className="ico" style={{ width: 22, height: 22 }}>
          {Icon.mic}
        </span>
        {state === "listening" && (
          <span
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              opacity: 0.4,
              animation: "pulse 1.4s ease-out infinite",
            }}
          ></span>
        )}
      </div>
      {state === "listening" && (
        <div
          className="card"
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <MicWave size="md" color="var(--voice)" />
          <div className="col">
            <span
              style={{ fontSize: 11, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}
            >
              {L("J'écoute…", "Listening…")}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              "{L("Génère un post LinkedIn", "Generate a LinkedIn post")}"
            </span>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: .5 } 100% { transform: scale(1.4); opacity: 0 } }`}</style>
    </div>
  );
}

Object.assign(window, { GenerateSplit, GenerateConversational, GenerateFullWidth, FloatingMic });
