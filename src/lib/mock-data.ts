// Données de démonstration DISTRICAP (MVP front-end, aucune API réelle).

export type Status = "actif" | "inactif" | "brouillon";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  status: Status;
  order: number;
  onEcommerce: boolean;
  onVitrine: boolean;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  icon: string;
  order: number;
  status: Status;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

export interface Product {
  id: string;
  ref: string;
  name: string;
  categoryId: string;
  subCategoryId: string | null;
  brandId: string;
  price: number;
  oldPrice: number | null;
  stock: "en stock" | "sur commande" | "rupture";
  promo: boolean;
  featured: boolean;
  status: Status;
  updatedAt: string;
  shortDescription: string;
  description: string;
  specs: { key: string; value: string }[];
  hasDatasheet: boolean;
  allowOrder: boolean;
  allowQuote: boolean;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: "remise %" | "prix fixe" | "promotion produit" | "promotion catégorie" | "promotion marque";
  value: number;
  startDate: string;
  endDate: string;
  scope: string;
  status: "planifiée" | "active" | "expirée" | "brouillon" | "désactivée";
  productIds: string[];
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  shipping: number;
  discount: number;
  payment: "Virement" | "Carte bancaire" | "Chèque" | "À la livraison";
  status: "Nouvelle" | "Confirmée" | "En préparation" | "Expédiée" | "Livrée" | "Annulée";
  notes: { author: string; text: string; date: string }[];
  history: { label: string; date: string; author: string }[];
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  contact: string;
  company: string;
  phone: string;
  email: string;
  source: "E-commerce" | "Site vitrine";
  subject: string;
  assignee: string | null;
  status:
    | "Nouveau"
    | "À traiter"
    | "En cours"
    | "Devis préparé"
    | "Devis envoyé"
    | "Relance"
    | "Accepté"
    | "Refusé"
    | "Clôturé";
  message: string;
  lines: { label: string; qty: number }[];
  attachments: string[];
  notes: { author: string; text: string; date: string }[];
  history: { label: string; date: string; author: string }[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  type: "Entreprise" | "Administration" | "Intégrateur" | "Particulier";
  createdAt: string;
  orders: number;
  quotes: number;
  revenue: number;
  status: "actif" | "inactif";
  notes: { author: string; text: string; date: string }[];
}

export interface Solution {
  id: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  content: string;
  advantages: string[];
  technologies: string[];
  brandIds: string[];
  views: number;
  cta: string;
  status: Status;
  order: number;
  slug: string;
}

export interface Reference {
  id: string;
  name: string;
  client: string;
  sector: string;
  city: string;
  year: number;
  solutionId: string;
  brandIds: string[];
  description: string;
  problem: string;
  answer: string;
  results: string;
  status: Status;
  featured: boolean;
}

export interface PageBlock {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  status: Status;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  blocks: PageBlock[];
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  status: Status;
  excerpt: string;
  views: number;
}

export interface Banner {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  site: "E-commerce" | "Site vitrine" | "Les deux";
  position: string;
  startDate: string;
  endDate: string;
  order: number;
  status: Status;
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "vidéo";
  size: string;
  dimensions: string;
  folder: string;
  uploadedAt: string;
  usedIn: string;
  hue: number;
}

export interface DocItem {
  id: string;
  name: string;
  type: "Fiche technique" | "Brochure" | "Catalogue" | "Certificat";
  size: string;
  brandId: string | null;
  downloads: number;
  updatedAt: string;
  status: Status;
}

export interface FormEntry {
  id: string;
  form: "Contact" | "Devis rapide" | "Rappel téléphonique" | "Support technique";
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
  source: "E-commerce" | "Site vitrine";
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  date: string;
  source: "E-commerce" | "Site vitrine";
  status: "abonné" | "désabonné";
}

export interface Campaign {
  id: string;
  name: string;
  date: string;
  sent: number;
  openRate: number;
  clickRate: number;
  status: "Envoyée" | "Planifiée" | "Brouillon";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Administrateur" | "Commercial" | "Marketing";
  status: "actif" | "inactif";
  lastLogin: string;
  initials: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  module: string;
  time: string;
  read: boolean;
  kind: "commande" | "devis" | "client" | "formulaire" | "système";
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  module: string;
  target: string;
  time: string;
  kind: string;
  link: string;
}

const iso = (d: string) => d;

export const brands: Brand[] = [
  { id: "br1", name: "Logitech", slug: "logitech", description: "Solutions de visioconférence et périphériques professionnels.", website: "https://www.logitech.com", status: "actif", order: 1, onEcommerce: true, onVitrine: true },
  { id: "br2", name: "Poly", slug: "poly", description: "Audioconférence, casques et barres de visioconférence.", website: "https://www.poly.com", status: "actif", order: 2, onEcommerce: true, onVitrine: true },
  { id: "br3", name: "Epson", slug: "epson", description: "Vidéoprojection laser professionnelle et installation.", website: "https://www.epson.fr", status: "actif", order: 3, onEcommerce: true, onVitrine: true },
  { id: "br4", name: "Hikvision", slug: "hikvision", description: "Vidéosurveillance IP, NVR et contrôle d'accès.", website: "https://www.hikvision.com", status: "actif", order: 4, onEcommerce: true, onVitrine: true },
  { id: "br5", name: "Samsung", slug: "samsung", description: "Affichage dynamique professionnel et murs d'images.", website: "https://www.samsung.com", status: "actif", order: 5, onEcommerce: true, onVitrine: false },
  { id: "br6", name: "Bosch", slug: "bosch", description: "Sonorisation, évacuation et sécurité incendie.", website: "https://www.boschsecurity.com", status: "actif", order: 6, onEcommerce: true, onVitrine: true },
  { id: "br7", name: "Legrand", slug: "legrand", description: "Précâblage, baies et infrastructure réseau.", website: "https://www.legrand.fr", status: "actif", order: 7, onEcommerce: true, onVitrine: true },
  { id: "br8", name: "Aten", slug: "aten", description: "Commutateurs KVM et extension de signal.", website: "https://www.aten.com", status: "actif", order: 8, onEcommerce: true, onVitrine: false },
  { id: "br9", name: "Barco", slug: "barco", description: "Collaboration sans fil et affichage haut de gamme.", website: "https://www.barco.com", status: "actif", order: 9, onEcommerce: true, onVitrine: true },
  { id: "br10", name: "Shure", slug: "shure", description: "Micros de conférence et traitement audio.", website: "https://www.shure.com", status: "inactif", order: 10, onEcommerce: false, onVitrine: true },
];

export const categories: Category[] = [
  { id: "c1", name: "Visioconférence", parentId: null, description: "Barres, caméras et salles de réunion connectées.", icon: "Video", order: 1, status: "actif", seoTitle: "Visioconférence professionnelle", seoDescription: "Équipements de visioconférence pour salles de réunion.", slug: "visioconference" },
  { id: "c1a", name: "Barres de visioconférence", parentId: "c1", description: "Solutions tout-en-un pour petites et moyennes salles.", icon: "Video", order: 1, status: "actif", seoTitle: "Barres de visioconférence", seoDescription: "Barres vidéo tout-en-un.", slug: "barres-visioconference" },
  { id: "c1b", name: "Caméras PTZ", parentId: "c1", description: "Caméras motorisées pour grandes salles.", icon: "Camera", order: 2, status: "actif", seoTitle: "Caméras PTZ", seoDescription: "Caméras PTZ professionnelles.", slug: "cameras-ptz" },
  { id: "c2", name: "Vidéoprojection", parentId: null, description: "Vidéoprojecteurs laser et écrans de projection.", icon: "Projector", order: 2, status: "actif", seoTitle: "Vidéoprojection", seoDescription: "Vidéoprojecteurs professionnels.", slug: "videoprojection" },
  { id: "c2a", name: "Vidéoprojecteurs laser", parentId: "c2", description: "Haute luminosité pour salles et auditoriums.", icon: "Projector", order: 1, status: "actif", seoTitle: "Vidéoprojecteurs laser", seoDescription: "Projection laser installation.", slug: "videoprojecteurs-laser" },
  { id: "c3", name: "Sonorisation", parentId: null, description: "Diffusion sonore, évacuation et conférence.", icon: "Speaker", order: 3, status: "actif", seoTitle: "Sonorisation professionnelle", seoDescription: "Systèmes de sonorisation.", slug: "sonorisation" },
  { id: "c3a", name: "Micros de conférence", parentId: "c3", description: "Micros plafond, col de cygne et sans fil.", icon: "Mic", order: 1, status: "actif", seoTitle: "Micros de conférence", seoDescription: "Micros pour salles de réunion.", slug: "micros-conference" },
  { id: "c4", name: "Vidéosurveillance", parentId: null, description: "Caméras IP, enregistreurs et supervision.", icon: "Cctv", order: 4, status: "actif", seoTitle: "Vidéosurveillance IP", seoDescription: "Caméras et NVR professionnels.", slug: "videosurveillance" },
  { id: "c4a", name: "Caméras IP", parentId: "c4", description: "Dômes, bullets et caméras thermiques.", icon: "Cctv", order: 1, status: "actif", seoTitle: "Caméras IP", seoDescription: "Caméras IP haute définition.", slug: "cameras-ip" },
  { id: "c4b", name: "Enregistreurs NVR", parentId: "c4", description: "Enregistrement et stockage vidéo.", icon: "HardDrive", order: 2, status: "actif", seoTitle: "Enregistreurs NVR", seoDescription: "NVR multi-canaux.", slug: "nvr" },
  { id: "c5", name: "Affichage professionnel", parentId: null, description: "Écrans, murs d'images et affichage dynamique.", icon: "Monitor", order: 5, status: "actif", seoTitle: "Affichage professionnel", seoDescription: "Écrans professionnels 24/7.", slug: "affichage-professionnel" },
  { id: "c5a", name: "Écrans interactifs", parentId: "c5", description: "Écrans tactiles pour salles et formation.", icon: "Monitor", order: 1, status: "actif", seoTitle: "Écrans interactifs", seoDescription: "Écrans tactiles collaboratifs.", slug: "ecrans-interactifs" },
  { id: "c6", name: "Précâblage & IT", parentId: null, description: "Baies, cordons, switchs et fibre optique.", icon: "Network", order: 6, status: "actif", seoTitle: "Précâblage et IT", seoDescription: "Infrastructure réseau.", slug: "precablage-it" },
  { id: "c6a", name: "Baies et coffrets", parentId: "c6", description: "Baies 19 pouces et accessoires.", icon: "Server", order: 1, status: "actif", seoTitle: "Baies 19 pouces", seoDescription: "Baies réseau.", slug: "baies-coffrets" },
  { id: "c7", name: "KVM", parentId: null, description: "Commutateurs KVM et extendeurs.", icon: "Keyboard", order: 7, status: "actif", seoTitle: "KVM professionnel", seoDescription: "Commutateurs KVM.", slug: "kvm" },
  { id: "c8", name: "Accessoires", parentId: null, description: "Supports, câbles et consommables.", icon: "Cable", order: 8, status: "actif", seoTitle: "Accessoires AV", seoDescription: "Accessoires et câblage.", slug: "accessoires" },
];

const productSeed: [string, string, string, string, number, number | null, Product["stock"], boolean][] = [
  ["Rally Bar Mini", "c1", "c1a", "br1", 32900, 35900, "en stock", true],
  ["Rally Bar Huddle", "c1", "c1a", "br1", 18500, null, "en stock", false],
  ["MeetUp 2", "c1", "c1a", "br1", 12900, 14200, "en stock", true],
  ["Studio X52", "c1", "c1a", "br2", 27400, null, "sur commande", false],
  ["Poly E70 Caméra intelligente", "c1", "c1b", "br2", 21800, 23900, "en stock", true],
  ["Rally Camera PTZ", "c1", "c1b", "br1", 15600, null, "en stock", false],
  ["Tap IP Console tactile", "c1", null, "br1", 9800, null, "en stock", false],
  ["EB-L630SU Laser 6000 lm", "c2", "c2a", "br3", 34500, 37800, "en stock", true],
  ["EB-L775U Laser 7000 lm", "c2", "c2a", "br3", 52900, null, "sur commande", false],
  ["EB-PU1007B Installation 7000 lm", "c2", "c2a", "br3", 78400, null, "sur commande", false],
  ["EB-725W Courte focale", "c2", "c2a", "br3", 16900, 18400, "en stock", true],
  ["Écran de projection motorisé 300 cm", "c2", null, "br7", 6800, null, "en stock", false],
  ["Système évacuation PAVIRO", "c3", null, "br6", 42600, null, "sur commande", false],
  ["Amplificateur mélangeur PLENA 240W", "c3", null, "br6", 8900, 9700, "en stock", true],
  ["Enceinte plafonnier 20W", "c3", null, "br6", 690, null, "en stock", false],
  ["Micro plafond MXA920", "c3", "c3a", "br10", 41200, null, "sur commande", false],
  ["Micro col de cygne CCM", "c3", "c3a", "br6", 2400, 2800, "en stock", true],
  ["Caméra dôme IP 4MP AcuSense", "c4", "c4a", "br4", 1450, null, "en stock", false],
  ["Caméra bullet IP 8MP ColorVu", "c4", "c4a", "br4", 2380, 2650, "en stock", true],
  ["Caméra PTZ IP 4MP 25x", "c4", "c4a", "br4", 9450, null, "en stock", false],
  ["Caméra thermique bi-spectre", "c4", "c4a", "br4", 28700, null, "sur commande", false],
  ["NVR 16 canaux 4K", "c4", "c4b", "br4", 4980, 5400, "en stock", true],
  ["NVR 32 canaux RAID", "c4", "c4b", "br4", 12600, null, "sur commande", false],
  ["Écran professionnel 55\" QMR", "c5", null, "br5", 8900, null, "en stock", false],
  ["Écran professionnel 75\" QBR", "c5", null, "br5", 19800, 21500, "en stock", true],
  ["Mur d'images 46\" bord fin 1,7 mm", "c5", null, "br5", 15400, null, "sur commande", false],
  ["Écran interactif 86\" 4K tactile", "c5", "c5a", "br9", 42900, null, "en stock", false],
  ["ClickShare CX-50 Gen2", "c5", null, "br9", 24300, 26900, "en stock", true],
  ["Baie 19\" 42U 800x1000", "c6", "c6a", "br7", 7400, null, "en stock", false],
  ["Coffret mural 12U", "c6", "c6a", "br7", 1890, null, "en stock", false],
  ["Panneau brassage 24 ports Cat6A", "c6", null, "br7", 980, 1150, "en stock", true],
  ["Tiroir optique 24 SC duplex", "c6", null, "br7", 1340, null, "rupture", false],
  ["Switch KVM HDMI 4 ports", "c7", null, "br8", 3200, null, "en stock", false],
  ["Extendeur KVM HDMI/USB 100 m", "c7", null, "br8", 2750, 3100, "en stock", true],
  ["Matrice KVM 8x8 4K", "c7", null, "br8", 18900, null, "sur commande", false],
  ["Support mural inclinable 100 kg", "c8", null, "br7", 740, null, "en stock", false],
  ["Cordon HDMI 2.1 fibre 20 m", "c8", null, "br8", 1290, 1450, "en stock", true],
  ["Kit câblage salle de réunion", "c8", null, "br7", 2150, null, "en stock", false],
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const products: Product[] = productSeed.map(
  ([name, categoryId, subCategoryId, brandId, price, oldPrice, stock, promo], i) => {
    const brand = brands.find((b) => b.id === brandId)!;
    const cat = categories.find((c) => c.id === categoryId)!;
    return {
      id: `p${i + 1}`,
      ref: `DC-${String(1000 + i * 7)}`,
      name,
      categoryId,
      subCategoryId,
      brandId,
      price,
      oldPrice,
      stock,
      promo,
      featured: i % 6 === 0,
      status: i % 11 === 10 ? "brouillon" : i % 9 === 8 ? "inactif" : "actif",
      updatedAt: iso(`2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`),
      shortDescription: `${name} — ${cat.name.toLowerCase()} ${brand.name}, intégration et mise en service assurées par DISTRICAP.`,
      description: `Le ${name} de ${brand.name} s'intègre aux environnements professionnels exigeants. Référencé par DISTRICAP avec garantie constructeur, support technique local et accompagnement à l'installation sur l'ensemble du territoire.`,
      specs: [
        { key: "Marque", value: brand.name },
        { key: "Garantie", value: "3 ans retour atelier" },
        { key: "Alimentation", value: "220-240 V AC" },
      ],
      hasDatasheet: i % 5 !== 3,
      allowOrder: price < 30000,
      allowQuote: true,
      slug: slugify(name),
      metaTitle: `${name} | DISTRICAP`,
      metaDescription: `Achetez le ${name} ${brand.name} chez DISTRICAP, distributeur professionnel.`,
      keywords: `${brand.name.toLowerCase()}, ${cat.slug}, professionnel`,
    };
  },
);

export const promotions: Promotion[] = [
  { id: "pr1", name: "Opération Visioconférence Rentrée", type: "remise %", value: 12, startDate: "2026-09-01", endDate: "2026-10-15", scope: "Catégorie Visioconférence", status: "active", productIds: ["p1", "p3", "p5"] },
  { id: "pr2", name: "Déstockage vidéoprojecteurs laser", type: "remise %", value: 18, startDate: "2026-09-10", endDate: "2026-09-30", scope: "Catégorie Vidéoprojection", status: "active", productIds: ["p8", "p11"] },
  { id: "pr3", name: "Pack sécurité Hikvision", type: "prix fixe", value: 4490, startDate: "2026-10-01", endDate: "2026-11-30", scope: "Marque Hikvision", status: "planifiée", productIds: ["p19", "p22"] },
  { id: "pr4", name: "Black Friday Pro AV", type: "remise %", value: 25, startDate: "2026-11-24", endDate: "2026-11-30", scope: "Multi-catégories", status: "planifiée", productIds: ["p25", "p28"] },
  { id: "pr5", name: "Soldes précâblage été", type: "remise %", value: 15, startDate: "2026-06-20", endDate: "2026-07-31", scope: "Catégorie Précâblage & IT", status: "expirée", productIds: ["p31"] },
  { id: "pr6", name: "Offre KVM intégrateurs", type: "promotion marque", value: 10, startDate: "2026-09-15", endDate: "2026-12-31", scope: "Marque Aten", status: "active", productIds: ["p34"] },
  { id: "pr7", name: "Remise accessoires -20%", type: "remise %", value: 20, startDate: "2026-10-05", endDate: "2026-10-20", scope: "Catégorie Accessoires", status: "brouillon", productIds: ["p37"] },
  { id: "pr8", name: "Campagne audio Bosch", type: "promotion catégorie", value: 8, startDate: "2026-08-01", endDate: "2026-08-31", scope: "Catégorie Sonorisation", status: "désactivée", productIds: ["p14", "p17"] },
];

const clientSeed: [string, string, string, string, Client["type"]][] = [
  ["Yassine El Amrani", "Groupe Atlas Industries", "Casablanca", "0661-223344", "Entreprise"],
  ["Salma Bennani", "Université Hassan II", "Casablanca", "0662-118899", "Administration"],
  ["Omar Cherkaoui", "Techno Integrale SARL", "Rabat", "0663-447722", "Intégrateur"],
  ["Nadia Bouhlal", "Clinique Al Madina", "Marrakech", "0664-556611", "Entreprise"],
  ["Hicham Rifai", "Office National des Ports", "Tanger", "0665-330099", "Administration"],
  ["Imane Tazi", "Hôtel Riad Palmeraie", "Marrakech", "0666-771122", "Entreprise"],
  ["Karim Fassi", "Fassi Audiovisuel", "Fès", "0667-889900", "Intégrateur"],
  ["Sofia Lahlou", "Banque Populaire Régionale", "Casablanca", "0668-442211", "Entreprise"],
  ["Mehdi Alaoui", "Lycée Technique Ibn Sina", "Agadir", "0669-663355", "Administration"],
  ["Rachid Saidi", "Saidi Logistics", "Mohammedia", "0661-909090", "Entreprise"],
  ["Fatima Zahra Idrissi", "Centre de Formation Numérique", "Rabat", "0662-121212", "Administration"],
  ["Anas Berrada", "Berrada Constructions", "Casablanca", "0663-343434", "Entreprise"],
  ["Leila Mansouri", "Groupe Scolaire Les Cèdres", "Kénitra", "0664-565656", "Administration"],
  ["Youssef Kabbaj", "Kabbaj Sécurité Privée", "Oujda", "0665-787878", "Intégrateur"],
  ["Hanane Ouazzani", "Pharma Distribution Maroc", "Casablanca", "0666-101010", "Entreprise"],
  ["Tarik Belkadi", "Complexe Sportif Al Amal", "Salé", "0667-232323", "Administration"],
  ["Meryem Sabri", "Sabri Consulting", "Rabat", "0668-454545", "Entreprise"],
  ["Abdelilah Naciri", "Naciri Télécom", "Tétouan", "0669-676767", "Intégrateur"],
  ["Ghita Benjelloun", "Résidence Les Oliviers", "Casablanca", "0661-898989", "Entreprise"],
  ["Samir Haddad", "Haddad Import Export", "Agadir", "0662-010203", "Entreprise"],
  ["Zineb Kettani", "Institut Supérieur de Gestion", "Casablanca", "0663-040506", "Administration"],
  ["Driss Alami", "Alami Événementiel", "Marrakech", "0664-070809", "Entreprise"],
];

export const clients: Client[] = clientSeed.map(([name, company, city, phone, type], i) => ({
  id: `cl${i + 1}`,
  name,
  company,
  email: `${slugify(name).split("-")[0]}.${slugify(name).split("-").slice(-1)[0]}@${slugify(company).slice(0, 14)}.ma`,
  phone,
  city,
  type,
  createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 26) + 2).padStart(2, "0")}`,
  orders: (i * 3) % 9,
  quotes: (i * 5) % 7,
  revenue: 18000 + ((i * 47_300) % 640_000),
  status: i % 8 === 7 ? "inactif" : "actif",
  notes:
    i % 4 === 0
      ? [{ author: "Karim Zeroual", text: "Client fidèle, privilégie le paiement par virement à 30 jours.", date: "2026-08-12" }]
      : [],
}));

const orderStatuses: Order["status"][] = ["Nouvelle", "Confirmée", "En préparation", "Expédiée", "Livrée", "Annulée"];
const payments: Order["payment"][] = ["Virement", "Carte bancaire", "Chèque", "À la livraison"];

export const orders: Order[] = Array.from({ length: 18 }, (_, i) => {
  const client = clients[(i * 3) % clients.length];
  const items: OrderItem[] = Array.from({ length: (i % 3) + 1 }, (_, j) => {
    const p = products[(i * 5 + j * 7) % products.length];
    return { productId: p.id, name: p.name, qty: (j % 3) + 1, unitPrice: p.price };
  });
  const status = orderStatuses[i % orderStatuses.length];
  const date = `2026-09-${String(28 - i).padStart(2, "0")}`;
  return {
    id: `o${i + 1}`,
    number: `CMD-2026-${String(1042 - i)}`,
    date,
    clientId: client.id,
    clientName: client.name,
    phone: client.phone,
    address: `${12 + i} Boulevard Mohammed V, ${client.city}`,
    items,
    shipping: i % 4 === 0 ? 0 : 450,
    discount: i % 5 === 0 ? 1200 : 0,
    payment: payments[i % payments.length],
    status,
    notes: i % 3 === 0 ? [{ author: "Nadia Berrada", text: "Livraison souhaitée avant le 15 du mois.", date }] : [],
    history: [
      { label: "Commande créée", date, author: "Site e-commerce" },
      ...(status !== "Nouvelle" ? [{ label: `Statut passé à ${status}`, date, author: "Karim Zeroual" }] : []),
    ],
  };
});

const quoteStatuses: Quote["status"][] = [
  "Nouveau",
  "À traiter",
  "En cours",
  "Devis préparé",
  "Devis envoyé",
  "Relance",
  "Accepté",
  "Refusé",
  "Clôturé",
];

export const commercials = ["Karim Zeroual", "Nadia Berrada", "Youssef Marrakchi", "Salwa Ouali"];

export const quotes: Quote[] = Array.from({ length: 20 }, (_, i) => {
  const client = clients[(i * 5) % clients.length];
  const p = products[(i * 4) % products.length];
  const date = `2026-09-${String(29 - (i % 28)).padStart(2, "0")}`;
  const assigned = i % 4 === 0 ? null : commercials[i % commercials.length];
  return {
    id: `q${i + 1}`,
    number: `DEV-2026-${String(2075 - i)}`,
    date,
    contact: client.name,
    company: client.company,
    phone: client.phone,
    email: client.email,
    source: i % 3 === 0 ? "Site vitrine" : "E-commerce",
    subject: i % 3 === 0 ? "Solution Vidéosurveillance" : p.name,
    assignee: assigned,
    status: quoteStatuses[i % quoteStatuses.length],
    message: `Bonjour, nous souhaitons un chiffrage pour l'équipement de ${(i % 4) + 1} salle(s) ainsi que la pose et la mise en service. Merci de nous préciser les délais.`,
    lines: [
      { label: p.name, qty: (i % 4) + 1 },
      ...(i % 2 === 0 ? [{ label: "Installation et mise en service", qty: 1 }] : []),
    ],
    attachments: i % 3 === 0 ? ["cahier-des-charges.pdf"] : [],
    notes: i % 5 === 0 ? [{ author: "Salwa Ouali", text: "Client à rappeler en fin de semaine.", date }] : [],
    history: [{ label: "Demande reçue", date, author: i % 3 === 0 ? "Site vitrine" : "Site e-commerce" }],
  };
});

