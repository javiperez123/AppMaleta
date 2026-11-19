import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { GarmentForm } from "@/components/GarmentForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { deleteGarmentAction } from "@/app/actions";

export const metadata: Metadata = { title: "Editar prenda" };

export default async function EditGarmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getUserData(user.id);
  const garment = data.garments.find((g) => g.id === id);
  if (!garment) notFound();
  const usedIn = data.trips.filter((t) => t.days.some((d) => d.look?.garmentIds.includes(id))).length;
  const remove = deleteGarmentAction.bind(null, id);

  return (
    <>
      <Link href="/wardrobe" className="btn btn-ghost -ml-3 mb-2">
        <ChevronLeft size={18} aria-hidden="true" /> Armario
      </Link>
      <PageHeader
        title={garment.name}
        description={usedIn ? `Aparece en looks de ${usedIn} ${usedIn === 1 ? "viaje" : "viajes"}.` : undefined}
        actions={
          <ConfirmButton
            action={remove}
            title="¿Eliminar esta prenda?"
            description={
              usedIn
                ? `Se quitará también de los looks de ${usedIn} ${usedIn === 1 ? "viaje" : "viajes"}. No se puede deshacer.`
                : "Se borrarán la prenda y su foto. No se puede deshacer."
            }
          >
            <Trash2 size={18} aria-hidden="true" /> Eliminar
          </ConfirmButton>
        }
      />
      <GarmentForm mode="edit" garment={garment} />
    </>
  );
}
