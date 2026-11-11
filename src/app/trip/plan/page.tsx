"use client";

import { useState } from "react";
import { useActiveTrip } from "@/hooks/useTrips";
import { AlertTriangle, Repeat, Shirt, CloudRain, Sun, Wind, ChevronDown, BaggageClaim } from "lucide-react";

export default function TripPlan() {
  const { activeTrip, loading } = useActiveTrip();
  const [tab, setTab] = useState<"days" | "suitcase">("days");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeTrip) return null;

  const WeatherIcon = ({ condition }: { condition: string }) => {
    switch (condition) {
      case 'sunny': return <Sun size={18} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />;
      case 'rainy': return <CloudRain size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />;
      case 'windy': return <Wind size={18} className="text-stone-400" />;
      default: return <Sun size={18} />;
    }
  };

  const allGarments = activeTrip.days.flatMap(d => d.outfit.garments);
  const garmentUses = allGarments.reduce((acc, g) => {
    acc[g.id] = (acc[g.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueGarmentIds = Array.from(new Set(allGarments.map(g => g.id)));
  const uniqueGarments = uniqueGarmentIds.map(id => allGarments.find(g => g.id === id)!);

  return (
    <div className="min-h-[90vh] pb-32">
      
      {/* HUD Header */}
      <div className="px-6 py-8 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[80px] rounded-full z-0" />
         
         <div className="relative z-10">
           <h1 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] truncate mb-6">
             {activeTrip.name}
           </h1>
           <div className="flex bg-stone-800/50 backdrop-blur-md rounded-full p-1 border border-white/10">
             <button 
               onClick={() => setTab("days")}
               className={`flex-1 py-2 font-bold uppercase text-xs rounded-full transition-all duration-300 ${tab === 'days' ? 'bg-gradient-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-stone-400 hover:text-white'}`}
             >
               TimeLine
             </button>
             <button 
               onClick={() => setTab("suitcase")}
               className={`flex-1 py-2 font-bold uppercase text-xs rounded-full transition-all duration-300 ${tab === 'suitcase' ? 'bg-gradient-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-stone-400 hover:text-white'}`}
             >
               Cargamento
             </button>
           </div>
         </div>
      </div>

      <div className="p-4 relative z-10">
        
        {/* DAYS TAB */}
        {tab === "days" && (
          <div className="flex flex-col gap-5">
            {activeTrip.days.map((day, index) => {
               const isExpanded = expandedDay === day.id;
               
               return (
                 <div key={day.id} className="glass-card flex flex-col group overflow-hidden">
                   <button 
                     onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                     className="p-5 flex items-center justify-between w-full hover:bg-white/5 transition-colors"
                   >
                     <div className="flex items-center gap-4">
                       <span className="bg-stone-900 text-emerald-400 w-10 h-10 flex items-center justify-center font-black rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                         0{index + 1}
                       </span>
                       <div className="text-left flex flex-col justify-center">
                         <h3 className="font-bold text-xl text-white tracking-tight leading-none mb-1">{day.city}</h3>
                         <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">{day.date}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-stone-900 border border-white/10 px-3 py-1.5 rounded-full">
                          <WeatherIcon condition={day.weather.condition} />
                          <span className="font-bold text-xs text-white">{day.weather.temp}°</span>
                        </div>
                        <ChevronDown size={18} className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                     </div>
                   </button>

                   <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="p-5 pt-0 border-t border-white/5 mt-2 bg-white/5">
                        <div className="flex justify-between items-center mb-4 mt-4">
                           <span className="font-bold text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                             {day.outfit.name}
                           </span>
                           <button className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors">
                             Modificar AI
                           </button>
                        </div>
                        
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                           {day.outfit.garments.map(g => (
                             <div key={g.id} className="relative w-28 shrink-0 aspect-[3/4] rounded-[1.5rem] overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                               <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-stone-900/80 to-transparent p-2 z-10">
                                 <span className="text-[9px] uppercase font-bold text-white/70">{g.category}</span>
                               </div>
                               <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover grayscale-[20%]" />
                             </div>
                           ))}
                        </div>
                     </div>
                   </div>
                 </div>
               )
            })}
          </div>
        )}

        {/* SUITCASE TAB */}
        {tab === "suitcase" && (
          <div className="flex flex-col gap-6">
             
             {/* Diagnostics Glass */}
             <div className="glass-card p-5 flex flex-col gap-4 border-l-4 border-l-emerald-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[30px] rounded-full" />
                <div className="flex items-center gap-3 font-bold uppercase text-emerald-400 text-sm tracking-wider">
                   <AlertTriangle size={18} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   Health Check
                </div>
                <div className="text-stone-300 text-sm leading-relaxed flex items-start gap-3">
                   <Shirt size={16} className="shrink-0 mt-0.5 text-stone-500" />
                   Carga optimizable: Llevas múltiples partes de abajo de alto volumen. Redúcelo a 2 combinando estilos híbridos.
                </div>
             </div>

             {/* Inventory List */}
             <div>
               <div className="flex justify-between items-center mb-4 px-2">
                 <h2 className="font-bold uppercase tracking-widest text-sm text-stone-400 flex items-center gap-2">
                   <BaggageClaim size={16} /> Loadout Core
                 </h2>
                 <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold">
                   {uniqueGarments.length} ITEMS
                 </span>
               </div>
               
               <div className="flex flex-col gap-3">
                  {uniqueGarments.map(g => (
                    <div key={g.id} className="glass-card p-3 flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl border border-white/10 overflow-hidden bg-stone-800 shrink-0">
                        <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm leading-tight mb-1">{g.name}</h4>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500">{g.category}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900 border border-white/5 w-12 shrink-0">
                         <Repeat size={12} className="text-emerald-400" />
                         <span className="text-xs font-bold text-white mt-1">x{garmentUses[g.id]}</span>
                      </div>
                    </div>
                  ))}
               </div>
             </div>

          </div>
        )}

      </div>
    </div>
  );
}