export const solutions: Solution[] = [
  {
    id: "s1",
    title: "Sécurité incendie",
    subtitle: "Détection, alarme et évacuation certifiées",
    shortDescription: "Systèmes de détection incendie adressables et sonorisation d'évacuation conformes aux normes en vigueur.",
    content: "DISTRICAP conçoit et déploie des systèmes de sécurité incendie adressables : détecteurs optiques, centrales, diffuseurs sonores et systèmes d'évacuation intelligibles. Nos équipes assurent l'étude, le câblage, la mise en service et la maintenance périodique.",
    advantages: ["Conformité normative", "Étude technique incluse", "Maintenance préventive", "Supervision centralisée"],
    technologies: ["Détection adressable", "Évacuation vocale", "Supervision IP"],
    brandIds: ["br6"],
    views: 1840,
    cta: "Demander une étude incendie",
    status: "actif",
    order: 1,
    slug: "securite-incendie",
  },
  {
    id: "s2",
    title: "Vidéosurveillance",
    subtitle: "Surveillance IP et analyse intelligente",
    shortDescription: "Caméras IP haute définition, enregistrement centralisé et analyse vidéo pour sites sensibles.",
    content: "De la caméra dôme d'intérieur à la thermique périmétrique, nous dimensionnons des architectures de vidéosurveillance IP complètes avec stockage redondant, supervision multi-sites et détection intelligente.",
    advantages: ["Analyse vidéo IA", "Multi-sites", "Stockage redondant", "Accès mobile sécurisé"],
    technologies: ["AcuSense", "ColorVu", "ONVIF", "Thermique"],
    brandIds: ["br4"],
    views: 3120,
    cta: "Planifier un audit sûreté",
    status: "actif",
    order: 2,
    slug: "videosurveillance",
  },
  {
    id: "s3",
    title: "Intrusion & contrôle d'accès",
    subtitle: "Protection périmétrique et gestion des flux",
    shortDescription: "Centrales d'intrusion, badges, biométrie et gestion centralisée des droits d'accès.",
    content: "Nous déployons des systèmes de contrôle d'accès unifiés : lecteurs badge et biométriques, gestion des visiteurs, anti-passback, interconnexion avec la vidéosurveillance et la sécurité incendie.",
    advantages: ["Gestion centralisée des droits", "Biométrie", "Historique complet", "Intégration vidéo"],
    technologies: ["Mifare", "Biométrie", "OSDP"],
    brandIds: ["br4", "br6"],
    views: 1460,
    cta: "Étudier mon contrôle d'accès",
    status: "actif",
    order: 3,
    slug: "intrusion-controle-acces",
  },
  {
    id: "s4",
    title: "Sonorisation",
    subtitle: "Diffusion sonore professionnelle",
    shortDescription: "Sonorisation d'ambiance, de conférence et d'évacuation pour tous types de bâtiments.",
    content: "Étude acoustique, dimensionnement des zones, amplification et pilotage numérique : nos installations sonores couvrent les hôtels, centres commerciaux, salles de conférence et sites industriels.",
    advantages: ["Étude acoustique", "Multizone", "Pilotage numérique", "Évolutif"],
    technologies: ["Dante", "DSP", "Ligne 100 V"],
    brandIds: ["br6", "br10"],
    views: 980,
    cta: "Demander une étude acoustique",
    status: "actif",
    order: 4,
    slug: "sonorisation",
  },
  {
    id: "s5",
    title: "Audioconférence",
    subtitle: "Salles de réunion audio haute intelligibilité",
    shortDescription: "Micros plafond, traitement DSP et haut-parleurs pour une prise de parole naturelle.",
    content: "Nous équipons les salles de réunion de chaînes audio complètes : captation plafond ou table, annulation d'écho, mixage automatique et diffusion homogène.",
    advantages: ["Intelligibilité", "Zéro écho", "Installation discrète", "Compatible Teams & Zoom"],
    technologies: ["Beamforming", "AEC", "Dante"],
    brandIds: ["br2", "br10"],
    views: 1210,
    cta: "Équiper ma salle",
    status: "actif",
    order: 5,
    slug: "audioconference",
  },
  {
    id: "s6",
    title: "Visioconférence",
    subtitle: "Salles connectées clé en main",
    shortDescription: "Barres vidéo, caméras PTZ et consoles tactiles certifiées Microsoft Teams et Zoom Rooms.",
    content: "Du huddle room à l'auditorium, DISTRICAP livre des salles de visioconférence prêtes à l'emploi : matériel certifié, câblage, paramétrage des plateformes et formation des utilisateurs.",
    advantages: ["Certifié Teams / Zoom", "Déploiement clé en main", "Formation incluse", "Supervision à distance"],
    technologies: ["Teams Rooms", "Zoom Rooms", "USB-C", "PoE"],
    brandIds: ["br1", "br2", "br9"],
    views: 4260,
    cta: "Configurer ma salle de réunion",
    status: "actif",
    order: 6,
    slug: "visioconference",
  },
  {
    id: "s7",
    title: "Affichage professionnel / Pro AV",
    subtitle: "Écrans, murs d'images et affichage dynamique",
    shortDescription: "Écrans 24/7, murs d'images bord fin et solutions de diffusion de contenus pilotées à distance.",
    content: "Nous concevons des dispositifs d'affichage dynamique complets : sélection des dalles, supports, lecteurs média, logiciel de diffusion et supervision du parc.",
    advantages: ["Fonctionnement 24/7", "Gestion de contenus à distance", "Murs d'images", "Supports sur mesure"],
    technologies: ["Signage CMS", "Vidéo over IP", "Dalles 700 nits"],
    brandIds: ["br5", "br9"],
    views: 2340,
    cta: "Découvrir l'affichage dynamique",
    status: "actif",
    order: 7,
    slug: "affichage-professionnel",
  },
  {
    id: "s8",
    title: "Précâblage informatique",
    subtitle: "Infrastructure réseau cuivre et fibre",
    shortDescription: "Baies, chemins de câbles, cuivre Cat6A et fibre optique certifiés et documentés.",
    content: "Nos équipes réalisent le précâblage complet de vos bâtiments : étude des chemins de câbles, tirage, brassage, certification des liens et documentation du réseau.",
    advantages: ["Liens certifiés", "Documentation complète", "Cuivre et fibre", "Garantie système"],
    technologies: ["Cat6A", "Fibre OM4", "Baies 19\""],
    brandIds: ["br7"],
    views: 1620,
    cta: "Demander un chiffrage précâblage",
    status: "actif",
    order: 8,
    slug: "precablage-informatique",
  },
];

