"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Ban,
  Cloud,
  CloudRain,
  Heart,
  LoaderCircle,
  Pencil,
  Repeat,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Sun,
  ThermometerSun,
  TriangleAlert,
} from "lucide-react";
import {
  applyFavoriteAction,
  clearDayLookAction,
  nextLookAction,
  saveDayActivitiesAction,
  setDayGarmentsAction,
  setManualWeatherAction,
  toggleFavoriteAction,
} from "@/app/actions";
import { GarmentImage } from "@/components/GarmentImage";
import { ACTIVITY_TYPES, GARMENT_CATEGORIES, type FavoriteLook, type Garment, type GarmentCategory, type TripDay } from "@/lib/domain/types";
import { ACTIVITY_LABELS, CATEGORY_LABELS, CATEGORY_PLURAL } from "@/lib/domain/labels";
import { formatLong } from "@/lib/domain/dates";

const isRedirect = (e: unknown) => (e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT");

export function DayCard({
  tripId,
  day,
  index,
  isToday,
  garments,
  favorites,
}: {
  tripId: string;
  day: TripDay;
  index: number;
  isToday: boolean;
  garments: Garment[];
  favorites: FavoriteLook[];
}) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingPlans, setEditingPlans] = useState(false);
  const [editingWeather, setEditingWeather] = useState(false);
  const picker = useRef<HTMLDialogElement>(null);
  const [pickerMode, setPickerMode] = useState<{ kind: "edit" } | { kind: "swap"; garmentId: string; category: GarmentCategory }>({
    kind: "edit",
  });

  const byId = useMemo(() => new Map(garments.map((g) => [g.id, g])), [garments]);
  const look = day.look;
  const lookGarments = (look?.garmentIds ?? []).map((id) => byId.get(id)).filter((g): g is Garment => !!g);
  const titleId = `day-${day.date}`;

  const run = (label: string, fn: () => Promise<unknown>) =>
    start(async () => {
      setBusy(label);
      setError(null);
      try {
        await fn();
      } catch (e) {
        if (isRedirect(e)) throw e;
        setError("No se ha podido completar la acción. Inténtalo de nuevo.");
      } finally {
        setBusy(null);
      }
    });

  return (
    <article aria-labelledby={titleId} className={`card overflow-hidden ${isToday ? "ring-2 ring-clay" : ""}`}>
      {/* Cabecera del día */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-ink text-paper">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-wider">Día</span>
            <span className="font-display text-lg font-semibold leading-none">{index + 1}</span>
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-sans text-lg font-semibold">
              {formatLong(day.date)} {isToday && <span className="badge ml-1 !bg-clay !text-white">Hoy</span>}
            </h2>
            <p className="text-sm text-ink-2">{day.city}</p>
          </div>
        </div>
        <WeatherBadge day={day} onEdit={() => setEditingWeather((v) => !v)} />
      </header>

      {editingWeather && (
        <WeatherEditor
          day={day}
          onClose={() => setEditingWeather(false)}
          onSave={async (w) => {
            const r = await setManualWeatherAction(tripId, day.date, w);
            if (!r.error) setEditingWeather(false);
            return r.error;
          }}
        />
      )}

      <div className="grid gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[240px_1fr]">
        {/* Planes */}
        <section aria-label="Planes del día">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-semibold text-ink-2">Planes</h3>
            <button type="button" className="btn btn-ghost btn-sm -mr-2" onClick={() => setEditingPlans((v) => !v)} aria-expanded={editingPlans}>
              <Pencil size={14} aria-hidden="true" /> {editingPlans ? "Cerrar" : "Editar"}
            </button>
          </div>
          {editingPlans ? (
            <PlansEditor
              day={day}
              onSave={(items) =>
                run("plans", async () => {
                  await saveDayActivitiesAction(tripId, day.date, items);
                  setEditingPlans(false);
                })
              }
              saving={busy === "plans"}
            />
          ) : day.activities.length ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {day.activities.map((a) => (
                <li key={a.id} className="badge !py-1">
                  {ACTIVITY_LABELS[a.type]}
                  {a.label ? `: ${a.label}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-ink-3">Sin planes indicados: proponemos algo cómodo y casual.</p>
          )}
        </section>

        {/* Look */}
        <section aria-label="Look del día" aria-busy={pending}>
          {look && lookGarments.length > 0 ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="font-sans text-sm font-semibold text-ink-2">Look propuesto</h3>
                {look.approximate && <span className="badge !bg-sun-soft !text-sun">Aproximado</span>}
                {look.edited && <span className="badge">Editado</span>}
              </div>
              <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-6">
                {lookGarments.map((g) => (
                  <li key={g.id} className="group relative">
                    <div className="aspect-[3/4] overflow-hidden rounded-xl border border-line bg-paper-2">
                      <GarmentImage garment={g} sizes="sm" />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium" title={g.name}>
                      {g.name}
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon absolute right-1 top-1 !h-9 !min-h-0 !w-9 opacity-100 shadow-sm"
                      aria-label={`Cambiar ${g.name}`}
                      onClick={() => {
                        setPickerMode({ kind: "swap", garmentId: g.id, category: g.category });
                        picker.current?.showModal();
                      }}
                    >
                      <Repeat size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              {(look.reasons.length > 0 || look.warnings.length > 0) && (
                <div className="mt-3 space-y-1.5 text-sm">
                  {look.reasons.map((r) => (
                    <p key={r} className="text-ink-2">
                      {r}
                    </p>
                  ))}
                  {look.warnings.map((w) => (
                    <p key={w} className="flex items-start gap-1.5 font-medium text-sun">
                      <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-line-strong bg-paper p-4 text-sm text-ink-2">
              {look?.warnings.length ? (
                look.warnings.map((w) => (
                  <p key={w} className="flex items-start gap-1.5 font-medium text-sun">
                    <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {w}
                  </p>
                ))
              ) : (
                <p>Todavía no hay look para este día.</p>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-4 flex flex-wrap gap-2">
            {look && lookGarments.length > 0 ? (
              <>
                <button
                  type="button"
                  className={`btn btn-sm ${look.favorite ? "btn-accent" : "btn-secondary"}`}
                  aria-pressed={look.favorite}
                  disabled={pending}
                  onClick={() => run("fav", () => toggleFavoriteAction(tripId, day.date))}
                >
                  <Heart size={16} className={look.favorite ? "fill-current" : ""} aria-hidden="true" />
                  {look.favorite ? "Favorito" : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pending}
                  onClick={() => run("next", () => nextLookAction(tripId, day.date, true))}
                >
                  {busy === "next" ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Shuffle size={16} aria-hidden="true" />}
                  Otra propuesta
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pending}
                  onClick={() => {
                    setPickerMode({ kind: "edit" });
                    picker.current?.showModal();
                  }}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" /> Editar prendas
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={pending}
                  onClick={() => run("clear", () => clearDayLookAction(tripId, day.date))}
                >
                  <Ban size={16} aria-hidden="true" /> Descartar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={pending}
                  onClick={() => run("next", () => nextLookAction(tripId, day.date, false))}
                >
                  {busy === "next" ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                  Proponer look
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pending || garments.length === 0}
                  onClick={() => {
                    setPickerMode({ kind: "edit" });
                    picker.current?.showModal();
                  }}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" /> Elegir prendas
                </button>
              </>
            )}
          </div>
          {error && (
            <p role="alert" className="field-error mt-2">
              {error}
            </p>
          )}
        </section>
      </div>

      <GarmentPicker
        dialogRef={picker}
        mode={pickerMode}
        garments={garments}
        favorites={favorites}
        selected={look?.garmentIds ?? []}
        dateLabel={formatLong(day.date)}
        onSave={(ids) =>
          run("pick", async () => {
            await setDayGarmentsAction(tripId, day.date, ids);
            picker.current?.close();
          })
        }
        onApplyFavorite={(favId) =>
          run("pick", async () => {
            await applyFavoriteAction(favId, tripId, day.date);
            picker.current?.close();
          })
        }
        saving={busy === "pick"}
      />
    </article>
  );
}

function WeatherBadge({ day, onEdit }: { day: TripDay; onEdit: () => void }) {
  const w = day.weather;
  if (!w)
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={onEdit}>
        <ThermometerSun size={16} aria-hidden="true" /> Sin datos del tiempo · indicar
      </button>
    );
  const Icon = w.rainChance >= 50 ? CloudRain : w.tempMax >= 22 ? Sun : Cloud;
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-1.5 text-left hover:border-ink-3"
      aria-label={`Tiempo: ${Math.round(w.tempMin)} a ${Math.round(w.tempMax)} grados${
        w.rainChance >= 50 ? ", lluvia" : ""
      }. ${w.sourceLabel}. Pulsa para editar`}
    >
      <Icon size={20} className={w.rainChance >= 50 ? "text-sea" : "text-sun"} aria-hidden="true" />
      <span>
        <span className="block text-sm font-semibold">
          {Math.round(w.tempMin)}–{Math.round(w.tempMax)} °C
          {w.source === "forecast" && w.rainChance > 0 ? ` · ${w.rainChance} % lluvia` : w.rainChance >= 50 ? " · lluvia" : ""}
        </span>
        <span className="block text-[11px] text-ink-3">
          {w.source === "forecast" ? "Previsión" : w.source === "manual" ? "Indicado por ti" : "Estimación (año anterior)"}
        </span>
      </span>
    </button>
  );
}

function WeatherEditor({
  day,
  onSave,
  onClose,
}: {
  day: TripDay;
  onSave: (w: { tempMin: number; tempMax: number; rain: boolean } | null) => Promise<string | undefined>;
  onClose: () => void;
}) {
  const [min, setMin] = useState(day.weather ? String(Math.round(day.weather.tempMin)) : "");
  const [max, setMax] = useState(day.weather ? String(Math.round(day.weather.tempMax)) : "");
  const [rain, setRain] = useState(day.weather ? day.weather.rainChance >= 50 : false);
  const [err, setErr] = useState<string | undefined>();
  const [pending, start] = useTransition();
  const id = day.date;
  return (
    <div className="border-b border-line bg-paper px-4 py-4 sm:px-6">
      {day.weather && <p className="mb-3 text-sm text-ink-2">Fuente actual: {day.weather.sourceLabel}.</p>}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-28">
          <label htmlFor={`min-${id}`} className="field-label">
            Mínima °C
          </label>
          <input id={`min-${id}`} type="number" inputMode="numeric" className="input" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div className="w-28">
          <label htmlFor={`max-${id}`} className="field-label">
            Máxima °C
          </label>
          <input id={`max-${id}`} type="number" inputMode="numeric" className="input" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <label className="flex min-h-11 items-center gap-2">
          <input type="checkbox" checked={rain} onChange={(e) => setRain(e.target.checked)} className="h-5 w-5 accent-[#1d1a16]" />
          Lluvia
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={pending || min === "" || max === ""}
          onClick={() => start(async () => setErr(await onSave({ tempMin: Number(min), tempMax: Number(max), rain })))}
        >
          Guardar
        </button>
        {day.weather?.source === "manual" && (
          <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => start(async () => setErr(await onSave(null)))}>
            Borrar dato manual
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Cancelar
        </button>
      </div>
      {err && <p className="field-error">{err}</p>}
      <p className="field-hint">Después pulsa «Otra propuesta» o «Volver a proponer looks» para tenerlo en cuenta.</p>
    </div>
  );
}

function PlansEditor({
  day,
  onSave,
  saving,
}: {
  day: TripDay;
  onSave: (items: { type: string; label?: string }[]) => void;
  saving: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(day.activities.map((a) => a.type));
  const [detail, setDetail] = useState(day.activities.find((a) => a.label)?.label ?? "");
  return (
    <div className="mt-2">
      <div role="group" aria-label="Tipos de plan" className="flex flex-wrap gap-1.5">
        {ACTIVITY_TYPES.map((t) => {
          const on = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              className="chip !min-h-9 !text-[13px]"
              aria-pressed={on}
              onClick={() => setSelected((s) => (on ? s.filter((x) => x !== t) : [...s, t]))}
            >
              {ACTIVITY_LABELS[t]}
            </button>
          );
        })}
      </div>
      <label htmlFor={`detail-${day.date}`} className="field-label mt-3">
        Detalle <span className="font-normal text-ink-3">(opcional)</span>
      </label>
      <input
        id={`detail-${day.date}`}
        className="input"
        maxLength={60}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Ej.: boda de Marta"
      />
      <button
        type="button"
        className="btn btn-primary btn-sm mt-3"
        disabled={saving}
        onClick={() => onSave(selected.map((type, i) => ({ type, label: i === 0 ? detail : undefined })))}
      >
        {saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Guardar planes
      </button>
    </div>
  );
}

function GarmentPicker({
  dialogRef,
  mode,
  garments,
  favorites,
  selected,
  dateLabel,
  onSave,
  onApplyFavorite,
  saving,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  mode: { kind: "edit" } | { kind: "swap"; garmentId: string; category: GarmentCategory };
  garments: Garment[];
  favorites: FavoriteLook[];
  selected: string[];
  dateLabel: string;
  onSave: (ids: string[]) => void;
  onApplyFavorite: (id: string) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [lastKey, setLastKey] = useState("");
  // Reinicia la selección cada vez que cambia el modo o el look
  const key = `${mode.kind}:${mode.kind === "swap" ? mode.garmentId : ""}:${selected.join(",")}`;
  if (key !== lastKey) {
    setLastKey(key);
    setDraft(selected);
  }
  const cats: GarmentCategory[] = mode.kind === "swap" ? [mode.category] : GARMENT_CATEGORIES.filter((c) => garments.some((g) => g.category === c));
  const usableFavs = favorites.filter((f) => f.garmentIds.some((id) => garments.some((g) => g.id === id)));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="picker-title"
      className="m-auto max-h-[90dvh] w-[min(96vw,44rem)] overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <div className="border-b border-line px-5 py-4">
          <h2 id="picker-title" className="text-xl font-semibold">
            {mode.kind === "swap" ? `Cambiar ${CATEGORY_LABELS[mode.category].toLowerCase()}` : "Elegir prendas"}
          </h2>
          <p className="text-sm text-ink-2">{dateLabel}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode.kind === "edit" && usableFavs.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 font-sans text-sm font-semibold text-ink-2">Usar un look favorito</h3>
              <div className="flex flex-wrap gap-2">
                {usableFavs.slice(0, 8).map((f) => (
                  <button key={f.id} type="button" className="chip" disabled={saving} onClick={() => onApplyFavorite(f.id)}>
                    <Heart size={14} className="text-clay" aria-hidden="true" /> {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {cats.map((c) => {
            const list = garments.filter((g) => g.category === c);
            return (
              <fieldset key={c} className="mb-5">
                <legend className="mb-2 font-sans text-sm font-semibold text-ink-2">{CATEGORY_PLURAL[c]}</legend>
                {list.length === 0 ? (
                  <p className="text-sm text-ink-3">No tienes prendas de este tipo.</p>
                ) : (
                  <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {list.map((g) => {
                      const on = draft.includes(g.id);
                      return (
                        <li key={g.id}>
                          <label className="block cursor-pointer">
                            <input
                              type={mode.kind === "swap" ? "radio" : "checkbox"}
                              name="pick"
                              className="peer sr-only"
                              checked={on}
                              onChange={() =>
                                setDraft((d) =>
                                  mode.kind === "swap"
                                    ? [...d.filter((x) => x !== mode.garmentId && !(list.some((l) => l.id === x) && !selected.includes(x))), g.id]
                                    : on
                                      ? d.filter((x) => x !== g.id)
                                      : [...d, g.id],
                                )
                              }
                            />
                            <span className="block overflow-hidden rounded-xl border-2 border-transparent peer-checked:border-clay peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-sea">
                              <span className="block aspect-[3/4] bg-paper-2">
                                <GarmentImage garment={g} sizes="sm" />
                              </span>
                            </span>
                            <span className="mt-1 block truncate text-xs font-medium">
                              {on && <span className="sr-only">Seleccionada: </span>}
                              {g.name}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </fieldset>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
          <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={() => onSave(draft)}>
            {saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Guardar look
          </button>
        </div>
      </div>
    </dialog>
  );
}
