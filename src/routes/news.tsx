import { useOpenOnNew } from "@/lib/use-open-on-new";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
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
import type { NewsItem } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Actualités — Back-office DISTRICAP" },
      { name: "description", content: "Publiez les actualités et articles du site DISTRICAP." },
      { property: "og:title", content: "Actualités — Back-office DISTRICAP" },
      { property: "og:description", content: "Rédaction, catégories, planification et statistiques de lecture." },
    ],
  }),
  component: () => (
    <AppShell>
      <NewsPage />
    </AppShell>
  ),
});

const categories = ["Produits", "Événements", "Partenariats", "Technique", "Entreprise"];

const empty = (): NewsItem => ({
  id: newId("n"),
  title: "",
  category: "Produits",
  author: "Vous",
  date: new Date().toISOString().slice(0, 10),
  status: "brouillon",
  excerpt: "",
  views: 0,
});

function NewsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  useOpenOnNew(() => { setEditing(empty()); setIsNew(true); });

  const columns: Column<NewsItem>[] = [
    { key: "title", label: "Titre", value: (n) => n.title, sortable: true, render: (n) => <span className="font-medium">{n.title}</span> },
    { key: "category", label: "Catégorie", value: (n) => n.category },
    { key: "author", label: "Auteur", value: (n) => n.author, optional: true },
    { key: "date", label: "Publication", value: (n) => n.date, sortable: true, render: (n) => formatDate(n.date) },
    { key: "views", label: "Vues", value: (n) => n.views, sortable: true },
    { key: "status", label: "Statut", value: (n) => n.status, render: (n) => <StatusBadge value={n.status} /> },
  ];

  const actions = (n: NewsItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setEditing(n); setIsNew(false); }}>Modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("news", n.id, { status: "actif" }); toast.success("Article publié"); }}>Publier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("news", n.id, { status: "inactif" }); toast.success("Article dépublié"); }}>Dépublier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.add("news", { ...n, id: newId("n"), title: `${n.title} (copie)`, status: "brouillon", views: 0 }); toast.success("Article dupliqué"); }}>Dupliquer</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer l'article ?", `${n.title} sera supprimé définitivement.`, () => { store.remove("news", n.id); toast.success("Article supprimé"); })}>Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actualités"
        description={`${store.news.length} articles publiés ou en préparation.`}
        actions={<Button onClick={() => { setEditing(empty()); setIsNew(true); }}><Plus className="size-4" /> Nouvel article</Button>}
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Liste</TabsTrigger>
          <TabsTrigger value="grid">Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.news}
            columns={columns}
            search={(n, t) => `${n.title} ${n.category} ${n.author}`.toLowerCase().includes(t)}
            filters={[
              { key: "category", label: "Catégorie", options: categories, match: (n, v) => n.category === v },
              { key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (n, v) => n.status === v },
            ]}
            rowActions={actions}
          />
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {store.news.map((n) => (
              <Card key={n.id} className="surface-card gap-0 overflow-hidden py-0">
                <div className="h-24 brand-gradient" />
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{n.category}</span>
                    <StatusBadge value={n.status} />
                  </div>
                  <p className="font-display font-semibold">{n.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
                  <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span>{n.author} · {formatDate(n.date)}</span>
                    <span>{n.views.toLocaleString("fr-FR")} vues</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(n); setIsNew(false); }}>Modifier</Button>
                    {actions(n)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvel article" : "Modifier l'article"}</SheetTitle>
            <SheetDescription>Rédaction et planification de la publication.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5"><Label>Titre</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Chapô</Label><Textarea rows={3} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Contenu de l'article</Label><Textarea rows={8} placeholder="Rédigez le corps de l'article…" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Auteur</Label><Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Date de publication</Label><Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
              </div>
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Image à la une</div>
            </div>
          ) : null}
          <SheetFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.title.trim()) return toast.error("Le titre est obligatoire");
                if (isNew) store.add("news", editing);
                else store.update("news", editing.id, editing);
                store.logActivity(isNew ? "a créé l'article" : "a modifié l'article", "Actualités", editing.title, "/news");
                toast.success("Article enregistré");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => { if (editing) { if (isNew) store.add("news", { ...editing, status: "actif" }); else store.update("news", editing.id, { ...editing, status: "actif" }); toast.success("Article publié"); setEditing(null); } }}>Publier</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
