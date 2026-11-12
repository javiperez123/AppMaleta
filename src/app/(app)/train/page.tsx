import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { StyleTrainer } from "./StyleTrainer";

export const metadata: Metadata = { title: "Mi estilo" };

export default async function TrainPage() {
  const user = await requireUser();
  const { garments } = await getUserData(user.id);
  return (
    <>
      <PageHeader
        eyebrow="Mi estilo"
        title="¿Qué te gusta llevar?"
        description="Valora tus prendas. Daremos prioridad a las que te encantan y evitaremos las que prefieres no llevar."
      />
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
