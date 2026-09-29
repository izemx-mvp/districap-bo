import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { AnimatedNetwork, EcosystemDiagram } from "@/components/animated-network";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/lib/store";
import { DEMO_PASSWORD, users } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Back-office DISTRICAP" },
      {
        name: "description",
        content: "Accédez au back-office centralisé DISTRICAP pour piloter le site e-commerce et le site vitrine.",
      },
      { property: "og:title", content: "Connexion — Back-office DISTRICAP" },
      {
        property: "og:description",
        content: "Gérez l'ensemble de votre écosystème digital depuis une seule interface.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@districap.ma");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (store.hydrated && store.session) navigate({ to: "/" });
  }, [store.hydrated, store.session, navigate]);

  const emailValid = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email);
  const passwordValid = password.length >= 6;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!emailValid || !passwordValid) return;
    setLoading(true);
    setTimeout(() => {
      const res = store.login(email, password, remember);
      if (!res.ok) {
        setLoading(false);
        setError(res.error ?? "Connexion impossible.");
        return;
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 900);
    }, 750);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex">
        <AnimatedNetwork density={60} />
        <div className="pointer-events-none absolute inset-0 brand-gradient opacity-45" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10 font-display text-sm font-bold text-primary-foreground backdrop-blur-sm">
            DC
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-[0.18em] text-primary-foreground">
              DISTRICAP
            </p>
            <p className="text-[11px] text-primary-foreground/60">Back-office centralisé</p>
          </div>
        </div>

        <div className="relative max-w-lg space-y-8">
          <div>
            <h1 className="font-display text-4xl leading-tight font-semibold text-primary-foreground">
              Un seul système,
              <br />
              deux plateformes pilotées.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
              Gérez l'ensemble de votre écosystème digital depuis une seule interface : catalogue
              produits, commandes, devis, contenus du site vitrine et reporting consolidé.
            </p>
          </div>
          <EcosystemDiagram />
        </div>

        <div className="relative flex items-center gap-2 text-xs text-primary-foreground/60">
          <ShieldCheck className="size-4" />
          Accès sécurisé — journal d'activité et gestion fine des permissions.
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="surface-card rounded-2xl p-8">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-semibold">Connexion</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Saisissez vos identifiants pour accéder au back-office.
              </p>
            </div>

            {error ? (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {success ? (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="size-4 animate-in zoom-in" />
                Connexion réussie — ouverture du tableau de bord…
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="prenom.nom@districap.ma"
                    autoComplete="email"
                  />
                </div>
                {touched && !emailValid ? (
                  <p className="text-xs text-destructive">Veuillez saisir une adresse e-mail valide.</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-9"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {touched && !passwordValid ? (
                  <p className="text-xs text-destructive">6 caractères minimum.</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                  Se souvenir de moi
                </label>
                <button
                  type="button"
                  className="text-sm text-accent hover:underline"
                  onClick={() => setError("Un lien de réinitialisation a été envoyé (démonstration).")}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Comptes de démonstration — mot de passe : <code className="text-accent">{DEMO_PASSWORD}</code>
            </p>
            <div className="mt-3 grid gap-1.5">
              {users.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-xs transition-colors hover:border-accent/50"
                >
                  <span className="font-medium">{u.email}</span>
                  <span className="text-muted-foreground">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
