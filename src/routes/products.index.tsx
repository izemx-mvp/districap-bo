import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, MoreHorizontal, Package, Pencil, Plus, Power, Sparkles, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/lib/mock-data";
import { formatDate, formatMAD, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Produits — Back-office DISTRICAP" },
      { name: "description", content: "Gérez le catalogue produits du site e-commerce DISTRICAP." },
      { property: "og:title", content: "Produits — Back-office DISTRICAP" },
      { property: "og:description", content: "Catalogue, prix, promotions et disponibilité." },
    ],
  }),
  component: () => (
    <AppShell>
      <ProductsPage />
    </AppShell>
  ),
});

function ProductsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const catName = (id: string | null) => store.categories.find((c) => c.id === id)?.name ?? "—";
  const brandName = (id: string) => store.brands.find((b) => b.id === id)?.name ?? "—";

  const act = (p: Product, patch: Partial<Product>, message: string) => {
    store.update("products", p.id, { ...patch, updatedAt: new Date().toISOString().slice(0, 10) });
    store.logActivity("a modifié le produit", "Produits", p.name, "/products");
    toast.success(message);
  };

  const columns: Column<Product>[] = [
    {
      key: "image",
      label: "Image",
      render: (p) => (
        <div
          className="flex size-10 items-center justify-center rounded-lg border border-border"
          style={{ background: `linear-gradient(135deg, oklch(0.9 0.05 ${(p.price % 360)}), oklch(0.82 0.08 ${(p.price % 360) + 30}))` }}
        >
          <Package className="size-4 text-foreground/50" />
        </div>
      ),
    },
    { key: "ref", label: "Référence", value: (p) => p.ref, sortable: true, className: "font-mono text-xs" },
    {
      key: "name",
      label: "Nom",
      value: (p) => p.name,
      sortable: true,
      render: (p) => (
        <div className="min-w-44">
          <p className="font-medium">{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">{brandName(p.brandId)}</p>
        </div>
      ),
    },
    { key: "category", label: "Catégorie", value: (p) => catName(p.categoryId), sortable: true },
    { key: "sub", label: "Sous-catégorie", value: (p) => catName(p.subCategoryId), optional: true },
    { key: "brand", label: "Marque", value: (p) => brandName(p.brandId), sortable: true, optional: true },
    { key: "price", label: "Prix", value: (p) => p.price, sortable: true, render: (p) => formatMAD(p.price) },
    {
      key: "oldPrice",
      label: "Ancien prix",
      optional: true,
      render: (p) => (p.oldPrice ? <span className="text-muted-foreground line-through">{formatMAD(p.oldPrice)}</span> : "—"),
    },
    { key: "stock", label: "Disponibilité", value: (p) => p.stock, render: (p) => <StatusBadge value={p.stock} /> },
    {
      key: "promo",
      label: "Promotion",
      render: (p) => (p.promo ? <StatusBadge value="en promotion" tone="accent" /> : <span className="text-muted-foreground">—</span>),
    },
    { key: "status", label: "Statut", value: (p) => p.status, sortable: true, render: (p) => <StatusBadge value={p.status} /> },
    { key: "updatedAt", label: "Modifié le", value: (p) => p.updatedAt, sortable: true, optional: true, render: (p) => formatDate(p.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produits"
        description={`${store.products.length} références au catalogue e-commerce.`}
        actions={
          <Button onClick={() => navigate({ to: "/products/$id", params: { id: "new" } })}>
            <Plus className="size-4" /> Nouveau produit
          </Button>
        }
      />

      <DataTable
        rows={store.products}
        columns={columns}
        pageSize={10}
        search={(p, t) =>
          [p.name, p.ref, catName(p.categoryId), brandName(p.brandId)].join(" ").toLowerCase().includes(t)
        }
        filters={[
          {
            key: "cat",
            label: "Catégorie",
            options: store.categories.filter((c) => !c.parentId).map((c) => c.name),
            match: (p, v) => catName(p.categoryId) === v,
          },
          {
            key: "sub",
            label: "Sous-catégorie",
            options: store.categories.filter((c) => c.parentId).map((c) => c.name),
            match: (p, v) => catName(p.subCategoryId) === v,
          },
          { key: "brand", label: "Marque", options: store.brands.map((b) => b.name), match: (p, v) => brandName(p.brandId) === v },
          { key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (p, v) => p.status === v },
          { key: "stock", label: "Disponibilité", options: ["en stock", "sur commande", "rupture"], match: (p, v) => p.stock === v },
          { key: "promo", label: "Promotion", options: ["En promotion", "Hors promotion"], match: (p, v) => (v === "En promotion" ? p.promo : !p.promo) },
        ]}
        onRowClick={(p) => navigate({ to: "/products/$id", params: { id: p.id } })}
        bulkActions={(ids, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                ids.forEach((id) => store.update("products", id, { status: "actif" }));
                toast.success(`${ids.length} produit(s) activé(s)`);
                clear();
              }}
            >
              Activer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                ids.forEach((id) => store.update("products", id, { status: "inactif" }));
                toast.success(`${ids.length} produit(s) désactivé(s)`);
                clear();
              }}
            >
              Désactiver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                ids.forEach((id) => store.update("products", id, { promo: true }));
                toast.success(`${ids.length} produit(s) mis en promotion`);
                clear();
              }}
            >
              Mettre en promotion
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                confirm("Supprimer les produits ?", `${ids.length} produit(s) seront retirés du catalogue.`, () => {
                  ids.forEach((id) => store.remove("products", id));
                  toast.success(`${ids.length} produit(s) supprimé(s)`);
                  clear();
                })
              }
            >
              Supprimer
            </Button>
          </>
        )}
        rowActions={(p) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => navigate({ to: "/products/$id", params: { id: p.id } })}>
                <Eye className="size-4" /> Voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/products/$id", params: { id: p.id } })}>
                <Pencil className="size-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const copy = { ...p, id: newId("p"), ref: `${p.ref}-C`, name: `${p.name} (copie)`, status: "brouillon" as const };
                  store.add("products", copy);
                  toast.success("Produit dupliqué");
                }}
              >
                <Copy className="size-4" /> Dupliquer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => act(p, { status: "actif" }, "Produit activé")}>
                <Power className="size-4" /> Activer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act(p, { status: "inactif" }, "Produit désactivé")}>
                <Power className="size-4" /> Désactiver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act(p, { featured: !p.featured }, p.featured ? "Retiré de la mise en avant" : "Produit mis en avant")}>
                <Sparkles className="size-4" /> {p.featured ? "Retirer la mise en avant" : "Mettre en avant"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act(p, { promo: !p.promo }, p.promo ? "Retiré de la promotion" : "Ajouté en promotion")}>
                <Tag className="size-4" /> {p.promo ? "Retirer de la promotion" : "Ajouter en promotion"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  confirm("Supprimer ce produit ?", `${p.name} sera retiré du catalogue.`, () => {
                    store.remove("products", p.id);
                    toast.success("Produit supprimé");
                  })
                }
              >
                <Trash2 className="size-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      {dialog}
    </div>
  );
}
