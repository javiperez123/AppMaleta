import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main id="contenido" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark size={48} />
      <h1 className="mt-6 text-3xl font-semibold">No encontramos esta página</h1>
      <p className="mt-2 max-w-md text-ink-2">Puede que el enlace sea antiguo o que el elemento se haya eliminado.</p>
      <Link href="/home" className="btn btn-primary mt-6">
        Ir al inicio
      </Link>
    </main>
  );
}
