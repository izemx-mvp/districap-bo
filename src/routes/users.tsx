import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-bits";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { modules, type User } from "@/lib/mock-data";
import { newId, useStore } from "@/lib/store";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Utilisateurs & rôles — Back-office DISTRICAP" },
      { name: "description", content: "Comptes internes et matrice de permissions du back-office." },
      { property: "og:title", content: "Utilisateurs & rôles — Back-office DISTRICAP" },
      { property: "og:description", content: "Rôles, accès par module et activation des comptes." },
    ],
  }),
  component: () => (
    <AppShell>
      <UsersPage />
    </AppShell>
  ),
});

const roles: User["role"][] = ["Super Admin", "Administrateur", "Commercial", "Marketing"];
const perms = ["Lecture", "Création", "Modification", "Suppression"];

const defaultsFor = (role: User["role"], i: number) => {
  if (role === "Super Admin") return [true, true, true, true];
  if (role === "Administrateur") return [true, true, true, i % 4 !== 0];
  if (role === "Commercial") return [true, i > 4 && i < 9, i > 4 && i < 9, false];
  return [true, i > 8, i > 8, false];
};

function UsersPage() {
  const store = useStore();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<User | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [role, setRole] = useState<User["role"]>("Commercial");
  const [matrix, setMatrix] = useState<Record<string, boolean[]>>(() => {
    try {
      return JSON.parse(String(store.settings["permissions"] ?? "{}")) as Record<string, boolean[]>;
    } catch {
      return {};
    }
  });
  const [dirty, setDirty] = useState(false);

  const key = (m: string, r: string) => `${r}|${m}`;
  const cell = (m: string, i: number) => matrix[key(m, role)] ?? defaultsFor(role, i);

  const columns: Column<User>[] = [
    { key: "name", label: "Utilisateur", value: (u) => u.name, sortable: true, render: (u) => (
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{u.initials}</span>
        <div>
          <p className="text-sm font-medium">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      </div>
    ) },
    { key: "role", label: "Rôle", value: (u) => u.role, sortable: true },
    { key: "lastLogin", label: "Dernière connexion", value: (u) => u.lastLogin, sortable: true },
    { key: "status", label: "Statut", value: (u) => u.status, render: (u) => <StatusBadge value={u.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs & rôles"
        description={`${store.users.length} comptes internes avec accès au back-office.`}
        actions={
          <Button onClick={() => { setEditing({ id: newId("u"), name: "", email: "", role: "Commercial", status: "actif", lastLogin: "—", initials: "" }); setIsNew(true); }}>
            <Plus className="size-4" /> Nouvel utilisateur
          </Button>
        }
      />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="perms">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <DataTable
            rows={store.users}
            columns={columns}
            search={(u, t) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(t)}
            filters={[
              { key: "role", label: "Rôle", options: roles, match: (u, v) => u.role === v },
              { key: "status", label: "Statut", options: ["actif", "inactif"], match: (u, v) => u.status === v },
            ]}
            rowActions={(u) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditing(u); setIsNew(false); }}>Modifier</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.logActivity("a réinitialisé le mot de passe de", "Utilisateurs", u.name, "/users"); toast.success(`Lien de réinitialisation envoyé à ${u.email}`); }}>Réinitialiser le mot de passe</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { store.update("users", u.id, { status: u.status === "actif" ? "inactif" : "actif" }); toast.success("Statut du compte mis à jour"); }}>
                    {u.status === "actif" ? "Désactiver" : "Activer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      u.role === "Super Admin"
                        ? toast.error("Le compte Super Admin ne peut pas être supprimé")
                        : confirm("Supprimer l'utilisateur ?", `${u.name} perdra l'accès au back-office.`, () => { store.remove("users", u.id); toast.success("Utilisateur supprimé"); })
                    }
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </TabsContent>

        <TabsContent value="perms" className="mt-4">
          <SectionCard
            title="Matrice de permissions"
            description="Définissez les droits accordés à chaque rôle, module par module"
            actions={
              <div className="flex items-center gap-2">
                <Select value={role} onValueChange={(v) => setRole(v as User["role"])}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={dirty ? "default" : "outline"}
                  onClick={() => {
                    store.setSettings({ permissions: JSON.stringify(matrix) });
                    store.logActivity("a modifié les permissions du rôle", "Utilisateurs", role, "/users");
                    setDirty(false);
                    toast.success(`Permissions du rôle ${role} enregistrées`);
                  }}
                ><ShieldCheck className="size-4" /> Enregistrer</Button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    {perms.map((p) => <TableHead key={p} className="text-center">{p}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((m, i) => (
                    <TableRow key={m}>
                      <TableCell className="font-medium">{m}</TableCell>
                      {perms.map((p, pi) => (
                        <TableCell key={p} className="text-center">
                          <Checkbox
                            checked={cell(m, i)[pi]}
                            disabled={role === "Super Admin"}
                            onCheckedChange={(v) => {
                              const current = [...cell(m, i)];
                              current[pi] = !!v;
                              setMatrix({ ...matrix, [key(m, role)]: current });
                              setDirty(true);
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{isNew ? "Nouvel utilisateur" : "Modifier l'utilisateur"}</SheetTitle>
            <SheetDescription>Accès au back-office centralisé DISTRICAP.</SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="space-y-4 px-4">
              <div className="space-y-1.5"><Label>Nom complet</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>E-mail professionnel</Label><Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Rôle</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as User["role"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm">Compte actif</span>
                <Checkbox checked={editing.status === "actif"} onCheckedChange={(v) => setEditing({ ...editing, status: v ? "actif" : "inactif" })} />
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.name.trim()) return toast.error("Le nom est obligatoire");
                if (!editing.email.includes("@")) return toast.error("E-mail invalide");
                const initials = editing.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
                if (isNew) store.add("users", { ...editing, initials });
                else store.update("users", editing.id, { ...editing, initials });
                store.logActivity(isNew ? "a créé l'utilisateur" : "a modifié l'utilisateur", "Utilisateurs", editing.name, "/users");
                toast.success("Utilisateur enregistré");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialog}
    </div>
  );
}
