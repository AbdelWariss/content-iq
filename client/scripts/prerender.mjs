/**
 * Prerendering opt-in des pages publiques (SEO / découvrabilité LLM).
 *
 * Après `vite build`, ce script ouvre chaque route publique dans un Chromium
 * headless, laisse React rendre le HTML, puis écrit un snapshot statique dans
 * `dist/<route>/index.html`. Les crawlers (et LLM qui n'exécutent pas le JS)
 * voient ainsi le contenu réel ; côté navigateur, React réhydrate normalement.
 *
 * ⚠️ NON branché sur le build Vercel par défaut. Usage local :
 *     pnpm --filter client build && pnpm --filter client prerender
 *
 * Sur Vercel, il faudrait installer un Chromium dans le build
 * (`npx playwright install chromium`) puis appeler ce script — à valider sur un
 * déploiement de preview avant de toucher le build de prod.
 */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = 4178;

// Routes publiques à prérendre (les pages derrière login sont exclues).
const ROUTES = ["/", "/pricing", "/privacy", "/terms"];

// Chromium : variable d'env prioritaire, sinon cache Playwright local.
const CHROMIUM =
  process.env.PRERENDER_CHROMIUM ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

/** Sert dist/ avec fallback SPA vers index.html. */
function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = join(DIST, urlPath);
      if (!extname(filePath) || !existsSync(filePath)) {
        filePath = join(DIST, "index.html"); // fallback SPA
      }
      try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function run() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("❌ dist/index.html introuvable — lance `vite build` d'abord.");
    process.exit(1);
  }
  if (!existsSync(CHROMIUM)) {
    console.error(`❌ Chromium introuvable : ${CHROMIUM}\n   Définis PRERENDER_CHROMIUM ou installe-le.`);
    process.exit(1);
  }

  const server = await startServer();
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage();

  for (const route of ROUTES) {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300); // laisse Helmet/React finir
    const html = await page.content();

    const outDir = route === "/" ? DIST : join(DIST, route);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, "index.html"), html, "utf8");
    console.log(`✅ prérendu : ${route} → ${join(outDir, "index.html").replace(DIST, "dist")}`);
  }

  await browser.close();
  server.close();
  console.log(`\n✨ ${ROUTES.length} pages prérendues.`);
}

run().catch((err) => {
  console.error("Erreur prerender :", err);
  process.exit(1);
});
