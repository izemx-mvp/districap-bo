import { exportCSV } from "@/lib/export";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revenueSeries } from "@/lib/mock-data";
import { formatMAD, orderTotal, useStore } from "@/lib/store";

export const Route = createFileRoute("/reporting")({
  head: () => ({
    meta: [
      { title: "Reporting — Back-office DISTRICAP" },
      { name: "description", content: "Indicateurs consolidés des sites e-commerce et vitrine DISTRICAP." },
      { property: "og:title", content: "Reporting — Back-office DISTRICAP" },
      { property: "og:description", content: "Chiffre d'affaires, conversion des devis et top produits." },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportingPage />
    </AppShell>
  ),
});

const palette = ["oklch(0.55 0.15 245)", "oklch(0.72 0.14 200)", "oklch(0.62 0.12 160)", "oklch(0.75 0.14 75)", "oklch(0.6 0.16 25)"];

function ReportingPage() {
  const store = useStore();
  const [period, setPeriod] = useState("12 derniers mois");

  const ca = store.orders.reduce((s, o) => s + orderTotal(o), 0);
  const accepted = store.quotes.filter((q) => q.status === "Accepté").length;
  const conversion = store.quotes.length ? Math.round((accepted / store.quotes.length) * 100) : 0;
  const basket = store.orders.length ? ca / store.orders.length : 0;

  const byCategory = store.categories.filter((c) => c.parentId === null).map((c, i) => ({
    name: c.name,
    value: store.products.filter((p) => p.categoryId === c.id).length,
    fill: palette[i % palette.length],
  }));

  const topProducts = [...store.products]
    .map((p) => ({
      name: p.name,
      ventes: store.orders.reduce((s, o) => s + o.items.filter((it) => it.productId === p.id).reduce((a, it) => a + it.qty, 0), 0),
      ca: store.orders.reduce((s, o) => s + o.items.filter((it) => it.productId === p.id).reduce((a, it) => a + it.qty * it.unitPrice, 0), 0),
    }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 8);

  const bySource = [
    { name: "E-commerce", value: store.quotes.filter((q) => q.source === "E-commerce").length, fill: palette[0] },
    { name: "Site vitrine", value: store.quotes.filter((q) => q.source === "Site vitrine").length, fill: palette[1] },
  ];

  const byCommercial = [...new Set(store.quotes.map((q) => q.assignee).filter(Boolean))].map((name) => ({
    name: name as string,
    devis: store.quotes.filter((q) => q.assignee === name).length,
    acceptés: store.quotes.filter((q) => q.assignee === name && q.status === "Accepté").length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting"
        description="Vision consolidée de l'activité commerciale et éditoriale."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["30 derniers jours", "3 derniers mois", "12 derniers mois", "Année en cours"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { toast.success("Rapport prêt — utilisez « Enregistrer en PDF »"); setTimeout(() => window.print(), 300); }}>
              <Download className="size-4" /> Exporter
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: formatMAD(ca), sub: `${store.orders.length} commandes` },
          { label: "Panier moyen", value: formatMAD(Math.round(basket)), sub: period },
          { label: "Taux de conversion devis", value: `${conversion} %`, sub: `${accepted} devis acceptés` },
          { label: "Nouveaux clients", value: String(store.clients.length), sub: "Base consolidée" },
        ].map((k) => (
          <Card key={k.label} className="surface-card gap-1 p-5">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-display text-2xl font-semibold">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Évolution du chiffre d'affaires" description={period}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="caFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette[1]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={palette[1]} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatMAD(v)} />
              <Area type="monotone" dataKey="ca" stroke={palette[0]} fill="url(#caFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Commandes et devis" description="Volumes mensuels comparés">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="commandes" stroke={palette[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="devis" stroke={palette[1]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Répartition du catalogue" description="Produits par catégorie">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {byCategory.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Origine des demandes de devis" description="E-commerce vs site vitrine">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={bySource} dataKey="value" nameKey="name" outerRadius={95}>
                {bySource.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Performance par commercial" description="Devis traités et acceptés">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCommercial}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="devis" fill={palette[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="acceptés" fill={palette[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top produits" description="Meilleures ventes sur la période">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Produit</TableHead><TableHead className="text-right">Quantités</TableHead><TableHead className="text-right">CA généré</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">{p.ventes}</TableCell>
                  <TableCell className="text-right">{formatMAD(p.ca)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </div>
  );
}
