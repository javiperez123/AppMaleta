import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { WardrobeBrowser } from "./WardrobeBrowser";

export const metadata: Metadata = { title: "Armario" };

export default async function WardrobePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const { garments } = await getUserData(user.id);
  const notice = sp.nueva ? "Prenda añadida al armario." : sp.editada ? "Cambios guardados." : sp.eliminada ? "Prenda eliminada." : null;

  return (
    <>
      <PageHeader
        eyebrow="Armario"
        title="Tu ropa"
        description="Todo lo que puedes llevar de viaje. Cuanto más completos los datos, mejores serán los looks."
        actions={
          garments.length > 0 && (
            <Link href="/wardrobe/add" className="btn btn-accent">
              <Plus size={18} aria-hidden="true" /> Añadir prenda
            </Link>
          )
        }
      />
      {notice && (
        <Notice tone="success" className="mb-5">
          {notice}
        </Notice>
      )}
      {garments.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Tu armario está vacío"
          action={
            <Link href="/wardrobe/add" className="btn btn-accent">
              <Camera size={18} aria-hidden="true" /> Añadir mi primera prenda
            </Link>
          }
        >
          Haz una foto a cada prenda sobre un fondo liso y con buena luz. Empieza por lo que más usas: un par de camisetas, unos
          pantalones, una chaqueta y tu calzado favorito.
        </EmptyState>
      ) : (
        <WardrobeBrowser garments={garments} highlight={sp.nueva ?? sp.editada} />
      )}
    </>
  );
}
