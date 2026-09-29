import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Eye, MoreHorizontal, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "@/lib/mock-data";
import { formatDate, formatMAD, orderTotal, useStore } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Commandes — Back-office DISTRICAP" },
      { name: "description", content: "Suivez et traitez les commandes du site e-commerce DISTRICAP." },
      { property: "og:title", content: "Commandes — Back-office DISTRICAP" },
      { property: "og:description", content: "Statuts, montants et suivi des expéditions." },
    ],
  }),
  component: () => (
    <AppShell>
      <OrdersPage />
    </AppShell>
  ),
});

const statuses: Order["status"][] = ["Nouvelle", "Confirmée", "En préparation", "Expédiée", "Livrée", "Annulée"];

function OrdersPage() {
  const store = useStore();
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const columns: Column<Order>[] = [
    { key: "number", label: "N° commande", value: (o) => o.number, sortable: true, render: (o) => <span className="font-medium">{o.number}</span> },
    { key: "date", label: "Date", value: (o) => o.date, sortable: true, render: (o) => formatDate(o.date) },
    { key: "client", label: "Client", value: (o) => o.clientName, sortable: true },
    { key: "phone", label: "Téléphone", value: (o) => o.phone, optional: true },
    { key: "items", label: "Articles", value: (o) => o.items.reduce((s, i) => s + i.qty, 0) },
    { key: "total", label: "Total", value: (o) => orderTotal(o), sortable: true, render: (o) => <span className="font-medium">{formatMAD(orderTotal(o))}</span> },
    { key: "payment", label: "Paiement", value: (o) => o.payment, optional: true },
    { key: "status", label: "Statut", value: (o) => o.status, sortable: true, render: (o) => <StatusBadge value={o.status} /> },
  ];

  const counts = statuses.map((s) => ({ s, n: store.orders.filter((o) => o.status === s).length }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description={`${store.orders.length} commandes enregistrées sur le site e-commerce.`}
        actions={
          <Button variant="outline" onClick={() => toast.success("Export CSV généré")}>
            <Download className="size-4" /> Exporter
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {counts.map((c) => (
          <Card key={c.s} className="surface-card gap-1 p-4">
            <p className="font-display text-xl font-semibold">{c.n}</p>
            <StatusBadge value={c.s} />
          </Card>
        ))}
      </div>

      <DataTable
        rows={store.orders}
        columns={columns}
        search={(o, t) => `${o.number} ${o.clientName} ${o.phone}`.toLowerCase().includes(t)}
        filters={[
          { key: "status", label: "Statut", options: statuses, match: (o, v) => o.status === v },
          { key: "payment", label: "Paiement", options: ["Virement", "Carte bancaire", "Chèque", "À la livraison"], match: (o, v) => o.payment === v },
        ]}
        onRowClick={(o) => navigate({ to: "/orders/$id", params: { id: o.id } })}
        bulkActions={(ids, clear) => (
          <>
            <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => store.update("orders", id, { status: "Confirmée" })); toast.success(`${ids.length} commande(s) confirmée(s)`); clear(); }}>
              Confirmer
            </Button>
            <Button size="sm" variant="outline" onClick={() => { toast.success(`${ids.length} commande(s) exportée(s)`); clear(); }}>
              Exporter
            </Button>
          </>
        )}
        rowActions={(o) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/orders/$id", params: { id: o.id } })}>
                <Eye className="size-4" /> Voir le détail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("orders", o.id, { status: "Confirmée" }); toast.success("Commande confirmée"); }}>
                Confirmer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { window.print(); }}>
                <Printer className="size-4" /> Imprimer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => confirm("Annuler la commande ?", `${o.number} passera au statut Annulée.`, () => { store.update("orders", o.id, { status: "Annulée" }); toast.success("Commande annulée"); })}
              >
                Annuler la commande
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      {dialog}
    </div>
  );
}
