import { dateRange, isIsoDate } from "./dates.ts";
import type { Activity, TripDay, TripStop } from "./types.ts";

export const MAX_TRIP_DAYS = 60;

export interface StopInput {
  city: string;
  startDate: string;
  endDate: string;
}

/** Valida las paradas de un viaje. Devuelve errores legibles (vacío si es válido). */
export function validateStops(stops: StopInput[]): string[] {
  const errors: string[] = [];
  if (stops.length === 0) errors.push("Añade al menos un destino.");
  stops.forEach((s, i) => {
    const n = stops.length > 1 ? ` (destino ${i + 1})` : "";
    if (!s.city.trim()) errors.push(`Indica la ciudad${n}.`);
    if (s.city.trim().length > 80) errors.push(`El nombre de la ciudad es demasiado largo${n}.`);
    if (!isIsoDate(s.startDate)) errors.push(`Indica la fecha de llegada${n}.`);
    if (!isIsoDate(s.endDate)) errors.push(`Indica la fecha de salida${n}.`);
    if (isIsoDate(s.startDate) && isIsoDate(s.endDate) && s.endDate < s.startDate)
      errors.push(`La salida no puede ser anterior a la llegada${n}.`);
  });
  if (errors.length) return errors;
  const sorted = [...stops].sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startDate < sorted[i - 1].endDate)
      errors.push("Los destinos se solapan: cada destino debe empezar el día que termina el anterior o después.");
  }
  const start = sorted[0].startDate;
  const end = sorted.reduce((m, s) => (s.endDate > m ? s.endDate : m), sorted[0].endDate);
  if (dateRange(start, end).length > MAX_TRIP_DAYS)
    errors.push(`El viaje no puede durar más de ${MAX_TRIP_DAYS} días.`);
  return errors;
}

export function tripBounds(stops: Pick<TripStop, "startDate" | "endDate">[]): { start: string; end: string } {
  const start = stops.reduce((m, s) => (s.startDate < m ? s.startDate : m), stops[0].startDate);
  const end = stops.reduce((m, s) => (s.endDate > m ? s.endDate : m), stops[0].endDate);
  return { start, end };
}

/** Ciudad en la que se está un día dado. En días de traslado gana el destino que empieza ese día. */
export function cityForDate(stops: TripStop[], date: string): string {
  const sorted = [...stops].sort((a, b) => a.startDate.localeCompare(b.startDate));
  let city = sorted[0]?.city ?? "";
  for (const s of sorted) if (s.startDate <= date && date <= s.endDate) city = s.city;
  return city;
}

/**
 * Recalcula los días del viaje a partir de las paradas, conservando las
 * actividades, el clima y los looks de los días que siguen existiendo
 * (si no ha cambiado la ciudad de ese día).
 */
export function buildDays(stops: TripStop[], previous: TripDay[] = []): TripDay[] {
  const { start, end } = tripBounds(stops);
  const prev = new Map(previous.map((d) => [d.date, d]));
  return dateRange(start, end).map((date) => {
    const city = cityForDate(stops, date);
    const old = prev.get(date);
    if (old && old.city === city) return old;
    const isTransfer = stops.some((s) => s.startDate === date) && stops.some((s) => s.endDate === date && s.city !== city);
    const activities: Activity[] = old?.activities ?? (isTransfer ? [{ id: `a-${date}-t`, type: "transit" }] : []);
    return { date, city, activities, discardedKeys: [] };
  });
}
