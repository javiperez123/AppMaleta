// Versión de prueba para el móvil en la misma red Wi-Fi.
// Compila la app (si hace falta) y la sirve en http://IP-de-este-PC:3000
// Uso: npm run movil
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
const port = process.env.PORT || "3000";

if (!existsSync(path.join(root, ".next", "BUILD_ID")) || process.argv.includes("--build")) {
  console.log("Compilando la app (solo la primera vez o con --build)…");
  const r = spawnSync(process.execPath, [next, "build"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const ips = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n.address);

console.log("\nAbre en el móvil (conectado a la misma Wi-Fi) una de estas direcciones:");
for (const ip of ips) console.log(`  http://${ip}:${port}`);
console.log("\nSi no carga, permite Node.js en el Firewall de Windows (red privada).\n");

// Sin HTTPS en la red local, la cookie de sesión no puede ser "Secure": solo para pruebas.
spawn(process.execPath, [next, "start", "-H", "0.0.0.0", "-p", port], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", INSECURE_COOKIES: "1" },
});
