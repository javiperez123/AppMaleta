"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { dismissOnboardingAction } from "@/app/actions";

export function DismissOnboarding() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon shrink-0"
      aria-label="Ocultar primeros pasos"
      disabled={pending}
      onClick={() => start(() => dismissOnboardingAction())}
    >
      <X size={20} aria-hidden="true" />
    </button>
  );
}
