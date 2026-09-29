import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/lib/mock-data";
import { newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Catégories — Back-office DISTRICAP" },
      { name: "description", content: "Organisez les catégories et sous-catégories du catalogue DISTRICAP." },
      { property: "og:title", content: "Catégories — Back-office DISTRICAP" },
      { property: "og:description", content: "Arborescence, ordre d'affichage et SEO des catégories." },
    ],
  }),
  component: () => (
    <AppShell>
      <CategoriesPage />
    </AppShell>
  ),
});

const empty = (): Category => ({
  id: newId("c"),
  name: "",
  parentId: null,
  description: "",
  icon: "Layers",
  order: 99,
  status: "actif",
  seoTitle: "",
  seoDescription: "",
  slug: "",
});

function CategoriesPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [open, setOpen] = useState<string[]>(["c1", "c4"]);

  const roots = store.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const childrenOf = (id: string) => store.categories.filter((c) => c.parentId === id).sort((a, b) => a.order - b.order);
  const parentName = (id: string | null) => store.categories.find((c) => c.id === id)?.name ?? "—";

  const startNew = (parentId: string | null = null) => {
    setEditing({ ...empty(), parentId });
    setIsNew(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Le nom de la catégorie est obligatoire");
      return;
    }
    if (isNew) store.add("categories", editing);
    else store.update("categories", editing.id, editing);
    store.logActivity(isNew ? "a créé la catégorie" : "a modifié la catégorie", "Catégories", editing.name, "/categories");
    toast.success(isNew ? "Catégorie créée" : "Catégorie mise à jour");
    setEditing(null);
  };

  const move = (cat: Category, dir: -1 | 1) => {
    store.update("categories", cat.id, { order: cat.order + dir });
    toast.success("Ordre mis à jour");
  };

  const columns: Column<Category>[] = [
    { key: "name", label: "Nom", value: (c) => c.name, sortable: true, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "parent", label: "Catégorie parent", value: (c) => parentName(c.parentId) },
    { key: "desc", label: "Description", optional: true, render: (c) => <span className="line-clamp-1 max-w-72 text-muted-foreground">{c.description}</span> },
    { key: "order", label: "Ordre", value: (c) => c.order, sortable: true },
    { key: "products", label: "Produits", value: (c) => store.products.filter((p) => p.categoryId === c.id || p.subCategoryId === c.id).length },
    { key: "status", label: "Statut", value: (c) => c.status, render: (c) => <StatusBadge value={c.status} /> },
    { key: "slug", label: "Slug", optional: true, render: (c) => <code className="text-xs text-muted-foreground">/{c.slug}</code> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories"
        description={`${roots.length} catégories principales et ${store.categories.length - roots.length} sous-catégories.`}
        actions={
          <Button onClick={() => startNew()}>
            <Plus className="size-4" /> Nouvelle catégorie
          </Button>
        }
      />

      <Tabs defaultValue="tree">
        <TabsList>
          <TabsTrigger value="tree">Arborescence</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-4">
          <SectionCard description="Glissez les poignées pour réorganiser, ou utilisez les flèches d'ordre.">
            <ul className="space-y-2">
              {roots.map((c) => {
                const kids = childrenOf(c.id);
                const isOpen = open.includes(c.id);
                return (
                  <li key={c.id} className="rounded-xl border border-border">
                    <div className="flex items-center gap-2 px-3 py-3">
                      <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                      <button
                        onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== c.id) : [...o, c.id]))}
                        className="text-muted-foreground"
                        aria-label="Déplier"
                      >
                        {kids.length ? (isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />) : <span className="inline-block size-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <StatusBadge value={c.status} />
                      <span className="text-xs text-muted-foreground">Ordre {c.order}</span>
                      <Button size="sm" variant="ghost" onClick={() => move(c, -1)}>↑</Button>
                      <Button size="sm" variant="ghost" onClick={() => move(c, 1)}>↓</Button>
                      <Button size="sm" variant="outline" onClick={() => startNew(c.id)}>
                        <Plus className="size-3.5" /> Sous-catégorie
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(c); setIsNew(false); }}>
                        Modifier
                      </Button>
                    </div>
                    {isOpen && kids.length ? (
                      <ul className="border-t border-border bg-muted/30 px-3 py-2">
                        {kids.map((k) => (
                          <li key={k.id} className="flex items-center gap-2 py-2 pl-8">
                            <GripVertical className="size-3.5 cursor-grab text-muted-foreground" />
                            <span className="flex-1 text-sm">{k.name}</span>
                            <StatusBadge value={k.status} />
                            <Button size="sm" variant="ghost" onClick={() => { setEditing(k); setIsNew(false); }}>
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                confirm("Supprimer la sous-catégorie ?", `${k.name} sera supprimée.`, () => {
                                  store.remove("categories", k.id);
                                  toast.success("Sous-catégorie supprimée");
                                })
                              }
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.categories}
            columns={columns}
            search={(c, t) => `${c.name} ${c.slug}`.toLowerCase().includes(t)}
            filters={[
              { key: "status", label: "Statut", options: ["actif", "inactif"], match: (c, v) => c.status === v },
              { key: "level", label: "Niveau", options: ["Principale", "Sous-catégorie"], match: (c, v) => (v === "Principale" ? !c.parentId : !!c.parentId) },
            ]}
            rowActions={(c) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditing(c); setIsNew(false); }}>Modifier</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startNew(c.id)}>Ajouter une sous-catégorie</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("categories", c.id, { status: "actif" }); toast.success("Catégorie activée"); }}>Activer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("categories", c.id, { status: "inactif" }); toast.success("Catégorie désactivée"); }}>Désactiver</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      confirm("Supprimer la catégorie ?", `${c.name} et son rattachement seront supprimés.`, () => {
                        store.remove("categories", c.id);
                        toast.success("Catégorie supprimée");
                      })
                    }
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvelle catégorie" : "Modifier la catégorie"}</SheetTitle>
            <SheetDescription>Renseignez les informations affichées sur le site e-commerce.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie parent</Label>
                <Select value={editing.parentId ?? "none"} onValueChange={(v) => setEditing({ ...editing, parentId: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                    {roots.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Icône</Label>
                  <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ordre</Label>
                  <Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm">Catégorie active</span>
                <Switch checked={editing.status === "actif"} onCheckedChange={(v) => setEditing({ ...editing, status: v ? "actif" : "inactif" })} />
              </div>
              <div className="space-y-1.5">
                <Label>Titre SEO</Label>
                <Input value={editing.seoTitle} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description SEO</Label>
                <Textarea rows={2} value={editing.seoDescription} onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
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
