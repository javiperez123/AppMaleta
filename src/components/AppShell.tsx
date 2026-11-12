import Link from "next/link";
import { CircleUser, LogOut, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { BottomNav, SideNav } from "./NavLinks";
import { logoutAction } from "@/app/actions";
import type { PublicUser } from "@/server/auth";

export function AppShell({ user, children }: { user: PublicUser; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Escritorio: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-card px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo href="/home" />
        </div>
        <nav aria-label="Navegación principal" className="mt-8 flex-1">
          <SideNav />
        </nav>
        <div className="border-t border-line pt-4">
          <Link
            href="/account"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-ink-2 hover:bg-paper-2 hover:text-ink"
          >
            <CircleUser size={20} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{user.name}</span>
              <span className="block truncate text-xs">{user.email}</span>
            </span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost mt-1 w-full justify-start px-3">
              <LogOut size={18} aria-hidden="true" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Móvil: cabecera */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo href="/home" />
        <div className="flex items-center gap-1">
          <Link href="/train" className="btn btn-ghost btn-icon" aria-label="Mi estilo">
            <Sparkles size={20} aria-hidden="true" />
          </Link>
          <Link href="/account" className="btn btn-ghost btn-icon" aria-label="Tu cuenta">
            <CircleUser size={22} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
