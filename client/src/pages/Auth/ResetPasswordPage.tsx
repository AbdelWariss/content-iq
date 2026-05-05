import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { toast } from "@/hooks/use-toast";

const Schema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Doit contenir maj, min et chiffre"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

type FormData = z.infer<typeof Schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
  });

  async function onSubmit({ password }: FormData) {
    if (!token) {
      toast({ title: "Lien invalide", description: "Ce lien de réinitialisation est invalide.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Lien invalide ou expiré";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mot de passe réinitialisé !</h2>
          <p className="mt-2 text-sm text-muted-foreground">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Nouveau mot de passe</h2>
        <p className="text-sm text-muted-foreground">Choisissez un mot de passe sécurisé.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} error={errors.password?.message} />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer</Label>
          <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} error={errors.confirm?.message} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          <Lock className="h-4 w-4" />
          Réinitialiser mon mot de passe
        </Button>
      </form>

      <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        Retour à la connexion
      </Link>
    </div>
  );
}
