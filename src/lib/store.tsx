import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as data from "./mock-data";

type Collections = {
  products: data.Product[];
  categories: data.Category[];
  brands: data.Brand[];
  promotions: data.Promotion[];
  orders: data.Order[];
  quotes: data.Quote[];
  clients: data.Client[];
  solutions: data.Solution[];
  references: data.Reference[];
  sitePages: data.SitePage[];
  news: data.NewsItem[];
  banners: data.Banner[];
  media: data.MediaItem[];
  documents: data.DocItem[];
  formEntries: data.FormEntry[];
  subscribers: data.Subscriber[];
  campaigns: data.Campaign[];
  users: data.User[];
  notifications: data.NotificationItem[];
  activity: data.ActivityItem[];
};

const initial = (): Collections => ({
  products: data.products,
  categories: data.categories,
  brands: data.brands,
  promotions: data.promotions,
  orders: data.orders,
  quotes: data.quotes,
  clients: data.clients,
  solutions: data.solutions,
  references: data.references,
  sitePages: data.sitePages,
  news: data.news,
  banners: data.banners,
  media: data.media,
  documents: data.documents,
  formEntries: data.formEntries,
  subscribers: data.subscribers,
  campaigns: data.campaigns,
  users: data.users,
  notifications: data.notifications,
  activity: data.activity,
});

export interface Session {
  name: string;
  email: string;
  role: data.User["role"];
  initials: string;
}

interface Store extends Collections {
  session: Session | null;
  hydrated: boolean;
  theme: "light" | "dark";
  settings: Record<string, string | boolean>;
  login: (email: string, password: string, remember: boolean) => { ok: boolean; error?: string };
  logout: () => void;
  toggleTheme: () => void;
  setSettings: (patch: Record<string, string | boolean>) => void;
  update: <K extends keyof Collections>(
    key: K,
    id: string,
    patch: Partial<Collections[K][number]>,
  ) => void;
  remove: <K extends keyof Collections>(key: K, id: string) => void;
  add: <K extends keyof Collections>(key: K, item: Collections[K][number]) => void;
  setAll: <K extends keyof Collections>(key: K, items: Collections[K]) => void;
  logActivity: (action: string, module: string, target: string, link: string) => void;
}

const StoreContext = createContext<Store | null>(null);

const STORAGE_KEY = "districap-bo-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collections>(initial);
  const [session, setSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettingsState] = useState<Record<string, string | boolean>>({
    companyName: "DISTRICAP",
    email: "contact@districap.ma",
    phone: "+212 522 00 00 00",
    address: "Zone industrielle Sidi Maârouf, Casablanca",
    currency: "MAD",
    vat: "20",
    ecommerceOnline: true,
    vitrineOnline: true,
    maintenance: false,
    orderNotifications: true,
    quoteNotifications: true,
    newsletterDouble: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.collections) setCollections({ ...initial(), ...parsed.collections });
        if (parsed.session) setSession(parsed.session);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.settings) setSettingsState((s) => ({ ...s, ...parsed.settings }));
      }
    } catch {
      /* démarrage avec les données par défaut */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ collections, session, theme, settings }));
  }, [collections, session, theme, settings, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const logActivity = useCallback((action: string, module: string, target: string, link: string) => {
    setCollections((c) => ({
      ...c,
      activity: [
        {
          id: `a${Date.now()}`,
          user: "Vous",
          action,
          module,
          target,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          kind: module.toLowerCase(),
          link,
        },
        ...c.activity,
      ].slice(0, 60),
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...collections,
      session,
      hydrated,
      theme,
      settings,
      login: (email, password, remember) => {
        const user = data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "Aucun compte ne correspond à cet e-mail." };
        if (password !== data.DEMO_PASSWORD) return { ok: false, error: "Mot de passe incorrect." };
        if (user.status === "inactif") return { ok: false, error: "Ce compte est désactivé." };
        const s: Session = { name: user.name, email: user.email, role: user.role, initials: user.initials };
        setSession(s);
        if (!remember) sessionStorage.setItem("districap-session-only", "1");
        return { ok: true };
      },
      logout: () => setSession(null),
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      setSettings: (patch) => setSettingsState((s) => ({ ...s, ...patch })),
      update: (key, id, patch) =>
        setCollections((c) => ({
          ...c,
          [key]: (c[key] as { id: string }[]).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),
      remove: (key, id) =>
        setCollections((c) => ({
          ...c,
          [key]: (c[key] as { id: string }[]).filter((item) => item.id !== id),
        })),
      add: (key, item) =>
        setCollections((c) => ({ ...c, [key]: [item as never, ...(c[key] as never[])] })),
      setAll: (key, items) => setCollections((c) => ({ ...c, [key]: items })),
      logActivity,
    }),
    [collections, session, hydrated, theme, settings, logActivity],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}

export const newId = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;

export const formatMAD = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " MAD";

export const formatDate = (d: string) => {
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

export const orderTotal = (o: data.Order) =>
  o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) + o.shipping - o.discount;
