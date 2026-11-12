"use client";

import { useTransition } from "react";
import { HeartOff } from "lucide-react";
import { deleteFavoriteAction } from "@/app/actions";

export function RemoveFavorite({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon -mr-2 -mt-2 shrink-0"
      aria-label="Quitar de favoritos"
      disabled={pending}
      onClick={() => start(() => deleteFavoriteAction(id))}
    >
      <HeartOff size={18} aria-hidden="true" />
    </button>
  );
}
