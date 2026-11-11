import { Garment } from "@/types";
import { CheckCircle2 } from "lucide-react";

interface ChecklistItemProps {
  garment: Garment;
}

export function ChecklistItem({ garment }: ChecklistItemProps) {
  return (
    <label className="flex items-center justify-between bg-white border border-black/[0.02] p-3 rounded-[1.5rem] hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] transition-all cursor-pointer group shadow-sm">
      <div className="flex items-center gap-4 pl-1">
        <div className="relative w-6 h-6 rounded border-2 border-surface-200 group-hover:border-primary-500 flex items-center justify-center transition-colors">
          <input type="checkbox" className="peer sr-only" />
          <CheckCircle2 size={24} className="text-primary-500 absolute scale-0 peer-checked:scale-100 transition-transform duration-300" />
        </div>
        <div className="w-14 h-14 bg-surface-50 rounded-xl overflow-hidden shrink-0 border border-black/[0.03] p-1">
          <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover rounded-lg mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
        </div>
        <span className="text-sm font-bold text-surface-900">{garment.name}</span>
      </div>
      <span className="text-[10px] uppercase font-bold text-surface-800/40 tracking-widest pr-2">
        {garment.category}
      </span>
    </label>
  );
}
