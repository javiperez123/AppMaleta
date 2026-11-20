"use client";

import { useRef, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

/** Botón con diálogo de confirmación accesible (<dialog> nativo) para acciones destructivas. */
export function ConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Eliminar",
  children,
  className = "btn btn-danger",
}: {
  action: () => Promise<unknown>;
  title: string;
  description: string;
  confirmLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/40"
        aria-labelledby="confirm-title"
      >
        <div className="p-6">
          <h2 id="confirm-title" className="text-xl font-semibold">
            {title}
          </h2>
          <p className="mt-2 text-ink-2">{description}</p>
          {error && <p className="field-error mt-3">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()} disabled={pending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-accent"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  try {
                    await action();
                    ref.current?.close();
                  } catch (e) {
                    // redirect() de Next lanza una excepción controlada: la dejamos pasar
                    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
                    setError("No se ha podido completar. Inténtalo de nuevo.");
                  }
                })
              }
            >
              {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
