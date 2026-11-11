"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Flame, Compass } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  if (
    pathname?.includes("/trip/create") ||
    pathname?.includes("/loading") ||
    pathname?.includes("/train")
  ) {
    return null;
  }

  const navItems = [
    { name: "Rutas", href: "/", icon: Compass },
    { name: "Armario", href: "/wardrobe", icon: Shirt },
    { name: "Match", href: "/train", icon: Flame },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2">
      <div className="glass-card flex h-16 px-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center relative group"
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent rounded-[1.5rem] opacity-50 z-0" />
              )}
              
              <Icon 
                size={22} 
                className={`relative z-10 transition-all duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] -translate-y-1 scale-110' : 'text-stone-400 group-hover:text-stone-200'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              
              <span 
                className={`text-[10px] uppercase font-bold tracking-wider mt-1 relative z-10 transition-all duration-300 ${isActive ? "text-emerald-300" : "text-stone-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}`}
              >
                {item.name}
              </span>
              
              {isActive && (
                <div className="absolute bottom-1 w-8 h-1 bg-emerald-500 rounded-full blur-[2px]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
