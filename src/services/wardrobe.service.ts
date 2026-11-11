import { Garment, CreateGarmentDTO, GarmentCategory } from "@/types";
import { mockWardrobe } from "@/lib/mockData";

// Simulamos una latencia de red para probar UX de carga
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WardrobeService = {
  /**
   * Obtiene todas las prendas del usuario
   */
  async getGarments(filter?: GarmentCategory | "all"): Promise<Garment[]> {
    await delay(600); // Simulando red
    
    if (!filter || filter === "all") {
      return [...mockWardrobe];
    }
    
    return mockWardrobe.filter(item => item.category === filter);
  },

  /**
   * Añade una nueva prenda
   */
  async addGarment(dto: CreateGarmentDTO): Promise<Garment> {
    await delay(1200); // Simulando procesamiento (ej. subida de imagen, AI tagging)
    
    const newGarment: Garment = {
      ...dto,
      id: `g${Date.now()}` // Mock ID
    };
    
    // En el prototipo mutamos directamente el array mock 
    // (en producción no se haría así)
    mockWardrobe.push(newGarment);
    
    return newGarment;
  }
};
