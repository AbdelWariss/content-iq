import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="space-y-6 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold">Vérification en cours...</h2>
        </>
      )}
      {status === "success" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Email vérifié !</h2>
            <p className="mt-1 text-sm text-muted-foreground">Votre compte est actif. Bonne génération !</p>
          </div>
          <Link to="/dashboard"><Button className="w-full">Accéder à mon espace</Button></Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Lien invalide</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ce lien est invalide ou a expiré (24h).</p>
          </div>
          <Link to="/login"><Button variant="outline" className="w-full">Retour à la connexion</Button></Link>
        </>
      )}
    </div>
  );
}
