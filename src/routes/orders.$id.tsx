import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Download, Printer, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order } from "@/lib/mock-data";
import { formatDate, formatMAD, orderTotal, useStore } from "@/lib/store";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Détail commande — Back-office DISTRICAP" },
      { name: "description", content: "Détail d'une commande DISTRICAP : articles, statut et historique." },
      { property: "og:title", content: "Détail commande — Back-office DISTRICAP" },
      { property: "og:description", content: "Suivi complet de la commande client." },
    ],
  }),
  component: () => (
    <AppShell>
      <OrderDetail />
    </AppShell>
  ),
});

const statuses: Order["status"][] = ["Nouvelle", "Confirmée", "En préparation", "Expédiée", "Livrée", "Annulée"];

function OrderDetail() {
  const store = useStore();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/orders/$id" });
  const order = store.orders.find((o) => o.id === id);
  const [note, setNote] = useState("");

  if (!order) {
    return (
      <EmptyState
        title="Commande introuvable"
        description="Cette commande a peut-être été supprimée."
        action={<Button onClick={() => navigate({ to: "/orders" })}>Retour aux commandes</Button>}
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const subtotal = order.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const setStatus = (status: Order["status"]) => {
    store.update("orders", order.id, {
      status,
      history: [...order.history, { label: `Statut passé à ${status}`, date: today, author: store.session?.name ?? "Vous" }],
    });
    store.logActivity("a changé le statut de la commande", "Commandes", order.number, "/orders");
    toast.success(`Statut mis à jour : ${status}`);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/orders" })}>
        <ArrowLeft className="size-4" /> Retour aux commandes
      </Button>

      <PageHeader
        title={order.number}
        description={`Commande du ${formatDate(order.date)} — ${order.clientName}`}
        actions={
          <>
            <StatusBadge value={order.status} />
            <Select value={order.status} onValueChange={(v) => setStatus(v as Order["status"])}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setStatus("Confirmée")}>
              <Check className="size-4" /> Confirmer
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Imprimer
            </Button>
            <Button variant="outline" onClick={() => toast.success("Commande exportée en PDF")}>
              <Download className="size-4" /> Exporter
            </Button>
            <Button variant="outline" onClick={() => setStatus("Annulée")}>
              <X className="size-4" /> Annuler
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Articles commandés">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((i) => (
                  <TableRow key={i.productId}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.qty}</TableCell>
                    <TableCell>{formatMAD(i.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatMAD(i.qty * i.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatMAD(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{order.shipping ? formatMAD(order.shipping) : "Offerte"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Remise</span><span>-{formatMAD(order.discount)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-display text-base font-semibold">
                <span>Total</span><span>{formatMAD(orderTotal(order))}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notes internes">
            <div className="space-y-3">
              {order.notes.map((n, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <p className="text-sm">{n.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.author} · {formatDate(n.date)}</p>
                </div>
              ))}
              {order.notes.length === 0 ? <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p> : null}
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note interne…" />
              <Button
                size="sm"
                onClick={() => {
                  if (!note.trim()) return toast.error("La note est vide");
                  store.update("orders", order.id, {
                    notes: [...order.notes, { author: store.session?.name ?? "Vous", text: note, date: today }],
                  });
                  setNote("");
                  toast.success("Note ajoutée");
                }}
              >
                Ajouter la note
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Client">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Nom</dt><dd className="font-medium">{order.clientName}</dd></div>
              <div><dt className="text-muted-foreground">Téléphone</dt><dd>{order.phone}</dd></div>
              <div><dt className="text-muted-foreground">Adresse de livraison</dt><dd>{order.address}</dd></div>
              <div><dt className="text-muted-foreground">Mode de paiement</dt><dd>{order.payment}</dd></div>
            </dl>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate({ to: "/clients/$id", params: { id: order.clientId } })}>
              Voir la fiche client
            </Button>
          </SectionCard>

          <SectionCard title="Suivi du statut">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {statuses.slice(0, 5).map((s) => {
                const reached = statuses.indexOf(order.status) >= statuses.indexOf(s) && order.status !== "Annulée";
                return (
                  <li key={s} className="relative">
                    <span className={`absolute top-1 -left-[25px] size-2.5 rounded-full border-2 border-background ${reached ? "bg-accent" : "bg-border"}`} />
                    <p className={`text-sm ${reached ? "font-medium" : "text-muted-foreground"}`}>{s}</p>
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          <SectionCard title="Historique">
            <ul className="space-y-3 text-sm">
              {order.history.map((h, i) => (
                <li key={i}>
                  <p>{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.author} · {formatDate(h.date)}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
