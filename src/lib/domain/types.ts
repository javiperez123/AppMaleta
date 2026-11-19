// Modelo de dominio compartido por servidor, cliente y motor de recomendaciones.
// Importante: este módulo no importa nada con alias "@/" para que las pruebas
// con `node --test` puedan cargarlo directamente.

export const GARMENT_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "swimwear",
  "accessory",
] as const;
export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

export const FORMALITIES = ["basic", "casual", "smart-casual", "elegant"] as const;
export type GarmentFormality = (typeof FORMALITIES)[number];

export const WARMTHS = ["light", "medium", "warm"] as const;
export type GarmentWarmth = (typeof WARMTHS)[number];

export const VOLUMES = ["low", "medium", "high"] as const;
export type GarmentVolume = (typeof VOLUMES)[number];

export const PREFERENCES = ["love", "neutral", "avoid"] as const;
export type GarmentPreference = (typeof PREFERENCES)[number];

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  /** Nombre del color en español, p. ej. "Azul marino". Opcional: puede faltar. */
  color?: string;
  /** Color aproximado detectado en la foto (sugerencia editable). */
  colorHex?: string;
  formality?: GarmentFormality;
  warmth?: GarmentWarmth;
  waterproof: boolean;
  volume: GarmentVolume;
  preference: GarmentPreference;
  imageId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const ACTIVITY_TYPES = [
  "sightseeing",
  "work",
  "dinner",
  "nightlife",
  "beach",
  "outdoor",
  "transit",
  "relax",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Activity {
  id: string;
  type: ActivityType;
  /** Texto libre opcional del usuario ("Cena en casa de Ana"). */
  label?: string;
}

export const BAGGAGE_TYPES = ["mochila", "cabina", "grande"] as const;
export type BaggageType = (typeof BAGGAGE_TYPES)[number];

export type WeatherSource = "forecast" | "historical" | "manual";

export interface DayWeather {
  tempMin: number;
  tempMax: number;
  /** Probabilidad de lluvia (0-100) si es previsión; en histórico/manual: 100 = llovió / habrá lluvia. */
  rainChance: number;
  source: WeatherSource;
  /** Texto de procedencia mostrado al usuario. */
  sourceLabel: string;
}

export interface Look {
  id: string;
  garmentIds: string[];
  /** Explicaciones de por qué se eligió cada prenda. */
  reasons: string[];
  /** Avisos: faltan prendas, datos incompletos, sin previsión... */
  warnings: string[];
  /** true si se basa en información incompleta (sin clima o con prendas sin datos). */
  approximate: boolean;
  /** true si el usuario lo ha modificado a mano. */
  edited: boolean;
  favorite: boolean;
  createdAt: string;
}

export interface TripDay {
  date: string; // YYYY-MM-DD
  city: string;
  activities: Activity[];
  weather?: DayWeather;
  look?: Look;
  /** Claves de combinaciones descartadas por el usuario para este día. */
  discardedKeys: string[];
}

export interface TripStop {
  id: string;
  city: string;
  startDate: string;
  endDate: string;
  latitude?: number;
  longitude?: number;
  country?: string;
}

export interface PackingExtra {
  id: string;
  label: string;
  packed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  stops: TripStop[];
  baggage: BaggageType;
  laundry: boolean;
  notes?: string;
  days: TripDay[];
  /** Estado del checklist de maleta por clave (id de prenda o clave de básico). */
  packed: Record<string, boolean>;
  extras: PackingExtra[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteLook {
  id: string;
  name: string;
  garmentIds: string[];
  tripId?: string;
  date?: string;
  createdAt: string;
}

export interface UserData {
  version: 1;
  garments: Garment[];
  trips: Trip[];
  favorites: FavoriteLook[];
  onboardingDismissed?: boolean;
}

export function emptyUserData(): UserData {
  return { version: 1, garments: [], trips: [], favorites: [] };
}