const refSeed: [string, string, string, string, number, string][] = [
  ["Équipement de 24 salles de réunion", "Groupe Atlas Industries", "Industrie", "Casablanca", 2026, "s6"],
  ["Vidéosurveillance du port de commerce", "Office National des Ports", "Transport & Logistique", "Tanger", 2025, "s2"],
  ["Auditorium 400 places", "Université Hassan II", "Enseignement", "Casablanca", 2026, "s7"],
  ["Sonorisation et évacuation du centre commercial", "Marrakech Plaza", "Retail", "Marrakech", 2025, "s4"],
  ["Contrôle d'accès multi-sites", "Banque Populaire Régionale", "Banque & Assurance", "Casablanca", 2026, "s3"],
  ["Précâblage du nouveau siège", "Pharma Distribution Maroc", "Santé", "Casablanca", 2024, "s8"],
  ["Sécurité incendie de la clinique", "Clinique Al Madina", "Santé", "Marrakech", 2025, "s1"],
  ["Salles de formation interactives", "Centre de Formation Numérique", "Enseignement", "Rabat", 2026, "s6"],
  ["Mur d'images du centre de supervision", "Saidi Logistics", "Transport & Logistique", "Mohammedia", 2025, "s7"],
  ["Audioconférence du conseil d'administration", "Sabri Consulting", "Services", "Rabat", 2024, "s5"],
  ["Vidéosurveillance du complexe sportif", "Complexe Sportif Al Amal", "Collectivités", "Salé", 2026, "s2"],
  ["Affichage dynamique de l'hôtel", "Hôtel Riad Palmeraie", "Hôtellerie", "Marrakech", 2025, "s7"],
];

