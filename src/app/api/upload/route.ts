import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier image n'a été fourni." },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Veuillez envoyer une image JPG, PNG, WEBP, GIF ou SVG." },
        { status: 400 }
      );
    }

    // Limite de taille (5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image dépasse la taille maximale autorisée (5 Mo)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Détermination de l'extension
    let ext = "png";
    if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/svg+xml") ext = "svg";

    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    
    // Essai 1 : Écriture dans public/uploads
    // Essai 2 (Fallback si droits restreints) : Écriture dans /tmp/uploads
    let saved = false;
    const targetDirs = [
      path.join(process.cwd(), "public", "uploads"),
      path.join("/tmp", "uploads"),
    ];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, buffer);
        saved = true;
        break;
      } catch (err) {
        console.warn(`Échec écriture dans ${dir}, essai du répertoire suivant:`, err);
      }
    }

    if (!saved) {
      throw new Error("Impossible d'écrire le fichier sur le disque (droits d'accès insuffisants)");
    }

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "Image téléversée avec succès",
      url: publicUrl,
    });
  } catch (error: any) {
    console.error("Erreur POST /api/upload:", error);
    return NextResponse.json(
      { error: error?.message || "Échec du téléversement de l'image." },
      { status: 500 }
    );
  }
}
