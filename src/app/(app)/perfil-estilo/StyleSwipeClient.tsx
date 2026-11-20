"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, X, RotateCcw, Sparkles, ChevronRight } from "lucide-react";
import { saveStyleProfileAction } from "@/app/actions";
import type { CatalogItem } from "@/lib/domain/catalog";
import type { StyleProfile } from "@/lib/domain/types";

interface Swipe {
  id: string;
  liked: boolean;
}

interface Props {
  initialQueue: CatalogItem[];
  existingProfile?: StyleProfile;
  likedCount: number;
  swipeCount: number;
}

const STYLE_LABELS: Record<string, string> = {
  mochilero: "Mochilero",
  turismo: "Turismo",
  fiesta: "Fiesta",
  negocios: "Negocios",
  naturaleza: "Naturaleza",
  lujo: "Lujo",
};

const CATEGORY_LABELS: Record<string, string> = {
  top: "Parte de arriba",
  bottom: "Parte de abajo",
  dress: "Vestido / mono",
  outerwear: "Abrigo / chaqueta",
  shoes: "Calzado",
};

function ProfileSummary({ profile }: { profile: StyleProfile }) {
  const fDesc =
    profile.formality > 0.65 ? "Formal" : profile.formality > 0.35 ? "Smart-casual" : "Casual / Relajado";
  const bDesc =
    profile.boldness > 0.65 ? "Colorido y llamativo" : profile.boldness > 0.35 ? "Equilibrado" : "Minimalista";
  const sDesc =
    profile.streetwear > 0.65 ? "Streetwear / urbano" : profile.streetwear > 0.35 ? "Mix moderno" : "Clásico";

  return (
    <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-sea" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Tu perfil de estilo</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StyleBar label="Formalidad" value={profile.formality} description={fDesc} />
        <StyleBar label="Atrevimiento" value={profile.boldness} description={bDesc} />
        <StyleBar label="Estética" value={profile.streetwear} description={sDesc} />
      </div>
      <p className="mt-4 text-sm text-ink-3">
        Basado en {profile.swipeCount} prendas evaluadas · {profile.likedIds.length} te gustaron
      </p>
    </div>
  );
}

