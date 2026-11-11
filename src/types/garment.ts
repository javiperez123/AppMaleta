export type GarmentCategory = "top" | "bottom" | "shoes" | "outerwear" | "accessory";
export type GarmentFormality = "basic" | "casual" | "smart-casual" | "elegant";
export type GarmentVolume = "low" | "medium" | "high";

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  color: string;
  formality: GarmentFormality;
  imageUrl: string;
  volume: GarmentVolume;
}

export type CreateGarmentDTO = Omit<Garment, 'id'>;
