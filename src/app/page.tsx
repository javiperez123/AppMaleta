import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight, BarChart2, Camera, CloudRain, Heart, ListChecks, Lock, MapPin,
  Shirt, Sparkles, Sun, User, Zap,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/server/auth";
import { APP_NAME } from "@/lib/brand";

export default async function Landing({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (await getCurrentUser()) redirect("/home");
  const sp = await searchParams;
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav aria-label="Cuenta" className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">Entrar</Link>
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

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-clay-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-clay">
              <Sparkles size={12} aria-hidden="true" /> Armario inteligente
            </div>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl">
              Haz la maleta con lo que{" "}
              <em className="font-normal text-clay">ya tienes</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-2">
              Digitaliza tu ropa, cuéntanos a dónde vas y {APP_NAME} te propone el look perfecto para cada día
              —con tiempo real, tu estilo y lo que llevas en el armario.
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-sm text-ink-2">
              {[
                "Looks diarios adaptados al tiempo de tu ciudad",
                "Probador virtual con tu propio avatar",
                "Cápsula optimizada: lleva solo lo necesario",
                "Estadísticas de tu armario de un vistazo",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
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

        {/* ── Pasos ─────────────────────────────────────── */}
        <section id="como-funciona" className="border-y border-line bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="text-center mb-12">
              <p className="eyebrow mb-2">Proceso</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">Tres pasos, cero improvisación</h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Camera,
                  t: "Fotografía tu ropa",
                  d: "Sube una foto por prenda desde el móvil. Indicamos automáticamente el color y tú añades el tipo y el estilo.",
                  badge: "Rápido",
                },
                {
                  icon: MapPin,
                  t: "Prepara el viaje",
                  d: "Destinos, fechas y planes de cada día: trabajo, cena especial, playa, senderismo…",
                  badge: "Flexible",
                },
                {
                  icon: ListChecks,
                  t: "Recibe looks y maleta",
                  d: "Un look por día editable, tu cápsula optimizada y la lista exacta de lo que llevar.",
                  badge: "Práctico",
                },
              ].map((s, i) => (
                <li key={s.t} className="card p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="chip text-xs">{s.badge}</span>
                  </div>
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

        {/* ── Features destacados ───────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="text-center mb-12">
            <p className="eyebrow mb-2">Funcionalidades</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Todo lo que necesitas para viajar bien</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={User} title="Probador virtual" color="clay">
              Visualiza tus combinaciones en un avatar personalizado antes de decidir qué llevar.
            </Feature>
            <Feature icon={Zap} title="Cápsula inteligente" color="sea">
              La app elige las prendas más versátiles para tu viaje: más combinaciones con menos bulto.
            </Feature>
            <Feature icon={BarChart2} title="Tu armario en cifras" color="sun">
              Looks posibles, prendas más usadas, categorías, colores — conoce tu armario de verdad.
            </Feature>
            <Feature icon={Sun} title="Look de hoy" color="clay">
              Cada día, un look adaptado al tiempo de tu ciudad. Regenera con un toque si no te convence.
            </Feature>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Feature icon={Shirt} title="Solo tu ropa" color="sea">
              Las propuestas usan únicamente prendas de tu armario. Si falta algo te lo decimos — sin inventar.
            </Feature>
            <Feature icon={Camera} title="Tiempo real" color="sun">
              Usamos la previsión meteorológica cuando existe. Si es lejano, estimamos y lo marcamos claramente.
            </Feature>
            <Feature icon={Lock} title="Privado por defecto" color="clay">
              Tus fotos solo las ves tú. Elimina tu cuenta y todos tus datos cuando quieras.
            </Feature>
          </div>
        </section>

        {/* ── CTA final ─────────────────────────────────── */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center text-paper sm:px-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper/70 mb-6">
              <Sparkles size={12} aria-hidden="true" /> Sin tarjeta de crédito
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">¿Cuándo es tu próximo viaje?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#d9d1c4]">
              Crea tu cuenta, añade tus primeras prendas y prepara la maleta hoy mismo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn btn-accent px-7 text-base">
                Crear mi armario gratis <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className="btn px-7 text-base border border-paper/30 text-paper hover:bg-paper/10">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-ink-3 sm:px-8">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <Link href="/privacy" className="underline-offset-4 hover:underline">Privacidad</Link>
        </div>
      </footer>
    </div>
  );
}

type FeatureColor = "clay" | "sea" | "sun";
function Feature({
  icon: Icon,
  title,
  children,
  color = "clay",
}: {
  icon: typeof Shirt;
  title: string;
  children: React.ReactNode;
  color?: FeatureColor;
}) {
  const colorMap: Record<FeatureColor, string> = {
    clay: "bg-clay-soft text-clay",
    sea: "bg-sea-soft text-sea",
    sun: "bg-sun-soft text-sun",
  };
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${colorMap[color]}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-2">{children}</p>
    </div>
  );
}

/** Ilustración del hero: tarjeta de día + mini avatar + cápsula */
function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      {/* Círculos decorativos */}
      <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-clay-soft opacity-60" />
      <div className="absolute -bottom-8 -right-4 h-48 w-48 rounded-full bg-sea-soft opacity-60" />

      {/* Tarjeta principal: look del día */}
      <div className="card relative rotate-[-1.5deg] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Día 2 · Roma</p>
            <p className="mt-1 font-display text-2xl font-semibold">Look de hoy</p>
          </div>
          <span className="badge !bg-sea-soft !text-sea">
            <CloudRain size={14} /> 15–21 °C
          </span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {[
            { bg: "linear-gradient(160deg,#e9e1cf,#d6c3a0)", label: "Jersey" },
            { bg: "linear-gradient(160deg,#5a7699,#22304f)", label: "Vaquero" },
            { bg: "linear-gradient(160deg,#e3c04a,#b98a55)", label: "Chubasq." },
            { bg: "linear-gradient(160deg,#f7f5f0,#cbbda8)", label: "Zapatillas" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5">
              <div className="aspect-[3/4] w-full rounded-xl" style={{ background: s.bg }} />
              <span className="text-[11px] font-medium text-ink-3">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-paper-2 px-3 py-2 text-xs text-ink-2">
          ☂️ Previsión de lluvia — añadimos tu chubasquero impermeable.
        </p>
      </div>

      {/* Tarjeta mini: cápsula */}
      <div className="card relative ml-auto mt-[-14px] w-56 rotate-[2deg] p-4 shadow-card">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Zap size={15} className="text-sea" /> Cápsula · 7 días
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-ink-2">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#5a7699]" /> 2 pantalones
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#d6c3a0]" /> 4 tops
          </li>
          <li className="flex items-center gap-2">
            <Heart size={12} className="text-clay" /> 12 looks posibles
          </li>
        </ul>
        <p className="mt-2 text-[10px] text-ink-3 font-medium">Solo 9 prendas · volumen cabina ✓</p>
      </div>

      {/* Tarjeta mini: avatar */}
      <div className="card absolute -left-4 bottom-4 w-28 p-3 shadow-card rotate-[-3deg]">
        <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Mi personaje</p>
        {/* Mini avatar SVG */}
        <svg viewBox="0 0 60 90" className="mx-auto w-12 h-16">
          {/* Shoes */}
          <ellipse cx="22" cy="82" rx="7" ry="3" fill="#5a7699"/>
          <ellipse cx="38" cy="82" rx="7" ry="3" fill="#5a7699"/>
          {/* Legs */}
          <rect x="18" y="62" width="10" height="20" rx="4" fill="#22304f"/>
          <rect x="32" y="62" width="10" height="20" rx="4" fill="#22304f"/>
          {/* Torso */}
          <rect x="16" y="38" width="28" height="28" rx="8" fill="#e9e1cf"/>
          {/* Head */}
          <ellipse cx="30" cy="28" rx="13" ry="15" fill="#c68642"/>
          {/* Hair */}
          <ellipse cx="30" cy="15" rx="13" ry="6" fill="#3d2b1f"/>
          {/* Eyes */}
          <circle cx="24" cy="27" r="2" fill="#1d1a16"/>
          <circle cx="36" cy="27" r="2" fill="#1d1a16"/>
        </svg>
        <p className="text-[10px] text-center text-ink-3 mt-1">Probador virtual</p>
      </div>
    </div>
  );
}
