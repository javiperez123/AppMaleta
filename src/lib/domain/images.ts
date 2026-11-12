// Validación de fotos por contenido (no por extensión ni por el tipo que declara el navegador).

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // tras la compresión en el navegador suele ocupar < 400 KB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const IMAGE_EXT: Record<ImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Detecta el tipo real de imagen por sus primeros bytes. */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}

export type ImageCheck = { ok: true; type: ImageType } | { ok: false; error: string };

export function checkImage(bytes: Uint8Array): ImageCheck {
  if (bytes.length === 0) return { ok: false, error: "El archivo está vacío." };
  if (bytes.length > MAX_UPLOAD_BYTES)
    return { ok: false, error: `La foto pesa demasiado (máximo ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` };
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, error: "Formato no admitido. Usa una foto JPG, PNG o WebP." };
  return { ok: true, type };
}

const IMAGE_ID = /^[a-f0-9]{32}\.(jpg|png|webp)$/;
export function isValidImageId(id: string): boolean {
  return IMAGE_ID.test(id);
}
