import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, CloudRain, Heart, ListChecks, Lock, MapPin, Shirt, Sun } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/server/auth";
import { APP_NAME } from "@/lib/brand";

export default async function Landing({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (await getCurrentUser()) redirect("/home");
  const sp = await searchParams;
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav aria-label="Cuenta" className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">
            Entrar
          </Link>
          <Link href="/signup" className="btn btn-primary hidden sm:inline-flex">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main id="contenido">
        {sp["cuenta-eliminada"] && (
          <p role="status" className="mx-auto max-w-6xl px-5 text-sm font-medium text-sea sm:px-8">
            Tu cuenta y todos tus datos se han eliminado.
          </p>
        )}

        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
          <div>
            <p className="eyebrow">Armario digital + planificador de viajes</p>
            <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl">
              Haz la maleta con lo que <em className="font-normal text-clay">ya tienes</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-2">
              Fotografía tu ropa, cuéntanos a dónde vas y qué planes tienes, y {APP_NAME} te propone un look para cada día con
              tus propias prendas. Al final, una lista de maleta práctica para no olvidar nada ni llevar de más.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-accent px-6 text-base">
                Empezar gratis <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="#como-funciona" className="btn btn-secondary px-6 text-base">
                Cómo funciona
              </Link>
            </div>
          </div>
          <HeroIllustration />
        </section>

        {/* Pasos */}
        <section id="como-funciona" className="border-y border-line bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="text-3xl font-semibold sm:text-4xl">Tres pasos, cero improvisación</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Camera,
                  t: "Fotografía tu ropa",
                  d: "Sube una foto por prenda desde el móvil. Indica el tipo, el estilo y si abriga; nosotros sugerimos el color.",
                },
                {
                  icon: MapPin,
                  t: "Prepara el viaje",
                  d: "Destinos, fechas y planes de cada día: trabajo, cena especial, playa, senderismo…",
                },
                {
                  icon: ListChecks,
                  t: "Recibe looks y maleta",
                  d: "Un look por día, editable, y la lista exacta de lo que tienes que meter en la maleta.",
                },
              ].map((s, i) => (
                <li key={s.t} className="card p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl text-clay">{i + 1}</span>
                    <s.icon size={22} className="text-ink-2" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-ink-2">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Honestidad y privacidad */}
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:px-8 md:grid-cols-3 lg:py-20">
          <Feature icon={Shirt} title="Solo tu ropa">
            Las propuestas usan únicamente prendas de tu armario. Si te falta algo (un chubasquero, un bañador), te lo decimos en
            lugar de inventarlo.
          </Feature>
          <Feature icon={Sun} title="Tiempo real, sin adivinar">
            Usamos la previsión meteorológica cuando existe. Si el viaje es lejano, te mostramos una estimación claramente
            marcada, o puedes indicar tú la temperatura.
          </Feature>
          <Feature icon={Lock} title="Privado por defecto">
            Tus fotos solo las ves tú. Puedes eliminar tu cuenta y todos tus datos cuando quieras.
          </Feature>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-12">
            <h2 className="text-3xl font-semibold sm:text-4xl">¿Cuándo es tu próximo viaje?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#d9d1c4]">Crea tu cuenta, añade tus primeras prendas y prepara la maleta hoy mismo.</p>
            <Link href="/signup" className="btn btn-accent mt-8 px-7 text-base">
              Crear mi armario <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-ink-3 sm:px-8">
          <span>
            © {new Date().getFullYear()} {APP_NAME}
          </span>
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Shirt; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-soft text-clay">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-ink-2">{children}</p>
    </div>
  );
}

/** Ilustración (no son datos reales): una tarjeta de día con un look y una mini lista de maleta. */
function HeroIllustration() {
  const swatch = (bg: string, label: string) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="aspect-[3/4] w-full rounded-xl" style={{ background: bg }} />
      <span className="text-[11px] font-medium text-ink-3">{label}</span>
    </div>
  );
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-clay-soft" />
      <div className="absolute -bottom-8 -right-4 h-48 w-48 rounded-full bg-sea-soft" />
      <div className="card relative rotate-[-1.5deg] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Día 2 · Ejemplo</p>
            <p className="mt-1 font-display text-2xl font-semibold">Lisboa</p>
          </div>
          <span className="badge !bg-sea-soft !text-sea">
            <CloudRain size={14} /> 14–19 °C
          </span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {swatch("linear-gradient(160deg,#e9e1cf,#d6c3a0)", "Jersey")}
          {swatch("linear-gradient(160deg,#5a7699,#22304f)", "Vaquero")}
          {swatch("linear-gradient(160deg,#e3c04a,#b98a55)", "Chubasq.")}
          {swatch("linear-gradient(160deg,#f7f5f0,#cbbda8)", "Zapatillas")}
        </div>
        <p className="mt-4 rounded-xl bg-paper-2 px-3 py-2 text-sm text-ink-2">
          Previsión de lluvia: añadimos tu chubasquero impermeable.
        </p>
      </div>
      <div className="card relative ml-auto mt-[-14px] w-56 rotate-[2deg] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ListChecks size={16} /> Maleta · 9 prendas
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-ink bg-ink" /> Vaquero ×4
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-line-strong" /> Chubasquero
          </li>
          <li className="flex items-center gap-2">
            <Heart size={14} className="text-clay" /> 2 looks favoritos
          </li>
        </ul>
      </div>
    </div>
  );
}
