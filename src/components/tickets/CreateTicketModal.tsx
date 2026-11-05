"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, AlertCircle } from "lucide-react";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newTicket: any) => void;
}

const GAME_PRESETS = [
  {
    name: "Apex Legends",
    rawgId: 3498,
    defaultPlayers: 3,
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
  },
  {
    name: "Valorant",
    rawgId: 415171,
    defaultPlayers: 5,
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
  },
  {
    name: "Helldivers 2",
    rawgId: 968798,
    defaultPlayers: 4,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
  },
  {
    name: "Warzone 2",
    rawgId: 422,
    defaultPlayers: 4,
    coverUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800",
  },
  {
    name: "Rocket League",
    rawgId: 3272,
    defaultPlayers: 3,
    coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
  },
  {
    name: "Counter-Strike 2",
    rawgId: 416,
    defaultPlayers: 5,
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
  },
  {
    name: "Grand Theft Auto V",
    rawgId: 3498,
    defaultPlayers: 4,
    coverUrl: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  },
  {
    name: "Rainbow Six Siege",
    rawgId: 58751,
    defaultPlayers: 5,
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
  },
];

export function CreateTicketModal({ isOpen, onClose, onCreated }: CreateTicketModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGameName, setSelectedGameName] = useState(GAME_PRESETS[0].name);
  const [maxPlayers, setMaxPlayers] = useState(GAME_PRESETS[0].defaultPlayers);
  const [is18Plus, setIs18Plus] = useState(false);
  const [micRequired, setMicRequired] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState("CROSSPLAY");
  const [requiredPlayerType, setRequiredPlayerType] = useState("COMPETITIVE");
  const [customRules, setCustomRules] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPreset = GAME_PRESETS.find((g) => g.name === selectedGameName) || GAME_PRESETS[0];

  const handleGameChange = (gameName: string) => {
    setSelectedGameName(gameName);
    const preset = GAME_PRESETS.find((g) => g.name === gameName);
    if (preset) {
      setMaxPlayers(preset.defaultPlayers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          rawgGameId: currentPreset.rawgId,
          gameTitle: currentPreset.name,
          gameSlug: currentPreset.name.toLowerCase().replace(/\s+/g, "-"),
          gameCoverUrl: currentPreset.coverUrl,
          maxPlayers: Number(maxPlayers),
          is18Plus,
          micRequired,
          targetPlatform,
          requiredPlayerType,
          customRules: customRules || null,
          language: "FR",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de création du ticket");
      }

      if (onCreated) {
        onCreated(data.data);
      }

      onClose();
      router.push(`/tickets/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ticket-modal-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-surface-container border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 id="create-ticket-modal-title" className="text-lg font-display font-bold text-white tracking-wide">
              Créer un Salon de Jeu (Ticket LFG)
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la boîte de création de salon"
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="create-ticket-title" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Titre du Salon *
            </label>
            <input
              id="create-ticket-title"
              type="text"
              required
              minLength={5}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: TRIO RANKED — GRIND MASTER / DIAMANT II+"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-ticket-game" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Jeu Vidéo *
              </label>
              <select
                id="create-ticket-game"
                value={selectedGameName}
                onChange={(e) => handleGameChange(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
              >
                {GAME_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="create-ticket-maxplayers" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Capacité Max (Joueurs) *
              </label>
              <input
                id="create-ticket-maxplayers"
                type="number"
                min={2}
                max={32}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="create-ticket-desc" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Description & Objectifs *
            </label>
            <textarea
              id="create-ticket-desc"
              required
              minLength={10}
              maxLength={2000}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez vos attentes, style de jeu, ambiance..."
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl p-3 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="create-ticket-platform" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Plateforme
              </label>
              <select
                id="create-ticket-platform"
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              >
                <option value="CROSSPLAY">Crossplay (Toutes)</option>
                <option value="PC">PC Uniquement</option>
                <option value="PLAYSTATION">PlayStation</option>
                <option value="XBOX">Xbox</option>
              </select>
            </div>

            <div>
              <label htmlFor="create-ticket-playertype" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Style Recherché
              </label>
              <select
                id="create-ticket-playertype"
                value={requiredPlayerType}
                onChange={(e) => setRequiredPlayerType(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              >
                <option value="COMPETITIVE">Compétitif / Tryhard</option>
                <option value="CHILL">Chill / Détente</option>
                <option value="HARDCORE">Hardcore</option>
                <option value="STRATEGIST">Stratège</option>
              </select>
            </div>

            <div>
              <span className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Règles de salon
              </span>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={micRequired}
                    onChange={(e) => setMicRequired(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span>Micro Obligatoire</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is18Plus}
                    onChange={(e) => setIs18Plus(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span>Majeurs (+18 ans)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="create-ticket-rules" className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Règles personnalisées / Notes (optionnel)
            </label>
            <input
              id="create-ticket-rules"
              type="text"
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder="Ex: Pas de rage quit, Discord requis, rotation zone rapide"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-display font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(78,222,163,0.3)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Création en cours..." : "Publier le Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
