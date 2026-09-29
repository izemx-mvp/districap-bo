import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Banner } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/banners")({
  head: () => ({
    meta: [
      { title: "Bannières — Back-office DISTRICAP" },
      { name: "description", content: "Pilotez les bannières promotionnelles des deux sites DISTRICAP." },
      { property: "og:title", content: "Bannières — Back-office DISTRICAP" },
      { property: "og:description", content: "Planification, position, ordre d'affichage et statut." },
    ],
  }),
  component: () => (
    <AppShell>
      <BannersPage />
    </AppShell>
  ),
});

const positions = ["Accueil — haut", "Accueil — milieu", "Catalogue", "Page produit", "Pied de page"];

const empty = (): Banner => ({
  id: newId("bn"),
  name: "",
  title: "",
  subtitle: "",
  cta: "Découvrir",
  link: "/",
  site: "Les deux",
  position: positions[0],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 2592e6).toISOString().slice(0, 10),
  order: 1,
  status: "brouillon",
});

function BannersPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [site, setSite] = useState("Tous");

  const list = [...store.banners]
    .filter((b) => site === "Tous" || b.site === site || b.site === "Les deux")
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bannières"
        description={`${store.banners.length} bannières programmées sur les deux plateformes.`}
        actions={
          <>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{["Tous", "E-commerce", "Site vitrine"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={() => { setEditing(empty()); setIsNew(true); }}><Plus className="size-4" /> Nouvelle bannière</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((b) => (
          <Card key={b.id} className="surface-card gap-0 overflow-hidden py-0">
            <div className="relative flex h-40 flex-col justify-center gap-1 px-7 brand-gradient text-primary-foreground">
              <p className="font-display text-xl font-semibold">{b.title}</p>
              <p className="max-w-sm text-sm opacity-90">{b.subtitle}</p>
              <span className="mt-2 w-fit rounded-md bg-background/15 px-3 py-1.5 text-xs font-medium backdrop-blur">{b.cta}</span>
              <span className="absolute top-3 right-3"><StatusBadge value={b.status} /></span>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.site} · {b.position} · ordre {b.order} · {formatDate(b.startDate)} → {formatDate(b.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(b); setIsNew(false); }}>Modifier</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { store.update("banners", b.id, { status: b.status === "actif" ? "inactif" : "actif" }); toast.success("Statut mis à jour"); }}>
                      {b.status === "actif" ? "Désactiver" : "Activer"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { store.update("banners", b.id, { order: Math.max(1, b.order - 1) }); toast.success("Ordre mis à jour"); }}>Monter</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { store.update("banners", b.id, { order: b.order + 1 }); toast.success("Ordre mis à jour"); }}>Descendre</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { store.add("banners", { ...b, id: newId("bn"), name: `${b.name} (copie)`, status: "brouillon" }); toast.success("Bannière dupliquée"); }}>Dupliquer</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer la bannière ?", `${b.name} sera retirée du site.`, () => { store.remove("banners", b.id); toast.success("Bannière supprimée"); })}>Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle bannière" : "Modifier la bannière"}</SheetTitle>
            <SheetDescription>Contenu, ciblage et période de diffusion.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Visuel de la bannière (1920×600)</div>
              {([["Nom interne", "name"], ["Titre affiché", "title"], ["Sous-titre", "subtitle"], ["Texte du bouton", "cta"], ["Lien", "link"]] as const).map(([label, key]) => (
                <div key={key} className="space-y-1.5"><Label>{label}</Label><Input value={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} /></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Site</Label>
                  <Select value={editing.site} onValueChange={(v) => setEditing({ ...editing, site: v as Banner["site"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["E-commerce", "Site vitrine", "Les deux"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Position</Label>
                  <Select value={editing.position} onValueChange={(v) => setEditing({ ...editing, position: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{positions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Début</Label><Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Fin</Label><Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Ordre</Label><Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} /></div>
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.name.trim()) return toast.error("Le nom interne est obligatoire");
                if (isNew) store.add("banners", editing);
                else store.update("banners", editing.id, editing);
                store.logActivity(isNew ? "a créé la bannière" : "a modifié la bannière", "Bannières", editing.name, "/banners");
                toast.success("Bannière enregistrée");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
