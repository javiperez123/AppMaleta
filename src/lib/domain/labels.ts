import type {
  ActivityType,
  BaggageType,
  GarmentCategory,
  GarmentFormality,
  GarmentPreference,
  GarmentVolume,
  GarmentWarmth,
} from "./types.ts";

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: "Parte de arriba",
  bottom: "Parte de abajo",
  dress: "Vestido o mono",
  outerwear: "Abrigo o chaqueta",
  shoes: "Calzado",
  swimwear: "Baño",
  accessory: "Accesorio",
};

export const CATEGORY_PLURAL: Record<GarmentCategory, string> = {
  top: "Partes de arriba",
  bottom: "Partes de abajo",
  dress: "Vestidos y monos",
  outerwear: "Abrigos",
  shoes: "Calzado",
  swimwear: "Baño",
  accessory: "Accesorios",
};

export const FORMALITY_LABELS: Record<GarmentFormality, string> = {
  basic: "Básico / deporte",
  casual: "Casual",
  "smart-casual": "Arreglado informal",
  elegant: "Elegante",
};

export const WARMTH_LABELS: Record<GarmentWarmth, string> = {
  light: "Fresca (calor)",
  medium: "Entretiempo",
  warm: "De abrigo (frío)",
};

export const VOLUME_LABELS: Record<GarmentVolume, string> = {
  low: "Ocupa poco",
  medium: "Ocupa normal",
  high: "Ocupa mucho",
};

export const PREFERENCE_LABELS: Record<GarmentPreference, string> = {
  love: "Me encanta",
  neutral: "Normal",
  avoid: "Prefiero no llevarla",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  sightseeing: "Turismo y paseos",
  work: "Trabajo o reunión",
  dinner: "Cena especial",
  nightlife: "Fiesta o noche",
  beach: "Playa o piscina",
  outdoor: "Deporte o senderismo",
  transit: "Día de traslado",
  relax: "Relax",
};

export const BAGGAGE_LABELS: Record<BaggageType, string> = {
  mochila: "Mochila",
  cabina: "Maleta de cabina",
  grande: "Maleta facturada",
};

export const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: "Blanco", hex: "#F7F5F0" },
  { name: "Crudo", hex: "#E9E1CF" },
  { name: "Beige", hex: "#D6C3A0" },
  { name: "Camel", hex: "#B98A55" },
  { name: "Marrón", hex: "#6B4A33" },
  { name: "Gris", hex: "#9A9A96" },
  { name: "Negro", hex: "#1E1E1E" },
  { name: "Azul marino", hex: "#22304F" },
  { name: "Azul", hex: "#3E6DB5" },
  { name: "Vaquero", hex: "#5A7699" },
  { name: "Verde", hex: "#4D7A4E" },
  { name: "Caqui", hex: "#8A8459" },
  { name: "Amarillo", hex: "#E3C04A" },
  { name: "Naranja", hex: "#D9773A" },
  { name: "Rojo", hex: "#B53A32" },
  { name: "Burdeos", hex: "#6E2433" },
  { name: "Rosa", hex: "#E3A4B0" },
  { name: "Morado", hex: "#6C4C8C" },
  { name: "Estampado", hex: "" },
];

export function colorHexFor(name?: string): string | undefined {
  if (!name) return undefined;
  return COLOR_SWATCHES.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex || undefined;
}

/** Devuelve el nombre de color de la paleta más cercano a un hex (sugerencia). */
export function nearestColorName(hex: string): string | undefined {
  const parse = (h: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const target = parse(hex);
  if (!target) return undefined;
  let best: { name: string; d: number } | undefined;
  for (const sw of COLOR_SWATCHES) {
    const c = parse(sw.hex);
    if (!c) continue;
    const d = (c[0] - target[0]) ** 2 + (c[1] - target[1]) ** 2 + (c[2] - target[2]) ** 2;
    if (!best || d < best.d) best = { name: sw.name, d };
  }
  return best?.name;
}
