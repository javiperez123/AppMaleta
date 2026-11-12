import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateTripLooks, lookKey, regenerateDay } from "@/lib/domain/engine";
import type { GarmentInput } from "@/lib/domain/garment-input";
import { IMAGE_EXT, isValidImageId, type ImageType } from "@/lib/domain/images";
import { buildDays, tripBounds, type StopInput } from "@/lib/domain/trip";
import type { Activity, DayWeather, FavoriteLook, Garment, Look, Trip, TripStop, UserData } from "@/lib/domain/types";
import { fetchWeatherRange, geocode } from "@/lib/domain/weather";
import { todayIso } from "@/lib/domain/dates";
import { newId, readUserData, updateUserData, uploadDir } from "./storage";

// Todas las funciones reciben el userId de la sesión. Nunca aceptan un userId del cliente.

export class NotFoundError extends Error {}

const nowIso = () => new Date().toISOString();

export async function getUserData(userId: string): Promise<UserData> {
  return readUserData(userId);
}

// ---------- Fotos ----------

export async function saveImage(userId: string, bytes: Uint8Array, type: ImageType): Promise<string> {
  const id = `${newId()}.${IMAGE_EXT[type]}`;
  const dir = uploadDir(userId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id), bytes);
  return id;
}

export async function readImage(userId: string, imageId: string): Promise<Buffer | null> {
  if (!isValidImageId(imageId)) return null;
  try {
    return await fs.readFile(path.join(uploadDir(userId), imageId));
  } catch {
    return null;
  }
}

async function deleteImage(userId: string, imageId?: string) {
  if (!imageId || !isValidImageId(imageId)) return;
  await fs.rm(path.join(uploadDir(userId), imageId), { force: true });
}

async function imageExists(userId: string, imageId: string): Promise<boolean> {
  try {
    await fs.access(path.join(uploadDir(userId), imageId));
    return true;
  } catch {
    return false;
  }
}

// ---------- Prendas ----------

export async function createGarment(userId: string, input: GarmentInput): Promise<Garment> {
  if (input.imageId && !(await imageExists(userId, input.imageId))) input = { ...input, imageId: undefined };
  return updateUserData(userId, (d) => {
    if (d.garments.length >= 1000) throw new Error("Has alcanzado el máximo de prendas.");
    const g: Garment = { ...input, id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    d.garments.push(g);
    return g;
  });
}

export async function updateGarment(userId: string, id: string, input: GarmentInput): Promise<Garment> {
  if (input.imageId && !(await imageExists(userId, input.imageId))) input = { ...input, imageId: undefined };
  let oldImage: string | undefined;
  const g = await updateUserData(userId, (d) => {
    const g = d.garments.find((x) => x.id === id);
    if (!g) throw new NotFoundError();
    oldImage = g.imageId;
    Object.assign(g, input, { updatedAt: nowIso() });
    // Mantener la foto anterior si no se ha subido otra.
    if (!input.imageId) g.imageId = oldImage;
    return { ...g };
  });
  if (oldImage && input.imageId && oldImage !== input.imageId) await deleteImage(userId, oldImage);
  return g;
}

export async function setGarmentPreference(userId: string, id: string, preference: Garment["preference"]) {
  await updateUserData(userId, (d) => {
    const g = d.garments.find((x) => x.id === id);
    if (!g) throw new NotFoundError();
    g.preference = preference;
    g.updatedAt = nowIso();
  });
}

/** Elimina una prenda y la quita de looks y favoritos. */
export async function deleteGarment(userId: string, id: string): Promise<void> {
  let image: string | undefined;
  await updateUserData(userId, (d) => {
    const g = d.garments.find((x) => x.id === id);
    if (!g) throw new NotFoundError();
    image = g.imageId;
    d.garments = d.garments.filter((x) => x.id !== id);
    for (const t of d.trips)
      for (const day of t.days)
        if (day.look?.garmentIds.includes(id)) {
          day.look = {
            ...day.look,
            garmentIds: day.look.garmentIds.filter((x) => x !== id),
            edited: true,
            warnings: [...day.look.warnings, "Una prenda de este look se eliminó del armario."],
          };
        }
    for (const f of d.favorites) f.garmentIds = f.garmentIds.filter((x) => x !== id);
    d.favorites = d.favorites.filter((f) => f.garmentIds.length > 0);
  });
  await deleteImage(userId, image);
}

// ---------- Viajes ----------

async function enrichStops(stops: StopInput[], previous: TripStop[] = []): Promise<TripStop[]> {
  return Promise.all(
    stops.map(async (s) => {
      const city = s.city.trim();
      const prev = previous.find((p) => p.city.toLowerCase() === city.toLowerCase() && p.latitude !== undefined);
      const base: TripStop = { id: newId(), city, startDate: s.startDate, endDate: s.endDate };
      if (prev) return { ...base, latitude: prev.latitude, longitude: prev.longitude, country: prev.country };
      const geo = await geocode(city);
      return geo ? { ...base, latitude: geo.latitude, longitude: geo.longitude, country: geo.country } : base;
    }),
  );
}

export interface TripInput {
  name: string;
  stops: StopInput[];
  baggage: Trip["baggage"];
  laundry: boolean;
  notes?: string;
}

export async function createTrip(userId: string, input: TripInput): Promise<Trip> {
  const stops = (await enrichStops(input.stops)).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const days = buildDays(stops);
  return updateUserData(userId, (d) => {
    if (d.trips.length >= 200) throw new Error("Has alcanzado el máximo de viajes.");
    const trip: Trip = {
      id: newId(),
      name: input.name,
      stops,
      baggage: input.baggage,
      laundry: input.laundry,
      notes: input.notes,
      days,
      packed: {},
      extras: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    d.trips.push(trip);
    return trip;
  });
}

export async function updateTrip(userId: string, id: string, input: TripInput): Promise<Trip> {
  const current = (await readUserData(userId)).trips.find((t) => t.id === id);
  if (!current) throw new NotFoundError();
  const stops = (await enrichStops(input.stops, current.stops)).sort((a, b) => a.startDate.localeCompare(b.startDate));
  return updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === id);
    if (!t) throw new NotFoundError();
    t.name = input.name;
    t.baggage = input.baggage;
    t.laundry = input.laundry;
    t.notes = input.notes;
    t.stops = stops;
    t.days = buildDays(stops, t.days);
    t.updatedAt = nowIso();
    return t;
  });
}

