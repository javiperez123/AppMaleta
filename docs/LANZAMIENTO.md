# Pasos pendientes antes de publicar

Estado: la app funciona de extremo a extremo en local (desarrollo y `next start`), con pruebas unitarias y E2E superadas. **No se ha desplegado ni verificado en un entorno de producción real.**

## Bloqueantes para producción

| Pendiente | Por qué | Qué hacer |
|---|---|---|
| Proveedor de correo | Sin él, la recuperación de contraseña no funciona en producción (la app lo indica). | Crear cuenta en Resend (u otro), verificar el dominio y definir `RESEND_API_KEY` y `MAIL_FROM`. Para otro proveedor, adaptar `src/server/mailer.ts`. |
| Almacenamiento persistente | Los datos viven en ficheros (`DATA_DIR`). Plataformas *serverless* (p. ej. Vercel) no tienen disco persistente. | Opción A: servidor/contenedor con volumen persistente (`DATA_DIR`) y copias de seguridad diarias. Opción B (escalable): migrar `src/server/storage.ts` y las fotos a Postgres + almacenamiento de objetos (p. ej. Supabase: tablas con RLS por `user_id` y bucket privado). |
| Una sola instancia | El límite de intentos y la cola de escritura están en memoria del proceso. | Mantener una instancia, o con varias, mover datos a base de datos y el límite de intentos a Redis/BD. |
| HTTPS y dominio | La cookie de sesión es `Secure` en producción. | Servir solo por HTTPS; definir `APP_URL` con el dominio final. |
| Textos legales | La página `/privacy` es un borrador técnico. | Revisión legal (RGPD): responsable del tratamiento, base legal, plazos, contacto, aviso de cookies técnicas, condiciones de uso. |

## Recomendado

- Verificar en el despliegue que Open-Meteo responde desde el servidor (en el entorno de desarrollo usado para este trabajo el acceso saliente estaba bloqueado, así que **la llamada real no se pudo probar**; el código está cubierto con respuestas simuladas y degrada a “sin datos”). Para uso comercial intensivo, revisar los términos de Open-Meteo (plan comercial).
- Monitorización de errores (p. ej. Sentry) y registros sin datos personales.
- Política de seguridad de contenido (CSP) con *nonce* para scripts.
- Copias de seguridad y prueba de restauración de `DATA_DIR`.
- Compresión de fotos HEIC: los iPhone suelen convertir a JPEG al subir; si no, la app pide exportar a JPG.
- Revisión de accesibilidad con lector de pantalla real (VoiceOver/TalkBack); se ha cuidado contraste, foco visible, etiquetas, objetivos táctiles ≥ 44 px y navegación por teclado, pero no se ha hecho una auditoría con usuarios.
- Analítica de producto respetuosa con la privacidad (opcional).
- Iconos de aplicación/PWA y meta etiquetas para compartir.

## Comprobación previa a cada publicación

```bash
npm ci
npm run check        # typecheck + lint + pruebas + build
npm run test:e2e     # con Playwright instalado
```
