"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Identifiants incorrects");
      }

      // Connexion réussie, redirection vers l'accueil
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-display font-bold text-on-primary text-lg shadow-[0_0_14px_rgba(78,222,163,0.3)] group-hover:scale-105 transition-transform">
              LG
            </div>
            <span className="font-display font-bold text-xl text-white">
              LOBBY<span className="text-primary">GAMER</span>
            </span>
          </Link>
          <h1 className="text-lg font-display font-bold text-white mt-2">
            Connexion à votre compte
          </h1>
          <p className="text-xs text-on-surface-variant">
            Rejoignez des escouades compétitives ou chill en quelques secondes.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Adresse Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-on-surface-variant/60 pointer-events-none" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@gamer.fr"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-on-surface-variant/60 pointer-events-none" aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se Connecter</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-surface-container-high/60">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            Créer un compte Joueur
          </Link>
        </div>
      </div>
    </div>
  );
}
