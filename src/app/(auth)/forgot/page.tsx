import type { Metadata } from "next";
import { ForgotForm } from "../AuthForms";

export const metadata: Metadata = { title: "Recuperar acceso" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Recupera tu acceso</h1>
      <p className="mb-8 mt-2 text-ink-2">Te enviaremos un enlace para elegir una contraseña nueva.</p>
      <ForgotForm />
    </>
  );
}