export const references: Reference[] = refSeed.map(([name, client, sector, city, year, solutionId], i) => ({
  id: `r${i + 1}`,
  name,
  client,
  sector,
  city,
  year,
  solutionId,
  brandIds: [brands[i % brands.length].id, brands[(i + 3) % brands.length].id],
  description: `Projet ${name.toLowerCase()} réalisé par DISTRICAP pour ${client} à ${city}.`,
  problem: `${client} devait moderniser son infrastructure existante tout en maintenant l'exploitation quotidienne du site.`,
  answer: "Étude technique complète, fourniture du matériel, installation par phases hors horaires d'exploitation, mise en service et formation des équipes.",
  results: "Déploiement livré dans les délais, exploitation continue préservée et supervision centralisée opérationnelle.",
  status: i % 7 === 6 ? "brouillon" : "actif",
  featured: i < 3,
}));

export const sitePages: SitePage[] = [
  {
    id: "pg1",
    title: "Accueil",
    slug: "/",
    status: "actif",
    updatedAt: "2026-09-22",
    seoTitle: "DISTRICAP — Distributeur de solutions audiovisuelles et sûreté",
    seoDescription: "DISTRICAP distribue et intègre les solutions AV, sûreté et réseau pour les professionnels.",
    blocks: [
      { id: "b1", type: "hero", label: "Hero principal", enabled: true },
      { id: "b2", type: "intro", label: "Présentation DISTRICAP", enabled: true },
      { id: "b3", type: "stats", label: "Chiffres clés", enabled: true },
      { id: "b4", type: "solutions", label: "Nos solutions", enabled: true },
      { id: "b5", type: "brands", label: "Marques partenaires", enabled: true },
      { id: "b6", type: "references", label: "Références", enabled: true },
      { id: "b7", type: "advantages", label: "Nos avantages", enabled: true },
      { id: "b8", type: "cta", label: "Appel à l'action", enabled: true },
      { id: "b9", type: "contact", label: "Bloc contact", enabled: false },
    ],
  },
  { id: "pg2", title: "À propos", slug: "/a-propos", status: "actif", updatedAt: "2026-08-30", seoTitle: "À propos de DISTRICAP", seoDescription: "Notre histoire, nos équipes et nos engagements.", blocks: [{ id: "b1", type: "hero", label: "Bandeau titre", enabled: true }, { id: "b2", type: "story", label: "Notre histoire", enabled: true }, { id: "b3", type: "team", label: "Équipe", enabled: true }] },
  { id: "pg3", title: "Contact", slug: "/contact", status: "actif", updatedAt: "2026-09-12", seoTitle: "Contacter DISTRICAP", seoDescription: "Nos coordonnées et formulaire de contact.", blocks: [{ id: "b1", type: "map", label: "Carte et adresse", enabled: true }, { id: "b2", type: "form", label: "Formulaire de contact", enabled: true }] },
  { id: "pg4", title: "Mentions légales", slug: "/mentions-legales", status: "actif", updatedAt: "2026-05-04", seoTitle: "Mentions légales", seoDescription: "Informations légales DISTRICAP.", blocks: [{ id: "b1", type: "text", label: "Contenu légal", enabled: true }] },
  { id: "pg5", title: "Politique de confidentialité", slug: "/confidentialite", status: "actif", updatedAt: "2026-05-04", seoTitle: "Politique de confidentialité", seoDescription: "Traitement des données personnelles.", blocks: [{ id: "b1", type: "text", label: "Contenu RGPD", enabled: true }] },
  { id: "pg6", title: "CGV", slug: "/cgv", status: "brouillon", updatedAt: "2026-09-18", seoTitle: "Conditions générales de vente", seoDescription: "CGV DISTRICAP.", blocks: [{ id: "b1", type: "text", label: "Conditions générales", enabled: true }] },
];

