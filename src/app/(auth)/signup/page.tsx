import type { Metadata } from "next";
import { SignupForm } from "../AuthForms";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Crea tu armario de viaje</h1>
      <p className="mb-8 mt-2 text-ink-2">En dos minutos tendrás tus primeras prendas listas.</p>
      <SignupForm />
    </>
  );
}
