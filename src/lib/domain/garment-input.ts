import {
  FORMALITIES,
  GARMENT_CATEGORIES,
  PREFERENCES,
  VOLUMES,
  WARMTHS,
  type GarmentCategory,
  type GarmentFormality,
  type GarmentPreference,
  type GarmentVolume,
  type GarmentWarmth,
} from "./types.ts";
import { isValidImageId } from "./images.ts";

export interface GarmentInput {
  name: string;
  category: GarmentCategory;
  color?: string;
  colorHex?: string;
  formality?: GarmentFormality;
  warmth?: GarmentWarmth;
  waterproof: boolean;
  volume: GarmentVolume;
  preference: GarmentPreference;
  imageId?: string;
  notes?: string;
}

type Get = (k: string) => string | null | undefined;

const oneOf = <T extends string>(list: readonly T[], v: string | null | undefined): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined;

/** Lee y valida los campos de una prenda desde un formulario. */
export function parseGarmentInput(get: Get): { data?: GarmentInput; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = (get("name") ?? "").trim();
  if (!name) errors.name = "Ponle un nombre a la prenda.";
  else if (name.length > 80) errors.name = "El nombre es demasiado largo (máx. 80 caracteres).";
  const category = oneOf(GARMENT_CATEGORIES, get("category"));
  if (!category) errors.category = "Elige el tipo de prenda.";
  const color = (get("color") ?? "").trim().slice(0, 40) || undefined;
  const hexRaw = (get("colorHex") ?? "").trim();
  const colorHex = /^#[0-9a-fA-F]{6}$/.test(hexRaw) ? hexRaw : undefined;
  const imageRaw = (get("imageId") ?? "").trim();
  let imageId: string | undefined;
  if (imageRaw) {
    if (isValidImageId(imageRaw)) imageId = imageRaw;
    else errors.imageId = "La foto no es válida. Vuelve a subirla.";
  }
  const notes = (get("notes") ?? "").trim().slice(0, 300) || undefined;
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    data: {
      name,
      category: category!,
      color,
      colorHex,
      formality: oneOf(FORMALITIES, get("formality")),
      warmth: oneOf(WARMTHS, get("warmth")),
      waterproof: get("waterproof") === "on" || get("waterproof") === "true",
      volume: oneOf(VOLUMES, get("volume")) ?? "medium",
      preference: oneOf(PREFERENCES, get("preference")) ?? "neutral",
      imageId,
      notes,
    },
  };
}

/** Categorías en las que "cuánto abriga" no aplica. */
export const WARMTH_NOT_APPLICABLE = new Set(["shoes", "accessory", "swimwear"]);

/** Campos que faltan para que las recomendaciones sean precisas. */
export function missingFields(g: { category?: string; color?: string; formality?: string; warmth?: string; imageId?: string }): string[] {
  const m: string[] = [];
  if (!g.formality) m.push("estilo");
  if (!g.warmth && !WARMTH_NOT_APPLICABLE.has(g.category ?? "")) m.push("abrigo");
  if (!g.color) m.push("color");
  if (!g.imageId) m.push("foto");
  return m;
}
