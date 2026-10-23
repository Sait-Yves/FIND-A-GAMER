import prisma from "@/lib/prisma";

/**
 * Recalcule et met à jour le score de réputation moyen d'un joueur suite à un nouvel avis.
 * Échelle par défaut : Pourcentage de karma sur 100.
 */
export async function updateUserReputation(targetUserId: string): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: { targetUserId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        reputationScore: 100.0,
        totalReviews: 0,
      },
    });
    return 100.0;
  }

  // Calcul de la moyenne des notes (sur 5 étoiles ramenée à un pourcentage sur 100)
  const sumRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = sumRating / reviews.length; // 1.0 à 5.0
  const normalizedScore = Math.round((averageRating / 5) * 100 * 10) / 10; // ex: 4.5 -> 90.0%

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      reputationScore: normalizedScore,
      totalReviews: reviews.length,
    },
  });

  return normalizedScore;
}
