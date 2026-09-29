import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  FileSpreadsheet,
  Inbox,
  Layers,
  Lightbulb,
  Mail,
  Package,
  Percent,
  ShoppingCart,
  Tags,
  Trophy,
  UserPlus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AnimatedNetwork } from "@/components/animated-network";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revenueSeries } from "@/lib/mock-data";
import { formatMAD, orderTotal, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Back-office DISTRICAP" },
      {
        name: "description",
        content:
          "Pilotez le catalogue, les commandes, les devis et les contenus des sites DISTRICAP depuis un tableau de bord unique.",
      },
      { property: "og:title", content: "Tableau de bord — Back-office DISTRICAP" },
      {
        property: "og:description",
        content: "Vue consolidée du site e-commerce et du site vitrine DISTRICAP.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

const periods = ["Aujourd'hui", "7 jours", "30 jours", "Ce mois", "Cette année"];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={points}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  spark,
  onClick,
}: {
  label: string;
  value: string;
  delta: number;
  icon: React.ElementType;
  spark?: number[];
  onClick?: () => void;
}) {
  const up = delta >= 0;
  return (
    <Card
      onClick={onClick}
      className={cn(
        "surface-card gap-3 p-5 transition-all",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lift",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-lg bg-accent/12 p-2 text-accent">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            up ? "text-success" : "text-destructive",
          )}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {up ? "+" : ""}
          {delta}% <span className="text-muted-foreground">vs période précédente</span>
        </span>
        {spark ? (
          <div className="w-20">
            <Sparkline data={spark} color={up ? "var(--color-success)" : "var(--color-destructive)"} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30 jours");

  const go = (to: string, search?: Record<string, unknown>) =>
    navigate({ to: to as never, search: search as never });

  const kpis = useMemo(() => {
    const activeProducts = store.products.filter((p) => p.status === "actif").length;
    const promoProducts = store.products.filter((p) => p.promo).length;
    const newOrders = store.orders.filter((o) => o.status === "Nouvelle").length;
    const inProgress = store.orders.filter((o) =>
      ["Confirmée", "En préparation", "Expédiée"].includes(o.status),
    ).length;
    const openQuotes = store.quotes.filter((q) => !["Clôturé", "Refusé"].includes(q.status)).length;
    const unreadForms = store.formEntries.filter((f) => !f.read).length;
    const subs = store.subscribers.filter((s) => s.status === "abonné").length;
    return [
      { label: "Produits au catalogue", value: String(store.products.length), delta: 6, icon: Package, spark: [22, 26, 25, 30, 33, 36, 38], to: "/products" },
      { label: "Produits actifs", value: String(activeProducts), delta: 4, icon: Boxes, spark: [18, 21, 22, 26, 28, 30, 32], to: "/products" },
      { label: "Produits en promotion", value: String(promoProducts), delta: 12, icon: Percent, spark: [4, 6, 5, 8, 9, 11, 12], to: "/products" },
      { label: "Nouvelles commandes", value: String(newOrders), delta: 18, icon: ShoppingCart, spark: [1, 2, 1, 3, 2, 3, 4], to: "/orders" },
      { label: "Commandes en cours", value: String(inProgress), delta: -5, icon: ShoppingCart, spark: [9, 8, 10, 9, 7, 8, 7], to: "/orders" },
      { label: "Demandes de devis", value: String(openQuotes), delta: 22, icon: FileSpreadsheet, spark: [8, 11, 13, 12, 15, 17, 18], to: "/quotes" },
      { label: "Nouveaux clients", value: String(store.clients.filter((c) => c.status === "actif").length), delta: 9, icon: UserPlus, spark: [12, 14, 13, 16, 18, 19, 21], to: "/clients" },
      { label: "Demandes de contact", value: String(unreadForms), delta: 14, icon: Inbox, spark: [2, 3, 5, 4, 6, 5, 7], to: "/forms" },
      { label: "Abonnés newsletter", value: String(subs), delta: 7, icon: Mail, spark: [15, 17, 18, 19, 21, 22, 23], to: "/newsletter" },
    ];
  }, [store.products, store.orders, store.quotes, store.clients, store.formEntries, store.subscribers]);

  const factor = period === "Aujourd'hui" ? 0.04 : period === "7 jours" ? 0.25 : period === "30 jours" ? 1 : period === "Ce mois" ? 0.9 : 3.2;
  const series = revenueSeries.map((r) => ({
    ...r,
    commandes: Math.round(r.commandes * factor),
    devis: Math.round(r.devis * factor),
    ca: Math.round(r.ca * factor),
    clients: Math.round(r.clients * factor),
  }));

  const byCategory = store.categories
    .filter((c) => !c.parentId)
    .map((c) => ({
      name: c.name,
      value: store.products.filter((p) => p.categoryId === c.id).length,
    }))
    .filter((d) => d.value > 0);

  const topBrands = store.brands
    .map((b) => ({ name: b.name, value: store.products.filter((p) => p.brandId === b.id).length }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const topProducts = [...store.products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 6)
    .map((p) => ({ name: p.name.slice(0, 22), value: Math.round(p.price / 1000) }));

  const topSolutions = [...store.solutions].sort((a, b) => b.views - a.views).slice(0, 6);

  const todo = [
    { label: `${store.quotes.filter((q) => !q.assignee).length} devis non assignés`, to: "/quotes", search: { filter: "unassigned" }, tone: "warning" },
    { label: `${store.orders.filter((o) => o.status === "Nouvelle").length} commandes en attente de confirmation`, to: "/orders", search: { status: "Nouvelle" }, tone: "info" },
    { label: `${store.products.filter((p) => !p.hasDatasheet).length} produits sans fiche technique`, to: "/products", search: { filter: "nodoc" }, tone: "neutral" },
    { label: `${store.promotions.filter((p) => p.status === "active").length} promotions actives à surveiller`, to: "/promotions", search: undefined, tone: "accent" },
    { label: `${store.formEntries.filter((f) => !f.read).length} formulaires non lus`, to: "/forms", search: { unread: true }, tone: "danger" },
  ];

  const quickActions = [
    { label: "Ajouter un produit", icon: Package, to: "/products" },
    { label: "Ajouter une catégorie", icon: Layers, to: "/categories" },
    { label: "Ajouter une marque", icon: Tags, to: "/brands" },
    { label: "Créer une promotion", icon: Percent, to: "/promotions" },
    { label: "Voir les commandes", icon: ShoppingCart, to: "/orders" },
    { label: "Voir les devis", icon: FileSpreadsheet, to: "/quotes" },
    { label: "Ajouter une solution", icon: Lightbulb, to: "/solutions" },
    { label: "Ajouter une référence", icon: Trophy, to: "/references" },
  ];

  const pieColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-accent)",
    "var(--color-info)",
    "var(--color-warning)",
  ];

  const tooltipStyle = {
    backgroundColor: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "var(--color-popover-foreground)",
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-primary-foreground">
        <AnimatedNetwork density={40} />
        <div className="pointer-events-none absolute inset-0 brand-gradient opacity-40" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-primary-foreground/60 uppercase">
              Back-office centralisé
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold">
              Bonjour {store.session?.name.split(" ")[0]}, voici l'état de votre écosystème.
            </h1>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Site e-commerce et site vitrine pilotés depuis une seule interface.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="font-display text-xl font-semibold">{formatMAD(series.reduce((s, r) => s + r.ca, 0))}</p>
              <p className="text-xs text-primary-foreground/60">Chiffre d'affaires cumulé</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold">{store.orders.length}</p>
              <p className="text-xs text-primary-foreground/60">Commandes enregistrées</p>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Tableau de bord"
        description="Indicateurs consolidés des deux plateformes DISTRICAP."
        actions={
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              {periods.map((p) => (
                <TabsTrigger key={p} value={p}>
                  {p}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} onClick={() => go(k.to)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Évolution des commandes et devis"
          description={`Période : ${period}`}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gCmd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="commandes" stroke="var(--color-chart-2)" fill="url(#gCmd)" strokeWidth={2} />
              <Area type="monotone" dataKey="devis" stroke="var(--color-chart-1)" fill="url(#gDev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="À traiter en priorité" description="Actions attendues de vos équipes">
          <ul className="space-y-2">
            {todo.map((t) => (
              <li key={t.label}>
                <button
                  onClick={() => go(t.to, t.search)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-all hover:border-accent/50 hover:shadow-soft"
                >
                  <StatusBadge value="•" tone={t.tone as never} />
                  <span className="flex-1">{t.label}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Chiffre d'affaires" description="Évolution mensuelle (MAD)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMAD(v)} />
              <Bar dataKey="ca" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Nouveaux clients" description="Acquisition mensuelle">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="clients" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Produits par catégorie" description="Répartition du catalogue">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <RTooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Top marques" description="Nombre de références">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topBrands} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top produits" description="Valeur catalogue (k MAD)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={110} stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--color-chart-4)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Solutions les plus consultées" description="Site vitrine">
          <ul className="space-y-3">
            {topSolutions.map((s) => {
              const max = topSolutions[0].views;
              return (
                <li key={s.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{s.title}</span>
                    <span className="text-muted-foreground">{s.views.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full brand-gradient"
                      style={{ width: `${(s.views / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Activité récente" description="Derniers événements des deux sites" className="lg:col-span-2">
          <ol className="relative space-y-4 border-l border-border pl-5">
            {store.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-accent" />
                <button
                  onClick={() => go(a.link)}
                  className="w-full text-left transition-colors hover:text-accent"
                >
                  <p className="text-sm">
                    <span className="font-medium">{a.user}</span> {a.action}{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.module} · {a.time}
                  </p>
                </button>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="Actions rapides" description="Raccourcis vers les modules clés">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                variant="outline"
                className="h-auto flex-col items-start gap-2 py-3 text-left whitespace-normal"
                onClick={() => go(a.to, { new: true })}
              >
                <a.icon className="size-4 text-accent" />
                <span className="text-xs leading-snug">{a.label}</span>
              </Button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
