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
  Season,
  StyleProfile,
  Trip,
  TripDay,
  TripStop,
  TripStyle,
} from "./types.ts";

// ── Estilo de viaje → formalidad preferida ────────────────────────────────────
const TRIP_STYLE_FORMALITY: Record<TripStyle, { target: number; boost: number }> = {
  mochilero:  { target: 0.5, boost: 1.5 },  // casual/basic
  turismo:    { target: 1.5, boost: 1.0 },  // casual/smart-casual
  fiesta:     { target: 2.0, boost: 1.5 },  // smart-casual
  negocios:   { target: 2.5, boost: 2.0 },  // smart-casual/elegant
  naturaleza: { target: 0.5, boost: 1.5 },  // basic/casual
  lujo:       { target: 3.0, boost: 2.0 },  // elegant
};

/** Bonus/penalización por estilo de viaje sobre la formalidad de una prenda. */
function tripStyleBonus(g: Garment, tripStyle?: TripStyle): number {
  if (!tripStyle || !g.formality) return 0;
  const spec = TRIP_STYLE_FORMALITY[tripStyle];
  const f = FORMALITY_RANK[g.formality];
  const diff = Math.abs(f - spec.target);
  // Bonus si encaja, penalización si se aleja mucho
  if (diff <= 0.5) return spec.boost;
  if (diff <= 1.5) return 0;
  return -spec.boost;
}

/** Bonus por perfil de estilo del usuario sobre una prenda del armario.
 *  Usa colorHex para la dimensión boldness y formality para las demás. */
function styleProfileBonus(g: Garment, profile?: StyleProfile): number {
  if (!profile || profile.swipeCount < 5) return 0;
  let bonus = 0;
  // Formalidad: comparar prenda con preferencia del usuario
  if (g.formality) {
    const f = FORMALITY_RANK[g.formality] / 3; // normalizar 0-1
    bonus += (1 - Math.abs(f - profile.formality)) * 1.5;
  }
  // Boldness: usar colorHex como proxy (colores neutros = baja boldness)
  if (g.colorHex) {
    const isNeutral = nearestGroup(g.colorHex) === "neutros";
    const garmentBoldness = isNeutral ? 0.1 : 0.7;
    bonus += (1 - Math.abs(garmentBoldness - profile.boldness)) * 0.8;
  }
  return bonus;
}

const FORMALITY_RANK: Record<GarmentFormality, number> = {
  basic: 0,
  casual: 1,
  "smart-casual": 2,
  elegant: 3,
};
const WARMTH_RANK: Record<GarmentWarmth, number> = { light: 0, medium: 1, warm: 2 };

/** Prendas no disponibles (no se proponen nunca). */
const UNAVAILABLE = new Set(["laundry", "lent", "repair", "retired"]);

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

// --- Color harmony -----------------------------------------------------------
// Colores organizados en grupos; prendas del mismo grupo o complementarios suman.
const COLOR_GROUPS: Record<string, string[]> = {
  neutros: ["#000000","#ffffff","#808080","#c0c0c0","#f5f5dc","#fffdd0","#f5deb3","#d2b48c"],
  azules:  ["#000080","#0000ff","#4169e1","#1e90ff","#87ceeb","#add8e6","#b0c4de","#708090"],
  verdes:  ["#006400","#008000","#228b22","#2e8b57","#90ee90","#8fbc8f","#556b2f","#6b8e23"],
  marrones:["#8b4513","#a0522d","#d2691e","#cd853f","#deb887","#f4a460","#8b6914","#c8a165"],
  rojos:   ["#8b0000","#dc143c","#ff0000","#b22222","#cd5c5c","#f08080","#e9967a","#fa8072"],
  rosas:   ["#ff69b4","#ff1493","#db7093","#ffb6c1","#ffc0cb","#c71585","#e75480","#f4c2c2"],
  morados: ["#4b0082","#8b008b","#9400d3","#9932cc","#ba55d3","#da70d6","#dda0dd","#ee82ee"],
  naranjas:["#ff4500","#ff6347","#ff7f50","#ffa500","#ffd700","#ff8c00","#ffcc00","#f0e68c"],
};

