import { Briefcase } from "lucide-react";

interface SuitcaseMetricsProps {
  capacityPercentage: number;
}

export function SuitcaseMetrics({ capacityPercentage }: SuitcaseMetricsProps) {
  return (
    <div className="bg-surface-900 rounded-[2.5rem] p-8 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 text-surface-800 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
        <Briefcase size={160} strokeWidth={1} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-surface-900/50 to-transparent z-0" />
      <h3 className="font-bold text-2xl relative z-10 tracking-tight">Equipaje<br/>de Cabina</h3>
      <p className="text-primary-300 font-medium text-sm mt-2 relative z-10">{capacityPercentage}% de capacidad usada</p>
      <div className="w-full bg-surface-800 h-3 rounded-full mt-6 relative z-10 overflow-hidden shadow-inner">
        <div 
          className="bg-primary-500 h-full rounded-full shadow-[0_0_10px_rgba(217,119,87,0.5)] transition-all duration-1000" 
          style={{ width: `${capacityPercentage}%` }}
        />
      </div>
    </div>
  );
}
