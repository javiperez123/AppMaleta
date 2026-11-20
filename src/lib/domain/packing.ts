import { CATEGORY_LABELS } from "./labels.ts";
import type { BaggageType, Garment, GarmentCategory, GarmentVolume, Trip } from "./types.ts";

export interface PackingGarment {
  garment: Garment;
  uses: number;
  dates: string[];
}

export interface PackingBasic {
  key: string;
  label: string;
  quantity: number;
}

export interface PackingList {
  groups: { category: GarmentCategory; label: string; items: PackingGarment[] }[];
  totalGarments: number;
  basics: PackingBasic[];
  /** Ids de prendas usadas en looks que ya no existen en el armario. */
  missingGarmentIds: string[];
  daysWithoutLook: string[];
  capacity: { used: number; max: number; percent: number };
  packedCount: number;
  totalCount: number;
}

const VOLUME_POINTS: Record<GarmentVolume, number> = { low: 1, medium: 2, high: 3 };
const CAPACITY: Record<BaggageType, number> = { mochila: 14, cabina: 24, grande: 48 };
const ORDER: GarmentCategory[] = ["outerwear", "top", "dress", "bottom", "shoes", "swimwear", "accessory"];

export function buildPackingList(trip: Trip, garments: Garment[]): PackingList {
  const byId = new Map(garments.map((g) => [g.id, g]));
  const usage = new Map<string, string[]>();
  const missing = new Set<string>();
  const daysWithoutLook: string[] = [];
  for (const d of trip.days) {
    if (!d.look || d.look.garmentIds.length === 0) {
      daysWithoutLook.push(d.date);
      continue;
    }
    for (const id of d.look.garmentIds) {
      if (!byId.has(id)) {
        missing.add(id);
        continue;
      }
      usage.set(id, [...(usage.get(id) ?? []), d.date]);
    }
  }
  const items: PackingGarment[] = [...usage.entries()].map(([id, dates]) => ({
    garment: byId.get(id)!,
    uses: dates.length,
    dates,
  }));
  const groups = ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: items.filter((i) => i.garment.category === category).sort((a, b) => b.uses - a.uses),
  })).filter((g) => g.items.length > 0);

  const nDays = trip.days.length;
  const changes = trip.laundry ? Math.min(nDays, 4) : nDays;
  const basics: PackingBasic[] = nDays
    ? [
        { key: "basic:underwear", label: "Ropa interior", quantity: changes },
        { key: "basic:socks", label: "Calcetines", quantity: changes },
        { key: "basic:sleep", label: "Pijama", quantity: 1 },
      ]
    : [];

  const used = items.reduce((s, i) => s + VOLUME_POINTS[i.garment.volume] + (i.garment.category === "shoes" ? 1 : 0), 0);
  const max = CAPACITY[trip.baggage];
  const keys = [...items.map((i) => i.garment.id), ...basics.map((b) => b.key), ...trip.extras.map((e) => e.id)];
  const packedCount = keys.filter((k) => trip.packed[k] || trip.extras.find((e) => e.id === k)?.packed).length;

  return {
    groups,
    totalGarments: items.length,
    basics,
    missingGarmentIds: [...missing],
    daysWithoutLook,
    capacity: { used, max, percent: Math.min(100, Math.round((used / max) * 100)) },
    packedCount,
    totalCount: keys.length,
  };
}