export const news: NewsItem[] = [
  { id: "n1", title: "DISTRICAP devient distributeur agréé Barco au Maroc", category: "Partenariat", author: "Salwa Ouali", date: "2026-09-18", status: "actif", excerpt: "Un nouvel accord qui renforce notre offre de collaboration sans fil et d'affichage haut de gamme.", views: 1240 },
  { id: "n2", title: "Retour sur l'équipement de 24 salles pour Atlas Industries", category: "Réalisation", author: "Karim Zeroual", date: "2026-09-05", status: "actif", excerpt: "Un déploiement en trois phases sans interruption de l'activité du site.", views: 860 },
  { id: "n3", title: "Nouvelle gamme de caméras thermiques bi-spectre", category: "Produit", author: "Nadia Berrada", date: "2026-08-21", status: "actif", excerpt: "Détection périmétrique avancée pour les sites industriels et logistiques.", views: 654 },
  { id: "n4", title: "Norme d'évacuation sonore : ce qui change en 2026", category: "Réglementation", author: "Youssef Marrakchi", date: "2026-08-02", status: "actif", excerpt: "Les principales évolutions à anticiper pour vos bâtiments recevant du public.", views: 1503 },
  { id: "n5", title: "DISTRICAP au salon Pro AV Casablanca", category: "Événement", author: "Salwa Ouali", date: "2026-07-14", status: "inactif", excerpt: "Retrouvez nos équipes sur le stand B12 pour des démonstrations en direct.", views: 412 },
  { id: "n6", title: "Guide : bien dimensionner une salle de visioconférence", category: "Conseil", author: "Karim Zeroual", date: "2026-06-28", status: "brouillon", excerpt: "Surface, acoustique, éclairage et choix du matériel selon la typologie de salle.", views: 0 },
];

