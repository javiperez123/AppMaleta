import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDays, cityForDate, validateStops } from "../src/lib/domain/trip.ts";
import { buildPackingList } from "../src/lib/domain/packing.ts";
import { checkImage, isValidImageId, sniffImageType } from "../src/lib/domain/images.ts";
import { parseGarmentInput, missingFields } from "../src/lib/domain/garment-input.ts";
import { addDays, dateRange, isIsoDate } from "../src/lib/domain/dates.ts";
import { nearestColorName } from "../src/lib/domain/labels.ts";
import { fetchWeatherRange, parseDaily } from "../src/lib/domain/weather.ts";
import { day, garment, trip } from "./helpers.ts";

test("fechas", () => {
  assert.ok(isIsoDate("2026-02-28"));
  assert.ok(!isIsoDate("2026-02-30"));
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(dateRange("2026-03-01", "2026-03-03").length, 3);
});

test("validación de destinos", () => {
  assert.deepEqual(validateStops([{ city: "Roma", startDate: "2026-05-01", endDate: "2026-05-03" }]), []);
  assert.ok(validateStops([{ city: "", startDate: "2026-05-01", endDate: "2026-05-03" }]).length);
  assert.ok(validateStops([{ city: "Roma", startDate: "2026-05-03", endDate: "2026-05-01" }]).length);
  assert.ok(
    validateStops([
      { city: "Roma", startDate: "2026-05-01", endDate: "2026-05-05" },
      { city: "Florencia", startDate: "2026-05-03", endDate: "2026-05-06" },
    ]).some((e) => e.includes("solapan")),
  );
  assert.ok(validateStops([{ city: "X", startDate: "2026-01-01", endDate: "2026-04-01" }]).some((e) => e.includes("60")));
});

test("días del viaje con varios destinos y día de traslado", () => {
  const stops = [
    { id: "a", city: "Roma", startDate: "2026-05-01", endDate: "2026-05-03" },
    { id: "b", city: "Florencia", startDate: "2026-05-03", endDate: "2026-05-04" },
  ];
  const days = buildDays(stops);
  assert.deepEqual(days.map((d) => d.city), ["Roma", "Roma", "Florencia", "Florencia"]);
  assert.equal(days[2].activities[0]?.type, "transit");
  assert.equal(cityForDate(stops, "2026-05-02"), "Roma");
  // conserva datos de días existentes
  days[0].activities = [{ id: "x", type: "work" }];
  const again = buildDays(stops, days);
  assert.equal(again[0].activities[0].type, "work");
});

test("lista de maleta a partir de los looks", () => {
  const tee = garment({ name: "Camiseta", category: "top" });
  const jeans = garment({ name: "Vaquero", category: "bottom", volume: "high" });
  const look = (ids: string[]) => ({ id: "l", garmentIds: ids, reasons: [], warnings: [], approximate: false, edited: false, favorite: false, createdAt: "" });
  const t = trip([
    day("2026-05-01", { look: look([tee.id, jeans.id]) }),
    day("2026-05-02", { look: look([jeans.id, "borrada00"]) }),
    day("2026-05-03"),
  ]);
  t.packed = { [tee.id]: true };
  const list = buildPackingList(t, [tee, jeans]);
  assert.equal(list.totalGarments, 2);
  const jeansItem = list.groups.flatMap((g) => g.items).find((i) => i.garment.id === jeans.id)!;
  assert.equal(jeansItem.uses, 2);
  assert.deepEqual(list.missingGarmentIds, ["borrada00"]);
  assert.deepEqual(list.daysWithoutLook, ["2026-05-03"]);
  assert.equal(list.basics.find((b) => b.key === "basic:underwear")!.quantity, 3);
  assert.equal(list.packedCount, 1);
});

test("con lavado se llevan menos básicos", () => {
  const days = Array.from({ length: 10 }, (_, i) => day(addDays("2026-05-01", i)));
  const list = buildPackingList(trip(days, { laundry: true }), []);
  assert.equal(list.basics[0].quantity, 4);
});

