import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateReviewSchema } from "@/lib/validations";
import { updateUserReputation } from "@/lib/reputation";

/**
 * POST /api/reviews
 * Enregistre une évaluation de comportement (Fair-play / Karma) après une session de jeu partagée.
 * Règles strictes :
 * 1. Un joueur ne peut pas s'évaluer lui-même.
 * 2. L'évaluateur et le joueur évalué doivent tous deux avoir participé au même ticket.
 * 3. Une seule évaluation par coéquipier et par ticket.
 * 4. Recalcul automatique de la réputation du joueur évalué.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reviewerId = req.headers.get("x-user-id") || body.reviewerId;

    if (!reviewerId) {
      return NextResponse.json(
        { error: "Authentification requise pour évaluer un joueur" },
        { status: 401 }
      );
    }

    // Validation du schéma Zod
    const validation = CreateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données d'évaluation invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { ticketId, targetUserId, rating, comment, tags } = validation.data;

    // Règle 1 : Interdiction de s'auto-évaluer
    if (reviewerId === targetUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous évaluer vous-même" },
        { status: 400 }
      );
    }

    // Règle 2 : Vérification de la participation des deux joueurs au ticket
    const participants = await prisma.participant.findMany({
      where: {
        ticketId,
        userId: { in: [reviewerId, targetUserId] },
        status: "ACCEPTED",
      },
    });

    if (participants.length < 2) {
      return NextResponse.json(
        {
          error:
            "Évaluation impossible : les deux joueurs doivent avoir partagé et validé cette session de jeu",
        },
        { status: 403 }
      );
    }

    // Règle 3 & 4 : Création de l'évaluation + recalcul du score en transaction
    const review = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          ticketId,
          reviewerId,
          targetUserId,
          rating,
          comment,
          tags: tags ?? [],
        },
      });

      return createdReview;
    });

    // Recalcul du karma global du joueur évalué
    const newReputationScore = await updateUserReputation(targetUserId);

    return NextResponse.json(
      {
        success: true,
        message: "Évaluation enregistrée avec succès",
        data: {
          review,
          newReputationScore,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Gestion de la violation de contrainte unique Prisma (P2002)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Vous avez déjà évalué ce joueur pour cette session de jeu" },
        { status: 409 }
      );
    }

    console.error("Erreur POST /api/reviews:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'évaluation" },
      { status: 500 }
    );
  }
}
