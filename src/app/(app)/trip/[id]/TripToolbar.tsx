"use client";

import { useRef, useState, useTransition } from "react";
import { CloudSun, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { generateLooksAction, refreshWeatherAction } from "@/app/actions";

export function TripToolbar({
  tripId,
  withWeather,
  withLook,
  totalDays,
  hasKept,
  canDress,
}: {
  tripId: string;
  withWeather: number;
  withLook: number;
  totalDays: number;
  hasKept: boolean;
  canDress: boolean;
  startsAfterHorizon: boolean;
}) {
  const [genPending, startGen] = useTransition();
  const [wPending, startW] = useTransition();
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const generate = (keepEdited: boolean) =>
    startGen(async () => {
      setMsg(null);
      try {
        await generateLooksAction(tripId, keepEdited);
        setMsg({ tone: "ok", text: "Looks propuestos. Revisa cada día y ajusta lo que quieras." });
      } catch {
        setMsg({ tone: "err", text: "No se han podido generar los looks. Inténtalo de nuevo." });
      }
      dialog.current?.close();
    });

  const refreshWeather = () =>
    startW(async () => {
      setMsg(null);
      try {
        const r = await refreshWeatherAction(tripId);
        setMsg(
          r.found === r.total
            ? { tone: "ok", text: "Tiempo actualizado para todos los días." }
            : {
                tone: "err",
                text: `Tenemos datos del tiempo para ${r.found} de ${r.total} días. Puedes indicar el resto a mano en cada día.`,
              },
        );
      } catch {
        setMsg({ tone: "err", text: "No se ha podido consultar el tiempo. Revisa tu conexión." });
      }
    });

  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 print:hidden">
      <div className="text-sm text-ink-2">
        <p className="flex items-center gap-2">
          <CloudSun size={18} className="text-sea" aria-hidden="true" />
          Tiempo: <strong className="text-ink">{withWeather}</strong> de {totalDays} días con datos
        </p>
        <p className="mt-1 flex items-center gap-2">
          <Sparkles size={18} className="text-clay" aria-hidden="true" />
          Looks: <strong className="text-ink">{withLook}</strong> de {totalDays} días
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={refreshWeather} disabled={wPending}>
          {wPending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={18} aria-hidden="true" />}
          Actualizar tiempo
        </button>
        <button
          type="button"
          className="btn btn-accent"
          disabled={genPending || !canDress}
          onClick={() => (hasKept ? dialog.current?.showModal() : generate(false))}
        >
          {genPending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
          {withLook ? "Volver a proponer looks" : "Proponer looks"}
        </button>
      </div>
      {msg && (
        <p role="status" className={`text-sm font-medium sm:basis-full ${msg.tone === "ok" ? "text-sea" : "text-sun"}`}>
          {msg.text}
        </p>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="regen-title"
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-card p-6 text-ink shadow-2xl backdrop:bg-ink/40"
      >
        <h2 id="regen-title" className="text-xl font-semibold">
          ¿Qué hacemos con tus cambios?
        </h2>
        <p className="mt-2 text-ink-2">Tienes looks editados a mano o marcados como favoritos.</p>
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" className="btn btn-primary" onClick={() => generate(true)} disabled={genPending}>
            Mantenerlos y proponer el resto
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => generate(false)} disabled={genPending}>
            Rehacer todos los días
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => dialog.current?.close()}>
            Cancelar
          </button>
        </div>
      </dialog>
    </div>
  );
}
