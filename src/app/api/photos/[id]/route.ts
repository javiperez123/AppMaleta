import { getCurrentUser } from "@/server/auth";
import { readImage } from "@/server/data";
import { isValidImageId } from "@/lib/domain/images";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Sirve una foto solo a su propietario: la ruta se resuelve dentro de la carpeta del usuario de la sesión.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("No autorizado", { status: 401 });
  if (!isValidImageId(id)) return new Response("No encontrada", { status: 404 });
  const buf = await readImage(user.id, id);
  if (!buf) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": TYPES[id.split(".").pop()!] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
