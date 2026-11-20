import type { Metadata } from "next";
import { LoginForm } from "../AuthForms";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const notice = sp.restablecida
    ? "Contraseña actualizada. Ya puedes entrar."
    : sp.salida
      ? "Has cerrado sesión."
      : undefined;
  return (
    <>
      <h1 className="text-3xl font-semibold">Hola de nuevo</h1>
      <p className="mb-8 mt-2 text-ink-2">Entra para ver tu armario y tus viajes.</p>
      <LoginForm next={sp.next} notice={notice} />
    </>
  );
}
