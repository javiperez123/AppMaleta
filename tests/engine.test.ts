import { test } from "node:test";
import assert from "node:assert/strict";
import { generateLook, generateTripLooks, lookKey, regenerateDay } from "../src/lib/domain/engine.ts";
import { ctxBase, day, garment, id, trip } from "./helpers.ts";

const wardrobe = () => {
  const tee = garment({ name: "Camiseta", category: "top", formality: "casual", warmth: "light" });
  const shirt = garment({ name: "Camisa", category: "top", formality: "smart-casual", warmth: "medium" });
  const jeans = garment({ name: "Vaquero", category: "bottom", formality: "casual" });
  const chinos = garment({ name: "Chino", category: "bottom", formality: "smart-casual" });
  const sneakers = garment({ name: "Zapatillas", category: "shoes", formality: "casual" });
  const shoes = garment({ name: "Zapatos", category: "shoes", formality: "elegant" });
  const rain = garment({ name: "Chubasquero", category: "outerwear", waterproof: true, warmth: "light" });
  const coat = garment({ name: "Abrigo", category: "outerwear", warmth: "warm", formality: "smart-casual" });
  return { tee, shirt, jeans, chinos, sneakers, shoes, rain, coat, all: [tee, shirt, jeans, chinos, sneakers, shoes, rain, coat] };
};

test("solo usa prendas del armario", () => {
  const w = wardrobe();
  const look = generateLook(w.all, day("2026-05-01"), ctxBase());
  const ids = new Set(w.all.map((g) => g.id));
  assert.ok(look.garmentIds.length >= 3);
  for (const gid of look.garmentIds) assert.ok(ids.has(gid));
});

test("sin clima marca la propuesta como aproximada y lo explica", () => {
  const w = wardrobe();
  const look = generateLook(w.all, day("2026-05-01"), ctxBase());
  assert.equal(look.approximate, true);
  assert.ok(look.warnings.some((x) => x.includes("Sin datos del tiempo")));
});

test("con lluvia elige la prenda impermeable", () => {
  const w = wardrobe();
  const d = day("2026-05-01", { weather: { tempMin: 12, tempMax: 17, rainChance: 80, source: "forecast", sourceLabel: "x" } });
  const look = generateLook(w.all, d, ctxBase());
  assert.ok(look.garmentIds.includes(w.rain.id));
  assert.equal(look.approximate, false);
});

test("con calor no añade abrigo", () => {
  const w = wardrobe();
  const d = day("2026-07-01", { weather: { tempMin: 22, tempMax: 31, rainChance: 0, source: "forecast", sourceLabel: "x" } });
  const look = generateLook(w.all, d, ctxBase());
  assert.ok(!look.garmentIds.includes(w.coat.id) && !look.garmentIds.includes(w.rain.id));
  assert.ok(look.garmentIds.includes(w.tee.id), "prefiere la prenda fresca");
});

test("una cena especial pide prendas más arregladas", () => {
  const w = wardrobe();
  const d = day("2026-05-01", { activities: [{ id: "a", type: "dinner" }] });
  const look = generateLook(w.all, d, ctxBase());
  assert.ok(look.garmentIds.includes(w.shirt.id));
  assert.ok(look.garmentIds.includes(w.chinos.id));
  assert.ok(!look.garmentIds.includes(w.sneakers.id));
});

test("si falta calzado lo avisa en vez de inventarlo", () => {
  const w = wardrobe();
  const look = generateLook([w.tee, w.jeans], day("2026-05-01"), ctxBase());
  assert.deepEqual(new Set(look.garmentIds), new Set([w.tee.id, w.jeans.id]));
  assert.ok(look.warnings.some((x) => x.includes("calzado")));
});

test("playa sin bañador: avisa", () => {
  const w = wardrobe();
  const look = generateLook(w.all, day("2026-05-01", { activities: [{ id: "a", type: "beach" }] }), ctxBase());
  assert.ok(look.warnings.some((x) => x.includes("baño")));
});

test("armario vacío: look vacío con avisos", () => {
  const look = generateLook([], day("2026-05-01"), ctxBase());
  assert.equal(look.garmentIds.length, 0);
  assert.ok(look.warnings.length >= 2);
});

test("respeta las combinaciones descartadas", () => {
  const w = wardrobe();
  const ctx = ctxBase();
  const first = generateLook(w.all, day("2026-05-01"), ctx);
  ctx.excludeKeys.add(lookKey(first.garmentIds));
  const second = generateLook(w.all, day("2026-05-01"), ctx);
  assert.notEqual(lookKey(second.garmentIds), lookKey(first.garmentIds));
});

test("evita prendas marcadas como 'prefiero no llevar' si hay alternativa", () => {
  const w = wardrobe();
  w.tee.preference = "avoid";
  const look = generateLook(w.all, day("2026-05-01"), ctxBase());
  assert.ok(!look.garmentIds.includes(w.tee.id));
});

test("viaje completo: varía la parte de arriba y reutiliza el resto", () => {
  const w = wardrobe();
  const t = trip([day("2026-05-01"), day("2026-05-02"), day("2026-05-03")]);
  const days = generateTripLooks(t, w.all, { keepEdited: false, newId: id, now: "" });
  assert.equal(days.filter((d) => d.look).length, 3);
  const tops = days.map((d) => d.look!.garmentIds.find((g) => g === w.tee.id || g === w.shirt.id));
  assert.notEqual(tops[0], tops[1], "no repite la misma parte de arriba en días seguidos");
  const shoes = new Set(days.map((d) => d.look!.garmentIds.find((g) => g === w.sneakers.id || g === w.shoes.id)));
  assert.equal(shoes.size, 1, "reutiliza el calzado");
});

test("regenerar conserva looks editados o favoritos si se pide", () => {
  const w = wardrobe();
  const t = trip([day("2026-05-01"), day("2026-05-02")]);
  t.days = generateTripLooks(t, w.all, { keepEdited: false, newId: id, now: "" });
  t.days[0].look = { ...t.days[0].look!, garmentIds: [w.coat.id], edited: true };
  const again = generateTripLooks(t, w.all, { keepEdited: true, newId: id, now: "" });
  assert.deepEqual(again[0].look!.garmentIds, [w.coat.id]);
  const reset = generateTripLooks(t, w.all, { keepEdited: false, newId: id, now: "" });
  assert.notDeepEqual(reset[0].look!.garmentIds, [w.coat.id]);
});

test("otra propuesta descarta la actual", () => {
  const w = wardrobe();
  const t = trip([day("2026-05-01")]);
  t.days = generateTripLooks(t, w.all, { keepEdited: false, newId: id, now: "" });
  const before = lookKey(t.days[0].look!.garmentIds);
  const after = regenerateDay(t, w.all, "2026-05-01", { discardCurrent: true, newId: id, now: "" });
  assert.notEqual(lookKey(after[0].look!.garmentIds), before);
  assert.ok(after[0].discardedKeys.includes(before));
});
