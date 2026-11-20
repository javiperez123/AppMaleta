"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Heart, House, Luggage, Shirt, Sparkles, User } from "lucide-react";

export const NAV = [
  { href: "/home", label: "Inicio", icon: House, match: ["/home", "/today"] },
  { href: "/wardrobe", label: "Armario", icon: Shirt, match: ["/wardrobe"] },
  { href: "/trips", label: "Viajes", icon: Luggage, match: ["/trips", "/trip"] },
  { href: "/probador", label: "Probador", icon: User, match: ["/probador"] },
  { href: "/insights", label: "Insights", icon: BarChart2, match: ["/insights"] },
  { href: "/favorites", label: "Favoritos", icon: Heart, match: ["/favorites"] },
  { href: "/train", label: "Mi estilo", icon: Sparkles, match: ["/train", "/perfil-estilo"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function SideNav() {
  const pathname = usePathname() ?? "";
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = isActive(pathname, match);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BottomNav() {
  const pathname = usePathname() ?? "";
  const items = NAV.slice(0, 5);
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur lg:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(pathname, match);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  active ? "text-clay" : "text-ink-3 hover:text-ink"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
