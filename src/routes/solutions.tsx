import { useOpenOnNew } from "@/lib/use-open-on-new";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Eye, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Solution } from "@/lib/mock-data";
import { newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — Back-office DISTRICAP" },
      { name: "description", content: "Gérez les solutions présentées sur le site vitrine DISTRICAP." },
      { property: "og:title", content: "Solutions — Back-office DISTRICAP" },
      { property: "og:description", content: "Contenus, avantages, technologies et marques associées." },
    ],
  }),
  component: () => (
    <AppShell>
      <SolutionsPage />
    </AppShell>
  ),
});

const empty = (): Solution => ({
  id: newId("s"),
  title: "",
  subtitle: "",
  shortDescription: "",
  content: "",
  advantages: [],
  technologies: [],
  brandIds: [],
  views: 0,
  cta: "Demander une étude",
  status: "brouillon",
  order: 99,
  slug: "",
});

function SolutionsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Solution | null>(null);
  const [isNew, setIsNew] = useState(false);
  useOpenOnNew(() => { setEditing(empty()); setIsNew(true); });
  const [preview, setPreview] = useState<Solution | null>(null);

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Le titre est obligatoire");
    if (isNew) store.add("solutions", editing);
    else store.update("solutions", editing.id, editing);
    store.logActivity(isNew ? "a créé la solution" : "a modifié la solution", "Solutions", editing.title, "/solutions");
    toast.success("Solution enregistrée");
    setEditing(null);
  };

  const columns: Column<Solution>[] = [
    { key: "title", label: "Titre", value: (s) => s.title, sortable: true, render: (s) => (
      <div><p className="font-medium">{s.title}</p><p className="text-xs text-muted-foreground">{s.subtitle}</p></div>
    ) },
    { key: "desc", label: "Description", optional: true, render: (s) => <span className="line-clamp-1 max-w-80 text-muted-foreground">{s.shortDescription}</span> },
    { key: "brands", label: "Marques", render: (s) => s.brandIds.map((b) => store.brands.find((x) => x.id === b)?.name).join(", ") || "—" },
    { key: "views", label: "Vues", value: (s) => s.views, sortable: true },
    { key: "order", label: "Ordre", value: (s) => s.order, sortable: true },
    { key: "status", label: "Statut", value: (s) => s.status, render: (s) => <StatusBadge value={s.status} /> },
  ];

  const actions = (s: Solution) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setEditing(s); setIsNew(false); }}>Modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreview(s)}><Eye className="size-4" /> Prévisualiser</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.add("solutions", { ...s, id: newId("s"), title: `${s.title} (copie)`, status: "brouillon" }); toast.success("Solution dupliquée"); }}>
          <Copy className="size-4" /> Dupliquer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("solutions", s.id, { status: "actif" }); toast.success("Solution publiée"); }}>Publier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("solutions", s.id, { status: "inactif" }); toast.success("Solution dépubliée"); }}>Dépublier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("solutions", s.id, { order: Math.max(1, s.order - 1) }); toast.success("Ordre mis à jour"); }}>Monter dans l'ordre</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => confirm("Supprimer la solution ?", `${s.title} sera retirée du site vitrine.`, () => { store.remove("solutions", s.id); toast.success("Solution supprimée"); })}
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solutions"
        description={`${store.solutions.length} solutions présentées sur le site vitrine.`}
        actions={
          <Button onClick={() => { setEditing(empty()); setIsNew(true); }}>
            <Plus className="size-4" /> Nouvelle solution
          </Button>
        }
      />

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grille</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...store.solutions].sort((a, b) => a.order - b.order).map((s) => (
              <Card key={s.id} className="surface-card gap-0 overflow-hidden py-0">
                <div className="relative h-24 brand-gradient">
                  <span className="absolute top-3 right-3"><StatusBadge value={s.status} /></span>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="font-display font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{s.shortDescription}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.technologies.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.views.toLocaleString("fr-FR")} vues</span>
                    <span>Ordre {s.order}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setPreview(s)}>Aperçu</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(s); setIsNew(false); }}>Modifier</Button>
                    {actions(s)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.solutions}
            columns={columns}
            search={(s, t) => `${s.title} ${s.subtitle}`.toLowerCase().includes(t)}
            filters={[{ key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (s, v) => s.status === v }]}
            rowActions={actions}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>{preview?.subtitle}</DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="space-y-4">
              <div className="h-32 rounded-xl brand-gradient" />
              <p className="text-sm leading-relaxed">{preview.content}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SectionCard title="Avantages">
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {preview.advantages.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </SectionCard>
                <SectionCard title="Technologies">
                  <div className="flex flex-wrap gap-1.5">
                    {preview.technologies.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </SectionCard>
              </div>
              <Button className="w-full">{preview.cta}</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle solution" : "Modifier la solution"}</SheetTitle>
            <SheetDescription>Contenu affiché sur le site vitrine DISTRICAP.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5"><Label>Titre</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Sous-titre</Label><Input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description courte</Label><Textarea rows={2} value={editing.shortDescription} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Contenu détaillé</Label><Textarea rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Avantages (un par ligne)</Label><Textarea rows={4} value={editing.advantages.join("\n")} onChange={(e) => setEditing({ ...editing, advantages: e.target.value.split("\n").filter(Boolean) })} /></div>
              <div className="space-y-1.5"><Label>Technologies (séparées par des virgules)</Label><Input value={editing.technologies.join(", ")} onChange={(e) => setEditing({ ...editing, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
              <div className="space-y-1.5">
                <Label>Marques associées</Label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-2">
                  {store.brands.map((b) => (
                    <label key={b.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={editing.brandIds.includes(b.id)}
                        onChange={(e) => setEditing({ ...editing, brandIds: e.target.checked ? [...editing.brandIds, b.id] : editing.brandIds.filter((x) => x !== b.id) })}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Texte du CTA</Label><Input value={editing.cta} onChange={(e) => setEditing({ ...editing, cta: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Ordre</Label><Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Slug SEO</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            </div>
          ) : null}
          <SheetFooter>
            <Button onClick={save}>Enregistrer</Button>
            <Button variant="outline" onClick={() => { if (editing) { store.update("solutions", editing.id, { ...editing, status: "actif" }); toast.success("Solution publiée"); setEditing(null); } }}>Publier</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
