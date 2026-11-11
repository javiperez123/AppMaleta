import { useState, useEffect } from "react";
import { Garment, GarmentCategory } from "@/types";
import { WardrobeService } from "@/services/wardrobe.service";

export function useWardrobe(initialFilter: GarmentCategory | "all" = "all") {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGarments = async () => {
      setLoading(true);
      try {
        const data = await WardrobeService.getGarments(initialFilter);
        if (isMounted) {
          setGarments(data);
        }
      } catch (err) {
        if (isMounted) setError("Error cargando el armario");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGarments();
    
    return () => { isMounted = false; };
  }, [initialFilter]);

  return { garments, loading, error };
}