test("fotos: tipo real por contenido, tamaño y nombre", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
  const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
  assert.equal(sniffImageType(jpeg), "image/jpeg");
  assert.equal(sniffImageType(png), "image/png");
  assert.equal(sniffImageType(webp), "image/webp");
  const html = new TextEncoder().encode("<svg onload=alert(1)>");
  assert.equal(checkImage(html).ok, false);
  assert.equal(checkImage(new Uint8Array()).ok, false);
  const big = new Uint8Array(7 * 1024 * 1024);
  big.set(jpeg);
  assert.equal(checkImage(big).ok, false);
  assert.ok(isValidImageId("0123456789abcdef0123456789abcdef.webp"));
  assert.ok(!isValidImageId("../../auth.json"));
  assert.ok(!isValidImageId("0123456789abcdef0123456789abcdef.svg"));
});

test("formulario de prenda: obligatorios y valores desconocidos", () => {
  const ok = parseGarmentInput((k) => ({ name: " Camisa ", category: "top", formality: "elegant", warmth: "x" })[k]);
  assert.equal(ok.data?.name, "Camisa");
  assert.equal(ok.data?.formality, "elegant");
  assert.equal(ok.data?.warmth, undefined, "un valor no válido se trata como desconocido, no se inventa");
  assert.equal(ok.data?.volume, "medium");
  const bad = parseGarmentInput((k) => ({ name: "", category: "sombrero", imageId: "../x" })[k]);
  assert.ok(bad.errors.name && bad.errors.category && bad.errors.imageId);
  assert.deepEqual(missingFields({}), ["estilo", "abrigo", "color", "foto"]);
  assert.deepEqual(missingFields({ category: "shoes", formality: "casual", color: "Negro", imageId: "x" }), [], "el abrigo no aplica al calzado");
});

test("color sugerido más cercano", () => {
  assert.equal(nearestColorName("#1f1f1f"), "Negro");
  assert.equal(nearestColorName("#23314e"), "Azul marino");
});

test("clima: parseo de previsión e histórico", () => {
  const f = parseDaily(
    { daily: { time: ["2026-05-01", "2026-05-02"], temperature_2m_max: [20, null], temperature_2m_min: [11, 10], precipitation_probability_max: [70, 0] } },
    "forecast",
  );
  assert.equal(f.size, 1, "descarta días sin dato");
  assert.equal(f.get("2026-05-01")!.rainChance, 70);
  const h = parseDaily(
    { daily: { time: ["2025-05-01"], temperature_2m_max: [18], temperature_2m_min: [9], precipitation_sum: [3.2] } },
    "historical",
    1,
  );
  assert.equal(h.get("2026-05-01")!.rainChance, 100);
  assert.match(h.get("2026-05-01")!.sourceLabel, /Estimación/);
});

test("clima: usa previsión cerca y histórico lejos; si la API falla, no inventa", async () => {
  const urls: string[] = [];
  const fetcher = async (url: string) => {
    urls.push(url);
    if (url.includes("forecast"))
      return { ok: true, json: async () => ({ daily: { time: ["2026-05-02"], temperature_2m_max: [20], temperature_2m_min: [12], precipitation_probability_max: [10] } }) };
    return { ok: true, json: async () => ({ daily: { time: ["2025-06-01"], temperature_2m_max: [25], temperature_2m_min: [15], precipitation_sum: [0] } }) };
  };
  const near = await fetchWeatherRange(38.7, -9.1, "2026-05-02", "2026-05-02", "2026-05-01", fetcher);
  assert.equal(near.get("2026-05-02")!.source, "forecast");
  const far = await fetchWeatherRange(38.7, -9.1, "2026-06-01", "2026-06-01", "2026-05-01", fetcher);
  assert.equal(far.get("2026-06-01")!.source, "historical");
  assert.ok(urls.some((u) => u.includes("archive-api") && u.includes("2025-06-01")));
  const failing = async () => {
    throw new Error("offline");
  };
  const none = await fetchWeatherRange(38.7, -9.1, "2026-05-02", "2026-05-03", "2026-05-01", failing);
  assert.equal(none.size, 0);
});

// =================== Nuevas funciones: insights + capsule + disponibilidad ===================

import { buildInsights } from "../src/lib/domain/insights.ts";
import { buildCapsule } from "../src/lib/domain/capsule.ts";
import { activeSeasonsFor, generateLook } from "../src/lib/domain/engine.ts";
import { ctxBase } from "./helpers.ts";

