"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  AuthError,
  authenticate,
  createResetToken,
  createUser,
  deleteAccount,
  endSession,
  rateLimit,
  requireUser,
  resetPassword,
  startSession,
  updateProfile,
  validateEmail,
  validatePassword,
} from "@/server/auth";
import * as data from "@/server/data";
import { sendMail } from "@/server/mailer";
import { parseGarmentInput } from "@/lib/domain/garment-input";
import { validateStops, type StopInput } from "@/lib/domain/trip";
import { isIsoDate } from "@/lib/domain/dates";
import {
  ACTIVITY_TYPES,
  BAGGAGE_TYPES,
  PREFERENCES,
  type Activity,
  type ActivityType,
  type BaggageType,
  type GarmentPreference,
} from "@/lib/domain/types";
import { APP_NAME } from "@/lib/brand";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/home");
const ID = /^[a-zA-Z0-9_:-]{1,80}$/;
function assertId(id: unknown): asserts id is string {
  if (typeof id !== "string" || !ID.test(id)) throw new Error("Identificador no válido");
}
function assertDate(d: unknown): asserts d is string {
  if (typeof d !== "string" || !isIsoDate(d)) throw new Error("Fecha no válida");
}
async function clientKey(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
}
function refreshApp() {
  revalidatePath("/", "layout");
}

// ======================= Cuenta =======================

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name").trim();
  const email = str(fd, "email").trim();
  const password = str(fd, "password");
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Dinos cómo te llamas.";
  if (!validateEmail(email)) errors.email = "Introduce un email válido.";
  const pwErr = validatePassword(password);
  if (pwErr) errors.password = pwErr;
  if (!fd.get("terms")) errors.terms = "Necesitamos que aceptes la política de privacidad.";
  const values = { name, email };
  if (Object.keys(errors).length) return { errors, values };
  if (!rateLimit(`signup:${await clientKey()}`, 10, 60 * 60_000))
    return { message: "Demasiados intentos. Espera un poco y vuelve a probar.", values };
  try {
    const user = await createUser({ name, email, password });
    await startSession(user.id);
  } catch (e) {
    if (e instanceof AuthError && e.code === "EMAIL_TAKEN")
      return { errors: { email: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?" }, values };
    console.error("[signup]", (e as Error).message);
    return { message: "No hemos podido crear la cuenta. Inténtalo de nuevo.", values };
  }
  redirect("/home?bienvenida=1");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim();
  const password = str(fd, "password");
  const values = { email };
  if (!email || !password) return { message: "Introduce tu email y tu contraseña.", values };
  const key = `login:${await clientKey()}:${email.toLowerCase()}`;
  if (!rateLimit(key, 8, 15 * 60_000))
    return { message: "Demasiados intentos fallidos. Espera 15 minutos o recupera tu contraseña.", values };
  const user = await authenticate(email, password);
  if (!user) return { message: "El email o la contraseña no son correctos.", values };
  await startSession(user.id);
  redirect(safeNext(str(fd, "next")));
}

export async function logoutAction() {
  await endSession();
  redirect("/login?salida=1");
}

async function baseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function forgotAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim();
  if (!validateEmail(email)) return { errors: { email: "Introduce un email válido." }, values: { email } };
  if (!rateLimit(`forgot:${await clientKey()}`, 5, 60 * 60_000))
    return { message: "Demasiadas solicitudes. Inténtalo más tarde." };
  const result = await createResetToken(email);
  if (result) {
    const link = `${await baseUrl()}/reset?token=${encodeURIComponent(result.token)}`;
    const sent = await sendMail(
      result.user.email,
      `Restablece tu contraseña de ${APP_NAME}`,
      `Hola ${result.user.name}:\n\nPara elegir una contraseña nueva, abre este enlace (caduca en 1 hora):\n${link}\n\nSi no lo has pedido tú, ignora este mensaje.`,
    );
    if (!sent)
      return {
        message:
          "El envío de correos no está disponible ahora mismo. Contacta con el soporte para recuperar tu cuenta.",
      };
  }
  // Misma respuesta exista o no la cuenta (evita revelar qué emails están registrados).
  return { ok: true, message: "Si hay una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña." };
}

