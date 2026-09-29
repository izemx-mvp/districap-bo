import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, MoreHorizontal, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DocItem } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Back-office DISTRICAP" },
      { name: "description", content: "Fiches techniques, brochures et catalogues téléchargeables." },
      { property: "og:title", content: "Documents — Back-office DISTRICAP" },
      { property: "og:description", content: "Gestion documentaire et suivi des téléchargements." },
    ],
  }),
  component: () => (
    <AppShell>
      <DocumentsPage />
    </AppShell>
  ),
});

const types: DocItem["type"][] = ["Fiche technique", "Brochure", "Catalogue", "Certificat"];

function DocumentsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DocItem>({
    id: newId("d"),
    name: "",
    type: "Fiche technique",
    size: "1,4 Mo",
    brandId: null,
    downloads: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
    status: "actif",
  });

  const brandName = (id: string | null) => store.brands.find((b) => b.id === id)?.name ?? "Tous produits";
  const totalDownloads = store.documents.reduce((s, d) => s + d.downloads, 0);

  const columns: Column<DocItem>[] = [
    { key: "name", label: "Document", value: (d) => d.name, sortable: true, render: (d) => (
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <span className="font-medium">{d.name}</span>
      </div>
    ) },
    { key: "type", label: "Type", value: (d) => d.type },
    { key: "brand", label: "Marque", value: (d) => brandName(d.brandId) },
    { key: "size", label: "Poids", value: (d) => d.size, optional: true },
    { key: "downloads", label: "Téléchargements", value: (d) => d.downloads, sortable: true },
    { key: "updatedAt", label: "Mise à jour", value: (d) => d.updatedAt, sortable: true, render: (d) => formatDate(d.updatedAt) },
    { key: "status", label: "Statut", value: (d) => d.status, render: (d) => <StatusBadge value={d.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={`${store.documents.length} documents disponibles au téléchargement.`}
        actions={<Button onClick={() => setOpen(true)}><Upload className="size-4" /> Ajouter un document</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Documents en ligne", value: String(store.documents.filter((d) => d.status === "actif").length) },
          { label: "Téléchargements cumulés", value: totalDownloads.toLocaleString("fr-FR") },
          { label: "Fiches techniques", value: String(store.documents.filter((d) => d.type === "Fiche technique").length) },
        ].map((k) => (
          <Card key={k.label} className="surface-card gap-1 p-5">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-display text-xl font-semibold">{k.value}</p>
          </Card>
        ))}
      </div>

      <DataTable
        rows={store.documents}
        columns={columns}
        search={(d, t) => `${d.name} ${d.type} ${brandName(d.brandId)}`.toLowerCase().includes(t)}
        filters={[
          { key: "type", label: "Type", options: types, match: (d, v) => d.type === v },
          { key: "brand", label: "Marque", options: store.brands.map((b) => b.name), match: (d, v) => brandName(d.brandId) === v },
          { key: "status", label: "Statut", options: ["actif", "inactif", "brouillon"], match: (d, v) => d.status === v },
        ]}
        rowActions={(d) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { store.update("documents", d.id, { downloads: d.downloads + 1 }); toast.success("Téléchargement lancé"); }}>
                <Download className="size-4" /> Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("documents", d.id, { updatedAt: new Date().toISOString().slice(0, 10) }); toast.success("Nouvelle version enregistrée"); }}>Remplacer le fichier</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("documents", d.id, { status: d.status === "actif" ? "inactif" : "actif" }); toast.success("Statut mis à jour"); }}>
                {d.status === "actif" ? "Retirer du site" : "Publier"}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer le document ?", `${d.name} ne sera plus téléchargeable.`, () => { store.remove("documents", d.id); toast.success("Document supprimé"); })}>Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>Associez le fichier à une marque et publiez-le.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Glissez un fichier PDF</div>
            <div className="space-y-1.5"><Label>Nom du document</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="fiche-technique-xxx.pdf" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as DocItem["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Marque</Label>
                <Select value={draft.brandId ?? "none"} onValueChange={(v) => setDraft({ ...draft, brandId: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous produits</SelectItem>
                    {store.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!draft.name.trim()) return toast.error("Le nom du document est obligatoire");
                store.add("documents", draft);
                store.logActivity("a ajouté le document", "Documents", draft.name, "/documents");
                toast.success("Document ajouté");
                setDraft({ ...draft, id: newId("d"), name: "" });
                setOpen(false);
              }}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
