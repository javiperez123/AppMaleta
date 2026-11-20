import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { StyleTrainer } from "./StyleTrainer";

export const metadata: Metadata = { title: "Mi estilo" };

export default async function TrainPage() {
  const user = await requireUser();
  const { garments, styleProfile } = await getUserData(user.id);
  return (
    <>
      <PageHeader
        eyebrow="Mi estilo"
        title="¿Qué te gusta llevar?"
        description="Valora tus prendas. Daremos prioridad a las que te encantan y evitaremos las que prefieres no llevar."
      />

      {/* Estilo personal CTA */}
      <Link
        href="/perfil-estilo"
        className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 transition hover:border-ink hover:shadow-sm"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          <Sparkles size={20} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Descubre tu estilo personal</p>
          <p className="text-sm text-ink-3">
            {styleProfile && styleProfile.swipeCount >= 5
              ? `Perfil activo · ${styleProfile.swipeCount} prendas evaluadas`
              : "Swipea ropa del catálogo para personalizar tus looks"}
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-3" aria-hidden="true" />
      </Link>

      {garments.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Primero, añade prendas"
          action={
            <Link href="/wardrobe/add" className="btn btn-accent">
              Añadir prenda
            </Link>
          }
        >
          Cuando tengas ropa en tu armario podrás valorarla aquí.
        </EmptyState>
      ) : (
        <StyleTrainer garments={garments} />
      )}
    </>
  );
}
