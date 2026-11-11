"use client";

import { useDayPlan } from "@/hooks/useTrips";
import { Check, CloudSnow, MapPin, Target } from "lucide-react";

export default function TodayMode() {
  const { dayPlan: todayPlan, loading } = useDayPlan("d4");

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!todayPlan) return null;

  return (
    <div className="min-h-[90vh] flex flex-col pb-28 relative">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Visual Panel */}
      <div className="p-6 relative z-10">
         <div className="glass-card overflow-hidden relative">
            <div className="absolute inset-0 z-0">
               <img src={todayPlan.outfit.garments[0].imageUrl} className="w-full h-full object-cover opacity-30 mix-blend-screen grayscale" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-stone-900/20" />
            </div>

            <div className="relative z-10 p-6 flex flex-col min-h-[200px] justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                     <MapPin size={12} className="text-emerald-400" />
                     <span className="text-[10px] uppercase font-bold tracking-widest text-white">{todayPlan.city}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <CloudSnow size={28} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" strokeWidth={2} />
                    <p className="text-3xl font-black mt-1 text-white tracking-tighter">{todayPlan.weather.temp}°</p>
                  </div>
               </div>

               <div className="mt-8">
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Target Look</p>
                 <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none drop-shadow-lg">
                    {todayPlan.outfit.name}
                 </h1>
               </div>
            </div>
         </div>
      </div>

      {/* Outfit Data */}
      <div className="px-6 flex-1 flex flex-col">
         
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
             <Target size={16} /> Asset List
           </h2>
         </div>

         <div className="flex flex-col gap-3">
           {todayPlan.outfit.garments.map((g, i) => (
              <div key={g.id} className="glass-card p-3 flex gap-4 items-center group hover:bg-white/5 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5">
                  <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">{g.category}</span>
                  <p className="font-bold text-white text-sm leading-tight mt-1 group-hover:text-emerald-200 transition-colors">{g.name}</p>
                </div>
              </div>
           ))}
         </div>

         {/* Sticky Actions */}
         <div className="fixed bottom-24 left-6 right-6 md:max-w-md md:left-1/2 md:-translate-x-1/2 z-50 flex flex-col gap-3">
            <button className="interactive-glow w-full bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full py-4 text-stone-900 font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2">
               <Check size={20} strokeWidth={3} />
               Log Data (Used)
            </button>

            <button className="w-full glass-card py-3 text-stone-300 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
               Modify Setup
            </button>
         </div>

      </div>

    </div>
  );
}
