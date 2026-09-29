import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, FileText, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/mock-data";
import { formatMAD, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Fiche produit — Back-office DISTRICAP" },
      { name: "description", content: "Créer ou modifier une fiche produit du catalogue DISTRICAP." },
      { property: "og:title", content: "Fiche produit — Back-office DISTRICAP" },
      { property: "og:description", content: "Informations, prix, caractéristiques, médias et SEO." },
    ],
  }),
  component: () => (
    <AppShell>
      <ProductForm />
    </AppShell>
  ),
});

const emptyProduct = (): Product => ({
  id: newId("p"),
  ref: `DC-${Math.floor(1000 + Math.random() * 8000)}`,
  name: "",
  categoryId: "c1",
  subCategoryId: null,
  brandId: "br1",
  price: 0,
  oldPrice: null,
  stock: "en stock",
  promo: false,
  featured: false,
  status: "brouillon",
  updatedAt: new Date().toISOString().slice(0, 10),
  shortDescription: "",
  description: "",
  specs: [{ key: "", value: "" }],
  hasDatasheet: false,
  allowOrder: true,
  allowQuote: true,
  slug: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
});

function ProductForm() {
  const store = useStore();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/products/$id" });
  const existing = store.products.find((p) => p.id === id);
  const [form, setForm] = useState<Product>(existing ?? emptyProduct());
  const [preview, setPreview] = useState(false);

  const set = (patch: Partial<Product>) => setForm((f) => ({ ...f, ...patch }));

  const persist = (status?: Product["status"], message = "Produit enregistré") => {
    if (!form.name.trim()) {
      toast.error("Le nom du produit est obligatoire");
      return null;
    }
    if (!form.ref.trim()) {
      toast.error("La référence est obligatoire");
      return null;
    }
    if (!(form.price >= 0) || Number.isNaN(form.price)) {
      toast.error("Le prix doit être un nombre positif");
      return null;
    }
    if ((status ?? form.status) === "actif" && form.price <= 0) {
      toast.error("Renseignez un prix avant de publier le produit");
      return null;
    }
    if (store.products.some((p) => p.id !== form.id && p.ref.toLowerCase() === form.ref.trim().toLowerCase())) {
      toast.error("Cette référence est déjà utilisée par un autre produit");
      return null;
    }
    const alreadySaved = store.products.some((p) => p.id === form.id);
    const payload = {
      ...form,
      name: form.name.trim(),
      ref: form.ref.trim(),
      slug: form.slug || form.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      specs: form.specs.filter((s) => s.key.trim() || s.value.trim()),
      ...(status ? { status } : {}),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    if (alreadySaved) store.update("products", form.id, payload);
    else store.add("products", payload);
    setForm(payload.specs.length ? payload : { ...payload, specs: [{ key: "", value: "" }] });
    store.logActivity(alreadySaved ? "a modifié le produit" : "a créé le produit", "Produits", payload.name, `/products/${payload.id}`);
    toast.success(message);
    if (!alreadySaved && id !== payload.id) navigate({ to: "/products/$id", params: { id: payload.id }, replace: true });
    return payload;
  };

  const subCategories = store.categories.filter((c) => c.parentId === form.categoryId);
  const related = store.products.filter((p) => p.id !== form.id && p.categoryId === form.categoryId).slice(0, 6);
  const accessories = store.products.filter((p) => p.categoryId === "c8").slice(0, 4);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/products" })}>
        <ArrowLeft className="size-4" /> Retour aux produits
      </Button>

      <PageHeader
        title={existing ? form.name || "Fiche produit" : "Nouveau produit"}
        description={existing ? `Référence ${form.ref}` : "Créez une nouvelle fiche produit pour le site e-commerce."}
        actions={
          <>
            <StatusBadge value={form.status} />
            <Button variant="outline" onClick={() => setPreview(true)}>
              <Eye className="size-4" /> Aperçu
            </Button>
            <Button variant="outline" onClick={() => persist("brouillon", "Brouillon enregistré")}>
              Enregistrer brouillon
            </Button>
            <Button variant="outline" onClick={() => persist(undefined, "Modifications enregistrées")}>
              <Save className="size-4" /> Enregistrer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (persist(undefined, "Enregistré")) navigate({ to: "/products" });
              }}
            >
              Enregistrer et quitter
            </Button>
            <Button onClick={() => persist("actif", "Produit publié sur le site e-commerce")}>Publier</Button>
            <Button variant="ghost" onClick={() => navigate({ to: "/products" })}>
              Annuler
            </Button>
          </>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="related">Produits liés</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <SectionCard title="Informations générales">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nom du produit</Label>
                <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Rally Bar Mini" />
              </div>
              <div className="space-y-1.5">
                <Label>Référence</Label>
                <Input value={form.ref} onChange={(e) => set({ ref: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Marque</Label>
                <Select value={form.brandId} onValueChange={(v) => set({ brandId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {store.brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={form.categoryId} onValueChange={(v) => set({ categoryId: v, subCategoryId: null })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {store.categories.filter((c) => !c.parentId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sous-catégorie</Label>
                <Select
                  value={form.subCategoryId ?? "none"}
                  onValueChange={(v) => set({ subCategoryId: v === "none" ? null : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {subCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => set({ status: v as Product["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description courte</Label>
                <Textarea value={form.shortDescription} rows={2} onChange={(e) => set({ shortDescription: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description complète</Label>
                <Textarea value={form.description} rows={6} onChange={(e) => set({ description: e.target.value })} />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="commercial" className="mt-4">
          <SectionCard title="Conditions commerciales">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Prix (MAD)</Label>
                <Input type="number" value={form.price} onChange={(e) => set({ price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ancien prix (MAD)</Label>
                <Input
                  type="number"
                  value={form.oldPrice ?? ""}
                  onChange={(e) => set({ oldPrice: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prix promotionnel (MAD)</Label>
                <Input
                  type="number"
                  value={form.promo && form.oldPrice ? form.price : ""}
                  onChange={(e) => set({ price: Number(e.target.value), promo: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Remise appliquée</Label>
                <Input
                  readOnly
                  value={form.oldPrice ? `${Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)} %` : "—"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Disponibilité</Label>
                <Select value={form.stock} onValueChange={(v) => set({ stock: v as Product["stock"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en stock">En stock</SelectItem>
                    <SelectItem value="sur commande">Sur commande</SelectItem>
                    <SelectItem value="rupture">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { key: "allowOrder" as const, label: "Autoriser la commande en ligne" },
                { key: "allowQuote" as const, label: "Autoriser la demande de devis" },
                { key: "promo" as const, label: "Produit en promotion" },
                { key: "featured" as const, label: "Mettre en avant sur la page d'accueil" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <span className="text-sm">{s.label}</span>
                  <Switch checked={Boolean(form[s.key])} onCheckedChange={(v) => set({ [s.key]: v } as Partial<Product>)} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="specs" className="mt-4">
          <SectionCard
            title="Caractéristiques techniques"
            actions={
              <Button size="sm" variant="outline" onClick={() => set({ specs: [...form.specs, { key: "", value: "" }] })}>
                <Plus className="size-4" /> Ajouter une ligne
              </Button>
            }
          >
            <div className="space-y-2">
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Caractéristique"
                    value={s.key}
                    onChange={(e) => {
                      const specs = [...form.specs];
                      specs[i] = { ...specs[i], key: e.target.value };
                      set({ specs });
                    }}
                  />
                  <Input
                    placeholder="Valeur"
                    value={s.value}
                    onChange={(e) => {
                      const specs = [...form.specs];
                      specs[i] = { ...specs[i], value: e.target.value };
                      set({ specs });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => set({ specs: form.specs.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <SectionCard title="Médias" description="Image principale, galerie et vidéo de présentation.">
            <div className="grid gap-4 md:grid-cols-2">
              <DropZone label="Image principale" hint="JPG ou PNG, 1200x900 recommandé" />
              <DropZone label="Vidéo produit" hint="MP4 ou lien YouTube" />
            </div>
            <div className="mt-4">
              <Label className="mb-2 block">Galerie</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {store.media.slice(0, 4).map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-lg border border-border">
                    <div className="h-20" style={{ background: `linear-gradient(135deg, oklch(0.85 0.07 ${m.hue}), oklch(0.7 0.1 ${m.hue + 40}))` }} />
                    <p className="truncate px-2 py-1.5 text-xs">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <SectionCard title="Documents associés">
            <div className="space-y-2">
              {["Fiche technique", "Brochure PDF", "Catalogue fabricant", "Certificat"].map((d) => (
                <div key={d} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                  <FileText className="size-4 text-accent" />
                  <span className="flex-1 text-sm">{d}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      set({ hasDatasheet: true });
                      toast.success(`${d} ajouté au produit`);
                    }}
                  >
                    <Upload className="size-4" /> Téléverser
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="related" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Produits similaires">
              <RelatedList items={related.slice(0, 3).map((p) => p.name)} />
            </SectionCard>
            <SectionCard title="Accessoires">
              <RelatedList items={accessories.map((p) => p.name)} />
            </SectionCard>
            <SectionCard title="Produits complémentaires">
              <RelatedList items={related.slice(3, 6).map((p) => p.name)} />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <SectionCard title="Référencement">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Meta title</Label>
                <Input value={form.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => set({ slug: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta description</Label>
                <Textarea rows={3} value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Mots-clés</Label>
                <Input value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Image de partage</Label>
                <DropZone label="" hint="1200x630 pour les réseaux sociaux" compact />
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la fiche produit</DialogTitle>
            <DialogDescription>Rendu simplifié tel qu'il apparaîtra sur le site e-commerce.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border border-border p-5">
            <Badge variant="secondary">{store.categories.find((c) => c.id === form.categoryId)?.name}</Badge>
            <h3 className="font-display text-xl font-semibold">{form.name || "Nom du produit"}</h3>
            <p className="text-sm text-muted-foreground">{form.shortDescription || "Description courte du produit."}</p>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-semibold">{formatMAD(form.price)}</span>
              {form.oldPrice ? <span className="text-muted-foreground line-through">{formatMAD(form.oldPrice)}</span> : null}
            </div>
            <StatusBadge value={form.stock} />
            <p className="text-sm leading-relaxed">{form.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RelatedList({ items }: { items: string[] }) {
  const [list, setList] = useState(items);
  const store = useStore();
  return (
    <div className="space-y-2">
      {list.length === 0 ? <p className="text-sm text-muted-foreground">Aucun produit associé.</p> : null}
      {list.map((n) => (
        <div key={n} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <span className="flex-1 truncate">{n}</span>
          <button onClick={() => setList((l) => l.filter((x) => x !== n))} aria-label="Retirer">
            <X className="size-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      ))}
      <Select
        value=""
        onValueChange={(v) => {
          setList((l) => [...l, v]);
          toast.success(`${v} associé`);
        }}
      >
        <SelectTrigger className="w-full">
          <Plus className="size-4" /> <span>Associer un produit</span>
        </SelectTrigger>
        <SelectContent>
          {store.products.filter((p) => p.name && !list.includes(p.name)).map((p) => (
            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DropZone({ label, hint, compact }: { label: string; hint: string; compact?: boolean }) {
  const [file, setFile] = useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      {label ? <Label>{label}</Label> : null}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-accent/60 ${compact ? "p-4" : "p-8"}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) {
            setFile(f.name);
            toast.success(`${f.name} ajouté`);
          }
        }}
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f.name);
              toast.success(`${f.name} ajouté`);
            }
          }}
        />
        <Upload className="size-5 text-muted-foreground" />
        <span className="text-sm">{file ?? "Glissez-déposez ou cliquez pour téléverser"}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </label>
    </div>
  );
}
