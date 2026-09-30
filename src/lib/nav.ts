import { Link } from "@tanstack/react-router";
import type { ComponentProps, ElementType } from "react";
import {
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Contact,
  FileSpreadsheet,
  FileText,
  Files,
  Gauge,
  Images,
  Inbox,
  Layers,
  Lightbulb,
  Mail,
  Newspaper,
  Package,
  Percent,
  PieChart,
  ScrollText,
  Settings,
  ShoppingCart,
  Tags,
  Trophy,
  Users,
} from "lucide-react";

/** Link accepting plain string paths (nav config is data-driven). */
export const NavLink = Link as unknown as (
  props: Omit<ComponentProps<"a">, "href"> & {
    to: string;
    params?: Record<string, string>;
    search?: Record<string, unknown>;
  },
) => React.ReactElement;

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Pilotage",
    items: [{ label: "Tableau de bord", href: "/", icon: Gauge }],
  },
  {
    label: "E-commerce",
    items: [
      { label: "Produits", href: "/products", icon: Package },
      { label: "Catégories", href: "/categories", icon: Layers },
      { label: "Marques", href: "/brands", icon: Tags },
      { label: "Promotions", href: "/promotions", icon: Percent },
      { label: "Commandes", href: "/orders", icon: ShoppingCart },
      { label: "Demandes de devis", href: "/quotes", icon: FileSpreadsheet },
      { label: "Clients", href: "/clients", icon: Contact },
    ],
  },
  {
    label: "Site vitrine",
    items: [
      { label: "Solutions", href: "/solutions", icon: Lightbulb },
      { label: "Références", href: "/references", icon: Trophy },
      { label: "Actualités", href: "/news", icon: Newspaper },
    ],
  },
  {
    label: "Contenus partagés",
    items: [
      { label: "Bannières", href: "/banners", icon: Images },
      { label: "Médiathèque", href: "/media", icon: Boxes },
      { label: "Documents", href: "/documents", icon: Files },
      { label: "Formulaires", href: "/forms", icon: Inbox },
      { label: "Newsletter", href: "/newsletter", icon: Mail },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Reporting", href: "/reporting", icon: PieChart },
      { label: "Utilisateurs & rôles", href: "/users", icon: Users },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Journal d'activité", href: "/activity", icon: ScrollText },
      { label: "Paramètres", href: "/settings", icon: Settings },
    ],
  },
];

export const pageTitles: Record<string, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((i) => [i.href, i.label])),
);

export const extraIcons = { Building2, CalendarClock, FileText };
