import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { GarmentImage } from "@/components/GarmentImage";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { formatLong } from "@/lib/domain/dates";
import { RemoveFavorite } from "./RemoveFavorite";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const data = await getUserData(user.id);
  const byId = new Map(data.garments.map((g) => [g.id, g]));

  return (
    <>
      <PageHeader
        eyebrow="Favoritos"
        title="Looks guardados"
        description="Los looks que más te gustan. Puedes reutilizarlos en cualquier día de otro viaje desde «Editar prendas»."
      />
      {data.favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aún no tienes looks favoritos"
          action={
            <Link href="/trips" className="btn btn-primary">
              Ir a mis viajes
            </Link>
          }
        >
          En cada día de un viaje, pulsa «Guardar» para añadir el look aquí.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.favorites.map((f) => {
            const items = f.garmentIds.map((id) => byId.get(id)).filter((g) => !!g);
            const trip = data.trips.find((t) => t.id === f.tripId);
            return (
              <li key={f.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-sans text-base font-semibold">{trip ? trip.name : f.name}</h2>
                    {f.date && <p className="text-sm text-ink-3">{formatLong(f.date)}</p>}
                  </div>
                  <RemoveFavorite id={f.id} />
                </div>
                <ul className="mt-3 grid grid-cols-4 gap-2">
                  {items.map((g) => (
                    <li key={g.id}>
                      <div className="aspect-[3/4] overflow-hidden rounded-lg border border-line">
                        <GarmentImage garment={g} sizes="sm" thumb />
                      </div>
                      <p className="mt-1 truncate text-[11px] text-ink-2">{g.name}</p>
                    </li>
                  ))}
                </ul>
                {trip && (
                  <Link href={`/trip/${trip.id}`} className="mt-3 inline-block text-sm font-semibold text-sea underline-offset-4 hover:underline">
                    Ver viaje
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
