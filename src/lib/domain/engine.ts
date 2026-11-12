// Motor de propuestas de looks. Reglas deterministas y explicables:
// solo usa prendas reales del armario y el clima disponible (nunca inventa datos).
import { ACTIVITY_LABELS } from "./labels.ts";
import { WARMTH_NOT_APPLICABLE } from "./garment-input.ts";
import type {
  ActivityType,
  BaggageType,
  Garment,
  GarmentFormality,
  GarmentWarmth,
  Look,
  Trip,
  TripDay,
} from "./types.ts";

const FORMALITY_RANK: Record<GarmentFormality, number> = {
  basic: 0,
  casual: 1,
  "smart-casual": 2,
  elegant: 3,
};
const WARMTH_RANK: Record<GarmentWarmth, number> = { light: 0, medium: 1, warm: 2 };

interface ActivityNeed {
  target: number;
  min: number;
  max: number;
}
const ACTIVITY_NEEDS: Record<ActivityType, ActivityNeed> = {
  sightseeing: { target: 1, min: 0, max: 2 },
  work: { target: 2, min: 2, max: 3 },
  dinner: { target: 2.5, min: 2, max: 3 },
  nightlife: { target: 2, min: 1, max: 3 },
  beach: { target: 0, min: 0, max: 1 },
  outdoor: { target: 0, min: 0, max: 1 },
  transit: { target: 1, min: 0, max: 2 },
  relax: { target: 1, min: 0, max: 2 },
};

const REUSE_WEIGHT: Record<BaggageType, number> = { mochila: 4, cabina: 2.5, grande: 1 };

export function lookKey(garmentIds: string[]): string {
  return [...garmentIds].sort().join("|");
}

export interface DayContext {
  /** Veces que ya se ha usado cada prenda en otros días del viaje. */
  usedCounts: Map<string, number>;
  /** Prendas del día anterior (para variar la parte de arriba). */
  previousIds: Set<string>;
  baggage: BaggageType;
  laundry: boolean;
  /** Combinaciones que no deben repetirse (descartadas o la actual al pedir otra). */
  excludeKeys: Set<string>;
  newId: () => string;
  now: string;
}

interface Need {
  target: number;
  min: number;
  max: number;
  desiredWarmth?: number;
  needsOuter: boolean;
  rainy: boolean;
  beach: boolean;
  label?: string;
}

function dayNeeds(day: TripDay): Need {
  const acts = day.activities.length ? day.activities : [];
  let target = 1;
  let min = 0;
  let max = 3;
  let label: string | undefined;
  if (acts.length) {
    // Manda la actividad más exigente en formalidad.
    const strongest = acts.reduce((a, b) => (ACTIVITY_NEEDS[b.type].target > ACTIVITY_NEEDS[a.type].target ? b : a));
    const n = ACTIVITY_NEEDS[strongest.type];
    target = n.target;
    min = Math.max(...acts.map((a) => ACTIVITY_NEEDS[a.type].min));
    max = Math.max(n.max, min);
    label = strongest.label?.trim() || ACTIVITY_LABELS[strongest.type];
  }
  const w = day.weather;
  let desiredWarmth: number | undefined;
  let needsOuter = false;
  let rainy = false;
  if (w) {
    const mean = (w.tempMin + w.tempMax) / 2;
    desiredWarmth = w.tempMax >= 26 ? 0 : mean <= 11 ? 2 : 1;
    rainy = w.rainChance >= 50;
    needsOuter = w.tempMin < 16 || rainy;
  }
  return { target, min, max, desiredWarmth, needsOuter, rainy, beach: acts.some((a) => a.type === "beach"), label };
}

function formalityOf(g: Garment): number {
  return g.formality ? FORMALITY_RANK[g.formality] : 1;
}

function scoreGarment(g: Garment, need: Need, ctx: DayContext): number {
  let s = 0;
  const f = formalityOf(g);
  s -= Math.abs(f - need.target) * 3;
  if (f < need.min) s -= 20;
  if (f > need.max) s -= 4;
  if (need.desiredWarmth !== undefined && g.category !== "shoes" && g.category !== "accessory") {
    const w = g.warmth ? WARMTH_RANK[g.warmth] : 1;
    s -= Math.abs(w - need.desiredWarmth) * 2.5;
  }
  if (g.preference === "love") s += 2;
  if (g.preference === "avoid") s -= 10;
  if (!g.formality || (!g.warmth && !WARMTH_NOT_APPLICABLE.has(g.category))) s -= 0.5; // a igualdad, preferir prendas con datos completos
  const used = ctx.usedCounts.get(g.id) ?? 0;
  const reuse = REUSE_WEIGHT[ctx.baggage];
  if (g.category === "top" || g.category === "dress") {
    if (used > 0) s += ctx.laundry ? reuse * 0.6 : reuse * 0.3;
    s -= used * (ctx.laundry ? 0.4 : 1.2);
    if (ctx.previousIds.has(g.id)) s -= 4;
  } else if (used > 0) {
    s += reuse;
  }
  if (g.category === "outerwear") {
    if (need.rainy) s += g.waterproof ? 5 : -2;
  }
  // desempate estable
  return s;
}

