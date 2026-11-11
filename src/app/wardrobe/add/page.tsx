"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Image as ImageIcon, Save, CheckCircle } from "lucide-react";

export default function AddGarmentPopup() {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "top",
    color: "Blanco",
  });

  const handleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  if (isSaved) {
    return (
      <div className="bg-surface-900/40 backdrop-blur-sm min-h-screen z-50 fixed inset-0 flex items-end md:max-w-lg md:mx-auto">
         <div className="bg-primary-500 w-full h-[60vh] rounded-t-[3rem] text-white flex flex-col items-center justify-center p-6 text-center animate-in slide-in-from-bottom-full duration-500">
           <CheckCircle size={80} className="mb-6 animate-bounce stroke-1" />
           <h2 className="text-4xl font-black tracking-tight">¡Añadida!</h2>
           <p className="text-primary-100 mt-3 font-medium text-lg">Tu prenda ya está en el armario.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-900/60 backdrop-blur-md min-h-screen fixed inset-0 z-50 flex items-end md:max-w-lg md:mx-auto">
      
      {/* Bottom Sheet Modal Form */}
      <form onSubmit={handleSubmit} className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-[3rem] p-6 pb-12 flex flex-col gap-8 animate-in slide-in-from-bottom-full duration-500 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        <div className="flex items-center justify-between">
          <h1 className="font-black text-2xl text-surface-900 tracking-tight">Nueva Prenda</h1>
          <button type="button" onClick={() => router.back()} className="text-surface-800 bg-surface-50 p-3 rounded-full hover:bg-surface-100 transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Subir Imagen */}
        <div className="w-full bg-[#f0ede6] rounded-[2rem] h-[220px] flex flex-col items-center justify-center gap-5 relative overflow-hidden group border border-black/[0.04]">
           <div className="flex gap-4 z-10">
              <button type="button" className="bg-surface-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <Camera size={20} strokeWidth={2} />
              </button>
              <button type="button" className="bg-white text-surface-900 shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-surface-100/50 w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <ImageIcon size={20} strokeWidth={2} />
              </button>
           </div>
           <p className="text-surface-800/60 font-bold tracking-tight text-sm z-10">Agrega una foto clara</p>
        </div>

        {/* Detalles */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-surface-800/60 uppercase tracking-widest pl-2">¿Cómo se llama?</label>
            <input 
              required
              type="text" 
              placeholder="Ej. Sudadera Vintage"
              className="w-full bg-surface-50 border-none rounded-2xl px-5 py-4 text-surface-900 placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-lg"
              value={formData.name}
              onChange={(e) => handleSelect("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-surface-800/60 uppercase tracking-widest pl-2">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {['top', 'bottom', 'shoes', 'outerwear', 'accessory'].map(cat => (
                 <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect('category', cat)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold capitalize transition-all border ${
                    formData.category === cat 
                      ? 'bg-surface-900 text-white border-surface-900 shadow-[0_8px_20px_rgba(0,0,0,0.15)]' 
                      : 'bg-white text-surface-800/60 border-surface-200 hover:border-surface-300'
                  }`}
                 >
                   {cat}
                 </button>
              ))}
            </div>
          </div>
        </section>

        {/* Submit inside the sheet */}
        <button 
          type="submit"
          className="w-full mt-4 bg-primary-500 text-white rounded-[2rem] py-5 font-bold text-lg shadow-[0_20px_40px_-5px_rgba(217,119,87,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all flex justify-center items-center gap-2"
        >
          <Save size={20} strokeWidth={2.5} /> Guardar Prenda
        </button>

      </form>
    </div>
  );
}
