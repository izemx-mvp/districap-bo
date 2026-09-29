import { exportCSV } from "@/lib/export";
import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Power } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMAD, orderTotal, useStore } from "@/lib/store";

export const Route = createFileRoute("/clients/$id")({
  head: () => ({
    meta: [
      { title: "Fiche client — Back-office DISTRICAP" },
      { name: "description", content: "Historique complet d'un client DISTRICAP." },
      { property: "og:title", content: "Fiche client — Back-office DISTRICAP" },
      { property: "og:description", content: "Commandes, devis, échanges et notes internes." },
    ],
  }),
  component: () => (
    <AppShell>
      <ClientDetail />
    </AppShell>
  ),
});

function ClientDetail() {
  const store = useStore();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/clients/$id" });
  const client = store.clients.find((c) => c.id === id);
  const [note, setNote] = useState("");

  if (!client) {
    return (
      <EmptyState
        title="Client introuvable"
        description="Cette fiche n'existe plus."
        action={<Button onClick={() => navigate({ to: "/clients" })}>Retour aux clients</Button>}
      />
    );
  }

  const clientOrders = store.orders.filter((o) => o.clientId === client.id);
  const clientQuotes = store.quotes.filter((q) => q.company === client.company);
  const contacts = store.formEntries.filter((f) => f.company === client.company);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/clients" })}>
        <ArrowLeft className="size-4" /> Retour aux clients
      </Button>

      <PageHeader
        title={client.name}
        description={`${client.company} — ${client.city}`}
        actions={
          <>
            <StatusBadge value={client.status} />
            <Button variant="outline" onClick={() => navigate({ to: "/clients", search: { edit: client.id } as never })}>Modifier</Button>
            <Button
              variant="outline"
              onClick={() => {
                store.update("clients", client.id, { status: client.status === "actif" ? "inactif" : "actif" });
                toast.success("Statut du client mis à jour");
              }}
            >
              <Power className="size-4" /> {client.status === "actif" ? "Désactiver" : "Activer"}
            </Button>
            <Button variant="outline" onClick={() => exportCSV(`client-${client.id}`, [{ ...client, commandes: clientOrders.length, devis: clientQuotes.length }], "Fiche client exportée")}>
              <Download className="size-4" /> Exporter
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Commandes", value: String(clientOrders.length) },
          { label: "Devis", value: String(clientQuotes.length) },
          { label: "Chiffre d'affaires", value: formatMAD(client.revenue) },
          { label: "Client depuis", value: formatDate(client.createdAt) },
        ].map((k) => (
          <Card key={k.label} className="surface-card gap-1 p-5">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-display text-xl font-semibold">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Coordonnées">
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted-foreground">Société</dt><dd className="font-medium">{client.company}</dd></div>
            <div><dt className="text-muted-foreground">Type</dt><dd>{client.type}</dd></div>
            <div><dt className="text-muted-foreground">E-mail</dt><dd className="break-all">{client.email}</dd></div>
            <div><dt className="text-muted-foreground">Téléphone</dt><dd>{client.phone}</dd></div>
            <div><dt className="text-muted-foreground">Ville</dt><dd>{client.city}</dd></div>
          </dl>
        </SectionCard>

        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="quotes">Devis</TabsTrigger>
              <TabsTrigger value="contacts">Demandes de contact</TabsTrigger>
              <TabsTrigger value="notes">Notes internes</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <SectionCard>
                {clientOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune commande enregistrée.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>N°</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientOrders.map((o) => (
                        <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate({ to: "/orders/$id", params: { id: o.id } })}>
                          <TableCell className="font-medium">{o.number}</TableCell>
                          <TableCell>{formatDate(o.date)}</TableCell>
                          <TableCell><StatusBadge value={o.status} /></TableCell>
                          <TableCell className="text-right">{formatMAD(orderTotal(o))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="quotes" className="mt-4">
              <SectionCard>
                {clientQuotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune demande de devis.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>N°</TableHead><TableHead>Objet</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Date</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientQuotes.map((q) => (
                        <TableRow key={q.id} className="cursor-pointer" onClick={() => navigate({ to: "/quotes/$id", params: { id: q.id } })}>
                          <TableCell className="font-medium">{q.number}</TableCell>
                          <TableCell>{q.subject}</TableCell>
                          <TableCell><StatusBadge value={q.status} /></TableCell>
                          <TableCell className="text-right">{formatDate(q.date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <SectionCard>
                {contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune demande de contact.</p>
                ) : (
                  <ul className="space-y-3">
                    {contacts.map((f) => (
                      <li key={f.id} className="rounded-lg border border-border px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{f.form}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(f.date)}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{f.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <SectionCard>
                <div className="space-y-3">
                  {client.notes.map((n, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                      <p className="text-sm">{n.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.author} · {formatDate(n.date)}</p>
                    </div>
                  ))}
                  {client.notes.length === 0 ? <p className="text-sm text-muted-foreground">Aucune note.</p> : null}
                  <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note interne…" />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!note.trim()) return toast.error("La note est vide");
                      store.update("clients", client.id, {
                        notes: [...client.notes, { author: store.session?.name ?? "Vous", text: note, date: new Date().toISOString().slice(0, 10) }],
                      });
                      setNote("");
                      toast.success("Note ajoutée");
                    }}
                  >
                    Ajouter la note
                  </Button>
                </div>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SectionCard title="Activité du client" description="Derniers événements liés à ce compte">
        <ol className="relative space-y-4 border-l border-border pl-5">
          {[...clientOrders.slice(0, 3).map((o) => ({ label: `Commande ${o.number} — ${o.status}`, date: o.date })),
            ...clientQuotes.slice(0, 3).map((q) => ({ label: `Devis ${q.number} — ${q.status}`, date: q.date }))]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-accent" />
                <p className="text-sm">{e.label}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
              </li>
            ))}
        </ol>
      </SectionCard>
    </div>
  );
}
