import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { RegisterSchema, type RegisterInput } from "@contentiq/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Une minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const watchedPassword = watch("password", "");

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Erreur lors de l'inscription";
      toast({ title: "Inscription échouée", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Créer un compte</h2>
        <p className="text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            placeholder="Abdel Wariss OSSENI"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password", { onChange: (e) => setPassword(e.target.value) })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {(watchedPassword || password) && (
            <div className="grid grid-cols-2 gap-1 pt-1">
              {PASSWORD_RULES.map(({ label, test }) => {
                const ok = test(watchedPassword || password);
                return (
                  <div key={label} className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                    <Check className={`h-3 w-3 ${ok ? "opacity-100" : "opacity-30"}`} />
                    {label}
                  </div>
                );
              })}
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          <UserPlus className="h-4 w-4" />
          Créer mon compte gratuit
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          50 crédits offerts à l'inscription · Aucune carte bancaire requise
        </p>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          ou
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
        }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        S'inscrire avec Google
      </Button>
    </div>
  );
}
