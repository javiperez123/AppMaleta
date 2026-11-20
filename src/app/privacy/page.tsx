import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacidad" };

// Borrador técnico: describe lo que hace la app. Debe revisarlo un profesional legal antes del lanzamiento.
export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
      <Logo />
      <main id="contenido" className="mt-10">
        <h1 className="text-4xl font-semibold">Privacidad</h1>
        <p className="mt-2 text-sm text-ink-3">Borrador pendiente de revisión legal antes del lanzamiento.</p>
        <div className="mt-8 space-y-6 text-ink-2 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink">
          <section>
            <h2>Qué datos guardamos</h2>
            <p>
              Tu nombre, tu email, tu contraseña cifrada (nunca en texto plano), las fotos y datos de tus prendas, tus viajes y
              tus looks. No guardamos tu ubicación.
            </p>
          </section>
          <section>
            <h2>Quién puede verlos</h2>
            <p>
              Solo tú. Las fotos se sirven únicamente a tu sesión. {APP_NAME} no comparte tus datos con terceros con fines
              publicitarios.
            </p>
          </section>
          <section>
            <h2>Servicios externos</h2>
            <p>
              Para consultar el tiempo enviamos el nombre de la ciudad y sus coordenadas a Open-Meteo (open-meteo.com), sin
              datos personales. Si el envío de correos está activado, tu email se envía al proveedor de correo solo para
              mandarte el enlace de recuperación de contraseña.
            </p>
          </section>
          <section>
            <h2>Tus derechos</h2>
            <p>
              Puedes editar o borrar cualquier prenda o viaje y eliminar tu cuenta con todos sus datos desde{" "}
              <Link href="/account" className="font-semibold text-sea underline">
                Tu cuenta
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