function nearestGroup(hex: string): string | null {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  let best = null, bestD = Infinity;
  for (const [grp, colors] of Object.entries(COLOR_GROUPS)) {
    for (const c of colors) {
      const cr = parseInt(c.slice(1,3),16);
      const cg = parseInt(c.slice(3,5),16);
      const cb = parseInt(c.slice(5,7),16);
      const d = (r-cr)**2+(g-cg)**2+(b-cb)**2;
      if (d < bestD) { bestD = d; best = grp; }
    }
  }
  return best;
}

const COMPLEMENT: Record<string,string[]> = {
  neutros: ["azules","verdes","marrones","rojos","rosas","morados","naranjas"],
  azules:  ["neutros","marrones","naranjas"],
  verdes:  ["neutros","marrones","naranjas","rojos"],
  marrones:["neutros","azules","verdes","naranjas"],
  rojos:   ["neutros","azules","verdes"],
  rosas:   ["neutros","azules","morados"],
  morados: ["neutros","verdes","rosas","naranjas"],
  naranjas:["neutros","azules","morados","marrones"],
};

function colorHarmonyBonus(garments: Garment[]): { bonus: number; reason?: string } {
  const hexes = garments.map(g=>g.colorHex).filter(Boolean) as string[];
  if (hexes.length < 2) return { bonus: 0 };
  const groups = hexes.map(nearestGroup).filter(Boolean) as string[];
  const unique = [...new Set(groups)];
  if (unique.length === 0) return { bonus: 0 };
  // Todos neutros → clásico
  if (unique.every(g => g === "neutros")) return { bonus: 1.5, reason: "Combinación atemporal en tonos neutros." };
  // Un neutro + un color → armonía básica
  const nonNeutral = unique.filter(g => g !== "neutros");
  if (unique.includes("neutros") && nonNeutral.length === 1) return { bonus: 2, reason: `Acento de color sobre neutros.` };
  // Colores complementarios → armonía
  const [first, ...rest] = nonNeutral;
  const compats = COMPLEMENT[first] ?? [];
  if (rest.every(g => compats.includes(g))) return { bonus: 1.5, reason: "Colores que combinan bien." };
  // Demasiados colores distintos → penalización leve
  if (nonNeutral.length >= 3) return { bonus: -1 };
  return { bonus: 0 };
}

// --- Season ------------------------------------------------------------------
/** Devuelve las estaciones activas en la fecha para la latitud dada. */
export function activeSeasonsFor(isoDate: string, latitude?: number): Season[] {
  const m = new Date(isoDate + "T12:00:00Z").getUTCMonth(); // 0-11
  const north = latitude === undefined || latitude >= 0;
  // Meses por estación (hemisferio norte)
  const northMap: Record<Season, number[]> = {
    spring: [2,3,4],
    summer: [5,6,7],
    autumn: [8,9,10],
    winter: [11,0,1],
  };
  const southMap: Record<Season, number[]> = {
    spring: [8,9,10],
    summer: [11,0,1],
    autumn: [2,3,4],
    winter: [5,6,7],
  };
  const map = north ? northMap : southMap;
  return (Object.keys(map) as Season[]).filter(s => map[s].includes(m));
}

/** Penalización por temporada: 0 si no tiene temporada indicada o hay coincidencia, -3 si no. */
function seasonPenalty(g: Garment, activeSeasons: Season[]): number {
  if (!g.seasons || g.seasons.length === 0) return 0;
  if (g.seasons.some(s => activeSeasons.includes(s))) return 0;
  return -3; // fuera de temporada
}

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
  /** Si se indica, solo se usarán estas prendas (modo cápsula). */
  allowedIds?: Set<string>;
  /** Latitud de la parada (para ajuste de temporadas). */
  latitude?: number;
  /** Perfil de estilo del usuario (calculado a partir del swipe de catálogo). */
  styleProfile?: StyleProfile;
  /** Tipo de viaje (afecta formalidad preferida y prendas sugeridas). */
  tripStyle?: TripStyle;
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

function scoreGarment(g: Garment, need: Need, ctx: DayContext, activeSeasons: Season[]): number {
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
  s += seasonPenalty(g, activeSeasons);
  // Bonus por estilo de viaje y perfil personal
  s += tripStyleBonus(g, ctx.tripStyle);
  s += styleProfileBonus(g, ctx.styleProfile);
  // desempate estable
  return s;
}

