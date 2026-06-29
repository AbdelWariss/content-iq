import { type AppLang, SUPPORTED_LANGS } from "@/lib/i18n";
import api from "@/services/axios";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Normalise une locale i18next ("en-US", "fr") vers nos langues supportées. */
export function normalizeLang(value: string | undefined): AppLang {
  const short = (value ?? "fr").slice(0, 2).toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(short) ? (short as AppLang) : "fr";
}

/**
 * Source unique de vérité pour la langue de l'app. Tous les sélecteurs (header,
 * paramètres…) lisent `lang` et appellent `changeLanguage` via ce hook : ils
 * restent donc toujours synchronisés. Le changement met à jour i18next (persisté
 * en localStorage), Redux, et — si connecté — le profil serveur (avec rollback).
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const lang = normalizeLang(i18n.language);

  const changeLanguage = useCallback(
    async (next: AppLang) => {
      if (next === lang) return;
      const previous = lang;

      await i18n.changeLanguage(next);
      dispatch(updateUser({ language: next }));
      if (!isAuthenticated) return;

      try {
        await api.put("/users/me", { language: next });
      } catch {
        // Rollback en cas d'échec serveur
        await i18n.changeLanguage(previous);
        dispatch(updateUser({ language: previous }));
      }
    },
    [lang, i18n, dispatch, isAuthenticated],
  );

  return { lang, changeLanguage };
}
