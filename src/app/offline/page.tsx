import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <WifiOff size={48} className="text-ink-3" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-semibold mb-2">Sin conexión</h1>
        <p className="text-ink-2 max-w-xs mx-auto">
          Parece que no tienes internet ahora mismo. Las páginas que hayas visitado antes siguen disponibles.
        </p>
      </div>
      <Link href="/" className="btn btn-primary">
        Reintentar
      </Link>
    </div>
  );
}
