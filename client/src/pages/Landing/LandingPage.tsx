import { useCallback, useEffect, useRef, useState } from "react";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import { Link, useNavigate } from "react-router-dom";

const PILLARS = [
  {
    tag: "01 · GENERATE",
    icon: CiqIcon.sparkle,
    title: "Génération streaming",
    body: "Token par token via SSE. Vous voyez le contenu apparaître en direct, comme une vraie conversation.",
    meta: "Claude · 12 formats",
  },
  {
    tag: "02 · ASSIST",
    icon: CiqIcon.brain,
    title: "IQ Assistant context-aware",
    body: "Il connaît votre page, vos crédits, votre brouillon. Il améliore, suggère, brainstorme avec vous.",
    meta: "20 tours de contexte",
  },
  {
    tag: "03 · VOICE",
    icon: CiqIcon.mic,
    title: "Tout à la voix",
    body: "Dictez vos consignes, naviguez à la voix, écoutez les réponses. ElevenLabs + Whisper + Web Speech.",
    meta: "25 commandes natives",
  },
];

const DEMO_SCENES = [
  {
    tag: "01 · BRIEF",
    title: "Dictez votre brief",
    voice: '"Génère un post LinkedIn inspirant sur notre nouveau produit Business."',
    result: "Brief compris · Génération en cours…",
    icon: CiqIcon.mic,
  },
  {
    tag: "02 · GENERATE",
    title: "Génération en temps réel",
    voice: '"Améliore le ton, rends-le plus percutant et ajoute un CTA."',
    result: "Post LinkedIn · 280 mots · 2.1 crédits",
    icon: CiqIcon.sparkle,
  },
  {
    tag: "03 · EXPORT",
    title: "Exporter en un mot",
    voice: '"Exporte en PDF."',
    result: "PDF prêt · Téléchargement lancé ✓",
    icon: CiqIcon.arrow,
  },
];

// Short sentences + explicit pauses (commas, periods) = more natural TTS rhythm
const DEMO_NARRATION = [
  "CONTENT point IQ.",
  "La plateforme qui rédige à votre place, à la voix.",
  "Étape un. Dictez votre brief.",
  "Génère un post LinkedIn inspirant sur notre nouveau produit Business.",
  "L'IA comprend. Et commence à écrire. En temps réel. Directement dans l'éditeur.",
  "Étape deux. Affinez sans clavier.",
  "Améliore le ton. Rends-le plus percutant. Ajoute un appel à l'action.",
  "Résultat : deux cent quatre-vingts mots. Deux virgule un crédits.",
  "Étape trois. Exportez d'un mot.",
  "Exporte en PDF.",
  "Téléchargement prêt.",
  "CONTENT point IQ. Votre voix. Votre contenu.",
].join(" ");

const DEMO_DURATION_MS = 42000;

function findSentenceStart(text: string, fromChar: number): number {
  if (fromChar <= 0) return 0;
  for (let i = fromChar; i > 0; i--) {
    if (text[i] === " " && (text[i - 1] === "." || text[i - 1] === "!" || text[i - 1] === "?")) {
      return i + 1;
    }
  }
  return 0;
}

function pickBestFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  const fr = voices.filter((v) => v.lang.startsWith("fr"));
  return (
    // Google français is the most natural in Chrome
    fr.find((v) => /Google\s+(fran[çc]ais|French)/i.test(v.name)) ??
    fr.find((v) => v.name.toLowerCase().includes("google")) ??
    // Microsoft voices (Edge / Windows)
    fr.find((v) => /Microsoft\s+(Hortense|Julie|Sylvie|Henri)/i.test(v.name)) ??
    // Apple voices (Safari / macOS)
    fr.find((v) => /Amélie|Léa|Thomas|Marie/i.test(v.name)) ??
    fr[0] ??
    null
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isPausedRef = useRef(false);
  // Speech-time tracking — updated every 100ms by the interval, always current at pause time
  const speechPlayedMsRef = useRef(0);
  const segOffsetMsRef = useRef(0);   // speechPlayedMs at the start of the current utterance
  const segStartRef = useRef(0);      // Date.now() when the current utterance began

  const t1Ref = useRef<ReturnType<typeof setTimeout>>();
  const t2Ref = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const scene1DoneRef = useRef(false);
  const scene2DoneRef = useRef(false);

  const startProgressInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const totalPlayed = segOffsetMsRef.current + (Date.now() - segStartRef.current);
      speechPlayedMsRef.current = totalPlayed; // keep in sync for accurate pause reads
      const pct = Math.min(totalPlayed / DEMO_DURATION_MS, 1);
      setProgress(pct);
      if (pct >= 1) clearInterval(intervalRef.current);
    }, 100);
  }, []);

  const scheduleScenes = useCallback((playedMs: number) => {
    clearTimeout(t1Ref.current);
    clearTimeout(t2Ref.current);
    const rem1 = DEMO_DURATION_MS / 3 - playedMs;
    const rem2 = (DEMO_DURATION_MS / 3) * 2 - playedMs;
    if (!scene1DoneRef.current && rem1 > 0)
      t1Ref.current = setTimeout(() => { setScene(1); scene1DoneRef.current = true; }, rem1);
    if (!scene2DoneRef.current && rem2 > 0)
      t2Ref.current = setTimeout(() => { setScene(2); scene2DoneRef.current = true; }, rem2);
  }, []);

  // Starts (or resumes) speech from a given played-time offset.
  // Uses time→char estimation so it works regardless of onboundary support.
  const speakFrom = useCallback((playedMs: number) => {
    const rawChar = Math.floor((playedMs / DEMO_DURATION_MS) * DEMO_NARRATION.length);
    const fromChar = findSentenceStart(DEMO_NARRATION, rawChar);
    // Recalibrate offset to the snapped sentence start
    const calibratedMs = Math.floor((fromChar / DEMO_NARRATION.length) * DEMO_DURATION_MS);
    segOffsetMsRef.current = calibratedMs;
    segStartRef.current = Date.now();

    const utt = new SpeechSynthesisUtterance(DEMO_NARRATION.slice(fromChar));
    utt.lang = "fr-FR";
    utt.rate = 0.88;
    utt.pitch = 1.05;
    utt.volume = 1;
    const voice = pickBestFrenchVoice();
    if (voice) utt.voice = voice;
    utt.onend = () => { if (!isPausedRef.current) onCloseRef.current(); };
    utt.onerror = () => { if (!isPausedRef.current) onCloseRef.current(); };
    speechSynthesis.cancel();
    speechSynthesis.speak(utt);
  }, []);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      // RESUME — speechPlayedMsRef is always fresh from the interval
      isPausedRef.current = false;
      setIsPaused(false);
      speakFrom(speechPlayedMsRef.current);
      scheduleScenes(speechPlayedMsRef.current);
      startProgressInterval();
    } else {
      // PAUSE — set flag before cancel() so onend/onerror don't close the modal
      isPausedRef.current = true;
      setIsPaused(true);
      speechSynthesis.cancel();
      clearInterval(intervalRef.current);
      clearTimeout(t1Ref.current);
      clearTimeout(t2Ref.current);
    }
  }, [speakFrom, scheduleScenes, startProgressInterval]);

  useEffect(() => {
    speechPlayedMsRef.current = 0;
    segOffsetMsRef.current = 0;
    segStartRef.current = Date.now();
    isPausedRef.current = false;
    scene1DoneRef.current = false;
    scene2DoneRef.current = false;

    const startSpeech = () => speakFrom(0);

    if (speechSynthesis.getVoices().length > 0) {
      setTimeout(startSpeech, 50);
    } else {
      speechSynthesis.addEventListener("voiceschanged", startSpeech, { once: true });
    }

    scheduleScenes(0);
    startProgressInterval();

    return () => {
      isPausedRef.current = true;
      speechSynthesis.cancel();
      speechSynthesis.removeEventListener("voiceschanged", startSpeech);
      clearTimeout(t1Ref.current);
      clearTimeout(t2Ref.current);
      clearInterval(intervalRef.current);
    };
  }, [speakFrom, scheduleScenes, startProgressInterval]);

  const s = DEMO_SCENES[scene];
  const elapsed = Math.round(progress * 42);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.68)", backdropFilter: "blur(12px)", animation: "fadeSlideIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 780, margin: "0 24px", padding: 0, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Pause / Resume button */}
          <button
            type="button"
            onClick={togglePause}
            title={isPaused ? "Reprendre" : "Pause"}
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid var(--line)",
              background: isPaused ? "var(--ink)" : "var(--bg-elev)",
              color: isPaused ? "var(--bg)" : "var(--ink)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "background 0.18s, color 0.18s",
            }}
          >
            {isPaused ? (
              /* Play triangle */
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <path d="M0 0 L10 6 L0 12 Z" />
              </svg>
            ) : (
              /* Pause bars */
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <rect x="0" y="0" width="3.5" height="12" rx="1" />
                <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
              </svg>
            )}
          </button>

          {/* Status pill */}
          <span
            className={isPaused ? "pill" : "pill voice"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, flexShrink: 0 }}
          >
            <MicWave size="sm" listening={!isPaused} />
            {isPaused ? "En pause" : "En lecture"}
          </span>

          {/* Progress bar */}
          <div style={{ flex: 1, height: 4, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: isPaused ? "var(--ink-mute)" : "var(--voice)",
                borderRadius: 2,
                width: `${progress * 100}%`,
                transition: "width 0.15s linear, background 0.2s",
              }}
            />
          </div>

          {/* Elapsed time */}
          <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)", flexShrink: 0 }}>
            {`0:${String(elapsed).padStart(2, "0")} / 0:42`}
          </span>

          {/* Close */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, flexShrink: 0 }}
            onClick={onClose}
            title="Fermer"
          >
            <Ico icon={CiqIcon.x} />
          </button>
        </div>

        {/* Scene content */}
        <div style={{ padding: "32px 36px", minHeight: 240 }}>
          <span
            style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--voice)", fontWeight: 600, display: "block", marginBottom: 10 }}
          >
            {s.tag}
          </span>
          <h3 className="t-display" style={{ fontSize: 30, margin: "0 0 24px" }} key={scene}>
            {s.title}
          </h3>

          {/* Voice command bubble */}
          <div
            className="card"
            style={{ padding: "14px 18px", marginBottom: 14, background: "var(--bg-sunk)", border: "1px solid var(--line-soft)", animation: "fadeSlideIn 0.3s ease" }}
            key={`cmd-${scene}`}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{ width: 34, height: 34, borderRadius: 999, background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}
              >
                <Ico icon={CiqIcon.mic} size={14} style={{ color: "white" }} />
              </div>
              <span style={{ fontSize: 14.5, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.5 }}>
                {s.voice}
              </span>
            </div>
          </div>

          {/* Result line */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-mute)", fontSize: 12.5, animation: "fadeSlideIn 0.4s ease 0.15s both" }}
            key={`res-${scene}`}
          >
            <Ico icon={CiqIcon.check} size={13} style={{ color: "var(--voice)", flexShrink: 0 }} />
            <span className="t-mono">{s.result}</span>
          </div>

          {/* Scene dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 32 }}>
            {DEMO_SCENES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === scene ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === scene ? "var(--voice)" : "var(--line)",
                  transition: "all 0.35s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 36px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: 12, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
            Narration · Web Speech API · fr-FR
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Fermer
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => { speechSynthesis.cancel(); onClose(); window.location.href = "/register"; }}
            >
              Essayer gratuitement
              <Ico icon={CiqIcon.arrow} size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", position: "relative", zIndex: 0, overflowX: "hidden" }}>

      {/* ── Demo Modal ── */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      {/* ── Decorative background blobs (z:-1, clipped by stacking context) ── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
        {/* Coral — hero top-left */}
        <div style={{ position: "absolute", top: "3%",  left: "-5%",  width: 580, height: 580, borderRadius: "50%", background: "rgba(229,112,76,0.10)",  filter: "blur(90px)",  animation: "floatA 20s ease-in-out 0s infinite" }} />
        {/* Teal — hero top-right */}
        <div style={{ position: "absolute", top: "9%",  right: "-4%", width: 440, height: 440, borderRadius: "50%", background: "rgba(107,184,189,0.10)", filter: "blur(80px)",  animation: "floatB 24s ease-in-out 4s infinite" }} />
        {/* Gold — trust bar / pillars transition */}
        <div style={{ position: "absolute", top: "26%", right: "6%",  width: 380, height: 380, borderRadius: "50%", background: "rgba(255,200,120,0.09)", filter: "blur(80px)",  animation: "floatA 22s ease-in-out 12s infinite" }} />
        {/* Coral — pillars mid-left */}
        <div style={{ position: "absolute", top: "36%", left: "-4%",  width: 500, height: 500, borderRadius: "50%", background: "rgba(229,112,76,0.07)",  filter: "blur(100px)", animation: "floatC 18s ease-in-out 8s infinite" }} />
        {/* Teal — voice section */}
        <div style={{ position: "absolute", top: "60%", left: "6%",   width: 480, height: 480, borderRadius: "50%", background: "rgba(107,184,189,0.09)", filter: "blur(90px)",  animation: "floatB 26s ease-in-out 6s infinite" }} />
        {/* Coral — CTA / footer */}
        <div style={{ position: "absolute", top: "76%", right: "-5%", width: 460, height: 460, borderRadius: "50%", background: "rgba(229,112,76,0.07)",  filter: "blur(100px)", animation: "floatC 20s ease-in-out 10s infinite" }} />
      </div>

      {/* ── Navbar ── */}
      <div className="row between" style={{ padding: "20px 56px", borderBottom: "1px solid rgba(255,255,255,0.25)", position: "sticky", top: 0, background: "rgba(248,247,245,0.70)", backdropFilter: "blur(22px) saturate(180%) brightness(1.02)", WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.02)", zIndex: 20 }}>
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name"><b>CONTENT</b><span>.IQ</span></span>
        </div>
        <div className="row" style={{ gap: 28, fontSize: 13.5, color: "var(--ink-soft)" }}>
          <a href="#product" className="landing-nav-link">Produit</a>
          <a href="#voice" className="landing-nav-link">Voix</a>
          <Link to="/templates" className="landing-nav-link">Templates</Link>
          <Link to="/pricing" className="landing-nav-link">Tarifs</Link>
          <a href="#usecases" className="landing-nav-link">Cas d'usage</a>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/register")}>
            Essai gratuit
            <Ico icon={CiqIcon.arrow} size={14} />
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ padding: "72px 56px 0", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center", maxWidth: 1320, margin: "0 auto" }}>
        <div>
          <span className="pill voice" style={{ marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <MicWave size="sm" />
            Nouveau · IQ Assistant à la voix
          </span>
          <h1 className="t-display" style={{ fontSize: 84, margin: "10px 0 18px", lineHeight: 1.0 }}>
            Écrivez à voix
            <br />
            haute.{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>Pas au clavier.</em>
          </h1>
          <p style={{ fontSize: 17.5, color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 520, margin: "0 0 28px" }}>
            CONTENT.IQ génère articles, posts, emails et bien plus — en streaming temps réel via Claude.
            Dictez vos consignes, naviguez à la voix, conversez avec l'IQ Assistant. Sans toucher au clavier.
          </p>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
              Démarrer — 50 crédits offerts
              <Ico icon={CiqIcon.arrow} size={16} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => setShowDemo(true)}>
              <Ico icon={CiqIcon.play} />
              Voir la démo · 0:42
            </button>
          </div>
          <div className="row" style={{ gap: 24, marginTop: 36, color: "var(--ink-mute)", fontSize: 12.5 }}>
            <span>★★★★★ 4.9 · 82 avis Product Hunt</span>
            <span>·</span>
            <span>Sans CB</span>
            <span>·</span>
            <span>FR · EN · ES · AR</span>
          </div>
        </div>

        {/* App mockup */}
        <div style={{ position: "relative", height: 540 }}>

          {/* Gradient blobs — refracted by the glass surface above */}
          <div style={{
            position: "absolute", inset: -24, borderRadius: 32, zIndex: 0, overflow: "hidden", pointerEvents: "none",
          }}>
            <div style={{ position: "absolute", top: "8%", left: "10%", width: "55%", height: "55%", borderRadius: "50%", background: "var(--accent-soft)", filter: "blur(48px)", opacity: 0.9 }} />
            <div style={{ position: "absolute", bottom: "6%", right: "8%", width: "45%", height: "45%", borderRadius: "50%", background: "var(--voice-soft)", filter: "blur(44px)", opacity: 0.85 }} />
            <div style={{ position: "absolute", top: "50%", left: "40%", width: "35%", height: "35%", borderRadius: "50%", background: "rgba(255,220,160,0.22)", filter: "blur(36px)" }} />
          </div>

          {/* Glass card */}
          <div
            className="card"
            style={{
              position: "absolute", inset: 0, padding: 0, overflow: "hidden", zIndex: 1,
              background: "rgba(255,255,255,0.42)",
              backdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
              WebkitBackdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
              border: "1px solid rgba(255,255,255,0.58)",
              boxShadow: "0 16px 52px rgba(229,112,76,0.32), 0 8px 24px rgba(58,47,37,0.08), inset 0 1.5px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)",
            }}
          >
            {/* Header — unchanged */}
            <div className="row between" style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--bg-sunk)", fontSize: 12, color: "var(--ink-mute)" }}>
              <span className="t-mono">/generate · post linkedin</span>
              <span className="pill voice" style={{ padding: "2px 8px", fontSize: 10.5, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <MicWave size="sm" />
                écoute…
              </span>
            </div>

            {/* Content — transparent so glass shows through */}
            <div style={{ padding: 22, background: "transparent" }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>Sujet · dicté</div>
              <div style={{ fontSize: 17, fontFamily: "var(--font-serif)", lineHeight: 1.4, marginBottom: 18 }}>
                « Annonce du lancement de notre nouveau plan Business pour les agences de communication africaines. »
              </div>
              <div className="row" style={{ gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                <span className="chip">LinkedIn</span>
                <span className="chip">Ton inspirant</span>
                <span className="chip">FR</span>
                <span className="chip">~ 280 mots</span>
              </div>
              <div className="hr" style={{ margin: "14px 0" }} />
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink)" }}>
                <strong>Aux agences africaines qui pensent encore que l'IA n'est pas pour elles —</strong>
                <br /><br />
                Pendant des années, les meilleurs outils ont été conçus ailleurs, pour d'autres. Aujourd'hui, on change ça.
                <br /><br />
                CONTENT.IQ Business arrive avec 2 000 crédits, 5 sièges, exports en lot
                <span className="caret" />
              </div>
              <div className="row between" style={{ marginTop: 22 }}>
                <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>1 247 / ~2 000 tokens · 1.4 cr.</span>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-outline btn-sm">
                    <Ico icon={CiqIcon.stop} />Stop
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <Ico icon={CiqIcon.refresh} />Régénérer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating mic pill — glass */}
          <div
            className="card"
            style={{
              position: "absolute", left: -28, bottom: 28, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 12, zIndex: 2,
              background: "rgba(255,255,255,0.52)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow: "0 4px 28px rgba(107,184,189,0.46), 0 8px 20px rgba(58,47,37,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--accent)", color: "white", display: "grid", placeItems: "center" }}>
              <Ico icon={CiqIcon.mic} size={16} />
            </div>
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>Commande détectée</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>"Génère un post LinkedIn"</div>
            </div>
            <MicWave size="md" color="var(--voice)" />
          </div>
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div style={{ padding: "64px 56px 0", maxWidth: 1320, margin: "0 auto" }}>
        <div className="t-eyebrow" style={{ textAlign: "center", marginBottom: 22 }}>Pensé pour</div>
        <div className="row" style={{ justifyContent: "space-around", gap: 32, color: "var(--ink-mute)", flexWrap: "wrap" }}>
          {["Créateurs de contenu", "Agences", "PME", "NGOs", "Freelances", "Microfinances"].map((t) => (
            <div key={t} style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic" }}>{t}</div>
          ))}
        </div>
      </div>

      {/* ── Three pillars ── */}
      <div id="product" style={{ padding: "96px 56px", maxWidth: 1320, margin: "0 auto" }}>
        <h2 className="t-display" style={{ fontSize: 56, margin: "0 0 14px", maxWidth: 720 }}>
          Trois manières de produire.{" "}
          <em style={{ color: "var(--ink-mute)" }}>Une seule app.</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }}>
          {PILLARS.map((p) => (
            <div key={p.tag} className="card card-landing" style={{ padding: 26 }}>
              <div className="row between">
                <span className="t-eyebrow">{p.tag}</span>
                <Ico icon={p.icon} style={{ color: "var(--accent)" }} />
              </div>
              <h3 style={{ fontSize: 24, fontFamily: "var(--font-serif)", fontWeight: 400, margin: "26px 0 10px" }}>{p.title}</h3>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.55, fontSize: 14 }}>{p.body}</p>
              <div className="hr" style={{ margin: "20px 0 12px" }} />
              <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{p.meta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Voice section ── */}
      <div id="voice" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "linear-gradient(165deg, rgba(107,184,189,0.28) 0%, rgba(107,184,189,0.08) 50%, var(--bg-sunk) 100%)" }}>
        <div style={{ padding: "80px 56px", maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

          {/* Left — copy */}
          <div>
            <span className="pill voice" style={{ marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MicWave size="sm" />
              03 · VOICE
            </span>
            <h2 className="t-display" style={{ fontSize: 64, margin: "10px 0 18px", lineHeight: 1.0 }}>
              Votre voix.{" "}
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>Votre outil.</em>
            </h2>
            <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 480, marginBottom: 36 }}>
              Dictez vos briefs, naviguez entre les pages, déclenchez des générations — sans jamais toucher au clavier.
              ElevenLabs pour la synthèse, Whisper pour la transcription, Web Speech pour la réactivité instantanée.
            </p>
            <div className="col" style={{ gap: 16 }}>
              {[
                { icon: CiqIcon.mic, label: "Transcription Whisper + Web Speech", desc: "Précision professionnelle · latence zéro" },
                { icon: CiqIcon.speaker, label: "Synthèse vocale ElevenLabs", desc: "Écoutez les réponses de l'IQ Assistant en audio" },
                { icon: CiqIcon.bolt, label: "25 commandes natives", desc: "Générer, naviguer, exporter — tout à la voix" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--voice-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Ico icon={icon} size={16} style={{ color: "var(--voice)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — command demos */}
          <div id="usecases" className="col" style={{ gap: 10 }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Commandes vocales en direct</div>
            {[
              { cmd: '"Génère un post LinkedIn inspirant sur notre nouveau produit"', result: "Post LinkedIn · 280 mots · 2.1 cr." },
              { cmd: '"Améliore le ton, rends-le plus percutant"', result: "Révision appliquée · 0.9 cr." },
              { cmd: '"Exporte en PDF"', result: "Téléchargement prêt ✓" },
              { cmd: '"Va sur l\'historique"', result: "Navigation → /history" },
            ].map(({ cmd, result }, i) => (
              <div key={i} className="card card-voice-hover" style={{ padding: "14px 18px" }}>
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--voice-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <MicWave size="sm" color="var(--voice)" />
                  </div>
                  <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4 }}>{cmd}</span>
                </div>
                <div style={{ marginLeft: 40, fontSize: 12.5, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
                  → {result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA band ── */}
      <div style={{ margin: "0 56px 80px", background: "var(--ink)", borderRadius: 20, padding: "56px 72px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
        <div>
          <h2 className="t-display" style={{ fontSize: 48, color: "var(--bg)", margin: "0 0 10px" }}>
            Commencez gratuitement.{" "}
            <em style={{ color: "var(--accent)" }}>Aujourd'hui.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>50 crédits offerts · Sans carte bancaire · Annulable à tout moment</p>
        </div>
        <button className="btn btn-lg btn-accent" style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/register")}>
          Créer mon compte gratuit
          <Ico icon={CiqIcon.arrow} size={16} />
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: "var(--bg-sunk)", padding: "40px 56px", borderTop: "1px solid var(--line)" }}>
        <div className="row between" style={{ maxWidth: 1320, margin: "0 auto", color: "var(--ink-mute)", fontSize: 12.5 }}>
          <span>CODEXA Solutions · Abdel Wariss OSSENI · 2026</span>
          <span className="row" style={{ gap: 18 }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Terms</span>
            <span style={{ cursor: "pointer" }}>API</span>
            <Link to="/login" style={{ color: "inherit" }}>Connexion</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
