"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  User,
  Upload,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";

const AVATAR_PRESETS = [
  "/avatars/avatar-alex.svg",
  "/avatars/avatar-sarah.svg",
  "/avatars/avatar-default.svg",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
];

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string>("me");
  const [username, setUsername] = useState("Valkyrie_FR");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
  );
  const [bio, setBio] = useState(
    "Joueur compétitif sur Valorant et Apex. Toujours fair-play, focus endgame et communication claire."
  );
  const [age, setAge] = useState(24);
  const [primaryPlatform, setPrimaryPlatform] = useState("PC");
  const [playerType, setPlayerType] = useState("COMPETITIVE");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);

  // Charger les données de l'utilisateur actuel
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setUserId(json.user.id);
          setUsername(json.user.username);
          if (json.user.avatarUrl) setAvatarUrl(json.user.avatarUrl);
          if (json.user.bio) setBio(json.user.bio);
          if (json.user.age) setAge(json.user.age);
          if (json.user.primaryPlatform) setPrimaryPlatform(json.user.primaryPlatform);
          if (json.user.playerType) setPlayerType(json.user.playerType);
        }
      } catch (e) {
        console.error("Erreur chargement profil:", e);
      }
    }
    loadCurrentUser();
  }, []);

  // Gestion de l'upload local de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec du téléversement");
      }

      setAvatarUrl(data.url);
      setSavedSuccess(true);

      // Sauvegarde immédiate de l'avatar en base de données
      await fetch(`/api/users/${userId || "me"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.url }),
      });
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = async (preset: string) => {
    setAvatarUrl(preset);
    setSavedSuccess(true);
    try {
      await fetch(`/api/users/${userId || "me"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: preset }),
      });
    } catch (err: any) {
      console.warn("Échec sauvegarde preset avatar:", err);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setShowUrlField(false);
      setCustomUrlInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/users/${userId || "me"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          bio,
          age: Number(age),
          primaryPlatform,
          playerType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'enregistrement");
      }

      setSavedSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 800);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container avec espacement supérieur correct (pt-24) pour ne jamais masquer le haut sous la navbar */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Profil & Personnalisation
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
                Paramètres du Profil Joueur
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Modifiez votre avatar, votre biographie et vos préférences de matchmaking.
              </p>
            </div>

            <Link
              href={`/profile/${username}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface text-xs font-display font-semibold text-on-surface-variant hover:text-white border border-surface-container-high transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voir le profil</span>
            </Link>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/40 text-primary text-xs font-bold flex items-center gap-2.5 shadow-[0_0_12px_rgba(78,222,163,0.15)] animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Votre profil et votre image ont été enregistrés avec succès !</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/40 text-error text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-6 shadow-xl"
          >
            {/* ======================================================== */}
            {/* AVATAR MANAGEMENT (UPLOAD + PREVIEWS + PRESETS) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-surface-container/60 border border-surface-container-high">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span>Image de Profil (Avatar)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar Preview Box */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_16px_rgba(78,222,163,0.25)] bg-surface-container-lowest">
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-full h-full object-cover"
                      onError={() =>
                        setAvatarUrl("/avatars/avatar-default.svg")
                      }
                    />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center text-primary text-xs font-bold gap-1">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Upload...</span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex flex-col gap-3 flex-1 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-display font-bold text-white">
                      Personnaliser votre image
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                      Importez une image depuis votre appareil (JPG, PNG, WEBP max 5 Mo) ou choisissez un avatar gaming ci-dessous.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(78,222,163,0.25)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? "Téléversement..." : "Téléverser une image"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlField(!showUrlField)}
                      className="px-3.5 py-2.5 bg-surface-container hover:bg-surface text-on-surface-variant hover:text-white border border-surface-container-high rounded-xl text-xs font-display font-semibold transition-colors"
                    >
                      {showUrlField ? "Fermer URL" : "Lien URL"}
                    </button>
                  </div>

                  {showUrlField && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container-high/60">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://exemple.com/mon-avatar.jpg"
                        className="flex-1 bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        className="px-3 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all"
                      >
                        Appliquer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Preset Avatars */}
              <div className="pt-3 border-t border-surface-container-high/60 flex flex-col gap-2">
                <span className="text-[11px] font-display font-semibold text-on-surface-variant/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                  Avatars Recommandés :
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                        avatarUrl === preset
                          ? "border-primary scale-110 shadow-[0_0_10px_rgba(78,222,163,0.4)]"
                          : "border-surface-container-high opacity-70 hover:opacity-100 hover:border-white"
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* BIO & GENERAL INFO */}
            {/* ======================================================== */}
            <div>
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Biographie & Philosophie de Jeu
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Décrivez votre style, vos rôles favoris et vos horaires de jeu..."
                className="w-full bg-surface-container border border-surface-container-high rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-primary resize-none leading-relaxed"
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
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Plateforme Principale
                </label>
                <select
                  value={primaryPlatform}
                  onChange={(e) => setPrimaryPlatform(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="PC">PC (Steam / Riot / Battle.net)</option>
                  <option value="PLAYSTATION">PlayStation 5 / PS4</option>
                  <option value="XBOX">Xbox Series X|S</option>
                  <option value="SWITCH">Nintendo Switch</option>
                  <option value="CROSSPLAY">Crossplay (Multi-plateformes)</option>
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
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="COMPETITIVE">Compétitif / Tryhard (Objectif Victoire)</option>
                <option value="CHILL">Chill / Détente (Bonne humeur avant tout)</option>
                <option value="STRATEGIST">Stratège / Leader (Callouts & Rotations)</option>
                <option value="CHATTY">Bavard / Convivial (Social gaming)</option>
                <option value="HARDCORE">Hardcore (Grind intensif)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
              <Link
                href={`/profile/${username}`}
                className="px-4 py-2.5 rounded-xl text-xs font-display font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(78,222,163,0.3)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder les modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
