import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { TripForm } from "@/components/TripForm";

export const metadata: Metadata = { title: "Nuevo viaje" };

export default function CreateTripPage() {
  return (
    <>
      <Link href="/trips" className="btn btn-ghost -ml-3 mb-2">
        <ChevronLeft size={18} aria-hidden="true" /> Viajes
      </Link>
      <PageHeader
        eyebrow="Nuevo viaje"
        title="Planifica tu viaje"
        description="Después podrás indicar los planes de cada día y te propondremos un look para cada uno."
      />
      <TripForm />
    </>
  );
}
