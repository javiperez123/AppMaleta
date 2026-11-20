// Utilidades de fechas en formato YYYY-MM-DD, sin zonas horarias (fechas "de calendario").

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: string): boolean {
  if (!ISO.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / 86_400_000,
  );
}

export function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Fecha local de hoy (YYYY-MM-DD) en la zona indicada o la del sistema. */
export function todayIso(timeZone?: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

const fmtLong = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const fmtShort = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatLong(date: string): string {
  const s = fmtLong.format(new Date(date + "T00:00:00Z"));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatShort(date: string): string {
  return fmtShort.format(new Date(date + "T00:00:00Z")).replace(".", "");
}

export function formatRange(start: string, end: string): string {
  if (start === end) return formatShort(start);
  return `${formatShort(start)} – ${formatShort(end)}`;
}
