import type { KeyboardEvent, MouseEvent } from "react";

/**
 * Ajoute le support clavier (Entrée/Espace) à un élément non-bouton qui possède
 * déjà un `onClick`. À étaler EN PLUS du `onClick` existant :
 *   <div onClick={fn} {...clickable(fn)}>…</div>
 * Fournit `role="button"`, `tabIndex={0}` et `onKeyDown` — sans redéfinir onClick.
 */
export function clickable(onActivate: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}

/**
 * Conteneur qui stoppe la propagation du clic (ex. contenu d'une modale dans un
 * backdrop). Stoppe aussi les événements clavier — satisfait l'a11y sans rendre
 * le conteneur focusable. Remplace `onClick={(e) => e.stopPropagation()}`.
 */
export function stopPropagation() {
  return {
    onClick: (e: MouseEvent) => e.stopPropagation(),
    onKeyDown: (e: KeyboardEvent) => e.stopPropagation(),
  };
}

/**
 * Rend accessible au clavier n'importe quel élément non-bouton qui a déjà un
 * `onClick`, sans connaître son handler : Entrée/Espace déclenchent un vrai clic
 * sur l'élément. À étaler EN PLUS du `onClick` existant :
 *   <div onClick={...} {...keyboardActivate}>…</div>
 */
export const keyboardActivate = {
  role: "button" as const,
  tabIndex: 0,
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.currentTarget.click();
    }
  },
};
