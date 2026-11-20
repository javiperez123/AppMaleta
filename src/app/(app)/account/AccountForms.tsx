"use client";

import { useActionState } from "react";
import { deleteAccountAction, updateProfileAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});
  return (
    <form action={action} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="pname" className="field-label">
          Nombre
        </label>
        <input id="pname" name="name" defaultValue={name} maxLength={60} required className="input" aria-invalid={!!state.errors?.name} />
        {state.errors?.name && <p className="field-error">{state.errors.name}</p>}
      </div>
      <SubmitButton className="btn btn-primary">Guardar</SubmitButton>
      {state.ok && <Notice tone="success" className="sm:basis-full">{state.message}</Notice>}
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action] = useActionState<FormState, FormData>(deleteAccountAction, {});
  return (
    <form action={action} className="mt-4 flex flex-col gap-3">
      <div>
        <label htmlFor="confirm-del" className="field-label">
          Para confirmar, escribe tu email: <span className="font-normal">{email}</span>
        </label>
        <input id="confirm-del" name="confirm" type="email" autoComplete="off" className="input" aria-invalid={!!state.errors?.confirm} />
        {state.errors?.confirm && <p className="field-error">{state.errors.confirm}</p>}
      </div>
      <SubmitButton className="btn btn-danger self-start" pendingText="Eliminando…">
        Eliminar mi cuenta y mis datos
      </SubmitButton>
    </form>
  );
}
