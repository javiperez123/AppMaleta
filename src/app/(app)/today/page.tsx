import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, RefreshCw, Settings, Sun, Thermometer, Wind } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { formatLong, todayIso } from "@/lib/domain/dates";
import { DayCard } from "../trip/[id]/DayCard";
import { RefreshDailyButton } from "./RefreshDailyButton";

export const metadata: Metadata = { title: "Look de hoy" };

function WeatherBadge({ weather }: { weather: { tempMin: number; tempMax: number; wmoCode?: number } }) {
  const avg = Math.round((weather.tempMin + weather.tempMax) / 2);
  const icons: Record<number, { icon: typeof Sun; label: string }> = {
    0: { icon: Sun, label: "Despejado" },
    1: { icon: Sun, label: "Mayormente despejado" },
    2: { icon: Cloud, label: "Parcialmente nublado" },
    3: { icon: Cloud, label: "Nublado" },
  };
  const { icon: Icon, label } = (weather.wmoCode !== undefined ? icons[weather.wmoCode] : undefined) ?? { icon: Cloud, label: "Variable" };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
      <Icon size={22} className="text-amber-500" aria-hidden="true" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-ink-2 flex items-center gap-1">
          <Thermometer size={12} /> {weather.tempMin}° – {weather.tempMax}° · media {avg}°C
        </p>
      </div>
    </div>
  );
}

export default async function TodayPage() {
  const user = await requireUser();
  const data = await getUserData(user.id);
  const today = todayIso();

  // Check if on a trip today
  const trip = data.trips.find((t) => t.days.some((d) => d.date === today));
  const idx = trip?.days.findIndex((d) => d.date === today) ?? -1;

  if (trip && idx >= 0) {
    return (
      <>
        <PageHeader eyebrow={formatLong(today)} title="Tu look de hoy" description={trip.name} />
        <DayCard
          tripId={trip.id}
          tripName={trip.name}
          day={trip.days[idx]}
          index={idx}
          isToday
          garments={data.garments}
          favorites={data.favorites}
        />
        <Link href={`/trip/${trip.id}`} className="btn btn-secondary mt-6">
          Ver todo el viaje
        </Link>
      </>
    );
  }

  // Not on a trip — show daily look from settings
  const daily = data.daily;
  const settings = data.settings;
  const hasCity = !!settings?.homeCity;
  const dailyIsToday = daily?.date === today;

  return (
    <>
      <PageHeader
        eyebrow={formatLong(today)}
        title="Look de hoy"
        description={hasCity ? `En ${settings!.homeCity}` : "Configura tu ciudad para ver el tiempo"}
      />

      {!hasCity ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center max-w-md mx-auto">
          <Settings size={32} className="mx-auto text-ink-3 mb-3" />
          <h2 className="font-semibold mb-2">Configura tu ciudad</h2>
          <p className="text-sm text-ink-2 mb-4">
            Para ver el look del día con el tiempo de tu ciudad, primero indícanos dónde vives.
          </p>
          <Link href="/account" className="btn btn-primary">
            Ir a Ajustes
          </Link>
        </div>
      ) : !dailyIsToday ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center max-w-md mx-auto">
          <Sun size={32} className="mx-auto text-amber-400 mb-3" />
          <h2 className="font-semibold mb-2">Tu look de hoy está listo para generarse</h2>
          <p className="text-sm text-ink-2 mb-4">
            Pulsa el botón para que la app proponga un look adaptado al tiempo en {settings!.homeCity}.
          </p>
          <RefreshDailyButton />
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Tiempo */}
          {daily?.weather && (
            <WeatherBadge weather={daily.weather} />
          )}

          {/* Look */}
          {daily?.look && daily.look.garmentIds.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Tu propuesta para hoy</h2>
                <RefreshDailyButton compact />
              </div>
              <div className="rounded-2xl border border-line bg-card p-5">
                <ul className="flex flex-col gap-3">
                  {daily.look.garmentIds.map((gid) => {
                    const g = data.garments.find((x) => x.id === gid);
                    if (!g) return null;
                    return (
                      <li key={gid} className="flex items-center gap-3">
                        {g.imageId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/photos/${g.imageId}`}
                            alt={g.name}
                            className="h-12 w-12 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-paper-2 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{g.name}</p>
                          {g.color && <p className="text-xs text-ink-3">{g.color}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {daily.look.reasons && daily.look.reasons.length > 0 && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-2">Por qué este look</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {daily.look.reasons.map((r, i) => (
                        <li key={i} className="chip text-xs">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-ink-2">
              <Wind size={24} className="mx-auto mb-2" />
              <p>No hay prendas disponibles para proponer un look hoy.</p>
              <Link href="/wardrobe" className="btn btn-secondary mt-3">
                Ver armario
              </Link>
            </div>
          )}

          <Link href="/probador" className="btn btn-secondary self-start">
            Probar en mi personaje
          </Link>
        </div>
      )}
    </>
  );
}
