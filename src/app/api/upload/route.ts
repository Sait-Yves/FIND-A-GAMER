import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
        { error: "Format non supporté. Veuillez envoyer une image JPG, PNG, WEBP ou GIF." },
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
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "Image téléversée avec succès",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Erreur POST /api/upload:", error);
    return NextResponse.json(
      { error: "Échec du téléversement de l'image." },
      { status: 500 }
    );
  }
}

