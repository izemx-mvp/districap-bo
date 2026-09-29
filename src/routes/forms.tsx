import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MoreHorizontal, Reply } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { FormEntry } from "@/lib/mock-data";
import { formatDate, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forms")({
  head: () => ({
    meta: [
      { title: "Formulaires — Back-office DISTRICAP" },
      { name: "description", content: "Toutes les demandes reçues depuis les formulaires des deux sites." },
      { property: "og:title", content: "Formulaires — Back-office DISTRICAP" },
      { property: "og:description", content: "Contact, devis rapide, rappel et support technique." },
    ],
  }),
  component: () => (
    <AppShell>
      <FormsPage />
    </AppShell>
  ),
});

const formTypes: FormEntry["form"][] = ["Contact", "Devis rapide", "Rappel téléphonique", "Support technique"];

function FormsPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [detail, setDetail] = useState<FormEntry | null>(null);
  const [reply, setReply] = useState("");

  const unread = store.formEntries.filter((f) => !f.read).length;

  const columns: Column<FormEntry>[] = [
    { key: "form", label: "Formulaire", value: (f) => f.form, render: (f) => (
      <span className={cn("font-medium", !f.read && "text-foreground")}>{f.form}</span>
    ) },
    { key: "name", label: "Expéditeur", value: (f) => f.name, sortable: true, render: (f) => (
      <div className="flex items-center gap-2">
        {!f.read ? <span className="size-1.5 rounded-full bg-accent" /> : null}
        <div>
          <p className={cn("text-sm", !f.read && "font-semibold")}>{f.name}</p>
          <p className="text-xs text-muted-foreground">{f.company}</p>
        </div>
      </div>
    ) },
    { key: "email", label: "E-mail", value: (f) => f.email, optional: true },
    { key: "message", label: "Message", render: (f) => <span className="line-clamp-1 max-w-72 text-muted-foreground">{f.message}</span> },
    { key: "source", label: "Source", value: (f) => f.source },
    { key: "date", label: "Date", value: (f) => f.date, sortable: true, render: (f) => formatDate(f.date) },
    { key: "read", label: "Statut", render: (f) => <StatusBadge value={f.read ? "Clôturé" : "Nouvelle"} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formulaires"
        description={`${store.formEntries.length} demandes reçues, ${unread} non lues.`}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              store.formEntries.forEach((f) => store.update("formEntries", f.id, { read: true }));
              toast.success("Toutes les demandes sont marquées comme lues");
            }}
          >
            Tout marquer comme lu
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {formTypes.map((t) => (
          <Card key={t} className="surface-card gap-1 p-5">
            <p className="text-xs text-muted-foreground">{t}</p>
            <p className="font-display text-xl font-semibold">{store.formEntries.filter((f) => f.form === t).length}</p>
          </Card>
        ))}
      </div>

      <DataTable
        rows={store.formEntries}
        columns={columns}
        search={(f, t) => `${f.name} ${f.company} ${f.email} ${f.message}`.toLowerCase().includes(t)}
        filters={[
          { key: "form", label: "Type", options: formTypes, match: (f, v) => f.form === v },
          { key: "source", label: "Source", options: ["E-commerce", "Site vitrine"], match: (f, v) => f.source === v },
          { key: "read", label: "Statut", options: ["Non lue", "Lue"], match: (f, v) => (v === "Lue" ? f.read : !f.read) },
        ]}
        onRowClick={(f) => { setDetail(f); if (!f.read) store.update("formEntries", f.id, { read: true }); }}
        bulkActions={(ids, clear) => (
          <>
            <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => store.update("formEntries", id, { read: true })); clear(); toast.success("Demandes marquées comme lues"); }}>
              Marquer comme lu
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => confirm("Supprimer les demandes ?", `${ids.length} demandes seront supprimées.`, () => { ids.forEach((id) => store.remove("formEntries", id)); clear(); toast.success("Demandes supprimées"); })}
            >
              Supprimer
            </Button>
          </>
        )}
        rowActions={(f) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetail(f)}>Voir la demande</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { store.update("formEntries", f.id, { read: !f.read }); toast.success("Statut mis à jour"); }}>
                {f.read ? "Marquer comme non lue" : "Marquer comme lue"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(`Demande transférée à l'équipe commerciale`)}>Transférer</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => confirm("Supprimer la demande ?", `La demande de ${f.name} sera supprimée.`, () => { store.remove("formEntries", f.id); toast.success("Demande supprimée"); })}>Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) { setDetail(null); setReply(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.form}</DialogTitle>
            <DialogDescription>Reçue le {detail ? formatDate(detail.date) : ""} depuis le site {detail?.source}.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Nom</dt><dd className="font-medium">{detail.name}</dd></div>
                <div><dt className="text-muted-foreground">Société</dt><dd>{detail.company}</dd></div>
                <div><dt className="text-muted-foreground">E-mail</dt><dd className="break-all">{detail.email}</dd></div>
                <div><dt className="text-muted-foreground">Téléphone</dt><dd>{detail.phone}</dd></div>
              </dl>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">{detail.message}</div>
              <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Rédigez votre réponse…" />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              onClick={() => {
                if (!reply.trim()) return toast.error("La réponse est vide");
                if (detail) store.logActivity("a répondu à la demande de", "Formulaires", detail.name, "/forms");
                toast.success("Réponse envoyée");
                setReply("");
                setDetail(null);
              }}
            >
              <Reply className="size-4" /> Envoyer la réponse
            </Button>
            <Button variant="outline" onClick={() => toast.success("Demande convertie en devis")}>
              <Mail className="size-4" /> Convertir en devis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
