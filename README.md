# Maleta · Tu armario, listo para viajar

App web de vestimenta y planificación de viajes. Permite:

- **Crear un armario digital** a partir de fotos de tu ropa (cámara o galería), con color sugerido a partir de la foto.
- **Organizar y completar** las prendas: tipo, color, estilo, cuánto abrigan, si son impermeables, cuánto ocupan y si te gustan. Búsqueda, filtros (tipo, color, datos incompletos), edición y eliminación.
- **Preparar viajes** con uno o varios destinos, fechas, tipo de equipaje, opción de lavar ropa y **planes por día** (trabajo, cena especial, playa, senderismo…).
- **Recibir un look por día** usando solo tus prendas y el **tiempo real** (Open-Meteo). Cada propuesta explica por qué se eligió y avisa de lo que falta.
- **Modificar los looks**: otra propuesta, cambiar una prenda, elegir a mano, descartar, guardar en **favoritos** y reutilizar favoritos en otros días.
- **Lista de maleta** generada a partir de los looks: prendas agrupadas con los días en que se usan, básicos sugeridos, elementos propios, progreso guardado y estimación de espacio. Se puede imprimir.
- Cuentas con **alta, inicio de sesión, recuperación de contraseña** y **eliminación de cuenta** con todos sus datos.

La app no inventa prendas, actividades ni datos del tiempo: si falta información lo dice, marca la propuesta como *aproximada* o te pide completarla.

## Requisitos

- Node.js **22.18 o superior** (Next.js 16 necesita ≥ 20.9; las pruebas unitarias usan TypeScript nativo de Node ≥ 22.18).
- npm 10+.
- Conexión a internet para la previsión del tiempo (opcional: sin ella la app funciona y permite introducir el tiempo a mano).

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:3000
```

Producción local:

```bash
npm run build
npm start            # http://localhost:3000
```

Los datos (usuarios, viajes y fotos) se guardan en `./data` (configurable con `DATA_DIR`). Esa carpeta está en `.gitignore` y **no debe subirse al repositorio**. Variables opcionales en [`.env.example`](.env.example).

> Nota: el archivo `entrar.txt` de la carpeta habla de `php artisan serve` y del puerto 8000; esas instrucciones no corresponden a esta app (son de otro proyecto). Esta app solo necesita `npm run dev`.

### Recuperar contraseña en desarrollo

Sin proveedor de correo configurado, en `npm run dev` el enlace de recuperación se escribe en la consola del servidor (`[mail:desarrollo]`). En producción no se registra nunca: hay que configurar `RESEND_API_KEY` y `MAIL_FROM` (ver [docs/LANZAMIENTO.md](docs/LANZAMIENTO.md)).

## Comprobaciones

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # pruebas unitarias (motor de looks, maleta, viajes, fotos, clima)
npm run build        # compilación de producción
npm run check        # todo lo anterior
```

Prueba de extremo a extremo (opcional, requiere Playwright):

```bash
npm i -D playwright && npx playwright install chromium
npm run build && npm run test:e2e
```

Recorre como usuario nuevo y habitual: alta con validaciones, subida de fotos (incluido un archivo que no es imagen), armario con búsqueda/filtros/edición/borrado, viaje con dos destinos, tiempo manual, planes, propuesta de looks, otra propuesta, favorito, cambio de prenda, descarte, maleta, favoritos, “Mi estilo”, aislamiento entre dos usuarios (fotos y viajes), baja de cuenta, cierre de sesión, credenciales erróneas y recuperación. También comprueba que no haya desbordamiento horizontal a 360, 768 y 1440 px y guarda capturas en `test-results/`.

## Estructura

```
src/
  app/
    page.tsx                 Página de presentación (pública)
    (auth)/                  Alta, inicio de sesión, recuperar y restablecer contraseña
    (app)/                   Zona privada (exige sesión)
      home/                  Inicio con primeros pasos y próximo viaje
      wardrobe/              Armario: lista, alta y edición de prendas
      trips/, trip/          Viajes: lista, creación, edición y detalle (looks + maleta)
      favorites/, train/     Looks favoritos y valoración de prendas ("Mi estilo")
      today/, account/       Look de hoy y cuenta
    api/photos/              Subida y descarga autenticada de fotos
    actions.ts               Server Actions (todas validan sesión y datos)
  lib/domain/                Lógica pura y probada: tipos, motor de looks, maleta, viajes, fotos, clima
  lib/client/photo.ts        Compresión de fotos en el navegador (y eliminación de EXIF/GPS)
  server/                    Autenticación, almacenamiento por usuario, correo
  proxy.ts                   Redirección optimista a /login (Next 16 "proxy", antes "middleware")
tests/                       Pruebas unitarias (node:test)
scripts/e2e.mjs              Prueba de extremo a extremo con Playwright
docs/                        Decisiones y pasos pendientes para el lanzamiento
```

Más contexto: [docs/DECISIONES.md](docs/DECISIONES.md) y [docs/LANZAMIENTO.md](docs/LANZAMIENTO.md).
