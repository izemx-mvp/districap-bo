import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, FileSpreadsheet, Inbox, ShoppingCart, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationItem } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Back-office DISTRICAP" },
      { name: "description", content: "Toutes les alertes des sites e-commerce et vitrine DISTRICAP." },
      { property: "og:title", content: "Notifications — Back-office DISTRICAP" },
      { property: "og:description", content: "Commandes, devis, formulaires et alertes système." },
    ],
  }),
  component: () => (
    <AppShell>
      <NotificationsPage />
    </AppShell>
  ),
});

const icons: Record<NotificationItem["kind"], typeof Bell> = {
  commande: ShoppingCart,
  devis: FileSpreadsheet,
  client: UserPlus,
  formulaire: Inbox,
  système: Bell,
};

const links: Record<NotificationItem["kind"], string> = {
  commande: "/orders",
  devis: "/quotes",
  client: "/clients",
  formulaire: "/forms",
  système: "/",
};

function NotificationsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [prefs, setPrefs] = useState({ commandes: true, devis: true, formulaires: true, systeme: false, email: true });

  const unread = store.notifications.filter((n) => !n.read);

  const list = (rows: NotificationItem[]) =>
    rows.length === 0 ? (
      <EmptyState icon={<Bell className="size-5" />} title="Aucune notification" description="Vous êtes à jour." />
    ) : (
      <ul className="divide-y divide-border">
        {rows.map((n) => {
          const Icon = icons[n.kind];
          return (
            <li
              key={n.id}
              className={cn("flex cursor-pointer items-start gap-3 px-1 py-4 transition hover:bg-muted/50", !n.read && "bg-accent/5")}
              onClick={() => {
                store.update("notifications", n.id, { read: true });
                navigate({ to: links[n.kind] });
              }}
            >
              <span className="rounded-lg bg-muted p-2 text-muted-foreground"><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.module} · {n.time}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); store.remove("notifications", n.id); toast.success("Notification supprimée"); }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          );
        })}
      </ul>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unread.length} notifications non lues sur ${store.notifications.length}.`}
        actions={
          <>
            <Button variant="outline" onClick={() => { store.notifications.forEach((n) => store.update("notifications", n.id, { read: true })); toast.success("Toutes les notifications sont lues"); }}>
              <CheckCheck className="size-4" /> Tout marquer comme lu
            </Button>
            <Button
              variant="outline"
              onClick={() => confirm("Vider les notifications ?", "Toutes les notifications seront supprimées.", () => { store.notifications.forEach((n) => store.remove("notifications", n.id)); toast.success("Notifications supprimées"); })}
            >
              <Trash2 className="size-4" /> Tout effacer
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues ({unread.length})</TabsTrigger>
              <TabsTrigger value="commande">Commandes</TabsTrigger>
              <TabsTrigger value="devis">Devis</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4"><SectionCard>{list(store.notifications)}</SectionCard></TabsContent>
            <TabsContent value="unread" className="mt-4"><SectionCard>{list(unread)}</SectionCard></TabsContent>
            <TabsContent value="commande" className="mt-4"><SectionCard>{list(store.notifications.filter((n) => n.kind === "commande"))}</SectionCard></TabsContent>
            <TabsContent value="devis" className="mt-4"><SectionCard>{list(store.notifications.filter((n) => n.kind === "devis"))}</SectionCard></TabsContent>
          </Tabs>
        </div>

        <SectionCard title="Préférences d'alerte" description="Choisissez les événements à recevoir">
          <div className="space-y-4">
            {([
              ["Nouvelles commandes", "commandes"],
              ["Demandes de devis", "devis"],
              ["Formulaires reçus", "formulaires"],
              ["Alertes système", "systeme"],
              ["Récapitulatif par e-mail", "email"],
            ] as const).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(v) => { setPrefs({ ...prefs, [key]: v }); toast.success("Préférence enregistrée"); }}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      {dialog}
    </div>
  );
}
