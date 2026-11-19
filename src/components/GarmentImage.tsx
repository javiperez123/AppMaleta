import { Footprints, Glasses, Shirt, Umbrella, Waves } from "lucide-react";
import type { Garment } from "@/lib/domain/types";
import { colorHexFor } from "@/lib/domain/labels";

const ICONS = {
  top: Shirt,
  bottom: Shirt,
  dress: Shirt,
  outerwear: Umbrella,
  shoes: Footprints,
  swimwear: Waves,
  accessory: Glasses,
} as const;

/** Foto de la prenda (servida solo a su dueño) o un marcador con su color si no tiene foto. */
export function GarmentImage({
  garment,
  className = "",
  sizes = "lg",
  thumb = false,
}: {
  garment: Pick<Garment, "imageId" | "name" | "category" | "color" | "colorHex">;
  className?: string;
  sizes?: "sm" | "lg";
  /** Pide la versión miniatura (200px WebP) — ideal en listas */
  thumb?: boolean;
}) {
  if (garment.imageId) {
    const src = `/api/photos/${garment.imageId}${thumb ? "?s=t" : ""}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fotos privadas servidas por /api/photos con la cookie de sesión; el optimizador de next/image no puede autenticarse
      <img
        src={src}
        alt={garment.name}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const Icon = ICONS[garment.category];
  const hex = garment.colorHex || colorHexFor(garment.color);
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-paper-2 ${className}`}
      role="img"
      aria-label={`${garment.name} (sin foto)`}
    >
      <Icon size={sizes === "sm" ? 20 : 36} strokeWidth={1.5} style={{ color: hex || "#6b6258" }} aria-hidden="true" />
    </div>
  );
}
