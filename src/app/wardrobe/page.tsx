"use client";

import { useState } from "react";
import Link from "next/link";
import { useWardrobe } from "@/hooks/useWardrobe";
import { GarmentCategory } from "@/types";
import { GarmentCard } from "@/components/features/wardrobe/GarmentCard";
import { Plus, Database, Aperture } from "lucide-react";

export default function Wardrobe() {
  const [filter, setFilter] = useState<GarmentCategory | "all">("all");
  const { garments, loading } = useWardrobe(filter);
  
  const categories: (GarmentCategory | "all")[] = ["all", "top", "bottom", "shoes", "outerwear"];

  return (
    <div className="min-h-screen pb-32 flex flex-col relative">
      
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-lime-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 relative z-10">
         <div className="flex justify-between items-center mb-6">
           <div>
              <p className="text-[12px] text-lime-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                <Database size={12} /> Data Center
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                ASSETS
              </h1>
           </div>
           <Link href="/wardrobe/add" className="w-12 h-12 rounded-full bg-gradient-cool p-0.5 shadow-[0_0_20px_rgba(132,204,22,0.4)] hover:shadow-[0_0_30px_rgba(132,204,22,0.6)] transition-all hover:scale-110 active:scale-95 group">
              <div className="w-full h-full bg-stone-900/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Plus size={24} strokeWidth={2.5} className="text-white group-hover:rotate-90 transition-transform duration-500" />
              </div>
           </Link>
         </div>

         {/* Neon Glass Filters */}
         <div className="flex flex-wrap gap-2 pt-2">
           {categories.map((cat) => (
             <button
               key={cat}
               onClick={() => setFilter(cat)}
               className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-md border border-white/5 ${
                 filter === cat 
                   ? "bg-gradient-cool text-white shadow-[0_0_15px_rgba(132,204,22,0.4)] border-transparent"
                   : "bg-white/5 text-stone-400 hover:text-white hover:bg-white/10"
               }`}
             >
               {cat}
             </button>
           ))}
         </div>
      </div>

      <div className="px-5 flex-1 flex flex-col relative z-10">
        
        <div className="flex justify-between items-center mb-4">
           <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Inventory Sync</span>
           <span className="glass-card text-lime-300 text-[10px] font-bold uppercase px-2 py-1 rounded-md flex items-center gap-1">
             <Aperture size={12} className="animate-spin-slow" /> {garments.length} Items
           </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-12 h-12 border-t-2 border-r-2 border-lime-400 rounded-full animate-spin shadow-[0_0_15px_rgba(132,204,22,0.5)]" />
          </div>
        ) : garments.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {garments.map(item => (
              <GarmentCard key={item.id} garment={item} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center glass-card p-6 mt-4 opacity-70">
            <Database size={32} className="text-stone-500 mb-4" />
            <h2 className="font-bold text-xl mb-2 text-white">Directorio Vacío</h2>
            <p className="text-sm text-stone-400 text-center">No hay prendas registradas para este filtro o categoría.</p>
          </div>
        )}
      </div>

    </div>
  );
}