function best(garments: Garment[], need: Need, ctx: DayContext, n: number, activeSeasons: Season[]): { g: Garment; s: number }[] {
  return garments
    .map((g) => ({ g, s: scoreGarment(g, need, ctx, activeSeasons) }))
    .sort((a, b) => b.s - a.s || a.g.createdAt.localeCompare(b.g.createdAt) || a.g.id.localeCompare(b.g.id))
    .slice(0, n);
}

/** Filtra prendas disponibles (no retiradas, prestadas ni en reparación) y aplica allowedIds si se indica. */
function availableGarments(garments: Garment[], ctx: DayContext): Garment[] {
  return garments.filter(g => {
    if (g.availability && UNAVAILABLE.has(g.availability)) return false;
    if (ctx.allowedIds && !ctx.allowedIds.has(g.id)) return false;
    return true;
  });
}

/** Genera una propuesta de look para un día, usando solo prendas del armario. */
export function generateLook(garments: Garment[], day: TripDay, ctx: DayContext): Look {
  const need = dayNeeds(day);
  const usable = availableGarments(garments, ctx);
  const activeSeasons = activeSeasonsFor(day.date, ctx.latitude);
  const by = (c: Garment["category"]) => usable.filter((g) => g.category === c);
  const tops = best(by("top"), need, ctx, 6, activeSeasons);
  const bottoms = best(by("bottom"), need, ctx, 6, activeSeasons);
  const dresses = best(by("dress"), need, ctx, 4, activeSeasons);
  const shoes = best(by("shoes"), need, ctx, 4, activeSeasons);
  const outers = need.needsOuter ? best(by("outerwear"), need, ctx, 4, activeSeasons) : [];
  const swims = need.beach ? best(by("swimwear"), need, ctx, 2, activeSeasons) : [];

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

  // Aplica bonus de armonía de color al ordenar
  const combosScored = combos.map(c => {
    const { bonus } = colorHarmonyBonus(c.ids);
    return { ...c, s: c.s + bonus };
  });
  combosScored.sort((a, b) => b.s - a.s || lookKey(a.ids.map((g) => g.id)).localeCompare(lookKey(b.ids.map((g) => g.id))));

  const pick = combosScored.find((c) => !ctx.excludeKeys.has(lookKey(c.ids.map((g) => g.id))));
  const chosen = pick?.ids ?? [];
  const exhausted = !pick && combosScored.some((c) => c.ids.length > 0);

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

  // Razón de armonía de color
  if (chosen.length >= 2) {
    const { reason: harmReason } = colorHarmonyBonus(chosen);
    if (harmReason) reasons.push(harmReason);
  }

  // Razón de estilo de viaje
  const TRIP_STYLE_LABELS: Record<TripStyle, string> = {
    mochilero: "viaje mochilero",
    turismo: "turismo",
    fiesta: "noche de fiesta",
    negocios: "viaje de negocios",
    naturaleza: "aventura en naturaleza",
    lujo: "viaje de lujo",
  };
  if (ctx.tripStyle) {
    reasons.push(`Adaptado a tu viaje de ${TRIP_STYLE_LABELS[ctx.tripStyle]}.`);
  }
  if (ctx.styleProfile && ctx.styleProfile.swipeCount >= 5) {
    reasons.push("Selección personalizada según tu estilo definido en el catálogo.");
  }

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
  /** Si se indica, solo se usarán estas prendas (modo cápsula). */
  allowedIds?: Set<string>;
  /** Perfil de estilo del usuario para personalizar las propuestas. */
  styleProfile?: StyleProfile;
}

/** Devuelve la latitud para una fecha en un viaje, buscando la parada que la cubre. */
function latitudeForDate(stops: TripStop[], date: string): number | undefined {
  return stops.find(s => s.startDate <= date && s.endDate >= date)?.latitude;
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
      allowedIds: opts.allowedIds,
      latitude: latitudeForDate(trip.stops, d.date),
      styleProfile: opts.styleProfile,
      tripStyle: trip.style,
    });
  }
  return days;
}

/** Nueva propuesta para un día concreto, evitando la actual y las descartadas. */
export function regenerateDay(
  trip: Trip,
  garments: Garment[],
  date: string,
  opts: { discardCurrent: boolean; newId: () => string; now: string; allowedIds?: Set<string>; styleProfile?: StyleProfile },
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
    allowedIds: opts.allowedIds,
    latitude: latitudeForDate(trip.stops, date),
    styleProfile: opts.styleProfile,
    tripStyle: trip.style,
  });
  return days;
}
