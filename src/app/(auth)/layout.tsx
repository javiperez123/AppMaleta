import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/server/auth";
import { APP_TAGLINE } from "@/lib/brand";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/home");
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="relative z-10 max-w-md">
          <p className="eyebrow !text-[#e9a58c]">{APP_TAGLINE}</p>
          <p className="mt-4 font-display text-4xl leading-tight">
            Haz la maleta con lo que ya tienes, y vístete cada día sin pensarlo dos veces.
          </p>
        </div>
        <TagArt />
      </div>
      <main id="contenido" className="flex flex-col px-5 py-6 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}

function TagArt() {
  return (
    <svg className="absolute -bottom-10 -right-16 h-[420px] w-[420px] opacity-25" viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="#f7f3ec" strokeWidth="1.2">
        <rect x="40" y="50" width="120" height="110" rx="14" />
        <path d="M78 50V36a8 8 0 0 1 8-8h28a8 8 0 0 1 8 8v14" />
        <path d="M40 92h120M40 100h120" />
        <circle cx="62" cy="168" r="6" />
        <circle cx="138" cy="168" r="6" />
      </g>
    </svg>
  );
}
