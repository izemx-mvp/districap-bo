import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MoreHorizontal, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Brand } from "@/lib/mock-data";
import { newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Marques — Back-office DISTRICAP" },
      { name: "description", content: "Gérez les marques partenaires distribuées par DISTRICAP." },
      { property: "og:title", content: "Marques — Back-office DISTRICAP" },
      { property: "og:description", content: "Logos, visibilité e-commerce et vitrine, produits associés." },
    ],
  }),
  component: () => (
    <AppShell>
      <BrandsPage />
    </AppShell>
  ),
});

const empty = (): Brand => ({
  id: newId("br"),
  name: "",
  slug: "",
  description: "",
  website: "https://",
  status: "actif",
  order: 99,
  onEcommerce: true,
  onVitrine: true,
});

function BrandsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [detail, setDetail] = useState<Brand | null>(null);

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Le nom de la marque est obligatoire");
    if (isNew) store.add("brands", editing);
    else store.update("brands", editing.id, editing);
    store.logActivity(isNew ? "a créé la marque" : "a modifié la marque", "Marques", editing.name, "/brands");
    toast.success(isNew ? "Marque créée" : "Marque mise à jour");
    setEditing(null);
  };

  const columns: Column<Brand>[] = [
    {
      key: "logo",
      label: "Logo",
      render: (b) => (
        <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted font-display text-xs font-bold">
          {b.name.slice(0, 2).toUpperCase()}
        </div>
      ),
    },
    { key: "name", label: "Nom", value: (b) => b.name, sortable: true, render: (b) => <span className="font-medium">{b.name}</span> },
    { key: "desc", label: "Description", optional: true, render: (b) => <span className="line-clamp-1 max-w-80 text-muted-foreground">{b.description}</span> },
    {
      key: "website",
      label: "Site officiel",
      optional: true,
      render: (b) => (
        <a href={b.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
          Visiter <ExternalLink className="size-3" />
        </a>
      ),
    },
    { key: "products", label: "Produits", value: (b) => store.products.filter((p) => p.brandId === b.id).length, sortable: true },
    { key: "order", label: "Ordre", value: (b) => b.order, sortable: true },
    { key: "visibility", label: "Visibilité", render: (b) => (
      <div className="flex gap-1">
        {b.onEcommerce ? <StatusBadge value="e-commerce" tone="info" /> : null}
        {b.onVitrine ? <StatusBadge value="vitrine" tone="accent" /> : null}
      </div>
    ) },
    { key: "status", label: "Statut", value: (b) => b.status, render: (b) => <StatusBadge value={b.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marques"
        description={`${store.brands.length} marques référencées chez DISTRICAP.`}
        actions={
          <Button onClick={() => { setEditing(empty()); setIsNew(true); }}>
            <Plus className="size-4" /> Nouvelle marque
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
            {store.brands.map((b) => (
              <Card key={b.id} className="surface-card gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl brand-gradient font-display text-sm font-bold text-primary-foreground">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <StatusBadge value={b.status} />
                </div>
                <div>
                  <p className="font-display font-semibold">{b.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{store.products.filter((p) => p.brandId === b.id).length} produits</span>
                  <span>Ordre {b.order}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setDetail(b)}>Fiche</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(b); setIsNew(false); }}>Modifier</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.brands}
            columns={columns}
            search={(b, t) => `${b.name} ${b.description}`.toLowerCase().includes(t)}
            filters={[
              { key: "status", label: "Statut", options: ["actif", "inactif"], match: (b, v) => b.status === v },
              { key: "site", label: "Visible sur", options: ["E-commerce", "Site vitrine"], match: (b, v) => (v === "E-commerce" ? b.onEcommerce : b.onVitrine) },
            ]}
            onRowClick={(b) => setDetail(b)}
            rowActions={(b) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDetail(b)}>Voir la fiche</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setEditing(b); setIsNew(false); }}>Modifier</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("brands", b.id, { status: "actif" }); toast.success("Marque activée"); }}>Activer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("brands", b.id, { status: "inactif" }); toast.success("Marque désactivée"); }}>Désactiver</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => confirm("Supprimer la marque ?", `${b.name} sera retirée.`, () => { store.remove("brands", b.id); toast.success("Marque supprimée"); })}
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>{detail?.description}</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard title="Produits associés">
                <ul className="space-y-1 text-sm">
                  {store.products.filter((p) => p.brandId === detail.id).slice(0, 6).map((p) => (
                    <li key={p.id} className="truncate">{p.name}</li>
                  ))}
                  {store.products.filter((p) => p.brandId === detail.id).length === 0 ? (
                    <li className="text-muted-foreground">Aucun produit</li>
                  ) : null}
                </ul>
              </SectionCard>
              <SectionCard title="Solutions associées">
                <ul className="space-y-1 text-sm">
                  {store.solutions.filter((s) => s.brandIds.includes(detail.id)).map((s) => (
                    <li key={s.id} className="truncate">{s.title}</li>
                  ))}
                  {store.solutions.filter((s) => s.brandIds.includes(detail.id)).length === 0 ? (
                    <li className="text-muted-foreground">Aucune solution</li>
                  ) : null}
                </ul>
              </SectionCard>
              <SectionCard title="Références associées">
                <ul className="space-y-1 text-sm">
                  {store.references.filter((r) => r.brandIds.includes(detail.id)).map((r) => (
                    <li key={r.id} className="truncate">{r.name}</li>
                  ))}
                  {store.references.filter((r) => r.brandIds.includes(detail.id)).length === 0 ? (
                    <li className="text-muted-foreground">Aucune référence</li>
                  ) : null}
                </ul>
              </SectionCard>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle marque" : "Modifier la marque"}</SheetTitle>
            <SheetDescription>Informations affichées sur les deux sites.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Glissez le logo (SVG ou PNG)
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Site officiel</Label>
                <Input value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
              </div>
              {[
                { label: "Marque active", checked: editing.status === "actif", set: (v: boolean) => setEditing({ ...editing, status: v ? "actif" : "inactif" }) },
                { label: "Visible sur le site e-commerce", checked: editing.onEcommerce, set: (v: boolean) => setEditing({ ...editing, onEcommerce: v }) },
                { label: "Visible sur le site vitrine", checked: editing.onVitrine, set: (v: boolean) => setEditing({ ...editing, onVitrine: v }) },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <span className="text-sm">{s.label}</span>
                  <Switch checked={s.checked} onCheckedChange={s.set} />
                </div>
              ))}
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
