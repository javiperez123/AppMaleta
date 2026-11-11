"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowRight, Activity, MapPin } from "lucide-react";
import { TripDestination } from "@/types";

export default function TripBuilder() {
  const router = useRouter();
  
  const [destinations, setDestinations] = useState<TripDestination[]>([
    { id: "dest1", city: "", startDate: "", endDate: "" }
  ]);
  
  const [config, setConfig] = useState({
    name: "Nuevo Itinerario",
    type: "turismo",
    bag: "cabina"
  });

  const addDestination = () => {
    setDestinations([...destinations, { id: `dest${Date.now()}`, city: "", startDate: "", endDate: "" }]);
  };

  const removeDestination = (id: string) => {
    if (destinations.length === 1) return;
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const updateDestination = (id: string, field: keyof TripDestination, value: string) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/loading"); // Simulamos envío
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-40 relative min-h-[90vh]">
      
      {/* HUD Header */}
      <section className="flex justify-between items-center mb-2">
        <div>
          <p className="text-[12px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <Activity size={12} /> Constructor
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            NUEVA <span className="text-gradient-hot">RUTA</span>
          </h2>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Destinos */}
        <section className="flex flex-col gap-6">
           
           <div className="flex flex-col gap-6 relative">
             {/* Línea de conexión estilo circuito */}
             <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500/50 via-amber-500/50 to-transparent z-0 blur-[1px]" />
             <div className="absolute left-6 top-8 bottom-8 w-px bg-white/20 z-0" />
             
             {destinations.map((dest, index) => (
               <div key={dest.id} className="glass-card relative z-10 flex flex-col group overflow-visible">
                 
                 {/* Node Indicator */}
                 <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-stone-900 border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center z-20">
                   <div className="w-2 h-2 rounded-full bg-emerald-400" />
                 </div>

                 {/* Node Header */}
                 <div className="bg-white/5 px-5 py-3 flex justify-between items-center border-b border-white/10 rounded-t-[2rem]">
                    <span className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 text-emerald-100">
                      Waypoint 0{index + 1}
                    </span>
                    {destinations.length > 1 && (
                      <button type="button" onClick={() => removeDestination(dest.id)} className="text-white/30 hover:text-orange-400 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-500/10">
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    )}
                 </div>
                 
                 {/* Node Body */}
                 <div className="p-5 flex flex-col gap-4">
                   <div className="relative">
                     <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                     <input 
                       required
                       type="text" 
                       placeholder="Ej: Berlín"
                       className="w-full bg-stone-900/50 border border-white/10 rounded-2xl pl-10 pt-3 pb-3 pr-4 font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                       value={dest.city}
                       onChange={e => updateDestination(dest.id, 'city', e.target.value)}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 ml-1">Llegada</label>
                       <input 
                         required
                         type="date"
                         className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-3 font-mono text-sm text-emerald-200 focus:outline-none focus:border-emerald-500 transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                         value={dest.startDate}
                         onChange={e => updateDestination(dest.id, 'startDate', e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 ml-1">Salida</label>
                       <input 
                         required
                         type="date"
                         className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-3 font-mono text-sm text-emerald-200 focus:outline-none focus:border-emerald-500 transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                         value={dest.endDate}
                         onChange={e => updateDestination(dest.id, 'endDate', e.target.value)}
                       />
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>

           <div className="pl-6 pt-2">
             <button 
               type="button" 
               onClick={addDestination}
               className="h-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full px-6 flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
             >
               <Plus size={18} strokeWidth={2.5} /> Añadir Nodo
             </button>
           </div>
        </section>

        {/* Global Settings */}
        <section className="flex flex-col gap-4 mt-2">
           <h2 className="text-[12px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Configuración Global</h2>
           <div className="glass-card p-5 flex flex-col gap-4">
              <div>
                 <input 
                   type="text" 
                   required
                   placeholder="Nombre del despliegue"
                   className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-4 font-bold text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-white/20"
                   value={config.name}
                   onChange={e => setConfig({...config, name: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 mb-2 ml-1">Logística</label>
                   <select 
                     className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-3 font-bold text-emerald-200 focus:outline-none appearance-none"
                     value={config.bag}
                     onChange={e => setConfig({...config, bag: e.target.value})}
                   >
                     <option value="cabina">Cabina Básica</option>
                     <option value="mochila">Mochila Ligera</option>
                     <option value="grande">Facturada</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 mb-2 ml-1">Motive</label>
                   <select 
                     className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-3 font-bold text-emerald-200 focus:outline-none appearance-none"
                     value={config.type}
                     onChange={e => setConfig({...config, type: e.target.value})}
                   >
                     <option value="turismo">Exploración</option>
                     <option value="trabajo">Business</option>
                     <option value="fiesta">Ocio / Noche</option>
                   </select>
                 </div>
              </div>
           </div>
        </section>

        {/* Floating Compile Button */}
        <div className="fixed bottom-6 left-6 right-6 z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2 flex justify-center">
          <button 
            type="submit"
            className="w-[90%] interactive-glow bg-gradient-primary rounded-full p-1 shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95 group"
          >
            <div className="w-full h-14 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-full flex justify-center items-center gap-3">
               <span className="font-black text-xl uppercase tracking-tighter text-white">Generar</span>
               <ArrowRight size={24} strokeWidth={2.5} className="text-white group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>

      </form>

    </div>
  );
}
