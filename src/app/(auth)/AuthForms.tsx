"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { forgotAction, loginAction, resetAction, signupAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";

function PasswordField({
  name = "password",
  label,
  autoComplete,
  error,
  hint,
}: {
  name?: string;
  label: string;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          className="input pr-12"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          className="btn btn-ghost btn-icon absolute right-0.5 top-0.5 !h-[42px] !min-h-0"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
        >
          {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField(props: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
}) {
  const id = `f-${props.name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {props.label}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        defaultValue={props.defaultValue}
        required
        className="input"
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${id}-err` : undefined}
      />
      {props.error && (
        <p id={`${id}-err`} className="field-error">
          {props.error}
        </p>
      )}
    </div>
  );
}

const initial: FormState = {};

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {notice && !state.message && <Notice tone="success">{notice}</Notice>}
      {state.message && <Notice tone="error">{state.message}</Notice>}
      <input type="hidden" name="next" value={next ?? "/home"} />
      <TextField name="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <PasswordField label="Contraseña" autoComplete="current-password" />
      <div className="-mt-2 text-right">
        <Link href="/forgot" className="text-sm font-medium text-sea underline-offset-4 hover:underline">
          ¿Has olvidado la contraseña?
        </Link>
      </div>
      <SubmitButton className="btn btn-primary w-full" pendingText="Entrando…">
        Entrar
      </SubmitButton>
      <p className="text-center text-ink-2">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="font-semibold text-clay underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message && <Notice tone="error">{state.message}</Notice>}
      <TextField name="name" label="Tu nombre" autoComplete="given-name" defaultValue={state.values?.name} error={e.name} />
      <TextField name="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email} error={e.email} />
      <PasswordField label="Contraseña" autoComplete="new-password" error={e.password} hint="Mínimo 8 caracteres." />
      <div>
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" name="terms" className="mt-0.5 h-5 w-5 accent-[#1d1a16]" aria-invalid={!!e.terms} />
          <span>
            Acepto la{" "}
            <Link href="/privacy" className="font-semibold text-sea underline underline-offset-2" target="_blank">
              política de privacidad
            </Link>
            . Tus fotos y datos son privados y solo los ves tú.
          </span>
        </label>
        {e.terms && <p className="field-error">{e.terms}</p>}
      </div>
      <SubmitButton className="btn btn-accent w-full" pendingText="Creando tu cuenta…">
        Crear cuenta gratis
      </SubmitButton>
      <p className="text-center text-ink-2">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-clay underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotAction, initial);
  if (state.ok)
    return (
      <div className="flex flex-col gap-5">
        <Notice tone="success">{state.message}</Notice>
        <p className="text-ink-2">Revisa también la carpeta de spam. El enlace caduca en una hora.</p>
        <Link href="/login" className="btn btn-secondary">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message && <Notice tone="error">{state.message}</Notice>}
      <TextField name="email" label="Email de tu cuenta" type="email" autoComplete="email" error={state.errors?.email} />
      <SubmitButton className="btn btn-primary w-full" pendingText="Enviando…">
        Enviar enlace
      </SubmitButton>
      <Link href="/login" className="text-center text-sm font-medium text-sea underline-offset-4 hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetAction, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message && (
        <Notice tone="error">
          {state.message}{" "}
          <Link href="/forgot" className="underline">
            Pedir otro enlace
          </Link>
        </Notice>
      )}
      <input type="hidden" name="token" value={token} />
      <PasswordField label="Contraseña nueva" autoComplete="new-password" error={state.errors?.password} hint="Mínimo 8 caracteres." />
      <PasswordField name="confirm" label="Repite la contraseña" autoComplete="new-password" error={state.errors?.confirm} />
      <SubmitButton className="btn btn-primary w-full">Guardar contraseña</SubmitButton>
    </form>
  );
}
