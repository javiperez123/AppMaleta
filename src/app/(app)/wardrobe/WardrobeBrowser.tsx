"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
import { GarmentImage } from "@/components/GarmentImage";
import type { Garment, GarmentCategory } from "@/lib/domain/types";
import { GARMENT_CATEGORIES } from "@/lib/domain/types";
import { CATEGORY_LABELS, CATEGORY_PLURAL, FORMALITY_LABELS } from "@/lib/domain/labels";
import { missingFields } from "@/lib/domain/garment-input";

type Filter = GarmentCategory | "all" | "incomplete";

export function WardrobeBrowser({ garments, highlight }: { garments: Garment[]; highlight?: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [color, setColor] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: garments.length, incomplete: 0 };
    for (const g of garments) {
      c[g.category] = (c[g.category] ?? 0) + 1;
      if (missingFields(g).some((f) => f !== "foto" && f !== "color")) c.incomplete++;
    }
    return c;
  }, [garments]);

  const colors = useMemo(
    () => [...new Set(garments.map((g) => g.color).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b, "es")),
    [garments],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return garments
      .filter((g) =>
        filter === "all"
          ? true
          : filter === "incomplete"
            ? missingFields(g).some((f) => f !== "foto" && f !== "color")
            : g.category === filter,
      )
      .filter((g) => !color || g.color === color)
      .filter(
        (g) =>
          !term ||
          [g.name, g.color, CATEGORY_LABELS[g.category], g.notes].some((s) => s?.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [garments, q, filter, color]);

  const filters: Filter[] = ["all", ...GARMENT_CATEGORIES.filter((c) => counts[c]), ...(counts.incomplete ? ["incomplete" as const] : [])];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <label htmlFor="q" className="sr-only">
            Buscar prendas
          </label>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o color"
            className="input pl-10"
          />
        </div>
        {colors.length > 1 && (
          <div className="md:w-48">
            <label htmlFor="color" className="sr-only">
              Filtrar por color
            </label>
            <select id="color" value={color} onChange={(e) => setColor(e.target.value)} className="input">
              <option value="">Todos los colores</option>
              {colors.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div role="group" aria-label="Filtrar por tipo" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className="chip shrink-0"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Todo" : f === "incomplete" ? "Datos incompletos" : CATEGORY_PLURAL[f]}
            <span className="opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {shown.length} prendas
      </p>

      {shown.length === 0 ? (
        <div className="card p-8 text-center text-ink-2">
          No hay prendas que coincidan.{" "}
          <button
            type="button"
            className="font-semibold text-sea underline"
            onClick={() => {
              setQ("");
              setFilter("all");
              setColor("");
            }}
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((g) => {
            const missing = missingFields(g).filter((f) => f !== "foto" && f !== "color");
            return (
              <li key={g.id}>
                <Link
                  href={`/wardrobe/${g.id}`}
                  className={`card group block overflow-hidden transition hover:-translate-y-0.5 hover:border-ink-3 ${
                    highlight === g.id ? "ring-2 ring-sea" : ""
                  }`}
                >
                  <div className="relative aspect-[4/5] bg-paper-2">
                    <GarmentImage garment={g} />
                    {missing.length > 0 && (
                      <span className="badge absolute left-2 top-2 !bg-sun-soft !text-sun">
                        <TriangleAlert size={12} aria-hidden="true" /> Completar
                      </span>
                    )}
                    {g.preference === "love" && (
                      <span className="badge absolute right-2 top-2 !bg-clay-soft !text-clay">Favorita</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate font-semibold">{g.name}</p>
                    <p className="truncate text-sm text-ink-3">
                      {CATEGORY_LABELS[g.category]}
                      {g.formality ? ` · ${FORMALITY_LABELS[g.formality]}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
