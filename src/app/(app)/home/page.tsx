import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Luggage, Plus, Shirt } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { GarmentImage } from "@/components/GarmentImage";
import { Notice } from "@/components/Notice";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { daysBetween, formatLong, formatRange, todayIso } from "@/lib/domain/dates";
import { tripBounds } from "@/lib/domain/trip";
import { DismissOnboarding } from "./DismissOnboarding";

export const metadata: Metadata = { title: "Inicio" };

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const data = await getUserData(user.id);
  const today = todayIso();

  const trips = data.trips
    .map((t) => ({ t, ...tripBounds(t.stops) }))
    .sort((a, b) => a.start.localeCompare(b.start));
  const current = trips.find((x) => x.start <= today && today <= x.end);
  const upcoming = trips.filter((x) => x.start > today);
  const next = current ?? upcoming[0];

  const cats = new Set(data.garments.map((g) => g.category));
  const hasBasics = (cats.has("top") && cats.has("bottom")) || cats.has("dress");
  const steps = [
    {
      done: data.garments.length >= 3 && hasBasics && cats.has("shoes"),
      title: "Añade tus primeras prendas",
      text: "Al menos una parte de arriba, una de abajo (o un vestido) y un calzado.",
      href: "/wardrobe/add",
      cta: "Añadir prenda",
    },
    {
      done: data.trips.length > 0,
      title: "Crea tu primer viaje",
      text: "Destino, fechas y tipo de equipaje.",
      href: "/trip/create",
      cta: "Crear viaje",
    },
    {
      done: data.trips.some((t) => t.days.some((d) => d.look)),
      title: "Genera los looks",
      text: "Indica tus planes de cada día y pulsa «Proponer looks».",
      href: data.trips[0] ? `/trip/${data.trips[0].id}` : "/trip/create",
      cta: "Ir al viaje",
    },
  ];
  const showOnboarding = !data.onboardingDismissed && steps.some((s) => !s.done);
  const todayDay = current?.t.days.find((d) => d.date === today);
  const todayGarments = todayDay?.look?.garmentIds
    .map((id) => data.garments.find((g) => g.id === id))
    .filter((g) => !!g);

  return (
    <>
      <PageHeader
        eyebrow={formatLong(today)}
        title={`Hola, ${user.name.split(" ")[0]}`}
        description={sp.bienvenida ? "Tu cuenta está lista. Empecemos por tu armario." : undefined}
      />

      {showOnboarding && (
        <section aria-labelledby="onb" className="card mb-8 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="onb" className="text-2xl font-semibold">
                Primeros pasos
              </h2>
              <p className="mt-1 text-ink-2">Tres pasos para tener tu primera maleta planificada.</p>
            </div>
            <DismissOnboarding />
          </div>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={`flex flex-col rounded-2xl border p-4 ${s.done ? "border-sea/30 bg-sea-soft/50" : "border-line bg-paper"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      s.done ? "bg-sea text-white" : "bg-ink text-paper"
                    }`}
                    aria-hidden="true"
                  >
                    {s.done ? <Check size={16} /> : i + 1}
                  </span>
                  <h3 className="font-sans text-base font-semibold">
                    {s.title}
                    {s.done && <span className="sr-only"> (completado)</span>}
                  </h3>
                </div>
                <p className="mt-2 flex-1 text-sm text-ink-2">{s.text}</p>
                {!s.done && (
                  <Link href={s.href} className="btn btn-secondary btn-sm mt-4 self-start">
                    {s.cta} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Viaje actual o próximo */}
        <section aria-labelledby="next-trip" className="card overflow-hidden">
          <div className="stamp-bg border-b border-line px-5 py-4 sm:px-7">
            <h2 id="next-trip" className="eyebrow">
              {current ? "Estás de viaje" : "Tu próximo viaje"}
            </h2>
          </div>
          {next ? (
            <div className="p-5 sm:p-7">
              <p className="font-display text-3xl font-semibold">{next.t.name}</p>
              <p className="mt-1 flex items-center gap-2 text-ink-2">
                <CalendarDays size={16} aria-hidden="true" /> {formatRange(next.start, next.end)}
                {!current && <span className="badge">en {daysBetween(today, next.start)} días</span>}
              </p>
              <p className="mt-1 text-ink-2">{next.t.stops.map((s) => s.city).join(" → ")}</p>

              {current && todayGarments ? (
                <div className="mt-6">
                  <h3 className="font-sans text-sm font-semibold text-ink-2">Tu look de hoy</h3>
                  <ul className="mt-3 grid grid-cols-4 gap-2.5">
                    {todayGarments.map((g) => (
                      <li key={g.id} className="aspect-[3/4] overflow-hidden rounded-xl border border-line">
                        <GarmentImage garment={g} sizes="sm" thumb />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/trip/${next.t.id}`} className="btn btn-primary">
                  Ver looks y maleta <ArrowRight size={18} aria-hidden="true" />
                </Link>
                {current && (
                  <Link href="/today" className="btn btn-secondary">
                    Look de hoy
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-7">
              <p className="text-ink-2">No tienes viajes próximos.</p>
              <Link href="/trip/create" className="btn btn-accent mt-4">
                <Plus size={18} aria-hidden="true" /> Planificar un viaje
              </Link>
            </div>
          )}
        </section>

        {/* Resumen del armario */}
        <section aria-labelledby="wardrobe-sum" className="card p-5 sm:p-7">
          <h2 id="wardrobe-sum" className="eyebrow">
            Tu armario
          </h2>
          <p className="mt-3 font-display text-5xl font-semibold">{data.garments.length}</p>
          <p className="text-ink-2">{data.garments.length === 1 ? "prenda" : "prendas"}</p>
          {data.garments.length > 0 && (
            <ul className="mt-5 grid grid-cols-5 gap-2" aria-label="Últimas prendas añadidas">
              {data.garments
                .slice(-5)
                .reverse()
                .map((g) => (
                  <li key={g.id} className="aspect-square overflow-hidden rounded-xl border border-line">
                    <GarmentImage garment={g} sizes="sm" thumb />
                  </li>
                ))}
            </ul>
          )}
          {data.garments.length > 0 && !hasBasics && (
            <Notice tone="warning" className="mt-4">
              Aún te falta ropa base (arriba + abajo, o un vestido) para poder proponer looks.
            </Notice>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/wardrobe/add" className="btn btn-secondary">
              <Plus size={18} aria-hidden="true" /> Añadir prenda
            </Link>
            <Link href="/wardrobe" className="btn btn-ghost">
              <Shirt size={18} aria-hidden="true" /> Ver armario
            </Link>
          </div>
        </section>
      </div>

      {upcoming.length > (current ? 0 : 1) && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Más viajes</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(current ? 0 : 1, 7).map(({ t, start, end }) => (
              <li key={t.id}>
                <Link href={`/trip/${t.id}`} className="card flex items-center gap-3 p-4 hover:border-ink-3">
                  <Luggage size={20} className="text-clay" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{t.name}</span>
                    <span className="text-sm text-ink-3">{formatRange(start, end)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
