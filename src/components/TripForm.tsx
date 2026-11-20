"use client";

import { useActionState, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import { createTripAction, updateTripAction, type FormState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { Notice } from "./Notice";
import { BAGGAGE_TYPES, TRIP_STYLES, type Trip, type TripStyle } from "@/lib/domain/types";
import { BAGGAGE_LABELS } from "@/lib/domain/labels";

const BAGGAGE_HINT: Record<string, string> = {
  mochila: "Máxima reutilización de prendas",
  cabina: "Equilibrio entre variedad y espacio",
  grande: "Más variedad de looks",
};

const TRIP_STYLE_META: Record<TripStyle, { emoji: string; label: string; hint: string }> = {
  mochilero:  { emoji: "🎒", label: "Mochilero / Interrail", hint: "Cómodo, funcional y ligero" },
  turismo:    { emoji: "🗺️", label: "Turismo",               hint: "Smart-casual para explorar ciudades" },
  fiesta:     { emoji: "🎉", label: "Amigos / Fiesta",       hint: "Looks llamativos para salir de noche" },
  negocios:   { emoji: "💼", label: "Negocios",              hint: "Elegante y profesional" },
  naturaleza: { emoji: "🌿", label: "Naturaleza / Aventura", hint: "Ropa técnica y resistente" },
  lujo:       { emoji: "✨", label: "Lujo / Relax",          hint: "Lo mejor de tu armario" },
};

type StopDraft = { key: string; city: string; startDate: string; endDate: string };

export function TripForm({ trip }: { trip?: Trip }) {
  const [state, action] = useActionState<FormState, FormData>(trip ? updateTripAction : createTripAction, {});
  const [stops, setStops] = useState<StopDraft[]>(
    trip?.stops.map((s) => ({ key: s.id, city: s.city, startDate: s.startDate, endDate: s.endDate })) ?? [
      { key: "s0", city: "", startDate: "", endDate: "" },
    ],
  );
  const update = (key: string, field: keyof StopDraft, value: string) =>
    setStops((list) =>
      list.map((s) => {
        if (s.key !== key) return s;
        const next = { ...s, [field]: value };
        if (field === "startDate" && (!next.endDate || next.endDate < value)) next.endDate = value;
        return next;
      }),
    );
  const addStop = () =>
    setStops((list) => {
      const last = list[list.length - 1];
      return [...list, { key: `s${Date.now()}`, city: "", startDate: last?.endDate ?? "", endDate: last?.endDate ?? "" }];
    });

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-8" noValidate>
      {trip && <input type="hidden" name="id" value={trip.id} />}
      {state.message && <Notice tone="error">{state.message}</Notice>}

      <section aria-labelledby="dest-h">
        <h2 id="dest-h" className="mb-1 text-xl font-semibold">
          ¿A dónde vas?
        </h2>
        <p className="mb-4 text-sm text-ink-2">Si visitas varias ciudades, añade un destino por cada una.</p>
        <ol className="flex flex-col gap-3">
          {stops.map((s, i) => (
            <li key={s.key} className="card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-2">Destino {i + 1}</span>
                {stops.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon -my-2 -mr-2"
                    aria-label={`Quitar destino ${i + 1}`}
                    onClick={() => setStops((l) => l.filter((x) => x.key !== s.key))}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <label htmlFor={`city-${s.key}`} className="field-label">
                    Ciudad
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clay" aria-hidden="true" />
                    <input
                      id={`city-${s.key}`}
                      name="city"
                      className="input pl-10"
                      required
                      maxLength={80}
                      autoComplete="off"
                      placeholder="Ej.: Lisboa"
                      value={s.city}
                      onChange={(e) => update(s.key, "city", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`start-${s.key}`} className="field-label">
                    Llegada
                  </label>
                  <input
                    id={`start-${s.key}`}
                    name="startDate"
                    type="date"
                    className="input"
                    required
                    value={s.startDate}
                    onChange={(e) => update(s.key, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`end-${s.key}`} className="field-label">
                    Salida
                  </label>
                  <input
                    id={`end-${s.key}`}
                    name="endDate"
                    type="date"
                    className="input"
                    required
                    min={s.startDate || undefined}
                    value={s.endDate}
                    onChange={(e) => update(s.key, "endDate", e.target.value)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
        {stops.length < 10 && (
          <button type="button" className="btn btn-secondary mt-3" onClick={addStop}>
            <Plus size={18} aria-hidden="true" /> Añadir otro destino
          </button>
        )}
      </section>

      <section aria-labelledby="bag-h">
        <h2 id="bag-h" className="mb-3 text-xl font-semibold">
          Equipaje
        </h2>
        <fieldset>
          <legend className="sr-only">Tipo de equipaje</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {BAGGAGE_TYPES.map((b) => (
              <label key={b} className="cursor-pointer">
                <input type="radio" name="baggage" value={b} defaultChecked={(trip?.baggage ?? "cabina") === b} className="peer sr-only" />
                <span className="card flex h-full flex-col gap-1 p-4 peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-sea">
                  <span className="font-semibold">{BAGGAGE_LABELS[b]}</span>
                  <span className="text-sm text-ink-3">{BAGGAGE_HINT[b]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 flex items-start gap-3">
          <input type="checkbox" name="laundry" defaultChecked={trip?.laundry} className="mt-0.5 h-5 w-5 accent-[#1d1a16]" />
          <span>
            <span className="font-medium">Podré lavar ropa durante el viaje</span>
            <span className="block text-sm text-ink-3">Repetiremos más prendas y llevarás menos.</span>
          </span>
        </label>
      </section>

      <section aria-labelledby="style-h">
        <h2 id="style-h" className="mb-1 text-xl font-semibold">
          Tipo de viaje
        </h2>
        <p className="mb-4 text-sm text-ink-2">El motor adaptará las prendas al estilo de tu viaje.</p>
        <fieldset>
          <legend className="sr-only">Tipo de viaje</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {TRIP_STYLES.map((s) => {
              const meta = TRIP_STYLE_META[s];
              return (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="style"
                    value={s}
                    defaultChecked={(trip?.style ?? "turismo") === s}
                    className="peer sr-only"
                  />
                  <span className="card flex h-full flex-col gap-1 p-4 peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-sea">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className="font-semibold leading-tight">{meta.label}</span>
                    <span className="text-sm text-ink-3">{meta.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="name-h" className="grid gap-4">
        <h2 id="name-h" className="text-xl font-semibold">
          Detalles
        </h2>
        <div>
          <label htmlFor="trip-name" className="field-label">
            Nombre del viaje <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <input id="trip-name" name="name" className="input" maxLength={80} defaultValue={trip?.name} placeholder="Ej.: Escapada a Lisboa" />
        </div>
        <div>
          <label htmlFor="trip-notes" className="field-label">
            Notas <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <textarea id="trip-notes" name="notes" rows={2} maxLength={500} className="input" defaultValue={trip?.notes} />
        </div>
      </section>

      <div className="sticky bottom-20 z-10 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <SubmitButton className="btn btn-accent w-full sm:w-auto" pendingText={trip ? "Guardando…" : "Creando y consultando el tiempo…"}>
          {trip ? "Guardar cambios" : "Crear viaje"}
        </SubmitButton>
      </div>
    </form>
  );
}
