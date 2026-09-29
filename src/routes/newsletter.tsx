import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, MoreHorizontal, Plus, Send } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Campaign, Subscriber } from "@/lib/mock-data";
import { formatDate, newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — Back-office DISTRICAP" },
      { name: "description", content: "Abonnés et campagnes e-mailing DISTRICAP." },
      { property: "og:title", content: "Newsletter — Back-office DISTRICAP" },
      { property: "og:description", content: "Taux d'ouverture, clics et gestion des abonnés." },
    ],
  }),
  component: () => (
    <AppShell>
      <NewsletterPage />
    </AppShell>
  ),
});

function NewsletterPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", subject: "", content: "" });

  const active = store.subscribers.filter((s) => s.status === "abonné").length;
  const sent = store.campaigns.filter((c) => c.status === "Envoyée");
  const avgOpen = sent.length ? Math.round(sent.reduce((s, c) => s + c.openRate, 0) / sent.length) : 0;
  const avgClick = sent.length ? Math.round(sent.reduce((s, c) => s + c.clickRate, 0) / sent.length) : 0;

  const subColumns: Column<Subscriber>[] = [
    { key: "email", label: "E-mail", value: (s) => s.email, sortable: true, render: (s) => <span className="font-medium">{s.email}</span> },
    { key: "name", label: "Nom", value: (s) => s.name },
    { key: "source", label: "Source", value: (s) => s.source },
    { key: "date", label: "Inscription", value: (s) => s.date, sortable: true, render: (s) => formatDate(s.date) },
    { key: "status", label: "Statut", value: (s) => s.status, render: (s) => <StatusBadge value={s.status} /> },
  ];

  const campColumns: Column<Campaign>[] = [
    { key: "name", label: "Campagne", value: (c) => c.name, sortable: true, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "date", label: "Date", value: (c) => c.date, sortable: true, render: (c) => formatDate(c.date) },
    { key: "sent", label: "Envois", value: (c) => c.sent, sortable: true, render: (c) => c.sent.toLocaleString("fr-FR") },
    { key: "openRate", label: "Ouvertures", value: (c) => c.openRate, sortable: true, render: (c) => `${c.openRate} %` },
    { key: "clickRate", label: "Clics", value: (c) => c.clickRate, sortable: true, render: (c) => `${c.clickRate} %` },
    { key: "status", label: "Statut", value: (c) => c.status, render: (c) => <StatusBadge value={c.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description={`${active} abonnés actifs et ${store.campaigns.length} campagnes.`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Liste des abonnés exportée")}>
              <Download className="size-4" /> Exporter les abonnés
            </Button>
            <Button onClick={() => setOpen(true)}><Plus className="size-4" /> Nouvelle campagne</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Abonnés actifs", value: active.toLocaleString("fr-FR") },
          { label: "Désabonnés", value: String(store.subscribers.length - active) },
          { label: "Taux d'ouverture moyen", value: `${avgOpen} %` },
          { label: "Taux de clic moyen", value: `${avgClick} %` },
        ].map((k) => (
          <Card key={k.label} className="surface-card gap-1 p-5">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-display text-xl font-semibold">{k.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <DataTable
            rows={store.subscribers}
            columns={subColumns}
            search={(s, t) => `${s.email} ${s.name}`.toLowerCase().includes(t)}
            filters={[
              { key: "source", label: "Source", options: ["E-commerce", "Site vitrine"], match: (s, v) => s.source === v },
              { key: "status", label: "Statut", options: ["abonné", "désabonné"], match: (s, v) => s.status === v },
            ]}
            bulkActions={(ids, clear) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirm("Désabonner ces contacts ?", `${ids.length} contacts ne recevront plus la newsletter.`, () => { ids.forEach((id) => store.update("subscribers", id, { status: "désabonné" })); clear(); toast.success("Contacts désabonnés"); })}
              >
                Désabonner
              </Button>
            )}
            rowActions={(s) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { store.update("subscribers", s.id, { status: s.status === "abonné" ? "désabonné" : "abonné" }); toast.success("Statut mis à jour"); }}>
                    {s.status === "abonné" ? "Désabonner" : "Réabonner"}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer l'abonné ?", `${s.email} sera supprimé de la liste.`, () => { store.remove("subscribers", s.id); toast.success("Abonné supprimé"); })}>Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <DataTable
            rows={store.campaigns}
            columns={campColumns}
            search={(c, t) => c.name.toLowerCase().includes(t)}
            filters={[{ key: "status", label: "Statut", options: ["Envoyée", "Planifiée", "Brouillon"], match: (c, v) => c.status === v }]}
            rowActions={(c) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.success("Aperçu de la campagne ouvert")}>Prévisualiser</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("campaigns", c.id, { status: "Envoyée", sent: active }); toast.success("Campagne envoyée aux abonnés"); }}>
                    <Send className="size-4" /> Envoyer maintenant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.add("campaigns", { ...c, id: newId("c"), name: `${c.name} (copie)`, status: "Brouillon", sent: 0, openRate: 0, clickRate: 0 }); toast.success("Campagne dupliquée"); }}>Dupliquer</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer la campagne ?", `${c.name} sera supprimée.`, () => { store.remove("campaigns", c.id); toast.success("Campagne supprimée"); })}>Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>Elle sera envoyée aux {active} abonnés actifs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nom interne</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Objet de l'e-mail</Label><Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Contenu</Label><Textarea rows={6} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!draft.name.trim()) return toast.error("Le nom de la campagne est obligatoire");
                store.add("campaigns", {
                  id: newId("c"),
                  name: draft.name,
                  date: new Date().toISOString().slice(0, 10),
                  sent: 0,
                  openRate: 0,
                  clickRate: 0,
                  status: "Brouillon",
                });
                store.logActivity("a créé la campagne", "Newsletter", draft.name, "/newsletter");
                toast.success("Campagne enregistrée en brouillon");
                setDraft({ name: "", subject: "", content: "" });
                setOpen(false);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => toast.success("E-mail de test envoyé")}>Envoyer un test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