export const banners: Banner[] = [
  { id: "bn1", name: "Hero e-commerce rentrée", title: "Équipez vos salles de réunion", subtitle: "Jusqu'à -18% sur la visioconférence", cta: "Voir les offres", link: "/promotions", site: "E-commerce", position: "Hero accueil", startDate: "2026-09-01", endDate: "2026-10-15", order: 1, status: "actif" },
  { id: "bn2", name: "Bandeau solutions vitrine", title: "Un partenaire unique pour votre sûreté", subtitle: "Étude, installation et maintenance", cta: "Nos solutions", link: "/solutions", site: "Site vitrine", position: "Hero accueil", startDate: "2026-08-01", endDate: "2026-12-31", order: 2, status: "actif" },
  { id: "bn3", name: "Promo Hikvision", title: "Pack vidéosurveillance 8 caméras", subtitle: "Prix fixe 4 490 MAD", cta: "Découvrir le pack", link: "/promotions/pack-securite", site: "E-commerce", position: "Milieu de page", startDate: "2026-10-01", endDate: "2026-11-30", order: 3, status: "brouillon" },
  { id: "bn4", name: "Newsletter", title: "Recevez nos nouveautés", subtitle: "Une fois par mois, sans spam", cta: "S'abonner", link: "/newsletter", site: "Les deux", position: "Pied de page", startDate: "2026-01-01", endDate: "2026-12-31", order: 4, status: "actif" },
  { id: "bn5", name: "Salon Pro AV", title: "Rendez-vous au salon Pro AV", subtitle: "Stand B12 — Casablanca", cta: "Prendre rendez-vous", link: "/actualites/salon-pro-av", site: "Site vitrine", position: "Bandeau haut", startDate: "2026-07-01", endDate: "2026-07-20", order: 5, status: "inactif" },
];

