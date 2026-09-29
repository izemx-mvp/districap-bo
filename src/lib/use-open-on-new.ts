import { useEffect, useRef } from "react";

/**
 * Ouvre le formulaire de création quand la page est ouverte avec `?new=true`
 * (utilisé par le menu « Créer » de la barre du haut), puis nettoie l'URL.
 */
export function useOpenOnNew(open: () => void) {
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const check = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("new")) {
        params.delete("new");
        const qs = params.toString();
        window.history.replaceState(window.history.state, "", window.location.pathname + (qs ? `?${qs}` : ""));
        openRef.current();
      }
    };
    check();
    const id = window.setInterval(check, 300);
    return () => window.clearInterval(id);
  }, []);
}

/** Variante : ouvre un élément existant quand `?edit=<id>` est présent. */
export function useOpenOnEdit(open: (id: string) => void) {
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const check = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("edit");
      if (id) {
        params.delete("edit");
        const qs = params.toString();
        window.history.replaceState(window.history.state, "", window.location.pathname + (qs ? `?${qs}` : ""));
        openRef.current(id);
      }
    };
    check();
    const t = window.setInterval(check, 300);
    return () => window.clearInterval(t);
  }, []);
}
