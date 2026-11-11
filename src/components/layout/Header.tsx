import { Settings2, Flame } from "lucide-react";

export function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-stone-900/50 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-500 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
           <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center">
             <Flame size={16} className="text-white" />
           </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI<span className="text-white/40">FIT</span></h1>
      </div>
      <div>
        <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-white interactive-glow">
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
}