function best(garments: Garment[], need: Need, ctx: DayContext, n: number): { g: Garment; s: number }[] {
  return garments
    .map((g) => ({ g, s: scoreGarment(g, need, ctx) }))
    .sort((a, b) => b.s - a.s || a.g.createdAt.localeCompare(b.g.createdAt) || a.g.id.localeCompare(b.g.id))
    .slice(0, n);
}

/** Genera una propuesta de look para un día, usando solo prendas del armario. */
export function generateLook(garments: Garment[], day: TripDay, ctx: DayContext): Look {
  const need = dayNeeds(day);
  const by = (c: Garment["category"]) => garments.filter((g) => g.category === c);
  const tops = best(by("top"), need, ctx, 6);
  const bottoms = best(by("bottom"), need, ctx, 6);
  const dresses = best(by("dress"), need, ctx, 4);
  const shoes = best(by("shoes"), need, ctx, 4);
  const outers = need.needsOuter ? best(by("outerwear"), need, ctx, 4) : [];
  const swims = need.beach ? best(by("swimwear"), need, ctx, 2) : [];

  type Combo = { ids: Garment[]; s: number };
  const bases: Combo[] = [];
  for (const t of tops) for (const b of bottoms) bases.push({ ids: [t.g, b.g], s: t.s + b.s });
  for (const d of dresses) bases.push({ ids: [d.g], s: d.s * 2 });
  const shoeOpts: Combo[] = shoes.length ? shoes.map((x) => ({ ids: [x.g], s: x.s })) : [{ ids: [], s: 0 }];
  const outerOpts: Combo[] = outers.length ? outers.map((x) => ({ ids: [x.g], s: x.s })) : [{ ids: [], s: 0 }];
  const swimPart: Garment[] = swims.length ? [swims[0].g] : [];

  const combos: Combo[] = [];
  const baseList = bases.length ? bases : [{ ids: [], s: 0 }];
  for (const b of baseList)
    for (const sh of shoeOpts)
      for (const o of outerOpts) combos.push({ ids: [...b.ids, ...o.ids, ...sh.ids, ...swimPart], s: b.s + sh.s + o.s });
  combos.sort((a, b) => b.s - a.s || lookKey(a.ids.map((g) => g.id)).localeCompare(lookKey(b.ids.map((g) => g.id))));

  const pick = combos.find((c) => !ctx.excludeKeys.has(lookKey(c.ids.map((g) => g.id))));
  const chosen = pick?.ids ?? [];
  const exhausted = !pick && combos.some((c) => c.ids.length > 0);

  const reasons: string[] = [];
  const warnings: string[] = [];
  let approximate = false;

  if (exhausted) warnings.push("Ya has visto todas las combinaciones posibles con tu armario para este día. Añade prendas o elige a mano.");
  if (!bases.length) warnings.push("Te falta ropa base: añade al menos una parte de arriba y una de abajo, o un vestido.");
  if (!shoes.length) warnings.push("No tienes calzado en el armario: añade al menos un par.");

  const w = day.weather;
  if (!w) {
    approximate = true;
    warnings.push("Sin datos del tiempo para este día: la propuesta es aproximada. Puedes indicar la temperatura a mano.");
  } else {
    const rain = w.rainChance >= 50 ? `, ${w.source === "forecast" ? `${w.rainChance} % de probabilidad de lluvia` : "con lluvia"}` : "";
    reasons.push(`Tiempo ${w.source === "historical" ? "estimado" : "previsto"}: ${Math.round(w.tempMin)}–${Math.round(w.tempMax)} °C${rain}.`);
    if (w.source === "historical") approximate = true;
    if (need.needsOuter && !outers.length) {
      warnings.push(
        need.rainy
          ? "Se espera lluvia y no tienes abrigo o chubasquero en el armario."
          : "Hará fresco y no tienes ninguna chaqueta o abrigo en el armario.",
      );
    }
    if (need.rainy && outers.length && !chosen.some((g) => g.category === "outerwear" && g.waterproof))
      warnings.push("Ninguna de tus chaquetas está marcada como impermeable.");
  }

  if (need.label) reasons.push(`Pensado para: ${need.label}.`);
  if (need.beach && !swims.length) warnings.push("Tienes un plan de playa o piscina y no hay ropa de baño en tu armario.");
  if (day.activities.some((a) => a.type === "beach") && need.min >= 2)
    warnings.push("Hay planes muy distintos este día: quizá necesites cambiarte entre uno y otro.");

  for (const g of chosen) {
    if (formalityOf(g) < need.min) {
      warnings.push(`«${g.name}» es menos formal de lo que pide el plan; no hay una opción más arreglada en tu armario.`);
    }
    if (!g.formality || (!g.warmth && !WARMTH_NOT_APPLICABLE.has(g.category))) {
      approximate = true;
      warnings.push(`A «${g.name}» le faltan datos (estilo o abrigo). Complétalos para afinar las propuestas.`);
    }
    const used = ctx.usedCounts.get(g.id) ?? 0;
    if (used > 0 && g.category !== "top") reasons.push(`Repites «${g.name}» para ahorrar espacio en la maleta.`);
    if (g.category === "outerwear") reasons.push(`Añadimos «${g.name}»${g.waterproof && need.rainy ? " porque es impermeable" : " para el fresco"}.`);
    if (g.preference === "avoid") warnings.push(`Has marcado «${g.name}» como prenda que prefieres no llevar; no había alternativa.`);
  }

  return {
    id: ctx.newId(),
    garmentIds: chosen.map((g) => g.id),
    reasons,
    warnings,
    approximate,
    edited: false,
    favorite: false,
    createdAt: ctx.now,
  };
}

