"use client";

import { TriangleAlert } from "lucide-react";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
      <TriangleAlert size={32} className="mx-auto text-clay" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">Algo no ha ido bien</h1>
      <p className="mt-2 text-ink-2">
        No hemos podido cargar esta pantalla. Tus datos están a salvo. Prueba de nuevo en unos segundos.
      </p>
      <button className="btn btn-primary mt-6" onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  );
}
