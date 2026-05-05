import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save, LogOut } from "lucide-react";
import { UpdateProfileSchema, type UpdateProfileInput } from "@contentiq/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/index";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/axios";
import { toast } from "@/hooks/use-toast";

const PLAN_LABELS: Record<string, { label: string; variant: "default" | "success" | "warning" }> = {
  free: { label: "Plan Free", variant: "default" },
  pro: { label: "Plan Pro", variant: "success" },
  business: { label: "Plan Business", variant: "warning" },
  admin: { label: "Admin", variant: "warning" },
};

export default function ProfilePage() {
  const { logout } = useAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: user?.name ?? "", bio: "" },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setIsSaving(true);
    try {
      await api.put("/users/me", data);
      toast({ title: "Profil mis à jour", variant: "default" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  const plan = PLAN_LABELS[user.role] ?? PLAN_LABELS.free;
  const creditsPercent = Math.round((user.credits.remaining / user.credits.total) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations et préférences</p>
      </div>

      {/* Carte identité */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white shadow"
                aria-label="Modifier l'avatar"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant={plan.variant} className="mt-1">{plan.label}</Badge>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" {...register("name")} error={errors.name?.message} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio courte</Label>
              <Input id="bio" placeholder="Copywriter & consultant marketing" {...register("bio")} />
            </div>

            <Button type="submit" loading={isSaving}>
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Crédits */}
      <Card>
        <CardHeader>
          <CardTitle>Crédits</CardTitle>
          <CardDescription>1 crédit = ~500 tokens Claude ≈ 350 mots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{user.credits.remaining}</span>
            <span className="text-sm text-muted-foreground">/ {user.credits.total} crédits</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Renouvellement le{" "}
            {new Date(user.credits.resetDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
