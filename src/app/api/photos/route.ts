import { NextResponse } from "next/server";
import { getCurrentUser, rateLimit } from "@/server/auth";
import { saveImage } from "@/server/data";
import { checkImage, MAX_UPLOAD_BYTES } from "@/lib/domain/images";

// Sube una foto de prenda del usuario autenticado. Valida tamaño y tipo real por contenido.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para subir fotos." }, { status: 401 });
  if (!rateLimit(`upload:${user.id}`, 120, 60 * 60_000))
    return NextResponse.json({ error: "Has subido demasiadas fotos seguidas. Espera un poco." }, { status: 429 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024)
    return NextResponse.json({ error: "La foto pesa demasiado (máximo 6 MB)." }, { status: 413 });

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "No se ha recibido ninguna foto." }, { status: 400 });
  }
  if (!file || typeof file === "string")
    return NextResponse.json({ error: "No se ha recibido ninguna foto." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkImage(bytes);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 415 });

  const imageId = await saveImage(user.id, bytes, check.type);
  return NextResponse.json({ imageId }, { status: 201 });
}
