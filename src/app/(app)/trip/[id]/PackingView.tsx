"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Plus, Printer, TriangleAlert, X } from "lucide-react";
import { addExtraAction, removeExtraAction, setPackedAction } from "@/app/actions";
import { GarmentImage } from "@/components/GarmentImage";
import type { PackingList } from "@/lib/domain/packing";
import type { BaggageType, PackingExtra } from "@/lib/domain/types";
import { BAGGAGE_LABELS } from "@/lib/domain/labels";
import { formatShort } from "@/lib/domain/dates";

function CheckRow({
  checked,
  onToggle,
  children,
  id,
}: {
  checked: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <label htmlFor={id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-paper ${checked ? "text-ink-3" : ""}`}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-line-strong bg-card peer-checked:border-sea peer-checked:bg-sea peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea"
      >
        {checked && <Check size={16} className="text-white" strokeWidth={3} />}
      </span>
      <span className={`flex min-w-0 flex-1 items-center gap-3 ${checked ? "line-through decoration-ink-3/60" : ""}`}>{children}</span>
    </label>
  );
}

export function PackingView({
  tripId,
  list,
  packed,
  extras,
  baggage,
}: {
  tripId: string;
  list: PackingList;
  packed: Record<string, boolean>;
  extras: PackingExtra[];
  baggage: BaggageType;
}) {
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(packed, (s: Record<string, boolean>, u: { key: string; v: boolean }) => ({
    ...s,
    [u.key]: u.v,
  }));
  const [optExtras, setOptExtras] = useOptimistic(extras, (s: PackingExtra[], u: { id: string; v: boolean }) =>
    s.map((e) => (e.id === u.id ? { ...e, packed: u.v } : e)),
  );
  const [newItem, setNewItem] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [adding, startAdd] = useTransition();

  const toggle = (key: string, v: boolean, extra = false) =>
    start(async () => {
      if (extra) setOptExtras({ id: key, v });
      else setOptimistic({ key, v });
      try {
        await setPackedAction(tripId, key, v);
      } catch {
        setErr("No se ha podido guardar. Revisa tu conexión.");
      }
    });

  const keys = [...list.groups.flatMap((g) => g.items.map((i) => i.garment.id)), ...list.basics.map((b) => b.key)];
  const done = keys.filter((k) => optimistic[k]).length + optExtras.filter((e) => e.packed).length;
  const total = keys.length + optExtras.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const cap = list.capacity;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        {(list.daysWithoutLook.length > 0 || list.missingGarmentIds.length > 0) && (
          <div className="rounded-xl border border-sun/20 bg-sun-soft px-4 py-3 text-sm font-medium text-sun" role="status">
            <p className="flex items-start gap-2">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {list.daysWithoutLook.length > 0
                ? `${list.daysWithoutLook.length} ${list.daysWithoutLook.length === 1 ? "día no tiene" : "días no tienen"} look (${list.daysWithoutLook
                    .map(formatShort)
                    .join(", ")}). La lista no incluye ropa para ${list.daysWithoutLook.length === 1 ? "ese día" : "esos días"}.`
                : "Algunas prendas de los looks ya no están en tu armario."}
            </p>
          </div>
        )}

        {list.groups.map((g) => (
          <section key={g.category} className="card p-3 sm:p-4" aria-labelledby={`pk-${g.category}`}>
            <h2 id={`pk-${g.category}`} className="mb-1 px-2 font-sans text-sm font-semibold uppercase tracking-wider text-ink-3">
              {g.label} <span className="font-normal">· {g.items.length}</span>
            </h2>
            <ul>
              {g.items.map((i) => (
                <li key={i.garment.id}>
                  <CheckRow id={`pk-${i.garment.id}`} checked={!!optimistic[i.garment.id]} onToggle={(v) => toggle(i.garment.id, v)}>
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-line">
                      <GarmentImage garment={i.garment} sizes="sm" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{i.garment.name}</span>
                      <span className="block truncate text-xs text-ink-3">
                        {i.uses === 1 ? "1 día" : `${i.uses} días`}: {i.dates.map(formatShort).join(", ")}
                      </span>
                    </span>
                  </CheckRow>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {list.basics.length > 0 && (
          <section className="card p-3 sm:p-4" aria-labelledby="pk-basics">
            <h2 id="pk-basics" className="px-2 font-sans text-sm font-semibold uppercase tracking-wider text-ink-3">
              Básicos sugeridos
            </h2>
            <p className="mb-1 px-2 text-xs text-ink-3">Cálculo orientativo según los días del viaje; no proceden de tu armario.</p>
            <ul>
              {list.basics.map((b) => (
                <li key={b.key}>
                  <CheckRow id={`pk-${b.key}`} checked={!!optimistic[b.key]} onToggle={(v) => toggle(b.key, v)}>
                    <span className="font-medium">{b.label}</span>
                    <span className="badge ml-auto">×{b.quantity}</span>
                  </CheckRow>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card p-3 sm:p-4" aria-labelledby="pk-extra">
          <h2 id="pk-extra" className="mb-1 px-2 font-sans text-sm font-semibold uppercase tracking-wider text-ink-3">
            Otras cosas
          </h2>
          <ul>
            {optExtras.map((e) => (
              <li key={e.id} className="flex items-center">
                <div className="flex-1">
                  <CheckRow id={`pk-${e.id}`} checked={e.packed} onToggle={(v) => toggle(e.id, v, true)}>
                    <span className="font-medium">{e.label}</span>
                  </CheckRow>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon print:hidden"
                  aria-label={`Quitar ${e.label}`}
                  onClick={() => start(() => removeExtraAction(tripId, e.id))}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-2 px-2 print:hidden"
            onSubmit={(ev) => {
              ev.preventDefault();
              const label = newItem.trim();
              if (!label) return;
              startAdd(async () => {
                const r = await addExtraAction(tripId, label);
                if (r.error) setErr(r.error);
                else setNewItem("");
              });
            }}
          >
            <label htmlFor="new-extra" className="sr-only">
              Añadir algo a la lista
            </label>
            <input
              id="new-extra"
              className="input"
              placeholder="Cargador, pasaporte, adaptador…"
              maxLength={80}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-icon shrink-0" aria-label="Añadir" disabled={adding}>
              <Plus size={20} aria-hidden="true" />
            </button>
          </form>
        </section>
        {err && (
          <p role="alert" className="field-error">
            {err}
          </p>
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink-2">Progreso</p>
          <p className="mt-1 font-display text-4xl font-semibold">
            {done}
            <span className="text-xl text-ink-3">/{total}</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Elementos guardados en la maleta">
            <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && <p className="mt-3 text-sm font-semibold text-sea">¡Maleta lista!</p>}
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink-2">{BAGGAGE_LABELS[baggage]}</p>
          <p className="mt-1 text-sm text-ink-3">
            {list.totalGarments} prendas · ocupación estimada {cap.percent}%
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-2">
            <div
              className={`h-full rounded-full ${cap.used > cap.max ? "bg-danger" : cap.percent > 80 ? "bg-sun" : "bg-ink"}`}
              style={{ width: `${cap.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-3">
            Estimación orientativa según el volumen que indicaste en cada prenda.
            {cap.used > cap.max && " Puede que no quepa todo: prueba a repetir más prendas o a marcar «podré lavar»."}
          </p>
        </div>
        <button type="button" className="btn btn-secondary print:hidden" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> Imprimir lista
        </button>
      </aside>
    </div>
  );
}
