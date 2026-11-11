import { Outfit } from "./outfit";

export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "windy";

export interface Weather {
  temp: number;
  condition: WeatherCondition;
}

export interface DayPlan {
  id: string;
  date: string; // ISO date string
  city: string;
  weather: Weather;
  outfit: Outfit;
  alternativeOutfit?: Outfit;
  isUsed?: boolean;
}

export interface TripDestination {
  id: string;
  city: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export type TripStyle = "básico" | "casual" | "urbano" | "elegante" | "cómodo" | string;
export type TripBaggageType = "mochila" | "cabina" | "grande";
export type TripVibe = "turismo" | "fiesta" | "relax" | "mixto";

export interface Trip {
  id: string;
  name: string;
  destinations: TripDestination[];
  style: TripStyle;
  baggage: TripBaggageType;
  vibe: TripVibe;
  washOption: boolean;
  days: DayPlan[];
}

export type CreateTripDTO = Omit<Trip, 'id' | 'days'>;