/** Cuenta los usos de prendas en los looks de un viaje, opcionalmente excluyendo un día. */
export function usageCounts(days: TripDay[], exceptDate?: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of days) {
    if (d.date === exceptDate || !d.look) continue;
    for (const id of d.look.garmentIds) m.set(id, (m.get(id) ?? 0) + 1);
  }
  return m;
}

export interface GenerateTripOptions {
  /** Si es true, conserva looks editados a mano o marcados como favoritos. */
  keepEdited: boolean;
  newId: () => string;
  now: string;
}

/** Genera (o regenera) looks para todos los días del viaje. Devuelve una copia de los días. */
export function generateTripLooks(trip: Trip, garments: Garment[], opts: GenerateTripOptions): TripDay[] {
  const days = trip.days.map((d) => ({ ...d }));
  const kept = new Set<string>();
  if (opts.keepEdited) for (const d of days) if (d.look && (d.look.edited || d.look.favorite)) kept.add(d.date);
  for (const d of days) if (!kept.has(d.date)) d.look = undefined;

  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    if (kept.has(d.date)) continue;
    const prev = days[i - 1]?.look;
    d.look = generateLook(garments, d, {
      usedCounts: usageCounts(days, d.date),
      previousIds: new Set(prev?.garmentIds ?? []),
      baggage: trip.baggage,
      laundry: trip.laundry,
      excludeKeys: new Set(d.discardedKeys),
      newId: opts.newId,
      now: opts.now,
    });
  }
  return days;
}

/** Nueva propuesta para un día concreto, evitando la actual y las descartadas. */
export function regenerateDay(
  trip: Trip,
  garments: Garment[],
  date: string,
  opts: { discardCurrent: boolean; newId: () => string; now: string },
): TripDay[] {
  const days = trip.days.map((d) => ({ ...d, discardedKeys: [...d.discardedKeys] }));
  const idx = days.findIndex((d) => d.date === date);
  if (idx < 0) return days;
  const d = days[idx];
  const exclude = new Set(d.discardedKeys);
  if (d.look && d.look.garmentIds.length) {
    const key = lookKey(d.look.garmentIds);
    exclude.add(key);
    if (opts.discardCurrent && !d.discardedKeys.includes(key)) d.discardedKeys.push(key);
  }
  d.look = generateLook(garments, d, {
    usedCounts: usageCounts(days, date),
    previousIds: new Set(days[idx - 1]?.look?.garmentIds ?? []),
    baggage: trip.baggage,
    laundry: trip.laundry,
    excludeKeys: exclude,
    newId: opts.newId,
    now: opts.now,
  });
  return days;
}
