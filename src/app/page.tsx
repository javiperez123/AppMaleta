"use client";

import Link from "next/link";
import { useTripsList } from "@/hooks/useTrips";
import { Plane, Plus, MapPin, Calendar, Sparkles } from "lucide-react";

export default function Home() {
  const { trips, loading } = useTripsList();

  return (
    <div className="flex flex-col gap-6 p-6 pb-32 relative">
      
      {/* HUD Header */}
      <section className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[12px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <Sparkles size={12} /> Directorio Activo
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            TUS <span className="text-gradient-primary">RUTAS</span>
          </h2>
        </div>
        <Link 
          href="/trip/create" 
          className="w-14 h-14 rounded-full bg-gradient-primary p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
           <div className="w-full h-full bg-stone-900/40 rounded-full flex items-center justify-center backdrop-blur-sm">
             <Plus size={28} strokeWidth={2.5} className="text-white group-hover:rotate-90 transition-transform duration-500" />
           </div>
        </Link>
      </section>

      {/* Trips Directory */}
      <section className="flex flex-col gap-5">
        
        {loading ? (
           <div className="glass-card h-40 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-emerald-500 animate-spin" />
           </div>
        ) : trips.length > 0 ? (
          trips.map((trip) => {
             const startDate = trip.destinations[0]?.startDate;
             const endDate = trip.destinations[trip.destinations.length-1]?.endDate;

             return (
               <Link href="/trip/plan" key={trip.id} className="glass-card p-5 group relative overflow-hidden interactive-glow block">
                 
                 {/* Shiny gradient overlay on hover */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 to-amber-500/0 group-hover:from-emerald-600/10 group-hover:to-amber-500/10 transition-colors duration-500" />

                 <div className="flex justify-between items-start mb-5 relative z-10">
                    <div>
                      <h4 className="font-bold text-2xl tracking-tight text-white mb-1 group-hover:text-emerald-300 transition-colors">{trip.name}</h4>
                      <div className="flex gap-2">
                         <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border border-white/5">
                           {trip.style}
                         </span>
                         <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border border-emerald-500/20">
                           {trip.baggage}
                         </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                      <Plane size={24} strokeWidth={2} />
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 relative z-10 pl-2 border-l border-white/10">
                    {trip.destinations.slice(0, 3).map((dest, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-medium text-stone-300">
                        <span className="flex items-center gap-3 relative">
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-amber-400 transition-colors" />
                          <MapPin size={14} className="text-stone-500" />
                          {dest.city}
                        </span>
                        <span className="font-mono text-xs opacity-70">{dest.startDate}</span>
                      </div>
                    ))}
                    {trip.destinations.length > 3 && (
                      <div className="text-[10px] font-bold uppercase mt-1 text-stone-500 ml-6">
                        + {trip.destinations.length - 3} destinos
                      </div>
                    )}
                 </div>

                 <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-semibold uppercase relative z-10">
                   <div className="flex items-center gap-2 text-stone-400">
                     <Calendar size={14} /> 
                     <span>{startDate} &mdash; {endDate}</span>
                   </div>
                   <div className="text-zinc-300 group-hover:text-white flex items-center gap-1 transition-colors">
                     Ver Plan <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                   </div>
                 </div>
               </Link>
             )
          })
        ) : (
           <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-4">
               <Plane size={32} className="text-stone-500" />
             </div>
             <h4 className="font-bold text-xl text-white mb-2">Sin Rutas Activas</h4>
             <p className="text-sm text-stone-400 mb-6">Inicia un nuevo itinerario para encender el motor de predicción.</p>
             <Link href="/trip/create" className="w-full interactive-glow bg-gradient-primary rounded-full py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
               Crear Vuelo
             </Link>
           </div>
        )}
      </section>

    </div>
  );
}
