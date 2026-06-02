/**
 * Runner d'eval offline — qualité des générations LLM.
 *
 * Lance un petit "golden dataset" de paramètres représentatifs contre le VRAI
 * modèle Claude, score chaque sortie avec le même module d'eval que la prod
 * (contentQuality), et affiche un scorecard.
 *
 * ⚠️ Appelle l'API Anthropic (coût réel). Usage :
 *     pnpm --filter server run eval:content
 *
 * Nécessite ANTHROPIC_API_KEY et CLAUDE_MODEL dans .env (chargés via --env-file).
 */
import type { GenerateContentInput } from "../packages/shared/src/index.js";
import { generateForEval } from "../server/src/services/claude.service.js";
import { evaluateContent } from "../server/src/utils/contentQuality.js";

interface GoldenCase {
  name: string;
  params: GenerateContentInput;
}

const GOLDEN_DATASET: GoldenCase[] = [
  {
    name: "Blog FR moyen",
    params: {
      type: "blog",
      subject: "Les bénéfices du télétravail pour les PME",
      tone: "professional",
      language: "fr",
      length: "medium",
    },
  },
  {
    name: "LinkedIn FR court",
    params: {
      type: "linkedin",
      subject: "Lancement d'un nouveau produit SaaS",
      tone: "inspiring",
      language: "fr",
      length: "short",
    },
  },
  {
    name: "Email EN court",
    params: {
      type: "email",
      subject: "Black Friday discount announcement",
      tone: "persuasive",
      language: "en",
      length: "short",
    },
  },
  {
    name: "Twitter FR court",
    params: {
      type: "twitter",
      subject: "Conseils productivité pour développeurs",
      tone: "casual",
      language: "fr",
      length: "short",
    },
  },
  {
    name: "Slogan FR court",
    params: {
      type: "slogan",
      subject: "Une marque de café bio équitable",
      tone: "inspiring",
      language: "fr",
      length: "short",
    },
  },
  {
    name: "Blog EN long",
    params: {
      type: "blog",
      subject: "How AI is transforming content marketing",
      tone: "technical",
      language: "en",
      length: "long",
    },
  },
];

interface Row {
  name: string;
  score: number;
  passed: boolean;
  words: number;
  warnings: string[];
  error?: string;
}

async function run(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY manquant. Charge .env (--env-file=../.env).");
    process.exit(1);
  }

  console.log(
    `\n🧪 Eval qualité — ${GOLDEN_DATASET.length} cas · modèle ${process.env.CLAUDE_MODEL ?? "(défaut)"}\n`,
  );

  const rows: Row[] = [];

  for (const test of GOLDEN_DATASET) {
    process.stdout.write(`  • ${test.name.padEnd(22)} … `);
    try {
      const { content } = await generateForEval(test.params);
      const result = evaluateContent(content, {
        length: test.params.length,
        language: test.params.language,
        customLength: test.params.customLength,
      });
      rows.push({
        name: test.name,
        score: result.score,
        passed: result.passed,
        words: result.metrics.wordCount,
        warnings: result.warnings,
      });
      console.log(`${result.passed ? "✅" : "⚠️ "} score ${(result.score * 100).toFixed(0)}%`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      rows.push({
        name: test.name,
        score: 0,
        passed: false,
        words: 0,
        warnings: [],
        error: message,
      });
      console.log(`❌ erreur : ${message}`);
    }
  }

  // Scorecard détaillé
  console.log("\n────────────── Scorecard ──────────────");
  for (const r of rows) {
    console.log(
      `\n${r.passed ? "✅" : r.error ? "❌" : "⚠️ "} ${r.name} — ${(r.score * 100).toFixed(0)}% (${r.words} mots)`,
    );
    if (r.error) console.log(`     erreur : ${r.error}`);
    for (const w of r.warnings) console.log(`     ⚠ ${w}`);
  }

  const evaluated = rows.filter((r) => !r.error);
  const avg = evaluated.length
    ? evaluated.reduce((sum, r) => sum + r.score, 0) / evaluated.length
    : 0;
  const passRate = rows.length ? rows.filter((r) => r.passed).length / rows.length : 0;

  console.log("\n────────────── Résumé ──────────────");
  console.log(`  Score moyen   : ${(avg * 100).toFixed(1)}%`);
  console.log(
    `  Taux de pass  : ${(passRate * 100).toFixed(0)}% (${rows.filter((r) => r.passed).length}/${rows.length})`,
  );
  console.log(`  Erreurs API   : ${rows.filter((r) => r.error).length}\n`);

  // Code de sortie non nul si la qualité moyenne est trop basse (utile en CI manuelle)
  process.exit(avg >= 0.75 ? 0 : 1);
}

run().catch((err) => {
  console.error("Eval runner failed:", err);
  process.exit(1);
});