export async function deleteTrip(userId: string, id: string): Promise<void> {
  await updateUserData(userId, (d) => {
    if (!d.trips.some((t) => t.id === id)) throw new NotFoundError();
    d.trips = d.trips.filter((t) => t.id !== id);
  });
}

function mutateTrip<R>(userId: string, tripId: string, fn: (t: Trip, d: UserData) => R): Promise<R> {
  return updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === tripId);
    if (!t) throw new NotFoundError();
    const r = fn(t, d);
    t.updatedAt = nowIso();
    return r;
  });
}

export async function setDayActivities(userId: string, tripId: string, date: string, activities: Activity[]) {
  await mutateTrip(userId, tripId, (t) => {
    const day = t.days.find((x) => x.date === date);
    if (!day) throw new NotFoundError();
    day.activities = activities.slice(0, 6);
  });
}

export async function setManualWeather(userId: string, tripId: string, date: string, w: DayWeather | null) {
  await mutateTrip(userId, tripId, (t) => {
    const day = t.days.find((x) => x.date === date);
    if (!day) throw new NotFoundError();
    day.weather = w ?? undefined;
  });
}

/** Consulta el clima real para todos los días (excepto los introducidos a mano). */
export async function refreshTripWeather(userId: string, tripId: string): Promise<{ found: number; total: number }> {
  const trip = (await readUserData(userId)).trips.find((t) => t.id === tripId);
  if (!trip) throw new NotFoundError();
  const today = todayIso();
  const results = new Map<string, DayWeather>();
  for (const stop of trip.stops) {
    if (stop.latitude === undefined || stop.longitude === undefined) {
      const geo = await geocode(stop.city);
      if (!geo) continue;
      stop.latitude = geo.latitude;
      stop.longitude = geo.longitude;
      stop.country = geo.country;
    }
    const days = trip.days.filter((d) => d.city === stop.city);
    if (!days.length) continue;
    const range = await fetchWeatherRange(stop.latitude!, stop.longitude!, days[0].date, days[days.length - 1].date, today);
    for (const d of days) {
      const w = range.get(d.date);
      if (w) results.set(d.date, w);
    }
  }
  return mutateTrip(userId, tripId, (t) => {
    t.stops = t.stops.map((s) => trip.stops.find((x) => x.id === s.id) ?? s);
    let found = 0;
    for (const d of t.days) {
      if (d.weather?.source === "manual") {
        found++;
        continue;
      }
      const w = results.get(d.date);
      if (w) {
        d.weather = w;
        found++;
      }
    }
    return { found, total: t.days.length };
  });
}

export async function generateLooks(userId: string, tripId: string, keepEdited: boolean) {
  await updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === tripId);
    if (!t) throw new NotFoundError();
    t.days = generateTripLooks(t, d.garments, { keepEdited, newId, now: nowIso() });
    t.updatedAt = nowIso();
  });
}

