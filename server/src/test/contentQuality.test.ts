import { describe, expect, it } from "vitest";
import {
  countWords,
  detectLanguageMismatch,
  detectMarkdownLeak,
  evaluateContent,
  hasHtmlStructure,
  stripHtml,
} from "../utils/contentQuality.js";

describe("stripHtml", () => {
  it("retire les balises et normalise les espaces", () => {
    expect(stripHtml("<p>Bonjour <strong>le</strong> monde</p>")).toBe("Bonjour le monde");
  });
});

describe("countWords", () => {
  it("compte les mots", () => {
    expect(countWords("un deux trois")).toBe(3);
    expect(countWords("   ")).toBe(0);
    expect(countWords("")).toBe(0);
  });
});

describe("detectMarkdownLeak", () => {
  it("détecte les titres markdown", () => {
    expect(detectMarkdownLeak("## Titre qui a fui")).toContain("titres markdown (#)");
  });

  it("détecte le gras markdown", () => {
    expect(detectMarkdownLeak("texte avec **gras** dedans")).toContain("gras markdown (**)");
  });

  it("ne signale rien sur du HTML propre", () => {
    expect(detectMarkdownLeak("<h2>Titre</h2><p>Texte <strong>gras</strong></p>")).toEqual([]);
  });

  it("ignore les * à l'intérieur des blocs <code>", () => {
    expect(detectMarkdownLeak("<p>Exemple :</p><code>a ** b</code>")).toEqual([]);
  });
});

describe("hasHtmlStructure", () => {
  it("détecte les balises structurantes", () => {
    expect(hasHtmlStructure("<p>ok</p>")).toBe(true);
    expect(hasHtmlStructure("<h1>ok</h1>")).toBe(true);
  });

  it("retourne false sur du texte brut", () => {
    expect(hasHtmlStructure("juste du texte sans balise")).toBe(false);
  });
});

describe("detectLanguageMismatch", () => {
  it("signale de l'anglais quand on attend du français", () => {
    const enText =
      "the quick brown fox is running and you will see that the dog is not with the cat in the house";
    expect(detectLanguageMismatch(enText, "fr")).toMatch(/anglaise/);
  });

  it("ne signale rien quand la langue correspond", () => {
    const frText =
      "le chat est dans la maison et vous pouvez voir que le chien est avec nous pour le repas du soir";
    expect(detectLanguageMismatch(frText, "fr")).toBeNull();
  });

  it("reste silencieux pour les textes trop courts", () => {
    expect(detectLanguageMismatch("the cat", "fr")).toBeNull();
  });

  it("reste silencieux pour es/ar (pas d'heuristique)", () => {
    expect(
      detectLanguageMismatch("cualquier texto largo aqui repetido ".repeat(5), "es"),
    ).toBeNull();
  });
});

describe("evaluateContent", () => {
  it("passe sur un contenu HTML propre et bien dimensionné", () => {
    const html = `<h1>Titre</h1><p>${"mot ".repeat(400).trim()}</p>`;
    const result = evaluateContent(html, { length: "medium", language: "fr" });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
    expect(result.warnings).toEqual([]);
    expect(result.metrics.wordCount).toBeGreaterThan(300);
  });

  it("échoue et liste les avertissements sur du markdown brut", () => {
    const result = evaluateContent("## Titre\ntexte simple", { length: "short", language: "fr" });
    expect(result.passed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1);
  });

  it("signale une longueur hors borne", () => {
    const html = "<p>trop court</p>";
    const result = evaluateContent(html, { length: "long", language: "fr" });
    expect(result.warnings.some((w) => w.includes("Longueur hors borne"))).toBe(true);
  });

  it("signale un contenu vide", () => {
    const result = evaluateContent("<p></p>", { length: "short", language: "fr" });
    expect(result.warnings).toContain("Contenu vide");
  });

  it("respecte les bornes custom", () => {
    const html = `<p>${"mot ".repeat(100).trim()}</p>`;
    const ok = evaluateContent(html, { length: "custom", language: "fr", customLength: 100 });
    expect(ok.warnings.some((w) => w.includes("Longueur"))).toBe(false);
  });
});
