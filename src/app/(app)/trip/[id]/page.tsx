import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, MapPin, Pencil, Shirt } from "lucide-react";
import { Notice } from "@/components/Notice";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { formatRange, todayIso } from "@/lib/domain/dates";
import { tripBounds } from "@/lib/domain/trip";
import { buildPackingList } from "@/lib/domain/packing";
import { buildCapsule } from "@/lib/domain/capsule";
import { BAGGAGE_LABELS } from "@/lib/domain/labels";
import { TripToolbar } from "./TripToolbar";
import { DayCard } from "./DayCard";
import { PackingView } from "./PackingView";
import { CapsuleView } from "./CapsuleView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const trip = (await getUserData(user.id)).trips.find((t) => t.id === id);
  return { title: trip?.name ?? "Viaje" };
}

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const data = await getUserData(user.id);
  const trip = data.trips.find((t) => t.id === id);
  if (!trip) notFound();

  const tab = sp.tab === "maleta" ? "maleta" : sp.tab === "capsula" ? "capsula" : "dias";
  const { start, end } = tripBounds(trip.stops);
  const today = todayIso();
  const withWeather = trip.days.filter((d) => d.weather).length;
  const withLook = trip.days.filter((d) => d.look?.garmentIds.length).length;
  const hasKept = trip.days.some((d) => d.look && (d.look.edited || d.look.favorite));
  const cats = new Set(data.garments.map((g) => g.category));
  const canDress = ((cats.has("top") && cats.has("bottom")) || cats.has("dress")) && cats.has("shoes");
  const packing = buildPackingList(trip, data.garments);
  const capsule = buildCapsule(data.garments, trip, trip.days);

  return (
    <>
      <Link href="/trips" className="btn btn-ghost -ml-3 mb-2 print:hidden">
        <ChevronLeft size={18} aria-hidden="true" /> Viajes
      </Link>

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow mb-1.5">{BAGGAGE_LABELS[trip.baggage]}{trip.laundry ? " · con lavado" : ""}</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{trip.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={16} aria-hidden="true" /> {formatRange(start, end)} · {trip.days.length}{" "}
                {trip.days.length === 1 ? "día" : "días"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} aria-hidden="true" /> {trip.stops.map((s) => s.city).join(" → ")}
              </span>
            </p>
          </div>
          <Link href={`/trip/${trip.id}/edit`} className="btn btn-secondary shrink-0 self-start print:hidden">
            <Pencil size={16} aria-hidden="true" /> Editar viaje
          </Link>
        </div>
      </header>

      {sp.nuevo && withLook === 0 && (
        <Notice tone="success" className="mb-4">
          Viaje creado. Ahora marca qué planes tienes cada día (opcional) y pulsa «Proponer looks».
        </Notice>
      )}
      {!canDress && (
        <Notice tone="warning" className="mb-4">
          Para proponer looks necesitas al menos una parte de arriba y una de abajo (o un vestido) y un calzado.{" "}
          <Link href="/wardrobe/add" className="font-semibold underline">
            Añadir prendas
          </Link>
        </Notice>
      )}

      <TripToolbar
        tripId={trip.id}
        withWeather={withWeather}
        withLook={withLook}
        totalDays={trip.days.length}
        hasKept={hasKept}
        canDress={canDress}
        startsAfterHorizon={start > today}
      />

      <nav aria-label="Secciones del viaje" className="mb-6 mt-6 flex gap-1 border-b border-line print:hidden overflow-x-auto">
        {[
          { key: "dias", label: "Looks por día", count: `${withLook}/${trip.days.length}`, href: `/trip/${trip.id}` },
          { key: "maleta", label: "Maleta", count: `${packing.packedCount}/${packing.totalCount}`, href: `/trip/${trip.id}?tab=maleta` },
          { key: "capsula", label: "Cápsula", count: `${capsule.ids.length}`, href: `/trip/${trip.id}?tab=capsula` },
        ].map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={tab === t.key ? "page" : undefined}
            scroll={false}
            className={`-mb-px flex shrink-0 min-h-12 items-center gap-2 border-b-2 px-4 font-semibold ${
              tab === t.key ? "border-clay text-ink" : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            {t.label} <span className="badge">{t.count}</span>
          </Link>
        ))}
      </nav>

      {tab === "dias" ? (
        <ol className="flex flex-col gap-4">
          {trip.days.map((day, i) => (
            <li key={day.date}>
              <DayCard
                tripId={trip.id}
                tripName={trip.name}
                day={day}
                index={i}
                isToday={day.date === today}
                garments={data.garments}
                favorites={data.favorites}
              />
            </li>
          ))}
        </ol>
      ) : tab === "capsula" ? (
        <CapsuleView
          tripId={trip.id}
          result={capsule}
          garments={data.garments}
          currentCapsuleIds={trip.capsuleIds}
        />
      ) : packing.totalGarments === 0 && packing.basics.length === 0 ? (
        <div className="card p-8 text-center">
          <Shirt size={28} className="mx-auto text-ink-3" aria-hidden="true" />
          <p className="mt-3 text-ink-2">La lista de maleta se crea a partir de los looks. Propón los looks primero.</p>
        </div>
      ) : (
        <PackingView tripId={trip.id} list={packing} packed={trip.packed} extras={trip.extras} baggage={trip.baggage} />
      )}
    </>
  );
}
