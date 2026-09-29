import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useStore } from "@/lib/store";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Journal d'activité — Back-office DISTRICAP" },
      { name: "description", content: "Historique des actions réalisées par les équipes DISTRICAP." },
      { property: "og:title", content: "Journal d'activité — Back-office DISTRICAP" },
      { property: "og:description", content: "Traçabilité par utilisateur, module et action." },
    ],
  }),
  component: () => (
    <AppShell>
      <ActivityPage />
    </AppShell>
  ),
});

function ActivityPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [user, setUser] = useState("Tous");
  const [module, setModule] = useState("Tous");

  const users = ["Tous", ...new Set(store.activity.map((a) => a.user))];
  const modules = ["Tous", ...new Set(store.activity.map((a) => a.module))];

  const rows = store.activity.filter(
    (a) =>
      (user === "Tous" || a.user === user) &&
      (module === "Tous" || a.module === module) &&
      `${a.user} ${a.action} ${a.target} ${a.module}`.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activité"
        description={`${store.activity.length} actions enregistrées sur les deux plateformes.`}
        actions={
          <Button variant="outline" onClick={() => toast.success("Journal exporté au format CSV")}>
            <Download className="size-4" /> Exporter
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Rechercher une action…" className="pl-9" />
        </div>
        <Select value={user} onValueChange={setUser}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Utilisateur" /></SelectTrigger>
          <SelectContent>{users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={module} onValueChange={setModule}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>{modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <SectionCard title="Historique chronologique">
        {rows.length === 0 ? (
          <EmptyState title="Aucune action trouvée" description="Ajustez les filtres pour élargir la recherche." />
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-6">
            {rows.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute top-1.5 -left-[29px] size-3 rounded-full border-2 border-background bg-accent" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{a.user}</span>
                  <span className="text-sm text-muted-foreground">{a.action}</span>
                  <button
                    className="text-sm font-medium text-accent hover:underline"
                    onClick={() => navigate({ to: a.link })}
                  >
                    {a.target}
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.module} · {a.time}</p>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
