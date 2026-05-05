import { describe, it, expect, vi } from "vitest";
import { cn, stripHtml, truncate, formatCredits, debounce } from "@/lib/utils";

describe("cn()", () => {
  it("concatène des classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("foo", undefined, false, null, "bar")).toBe("foo bar");
  });

  it("fusionne les classes Tailwind conflictuelles (twMerge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("stripHtml()", () => {
  it("supprime toutes les balises HTML", () => {
    expect(stripHtml("<p>Bonjour <strong>monde</strong></p>")).toBe("Bonjour monde");
  });

  it("retourne la chaîne inchangée si pas de HTML", () => {
    expect(stripHtml("texte brut")).toBe("texte brut");
  });

  it("gère les balises auto-fermantes", () => {
    expect(stripHtml("Ligne 1<br/>Ligne 2")).toBe("Ligne 1Ligne 2");
  });
});

describe("truncate()", () => {
  it("ne tronque pas si le texte est plus court que la limite", () => {
    expect(truncate("court", 10)).toBe("court");
  });

  it("tronque et ajoute '...' si le texte dépasse la limite", () => {
    const result = truncate("texte très long ici", 10);
    expect(result.length).toBe(13); // 10 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("tronque exactement à la limite + '...'", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde...");
  });
});

describe("formatCredits()", () => {
  it("formate les nombres avec séparateur", () => {
    expect(formatCredits(1000)).toMatch(/1[\s.,]000|1000/);
  });

  it("retourne '0' pour zéro", () => {
    expect(formatCredits(0)).toBe("0");
  });

  it("gère les petits nombres", () => {
    expect(formatCredits(42)).toBe("42");
  });
});

describe("debounce()", () => {
  it("n'appelle la fonction qu'après le délai", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