export async function resetAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token");
  const password = str(fd, "password");
  const pwErr = validatePassword(password);
  if (pwErr) return { errors: { password: pwErr } };
  if (password !== str(fd, "confirm")) return { errors: { confirm: "Las contraseñas no coinciden." } };
  const ok = await resetPassword(token, password);
  if (!ok) return { message: "El enlace no es válido o ha caducado. Solicita uno nuevo." };
  redirect("/login?restablecida=1");
}

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = str(fd, "name").trim();
  if (!name) return { errors: { name: "El nombre no puede estar vacío." } };
  await updateProfile(user.id, name);
  refreshApp();
  return { ok: true, message: "Perfil guardado." };
}

export async function deleteAccountAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (str(fd, "confirm").trim().toLowerCase() !== user.email)
    return { errors: { confirm: "Escribe tu email exactamente para confirmar." } };
  await endSession();
  await deleteAccount(user.id);
  redirect("/?cuenta-eliminada=1");
}

// ======================= Armario =======================

export async function saveGarmentAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const { data: input, errors } = parseGarmentInput((k) => str(fd, k));
  const values = Object.fromEntries(
    ["name", "category", "color", "colorHex", "formality", "warmth", "volume", "preference", "imageId", "notes", "waterproof"].map(
      (k) => [k, str(fd, k)],
    ),
  );
  if (!input) return { errors, values };
  const id = str(fd, "id");
  let savedId: string;
  try {
    if (id) {
      assertId(id);
      savedId = (await data.updateGarment(user.id, id, input)).id;
    } else {
      savedId = (await data.createGarment(user.id, input)).id;
    }
  } catch (e) {
    if (e instanceof data.NotFoundError) return { message: "Esta prenda ya no existe." };
    console.error("[garment]", (e as Error).message);
    return { message: "No se ha podido guardar. Inténtalo de nuevo.", values };
  }
  refreshApp();
  const after = str(fd, "after");
  if (after === "another") redirect(`/wardrobe/add?guardada=${encodeURIComponent(input.name)}`);
  redirect(id ? `/wardrobe?editada=${savedId}` : `/wardrobe?nueva=${savedId}`);
}

export async function deleteGarmentAction(id: string) {
  const user = await requireUser();
  assertId(id);
  await data.deleteGarment(user.id, id);
  refreshApp();
  redirect("/wardrobe?eliminada=1");
}

export async function setPreferenceAction(id: string, preference: GarmentPreference) {
  const user = await requireUser();
  assertId(id);
  if (!PREFERENCES.includes(preference)) throw new Error("Preferencia no válida");
  await data.setGarmentPreference(user.id, id, preference);
  refreshApp();
}

// ======================= Viajes =======================

function parseTripForm(fd: FormData) {
  const cities = fd.getAll("city").map(String);
  const starts = fd.getAll("startDate").map(String);
  const ends = fd.getAll("endDate").map(String);
  const stops: StopInput[] = cities.slice(0, 10).map((city, i) => ({
    city: city.trim(),
    startDate: starts[i] ?? "",
    endDate: ends[i] ?? "",
  }));
  const name = str(fd, "name").trim().slice(0, 80);
  const baggageRaw = str(fd, "baggage");
  const baggage = (BAGGAGE_TYPES as readonly string[]).includes(baggageRaw) ? (baggageRaw as BaggageType) : "cabina";
  const errors = validateStops(stops);
  return {
    stops,
    input: {
      name: name || (stops[0]?.city ? `Viaje a ${stops.map((s) => s.city).filter(Boolean).join(", ")}` : "Mi viaje"),
      stops,
      baggage,
      laundry: fd.get("laundry") === "on",
      notes: str(fd, "notes").trim().slice(0, 500) || undefined,
    },
    errors,
  };
}

export async function createTripAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const { input, errors } = parseTripForm(fd);
  if (errors.length) return { message: errors.join(" ") };
  let id: string;
  try {
    const trip = await data.createTrip(user.id, input);
    id = trip.id;
    await data.refreshTripWeather(user.id, id);
  } catch (e) {
    console.error("[trip:create]", (e as Error).message);
    return { message: "No se ha podido crear el viaje. Inténtalo de nuevo." };
  }
  refreshApp();
  redirect(`/trip/${id}?nuevo=1`);
}

export async function updateTripAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = str(fd, "id");
  assertId(id);
  const { input, errors } = parseTripForm(fd);
  if (errors.length) return { message: errors.join(" ") };
  try {
    await data.updateTrip(user.id, id, input);
    await data.refreshTripWeather(user.id, id);
  } catch (e) {
    if (e instanceof data.NotFoundError) return { message: "Este viaje ya no existe." };
    console.error("[trip:update]", (e as Error).message);
    return { message: "No se han podido guardar los cambios." };
  }
  refreshApp();
  redirect(`/trip/${id}?editado=1`);
}

