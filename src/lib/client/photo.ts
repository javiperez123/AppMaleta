// Procesado de fotos en el navegador: reduce tamaño (mejor en conexiones lentas),
// elimina metadatos EXIF (incluida la ubicación GPS) al re-codificar y sugiere un color.

const MAX_SIDE = 1280;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* algunos navegadores no aceptan opciones: probamos con <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new Error("decode");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, q: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, q));
}

/** Color medio de la zona central (donde suele estar la prenda), ignorando fondos muy claros. */
function dominantColor(ctx: CanvasRenderingContext2D, w: number, h: number): string | undefined {
  const x0 = Math.floor(w * 0.3);
  const y0 = Math.floor(h * 0.3);
  const cw = Math.max(1, Math.floor(w * 0.4));
  const ch = Math.max(1, Math.floor(h * 0.4));
  const { data } = ctx.getImageData(x0, y0, cw, ch);
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const step = Math.max(4, Math.floor(data.length / 4 / 4000) * 4);
  for (let i = 0; i < data.length; i += step) {
    const R = data[i],
      G = data[i + 1],
      B = data[i + 2];
    if (R > 245 && G > 245 && B > 245) continue;
    r += R;
    g += G;
    b += B;
    n++;
  }
  if (!n) return "#f7f5f0";
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export async function processPhoto(file: File): Promise<{ blob: Blob; dominantHex?: string }> {
  const img = await decode(file);
  const w0 = "naturalWidth" in img ? img.naturalWidth : img.width;
  const h0 = "naturalHeight" in img ? img.naturalHeight : img.height;
  if (!w0 || !h0) throw new Error("decode");
  const scale = Math.min(1, MAX_SIDE / Math.max(w0, h0));
  const w = Math.round(w0 * scale);
  const h = Math.round(h0 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No se ha podido procesar la foto en este navegador.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  if ("close" in img) img.close();
  let dominantHex: string | undefined;
  try {
    dominantHex = dominantColor(ctx, w, h);
  } catch {
    dominantHex = undefined;
  }
  let blob = await toBlob(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.85);
  if (!blob) throw new Error("No se ha podido comprimir la foto.");
  return { blob, dominantHex };
}
