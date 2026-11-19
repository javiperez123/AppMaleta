# PR: De prototipo a producto funcional (rama `mejoras/lanzamiento` → `main`)

## Resumen
Convierte el prototipo con datos simulados en una app funcional de armario digital y planificación de viajes: cuentas, fotos reales, persistencia por usuario, viajes con planes por día, looks generados con tiempo real, edición/favoritos/descartes, lista de maleta, nueva identidad visual, accesibilidad, pruebas y documentación.

## Errores corregidos
- `npm run build` fallaba (error de TypeScript en `loading/page.tsx` y Google Fonts en compilación).
- Formularios que no guardaban nada (prenda, viaje), botones sin acción (cámara, galería, “Modificar AI”, “Log Data”).
- Tiempo inventado y viaje simulado fijo; pantalla “hoy” con día fijo.
- Clases de Tailwind inexistentes (`surface-*`, `primary-*`) que dejaban pantallas sin estilo.
- Zoom bloqueado, imágenes sin `alt`, etiquetas de navegación ocultas.

## Verificación
- `npm run typecheck`, `npm run lint`, `npm run build`: sin errores ni avisos.
- `npm test`: 23 pruebas unitarias superadas.
- `npm run test:e2e`: 13/13 pasos (flujo completo como usuario nuevo y habitual, aislamiento entre usuarios, validación de fotos, 360/768/1440 px sin desbordamiento, sin errores de consola).
- Recuperación de contraseña probada en desarrollo (enlace por consola).

## Mejoras de la rama `mejoras/lanzamiento` (segunda fase)

### Funcionalidades nuevas
- **Modo oscuro completo** — tokens CSS separados para light/dark, ThemeToggle cíclico (sistema→oscuro→claro→sistema), script inline en `<head>` para evitar FOUC.
- **Service Worker** — caché estratificado: assets inmutables (cache-first), fotos (stale-while-revalidate con `?s=t`), navegación (network-first + página `/offline`).
- **Miniaturas WebP** — endpoint `GET /api/photos/[id]?s=t` genera thumbnails 200×200 con Sharp; vistas de lista las usan, mejorando carga percibida.
- **Carga masiva de fotos** — componente `BulkUpload` en `/wardrobe`: drag & drop, hasta 20 imágenes a la vez, estado por imagen (pending/uploading/done/error), enlace directo a añadir prenda.
- **Compartir look** — `ShareLookButton` en cada `DayCard`: Canvas API dibuja tarjeta 420×560 con fotos de las prendas, temperaturas y marca; Web Share API nivel 2 si disponible, descarga PNG como fallback.
- **Landing rediseñado** — hero con ilustración SVG (tarjeta de día, cápsula mini, avatar mini), listado de 4 beneficios, 7 feature cards con iconos de color, CTA mejorado.
- **Probador virtual** — nueva pantalla `/probador` con avatar personalizable y previsualización de combinaciones.
- **Pantalla «Look de hoy»** — versión mejorada con badge de tiempo real, botón de regeneración y contexto del viaje.

### Tests
- 9 tests nuevos de dominio (insights, capsule, engine, hemisferios): 32/32 pasando.

### Verificación segunda fase
- `tsc --noEmit`: 0 errores.
- `node --experimental-strip-types --test`: 32/32 pasando.
- `next build`: compilación limpia, 27 rutas generadas sin errores ni avisos.

## No verificado / pendiente
- Llamadas reales a Open-Meteo (red bloqueada en el entorno de trabajo; cubierto con pruebas simuladas).
- Despliegue, correo real y almacenamiento de producción: ver `docs/LANZAMIENTO.md`.
- 5 archivos pendientes de sincronizar en Windows por Controlled Folder Access: aplicar `docs/blocked-files.patch` con `git apply docs/blocked-files.patch`.

## Dependencias nuevas
- `@fontsource-variable/fraunces`, `@fontsource-variable/outfit` (fuentes autoalojadas, licencia OFL).
- `sharp` — miniaturas WebP en servidor (ya en `package.json` como devDependency de Next.js).