function StyleBar({ label, value, description }: { label: string; value: number; description: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-ink-3">{description}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-ink transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="meter"
          aria-label={`${label}: ${pct}%`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function GarmentCard({ item, isTop }: { item: CatalogItem; isTop: boolean }) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-xl transition-transform duration-150 ${
        isTop ? "scale-100" : "scale-[0.96] opacity-60"
      }`}
    >
      {/* Color swatch — acts as the "photo" */}
      <div
        className="flex-1 flex items-center justify-center min-h-[220px] sm:min-h-[280px]"
        style={{ backgroundColor: item.color }}
        aria-hidden="true"
      >
        <span className="text-6xl sm:text-7xl drop-shadow-sm select-none">
          {item.category === "top" ? "👕" :
           item.category === "bottom" ? "👖" :
           item.category === "dress" ? "👗" :
           item.category === "outerwear" ? "🧥" :
           item.category === "shoes" ? "👟" : "👔"}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <span
            className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: item.color + "30", color: item.color }}
          >
            {item.colorName}
          </span>
        </div>
        <p className="text-sm text-ink-2">{item.descriptor}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-3">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          {item.fits.slice(0, 3).map((f) => (
            <span key={f} className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-3">
              {STYLE_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StyleSwipeClient({ initialQueue, existingProfile, swipeCount }: Props) {
  const [queue, setQueue] = useState<CatalogItem[]>(initialQueue);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<StyleProfile | undefined>(existingProfile);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalSwiped = (profile?.swipeCount ?? 0) + swipes.length;
  const likedThisSession = swipes.filter((s) => s.liked).length;
  const current = queue[0];
  const next = queue[1];

  const swipe = useCallback(
    (liked: boolean) => {
      if (!current) return;
      setSwipes((prev) => [...prev, { id: current.id, liked }]);
      setQueue((prev) => prev.slice(1));
      setDragX(0);
    },
    [current],
  );

  // Auto-save every 10 swipes
  useEffect(() => {
    if (swipes.length > 0 && swipes.length % 10 === 0) {
      void autoSave();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swipes.length]);

  const autoSave = async () => {
    if (swipes.length === 0) return;
    setSaving(true);
    const result = await saveStyleProfileAction(swipes);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSave = async () => {
    if (swipes.length === 0) return;
    setSaving(true);
    const result = await saveStyleProfileAction(swipes);
    setSaving(false);
    if (result.ok) {
      // Recompute local profile preview
      const liked = swipes.filter((s) => s.liked);
      setProfile({
        formality: 0.5,
        boldness: 0.5,
        streetwear: 0.5,
        swipeCount: (profile?.swipeCount ?? 0) + swipes.length,
        likedIds: [...(profile?.likedIds ?? []), ...liked.map((s) => s.id)],
        updatedAt: new Date().toISOString(),
      });
      setSwipes([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") swipe(false);
      if (e.key === "ArrowRight" || e.key === "d") swipe(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [swipe]);

  // Drag/touch handlers
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    setIsDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null || !isDragging) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    if (Math.abs(dragX) > 80) {
      swipe(dragX > 0);
    }
    dragStart.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const rotation = dragX / 20;
  const likeOpacity = Math.min(1, dragX / 60);
  const nopeOpacity = Math.min(1, -dragX / 60);

  return (
    <div className="mx-auto max-w-sm space-y-6">
      {/* Progress */}
      <div>
        <div className="mb-1.5 flex justify-between text-sm text-ink-3">
          <span>{totalSwiped} evaluadas</span>
          <span>{likedThisSession} te gustan esta sesión</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${Math.min(100, (totalSwiped / initialQueue.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="hidden text-center text-xs text-ink-3 sm:block">
        Usa ← → para navegar · Arrastra las tarjetas para swipear
      </p>

      {/* Card stack */}
      {current ? (
        <div className="relative h-[420px] sm:h-[480px]">
          {/* Background card */}
          {next && (
            <div className="absolute inset-0">
              <GarmentCard item={next} isTop={false} />
            </div>
          )}

          {/* Top card */}
          <div
            ref={cardRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <GarmentCard item={current} isTop />

            {/* Like/Nope overlays */}
            <div
              className="pointer-events-none absolute left-4 top-4 rounded-xl border-4 border-green-500 px-3 py-1 font-black uppercase text-green-500 rotate-[-15deg]"
              style={{ opacity: likeOpacity }}
              aria-hidden="true"
            >
              Me gusta
            </div>
            <div
              className="pointer-events-none absolute right-4 top-4 rounded-xl border-4 border-red-500 px-3 py-1 font-black uppercase text-red-500 rotate-[15deg]"
              style={{ opacity: nopeOpacity }}
              aria-hidden="true"
            >
              Paso
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-paper p-10 text-center">
          <Sparkles size={40} className="text-sea" aria-hidden="true" />
          <p className="text-lg font-semibold">¡Has visto todo el catálogo!</p>
          <p className="text-sm text-ink-3">
            Puedes guardar tu perfil con los swipes de esta sesión o volver a empezar.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setQueue([...initialQueue].sort(() => Math.random() - 0.5))}
          >
            <RotateCcw size={18} aria-hidden="true" /> Ver de nuevo
          </button>
        </div>
      )}

      {/* Action buttons */}
      {current && (
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => swipe(false)}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-line bg-paper shadow-md transition hover:border-red-400 hover:text-red-500 active:scale-95"
            aria-label="No me gusta"
          >
            <X size={26} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => swipe(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-line bg-paper shadow-md transition hover:border-green-400 hover:text-green-500 active:scale-95"
            aria-label="Me gusta"
          >
            <Heart size={26} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Save button */}
      {swipes.length > 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-accent"
          >
            {saving ? (
              "Guardando…"
            ) : saved ? (
              "✓ Guardado"
            ) : (
              <>
                <Sparkles size={18} aria-hidden="true" />
                Guardar perfil ({swipes.length} swipes)
              </>
            )}
          </button>
          {saved && (
            <p className="mt-2 text-sm text-ink-3">
              Tus looks ya están personalizados según tu estilo.
            </p>
          )}
        </div>
      )}

      {/* Profile summary */}
      {profile && profile.swipeCount >= 5 && (
        <ProfileSummary profile={profile} />
      )}

      {/* CTA if no profile yet */}
      {!profile && swipes.length < 5 && (
        <div className="rounded-2xl border border-line bg-paper/60 p-4 text-center text-sm text-ink-3">
          Evalúa al menos 5 prendas para ver tu perfil de estilo.
          <br />
          Cuantas más evalúes, más precisas serán las propuestas.
        </div>
      )}

      {/* Link to trips */}
      {profile && profile.swipeCount >= 5 && (
        <div className="rounded-2xl border border-line bg-paper p-4">
          <p className="text-sm text-ink-2">
            Tu perfil ya personaliza los looks en todos tus viajes nuevos.
          </p>
          <a href="/trips" className="mt-2 inline-flex items-center gap-1 text-sm font-medium hover:underline">
            Ver mis viajes <ChevronRight size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