const mediaNames = [
  "hero-visioconference.jpg", "rally-bar-mini.jpg", "salle-reunion-atlas.jpg", "camera-colorvu.jpg",
  "mur-images-supervision.jpg", "baie-42u-installation.jpg", "auditorium-hassan-ii.jpg", "projecteur-laser-epson.jpg",
  "equipe-districap.jpg", "logo-districap-blanc.png", "banniere-rentree.jpg", "chantier-port-tanger.jpg",
  "ecran-interactif-formation.jpg", "micro-plafond-shure.jpg", "presentation-solutions.mp4", "showroom-casablanca.jpg",
  "pack-securite-8-cameras.jpg", "clinique-al-madina.jpg",
];

export const media: MediaItem[] = mediaNames.map((name, i) => ({
  id: `m${i + 1}`,
  name,
  type: name.endsWith(".mp4") ? "vidéo" : "image",
  size: `${(0.4 + ((i * 37) % 48) / 10).toFixed(1)} Mo`,
  dimensions: name.endsWith(".mp4") ? "1920x1080" : `${1200 + (i % 4) * 400}x${800 + (i % 3) * 200}`,
  folder: ["Produits", "Solutions", "Références", "Bannières", "Marque"][i % 5],
  uploadedAt: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
  usedIn: ["Fiche produit", "Page solution", "Bannière accueil", "Actualité", "Non utilisé"][i % 5],
  hue: (i * 37) % 360,
}));

export const documents: DocItem[] = [
  { id: "d1", name: "Fiche technique Rally Bar Mini.pdf", type: "Fiche technique", size: "1,2 Mo", brandId: "br1", downloads: 342, updatedAt: "2026-09-10", status: "actif" },
  { id: "d2", name: "Catalogue Hikvision 2026.pdf", type: "Catalogue", size: "18,4 Mo", brandId: "br4", downloads: 1287, updatedAt: "2026-08-02", status: "actif" },
  { id: "d3", name: "Brochure solutions visioconférence.pdf", type: "Brochure", size: "4,6 Mo", brandId: null, downloads: 561, updatedAt: "2026-09-01", status: "actif" },
  { id: "d4", name: "Certificat conformité PAVIRO.pdf", type: "Certificat", size: "0,8 Mo", brandId: "br6", downloads: 94, updatedAt: "2026-06-18", status: "actif" },
  { id: "d5", name: "Fiche technique EB-L630SU.pdf", type: "Fiche technique", size: "2,1 Mo", brandId: "br3", downloads: 218, updatedAt: "2026-07-22", status: "actif" },
  { id: "d6", name: "Catalogue précâblage Legrand.pdf", type: "Catalogue", size: "12,9 Mo", brandId: "br7", downloads: 405, updatedAt: "2026-05-30", status: "actif" },
  { id: "d7", name: "Brochure affichage dynamique.pdf", type: "Brochure", size: "6,3 Mo", brandId: "br5", downloads: 233, updatedAt: "2026-09-14", status: "brouillon" },
  { id: "d8", name: "Certificat ISO 9001 DISTRICAP.pdf", type: "Certificat", size: "0,5 Mo", brandId: null, downloads: 76, updatedAt: "2026-02-11", status: "actif" },
  { id: "d9", name: "Fiche technique NVR 16 canaux.pdf", type: "Fiche technique", size: "1,5 Mo", brandId: "br4", downloads: 189, updatedAt: "2026-08-25", status: "actif" },
  { id: "d10", name: "Guide d'installation KVM Aten.pdf", type: "Fiche technique", size: "3,4 Mo", brandId: "br8", downloads: 121, updatedAt: "2026-04-09", status: "inactif" },
];

export const formEntries: FormEntry[] = Array.from({ length: 14 }, (_, i) => {
  const c = clients[(i * 7) % clients.length];
  const forms: FormEntry["form"][] = ["Contact", "Devis rapide", "Rappel téléphonique", "Support technique"];
  return {
    id: `f${i + 1}`,
    form: forms[i % forms.length],
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    message: [
      "Nous souhaitons être recontactés pour l'équipement de nos salles de réunion.",
      "Pouvez-vous nous transmettre le catalogue vidéosurveillance 2026 ?",
      "Merci de nous rappeler en matinée pour un projet de précâblage.",
      "Nous rencontrons un souci de connexion sur une barre de visioconférence installée en juin.",
    ][i % 4],
    date: `2026-09-${String(29 - i).padStart(2, "0")}`,
    read: i % 3 !== 0,
    source: i % 2 === 0 ? "Site vitrine" : "E-commerce",
  };
});

export const subscribers: Subscriber[] = Array.from({ length: 24 }, (_, i) => {
  const c = clients[i % clients.length];
  return {
    id: `sb${i + 1}`,
    email: c.email,
    name: c.name,
    date: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    source: i % 3 === 0 ? "Site vitrine" : "E-commerce",
    status: i % 9 === 8 ? "désabonné" : "abonné",
  };
});