export async function deleteTripAction(id: string) {
  const user = await requireUser();
  assertId(id);
  await data.deleteTrip(user.id, id);
  refreshApp();
  redirect("/trips?eliminado=1");
}

export async function saveDayActivitiesAction(tripId: string, date: string, items: { type: string; label?: string }[]) {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  const activities: Activity[] = items
    .filter((a) => (ACTIVITY_TYPES as readonly string[]).includes(a.type))
    .slice(0, 6)
    .map((a, i) => ({
      id: `a${i}-${date}`,
      type: a.type as ActivityType,
      label: typeof a.label === "string" ? a.label.trim().slice(0, 60) || undefined : undefined,
    }));
  await data.setDayActivities(user.id, tripId, date, activities);
  refreshApp();
}

export async function setManualWeatherAction(
  tripId: string,
  date: string,
  w: { tempMin: number; tempMax: number; rain: boolean } | null,
): Promise<{ error?: string }> {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  if (w) {
    const { tempMin, tempMax } = w;
    if (![tempMin, tempMax].every((n) => Number.isFinite(n) && n >= -40 && n <= 55))
      return { error: "Introduce temperaturas entre -40 y 55 °C." };
    if (tempMin > tempMax) return { error: "La mínima no puede ser mayor que la máxima." };
    await data.setManualWeather(user.id, tripId, date, {
      tempMin,
      tempMax,
      rainChance: w.rain ? 100 : 0,
      source: "manual",
      sourceLabel: "Introducido por ti",
    });
  } else {
    await data.setManualWeather(user.id, tripId, date, null);
  }
  refreshApp();
  return {};
}

export async function refreshWeatherAction(tripId: string): Promise<{ found: number; total: number }> {
  const user = await requireUser();
  assertId(tripId);
  const r = await data.refreshTripWeather(user.id, tripId);
  refreshApp();
  return r;
}

export async function generateLooksAction(tripId: string, keepEdited: boolean) {
  const user = await requireUser();
  assertId(tripId);
  await data.generateLooks(user.id, tripId, keepEdited);
  refreshApp();
}

export async function nextLookAction(tripId: string, date: string, discardCurrent: boolean) {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  await data.nextLookForDay(user.id, tripId, date, discardCurrent);
  refreshApp();
}

export async function clearDayLookAction(tripId: string, date: string) {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  await data.clearDayLook(user.id, tripId, date);
  refreshApp();
}

export async function setDayGarmentsAction(tripId: string, date: string, garmentIds: string[]) {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  if (!Array.isArray(garmentIds)) throw new Error("Datos no válidos");
  garmentIds.forEach(assertId);
  await data.setDayGarments(user.id, tripId, date, garmentIds);
  refreshApp();
}

export async function toggleFavoriteAction(tripId: string, date: string): Promise<boolean> {
  const user = await requireUser();
  assertId(tripId);
  assertDate(date);
  const fav = await data.toggleDayFavorite(user.id, tripId, date);
  refreshApp();
  return fav;
}

export async function deleteFavoriteAction(id: string) {
  const user = await requireUser();
  assertId(id);
  await data.deleteFavorite(user.id, id);
  refreshApp();
}

export async function applyFavoriteAction(favoriteId: string, tripId: string, date: string) {
  const user = await requireUser();
  assertId(favoriteId);
  assertId(tripId);
  assertDate(date);
  await data.applyFavorite(user.id, favoriteId, tripId, date);
  refreshApp();
}

export async function setPackedAction(tripId: string, key: string, packed: boolean) {
  const user = await requireUser();
  assertId(tripId);
  assertId(key);
  await data.setPacked(user.id, tripId, key, packed);
  refreshApp();
}

export async function addExtraAction(tripId: string, label: string): Promise<{ error?: string }> {
  const user = await requireUser();
  assertId(tripId);
  if (typeof label !== "string" || !label.trim()) return { error: "Escribe qué quieres añadir." };
  await data.addExtra(user.id, tripId, label);
  refreshApp();
  return {};
}

export async function removeExtraAction(tripId: string, extraId: string) {
  const user = await requireUser();
  assertId(tripId);
  assertId(extraId);
  await data.removeExtra(user.id, tripId, extraId);
  refreshApp();
}

export async function dismissOnboardingAction() {
  const user = await requireUser();
  await data.dismissOnboarding(user.id);
  refreshApp();
}
