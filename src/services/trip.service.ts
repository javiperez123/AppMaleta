import { Trip, CreateTripDTO, DayPlan } from "@/types";
import { mockActiveTrip, mockTrips } from "@/lib/mockData";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TripService = {
  async getAllTrips(): Promise<Trip[]> {
    await delay(400);
    return mockTrips;
  },

  /**
   * Obtiene el viaje actualmente activo del usuario (si lo hay)
   */
  async getActiveTrip(): Promise<Trip | null> {
    await delay(500);
    return mockActiveTrip; // Simulando que el usuario tiene un viaje activo
  },

  /**
   * Simula la creación y optimización de un viaje pasándolo al "Backend AI"
   */
  async createTripPlan(dto: CreateTripDTO): Promise<Trip> {
    // Aquí es donde en el futuro habrá una llamada larga a un Backend python/AI
    // para cruzar clima y catálogo de ropa.
    await delay(3000); 
    
    // Por ahora, simplemente devolvemos el mock activo como si se hubiera creado
    return mockActiveTrip;
  },

  /**
   * Obtiene el plan del día por ID
   */
  async getDayPlan(dayId: string): Promise<DayPlan | null> {
    await delay(300);
    if (!mockActiveTrip) return null;
    
    return mockActiveTrip.days.find(d => d.id === dayId) || null;
  }
};
