import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, GripVertical, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SitePage } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/pages")({
  head: () => ({
    meta: [
      { title: "Pages du site — Back-office DISTRICAP" },
      { name: "description", content: "Éditez les pages institutionnelles des sites DISTRICAP." },
      { property: "og:title", content: "Pages du site — Back-office DISTRICAP" },
      { property: "og:description", content: "Blocs de contenu, SEO et publication." },
    ],
  }),
  component: () => (
    <AppShell>
      <PagesPage />
    </AppShell>
  ),
});

const empty = (): SitePage => ({
  id: newId("pg"),
  title: "",
  slug: "",
  status: "brouillon",
  updatedAt: new Date().toISOString().slice(0, 10),
  seoTitle: "",
  seoDescription: "",
  blocks: [
    { id: newId("b"), type: "hero", label: "Bannière principale", enabled: true },
    { id: newId("b"), type: "texte", label: "Bloc de texte", enabled: true },
  ],
});

const blockTypes = ["hero", "texte", "image", "galerie", "cta", "témoignages", "chiffres", "formulaire"];

function PagesPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState<SitePage | null>(null);

  const move = (p: SitePage, index: number, dir: -1 | 1) => {
    const blocks = [...p.blocks];
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    setEditing({ ...p, blocks });
  };

  const columns: Column<SitePage>[] = [
    { key: "title", label: "Page", value: (p) => p.title, sortable: true, render: (p) => <span className="font-medium">{p.title}</span> },
    { key: "slug", label: "URL", value: (p) => p.slug, render: (p) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.slug}</code> },
    { key: "blocks", label: "Blocs", value: (p) => p.blocks.length },
    { key: "updatedAt", label: "Dernière modification", value: (p) => p.updatedAt, sortable: true, render: (p) => formatDate(p.updatedAt) },
    { key: "status", label: "Statut", value: (p) => p.status, render: (p) => <StatusBadge value={p.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages du site"
        description={`${store.sitePages.length} pages institutionnelles gérées depuis le back-office.`}
        actions={<Button onClick={() => { setEditing(empty()); setIsNew(true); }}><Plus className="size-4" /> Nouvelle page</Button>}
      />

      <DataTable
        rows={store.sitePages}
        columns={columns}
        search={(p, t) => `${p.title} ${p.slug}`.toLowerCase().includes(t)}
        filters={[{ key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (p, v) => p.status === v }]}
        onRowClick={(p) => { setEditing(p); setIsNew(false); }}
        rowActions={(p) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setEditing(p); setIsNew(false); }}>Éditer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPreview(p)}><Eye className="size-4" /> Prévisualiser</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("sitePages", p.id, { status: p.status === "actif" ? "inactif" : "actif" }); toast.success("Statut de publication mis à jour"); }}>
                {p.status === "actif" ? "Dépublier" : "Publier"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.add("sitePages", { ...p, id: newId("pg"), title: `${p.title} (copie)`, slug: `${p.slug}-copie`, status: "brouillon" }); toast.success("Page dupliquée"); }}>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer la page ?", `${p.title} ne sera plus accessible.`, () => { store.remove("sitePages", p.id); toast.success("Page supprimée"); })}>Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>Aperçu de la structure de la page {preview?.slug}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {preview?.blocks.filter((b) => b.enabled).map((b) => (
              <div key={b.id} className="rounded-lg border border-border bg-muted/40 px-4 py-6 text-center text-sm">
                <p className="font-medium">{b.label}</p>
                <p className="text-xs text-muted-foreground">Bloc « {b.type} »</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle page" : "Éditer la page"}</SheetTitle>
            <SheetDescription>Organisez les blocs de contenu et le référencement.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5"><Label>Titre</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>URL</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>

              <SectionCard title="Blocs de contenu" description="Réorganisez, activez ou supprimez les blocs">
                <div className="space-y-2">
                  {editing.blocks.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <GripVertical className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <Input
                          value={b.label}
                          onChange={(e) => setEditing({ ...editing, blocks: editing.blocks.map((x) => (x.id === b.id ? { ...x, label: e.target.value } : x)) })}
                          className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                        <p className="text-xs text-muted-foreground">{b.type}</p>
                      </div>
                      <Switch
                        checked={b.enabled}
                        onCheckedChange={(v) => setEditing({ ...editing, blocks: editing.blocks.map((x) => (x.id === b.id ? { ...x, enabled: v } : x)) })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => move(editing, i, -1)}>↑</Button>
                      <Button variant="ghost" size="icon" onClick={() => move(editing, i, 1)}>↓</Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing({ ...editing, blocks: editing.blocks.filter((x) => x.id !== b.id) })}>×</Button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {blockTypes.map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing({ ...editing, blocks: [...editing.blocks, { id: newId("b"), type: t, label: `Bloc ${t}`, enabled: true }] })}
                      >
                        <Plus className="size-3" /> {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-1.5"><Label>Titre SEO</Label><Input value={editing.seoTitle} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Meta description</Label>
                <Textarea rows={3} value={editing.seoDescription} onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })} />
                <p className="text-xs text-muted-foreground">{editing.seoDescription.length}/160 caractères</p>
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.title.trim()) return toast.error("Le titre est obligatoire");
                const patch = { ...editing, updatedAt: new Date().toISOString().slice(0, 10) };
                if (isNew) store.add("sitePages", patch);
                else store.update("sitePages", editing.id, patch);
                store.logActivity("a modifié la page", "Pages", editing.title, "/pages");
                toast.success("Page enregistrée");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => editing && setPreview(editing)}>Prévisualiser</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
