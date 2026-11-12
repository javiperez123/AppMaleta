// Prueba de extremo a extremo de los flujos principales (requiere Playwright: `npm i -D playwright && npx playwright install chromium`).
// Uso: npm run build && npm run test:e2e   (arranca `next start` en el puerto 3100 con una carpeta de datos temporal)
// o:   E2E_URL=http://localhost:3000 npm run test:e2e   (contra un servidor ya arrancado)
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = path.join(root, "scripts", "fixtures");
const out = path.join(root, "test-results");
mkdirSync(out, { recursive: true });

let server;
let dataDir;
let BASE = process.env.E2E_URL;
if (!BASE) {
  dataDir = mkdtempSync(path.join(tmpdir(), "maleta-e2e-"));
  BASE = "http://localhost:3100";
  server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3100"], {
    cwd: root,
    env: { ...process.env, DATA_DIR: dataDir, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

const results = [];
const livePages = new Set();
const consoleErrors = [];
async function step(name, fn) {
  const t = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t });
    console.log(`✔ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    for (const [i, pg] of [...livePages].entries())
      await pg.screenshot({ path: path.join(out, `fallo-${results.length}-${i}.png`), fullPage: true }).catch(() => {});
    console.log(`✘ ${name}\n   ${e.message.split("\n")[0]}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch();
const watch = (page, label) => {
  livePages.add(page);
  page.on("close", () => livePages.delete(page));
  if (process.env.E2E_DEBUG) page.on("response", (r) => r.url().includes("/api/") && console.log(`   [${label}] ${r.status()} ${r.url()}`));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`[${label}] ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleErrors.push(`[${label}] pageerror: ${e.message}`));
};

const stamp = Date.now();
const userA = { name: "Ana Prueba", email: `ana.${stamp}@example.test`, password: "contrasena-segura-1" };
const userB = { name: "Bea Prueba", email: `bea.${stamp}@example.test`, password: "otra-contrasena-2" };

const mobile = await browser.newContext({ ...devices["iPhone 13"], locale: "es-ES" });
const page = await mobile.newPage();
watch(page, "A-móvil");
const shot = async (p, name) => {
  // Fuerza la carga de imágenes diferidas antes de la captura
  await p.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
};

let tripUrl = "";
let photoUrl = "";

await step("Landing pública y redirección de rutas privadas", async () => {
  await page.goto(BASE);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await shot(page, "01-landing-movil");
  await page.goto(`${BASE}/wardrobe`);
  assert(page.url().includes("/login"), "sin sesión debe redirigir a /login");
});

await step("Alta: validación y creación de cuenta", async () => {
  await page.goto(`${BASE}/signup`);
  await page.getByRole("button", { name: "Crear cuenta gratis" }).click();
  await page.getByText("Dinos cómo te llamas.").waitFor();
  await page.getByLabel("Tu nombre").fill(userA.name);
  await page.getByLabel("Email").fill(userA.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(userA.password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Crear cuenta gratis" }).click();
  await page.waitForURL(/\/home/);
  await page.getByRole("heading", { name: "Primeros pasos" }).waitFor();
  await shot(page, "02-inicio-onboarding-movil");
});

async function addGarment(p, { name, category, photo, formality, warmth, waterproof, another }) {
  if (!p.url().includes("/wardrobe/add")) await p.goto(`${BASE}/wardrobe/add`);
  if (photo) {
    await p.locator('input[type=file]:not([capture])').setInputFiles(path.join(fixtures, photo));
    await p.waitForFunction(() => document.querySelector('input[name="imageId"]')?.value?.length > 10, null, { timeout: 15000 });
  }
  await p.getByLabel("Nombre").fill(name);
  await p.locator("label").filter({ hasText: new RegExp(`^${category}$`) }).first().click();
  if (formality) await p.locator("fieldset", { hasText: "Estilo" }).locator("label").filter({ hasText: formality }).click();
  if (warmth) await p.locator("fieldset", { hasText: "¿Cuánto abriga?" }).locator("label").filter({ hasText: warmth }).click();
  if (waterproof) await p.getByLabel("Es impermeable o sirve para la lluvia").check();
  await p.getByRole("button", { name: another ? "Guardar y añadir otra" : "Guardar prenda" }).click();
  await p.waitForURL(another ? /\/wardrobe\/add\?guardada=/ : /\/wardrobe\?nueva=/);
  // Espera a que la pantalla se haya vuelto a pintar (el formulario se monta de nuevo)
  if (another) await p.getByText(`«${name}» guardada`).waitFor();
}

await step("Armario: fotos, validaciones y alta de prendas", async () => {
  await page.goto(`${BASE}/wardrobe`);
  await page.getByText("Tu armario está vacío").waitFor();
  await page.goto(`${BASE}/wardrobe/add`);
  await page.getByRole("button", { name: "Guardar prenda" }).click();
  await page.getByText("Ponle un nombre a la prenda.").waitFor();
  await page.locator('input[type=file]:not([capture])').setInputFiles(path.join(fixtures, "no-es-imagen.jpg"));
  await page.getByText(/no es una imagen|No podemos leer|Formato no admitido/).waitFor();
  await shot(page, "03-alta-prenda-errores-movil");
  await addGarment(page, { name: "Camiseta blanca", category: "Parte de arriba", photo: "camiseta.jpg", formality: "Casual", warmth: "Fresca", another: true });
  await page.getByText("«Camiseta blanca» guardada").waitFor();
  await addGarment(page, { name: "Camisa azul", category: "Parte de arriba", photo: "camisa.jpg", formality: "Arreglado informal", warmth: "Entretiempo", another: true });
  await addGarment(page, { name: "Vaquero", category: "Parte de abajo", photo: "vaquero.jpg", formality: "Casual", warmth: "Entretiempo", another: true });
  await addGarment(page, { name: "Chino beige", category: "Parte de abajo", photo: "chino.jpg", formality: "Arreglado informal", warmth: "Entretiempo", another: true });
  await addGarment(page, { name: "Zapatillas", category: "Calzado", photo: "zapatillas.jpg", formality: "Casual", another: true });
  await addGarment(page, { name: "Zapatos de piel", category: "Calzado", photo: "zapatos.jpg", formality: "Elegante", another: true });
  await addGarment(page, { name: "Chubasquero", category: "Abrigo o chaqueta", photo: "chubasquero.jpg", warmth: "Fresca", waterproof: true, another: true });
  await addGarment(page, { name: "Gorra", category: "Accesorio" });
  await page.getByText("Prenda añadida al armario.").waitFor();
  const cards = await page.locator("main ul li a[href^='/wardrobe/']").count();
  assert(cards === 8, `esperaba 8 prendas, hay ${cards}`);
  photoUrl = await page.locator("main img[src^='/api/photos/']").first().getAttribute("src");
  assert(photoUrl, "debe haber fotos subidas");
  await shot(page, "04-armario-movil");
});

await step("Armario: búsqueda, filtros, edición y eliminación", async () => {
  await page.getByLabel("Buscar prendas").fill("chino");
  await page.waitForFunction(() => document.querySelectorAll("main ul li a[href^='/wardrobe/']").length === 1);
  await page.getByLabel("Buscar prendas").fill("");
  await page.getByRole("button", { name: /^Calzado/ }).click();
  await page.waitForFunction(() => document.querySelectorAll("main ul li a[href^='/wardrobe/']").length === 2);
  await page.getByRole("button", { name: /^Datos incompletos/ }).click();
  await page.getByText("Gorra").waitFor();
  await page.getByText("Gorra").click();
  await page.waitForURL(/\/wardrobe\/[a-z0-9]+$/);
  await page.getByLabel("Nombre").fill("Gorra de lona");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.getByText("Cambios guardados.").waitFor();
  await page.getByText("Gorra de lona").click();
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
  await page.waitForURL(/eliminada=1/);
  assert((await page.getByText("Gorra de lona").count()) === 0, "la prenda debe desaparecer");
});

await step("Viaje: validación y creación con dos destinos", async () => {
  await page.goto(`${BASE}/trip/create`);
  await page.getByRole("button", { name: "Crear viaje" }).click();
  await page.getByText(/Indica la ciudad/).waitFor();
  await page.getByLabel("Ciudad").fill("Lisboa");
  await page.getByLabel("Llegada").fill("2027-04-10");
  await page.getByLabel("Salida").fill("2027-04-12");
  await page.getByRole("button", { name: "Añadir otro destino" }).click();
  await page.getByLabel("Ciudad").nth(1).fill("Oporto");
  await page.getByLabel("Salida").nth(1).fill("2027-04-13");
  await page.getByText("Maleta de cabina").click();
  await page.getByLabel("Nombre del viaje").fill("Portugal en primavera");
  await page.getByRole("button", { name: "Crear viaje" }).click();
  await page.waitForURL(/\/trip\/[a-z0-9]+\?nuevo=1/, { timeout: 60000 });
  tripUrl = page.url().split("?")[0];
  const days = await page.locator("main ol > li article").count();
  assert(days === 4, `esperaba 4 días, hay ${days}`);
  await shot(page, "05-viaje-nuevo-movil");
});

await step("Viaje: tiempo manual, planes y propuesta de looks", async () => {
  const day1 = page.locator("article").nth(0);
  const hasWeather = (await day1.getByRole("button", { name: /Sin datos del tiempo/ }).count()) > 0;
  await day1.getByRole("button", { name: /Sin datos del tiempo|Tiempo:/ }).click();
  await day1.getByLabel("Mínima °C").fill("11");
  await day1.getByLabel("Máxima °C").fill("16");
  await day1.getByLabel("Lluvia").check();
  await day1.getByRole("button", { name: "Guardar", exact: true }).click();
  await day1.getByText("Indicado por ti").waitFor();
  const day2 = page.locator("article").nth(1);
  await day2.getByRole("button", { name: "Editar" }).click();
  await day2.getByRole("button", { name: "Cena especial" }).click();
  await day2.getByLabel(/Detalle/).fill("Cena con amigos");
  await day2.getByRole("button", { name: "Guardar planes" }).click();
  await day2.getByText("Cena especial: Cena con amigos").waitFor();
  await page.getByRole("button", { name: "Proponer looks" }).click();
  await page.getByText("Looks propuestos.").waitFor({ timeout: 20000 });
  await page.waitForFunction(() => [...document.querySelectorAll("h3")].filter((h) => h.textContent === "Look propuesto").length === 4, null, { timeout: 10000 }).catch(() => {});
  const looks = await page.getByRole("heading", { name: "Look propuesto" }).count();
  assert(looks === 4, `esperaba 4 looks, hay ${looks}`);
  assert((await day1.getByText("Chubasquero").count()) > 0, "el día con lluvia debe incluir el chubasquero");
  assert((await day2.getByText("Zapatos de piel").count()) > 0, "la cena debe incluir calzado elegante");
  if (!hasWeather) assert((await page.getByText("Aproximado").count()) >= 1, "sin tiempo, los looks deben marcarse aproximados");
  await shot(page, "06-looks-movil");
});

await step("Looks: otra propuesta, favorito, cambiar prenda y descartar", async () => {
  const day3 = page.locator("article").nth(2);
  const before = await day3.locator("ul li p").allTextContents();
  await day3.getByRole("button", { name: "Otra propuesta" }).click();
  await page.waitForFunction(
    (b) => JSON.stringify([...document.querySelectorAll("article")[2].querySelectorAll("ul li p")].map((x) => x.textContent)) !== b,
    JSON.stringify(before),
  );
  await day3.getByRole("button", { name: "Guardar" }).click();
  await day3.getByRole("button", { name: "Favorito" }).waitFor();
  const day4 = page.locator("article").nth(3);
  const firstSwap = day4.getByRole("button", { name: /^Cambiar / }).first();
  await firstSwap.click();
  const dialog = page.locator("dialog[open]");
  await dialog.getByRole("heading", { name: /Cambiar/ }).waitFor();
  const options = dialog.locator("label:has(input[type=radio]:not(:checked))");
  assert((await options.count()) >= 1, "debe haber alternativas");
  await options.first().click();
  await dialog.getByRole("button", { name: "Guardar look" }).click();
  await day4.getByText("Editado").waitFor();
  await day4.getByRole("button", { name: "Descartar" }).click();
  await day4.getByText("Todavía no hay look para este día.").waitFor();
  await day4.getByRole("button", { name: "Proponer look" }).click();
  await day4.getByRole("heading", { name: "Look propuesto" }).waitFor();
});

await step("Maleta: lista, marcar, añadir extra y progreso", async () => {
  await page.goto(`${tripUrl}?tab=maleta`);
  await page.getByText("Básicos sugeridos").waitFor();
  const rows = page.locator("main section input[type=checkbox]");
  const n = await rows.count();
  assert(n >= 5, `esperaba varias filas en la maleta, hay ${n}`);
  await page.locator("main section label").first().click();
  await page.getByLabel("Añadir algo a la lista").fill("Cargador del móvil");
  await page.getByRole("button", { name: "Añadir", exact: true }).click();
  await page.getByText("Cargador del móvil").waitFor();
  await page.reload();
  assert(await page.locator("main section input[type=checkbox]").first().isChecked(), "lo marcado debe persistir");
  await shot(page, "07-maleta-movil");
});

await step("Favoritos y Mi estilo", async () => {
  await page.goto(`${BASE}/favorites`);
  await page.getByRole("button", { name: "Quitar de favoritos" }).first().waitFor();
  await shot(page, "08-favoritos-movil");
  await page.goto(`${BASE}/train`);
  await page.getByRole("button", { name: "Me encanta" }).click();
  await page.getByRole("button", { name: "Evitar" }).click();
  await page.getByText(/2 de|3 de/).waitFor();
});

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-ES" });
await desktop.addCookies(await mobile.cookies());
const dpage = await desktop.newPage();
watch(dpage, "A-escritorio");
await step("Escritorio: pantallas principales", async () => {
  for (const [url, name] of [
    ["/home", "10-inicio-escritorio"],
    ["/wardrobe", "11-armario-escritorio"],
    [tripUrl.replace(BASE, ""), "12-viaje-escritorio"],
    [`${tripUrl.replace(BASE, "")}?tab=maleta`, "13-maleta-escritorio"],
    ["/wardrobe/add", "14-alta-prenda-escritorio"],
  ]) {
    await dpage.goto(BASE + url);
    await dpage.locator("main h1").first().waitFor();
    await dpage.waitForLoadState("networkidle");
    const overflow = await dpage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert(!overflow, `${url}: desbordamiento horizontal`);
    await shot(dpage, name);
  }
});

await step("Móvil pequeño (360 px) y tableta (768 px): sin desbordamiento horizontal", async () => {
  for (const vp of [{ width: 360, height: 740 }, { width: 768, height: 1024 }]) {
    const ctx = await browser.newContext({ viewport: vp, locale: "es-ES" });
    await ctx.addCookies(await mobile.cookies());
    const p = await ctx.newPage();
    watch(p, `A-${vp.width}`);
    for (const url of ["/home", "/wardrobe", "/wardrobe/add", "/trips", "/trip/create", tripUrl.replace(BASE, ""), `${tripUrl.replace(BASE, "")}?tab=maleta`, "/favorites", "/train", "/account"]) {
      await p.goto(BASE + url);
      await p.locator("main h1").first().waitFor();
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 1, `${vp.width}px ${url}: desborda ${overflow}px`);
    }
    await shot(p, `15-viaje-${vp.width}`);
    await ctx.close();
  }
});

await step("Aislamiento entre usuarios", async () => {
  const ctxB = await browser.newContext({ locale: "es-ES" });
  const pb = await ctxB.newPage();
  watch(pb, "B");
  await pb.goto(`${BASE}/signup`);
  await pb.getByLabel("Tu nombre").fill(userB.name);
  await pb.getByLabel("Email").fill(userB.email);
  await pb.getByLabel("Contraseña", { exact: true }).fill(userB.password);
  await pb.getByRole("checkbox").check();
  await pb.getByRole("button", { name: "Crear cuenta gratis" }).click();
  await pb.waitForURL(/\/home/);
  await pb.goto(`${BASE}/wardrobe`);
  await pb.getByText("Tu armario está vacío").waitFor();
  const photo = await pb.request.get(BASE + photoUrl);
  assert(photo.status() === 404, `B no debe ver la foto de A (status ${photo.status()})`);
  await pb.goto(tripUrl);
  await pb.getByRole("heading", { name: "No encontramos esta página" }).waitFor();
  assert((await pb.getByText("Portugal en primavera").count()) === 0, "B no debe ver el viaje de A");
  const anon = await (await browser.newContext()).request.get(BASE + photoUrl);
  assert(anon.status() === 401, `sin sesión la foto debe dar 401 (status ${anon.status()})`);
  // Subida directa de un archivo que no es imagen → 415
  const bad = await pb.request.post(`${BASE}/api/photos`, {
    multipart: { file: { name: "x.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<svg onload=alert(1)>") } },
  });
  assert(bad.status() === 415, `archivo no imagen debe rechazarse (status ${bad.status()})`);
  // Baja de cuenta
  await pb.goto(`${BASE}/account`);
  await pb.getByLabel(/escribe tu email/).fill(userB.email);
  await pb.getByRole("button", { name: "Eliminar mi cuenta y mis datos" }).click();
  await pb.waitForURL(/cuenta-eliminada=1/);
  await ctxB.close();
});

await step("Sesión: cerrar, error de credenciales y volver a entrar", async () => {
  await page.goto(`${BASE}/account`);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL(/\/login/);
  // Recuperación (sin sesión). Sin proveedor de correo en producción, la app lo dice en vez de fingir el envío.
  await page.goto(`${BASE}/forgot`);
  await page.getByLabel("Email de tu cuenta").fill(userA.email);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await page.getByText(/te hemos enviado un enlace|no está disponible/).waitFor();
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(userA.email);
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByText("El email o la contraseña no son correctos.").waitFor();
  await page.getByLabel("Contraseña", { exact: true }).fill(userA.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/home/);
});

await browser.close();
if (server) {
  try {
    if (process.platform !== "win32") process.kill(-server.pid, "SIGTERM");
    else server.kill();
  } catch {}
}
if (dataDir) rmSync(dataDir, { recursive: true, force: true });

const failed = results.filter((r) => !r.ok);
const relevantConsole = consoleErrors.filter((e) => !/Failed to load resource: the server responded with a status of (401|404|415)/.test(e));
console.log(`\n${results.length - failed.length}/${results.length} pasos correctos`);
if (relevantConsole.length) console.log("Errores de consola:\n" + relevantConsole.join("\n"));
process.exit(failed.length || relevantConsole.length ? 1 : 0);
