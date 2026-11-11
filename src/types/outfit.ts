import { Garment } from "./garment";

export interface Outfit {
  id: string;
  name: string;
  garments: Garment[];
}
