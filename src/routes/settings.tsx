import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — Back-office DISTRICAP" },
      { name: "description", content: "Configuration générale des deux sites DISTRICAP." },
      { property: "og:title", content: "Paramètres — Back-office DISTRICAP" },
      { property: "og:description", content: "Société, e-commerce, contenus, notifications et apparence." },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

function SettingsPage() {
  const store = useStore();
  const s = store.settings;
  const [draft, setDraft] = useState<Record<string, string | boolean>>(s);

  const text = (key: string) => String(draft[key] ?? "");
  const bool = (key: string) => Boolean(draft[key]);
  const set = (key: string, value: string | boolean) => setDraft({ ...draft, [key]: value });

  const save = () => {
    store.setSettings(draft);
    store.logActivity("a mis à jour les", "Paramètres", "paramètres généraux", "/settings");
    toast.success("Paramètres enregistrés");
  };

  const Toggle = ({ label, description, k }: { label: string; description: string; k: string }) => (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={bool(k)} onCheckedChange={(v) => set(k, v)} />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configuration partagée par le site e-commerce et le site vitrine."
        actions={<Button onClick={save}><Save className="size-4" /> Enregistrer</Button>}
      />

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Société</TabsTrigger>
          <TabsTrigger value="shop">E-commerce</TabsTrigger>
          <TabsTrigger value="content">Contenus</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4 space-y-4">
          <SectionCard title="Informations de l'entreprise" description="Affichées sur les deux sites">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Raison sociale</Label><Input value={text("companyName")} onChange={(e) => set("companyName", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>E-mail de contact</Label><Input value={text("email")} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Téléphone</Label><Input value={text("phone")} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Adresse</Label><Input value={text("address")} onChange={(e) => set("address", e.target.value)} /></div>
            </div>
          </SectionCard>
          <SectionCard title="Réseaux sociaux" description="Liens affichés dans le pied de page">
            <div className="grid gap-4 sm:grid-cols-2">
              {["LinkedIn", "Facebook", "Instagram", "YouTube"].map((n) => (
                <div key={n} className="space-y-1.5">
                  <Label>{n}</Label>
                  <Input value={text(`social${n}`)} onChange={(e) => set(`social${n}`, e.target.value)} placeholder={`https://${n.toLowerCase()}.com/districap`} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="shop" className="mt-4 space-y-4">
          <SectionCard title="Paramètres commerciaux">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Devise</Label>
                <Select value={text("currency")} onValueChange={(v) => set("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["MAD", "EUR", "USD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>TVA (%)</Label><Input value={text("vat")} onChange={(e) => set("vat", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Frais de livraison (MAD)</Label><Input value={text("shipping")} onChange={(e) => set("shipping", e.target.value)} placeholder="450" /></div>
              <div className="space-y-1.5"><Label>Franco de port à partir de (MAD)</Label><Input value={text("freeShipping")} onChange={(e) => set("freeShipping", e.target.value)} placeholder="25000" /></div>
            </div>
            <div className="mt-4 space-y-3">
              <Toggle label="Commande en ligne" description="Autoriser l'ajout au panier et la commande directe" k="ecommerceOnline" />
              <Toggle label="Demande de devis" description="Afficher le bouton « Demander un devis » sur les fiches produit" k="quoteNotifications" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-4">
          <SectionCard title="État des sites">
            <div className="space-y-3">
              <Toggle label="Site e-commerce en ligne" description="Rendre la boutique accessible aux visiteurs" k="ecommerceOnline" />
              <Toggle label="Site vitrine en ligne" description="Rendre le site institutionnel accessible" k="vitrineOnline" />
              <Toggle label="Mode maintenance" description="Afficher une page de maintenance sur les deux sites" k="maintenance" />
            </div>
          </SectionCard>
          <SectionCard title="Référencement par défaut">
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Titre SEO par défaut</Label><Input value={text("seoTitle")} onChange={(e) => set("seoTitle", e.target.value)} placeholder="DISTRICAP — Distribution de solutions audiovisuelles professionnelles" /></div>
              <div className="space-y-1.5"><Label>Meta description par défaut</Label><Textarea rows={3} value={text("seoDescription")} onChange={(e) => set("seoDescription", e.target.value)} placeholder="Distributeur de solutions AV, visioconférence et affichage dynamique au Maroc." /></div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <SectionCard title="Alertes internes">
            <div className="space-y-3">
              <Toggle label="Nouvelles commandes" description="Notifier l'équipe à chaque commande reçue" k="orderNotifications" />
              <Toggle label="Demandes de devis" description="Notifier les commerciaux des nouvelles demandes" k="quoteNotifications" />
              <Toggle label="Double opt-in newsletter" description="Demander une confirmation par e-mail à l'inscription" k="newsletterDouble" />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label>E-mails destinataires des alertes</Label>
              <Input value={text("alertEmails")} onChange={(e) => set("alertEmails", e.target.value)} placeholder="commercial@districap.ma, admin@districap.ma" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <SectionCard title="Apparence du back-office">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Thème sombre</p>
                <p className="text-xs text-muted-foreground">Bascule l'interface en mode nuit</p>
              </div>
              <Switch checked={store.theme === "dark"} onCheckedChange={() => store.toggleTheme()} />
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Logo DISTRICAP (SVG ou PNG, fond transparent)
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save}><Save className="size-4" /> Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
