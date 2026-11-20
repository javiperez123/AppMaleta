import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { GarmentForm } from "@/components/GarmentForm";
import { Notice } from "@/components/Notice";

export const metadata: Metadata = { title: "Añadir prenda" };

export default async function AddGarmentPage({ searchParams }: { searchParams: Promise<{ guardada?: string }> }) {
  const { guardada } = await searchParams;
  return (
    <>
      <Link href="/wardrobe" className="btn btn-ghost -ml-3 mb-2">
        <ChevronLeft size={18} aria-hidden="true" /> Armario
      </Link>
      <PageHeader title="Añadir prenda" description="Solo el nombre y el tipo son obligatorios. El resto mejora las propuestas." />
      {guardada && (
        <Notice tone="success" className="mb-6">
          «{guardada}» guardada. Vamos con la siguiente.
        </Notice>
      )}
      <GarmentForm key={guardada ?? "new"} mode="create" />
    </>
  );
}
