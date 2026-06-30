import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "../locales/en";
import fr from "../locales/fr";

export const SUPPORTED_LANGS = ["fr", "en"] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

/** Clé localStorage où la langue choisie/détectée est mémorisée. */
export const LANG_STORAGE_KEY = "ciq_lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    // "en-US"/"fr-CA" → "en"/"fr" (on ne gère que la langue, pas la région)
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    fallbackLng: "fr",
    detection: {
      // Priorité : choix mémorisé > langue du navigateur/zone > <html lang>
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
