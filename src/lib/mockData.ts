import { Garment, Trip } from "@/types";

// Datos Mock - Armario Funcional
export const mockWardrobe: Garment[] = [
  {
    id: "g1",
    name: "T-Shirt Básica Blanca",
    category: "top",
    color: "Blanco",
    formality: "basic",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400",
    volume: "low",
  },
  {
    id: "g2",
    name: "Jeans Rectos Clásicos",
    category: "bottom",
    color: "Azul",
    formality: "casual",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400",
    volume: "medium",
  },
  {
    id: "g3",
    name: "Sneakers Blancas",
    category: "shoes",
    color: "Blanco",
    formality: "casual",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400",
    volume: "medium",
  },
  {
    id: "g4",
    name: "Chaqueta Denim Vintage",
    category: "outerwear",
    color: "Azul",
    formality: "casual",
    imageUrl: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ea?auto=format&fit=crop&q=80&w=400",
    volume: "medium",
  },
  {
    id: "g5",
    name: "Jersey Lana Merino",
    category: "top",
    color: "Gris",
    formality: "smart-casual",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400",
    volume: "high",
  },
  {
    id: "g6",
    name: "Pantalón Chino",
    category: "bottom",
    color: "Beige",
    formality: "smart-casual",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400",
    volume: "medium",
  },
  {
    id: "g7",
    name: "Chubasquero Técnico",
    category: "outerwear",
    color: "Amarillo",
    formality: "casual",
    imageUrl: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=400",
    volume: "low",
  }
];

// Datos Mock - Viaje Interrail
export const mockActiveTrip: Trip = {
  id: "t1",
  name: "Interrail Europa Central",
  destinations: [
    { id: "dest1", city: "París", startDate: "2024-07-01", endDate: "2024-07-03" },
    { id: "dest2", city: "Ámsterdam", startDate: "2024-07-03", endDate: "2024-07-05" },
    { id: "dest3", city: "Berlín", startDate: "2024-07-05", endDate: "2024-07-08" }
  ],
  style: "casual",
  baggage: "cabina",
  vibe: "turismo",
  washOption: false,
  days: [
    {
      id: "d1",
      date: "2024-07-01",
      city: "París",
      weather: { temp: 22, condition: "sunny" },
      outfit: {
        id: "o1",
        name: "Casual Turismo",
        garments: [mockWardrobe[0], mockWardrobe[1], mockWardrobe[2]],
      },
    },
    {
      id: "d2",
      date: "2024-07-02",
      city: "París",
      weather: { temp: 19, condition: "cloudy" },
      outfit: {
        id: "o2",
        name: "Capas Ligeras",
        garments: [mockWardrobe[0], mockWardrobe[4], mockWardrobe[1], mockWardrobe[2]],
      },
    },
     {
      id: "d3",
      date: "2024-07-03",
      city: "Ámsterdam",
      weather: { temp: 15, condition: "rainy" },
      outfit: {
        id: "o3",
        name: "Lluvia Fina",
        garments: [mockWardrobe[4], mockWardrobe[6], mockWardrobe[5], mockWardrobe[2]],
      },
      alternativeOutfit: {
         id: "o3alt",
        name: "Sin Lluvia",
        garments: [mockWardrobe[4], mockWardrobe[3], mockWardrobe[5], mockWardrobe[2]],
      }
    },
     {
      id: "d4",
      date: "2024-07-04",
      city: "Ámsterdam",
      weather: { temp: 18, condition: "windy" },
      outfit: {
        id: "o4",
        name: "Abrigo Intermedio",
        garments: [mockWardrobe[0], mockWardrobe[3], mockWardrobe[1], mockWardrobe[2]],
      },
    },
    {
      id: "d5",
      date: "2024-07-05",
      city: "Berlín",
      weather: { temp: 24, condition: "sunny" },
      outfit: {
        id: "o5",
        name: "Verano Urbano",
        garments: [mockWardrobe[0], mockWardrobe[1], mockWardrobe[2]],
      },
    }
  ],
};

export const mockPastTrip: Trip = {
  id: "t2",
  name: "Escapada a Roma",
  destinations: [
    { id: "dest_r1", city: "Roma", startDate: "2023-04-10", endDate: "2023-04-14" },
  ],
  style: "elegante",
  baggage: "cabina",
  vibe: "turismo",
  washOption: false,
  days: [] // No cargamos detalles para el mockup general
};

export const mockTrips = [mockActiveTrip, mockPastTrip];
