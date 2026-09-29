import { toast } from "sonner";

const cell = (v: unknown) => {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Exporte une liste d'objets en CSV (séparateur « ; » pour Excel FR) et affiche un toast. */
export function exportCSV(filename: string, rows: object[], label = "Export généré") {
  if (!rows.length) {
    toast.error("Aucune donnée à exporter");
    return;
  }
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines = [keys.join(";"), ...rows.map((r) => keys.map((k) => cell((r as Record<string, unknown>)[k])).join(";"))];
  downloadFile(filename.endsWith(".csv") ? filename : `${filename}.csv`, lines.join("\n"));
  toast.success(label, { description: `${rows.length} ligne(s) — ${filename}` });
}

/** Ouvre le sélecteur de fichiers natif et renvoie le fichier choisi. */
export function pickFile(accept: string, onPick: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const f = input.files?.[0];
    if (f) onPick(f);
  };
  input.click();
}
