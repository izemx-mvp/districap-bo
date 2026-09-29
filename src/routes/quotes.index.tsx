import { exportCSV } from "@/lib/export";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Eye, MoreHorizontal, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { commercials, type Quote } from "@/lib/mock-data";
import { formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/quotes/")({
  head: () => ({
    meta: [
      { title: "Demandes de devis — Back-office DISTRICAP" },
      { name: "description", content: "Centralisez les demandes de devis du site e-commerce et du site vitrine." },
      { property: "og:title", content: "Demandes de devis — Back-office DISTRICAP" },
      { property: "og:description", content: "Assignation commerciale, suivi et relances." },
    ],
  }),
  component: () => (
    <AppShell>
      <QuotesPage />
    </AppShell>
  ),
});

const statuses: Quote["status"][] = [
  "Nouveau", "À traiter", "En cours", "Devis préparé", "Devis envoyé", "Relance", "Accepté", "Refusé", "Clôturé",
];

function QuotesPage() {
  const store = useStore();
  const navigate = useNavigate();

  const assign = (q: Quote, who: string) => {
    store.update("quotes", q.id, { assignee: who, status: q.status === "Nouveau" ? "À traiter" : q.status });
    store.logActivity("a assigné le devis", "Devis", q.number, "/quotes");
    toast.success(`Devis assigné à ${who}`);
  };

  const columns: Column<Quote>[] = [
    { key: "number", label: "N° devis", value: (q) => q.number, sortable: true, render: (q) => <span className="font-medium">{q.number}</span> },
    { key: "date", label: "Date", value: (q) => q.date, sortable: true, render: (q) => formatDate(q.date) },
    { key: "contact", label: "Contact", value: (q) => q.contact, sortable: true },
    { key: "company", label: "Société", value: (q) => q.company, sortable: true },
    { key: "phone", label: "Téléphone", value: (q) => q.phone, optional: true },
    { key: "email", label: "E-mail", value: (q) => q.email, optional: true },
    { key: "source", label: "Source", value: (q) => q.source, render: (q) => <StatusBadge value={q.source} tone={q.source === "E-commerce" ? "info" : "accent"} /> },
    { key: "subject", label: "Produit / solution", value: (q) => q.subject },
    { key: "assignee", label: "Commercial", render: (q) => q.assignee ?? <span className="text-warning">Non assigné</span> },
    { key: "status", label: "Statut", value: (q) => q.status, sortable: true, render: (q) => <StatusBadge value={q.status} /> },
  ];

  const actions = (q: Quote) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate({ to: "/quotes/$id", params: { id: q.id } })}>
          <Eye className="size-4" /> Ouvrir le devis
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Assigner à</DropdownMenuLabel>
        {commercials.map((c) => (
          <DropdownMenuItem key={c} onClick={() => assign(q, c)}>
            <UserCheck className="size-4" /> {c}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { store.update("quotes", q.id, { status: "Devis envoyé" }); toast.success("Marqué comme envoyé"); }}>
          Marquer comme envoyé
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("quotes", q.id, { status: "Relance" }); toast.success("Relance programmée"); }}>
          Programmer une relance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { store.update("quotes", q.id, { status: "Clôturé" }); toast.success("Devis archivé"); }}>
          Archiver
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de devis"
        description={`${store.quotes.length} demandes centralisées depuis les deux sites.`}
        actions={
          <Button variant="outline" onClick={() => exportCSV("devis", store.quotes.map(({ history, notes, ...q }) => q), "Export des devis généré")}>
            <Download className="size-4" /> Exporter
          </Button>
        }
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <DataTable
            rows={store.quotes}
            columns={columns}
            pageSize={10}
            search={(q, t) => `${q.number} ${q.contact} ${q.company} ${q.subject}`.toLowerCase().includes(t)}
            filters={[
              { key: "status", label: "Statut", options: statuses, match: (q, v) => q.status === v },
              { key: "source", label: "Source", options: ["E-commerce", "Site vitrine"], match: (q, v) => q.source === v },
              { key: "assignee", label: "Commercial", options: [...commercials, "Non assigné"], match: (q, v) => (v === "Non assigné" ? !q.assignee : q.assignee === v) },
            ]}
            onRowClick={(q) => navigate({ to: "/quotes/$id", params: { id: q.id } })}
            bulkActions={(ids, clear) => (
              <>
                <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => store.update("quotes", id, { assignee: commercials[0] })); toast.success(`${ids.length} devis assignés à ${commercials[0]}`); clear(); }}>
                  Assigner à {commercials[0]}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => store.update("quotes", id, { status: "Clôturé" })); toast.success(`${ids.length} devis archivés`); clear(); }}>
                  Archiver
                </Button>
              </>
            )}
            rowActions={actions}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {statuses.map((s) => {
                const items = store.quotes.filter((q) => q.status === s);
                return (
                  <div key={s} className="w-72 shrink-0">
                    <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                      <span className="text-sm font-medium">{s}</span>
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((q) => (
                        <Card
                          key={q.id}
                          className="surface-card cursor-pointer gap-2 p-3 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                          onClick={() => navigate({ to: "/quotes/$id", params: { id: q.id } })}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{q.number}</span>
                            <StatusBadge value={q.source} tone={q.source === "E-commerce" ? "info" : "accent"} />
                          </div>
                          <p className="text-sm font-medium">{q.company}</p>
                          <p className="truncate text-xs text-muted-foreground">{q.subject}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{q.assignee ?? "Non assigné"}</span>
                            <span>{formatDate(q.date)}</span>
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {statuses.indexOf(s) > 0 ? (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { store.update("quotes", q.id, { status: statuses[statuses.indexOf(s) - 1] }); toast.success("Devis déplacé"); }}>
                                ←
                              </Button>
                            ) : null}
                            {statuses.indexOf(s) < statuses.length - 1 ? (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { store.update("quotes", q.id, { status: statuses[statuses.indexOf(s) + 1] }); toast.success("Devis déplacé"); }}>
                                →
                              </Button>
                            ) : null}
                          </div>
                        </Card>
                      ))}
                      {items.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                          Aucun devis
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
