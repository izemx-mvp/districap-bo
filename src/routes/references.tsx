import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus, Star } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Reference } from "@/lib/mock-data";
import { newId, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [
      { title: "Références — Back-office DISTRICAP" },
      { name: "description", content: "Gérez les réalisations et projets présentés sur le site vitrine." },
      { property: "og:title", content: "Références — Back-office DISTRICAP" },
      { property: "og:description", content: "Projets, secteurs, solutions déployées et résultats." },
    ],
  }),
  component: () => (
    <AppShell>
      <ReferencesPage />
    </AppShell>
  ),
});

const empty = (): Reference => ({
  id: newId("r"),
  name: "",
  client: "",
  sector: "Industrie",
  city: "Casablanca",
  year: 2026,
  solutionId: "s6",
  brandIds: [],
  description: "",
  problem: "",
  answer: "",
  results: "",
  status: "brouillon",
  featured: false,
});

function ReferencesPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Reference | null>(null);
  const [isNew, setIsNew] = useState(false);

  const sectors = [...new Set(store.references.map((r) => r.sector))];
  const years = [...new Set(store.references.map((r) => String(r.year)))];
  const solName = (id: string) => store.solutions.find((s) => s.id === id)?.title ?? "—";

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Le nom du projet est obligatoire");
    if (isNew) store.add("references", editing);
    else store.update("references", editing.id, editing);
    store.logActivity(isNew ? "a créé la référence" : "a modifié la référence", "Références", editing.name, "/references");
    toast.success("Référence enregistrée");
    setEditing(null);
  };

  const columns: Column<Reference>[] = [
    { key: "name", label: "Projet", value: (r) => r.name, sortable: true, render: (r) => (
      <div className="flex items-center gap-2">
        {r.featured ? <Star className="size-3.5 fill-warning text-warning" /> : null}
        <span className="font-medium">{r.name}</span>
      </div>
    ) },
    { key: "client", label: "Client", value: (r) => r.client, sortable: true },
    { key: "sector", label: "Secteur", value: (r) => r.sector },
    { key: "city", label: "Localisation", value: (r) => r.city, optional: true },
    { key: "year", label: "Année", value: (r) => r.year, sortable: true },
    { key: "solution", label: "Solution", value: (r) => solName(r.solutionId) },
    { key: "status", label: "Statut", value: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];

  const actions = (r: Reference) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setEditing(r); setIsNew(false); }}>Modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("references", r.id, { featured: !r.featured }); toast.success(r.featured ? "Retiré de la mise en avant" : "Projet mis en avant"); }}>
          {r.featured ? "Retirer la mise en avant" : "Mettre en avant"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("references", r.id, { status: "actif" }); toast.success("Référence publiée"); }}>Publier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("references", r.id, { status: "inactif" }); toast.success("Référence dépubliée"); }}>Dépublier</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => confirm("Supprimer la référence ?", `${r.name} sera supprimée.`, () => { store.remove("references", r.id); toast.success("Référence supprimée"); })}
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Références"
        description={`${store.references.length} réalisations valorisées sur le site vitrine.`}
        actions={<Button onClick={() => { setEditing(empty()); setIsNew(true); }}><Plus className="size-4" /> Nouvelle référence</Button>}
      />

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grille</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {store.references.map((r) => (
              <Card key={r.id} className="surface-card gap-0 overflow-hidden py-0">
                <div
                  className="relative h-32"
                  style={{ background: `linear-gradient(135deg, oklch(0.35 0.08 ${(r.year % 10) * 30 + 220}), oklch(0.7 0.12 200))` }}
                >
                  <span className="absolute top-3 right-3"><StatusBadge value={r.status} /></span>
                  {r.featured ? (
                    <span className="absolute top-3 left-3 rounded-full bg-warning/90 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                      Mis en avant
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="font-display font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.client} · {r.city} · {r.year}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5">{r.sector}</span>
                    <span className="text-muted-foreground">{solName(r.solutionId)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(r); setIsNew(false); }}>Modifier</Button>
                    {actions(r)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.references}
            columns={columns}
            search={(r, t) => `${r.name} ${r.client} ${r.sector} ${r.city}`.toLowerCase().includes(t)}
            filters={[
              { key: "sector", label: "Secteur", options: sectors, match: (r, v) => r.sector === v },
              { key: "solution", label: "Solution", options: store.solutions.map((s) => s.title), match: (r, v) => solName(r.solutionId) === v },
              { key: "year", label: "Année", options: years, match: (r, v) => String(r.year) === v },
              { key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (r, v) => r.status === v },
            ]}
            rowActions={actions}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle référence" : "Modifier la référence"}</SheetTitle>
            <SheetDescription>Décrivez le projet réalisé pour le client.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5"><Label>Nom du projet</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Client</Label><Input value={editing.client} onChange={(e) => setEditing({ ...editing, client: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Secteur</Label><Input value={editing.sector} onChange={(e) => setEditing({ ...editing, sector: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Localisation</Label><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Année</Label><Input type="number" value={editing.year} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Solution</Label>
                <Select value={editing.solutionId} onValueChange={(v) => setEditing({ ...editing, solutionId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{store.solutions.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Marques utilisées</Label>
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
              {([["Description", "description"], ["Problématique", "problem"], ["Solution apportée", "answer"], ["Résultats", "results"]] as const).map(([label, key]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea rows={3} value={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} />
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm">Mettre en avant sur la page d'accueil</span>
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              </div>
              <div className={cn("rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground")}>
                Glissez l'image principale et les visuels de la galerie
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button onClick={save}>Enregistrer</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
