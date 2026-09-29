import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Columns3, Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number;
  sortable?: boolean;
  className?: string;
  optional?: boolean;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
}

interface Props<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  search?: (row: T, term: string) => boolean;
  filters?: FilterDef<T>[];
  rowActions?: (row: T) => ReactNode;
  bulkActions?: (ids: string[], clear: () => void) => ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  onRowClick?: (row: T) => void;
  toolbarExtra?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  search,
  filters = [],
  rowActions,
  bulkActions,
  pageSize = 10,
  emptyTitle = "Aucun résultat",
  onRowClick,
  toolbarExtra,
}: Props<T>) {
  const [term, setTerm] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    let out = rows;
    if (term && search) out = out.filter((r) => search(r, term.toLowerCase()));
    for (const f of filters) {
      const v = active[f.key];
      if (v && v !== "__all") out = out.filter((r) => f.match(r, v));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.value) {
        out = [...out].sort((a, b) => {
          const av = col.value!(a);
          const bv = col.value!(b);
          const res = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "fr");
          return sort.dir === "asc" ? res : -res;
        });
      }
    }
    return out;
  }, [rows, term, active, sort, filters, columns, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);
  const allChecked = slice.length > 0 && slice.every((r) => selected.includes(r.id));
  const hasFilters = term !== "" || Object.values(active).some((v) => v && v !== "__all");

  const reset = () => {
    setTerm("");
    setActive({});
    setSort(null);
    setPage(1);
  };

  return (
    <div className="surface-card overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        {search ? (
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher…"
              className="bg-background pl-9"
            />
          </div>
        ) : null}

        {filters.map((f) => (
          <Select
            key={f.key}
            value={active[f.key] ?? "__all"}
            onValueChange={(v) => {
              setActive((a) => ({ ...a, [f.key]: v }));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-auto min-w-36 bg-background">
              <Filter className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{f.label} : tous</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {toolbarExtra}

        <div className="ml-auto flex items-center gap-2">
          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-4" /> Réinitialiser
            </Button>
          ) : null}
          {columns.some((c) => c.optional) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="size-4" /> Colonnes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
                {columns
                  .filter((c) => c.optional)
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={!hidden.includes(c.key)}
                      onCheckedChange={(v) =>
                        setHidden((h) => (v ? h.filter((k) => k !== c.key) : [...h, c.key]))
                      }
                    >
                      {c.label}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {bulkActions && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/10 px-4 py-2 text-sm">
          <span className="font-medium">{selected.length} sélectionné(s)</span>
          {bulkActions(selected, () => setSelected([]))}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
            Annuler
          </Button>
        </div>
      ) : null}

      {slice.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description="Modifiez votre recherche ou vos filtres pour afficher des éléments."
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={reset}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {bulkActions ? (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(v) =>
                        setSelected((s) =>
                          v
                            ? [...new Set([...s, ...slice.map((r) => r.id)])]
                            : s.filter((id) => !slice.some((r) => r.id === id)),
                        )
                      }
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                ) : null}
                {visibleColumns.map((c) => (
                  <TableHead key={c.key} className={cn("whitespace-nowrap", c.className)}>
                    {c.sortable && c.value ? (
                      <button
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        onClick={() =>
                          setSort((s) =>
                            s?.key === c.key
                              ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                              : { key: c.key, dir: "asc" },
                          )
                        }
                      >
                        {c.label}
                        <ArrowUpDown className={cn("size-3.5", sort?.key === c.key && "text-accent")} />
                      </button>
                    ) : (
                      c.label
                    )}
                  </TableHead>
                ))}
                {rowActions ? <TableHead className="w-12 text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("group", onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {bulkActions ? (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onCheckedChange={(v) =>
                          setSelected((s) => (v ? [...s, row.id] : s.filter((id) => id !== row.id)))
                        }
                        aria-label="Sélectionner la ligne"
                      />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render ? c.render(row) : String(c.value?.(row) ?? "")}
                    </TableCell>
                  ))}
                  {rowActions ? (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          {filtered.length} élément(s) — page {current} / {pages}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
            Précédent
          </Button>
          <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
