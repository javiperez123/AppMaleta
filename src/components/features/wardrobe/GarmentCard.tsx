import { Garment } from "@/types";

interface GarmentCardProps {
  garment: Garment;
  onClick?: () => void;
}

export function GarmentCard({ garment, onClick }: GarmentCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`glass-card flex flex-col group overflow-hidden ${onClick ? 'cursor-pointer hover:border-white/20' : ''}`}
    >
      <div className="w-full aspect-[4/5] relative overflow-hidden bg-white/5">
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
           <span className="bg-stone-900/60 backdrop-blur-md text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border border-white/10">
             {garment.category}
           </span>
           <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
             V-{garment.volume}
           </span>
        </div>
        <img 
          src={garment.imageUrl} 
          alt={garment.name} 
          className="w-full h-full object-cover mix-blend-screen opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
      </div>
      
      <div className="p-3 relative z-10 -mt-8">
        <p className="font-bold text-sm text-white leading-tight line-clamp-2 drop-shadow-md">{garment.name}</p>
        <div className="flex mt-2 items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-white/20" style={{backgroundColor: garment.color === 'Blanco' ? '#fff' : garment.color === 'Azul' ? '#3b82f6' : garment.color === 'Gris' ? '#9ca3af' : garment.color === 'Beige' ? '#fde68a' : '#eab308'}} />
          <span className="text-[9px] text-stone-400 font-bold uppercase">{garment.color}</span>
        </div>
      </div>
    </div>
  );
}
