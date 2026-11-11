"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TripService } from "@/services/trip.service";
import { Activity, Database, Sparkles, Navigation } from "lucide-react";

export default function LoadingPlan() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    { text: "CALIBRANDO COORDENADAS", icon: Navigation, percent: 15 },
    { text: "INQUIRIENDO INVENTARIO", icon: Database, percent: 45 },
    { text: "SINTETIZANDO MODELOS AI", icon: Activity, percent: 80 },
    { text: "DESPLEGANDO ITINERARIO", icon: Sparkles, percent: 100 }
  ];

  useEffect(() => {
    let isMounted = true;

    const generateTrip = async () => {
      try {
        await TripService.createTripPlan({
          name: "Nuevo Viaje",
          destinations: [],
          style: "casual",
          baggage: "cabina",
          vibe: "turismo",
          washOption: false,
          startDate: "2024-07-01",
          endDate: "2024-07-10"
        });
        
        if (isMounted) {
           router.push("/trip/plan");
        }
      } catch (e) {
        if (isMounted) router.push("/"); 
      }
    };

    generateTrip();

    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, steps.length]);

  const CurrentIcon = steps[step].icon;

  return (
    <div className="bg-stone-900 min-h-screen flex flex-col items-center justify-center p-8 z-50 fixed inset-0 md:max-w-md lg:max-w-xl md:mx-auto">
      
      {/* Background FX */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-amber-500/10 mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-600/20 blur-[80px] rounded-full" />

      {/* Main HUD */}
      <div className="relative z-10 flex flex-col items-center w-full">
         <div className="w-24 h-24 mb-12 relative flex items-center justify-center">
            
            {/* Spinning rings */}
            <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border-b-2 border-amber-400 animate-[spin_3s_linear_infinite_reverse]" />
            <div className="absolute inset-4 rounded-full border-l-2 border-emerald-300 animate-[spin_1.5s_linear_infinite]" />
            
            <CurrentIcon size={24} className="text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
         </div>

         {/* Loading console */}
         <div className="glass-card w-full p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-primary" />
            
            <p className="font-mono text-emerald-400 text-xs mb-2 opacity-80">SYS.PROCESS.THINKING</p>
            <h2 className="text-white font-bold tracking-widest uppercase mb-6">
              {steps[step].text}
              <span className="animate-pulse text-amber-500">_</span>
            </h2>

            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                 style={{ width: `${steps[step].percent}%` }}
               />
            </div>
            
            <div className="flex justify-between w-full mt-2 font-mono text-[10px] text-white/40">
              <span>INIT</span>
              <span>{steps[step].percent}%</span>
            </div>
         </div>
      </div>
    </div>
  );
}
