"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProfileEditPage() {
  const router = useRouter();
  const [bio, setBio] = useState(
    "Joueur compétitif sur Valorant et CS2. Toujours fair-play, focus endgame et communication claire."
  );
  const [age, setAge] = useState(24);
  const [primaryPlatform, setPrimaryPlatform] = useState("PC");
  const [playerType, setPlayerType] = useState("COMPETITIVE");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/users/user-alex", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          age: Number(age),
          primaryPlatform,
          playerType,
        }),
      });

      // Simulation de confirmation réussie
      setSavedSuccess(true);
      setTimeout(() => {
        router.push("/profile/alex");
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <Sidebar />

      <main className="ml-72 mt-16 p-6 flex flex-col gap-6 max-w-3xl">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">
              Paramètres du Profil Joueur
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Personnalisez votre fiche publique pour que les escouades correspondent à vos attentes.
            </p>
          </div>

          <Link
            href="/profile/alex"
            className="text-xs font-display font-semibold text-on-surface-variant hover:text-white"
          >
            ← Retour au profil
          </Link>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Profil mis à jour avec succès ! Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-5 shadow-lg">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150"
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary"
            />
            <div>
              <span className="text-xs font-display font-bold text-white block">
                Photo de profil
              </span>
              <span className="text-[11px] text-on-surface-variant">
                L'avatar est synchronisé avec votre compte Discord ou Steam.
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Biographie & Style de Jeu
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-high rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary resize-none leading-relaxed"
            />
          </div>

          {/* Age & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Âge du joueur
              </label>
              <input
                type="number"
                min={13}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Plateforme Principale
              </label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="PC">PC (Steam / Riot / Battle.net)</option>
                <option value="PLAYSTATION">PlayStation 5 / PS4</option>
                <option value="XBOX">Xbox Series X|S</option>
                <option value="SWITCH">Nintendo Switch</option>
              </select>
            </div>
          </div>

          {/* Player Style */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Style de Joueur
            </label>
            <select
              value={playerType}
              onChange={(e) => setPlayerType(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="COMPETITIVE">Compétitif / Tryhard (Objectif Victoire)</option>
              <option value="CHILL">Chill / Détente (Bonne humeur avant tout)</option>
              <option value="STRATEGIST">Stratège / Leader (Callouts & Rotations)</option>
              <option value="CHATTY">Bavard / Convivial (Social gaming)</option>
              <option value="HARDCORE">Hardcore (Grind intensif)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
            <Link
              href="/profile/alex"
              className="px-4 py-2 rounded-xl text-xs font-display font-semibold text-on-surface-variant hover:text-white"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(78,222,163,0.3)] disabled:opacity-50 transition-all"
            >
              {isSaving ? "Enregistrement..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
