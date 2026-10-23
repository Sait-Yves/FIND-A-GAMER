"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primaryPlatform, setPrimaryPlatform] = useState("PC");
  const [playerType, setPlayerType] = useState("CHILL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setTimeout(() => {
        router.push("/profile/edit");
      }, 500);
    } catch (err: any) {
      setError("Échec de création du compte");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-display font-bold text-on-primary text-lg shadow-[0_0_14px_rgba(78,222,163,0.3)]">
              LG
            </div>
            <span className="font-display font-bold text-xl text-white">
              LOBBY<span className="text-primary">GAMER</span>
            </span>
          </Link>
          <h1 className="text-lg font-display font-bold text-white mt-3">
            Créer un compte Joueur
          </h1>
          <p className="text-xs text-on-surface-variant">
            Rejoignez la communauté de joueurs fair-play et trouvez votre escouade.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Pseudo Gamer
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: Valkyrie_FR"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="valkyrie@gaming.fr"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Plateforme
              </label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="PC">PC</option>
                <option value="PLAYSTATION">PlayStation</option>
                <option value="XBOX">Xbox</option>
                <option value="SWITCH">Switch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Style
              </label>
              <select
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="CHILL">Chill</option>
                <option value="COMPETITIVE">Compétitif</option>
                <option value="STRATEGIST">Stratège</option>
                <option value="HARDCORE">Hardcore</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Création du compte..." : "S'inscrire"}
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-surface-container-high/60">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
