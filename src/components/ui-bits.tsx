import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const tones: Record<string, string> = {
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/35 bg-warning/15 text-warning",
  danger: "border-destructive/30 bg-destructive/12 text-destructive",
  info: "border-info/30 bg-info/12 text-info",
  neutral: "border-border bg-muted text-muted-foreground",
  accent: "border-accent/35 bg-accent/12 text-accent",
};

const statusTone: Record<string, keyof typeof tones> = {
  actif: "success",
  active: "success",
  "en stock": "success",
  publié: "success",
  abonné: "success",
  Livrée: "success",
  Accepté: "success",
  Envoyée: "success",
  inactif: "neutral",
  désactivée: "neutral",
  Clôturé: "neutral",
  désabonné: "neutral",
  brouillon: "warning",
  Brouillon: "warning",
  "sur commande": "warning",
  planifiée: "info",
  Planifiée: "info",
  Nouvelle: "info",
  Nouveau: "info",
  "À traiter": "warning",
  "En cours": "info",
  "Devis préparé": "info",
  "Devis envoyé": "accent",
  Relance: "warning",
  Confirmée: "info",
  "En préparation": "accent",
  Expédiée: "accent",
  Annulée: "danger",
  Refusé: "danger",
  rupture: "danger",
  expirée: "danger",
};

export function StatusBadge({ value, tone }: { value: string; tone?: keyof typeof tones }) {
  const t = tone ?? statusTone[value] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[t],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      {icon ? <div className="rounded-full bg-muted p-3 text-muted-foreground">{icon}</div> : null}
      <div>
        <p className="font-medium">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("surface-card gap-0 overflow-hidden py-0", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold">{title}</h3>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </Card>
  );
}
