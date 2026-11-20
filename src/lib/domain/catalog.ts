/**
 * Catálogo de prendas genéricas para el sistema de swipe de estilo.
 * Cada prenda tiene dimensiones de estilo que alimentan el StyleProfile del usuario.
 *
 * Dimensiones:
 *   formality  0-3  (basic → casual → smart-casual → elegant)
 *   boldness   0-1  (neutro → llamativo/colorido)
 *   streetwear 0-1  (clásico → streetwear/urbano)
 */

export interface CatalogItem {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "shoes";
  color: string;         // hex para la tarjeta visual
  colorName: string;
  formality: number;     // 0-3
  boldness: number;      // 0-1
  streetwear: number;    // 0-1
  /** Qué estilos de viaje encajan con esta prenda */
  fits: string[];
  /** Descripción corta para la tarjeta */
  descriptor: string;
}

export const CATALOG: CatalogItem[] = [
  // ── TOPS casual/streetwear ───────────────────────────────────────────
  { id: "c001", name: "Camiseta básica blanca", category: "top",      color: "#f5f5f0", colorName: "Blanco",        formality: 0, boldness: 0.0, streetwear: 0.3, fits: ["mochilero","turismo","naturaleza"],           descriptor: "Básico indispensable" },
  { id: "c002", name: "Camiseta negra oversize", category: "top",     color: "#1c1c1c", colorName: "Negro",         formality: 0, boldness: 0.1, streetwear: 0.8, fits: ["mochilero","fiesta"],                         descriptor: "Urbano y versátil" },
  { id: "c003", name: "Camiseta rayas azul marino", category: "top",  color: "#1a3a5c", colorName: "Azul marino",   formality: 1, boldness: 0.3, streetwear: 0.2, fits: ["turismo","mochilero"],                        descriptor: "Clásico marinero" },
  { id: "c004", name: "Sudadera gris marengo", category: "top",       color: "#4a4a4a", colorName: "Gris",          formality: 0, boldness: 0.0, streetwear: 0.6, fits: ["mochilero","naturaleza"],                     descriptor: "Comodidad máxima" },
  { id: "c005", name: "Sudadera hoodie verde caqui", category: "top", color: "#5a6a3a", colorName: "Verde caqui",   formality: 0, boldness: 0.2, streetwear: 0.7, fits: ["mochilero","naturaleza"],                     descriptor: "Estilo outdoor urbano" },
  { id: "c006", name: "Camiseta tie-dye azul", category: "top",       color: "#4a7ab5", colorName: "Azul cielo",    formality: 0, boldness: 0.7, streetwear: 0.8, fits: ["mochilero","fiesta"],                         descriptor: "Expresivo y libre" },
  { id: "c007", name: "Top crop negro", category: "top",              color: "#0f0f0f", colorName: "Negro",         formality: 1, boldness: 0.4, streetwear: 0.9, fits: ["fiesta","mochilero"],                         descriptor: "Atrevido y moderno" },
  { id: "c008", name: "Camiseta polo azul", category: "top",          color: "#2a6090", colorName: "Azul",          formality: 2, boldness: 0.2, streetwear: 0.1, fits: ["turismo","negocios"],                         descriptor: "Smart-casual sin esfuerzo" },
  { id: "c009", name: "Camisa lino beige", category: "top",           color: "#c8b89a", colorName: "Beige",         formality: 2, boldness: 0.1, streetwear: 0.0, fits: ["turismo","lujo","negocios"],                  descriptor: "Elegante y fresco" },
  { id: "c010", name: "Camisa blanca Oxford", category: "top",        color: "#eeeee8", colorName: "Blanco roto",   formality: 2, boldness: 0.0, streetwear: 0.0, fits: ["negocios","turismo","lujo"],                  descriptor: "Clásico impecable" },
  { id: "c011", name: "Camisa cuadros flanela", category: "top",      color: "#8b3a3a", colorName: "Rojo burdeos",  formality: 1, boldness: 0.5, streetwear: 0.5, fits: ["mochilero","naturaleza"],                     descriptor: "Leñador moderno" },
  { id: "c012", name: "Blusa satén verde esmeralda", category: "top", color: "#1a7a4a", colorName: "Esmeralda",     formality: 2, boldness: 0.7, streetwear: 0.1, fits: ["fiesta","lujo","turismo"],                    descriptor: "Lujo y color" },
  { id: "c013", name: "Top lencero negro", category: "top",           color: "#1a1a2e", colorName: "Negro noche",   formality: 2, boldness: 0.3, streetwear: 0.4, fits: ["fiesta","lujo"],                              descriptor: "Minimal y seductor" },
  { id: "c014", name: "Jersey cuello alto negro", category: "top",    color: "#2c2c2c", colorName: "Negro",         formality: 2, boldness: 0.1, streetwear: 0.3, fits: ["turismo","negocios","lujo"],                  descriptor: "Chic atemporal" },
  { id: "c015", name: "Camiseta estampado floral", category: "top",   color: "#e8a0b4", colorName: "Rosa palo",     formality: 1, boldness: 0.8, streetwear: 0.3, fits: ["turismo","fiesta"],                           descriptor: "Alegre y veraniego" },
  { id: "c016", name: "Camisa hawaiana", category: "top",             color: "#e05a2b", colorName: "Naranja coral", formality: 0, boldness: 0.9, streetwear: 0.5, fits: ["turismo","fiesta","mochilero"],               descriptor: "Vacacional y festivo" },
  { id: "c017", name: "Top asimétrico blanco", category: "top",       color: "#f0f0ea", colorName: "Blanco",        formality: 2, boldness: 0.3, streetwear: 0.5, fits: ["fiesta","lujo"],                              descriptor: "Vanguardista y limpio" },
  { id: "c018", name: "Camiseta técnica merino", category: "top",     color: "#6a8060", colorName: "Verde salvia",  formality: 1, boldness: 0.1, streetwear: 0.2, fits: ["naturaleza","mochilero"],                     descriptor: "Funcional y natural" },

  // ── BOTTOMS ──────────────────────────────────────────────────────────
  { id: "c019", name: "Vaqueros slim azul clásico", category: "bottom",  color: "#3a5f8a", colorName: "Azul denim",    formality: 1, boldness: 0.2, streetwear: 0.4, fits: ["turismo","mochilero","fiesta"],         descriptor: "El básico de todos" },
  { id: "c020", name: "Vaqueros negros ajustados", category: "bottom",   color: "#1a1a1a", colorName: "Negro",         formality: 1, boldness: 0.1, streetwear: 0.5, fits: ["fiesta","turismo","negocios"],          descriptor: "Versátil de día o noche" },
  { id: "c021", name: "Vaqueros anchos 90s", category: "bottom",         color: "#6a90b0", colorName: "Azul lavado",   formality: 0, boldness: 0.3, streetwear: 0.9, fits: ["mochilero","fiesta"],                   descriptor: "Retro y tendencia" },
  { id: "c022", name: "Pantalón chino beige", category: "bottom",        color: "#c8a87a", colorName: "Beige",         formality: 2, boldness: 0.1, streetwear: 0.0, fits: ["turismo","negocios","lujo"],            descriptor: "Clásico smart-casual" },
  { id: "c023", name: "Pantalón traje negro", category: "bottom",        color: "#1e1e1e", colorName: "Negro",         formality: 3, boldness: 0.0, streetwear: 0.0, fits: ["negocios","lujo"],                      descriptor: "Formalidad total" },
  { id: "c024", name: "Falda midi plisada verde", category: "bottom",    color: "#2a7a3a", colorName: "Verde",         formality: 2, boldness: 0.5, streetwear: 0.1, fits: ["turismo","fiesta","lujo"],              descriptor: "Femenina y elegante" },
  { id: "c025", name: "Shorts cargo verde militar", category: "bottom",  color: "#4a5a3a", colorName: "Verde militar", formality: 0, boldness: 0.1, streetwear: 0.7, fits: ["mochilero","naturaleza"],               descriptor: "Funcional y urbano" },
  { id: "c026", name: "Shorts denim blanco", category: "bottom",         color: "#e8e0d0", colorName: "Blanco roto",   formality: 0, boldness: 0.1, streetwear: 0.3, fits: ["turismo","mochilero"],                  descriptor: "Veraniego y casual" },
  { id: "c027", name: "Minifalda cuero negro", category: "bottom",       color: "#1a1a1a", colorName: "Negro",         formality: 2, boldness: 0.4, streetwear: 0.6, fits: ["fiesta","lujo"],                        descriptor: "Rock y sofisticado" },
  { id: "c028", name: "Pantalón palazzo crema", category: "bottom",      color: "#f0e8d8", colorName: "Crema",         formality: 2, boldness: 0.1, streetwear: 0.1, fits: ["lujo","turismo"],                       descriptor: "Elegante y fluido" },
  { id: "c029", name: "Pantalón técnico montaña", category: "bottom",    color: "#3a4a5a", colorName: "Gris pizarra",  formality: 0, boldness: 0.0, streetwear: 0.2, fits: ["naturaleza"],                           descriptor: "Rendimiento máximo" },
  { id: "c030", name: "Falda larga boho flores", category: "bottom",     color: "#c05a2a", colorName: "Terracota",     formality: 1, boldness: 0.8, streetwear: 0.1, fits: ["turismo","fiesta"],                     descriptor: "Libre y colorida" },
  { id: "c031", name: "Bermuda náutica azul", category: "bottom",        color: "#2a4a7a", colorName: "Azul navy",     formality: 1, boldness: 0.1, streetwear: 0.1, fits: ["turismo","naturaleza"],                 descriptor: "Clásico veraniego" },
  { id: "c032", name: "Pantalón rojo chilli", category: "bottom",        color: "#c0251a", colorName: "Rojo",          formality: 1, boldness: 0.9, streetwear: 0.3, fits: ["fiesta","turismo"],                     descriptor: "Atrevido y energético" },

  // ── VESTIDOS ─────────────────────────────────────────────────────────
  { id: "c033", name: "Vestido negro midi", category: "dress",         color: "#1a1a1a", colorName: "Negro",          formality: 3, boldness: 0.1, streetwear: 0.0, fits: ["fiesta","lujo","negocios"],             descriptor: "El vestido de todos" },
  { id: "c034", name: "Vestido flores verano", category: "dress",      color: "#f0a060", colorName: "Naranja suave",  formality: 1, boldness: 0.8, streetwear: 0.0, fits: ["turismo","fiesta"],                     descriptor: "Alegre y luminoso" },
  { id: "c035", name: "Vestido camisero azul", category: "dress",      color: "#4a7ab0", colorName: "Azul cielo",    formality: 1, boldness: 0.3, streetwear: 0.0, fits: ["turismo","negocios"],                   descriptor: "Fácil y polivalente" },
  { id: "c036", name: "Vestido mini rojo", category: "dress",          color: "#c82020", colorName: "Rojo",           formality: 2, boldness: 0.9, streetwear: 0.3, fits: ["fiesta","lujo"],                       descriptor: "Protagonista total" },
  { id: "c037", name: "Vestido satén champán", category: "dress",      color: "#e8d8a8", colorName: "Champán",        formality: 3, boldness: 0.3, streetwear: 0.0, fits: ["lujo","fiesta"],                       descriptor: "Lujo sin ostentación" },
  { id: "c038", name: "Mono negro estructurado", category: "dress",    color: "#252525", colorName: "Negro",          formality: 2, boldness: 0.1, streetwear: 0.4, fits: ["fiesta","negocios","lujo"],             descriptor: "Moderno y sin fallo" },
  { id: "c039", name: "Vestido boho lino crudo", category: "dress",    color: "#dcd0b8", colorName: "Lino crudo",     formality: 1, boldness: 0.1, streetwear: 0.0, fits: ["turismo","naturaleza"],                 descriptor: "Natural y sin esfuerzo" },
  { id: "c040", name: "Mono deportivo lila", category: "dress",        color: "#9070c0", colorName: "Lila",           formality: 0, boldness: 0.7, streetwear: 0.6, fits: ["mochilero","fiesta"],                   descriptor: "Sporty chic" },

  // ── OUTERWEAR ────────────────────────────────────────────────────────
  { id: "c041", name: "Blazer gris estructurado", category: "outerwear",  color: "#6a6a6a", colorName: "Gris medio",   formality: 3, boldness: 0.0, streetwear: 0.1, fits: ["negocios","lujo","turismo"],           descriptor: "Poder sin palabras" },
  { id: "c042", name: "Blazer camel oversized", category: "outerwear",    color: "#c8905a", colorName: "Camel",         formality: 2, boldness: 0.4, streetwear: 0.3, fits: ["turismo","lujo","fiesta"],            descriptor: "Tendencia atemporal" },
  { id: "c043", name: "Chaqueta vaquera desgastada", category: "outerwear", color: "#5a7a9a", colorName: "Denim",      formality: 1, boldness: 0.2, streetwear: 0.7, fits: ["mochilero","turismo"],                 descriptor: "Rebelde clásico" },
  { id: "c044", name: "Cazadora cuero negro", category: "outerwear",     color: "#0f0f0f", colorName: "Negro cuero",   formality: 2, boldness: 0.2, streetwear: 0.8, fits: ["fiesta","mochilero"],                  descriptor: "Rock y atemporal" },
  { id: "c045", name: "Trench camel clásico", category: "outerwear",     color: "#c09060", colorName: "Camel",         formality: 2, boldness: 0.1, streetwear: 0.0, fits: ["negocios","turismo","lujo"],           descriptor: "Elegancia británica" },
  { id: "c046", name: "Chubasquero técnico azul", category: "outerwear", color: "#1a4a8a", colorName: "Azul intenso",  formality: 0, boldness: 0.3, streetwear: 0.3, fits: ["naturaleza","mochilero"],              descriptor: "Protección total" },
  { id: "c047", name: "Parka verde militar", category: "outerwear",      color: "#3a4a2a", colorName: "Verde oliva",   formality: 0, boldness: 0.1, streetwear: 0.6, fits: ["mochilero","naturaleza"],              descriptor: "Funcional con actitud" },
  { id: "c048", name: "Chaqueta punto beige", category: "outerwear",     color: "#d8c8a8", colorName: "Beige",         formality: 1, boldness: 0.1, streetwear: 0.1, fits: ["turismo","lujo"],                      descriptor: "Cálido y sofisticado" },
  { id: "c049", name: "Bomber negro satinado", category: "outerwear",    color: "#181818", colorName: "Negro",         formality: 1, boldness: 0.1, streetwear: 0.8, fits: ["fiesta","mochilero"],                   descriptor: "Urbano nocturno" },
  { id: "c050", name: "Chaqueta esquí colorblock", category: "outerwear", color: "#e03a1a", colorName: "Naranja vivo", formality: 0, boldness: 0.9, streetwear: 0.5, fits: ["naturaleza"],                          descriptor: "Pistas con estilo" },

  // ── CALZADO casual ───────────────────────────────────────────────────
  { id: "c051", name: "Zapatillas blancas clean", category: "shoes",   color: "#f0efe8", colorName: "Blanco",         formality: 1, boldness: 0.0, streetwear: 0.5, fits: ["turismo","mochilero","fiesta"],         descriptor: "Con todo y sin fallo" },
  { id: "c052", name: "Zapatillas negras básicas", category: "shoes",  color: "#1c1c1c", colorName: "Negro",          formality: 1, boldness: 0.0, streetwear: 0.5, fits: ["mochilero","fiesta","turismo"],         descriptor: "Siempre acertada" },
  { id: "c053", name: "Sneakers chunky blancas", category: "shoes",    color: "#e8e8e0", colorName: "Blanco",         formality: 0, boldness: 0.1, streetwear: 0.9, fits: ["mochilero","fiesta"],                   descriptor: "Maximalista y comfort" },
  { id: "c054", name: "Sneakers neon verde", category: "shoes",        color: "#50c060", colorName: "Verde neon",     formality: 0, boldness: 0.9, streetwear: 1.0, fits: ["mochilero","fiesta"],                   descriptor: "Bold sin disculpas" },
  { id: "c055", name: "Deportivas trail grises", category: "shoes",    color: "#7a7a7a", colorName: "Gris",           formality: 0, boldness: 0.1, streetwear: 0.3, fits: ["naturaleza","mochilero"],               descriptor: "Hecho para moverse" },
  { id: "c056", name: "Mocasines marrón cognac", category: "shoes",    color: "#9a5a2a", colorName: "Cognac",         formality: 2, boldness: 0.3, streetwear: 0.0, fits: ["turismo","negocios","lujo"],            descriptor: "Clásico de calidad" },
  { id: "c057", name: "Zapato oxford negro", category: "shoes",        color: "#1a1a1a", colorName: "Negro",          formality: 3, boldness: 0.0, streetwear: 0.0, fits: ["negocios","lujo"],                      descriptor: "Formalidad sin discusión" },
  { id: "c058", name: "Sandalia plana beige", category: "shoes",       color: "#c8a878", colorName: "Beige",          formality: 1, boldness: 0.1, streetwear: 0.0, fits: ["turismo","naturaleza"],                 descriptor: "Frescura mediterránea" },
  { id: "c059", name: "Sandalia tacón dorado", category: "shoes",      color: "#c8a040", colorName: "Dorado",         formality: 3, boldness: 0.7, streetwear: 0.0, fits: ["fiesta","lujo"],                        descriptor: "Noche de ensueño" },
  { id: "c060", name: "Botín chelsea camel", category: "shoes",        color: "#b08050", colorName: "Camel",          formality: 2, boldness: 0.2, streetwear: 0.3, fits: ["turismo","negocios"],                   descriptor: "British y versátil" },
  { id: "c061", name: "Botines negros con hebillas", category: "shoes", color: "#1a1a1a", colorName: "Negro",         formality: 2, boldness: 0.3, streetwear: 0.7, fits: ["fiesta","mochilero"],                   descriptor: "Rock sofisticado" },
  { id: "c062", name: "Botas trekking verdes", category: "shoes",      color: "#4a6040", colorName: "Verde oscuro",   formality: 0, boldness: 0.1, streetwear: 0.3, fits: ["naturaleza"],                           descriptor: "Conquista el terreno" },
  { id: "c063", name: "Zapatilla plataforma blanca", category: "shoes", color: "#f0f0e8", colorName: "Blanco",        formality: 1, boldness: 0.2, streetwear: 0.6, fits: ["fiesta","turismo"],                     descriptor: "Altura y tendencia" },
  { id: "c064", name: "Alpargata trenzada cruda", category: "shoes",   color: "#ddd0b0", colorName: "Crudo",          formality: 1, boldness: 0.0, streetwear: 0.0, fits: ["turismo","naturaleza"],                 descriptor: "Artesanal mediterráneo" },
  { id: "c065", name: "Zapato kitten heel nude", category: "shoes",    color: "#d4a880", colorName: "Nude",           formality: 3, boldness: 0.1, streetwear: 0.0, fits: ["negocios","lujo"],                      descriptor: "Femenino y profesional" },

  // ── MÁS TOPS elegantes/festivos ──────────────────────────────────────
  { id: "c066", name: "Camisa seda rosa", category: "top",             color: "#e8a8b8", colorName: "Rosa",           formality: 2, boldness: 0.5, streetwear: 0.0, fits: ["lujo","turismo","fiesta"],              descriptor: "Suave y lujoso" },
  { id: "c067", name: "Top corset negro", category: "top",             color: "#0f0f0f", colorName: "Negro",          formality: 2, boldness: 0.2, streetwear: 0.5, fits: ["fiesta","lujo"],                        descriptor: "Atrevido y estructurado" },
  { id: "c068", name: "Camiseta tie-dye terracota", category: "top",   color: "#c86040", colorName: "Terracota",      formality: 0, boldness: 0.8, streetwear: 0.5, fits: ["mochilero","turismo"],                  descriptor: "Artístico y libre" },
  { id: "c069", name: "Top estampado cebra", category: "top",          color: "#2a2a2a", colorName: "Blanco y negro", formality: 1, boldness: 0.8, streetwear: 0.4, fits: ["fiesta","turismo"],                     descriptor: "Salvaje y chic" },
  { id: "c070", name: "Jersey oversize camel", category: "top",        color: "#c8905a", colorName: "Camel",          formality: 1, boldness: 0.2, streetwear: 0.3, fits: ["turismo","lujo"],                       descriptor: "Cálido y editorial" },
  { id: "c071", name: "Camisa técnica manga corta", category: "top",   color: "#3a7a9a", colorName: "Azul petróleo",  formality: 1, boldness: 0.2, streetwear: 0.3, fits: ["naturaleza","mochilero"],               descriptor: "Ligero y transpirable" },
  { id: "c072", name: "Top lencero encaje negro", category: "top",     color: "#1a1a2e", colorName: "Negro",          formality: 2, boldness: 0.3, streetwear: 0.3, fits: ["fiesta","lujo"],                        descriptor: "Delicado y seductor" },
  { id: "c073", name: "Camiseta universitaria", category: "top",       color: "#2a3a8a", colorName: "Azul universitario", formality: 0, boldness: 0.4, streetwear: 0.6, fits: ["mochilero","turismo"],             descriptor: "Campus spirit" },
  { id: "c074", name: "Blusa volantes blanca", category: "top",        color: "#f5f5f0", colorName: "Blanco",         formality: 2, boldness: 0.1, streetwear: 0.0, fits: ["turismo","lujo","fiesta"],              descriptor: "Romántico y femenino" },
  { id: "c075", name: "Top metálico plateado", category: "top",        color: "#c8c8d0", colorName: "Plateado",       formality: 2, boldness: 0.8, streetwear: 0.5, fits: ["fiesta","lujo"],                        descriptor: "La noche te llama" },

  // ── MÁS BOTTOMS ──────────────────────────────────────────────────────
  { id: "c076", name: "Pantalón cuadros vichy", category: "bottom",    color: "#e88090", colorName: "Rosa vichy",    formality: 1, boldness: 0.7, streetwear: 0.2, fits: ["turismo","fiesta"],                      descriptor: "Parisino y alegre" },
  { id: "c077", name: "Jeans rotos bleach", category: "bottom",        color: "#a0b8c8", colorName: "Azul claro",    formality: 0, boldness: 0.4, streetwear: 0.9, fits: ["mochilero","fiesta"],                    descriptor: "Rebelde con estilo" },
  { id: "c078", name: "Pantalón pinzas crema", category: "bottom",     color: "#e8e0c8", colorName: "Crema",         formality: 2, boldness: 0.1, streetwear: 0.1, fits: ["negocios","turismo","lujo"],             descriptor: "Italiano y refinado" },
  { id: "c079", name: "Falda lápiz negro", category: "bottom",         color: "#1a1a1a", colorName: "Negro",         formality: 3, boldness: 0.0, streetwear: 0.0, fits: ["negocios","lujo"],                       descriptor: "Poder femenino" },
  { id: "c080", name: "Bermuda técnica azul", category: "bottom",      color: "#2a4a7a", colorName: "Azul",          formality: 0, boldness: 0.1, streetwear: 0.4, fits: ["naturaleza","mochilero"],                descriptor: "Movimiento sin límites" },

  // ── MÁS OUTERWEAR ────────────────────────────────────────────────────
  { id: "c081", name: "Plumífero compacto negro", category: "outerwear", color: "#1a1a1a", colorName: "Negro",       formality: 0, boldness: 0.0, streetwear: 0.5, fits: ["mochilero","naturaleza"],                descriptor: "Calor sin volumen" },
  { id: "c082", name: "Blazer blanco roto", category: "outerwear",     color: "#f0eee5", colorName: "Blanco roto",   formality: 3, boldness: 0.1, streetwear: 0.1, fits: ["lujo","fiesta","negocios"],              descriptor: "Minimalismo de alto nivel" },
  { id: "c083", name: "Cardigan oversize crema", category: "outerwear", color: "#e8e0d0", colorName: "Crema",        formality: 1, boldness: 0.1, streetwear: 0.2, fits: ["turismo","naturaleza"],                  descriptor: "Casa fuera de casa" },
  { id: "c084", name: "Cazadora satén azul eléctrico", category: "outerwear", color: "#1a60e0", colorName: "Azul eléctrico", formality: 1, boldness: 0.9, streetwear: 0.8, fits: ["fiesta","mochilero"],           descriptor: "No pasar desapercibido" },
  { id: "c085", name: "Chaqueta polar gris", category: "outerwear",    color: "#8a8a8a", colorName: "Gris",          formality: 0, boldness: 0.0, streetwear: 0.2, fits: ["naturaleza","mochilero"],                descriptor: "Calidez sin pretensiones" },

  // ── MÁS CALZADO ──────────────────────────────────────────────────────
  { id: "c086", name: "Mule mula negra", category: "shoes",            color: "#1a1a1a", colorName: "Negro",         formality: 2, boldness: 0.1, streetwear: 0.3, fits: ["turismo","fiesta"],                      descriptor: "Sofisticado sin calcetín" },
  { id: "c087", name: "Bota cowboy marrón", category: "shoes",         color: "#7a4a1a", colorName: "Marrón",        formality: 1, boldness: 0.5, streetwear: 0.5, fits: ["turismo","fiesta"],                      descriptor: "Americana y libre" },
  { id: "c088", name: "Zapato mary jane charol", category: "shoes",    color: "#0f0f0f", colorName: "Negro charol",  formality: 2, boldness: 0.2, streetwear: 0.3, fits: ["fiesta","lujo","negocios"],              descriptor: "Infantil y sofisticado" },
  { id: "c089", name: "Sandalia gladiadora dorada", category: "shoes", color: "#c8a040", colorName: "Dorado",        formality: 2, boldness: 0.6, streetwear: 0.1, fits: ["turismo","fiesta","lujo"],               descriptor: "Griega y espectacular" },
  { id: "c090", name: "Zapatilla slip-on canvas", category: "shoes",   color: "#6a6a6a", colorName: "Gris",          formality: 1, boldness: 0.0, streetwear: 0.5, fits: ["mochilero","turismo"],                   descriptor: "Sin atarse a nada" },

  // ── VESTIDOS adicionales ──────────────────────────────────────────────
  { id: "c091", name: "Vestido tweed rosa", category: "dress",         color: "#e8b0c0", colorName: "Rosa palo",     formality: 3, boldness: 0.4, streetwear: 0.0, fits: ["lujo","negocios"],                       descriptor: "Couture cotidiana" },
  { id: "c092", name: "Vestido resort estampado", category: "dress",   color: "#2a8a7a", colorName: "Verde agua",    formality: 1, boldness: 0.8, streetwear: 0.0, fits: ["turismo","naturaleza"],                  descriptor: "Vacaciones en modo film" },
  { id: "c093", name: "Mono jeans oversize", category: "dress",        color: "#4a7090", colorName: "Denim medio",   formality: 0, boldness: 0.2, streetwear: 0.6, fits: ["mochilero","turismo"],                   descriptor: "Casual sin pensar" },
  { id: "c094", name: "Vestido lamé dorado", category: "dress",        color: "#c8a040", colorName: "Dorado",        formality: 3, boldness: 0.9, streetwear: 0.1, fits: ["fiesta","lujo"],                         descriptor: "Para brillar sin parar" },
  { id: "c095", name: "Vestido pareo sarong", category: "dress",       color: "#e8702a", colorName: "Naranja",       formality: 0, boldness: 0.8, streetwear: 0.0, fits: ["naturaleza","turismo"],                  descriptor: "Playa con gracia" },

  // ── EXTRAS ───────────────────────────────────────────────────────────
  { id: "c096", name: "Camiseta interior técnica", category: "top",    color: "#e8e8e8", colorName: "Gris claro",    formality: 0, boldness: 0.0, streetwear: 0.2, fits: ["naturaleza","mochilero"],                descriptor: "La base que lo cambia todo" },
  { id: "c097", name: "Pantalón jogger negro", category: "bottom",     color: "#1a1a1a", colorName: "Negro",         formality: 0, boldness: 0.0, streetwear: 0.7, fits: ["mochilero"],                              descriptor: "Comodidad máxima" },
  { id: "c098", name: "Falda plisada metalizada", category: "bottom",  color: "#b0b0c0", colorName: "Plata",         formality: 2, boldness: 0.8, streetwear: 0.5, fits: ["fiesta","lujo"],                         descriptor: "Disco forever" },
  { id: "c099", name: "Cazadora técnica naranja", category: "outerwear", color: "#e06020", colorName: "Naranja",    formality: 0, boldness: 0.8, streetwear: 0.5, fits: ["naturaleza","mochilero"],                  descriptor: "Visible y funcional" },
  { id: "c100", name: "Sandalia tiras minimal", category: "shoes",     color: "#c8a070", colorName: "Nude",          formality: 2, boldness: 0.1, streetwear: 0.0, fits: ["turismo","lujo","fiesta"],                descriptor: "El básico del verano" },
  { id: "c101", name: "Zapatilla alta graffiti", category: "shoes",    color: "#2a2a2a", colorName: "Negro",         formality: 0, boldness: 0.7, streetwear: 1.0, fits: ["mochilero","fiesta"],                     descriptor: "Arte en el pie" },
  { id: "c102", name: "Blazer cuadros príncipe de Gales", category: "outerwear", color: "#6a5a4a", colorName: "Gris topo", formality: 2, boldness: 0.3, streetwear: 0.2, fits: ["negocios","turismo","lujo"],        descriptor: "Británico impecable" },
  { id: "c103", name: "Leggings técnicos negros", category: "bottom",  color: "#1a1a1a", colorName: "Negro",         formality: 0, boldness: 0.0, streetwear: 0.5, fits: ["naturaleza","mochilero"],                descriptor: "Movimiento sin límites" },
  { id: "c104", name: "Camisa oversize lila", category: "top",         color: "#9070c0", colorName: "Lila",          formality: 1, boldness: 0.6, streetwear: 0.4, fits: ["turismo","fiesta"],                      descriptor: "Relajado con color" },
  { id: "c105", name: "Pantalón cuero negro", category: "bottom",      color: "#1a1a1a", colorName: "Negro cuero",   formality: 2, boldness: 0.2, streetwear: 0.7, fits: ["fiesta","lujo"],                         descriptor: "Rock de pasarela" },
];

/** Devuelve N items del catálogo para mostrar en el swipe, priorizando los no vistos. */
export function getCatalogQueue(seenIds: Set<string>, count = 10): CatalogItem[] {
  const unseen = CATALOG.filter(c => !seenIds.has(c.id));
  // Si hay menos no vistos que los pedidos, completar con vistos
  if (unseen.length >= count) return shuffle(unseen).slice(0, count);
  const extra = shuffle(CATALOG.filter(c => seenIds.has(c.id))).slice(0, count - unseen.length);
  return shuffle([...unseen, ...extra]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
