"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

export function SubmitButton({
  children,
  pendingText,
  className = "btn btn-primary",
  name,
  value,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-disabled={pending || disabled} name={name} value={value}>
      {pending ? (
        <>
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
          {pendingText ?? "Guardando…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
