import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Luggage, MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { formatRange, todayIso } from "@/lib/domain/dates";
import { tripBounds } from "@/lib/domain/trip";
import { BAGGAGE_LABELS } from "@/lib/domain/labels";
import type { Trip } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Viajes" };

export default async function TripsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const { trips } = await getUserData(user.id);
  const today = todayIso();
  const withDates = trips.map((t) => ({ t, ...tripBounds(t.stops) }));
  const active = withDates.filter((x) => x.end >= today).sort((a, b) => a.start.localeCompare(b.start));
  const past = withDates.filter((x) => x.end < today).sort((a, b) => b.start.localeCompare(a.start));

  return (
    <>
      <PageHeader
        eyebrow="Viajes"
        title="Tus viajes"
        actions={
          trips.length > 0 && (
            <Link href="/trip/create" className="btn btn-accent">
              <Plus size={18} aria-hidden="true" /> Nuevo viaje
            </Link>
          )
        }
      />
      {sp.eliminado && (
        <Notice tone="success" className="mb-5">
          Viaje eliminado.
        </Notice>
      )}
      {trips.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="Aún no has planificado ningún viaje"
          action={
            <Link href="/trip/create" className="btn btn-accent">
              <Plus size={18} aria-hidden="true" /> Planificar mi primer viaje
            </Link>
          }
        >
          Indica destino y fechas; luego añade tus planes de cada día y te propondremos qué ponerte.
        </EmptyState>
      ) : (
        <>
          {active.length > 0 && <TripGrid title="Próximos y en curso" items={active} today={today} />}
          {past.length > 0 && <TripGrid title="Anteriores" items={past} today={today} muted />}
        </>
      )}
    </>
  );
}

function TripGrid({
  title,
  items,
  today,
  muted,
}: {
  title: string;
  items: { t: Trip; start: string; end: string }[];
  today: string;
  muted?: boolean;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ t, start, end }) => {
          const looks = t.days.filter((d) => d.look?.garmentIds.length).length;
          const ongoing = start <= today && today <= end;
          return (
            <li key={t.id}>
              <Link href={`/trip/${t.id}`} className={`card block h-full p-5 transition hover:-translate-y-0.5 hover:border-ink-3 ${muted ? "opacity-80" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-semibold leading-tight">{t.name}</h3>
                  {ongoing && <span className="badge !bg-clay !text-white">En curso</span>}
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-ink-2">
                  <CalendarDays size={16} aria-hidden="true" /> {formatRange(start, end)} · {t.days.length}{" "}
                  {t.days.length === 1 ? "día" : "días"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink-2">
                  <MapPin size={16} aria-hidden="true" />
                  <span className="truncate">{t.stops.map((s) => s.city).join(" → ")}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge">{BAGGAGE_LABELS[t.baggage]}</span>
                  <span className={`badge ${looks === t.days.length ? "!bg-sea-soft !text-sea" : ""}`}>
                    {looks}/{t.days.length} looks
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
