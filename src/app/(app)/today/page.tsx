import type { Metadata } from "next";
import Link from "next/link";
import { Sun } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { formatLong, todayIso } from "@/lib/domain/dates";
import { DayCard } from "../trip/[id]/DayCard";

export const metadata: Metadata = { title: "Look de hoy" };

export default async function TodayPage() {
  const user = await requireUser();
  const data = await getUserData(user.id);
  const today = todayIso();
  const trip = data.trips.find((t) => t.days.some((d) => d.date === today));
  const idx = trip?.days.findIndex((d) => d.date === today) ?? -1;

  return (
    <>
      <PageHeader eyebrow={formatLong(today)} title="Tu look de hoy" description={trip ? trip.name : undefined} />
      {trip && idx >= 0 ? (
        <>
          <DayCard tripId={trip.id} day={trip.days[idx]} index={idx} isToday garments={data.garments} favorites={data.favorites} />
          <Link href={`/trip/${trip.id}`} className="btn btn-secondary mt-6">
            Ver todo el viaje
          </Link>
        </>
      ) : (
        <EmptyState
          icon={Sun}
          title="Hoy no estás de viaje"
          action={
            <Link href="/trips" className="btn btn-primary">
              Ver mis viajes
            </Link>
          }
        >
          Cuando estés de viaje, aquí verás el look del día con el tiempo de tu destino.
        </EmptyState>
      )}
    </>
  );
}
