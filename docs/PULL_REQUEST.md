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

## No verificado / pendiente
- Llamadas reales a Open-Meteo (red bloqueada en el entorno de trabajo; cubierto con pruebas simuladas).
- Despliegue, correo real y almacenamiento de producción: ver `docs/LANZAMIENTO.md`.

## Dependencias nuevas
- `@fontsource-variable/fraunces`, `@fontsource-variable/outfit` (fuentes autoalojadas, licencia OFL).
