"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, CheckCircle2, Loader2, Plus, X, AlertCircle } from "lucide-react";
import Link from "next/link";

interface UploadedItem {
  file: File;
  previewUrl: string;
  imageId?: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

async function uploadFile(file: File): Promise<{ imageId?: string; error?: string }> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Error al subir" };
  return { imageId: json.imageId };
}

export function BulkUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [, startTransition] = useTransition();

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadedItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20) // máx 20 a la vez
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending" as const,
      }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const uploadAll = () => {
    startTransition(async () => {
      // Marcar todos los pending como uploading
      setItems((prev) =>
        prev.map((it) => (it.status === "pending" ? { ...it, status: "uploading" as const } : it))
      );
      // Subir de uno en uno para no saturar
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status !== "pending" && item.status !== "uploading") continue;
        const result = await uploadFile(item.file);
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: result.error ? ("error" as const) : ("done" as const),
                  imageId: result.imageId,
                  error: result.error,
                }
              : it
          )
        );
      }
    });
  };

  const remove = (index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const hasPending = items.some((it) => it.status === "pending");
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg">Carga masiva de fotos</h2>
          <p className="text-sm text-ink-2">Sube hasta 20 fotos a la vez, luego crea cada prenda</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn btn-secondary"
        >
          <Plus size={16} aria-hidden="true" /> Añadir fotos
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        aria-label="Seleccionar fotos"
      />

      {items.length === 0 ? (
        // Drop zone
        <div
          className="rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-3 py-12 cursor-pointer hover:border-ink-3 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          aria-label="Área para arrastrar o seleccionar fotos"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        >
          <Camera size={32} className="text-ink-3" aria-hidden="true" />
          <div className="text-center">
            <p className="font-medium">Arrastra tus fotos aquí</p>
            <p className="text-sm text-ink-2">o toca para seleccionarlas · máx. 20 imágenes</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid de previsualizaciones */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-4">
            {items.map((item, i) => (
              <div key={item.previewUrl} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                {/* Overlay de estado */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-paper/70">
                    <Loader2 size={20} className="animate-spin text-ink" />
                  </div>
                )}
                {item.status === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-sea/20">
                    <CheckCircle2 size={20} className="text-sea" />
                  </div>
                )}
                {item.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-danger/20 p-1">
                    <AlertCircle size={16} className="text-danger" />
                    <p className="text-[9px] text-center text-danger mt-0.5 leading-tight">{item.error}</p>
                  </div>
                )}
                {item.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar"
                  >
                    <X size={10} />
                  </button>
                )}
                {item.status === "done" && item.imageId && (
                  <Link
                    href={`/wardrobe/add?imageId=${item.imageId}`}
                    className="absolute inset-0 rounded-xl"
                    aria-label={`Crear prenda con ${item.file.name}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2">
              {doneCount > 0 && (
                <span className="text-sea font-medium">{doneCount} subidas · </span>
              )}
              {hasPending && `${items.filter((it) => it.status === "pending").length} pendientes`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { items.forEach((it) => URL.revokeObjectURL(it.previewUrl)); setItems([]); }}
                className="btn btn-ghost text-sm"
              >
                Limpiar
              </button>
              {hasPending && (
                <button
                  type="button"
                  onClick={uploadAll}
                  className="btn btn-primary text-sm"
                >
                  Subir todas
                </button>
              )}
              {doneCount > 0 && (
                <Link
                  href={`/wardrobe/add?imageId=${items.find((it) => it.status === "done")?.imageId ?? ""}`}
                  className="btn btn-secondary text-sm"
                >
                  Crear primera prenda →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
