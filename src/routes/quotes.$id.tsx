import { pickFile } from "@/lib/export";
import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Archive, ArrowLeft, BellRing, Paperclip, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { commercials, type Quote } from "@/lib/mock-data";
import { formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/quotes/$id")({
  head: () => ({
    meta: [
      { title: "Détail devis — Back-office DISTRICAP" },
      { name: "description", content: "Traitement d'une demande de devis DISTRICAP." },
      { property: "og:title", content: "Détail devis — Back-office DISTRICAP" },
      { property: "og:description", content: "Contact, besoin, assignation et historique." },
    ],
  }),
  component: () => (
    <AppShell>
      <QuoteDetail />
    </AppShell>
  ),
});

const statuses: Quote["status"][] = [
  "Nouveau", "À traiter", "En cours", "Devis préparé", "Devis envoyé", "Relance", "Accepté", "Refusé", "Clôturé",
];

function QuoteDetail() {
  const store = useStore();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/quotes/$id" });
  const quote = store.quotes.find((q) => q.id === id);
  const [note, setNote] = useState("");

  if (!quote) {
    return (
      <EmptyState
        title="Devis introuvable"
        description="Cette demande a peut-être été archivée."
        action={<Button onClick={() => navigate({ to: "/quotes" })}>Retour aux devis</Button>}
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const push = (patch: Partial<Quote>, label: string) => {
    store.update("quotes", quote.id, {
      ...patch,
      history: [...quote.history, { label, date: today, author: store.session?.name ?? "Vous" }],
    });
    toast.success(label);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/quotes" })}>
        <ArrowLeft className="size-4" /> Retour aux devis
      </Button>

      <PageHeader
        title={quote.number}
        description={`${quote.company} — reçu le ${formatDate(quote.date)} depuis le ${quote.source.toLowerCase()}`}
        actions={
          <>
            <StatusBadge value={quote.status} />
            <Select value={quote.status} onValueChange={(v) => push({ status: v as Quote["status"] }, `Statut : ${v}`)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={quote.assignee ?? "none"} onValueChange={(v) => push({ assignee: v === "none" ? null : v }, `Assigné à ${v}`)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Assigner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non assigné</SelectItem>
                {commercials.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => push({ status: "Devis envoyé" }, "Devis marqué comme envoyé")}>
              <Send className="size-4" /> Marquer comme envoyé
            </Button>
            <Button variant="outline" onClick={() => push({ status: "Relance" }, "Relance programmée")}>
              <BellRing className="size-4" /> Programmer une relance
            </Button>
            <Button variant="outline" onClick={() => pickFile(".pdf,.doc,.docx,.xls,.xlsx", (f) => push({ attachments: [...quote.attachments, f.name] }, `Devis importé : ${f.name}`))}>
              <Upload className="size-4" /> Importer un devis
            </Button>
            <Button variant="outline" onClick={() => push({ status: "Clôturé" }, "Devis archivé")}>
              <Archive className="size-4" /> Archiver
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Besoin exprimé">
            <p className="text-sm leading-relaxed">{quote.message}</p>
            <ul className="mt-4 space-y-2">
              {quote.lines.map((l, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{l.label}</span>
                  <span className="text-muted-foreground">Quantité : {l.qty}</span>
                </li>
              ))}
            </ul>
            {quote.attachments.length ? (
              <div className="mt-4 space-y-2">
                {quote.attachments.map((a) => (
                  <div key={a} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <Paperclip className="size-4 text-accent" /> {a}
                  </div>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Notes internes">
            <div className="space-y-3">
              {quote.notes.map((n, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <p className="text-sm">{n.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.author} · {formatDate(n.date)}</p>
                </div>
              ))}
              {quote.notes.length === 0 ? <p className="text-sm text-muted-foreground">Aucune note.</p> : null}
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note interne…" />
              <Button
                size="sm"
                onClick={() => {
                  if (!note.trim()) return toast.error("La note est vide");
                  store.update("quotes", quote.id, {
                    notes: [...quote.notes, { author: store.session?.name ?? "Vous", text: note, date: today }],
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
          <SectionCard title="Contact">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Nom</dt><dd className="font-medium">{quote.contact}</dd></div>
              <div><dt className="text-muted-foreground">Société</dt><dd>{quote.company}</dd></div>
              <div><dt className="text-muted-foreground">Téléphone</dt><dd>{quote.phone}</dd></div>
              <div><dt className="text-muted-foreground">E-mail</dt><dd className="break-all">{quote.email}</dd></div>
              <div><dt className="text-muted-foreground">Source</dt><dd>{quote.source}</dd></div>
              <div><dt className="text-muted-foreground">Commercial</dt><dd>{quote.assignee ?? "Non assigné"}</dd></div>
            </dl>
          </SectionCard>

          <SectionCard title="Historique">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {quote.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-accent" />
                  <p className="text-sm">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.author} · {formatDate(h.date)}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
