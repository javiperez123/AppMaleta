import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

// En desarrollo, permite abrir la app desde el móvil en la misma red Wi-Fi (http://IP-del-PC:3000).
// Solo se aceptan las IP locales de este propio ordenador.
const localIps = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n!.address);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: localIps,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Rutas del prototipo anterior
    return [
      { source: "/trip/plan", destination: "/trips", permanent: false },
      { source: "/loading", destination: "/trips", permanent: false },
    ];
  },
};

export default nextConfig;
