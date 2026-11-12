import type { Garment, Trip, TripDay } from "../src/lib/domain/types.ts";

let n = 0;
export const id = () => `id${(++n).toString().padStart(8, "0")}`;

export function garment(p: Partial<Garment> & Pick<Garment, "name" | "category">): Garment {
  return {
    id: id(),
    waterproof: false,
    volume: "medium",
    preference: "neutral",
    formality: "casual",
    warmth: "medium",
    createdAt: `2026-01-01T00:00:${String(n).padStart(2, "0")}Z`,
    updatedAt: "2026-01-01T00:00:00Z",
    ...p,
  };
}

export function day(date: string, p: Partial<TripDay> = {}): TripDay {
  return { date, city: "Lisboa", activities: [], discardedKeys: [], ...p };
}

export function trip(days: TripDay[], p: Partial<Trip> = {}): Trip {
  return {
    id: "trip0001",
    name: "Test",
    stops: [{ id: "s1", city: "Lisboa", startDate: days[0].date, endDate: days[days.length - 1].date }],
    baggage: "cabina",
    laundry: false,
    days,
    packed: {},
    extras: [],
    createdAt: "",
    updatedAt: "",
    ...p,
  };
}

export const ctxBase = () => ({
  usedCounts: new Map<string, number>(),
  previousIds: new Set<string>(),
  baggage: "cabina" as const,
  laundry: false,
  excludeKeys: new Set<string>(),
  newId: id,
  now: "2026-01-01T00:00:00Z",
});
