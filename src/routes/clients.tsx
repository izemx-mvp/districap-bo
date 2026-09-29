import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Client } from "@/lib/mock-data";
import { formatDate, formatMAD, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Back-office DISTRICAP" },
      { name: "description", content: "Base clients consolidée des sites DISTRICAP." },
      { property: "og:title", content: "Clients — Back-office DISTRICAP" },
      { property: "og:description", content: "Historique de commandes, devis et chiffre d'affaires." },
    ],
  }),
  component: () => (
    <AppShell>
      <ClientsPage />
    </AppShell>
  ),
});

const empty = (): Client => ({
  id: newId("cl"),
  name: "",
  company: "",
  email: "",
  phone: "",
  city: "Casablanca",
  type: "Entreprise",
  createdAt: new Date().toISOString().slice(0, 10),
  orders: 0,
  quotes: 0,
  revenue: 0,
  status: "actif",
  notes: [],
});

function ClientsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Client | null>(null);

  const cities = [...new Set(store.clients.map((c) => c.city))];

  const columns: Column<Client>[] = [
    { key: "name", label: "Nom", value: (c) => c.name, sortable: true, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "company", label: "Société", value: (c) => c.company, sortable: true },
    { key: "email", label: "E-mail", value: (c) => c.email, optional: true, render: (c) => <span className="text-muted-foreground">{c.email}</span> },
    { key: "phone", label: "Téléphone", value: (c) => c.phone },
    { key: "city", label: "Ville", value: (c) => c.city, sortable: true },
    { key: "createdAt", label: "Inscription", value: (c) => c.createdAt, sortable: true, optional: true, render: (c) => formatDate(c.createdAt) },
    { key: "orders", label: "Commandes", value: (c) => c.orders, sortable: true },
    { key: "quotes", label: "Devis", value: (c) => c.quotes, sortable: true },
    { key: "revenue", label: "CA", value: (c) => c.revenue, sortable: true, render: (c) => formatMAD(c.revenue) },
    { key: "status", label: "Statut", value: (c) => c.status, render: (c) => <StatusBadge value={c.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${store.clients.length} clients enregistrés sur les deux plateformes.`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Base clients exportée")}>
              <Download className="size-4" /> Exporter
            </Button>
            <Button onClick={() => setEditing(empty())}>
              <Plus className="size-4" /> Nouveau client
            </Button>
          </>
        }
      />

      <DataTable
        rows={store.clients}
        columns={columns}
        search={(c, t) => `${c.name} ${c.company} ${c.email} ${c.city}`.toLowerCase().includes(t)}
        filters={[
          { key: "city", label: "Ville", options: cities, match: (c, v) => c.city === v },
          { key: "status", label: "Statut", options: ["actif", "inactif"], match: (c, v) => c.status === v },
          { key: "type", label: "Type", options: ["Entreprise", "Administration", "Intégrateur", "Particulier"], match: (c, v) => c.type === v },
          { key: "period", label: "Période", options: ["2025", "2026"], match: (c, v) => c.createdAt.startsWith(v) },
        ]}
        onRowClick={(c) => navigate({ to: "/clients/$id", params: { id: c.id } })}
        rowActions={(c) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/clients/$id", params: { id: c.id } })}>Voir la fiche</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditing(c)}>Modifier</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("clients", c.id, { status: c.status === "actif" ? "inactif" : "actif" }); toast.success("Statut mis à jour"); }}>
                {c.status === "actif" ? "Désactiver" : "Activer"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Fiche client exportée")}>Exporter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{store.clients.some((c) => c.id === editing?.id) ? "Modifier le client" : "Nouveau client"}</SheetTitle>
            <SheetDescription>Coordonnées et informations commerciales.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              {([
                ["Nom du contact", "name"],
                ["Société", "company"],
                ["E-mail", "email"],
                ["Téléphone", "phone"],
                ["Ville", "city"],
              ] as const).map(([label, key]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input value={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Type de client</Label>
                <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as Client["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Entreprise", "Administration", "Intégrateur", "Particulier"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.name.trim()) return toast.error("Le nom est obligatoire");
                if (store.clients.some((c) => c.id === editing.id)) store.update("clients", editing.id, editing);
                else store.add("clients", editing);
                store.logActivity("a enregistré le client", "Clients", editing.name, "/clients");
                toast.success("Client enregistré");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
