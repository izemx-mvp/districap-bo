import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  User as UserIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AnimatedNetwork } from "@/components/animated-network";
import { navGroups, NavLink, pageTitles } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const createActions = [
  { label: "Nouveau produit", href: "/products", hint: "new" },
  { label: "Nouveau client", href: "/clients", hint: "new" },
  { label: "Nouvelle promotion", href: "/promotions", hint: "new" },
  { label: "Nouvelle solution", href: "/solutions", hint: "new" },
  { label: "Nouvelle référence", href: "/references", hint: "new" },
  { label: "Nouvelle actualité", href: "/news", hint: "new" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const store = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (store.hydrated && !store.session) navigate({ to: "/login" });
  }, [store.hydrated, store.session, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!store.hydrated || !store.session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const unread = store.notifications.filter((n) => !n.read).length;
  const title = pageTitles[pathname] ?? "Détail";
  const section =
    navGroups.find((g) => g.items.some((i) => i.href === pathname))?.label ?? "Pilotage";

  const go = (href: string) => navigate({ to: href as never });

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex",
          collapsed ? "w-[74px]" : "w-64",
        )}
      >
        <div className="relative flex h-16 items-center gap-3 overflow-hidden border-b border-sidebar-border px-4">
          <AnimatedNetwork density={14} />
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg brand-gradient font-display text-sm font-bold text-primary-foreground">
            DC
          </div>
          {!collapsed ? (
            <div className="relative leading-tight">
              <p className="font-display text-sm font-semibold tracking-wide">DISTRICAP</p>
              <p className="text-[11px] text-sidebar-foreground/60">Back-office centralisé</p>
            </div>
          ) : null}
        </div>

        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!collapsed ? (
                  <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
                    {group.label}
                  </p>
                ) : (
                  <div className="mx-3 mb-2 border-t border-sidebar-border" />
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const activeItem =
                      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    const link = (
                      <NavLink
                        to={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          activeItem
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {activeItem ? (
                          <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r bg-sidebar-primary" />
                        ) : null}
                        <item.icon
                          className={cn("size-4 shrink-0", activeItem && "text-sidebar-primary")}
                        />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </NavLink>
                    );
                    return (
                      <li key={item.href}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed ? "Réduire" : null}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-border glass-panel">
          <div className="flex h-full items-center gap-3 px-4 lg:px-6">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">
                DISTRICAP · {section}
              </p>
              <p className="truncate font-display text-sm font-semibold">{title}</p>
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="mx-auto hidden w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/50 md:flex"
            >
              <Search className="size-4" />
              Recherche globale…
              <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-4" /> Créer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Création rapide</DropdownMenuLabel>
                  {createActions.map((a) => (
                    <DropdownMenuItem
                      key={a.label}
                      onClick={() => navigate({ to: a.href as never, search: { new: true } as never })}
                    >
                      {a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-4" />
                    {unread > 0 ? (
                      <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        store.notifications.forEach((n) => store.update("notifications", n.id, { read: true }));
                        toast.success("Toutes les notifications sont lues");
                      }}
                    >
                      <Check className="size-3.5" /> Tout lire
                    </Button>
                  </div>
                  <ScrollArea className="max-h-80">
                    {store.notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          store.update("notifications", n.id, { read: true });
                          go("/notifications");
                        }}
                        className="flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60"
                      >
                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            n.read ? "bg-border" : "bg-accent",
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{n.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {n.description}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70">
                            {n.module} · {n.time}
                          </span>
                        </span>
                      </button>
                    ))}
                  </ScrollArea>
                  <div className="p-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => go("/notifications")}>
                      Voir le centre de notifications
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={store.toggleTheme} aria-label="Changer de thème">
                {store.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted">
                    <Avatar className="size-8">
                      <AvatarFallback className="brand-gradient text-xs font-semibold text-primary-foreground">
                        {store.session.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block text-xs font-medium">{store.session.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{store.session.role}</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{store.session.name}</p>
                    <p className="text-xs text-muted-foreground">{store.session.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => go("/settings")}>
                    <UserIcon className="size-4" /> Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/settings")}>Paramètres</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      store.logout();
                      toast.success("Vous êtes déconnecté");
                      navigate({ to: "/login" });
                    }}
                  >
                    <LogOut className="size-4" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Rechercher un module, un produit, une commande…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          {navGroups.map((g) => (
            <CommandGroup key={g.label} heading={g.label}>
              {g.items.map((i) => (
                <CommandItem
                  key={i.href}
                  value={i.label}
                  onSelect={() => {
                    setPaletteOpen(false);
                    go(i.href);
                  }}
                >
                  <i.icon className="size-4" />
                  {i.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Produits">
            {store.products.slice(0, 8).map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.ref}`}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: "/products/$id", params: { id: p.id } });
                }}
              >
                {p.name}
                <span className="ml-auto text-xs text-muted-foreground">{p.ref}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Commandes">
            {store.orders.slice(0, 5).map((o) => (
              <CommandItem
                key={o.id}
                value={`${o.number} ${o.clientName}`}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: "/orders/$id", params: { id: o.id } });
                }}
              >
                {o.number}
                <span className="ml-auto text-xs text-muted-foreground">{o.clientName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
