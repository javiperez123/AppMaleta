import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { TripForm } from "@/components/TripForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { deleteTripAction } from "@/app/actions";

export const metadata: Metadata = { title: "Editar viaje" };

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const trip = (await getUserData(user.id)).trips.find((t) => t.id === id);
  if (!trip) notFound();
  return (
    <>
      <Link href={`/trip/${id}`} className="btn btn-ghost -ml-3 mb-2">
        <ChevronLeft size={18} aria-hidden="true" /> Volver al viaje
      </Link>
      <PageHeader
        title="Editar viaje"
        description="Si cambias las fechas o los destinos, conservamos los planes y looks de los días que sigan igual."
        actions={
          <ConfirmButton
            action={deleteTripAction.bind(null, id)}
            title="¿Eliminar este viaje?"
            description="Se borrarán sus looks y la lista de maleta. Tus prendas no se tocan."
          >
            <Trash2 size={18} aria-hidden="true" /> Eliminar viaje
          </ConfirmButton>
        }
      />
      <TripForm trip={trip} />
    </>
  );
}
