"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { saveGarmentAction, type FormState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { Notice } from "./Notice";
import { GARMENT_CATEGORIES, FORMALITIES, WARMTHS, VOLUMES, PREFERENCES, type Garment } from "@/lib/domain/types";
import {
  CATEGORY_LABELS,
  COLOR_SWATCHES,
  FORMALITY_LABELS,
  PREFERENCE_LABELS,
  VOLUME_LABELS,
  WARMTH_LABELS,
  nearestColorName,
} from "@/lib/domain/labels";
import { processPhoto } from "@/lib/client/photo";

function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  hint,
  error,
  allowNone,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  allowNone?: string;
}) {
  const all = allowNone ? [...options, { value: "", label: allowNone }] : options;
  return (
    <fieldset aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="field-label">{legend}</legend>
      {hint && <p className="field-hint -mt-1 mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {all.map((o) => (
          <label key={o.value || "none"} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="chip peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-err`} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const opts = <T extends string>(list: readonly T[], labels: Record<T, string>) => list.map((v) => ({ value: v, label: labels[v] }));

export function GarmentForm({ garment, mode }: { garment?: Garment; mode: "create" | "edit" }) {
  const [state, action] = useActionState<FormState, FormData>(saveGarmentAction, {});
  const v = state.values;
  const [category, setCategory] = useState(v?.category ?? garment?.category ?? "");
  const [formality, setFormality] = useState(v?.formality ?? garment?.formality ?? "");
  const [warmth, setWarmth] = useState(v?.warmth ?? garment?.warmth ?? "");
  const [volume, setVolume] = useState(v?.volume ?? garment?.volume ?? "medium");
  const [preference, setPreference] = useState(v?.preference ?? garment?.preference ?? "neutral");
  const [color, setColor] = useState(v?.color ?? garment?.color ?? "");
  const [colorHex, setColorHex] = useState(v?.colorHex ?? garment?.colorHex ?? "");
  const [suggested, setSuggested] = useState<string | null>(null);
  const [imageId, setImageId] = useState(v?.imageId ?? garment?.imageId ?? "");
  const [preview, setPreview] = useState<string | null>(garment?.imageId ? `/api/photos/${garment.imageId}` : null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const e = state.errors ?? {};

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith("image/")) {
      setPhotoError("Ese archivo no es una imagen. Elige una foto JPG, PNG o WebP.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setPhotoError("La foto es demasiado grande (máximo 25 MB antes de comprimir).");
      return;
    }
    setUploading(true);
    try {
      const { blob, dominantHex } = await processPhoto(file);
      setPreview(URL.createObjectURL(blob));
      if (dominantHex) {
        const name = nearestColorName(dominantHex);
        if (name) {
          setSuggested(name);
          if (!color) {
            setColor(name);
            setColorHex(dominantHex);
          }
        }
      }
      const fd = new FormData();
      fd.append("file", blob, blob.type === "image/webp" ? "foto.webp" : "foto.jpg");
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { imageId?: string; error?: string };
      if (!res.ok || !json.imageId) throw new Error(json.error ?? "No se ha podido subir la foto.");
      setImageId(json.imageId);
    } catch (err) {
      setPreview(imageId ? `/api/photos/${imageId}` : null);
      setPhotoError(
        err instanceof Error && err.message
          ? err.message === "decode"
            ? "No podemos leer esta foto (¿formato HEIC?). Prueba a hacer una captura o exportarla como JPG."
            : err.message
          : "No se ha podido subir la foto. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setUploading(false);
      if (camRef.current) camRef.current.value = "";
      if (galRef.current) galRef.current.value = "";
    }
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-12" noValidate>
      {garment && <input type="hidden" name="id" value={garment.id} />}
      <input type="hidden" name="imageId" value={imageId} />
      <input type="hidden" name="colorHex" value={colorHex} />

      {/* Foto */}
      <div>
        <p className="field-label" id="photo-label">
          Foto
        </p>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-dashed border-line-strong bg-card"
          aria-labelledby="photo-label"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) o foto privada
            <img src={preview} alt="Vista previa de la prenda" className="h-full w-full object-cover" />
          ) : (
            <div className="stamp-bg flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-ink-3">
              <Camera size={36} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm">Fondo liso, buena luz y la prenda entera en el encuadre.</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/70" role="status">
              <LoaderCircle className="animate-spin text-ink" size={32} aria-hidden="true" />
              <span className="sr-only">Subiendo foto…</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => camRef.current?.click()} disabled={uploading}>
            <Camera size={18} aria-hidden="true" /> Hacer foto
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => galRef.current?.click()} disabled={uploading}>
            <ImagePlus size={18} aria-hidden="true" /> {preview ? "Cambiar" : "Galería"}
          </button>
          {preview && !uploading && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setPreview(null);
                setImageId("");
              }}
            >
              <Trash2 size={18} aria-hidden="true" /> Quitar
            </button>
          )}
        </div>
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(ev) => handleFile(ev.target.files?.[0])}
        />
        <input
          ref={galRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(ev) => handleFile(ev.target.files?.[0])}
        />
        <p className="field-hint">JPG, PNG o WebP. La comprimimos antes de subirla para que vaya rápido.</p>
        {photoError && <p className="field-error" role="alert">{photoError}</p>}
        {e.imageId && <p className="field-error">{e.imageId}</p>}
        {mode === "edit" && garment?.imageId && !imageId && !preview && (
          <p className="field-hint">Si guardas sin foto se mantendrá la foto anterior.</p>
        )}
      </div>

      {/* Datos */}
      <div className="flex flex-col gap-6">
        {state.message && <Notice tone="error">{state.message}</Notice>}
        <div>
          <label htmlFor="name" className="field-label">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            className="input"
            required
            maxLength={80}
            defaultValue={v?.name ?? garment?.name}
            placeholder="Ej.: Camisa de lino blanca"
            aria-invalid={!!e.name}
            aria-describedby={e.name ? "name-err" : undefined}
          />
          {e.name && (
            <p id="name-err" className="field-error">
              {e.name}
            </p>
          )}
        </div>

        <ChoiceGroup
          name="category"
          legend="Tipo de prenda"
          options={opts(GARMENT_CATEGORIES, CATEGORY_LABELS)}
          value={category}
          onChange={setCategory}
          error={e.category}
        />

        <div>
          <label htmlFor="color" className="field-label">
            Color
          </label>
          <select
            id="color"
            name="color"
            className="input sm:max-w-xs"
            value={color}
            onChange={(ev) => {
              setColor(ev.target.value);
              setColorHex("");
            }}
          >
            <option value="">Sin indicar</option>
            {COLOR_SWATCHES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
            {color && !COLOR_SWATCHES.some((c) => c.name === color) && <option value={color}>{color}</option>}
          </select>
          {suggested && (
            <p className="field-hint">
              Color sugerido a partir de la foto: <strong>{suggested}</strong>. Cámbialo si no es correcto.
            </p>
          )}
        </div>

        <ChoiceGroup
          name="formality"
          legend="Estilo"
          hint="Para qué tipo de plan sirve."
          options={opts(FORMALITIES, FORMALITY_LABELS)}
          value={formality}
          onChange={setFormality}
          allowNone="No lo sé"
        />

        <ChoiceGroup
          name="warmth"
          legend="¿Cuánto abriga?"
          options={opts(WARMTHS, WARMTH_LABELS)}
          value={warmth}
          onChange={setWarmth}
          allowNone="No lo sé"
        />

        {(category === "outerwear" || category === "shoes" || category === "accessory") && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="waterproof"
              defaultChecked={v ? v.waterproof === "on" : garment?.waterproof}
              className="h-5 w-5 accent-[#1d1a16]"
            />
            <span className="font-medium">Es impermeable o sirve para la lluvia</span>
          </label>
        )}

        <ChoiceGroup
          name="volume"
          legend="Espacio en la maleta"
          options={opts(VOLUMES, VOLUME_LABELS)}
          value={volume}
          onChange={setVolume}
        />

        <ChoiceGroup
          name="preference"
          legend="¿Te gusta llevarla?"
          options={opts(PREFERENCES, PREFERENCE_LABELS)}
          value={preference}
          onChange={setPreference}
        />

        <div>
          <label htmlFor="notes" className="field-label">
            Notas <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={300}
            className="input"
            defaultValue={v?.notes ?? garment?.notes}
            placeholder="Ej.: se arruga fácil, mejor colgada"
          />
        </div>

        <div className="sticky bottom-20 z-10 -mx-4 flex flex-wrap gap-2 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 lg:bottom-0">
          <SubmitButton className="btn btn-accent" pendingText="Guardando…" disabled={uploading}>
            {mode === "edit" ? "Guardar cambios" : "Guardar prenda"}
          </SubmitButton>
          {mode === "create" && (
            <SubmitButton className="btn btn-secondary" name="after" value="another" pendingText="Guardando…" disabled={uploading}>
              Guardar y añadir otra
            </SubmitButton>
          )}
          {uploading && <span className="self-center text-sm text-ink-3">Espera a que termine de subir la foto…</span>}
        </div>
      </div>
    </form>
  );
}
