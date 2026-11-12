"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, Minus, ThumbsDown } from "lucide-react";
import { setPreferenceAction } from "@/app/actions";
import { GarmentImage } from "@/components/GarmentImage";
import type { Garment, GarmentPreference } from "@/lib/domain/types";
import { CATEGORY_LABELS, PREFERENCE_LABELS } from "@/lib/domain/labels";

export function StyleTrainer({ garments }: { garments: Garment[] }) {
  // Primero las que aún no se han valorado
  const queue = useMemo(
    () => [...garments].sort((a, b) => Number(a.preference !== "neutral") - Number(b.preference !== "neutral")),
    [garments],
  );
  const [i, setI] = useState(0);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, GarmentPreference>>({});

  const rate = (p: GarmentPreference) => {
    const g = queue[i];
    setRated((r) => ({ ...r, [g.id]: p }));
    setI((x) => x + 1);
    start(async () => {
      try {
        await setPreferenceAction(g.id, p);
      } catch {
        setError(`No se ha podido guardar la valoración de «${g.name}».`);
      }
    });
  };

  if (i >= queue.length) {
    const love = Object.values(rated).filter((p) => p === "love").length;
    const avoid = Object.values(rated).filter((p) => p === "avoid").length;
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <Heart size={32} className="mx-auto text-clay" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold">¡Listo!</h2>
        <p className="mt-2 text-ink-2">
          {love} {love === 1 ? "prenda favorita" : "prendas favoritas"} y {avoid} que prefieres evitar. Lo tendremos en cuenta en las
          próximas propuestas.
        </p>
        {error && <p className="field-error mt-3">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => setI(0)}>
            Repasar de nuevo
          </button>
          <Link href="/trips" className="btn btn-primary">
            Ir a mis viajes
          </Link>
        </div>
      </div>
    );
  }

  const g = queue[i];
  const current = rated[g.id] ?? g.preference;
  return (
    <div
      className="mx-auto max-w-sm"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") rate("avoid");
        if (e.key === "ArrowRight") rate("love");
        if (e.key === "ArrowDown") rate("neutral");
      }}
    >
      <p className="mb-3 text-center text-sm text-ink-3" aria-live="polite">
        {i + 1} de {queue.length}
      </p>
      <div className="card overflow-hidden">
        <div className="aspect-[4/5] bg-paper-2">
          <GarmentImage garment={g} />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold">{g.name}</h2>
          <p className="text-sm text-ink-3">
            {CATEGORY_LABELS[g.category]} · ahora: {PREFERENCE_LABELS[current]}
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button type="button" className="btn btn-secondary flex-col !rounded-2xl py-3" onClick={() => rate("avoid")}>
          <ThumbsDown size={22} aria-hidden="true" /> <span className="text-xs">Evitar</span>
        </button>
        <button type="button" className="btn btn-secondary flex-col !rounded-2xl py-3" onClick={() => rate("neutral")}>
          <Minus size={22} aria-hidden="true" /> <span className="text-xs">Normal</span>
        </button>
        <button type="button" className="btn btn-accent flex-col !rounded-2xl py-3" onClick={() => rate("love")} autoFocus>
          <Heart size={22} aria-hidden="true" /> <span className="text-xs">Me encanta</span>
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">Teclado: ← evitar · ↓ normal · → me encanta</p>
      {error && <p className="field-error mt-3 text-center">{error}</p>}
    </div>
  );
}
