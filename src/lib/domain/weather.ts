// Clima real con Open-Meteo (gratuito, sin clave). Nunca inventa datos:
// - hasta 15 días vista: previsión;
// - más adelante o en el pasado: datos históricos del mismo periodo (año anterior), marcados como estimación;
// - si no hay respuesta: sin datos (la app lo indica y permite introducirlos a mano).
import { addDays, daysBetween } from "./dates.ts";
import type { DayWeather } from "./types.ts";

export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

const TIMEOUT = 8000;
const FORECAST_HORIZON = 15;

export function weatherDisabled(): boolean {
  return process.env.WEATHER_PROVIDER === "off";
}

async function getJson(fetcher: FetchLike, url: string): Promise<unknown | null> {
  try {
    const res = await fetcher(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function geocode(city: string, fetcher: FetchLike = fetch as unknown as FetchLike): Promise<GeoResult | null> {
  if (weatherDisabled()) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&language=es&format=json&name=${encodeURIComponent(city.trim())}`;
  const data = (await getJson(fetcher, url)) as { results?: GeoResult[] } | null;
  const r = data?.results?.[0];
  if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
  return { name: r.name, latitude: r.latitude, longitude: r.longitude, country: r.country };
}

interface DailyPayload {
  daily?: {
    time?: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    precipitation_sum?: (number | null)[];
  };
}

/** Convierte la respuesta diaria de Open-Meteo en un mapa fecha → clima. Exportado para pruebas. */
export function parseDaily(
  payload: unknown,
  source: "forecast" | "historical",
  shiftYears = 0,
): Map<string, DayWeather> {
  const out = new Map<string, DayWeather>();
  const d = (payload as DailyPayload | null)?.daily;
  if (!d?.time) return out;
  d.time.forEach((date, i) => {
    const max = d.temperature_2m_max?.[i];
    const min = d.temperature_2m_min?.[i];
    if (typeof max !== "number" || typeof min !== "number") return;
    let rainChance: number;
    if (source === "forecast") {
      const p = d.precipitation_probability_max?.[i];
      rainChance = typeof p === "number" ? p : 0;
    } else {
      const mm = d.precipitation_sum?.[i];
      rainChance = typeof mm === "number" && mm >= 1 ? 100 : 0;
    }
    const key = shiftYears ? shiftYear(date, shiftYears) : date;
    out.set(key, {
      tempMin: min,
      tempMax: max,
      rainChance,
      source,
      sourceLabel:
        source === "forecast"
          ? "Previsión de Open-Meteo"
          : `Estimación: tiempo real del ${formatYear(date)} en las mismas fechas (Open-Meteo)`,
    });
  });
  return out;
}

function shiftYear(date: string, years: number): string {
  const y = Number(date.slice(0, 4)) + years;
  const md = date.slice(5);
  // 29 de febrero → 28 si el año destino no es bisiesto
  if (md === "02-29" && !(y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0))) return `${y}-02-28`;
  return `${y}-${md}`;
}
function formatYear(date: string): string {
  return date.slice(0, 4);
}

/** Obtiene el clima diario para un rango de fechas en unas coordenadas. */
export async function fetchWeatherRange(
  lat: number,
  lon: number,
  start: string,
  end: string,
  today: string,
  fetcher: FetchLike = fetch as unknown as FetchLike,
): Promise<Map<string, DayWeather>> {
  const result = new Map<string, DayWeather>();
  if (weatherDisabled()) return result;
  const coords = `latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&timezone=auto`;
  const horizon = addDays(today, FORECAST_HORIZON);

  // 1) Previsión para los días dentro del horizonte.
  const fStart = start < today ? today : start;
  const fEnd = end > horizon ? horizon : end;
  if (fStart <= fEnd) {
    const url = `https://api.open-meteo.com/v1/forecast?${coords}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&start_date=${fStart}&end_date=${fEnd}`;
    for (const [k, v] of parseDaily(await getJson(fetcher, url), "forecast")) result.set(k, v);
  }

  // 2) Para días pasados o más allá del horizonte: histórico del año anterior (estimación).
  const missing: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) if (!result.has(d)) missing.push(d);
  if (missing.length) {
    // Si el día ya pasó hace más de 5 días, el histórico de ese mismo año existe; si no, usamos el año anterior.
    const pastReal = missing.filter((d) => daysBetween(d, today) > 5);
    const future = missing.filter((d) => daysBetween(d, today) <= 5);
    const fetchArchive = async (dates: string[], years: number) => {
      if (!dates.length) return;
      const s = shiftYear(dates[0], -years);
      const e = shiftYear(dates[dates.length - 1], -years);
      const url = `https://archive-api.open-meteo.com/v1/archive?${coords}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&start_date=${s}&end_date=${e}`;
      const parsed = parseDaily(await getJson(fetcher, url), "historical", years);
      for (const d of dates) {
        const v = parsed.get(d);
        if (!v) continue;
        result.set(
          d,
          years === 0
            ? { ...v, sourceLabel: "Tiempo registrado ese día (Open-Meteo)" }
            : v,
        );
      }
    };
    await fetchArchive(pastReal, 0);
    await fetchArchive(future, 1);
  }
  return result;
}
