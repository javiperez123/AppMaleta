import { getCurrentUser } from "@/server/auth";
import { readImage } from "@/server/data";
import { isValidImageId } from "@/lib/domain/images";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const THUMB_SIZE = 200;

// Sirve una foto solo a su propietario.
// ?s=t  → miniatura 200×200 (crop al centro) en WebP — para listas rápidas
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("No autorizado", { status: 401 });
  if (!isValidImageId(id)) return new Response("No encontrada", { status: 404 });

  const buf = await readImage(user.id, id);
  if (!buf) return new Response("No encontrada", { status: 404 });

  const url = new URL(req.url);
  const isThumb = url.searchParams.get("s") === "t";

  let body: Buffer | Uint8Array = buf;
  let contentType = TYPES[id.split(".").pop()!] ?? "application/octet-stream";

  if (isThumb) {
    try {
      // Dynamic import to avoid bundler issues with native module
      const sharp = (await import("sharp")).default;
      const resized = await sharp(buf)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover", position: "centre" })
        .webp({ quality: 75 })
        .toBuffer();
      body = resized;
      contentType = "image/webp";
    } catch {
      // Sharp unavailable or failed — serve original
    }
  }

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Vary": "Accept",
    },
  });
}
