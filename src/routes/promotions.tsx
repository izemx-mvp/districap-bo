import { useOpenOnNew } from "@/lib/use-open-on-new";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Copy, MoreHorizontal, Pause, Play, Plus, Timer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import type { Promotion } from "@/lib/mock-data";
import { formatDate, formatMAD, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — Back-office DISTRICAP" },
      { name: "description", content: "Planifiez et pilotez les promotions du site e-commerce DISTRICAP." },
      { property: "og:title", content: "Promotions — Back-office DISTRICAP" },
      { property: "og:description", content: "Remises, périodes et produits concernés." },
    ],
  }),
  component: () => (
    <AppShell>
      <PromotionsPage />
    </AppShell>
  ),
});

const empty = (): Promotion => ({
  id: newId("pr"),
  name: "",
  type: "remise %",
  value: 10,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
  scope: "Catalogue complet",
  status: "brouillon",
  productIds: [],
});

function Countdown({ end }: { end: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(end).getTime() - now;
  if (diff <= 0) return <span className="text-destructive">Terminée</span>;
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  return (
    <span className="font-mono tabular-nums">
      {d}j {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function PromotionsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [isNew, setIsNew] = useState(false);
  useOpenOnNew(() => { setEditing(empty()); setIsNew(true); });
  const [showProducts, setShowProducts] = useState<Promotion | null>(null);

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Le nom de la promotion est obligatoire");
    if (isNew) store.add("promotions", editing);
    else store.update("promotions", editing.id, editing);
    store.logActivity(isNew ? "a créé la promotion" : "a modifié la promotion", "Promotions", editing.name, "/promotions");
    toast.success(isNew ? "Promotion créée" : "Promotion mise à jour");
    setEditing(null);
  };

  const active = store.promotions.filter((p) => p.status === "active");
  const planned = store.promotions.filter((p) => p.status === "planifiée");

  const columns: Column<Promotion>[] = [
    { key: "name", label: "Nom", value: (p) => p.name, sortable: true, render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "type", label: "Type", value: (p) => p.type },
    { key: "value", label: "Valeur", value: (p) => p.value, sortable: true, render: (p) => (p.type === "prix fixe" ? formatMAD(p.value) : `${p.value} %`) },
    { key: "scope", label: "Périmètre", value: (p) => p.scope, optional: true },
    { key: "start", label: "Début", value: (p) => p.startDate, sortable: true, render: (p) => formatDate(p.startDate) },
    { key: "end", label: "Fin", value: (p) => p.endDate, sortable: true, render: (p) => formatDate(p.endDate) },
    { key: "products", label: "Produits", value: (p) => p.productIds.length },
    { key: "status", label: "Statut", value: (p) => p.status, render: (p) => <StatusBadge value={p.status} /> },
  ];

  const actions = (p: Promotion) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setEditing(p); setIsNew(false); }}>Modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.add("promotions", { ...p, id: newId("pr"), name: `${p.name} (copie)`, status: "brouillon" }); toast.success("Promotion dupliquée"); }}>
          <Copy className="size-4" /> Dupliquer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("promotions", p.id, { status: "active" }); p.productIds.forEach((id) => store.update("products", id, { promo: true })); toast.success("Promotion activée"); }}>
          <Play className="size-4" /> Activer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("promotions", p.id, { status: "désactivée" }); toast.success("Promotion mise en pause"); }}>
          <Pause className="size-4" /> Mettre en pause
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowProducts(p)}>Voir les produits concernés</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => confirm("Supprimer la promotion ?", `${p.name} sera supprimée.`, () => { store.remove("promotions", p.id); toast.success("Promotion supprimée"); })}
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description={`${active.length} promotions actives, ${planned.length} programmées.`}
        actions={
          <Button onClick={() => { setEditing(empty()); setIsNew(true); }}>
            <Plus className="size-4" /> Nouvelle promotion
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Promotions actives" description="Compte à rebours avant expiration">
          <div className="space-y-3">
            {active.length === 0 ? <p className="text-sm text-muted-foreground">Aucune promotion active.</p> : null}
            {active.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
                <Timer className="size-4 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.scope}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-muted-foreground">Fin dans</p>
                  <Countdown end={p.endDate} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Promotions programmées" description="Démarrage automatique à la date prévue">
          <div className="space-y-3">
            {planned.length === 0 ? <p className="text-sm text-muted-foreground">Aucune promotion programmée.</p> : null}
            {planned.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <CalendarClock className="size-4 text-info" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Du {formatDate(p.startDate)} au {formatDate(p.endDate)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { store.update("promotions", p.id, { status: "active" }); toast.success("Promotion lancée"); }}>
                  Lancer maintenant
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {store.promotions.map((p) => (
              <Card key={p.id} className="surface-card gap-3 p-5">
                <div className="flex items-start justify-between">
                  <StatusBadge value={p.status} />
                  {actions(p)}
                </div>
                <div>
                  <p className="font-display font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.scope}</p>
                </div>
                <p className="font-display text-2xl font-semibold text-accent">
                  {p.type === "prix fixe" ? formatMAD(p.value) : `-${p.value}%`}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                  <span>{p.productIds.length} produits</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowProducts(p)}>Produits concernés</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.promotions}
            columns={columns}
            search={(p, t) => `${p.name} ${p.scope}`.toLowerCase().includes(t)}
            filters={[
              { key: "status", label: "Statut", options: ["planifiée", "active", "expirée", "brouillon", "désactivée"], match: (p, v) => p.status === v },
              { key: "type", label: "Type", options: ["remise %", "prix fixe", "promotion produit", "promotion catégorie", "promotion marque"], match: (p, v) => p.type === v },
            ]}
            rowActions={actions}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!showProducts} onOpenChange={(o) => !o && setShowProducts(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produits concernés</DialogTitle>
            <DialogDescription>{showProducts?.name}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {showProducts?.productIds.map((id) => {
              const p = store.products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <li key={id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">{formatMAD(p.price)}</span>
                </li>
              );
            })}
            {!showProducts?.productIds.length ? <li className="text-sm text-muted-foreground">Aucun produit rattaché.</li> : null}
          </ul>
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle promotion" : "Modifier la promotion"}</SheetTitle>
            <SheetDescription>Définissez le type, la valeur et la période d'application.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as Promotion["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["remise %", "prix fixe", "promotion produit", "promotion catégorie", "promotion marque"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Valeur</Label>
                  <Input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date de début</Label>
                  <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date de fin</Label>
                  <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Périmètre</Label>
                <Input value={editing.scope} onChange={(e) => setEditing({ ...editing, scope: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Promotion["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["planifiée", "active", "expirée", "brouillon", "désactivée"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Produits concernés</Label>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2 scrollbar-slim">
                  {store.products.slice(0, 20).map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={editing.productIds.includes(p.id)}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            productIds: e.target.checked
                              ? [...editing.productIds, p.id]
                              : editing.productIds.filter((x) => x !== p.id),
                          })
                        }
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
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
