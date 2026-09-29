import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, Grid2x2, List, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MediaItem } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Médiathèque — Back-office DISTRICAP" },
      { name: "description", content: "Bibliothèque d'images et vidéos partagée entre les deux sites." },
      { property: "og:title", content: "Médiathèque — Back-office DISTRICAP" },
      { property: "og:description", content: "Dossiers, recherche, détails et suppression des médias." },
    ],
  }),
  component: () => (
    <AppShell>
      <MediaPage />
    </AppShell>
  ),
});

function MediaPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [folder, setFolder] = useState("Tous");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const folders = ["Tous", ...new Set(store.media.map((m) => m.folder))];
  const items = store.media.filter(
    (m) => (folder === "Tous" || m.folder === folder) && m.name.toLowerCase().includes(term.toLowerCase()),
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Médiathèque"
        description={`${store.media.length} fichiers disponibles pour les deux sites.`}
        actions={
          <>
            {selected.length > 0 ? (
              <Button
                variant="outline"
                onClick={() =>
                  confirm("Supprimer les médias ?", `${selected.length} fichiers seront supprimés.`, () => {
                    selected.forEach((id) => store.remove("media", id));
                    setSelected([]);
                    toast.success("Médias supprimés");
                  })
                }
              >
                <Trash2 className="size-4" /> Supprimer ({selected.length})
              </Button>
            ) : null}
            <Button onClick={() => setUploadOpen(true)}><Upload className="size-4" /> Téléverser</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Rechercher un fichier…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {folders.map((f) => (
            <Button key={f} size="sm" variant={folder === f ? "default" : "outline"} onClick={() => setFolder(f)}>
              <FolderOpen className="size-3.5" /> {f}
            </Button>
          ))}
        </div>
        <div className="flex rounded-md border border-border">
          <Button size="icon" variant={view === "grid" ? "secondary" : "ghost"} onClick={() => setView("grid")}><Grid2x2 className="size-4" /></Button>
          <Button size="icon" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><List className="size-4" /></Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Aucun média" description="Modifiez la recherche ou téléversez de nouveaux fichiers." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <Card
              key={m.id}
              className={cn(
                "surface-card group gap-0 cursor-pointer overflow-hidden py-0 transition",
                selected.includes(m.id) && "ring-2 ring-accent",
              )}
              onClick={() => setDetail(m)}
            >
              <div className="relative aspect-square" style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${m.hue}), oklch(0.45 0.09 ${m.hue + 40}))` }}>
                <span className="absolute top-2 left-2" onClick={(e) => { e.stopPropagation(); toggle(m.id); }}>
                  <Checkbox checked={selected.includes(m.id)} />
                </span>
                <span className="absolute right-2 bottom-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">{m.type}</span>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium">{m.name}</p>
                <p className="text-[11px] text-muted-foreground">{m.size} · {m.dimensions}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <SectionCard>
          <ul className="divide-y divide-border">
            {items.map((m) => (
              <li key={m.id} className="flex cursor-pointer items-center gap-3 py-3" onClick={() => setDetail(m)}>
                <span onClick={(e) => { e.stopPropagation(); toggle(m.id); }}><Checkbox checked={selected.includes(m.id)} /></span>
                <span className="size-9 rounded-md" style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${m.hue}), oklch(0.45 0.09 ${m.hue + 40}))` }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.folder} · {m.size} · {m.dimensions}</p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{formatDate(m.uploadedAt)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>Détails du fichier et utilisation sur les sites.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4">
              <div className="h-48 rounded-xl" style={{ background: `linear-gradient(135deg, oklch(0.72 0.11 ${detail.hue}), oklch(0.45 0.09 ${detail.hue + 40}))` }} />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Type</dt><dd>{detail.type}</dd></div>
                <div><dt className="text-muted-foreground">Poids</dt><dd>{detail.size}</dd></div>
                <div><dt className="text-muted-foreground">Dimensions</dt><dd>{detail.dimensions}</dd></div>
                <div><dt className="text-muted-foreground">Dossier</dt><dd>{detail.folder}</dd></div>
                <div><dt className="text-muted-foreground">Ajouté le</dt><dd>{formatDate(detail.uploadedAt)}</dd></div>
                <div><dt className="text-muted-foreground">Utilisé dans</dt><dd>{detail.usedIn}</dd></div>
              </dl>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => toast.success("Lien du média copié")}>Copier le lien</Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    confirm("Supprimer ce média ?", `${detail.name} sera supprimé.`, () => {
                      store.remove("media", detail.id);
                      setDetail(null);
                      toast.success("Média supprimé");
                    })
                  }
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Téléverser des médias</DialogTitle>
            <DialogDescription>Ajoutez des images ou vidéos à la médiathèque.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Glissez vos fichiers ici ou cliquez pour parcourir
            </div>
            <div className="space-y-1.5">
              <Label>Dossier de destination</Label>
              <Input defaultValue={folder === "Tous" ? "Produits" : folder} id="media-folder" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const dest = (document.getElementById("media-folder") as HTMLInputElement)?.value || "Produits";
                store.add("media", {
                  id: newId("m"),
                  name: `nouveau-visuel-${Math.floor(Math.random() * 900 + 100)}.jpg`,
                  type: "image",
                  size: "1,2 Mo",
                  dimensions: "1600×1200",
                  folder: dest,
                  uploadedAt: new Date().toISOString().slice(0, 10),
                  usedIn: "Non utilisé",
                  hue: Math.floor(Math.random() * 360),
                });
                store.logActivity("a téléversé un média", "Médias", dest, "/media");
                toast.success("Média ajouté à la bibliothèque");
                setUploadOpen(false);
              }}
            >
              Téléverser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