export const campaigns: Campaign[] = [
  { id: "cp1", name: "Nouveautés visioconférence — septembre", date: "2026-09-15", sent: 1842, openRate: 38.4, clickRate: 7.2, status: "Envoyée" },
  { id: "cp2", name: "Guide sécurité incendie 2026", date: "2026-08-20", sent: 1790, openRate: 42.1, clickRate: 9.6, status: "Envoyée" },
  { id: "cp3", name: "Offre rentrée Pro AV", date: "2026-10-05", sent: 0, openRate: 0, clickRate: 0, status: "Planifiée" },
  { id: "cp4", name: "Black Friday DISTRICAP", date: "2026-11-24", sent: 0, openRate: 0, clickRate: 0, status: "Brouillon" },
];

export const users: User[] = [
  { id: "u1", name: "Hicham Bennis", email: "superadmin@districap.ma", role: "Super Admin", status: "actif", lastLogin: "2026-09-29 08:42", initials: "HB" },
  { id: "u2", name: "Karim Zeroual", email: "admin@districap.ma", role: "Administrateur", status: "actif", lastLogin: "2026-09-29 09:15", initials: "KZ" },
  { id: "u3", name: "Nadia Berrada", email: "commercial@districap.ma", role: "Commercial", status: "actif", lastLogin: "2026-09-28 17:03", initials: "NB" },
  { id: "u4", name: "Salwa Ouali", email: "marketing@districap.ma", role: "Marketing", status: "actif", lastLogin: "2026-09-29 07:58", initials: "SO" },
  { id: "u5", name: "Youssef Marrakchi", email: "y.marrakchi@districap.ma", role: "Commercial", status: "actif", lastLogin: "2026-09-27 14:22", initials: "YM" },
  { id: "u6", name: "Imane Tazi", email: "i.tazi@districap.ma", role: "Marketing", status: "inactif", lastLogin: "2026-07-11 10:05", initials: "IT" },
];

export const modules = [
  "Tableau de bord", "Produits", "Catégories", "Marques", "Promotions", "Commandes", "Devis", "Clients",
  "Solutions", "Références", "Pages", "Actualités", "Bannières", "Médiathèque", "Documents", "Formulaires",
  "Newsletter", "Reporting", "Utilisateurs", "Paramètres",
] as const;

export const permissionMatrix: Record<string, Record<string, boolean[]>> = {};

export const notifications: NotificationItem[] = [
  { id: "nt1", title: "Nouvelle commande CMD-2026-1042", description: "Yassine El Amrani — 48 900 MAD", module: "Commandes", time: "il y a 8 min", read: false, kind: "commande" },
  { id: "nt2", title: "Demande de devis DEV-2026-2075", description: "Université Hassan II — Auditorium", module: "Devis", time: "il y a 32 min", read: false, kind: "devis" },
  { id: "nt3", title: "Formulaire de contact reçu", description: "Techno Integrale SARL — rappel souhaité", module: "Formulaires", time: "il y a 1 h", read: false, kind: "formulaire" },
  { id: "nt4", title: "Nouveau client inscrit", description: "Résidence Les Oliviers", module: "Clients", time: "il y a 3 h", read: true, kind: "client" },
  { id: "nt5", title: "Promotion bientôt expirée", description: "Déstockage vidéoprojecteurs laser — 30/09", module: "Promotions", time: "il y a 5 h", read: true, kind: "système" },
  { id: "nt6", title: "Actualité publiée", description: "DISTRICAP devient distributeur agréé Barco", module: "Actualités", time: "hier", read: true, kind: "système" },
];

export const activity: ActivityItem[] = [
  { id: "a1", user: "Site e-commerce", action: "a enregistré une nouvelle commande", module: "Commandes", target: "CMD-2026-1042", time: "09:42", kind: "commande", link: "/orders" },
  { id: "a2", user: "Site vitrine", action: "a transmis une demande de devis", module: "Devis", target: "DEV-2026-2075", time: "09:18", kind: "devis", link: "/quotes" },
  { id: "a3", user: "Karim Zeroual", action: "a modifié la fiche produit", module: "Produits", target: "Rally Bar Mini", time: "08:56", kind: "produit", link: "/products" },
  { id: "a4", user: "Salwa Ouali", action: "a publié l'actualité", module: "Actualités", target: "Distributeur agréé Barco", time: "08:31", kind: "actualite", link: "/news" },
  { id: "a5", user: "Nadia Berrada", action: "a assigné le devis", module: "Devis", target: "DEV-2026-2068", time: "hier 17:22", kind: "devis", link: "/quotes" },
  { id: "a6", user: "Site e-commerce", action: "a enregistré un nouveau client", module: "Clients", target: "Résidence Les Oliviers", time: "hier 16:04", kind: "client", link: "/clients" },
  { id: "a7", user: "Salwa Ouali", action: "a publié la bannière", module: "Bannières", target: "Hero e-commerce rentrée", time: "hier 14:47", kind: "banniere", link: "/banners" },
  { id: "a8", user: "Youssef Marrakchi", action: "a reçu un formulaire", module: "Formulaires", target: "Techno Integrale SARL", time: "hier 11:12", kind: "formulaire", link: "/forms" },
  { id: "a9", user: "Hicham Bennis", action: "a créé la promotion", module: "Promotions", target: "Black Friday Pro AV", time: "27/09 15:30", kind: "promotion", link: "/promotions" },
  { id: "a10", user: "Karim Zeroual", action: "a confirmé la commande", module: "Commandes", target: "CMD-2026-1039", time: "27/09 10:08", kind: "commande", link: "/orders" },
];

export const revenueSeries = [
  { month: "Jan", commandes: 42, devis: 58, ca: 412000, clients: 12 },
  { month: "Fév", commandes: 38, devis: 64, ca: 388000, clients: 9 },
  { month: "Mar", commandes: 51, devis: 72, ca: 512000, clients: 15 },
  { month: "Avr", commandes: 47, devis: 61, ca: 468000, clients: 11 },
  { month: "Mai", commandes: 59, devis: 80, ca: 596000, clients: 18 },
  { month: "Juin", commandes: 64, devis: 88, ca: 651000, clients: 21 },
  { month: "Juil", commandes: 55, devis: 70, ca: 534000, clients: 14 },
  { month: "Août", commandes: 43, devis: 55, ca: 402000, clients: 8 },
  { month: "Sep", commandes: 72, devis: 96, ca: 738000, clients: 24 },
];

export const DEMO_PASSWORD = "districap2026";
