"use client";

import { useState } from "react";
import { X, Flame, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { mockWardrobe } from "@/lib/mockData";

export default function TrainMode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipingDir, setSwipingDir] = useState<"left" | "right" | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    setSwipingDir(direction);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipingDir(null);
    }, 400); // match animation duration
  };

  const progress = Math.min(((currentIndex) / mockWardrobe.length) * 100, 100);

  if (currentIndex >= mockWardrobe.length) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent blur-3xl z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-primary p-1 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <div className="w-full h-full bg-stone-900 rounded-full flex flex-col items-center justify-center">
               <Flame size={40} className="text-emerald-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Mapeo<br/>Completado</h2>
          <p className="text-stone-400 mb-10">Algoritmo calibrado con éxito. Tu perfil de estilo ha sido actualizado.</p>
          <Link href="/" className="px-8 py-3 rounded-full bg-white text-stone-900 font-bold hover:bg-stone-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Volver a Rutas
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = mockWardrobe[currentIndex];

  return (
    <div className="flex flex-col min-h-[90vh] p-4 pb-24 overflow-hidden relative">
      
      {/* Dynamic Background Glow based on interaction */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[100px] z-0 transition-all duration-500 opacity-20 pointer-events-none ${
         swipingDir === 'left' ? 'bg-orange-600 scale-110' :
         swipingDir === 'right' ? 'bg-lime-500 scale-110' : 'bg-stone-800'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-20 mt-4">
        <Link href="/" className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-white interactive-glow">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div className="flex-1 mx-6 glass-card h-3 overflow-hidden p-0 relative">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-primary p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <div className="w-full h-full bg-stone-900 rounded-full flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-300">{currentIndex}/{mockWardrobe.length}</span>
          </div>
        </div>
      </div>

      {/* Massive Swipe Card */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full mb-8 perspective-1000 z-10">
         <div 
           className={`glass-card p-2 w-[95%] max-w-[400px] aspect-[3/4] relative overflow-hidden flex flex-col touch-none transition-transform duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
             swipingDir === "left" ? "translate-x-[-120%] rotate-[-20deg] opacity-0 scale-90" :
             swipingDir === "right" ? "translate-x-[120%] rotate-[20deg] opacity-0 scale-90" : "translate-x-0 rotate-0"
           } ${swipingDir ? `ring-4 ${swipingDir === 'left' ? 'ring-orange-500/50' : 'ring-lime-500/50'}` : ''}`}
         >
           
           <div className="absolute inset-2 rounded-[1.5rem] overflow-hidden z-0">
             <img 
               src={currentItem.imageUrl} 
               alt="Prenda" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-transparent to-stone-900/90 mix-blend-multiply" />
           </div>
           
           {/* Badges */}
           <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {currentItem.category}
              </span>
              <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {currentItem.formality}
              </span>
           </div>
           
           {/* Card Footer Info */}
           <div className="absolute bottom-6 left-6 right-6 z-10">
             <h3 className="font-black text-3xl text-white tracking-tight drop-shadow-md">{currentItem.name}</h3>
           </div>
         </div>

         {/* Stamp overlay */}
         {swipingDir === "left" && (
           <div className="absolute top-1/3 text-6xl font-black text-orange-500 italic rotate-[-20deg] z-20 pointer-events-none drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">
             PASS
           </div>
         )}
         {swipingDir === "right" && (
           <div className="absolute top-1/3 text-6xl font-black text-lime-400 italic rotate-[20deg] z-20 pointer-events-none drop-shadow-[0_0_20px_rgba(132,204,22,0.8)]">
             MATCH
           </div>
         )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-8 mt-auto z-20">
        <button 
          onClick={() => handleSwipe("left")}
          className="w-20 h-20 rounded-full glass-card border border-orange-500/30 flex items-center justify-center text-orange-500 interactive-glow hover:bg-orange-500/10 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:-translate-y-2"
        >
          <X size={36} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => handleSwipe("right")}
          className="w-20 h-20 rounded-full glass-card border border-lime-500/30 flex items-center justify-center text-lime-400 interactive-glow hover:bg-lime-500/10 hover:shadow-[0_0_30px_rgba(132,204,22,0.3)] hover:-translate-y-2 mt-[-20px]" // Raised layout
        >
          <Heart size={36} strokeWidth={2.5} className="fill-lime-400/20" />
        </button>
      </div>

    </div>
  );
}