test("insights: vacío si no hay prendas", () => {
  const ins = buildInsights([]);
  assert.equal(ins.total, 0);
  assert.equal(ins.potentialCombos, 0);
});

test("insights: cuenta categorías y combos", () => {
  const gs = [
    garment({ name: "Camiseta", category: "top", color: "blanco", formality: "casual", warmth: "light" }),
    garment({ name: "Pantalón", category: "bottom", color: "negro", formality: "casual", warmth: "medium" }),
    garment({ name: "Zapatillas", category: "shoes", color: "blanco", formality: "casual" }),
  ];
  const ins = buildInsights(gs);
  assert.equal(ins.total, 3);
  assert.equal(ins.potentialCombos, 1); // 1 top * 1 bottom * 1 shoe
  assert.equal(ins.byCategory.find(c => c.category === "top")?.count, 1);
});

test("insights: nunca usadas / más usada", () => {
  const g1 = garment({ name: "A", category: "top" });
  const g2 = garment({ name: "B", category: "top" });
  const usedCounts = new Map([[g1.id, 5]]);
  const ins = buildInsights([g1, g2], usedCounts);
  assert.equal(ins.mostUsedId, g1.id);
  assert.ok(ins.neverUsedIds.includes(g2.id));
  assert.ok(!ins.neverUsedIds.includes(g1.id));
});

test("insights: prendas no disponibles detectadas", () => {
  const g = garment({ name: "A", category: "top", availability: "laundry" });
  const ins = buildInsights([g]);
  assert.ok(ins.unavailableIds.includes(g.id));
  assert.ok(ins.availablePercent < 100);
});

test("capsule: sin prendas devuelve vacío", () => {
  const t = trip([day("2026-06-01")]);
  const r = buildCapsule([], t, [day("2026-06-01")]);
  assert.equal(r.ids.length, 0);
});

test("capsule: selecciona prendas y calcula combos", () => {
  const gs = [
    garment({ name: "Camiseta", category: "top", volume: "low" }),
    garment({ name: "Pantalón", category: "bottom", volume: "low" }),
    garment({ name: "Zapatillas", category: "shoes", volume: "medium" }),
    garment({ name: "Vestido", category: "dress", volume: "low" }),
  ];
  const t = trip([day("2026-06-01"), day("2026-06-02")]);
  const r = buildCapsule(gs, t, t.days);
  assert.ok(r.ids.length > 0);
  assert.ok(r.combos > 0);
  assert.ok(r.usedCapacity <= r.maxCapacity);
});

test("capsule: no incluye prendas no disponibles", () => {
  const unavail = garment({ name: "Lavandería", category: "top", availability: "laundry" });
  const avail = garment({ name: "Disponible", category: "top" });
  const t = trip([day("2026-06-01")]);
  const r = buildCapsule([unavail, avail], t, t.days);
  assert.ok(!r.ids.includes(unavail.id));
});

test("engine: prendas no disponibles (laundry) no entran en el look", () => {
  const top = garment({ name: "Camiseta", category: "top", formality: "casual", warmth: "light" });
  const bottom = garment({ name: "Pantalón", category: "bottom", formality: "casual", warmth: "light" });
  const shoes = garment({ name: "Zapatillas", category: "shoes", formality: "casual" });
  const topLaundry = garment({ name: "TopSucia", category: "top", formality: "casual", warmth: "light", availability: "laundry" });
  const d = day("2026-07-01");
  const ctx = { ...ctxBase(), now: "2026-07-01T12:00:00Z" };
  const look = generateLook([top, bottom, shoes, topLaundry], d, ctx);
  assert.ok(!look.garmentIds.includes(topLaundry.id), "prenda en lavandería no debe aparecer en el look");
});

test("activeSeasonsFor: hemisferio norte y sur", () => {
  // Julio en norte = verano
  const northJuly = activeSeasonsFor("2026-07-15", 40);
  assert.ok(northJuly.includes("summer"));
  // Julio en sur = invierno
  const southJuly = activeSeasonsFor("2026-07-15", -40);
  assert.ok(southJuly.includes("winter"));
});
