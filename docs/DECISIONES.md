# Decisiones y suposiciones

Registro de las decisiones tomadas al convertir el prototipo en un producto funcional. Todas son reversibles.

## Punto de partida (diagnóstico)

El proyecto era un prototipo de Next.js 16 + React 19 + Tailwind 4 con datos simulados:

- `npm run build` **fallaba**: error de TypeScript en `src/app/loading/page.tsx` (`startDate` no existe en `CreateTripDTO`) y dependencia de Google Fonts en tiempo de compilación (falla sin conexión).
- Nada se guardaba: añadir prenda no llamaba al servicio, los botones de cámara/galería no hacían nada, crear viaje ignoraba el formulario y devolvía siempre el mismo viaje simulado, “Modificar AI” y “Log Data” no tenían acción, la pantalla “hoy” mostraba un día fijo.
- El tiempo era **inventado** (valores fijos en `mockData.ts`), y las imágenes venían de Unsplash.
- La pantalla de añadir prenda y otros componentes usaban clases de color inexistentes (`surface-*`, `primary-*`) y se veían sin estilo.
- Accesibilidad: zoom desactivado (`userScalable: false`), imágenes sin `alt`, etiquetas de navegación ocultas, textos de bajo contraste.
- Estética “HUD/neón” (`ASSETS`, `Loadout Core`, `SYS.PROCESS`) poco coherente con un producto de moda y viajes.
- Sin pruebas, sin documentación propia (README por defecto de create-next-app).

## Decisiones

1. **Mantener la tecnología** (Next.js 16 App Router, React 19, Tailwind 4, lucide-react). Se usan Server Components y Server Actions en lugar de la capa de servicios simulada.
2. **Persistencia sin servicios externos**: ficheros JSON por usuario (`data/users/<id>.json`) + `data/auth.json` + fotos en `data/uploads/<id>/`, con escrituras atómicas y cola por fichero. Motivo: no hay base de datos ni credenciales disponibles; así la app funciona de verdad con `npm run dev`. **Limitación**: una sola instancia de servidor y disco persistente. Para escalar, sustituir `src/server/storage.ts` por Postgres/Supabase (la interfaz es pequeña).
3. **Autenticación propia** con `scrypt` (Node), sesiones opacas aleatorias guardadas como hash SHA-256, cookie `httpOnly`, `SameSite=Lax`, `Secure` en producción, caducidad 30 días, límite de intentos por IP/email, respuestas que no revelan si un email existe, cierre de todas las sesiones al cambiar la contraseña. Sin dependencias nuevas.
4. **Aislamiento de datos estructural**: todas las funciones de datos reciben el `userId` de la sesión (nunca del cliente) y solo abren el fichero de ese usuario; las fotos se sirven desde la carpeta del usuario de la sesión. Verificado en la prueba E2E con dos cuentas.
5. **Fotos**: se comprimen en el navegador (máx. 1280 px, WebP/JPEG), lo que además elimina metadatos EXIF como la ubicación GPS y acelera la subida en conexiones lentas. En el servidor se valida el **contenido real** (JPEG/PNG/WebP por firma de bytes, nunca SVG/HTML), tamaño ≤ 6 MB, límite de subidas por hora, nombres aleatorios y cabeceras `nosniff` + `CSP sandbox`.
6. **Color sugerido**: se calcula el color medio de la zona central de la foto y se propone el más cercano de la paleta; siempre editable. No se usa IA de etiquetado (requeriría un servicio de pago): los demás datos los indica el usuario.
7. **Motor de looks determinista y explicable** (`src/lib/domain/engine.ts`): formalidad según los planes del día, abrigo según la temperatura, impermeable si llueve, preferencias del usuario, reutilización según el equipaje y la opción de lavado, variedad de la parte de arriba entre días. Solo usa prendas existentes; si falta algo (calzado, abrigo, bañador) lo avisa. Marca *aproximado* cuando no hay tiempo o hay prendas sin datos.
8. **Tiempo real con Open-Meteo** (gratis, sin clave): previsión hasta 15 días; más allá, datos reales del mismo periodo del año anterior **marcados como estimación**; sin respuesta, “sin datos” y edición manual. Nunca se generan valores.
9. **Rutas**: se conservan los nombres en inglés del prototipo (`/wardrobe`, `/trip/create`, `/today`, `/train`) y se añaden las nuevas en el mismo estilo. `/trip/plan` y `/loading` redirigen a `/trips`. La antigua pantalla “Match” se convierte en **Mi estilo**: valorar prendas, que el motor sí tiene en cuenta.
10. **Identidad visual**: nombre “Maleta” (configurable en `src/lib/brand.ts`), paleta papel/tinta/arcilla/verde mar con contrastes ≥ 4,5:1, tipografías Fraunces (titulares) y Outfit (texto, ya usada antes) **autoalojadas** con `@fontsource-variable` (únicas dependencias nuevas: compilan sin conexión y no envían peticiones a Google).
11. **Pruebas sin dependencias extra**: unitarias con `node:test`; E2E con Playwright como dependencia opcional.
12. Se eliminaron los datos simulados (`mockData.ts`), servicios y hooks de simulación porque quedan sustituidos por datos reales. No había datos de usuarios que conservar.

## Suposiciones

- Idioma y formato: español de España, fechas en calendario local, temperaturas en °C.
- Un viaje puede tener hasta 10 destinos y 60 días; hasta 1000 prendas por usuario.
- “Básicos sugeridos” (ropa interior, calcetines, pijama) se muestran claramente como cálculo orientativo, no como prendas del armario.
- La estimación de espacio de la maleta es orientativa y se basa en el volumen que indica el usuario.
