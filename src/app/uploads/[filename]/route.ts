import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    const sanitizedFilename = path.basename(filename);

    // Chemins possibles : public/uploads puis /tmp/uploads (fallback Docker)
    const pathsToCheck = [
      path.join(process.cwd(), "public", "uploads", sanitizedFilename),
      path.join("/tmp", "uploads", sanitizedFilename),
    ];

    let targetPath: string | null = null;
    for (const p of pathsToCheck) {
      if (fs.existsSync(p)) {
        targetPath = p;
        break;
      }
    }

    if (!targetPath) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetPath);
    const ext = path.extname(sanitizedFilename).toLowerCase();

    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Erreur GET /uploads/[filename]:", error);
    return NextResponse.json({ error: "Erreur lecture fichier" }, { status: 500 });
  }
}