export async function nextLookForDay(userId: string, tripId: string, date: string, discardCurrent: boolean) {
  await updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === tripId);
    if (!t) throw new NotFoundError();
    t.days = regenerateDay(t, d.garments, date, { discardCurrent, newId, now: nowIso() });
    t.updatedAt = nowIso();
  });
}

/** Descarta la propuesta del día sin generar otra. */
export async function clearDayLook(userId: string, tripId: string, date: string) {
  await mutateTrip(userId, tripId, (t) => {
    const day = t.days.find((x) => x.date === date);
    if (!day) throw new NotFoundError();
    if (day.look?.garmentIds.length) {
      const key = lookKey(day.look.garmentIds);
      if (!day.discardedKeys.includes(key)) day.discardedKeys.push(key);
    }
    day.look = undefined;
  });
}

/** Sustituye, añade o quita prendas del look de un día. Solo admite prendas del propio armario. */
export async function setDayGarments(userId: string, tripId: string, date: string, garmentIds: string[]) {
  await updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === tripId);
    if (!t) throw new NotFoundError();
    const day = t.days.find((x) => x.date === date);
    if (!day) throw new NotFoundError();
    const own = new Set(d.garments.map((g) => g.id));
    const ids = [...new Set(garmentIds)].filter((id) => own.has(id)).slice(0, 12);
    const prev: Look | undefined = day.look;
    day.look = {
      id: prev?.id ?? newId(),
      garmentIds: ids,
      reasons: prev ? prev.reasons.filter((r) => r.startsWith("Tiempo") || r.startsWith("Pensado")) : [],
      warnings: [],
      approximate: prev?.approximate ?? !day.weather,
      edited: true,
      favorite: prev?.favorite ?? false,
      createdAt: prev?.createdAt ?? nowIso(),
    };
    t.updatedAt = nowIso();
  });
}

export async function toggleDayFavorite(userId: string, tripId: string, date: string): Promise<boolean> {
  return updateUserData(userId, (d) => {
    const t = d.trips.find((x) => x.id === tripId);
    const day = t?.days.find((x) => x.date === date);
    if (!t || !day?.look || !day.look.garmentIds.length) throw new NotFoundError();
    const fav = !day.look.favorite;
    day.look.favorite = fav;
    const key = lookKey(day.look.garmentIds);
    if (fav) {
      if (!d.favorites.some((f) => lookKey(f.garmentIds) === key)) {
        const f: FavoriteLook = {
          id: newId(),
          name: `${day.city} · ${day.date}`,
          garmentIds: [...day.look.garmentIds],
          tripId: t.id,
          date: day.date,
          createdAt: nowIso(),
        };
        d.favorites.unshift(f);
      }
    } else {
      d.favorites = d.favorites.filter((f) => !(f.tripId === t.id && f.date === day.date && lookKey(f.garmentIds) === key));
    }
    return fav;
  });
}

export async function deleteFavorite(userId: string, favoriteId: string) {
  await updateUserData(userId, (d) => {
    const f = d.favorites.find((x) => x.id === favoriteId);
    if (!f) throw new NotFoundError();
    d.favorites = d.favorites.filter((x) => x.id !== favoriteId);
    const t = d.trips.find((x) => x.id === f.tripId);
    const day = t?.days.find((x) => x.date === f.date);
    if (day?.look && lookKey(day.look.garmentIds) === lookKey(f.garmentIds)) day.look.favorite = false;
  });
}

/** Aplica un favorito a un día de un viaje. */
export async function applyFavorite(userId: string, favoriteId: string, tripId: string, date: string) {
  const d = await readUserData(userId);
  const f = d.favorites.find((x) => x.id === favoriteId);
  if (!f) throw new NotFoundError();
  await setDayGarments(userId, tripId, date, f.garmentIds);
}

// ---------- Maleta ----------

export async function setPacked(userId: string, tripId: string, key: string, packed: boolean) {
  await mutateTrip(userId, tripId, (t) => {
    const extra = t.extras.find((e) => e.id === key);
    if (extra) extra.packed = packed;
    else if (packed) t.packed[key.slice(0, 80)] = true;
    else delete t.packed[key];
  });
}

export async function addExtra(userId: string, tripId: string, label: string) {
  await mutateTrip(userId, tripId, (t) => {
    if (t.extras.length >= 100) throw new Error("Demasiados elementos.");
    t.extras.push({ id: `extra:${newId()}`, label: label.trim().slice(0, 80), packed: false });
  });
}

export async function removeExtra(userId: string, tripId: string, extraId: string) {
  await mutateTrip(userId, tripId, (t) => {
    t.extras = t.extras.filter((e) => e.id !== extraId);
  });
}

export async function dismissOnboarding(userId: string) {
  await updateUserData(userId, (d) => {
    d.onboardingDismissed = true;
  });
}

export function tripRange(t: Trip) {
  return tripBounds(t.stops);
}
