import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { toast } from "@/hooks/use-toast";

const Schema = z.object({ email: z.string().email("Email invalide") });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(Schema),
  });

  async function onSubmit({ email }: { email: string }) {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Email envoyé !</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Si un compte existe pour <strong>{getValues("email")}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
        </div>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Mot de passe oublié</h2>
        <p className="text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            {...register("email")}
            error={errors.email?.message}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          <Send className="h-4 w-4" />
          Envoyer le lien
        </Button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Retour à la connexion
      </Link>
    </div>
  );
}
