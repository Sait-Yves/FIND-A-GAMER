"use client";

import { useState } from "react";

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  targetUserId: string;
  targetUsername: string;
  onReviewSubmitted?: (newScore: number) => void;
}

export function SubmitReviewModal({
  isOpen,
  onClose,
  ticketId,
  targetUserId,
  targetUsername,
  onReviewSubmitted,
}: SubmitReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "FAIR_PLAY",
    "GOOD_COMMUNICATION",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableTags = [
    { id: "FAIR_PLAY", label: "Fair-Play Exemplaire", color: "text-primary" },
    { id: "GOOD_COMMUNICATION", label: "Bonne Communication", color: "text-tertiary" },
    { id: "TEAM_PLAYER", label: "Esprit d'Équipe", color: "text-secondary" },
    { id: "LEADER", label: "Leader Positif", color: "text-white" },
    { id: "PATIENT", label: "Patient & Pédagogue", color: "text-primary" },
    { id: "PUNCTUAL", label: "Ponctuel", color: "text-tertiary" },
    { id: "RAGE_QUIT", label: "Abandon / Rage Quit", color: "text-error" },
    { id: "NO_MIC", label: "Pas de micro malgré consigne", color: "text-error" },
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "sarah-user-id", // Simule l'utilisateur connecté évaluateur
        },
        body: JSON.stringify({
          ticketId,
          targetUserId,
          rating: Number(rating),
          comment,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible d'enregistrer l'évaluation");
      }

      if (onReviewSubmitted && data.data?.newReputationScore) {
        onReviewSubmitted(data.data.newReputationScore);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-surface-container border border-surface-container-high rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              verified
            </span>
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              Évaluer @{targetUsername}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Note de 1 à 5 étoiles */}
          <div className="flex flex-col gap-2 text-center items-center py-2">
            <span className="text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider">
              Note de Comportement
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    star <= rating ? "text-primary" : "text-surface-container-high"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-white">
              {rating === 5 && "Exemplaire & Respectueux"}
              {rating === 4 && "Très bon coéquipier"}
              {rating === 3 && "Correct / Moyen"}
              {rating === 2 && "Comportement décevant"}
              {rating === 1 && "Toxique ou Anti-jeu"}
            </span>
          </div>

          {/* Badges Comportementaux */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Badges Comportementaux (Maximum 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all border ${
                      isSelected
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(78,222,163,0.25)]"
                        : "bg-surface-container-low border-surface-container-high text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commentaire optionnel */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Commentaire post-match (optionnel)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre retour d'expérience sur cette session..."
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl p-3 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-display font-semibold text-on-surface-variant hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(78,222,163,0.3)] disabled:opacity-50 transition-all"
            >
              {loading ? "Enregistrement..." : "Valider l'Évaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
