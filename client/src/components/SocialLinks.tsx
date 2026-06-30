/** Liens officiels CODEXA Solutions — source unique, réutilisable. */
export const SOCIAL_LINKS = [
  {
    label: "Site web",
    href: "https://codexagroup.com",
    icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 2.5 3.5 6 3.5 10s-1 7.5-3.5 10m0-20c-2.5 2.5-3.5 6-3.5 10s1 7.5 3.5 10M2.5 12h19",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/codexa-solution/",
    icon: "M4.98 3.5a2 2 0 100 4 2 2 0 000-4zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/codexa_solutions360",
    icon: "M12 7.2A4.8 4.8 0 1012 16.8 4.8 4.8 0 0012 7.2zm0 7.9a3.1 3.1 0 110-6.2 3.1 3.1 0 010 6.2zM17.8 7a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0zM7 2.2h10A4.8 4.8 0 0121.8 7v10A4.8 4.8 0 0117 21.8H7A4.8 4.8 0 012.2 17V7A4.8 4.8 0 017 2.2zm0 1.8A3 3 0 004 7v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1DnFptSdi8/",
    icon: "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z",
  },
  {
    label: "X",
    href: "https://x.com/codexasolution",
    icon: "M18.2 2.2h3.3l-7.2 8.2 8.5 11.4h-6.7l-5.2-6.9-6 6.9H1.3l7.7-8.8L.8 2.2h6.8l4.7 6.3zm-1.2 17.6h1.8L7.1 4.1H5.2z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@codexa.solutions",
    icon: "M16.5 2h-3v13.5a2.5 2.5 0 11-2.5-2.5c.3 0 .5 0 .8.1V10a5.6 5.6 0 00-.8-.1A5.5 5.5 0 1016.5 15V8.4a7.3 7.3 0 004.3 1.4V6.8a4.3 4.3 0 01-4.3-4.3z",
  },
] as const;

/** Rangée d'icônes sociales CODEXA (footer, etc.). */
export function SocialLinks({ size = 18 }: { size?: number }) {
  return (
    <span className="row" style={{ gap: 14 }}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`CODEXA Solutions · ${s.label}`}
          title={s.label}
          style={{ color: "inherit", display: "inline-flex", opacity: 0.75 }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={s.icon} />
          </svg>
          {/* Nom accessible fourni par aria-label (icône seule). */}
          <span className="visually-hidden">{s.label}</span>
        </a>
      ))}
    </span>
  );
}
