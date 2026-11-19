"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import type { Garment, Look, TripDay } from "@/lib/domain/types";

interface Props {
  day: TripDay;
  look: Look;
  garments: Garment[];
  tripName: string;
}

/** Genera una tarjeta PNG del look y la comparte o descarga */
export function ShareLookButton({ day, look, garments, tripName }: Props) {
  const [state, setState] = useState<"idle" | "generating" | "done" | "error">("idle");

  const generate = async () => {
    setState("generating");
    try {
      const canvas = document.createElement("canvas");
      const DPR = Math.min(window.devicePixelRatio, 2);
      const W = 420;
      const H = 560;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(DPR, DPR);

      // ── Fondo ────────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#f7f3ec");
      bg.addColorStop(1, "#efe7da");
      ctx.fillStyle = bg;
      roundRect(ctx, 0, 0, W, H, 20);
      ctx.fill();

      // ── Cabecera ──────────────────────────────────────────────────────
      ctx.fillStyle = "#1d1a16";
      ctx.font = "bold 13px 'Outfit Variable', system-ui, sans-serif";
      ctx.fillText(tripName.toUpperCase(), 24, 38);

      ctx.fillStyle = "#6b6258";
      ctx.font = "12px system-ui";
      ctx.fillText(formatDate(day.date) + (day.city ? ` · ${day.city}` : ""), 24, 56);

      // ── Tiempo ────────────────────────────────────────────────────────
      if (day.weather) {
        const tempStr = `${day.weather.tempMin}°–${day.weather.tempMax}°C`;
        ctx.fillStyle = "#2c5a56";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(tempStr, W - 24, 46);
      }

      // ── Separador ─────────────────────────────────────────────────────
      ctx.strokeStyle = "#e2d8c8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 68);
      ctx.lineTo(W - 24, 68);
      ctx.stroke();

      // ── Fotos de prendas ──────────────────────────────────────────────
      const lookGarments = look.garmentIds
        .map((id) => garments.find((g) => g.id === id))
        .filter(Boolean) as Garment[];

      const cols = Math.min(lookGarments.length, 2);
      const rows = Math.ceil(lookGarments.length / cols);
      const imgW = cols === 1 ? 180 : 170;
      const imgH = 190;
      const gapX = (W - 48 - cols * imgW) / (cols > 1 ? cols - 1 : 1);
      const startY = 84;

      for (let i = 0; i < lookGarments.length && i < 4; i++) {
        const g = lookGarments[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 24 + col * (imgW + gapX);
        const y = startY + row * (imgH + 10);

        ctx.save();
        roundRect(ctx, x, y, imgW, imgH, 12);
        ctx.clip();

        if (g.imageId) {
          try {
            const img = await loadImage(`/api/photos/${g.imageId}?s=t`);
            ctx.drawImage(img, x, y, imgW, imgH);
          } catch {
            drawGarmentPlaceholder(ctx, x, y, imgW, imgH, g.colorHex ?? "#d6c3a0");
          }
        } else {
          drawGarmentPlaceholder(ctx, x, y, imgW, imgH, g.colorHex ?? "#d6c3a0");
        }
        ctx.restore();

        // Nombre de la prenda
        ctx.fillStyle = "#1d1a16";
        ctx.font = "bold 11px system-ui";
        const maxW = imgW - 4;
        const name = g.name.length > 18 ? g.name.slice(0, 16) + "…" : g.name;
        ctx.fillText(name, x + 2, y + imgH + 14);
      }

      // ── Razon ─────────────────────────────────────────────────────────
      const footerY = startY + rows * (imgH + 24) + 10;
      if (look.reasons[0]) {
        ctx.fillStyle = "#6b6258";
        ctx.font = "italic 11px Georgia, serif";
        const reason = look.reasons[0].length > 60 ? look.reasons[0].slice(0, 58) + "…" : look.reasons[0];
        ctx.fillText(`"${reason}"`, 24, Math.min(footerY, H - 36));
      }

      // ── Pie de marca ──────────────────────────────────────────────────
      ctx.fillStyle = "#a5452a";
      ctx.font = "bold 11px system-ui";
      ctx.fillText("Maleta ·", W - 100, H - 20);
      ctx.fillStyle = "#6b6258";
      ctx.font = "11px system-ui";
      ctx.fillText("mi armario de viaje", W - 60, H - 20);

      // ── Exportar ──────────────────────────────────────────────────────
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png", 0.95));
      const filename = `look-${day.date}-${tripName.toLowerCase().replace(/\s+/g, "-")}.png`;

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename, { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], filename, { type: "image/png" })],
          title: `Look ${formatDate(day.date)}`,
          text: `Mi look para ${day.city || "el viaje"} — Maleta`,
        });
      } else {
        // Fallback: descarga directa
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      console.error("Error generando tarjeta de look:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  const labels = {
    idle: "Compartir look",
    generating: "Generando…",
    done: "¡Listo!",
    error: "Error",
  };

  return (
    <button
      type="button"
      onClick={generate}
      disabled={state === "generating"}
      className="btn btn-ghost text-sm gap-1.5 disabled:opacity-50"
      aria-label="Compartir look como imagen"
    >
      {state === "done" || state === "idle" ? (
        <Share2 size={15} aria-hidden="true" />
      ) : (
        <Download size={15} aria-hidden="true" />
      )}
      {labels[state]}
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawGarmentPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hex: string) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, hex);
  grad.addColorStop(1, darken(hex, 0.15));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function darken(hex: string, amount: number): string {
  const c = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((c >> 16) & 255) - Math.round(255 * amount));
  const g = Math.max(0, ((c >> 8) & 255) - Math.round(255 * amount));
  const b = Math.max(0, (c & 255) - Math.round(255 * amount));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
