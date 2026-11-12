import "server-only";

/**
 * Envío de correos transaccionales.
 *
 * - Si están definidas RESEND_API_KEY y MAIL_FROM, se envía con la API HTTP de Resend
 *   (sin dependencias adicionales).
 * - Si no, en desarrollo el enlace se escribe en la consola del servidor para poder
 *   probar el flujo; en producción NO se registra el enlace (es una credencial) y se
 *   devuelve false para que la interfaz no prometa un envío que no ocurre.
 */
export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (isMailConfigured()) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) console.error(`[mail] Error del proveedor: HTTP ${res.status}`);
      return res.ok;
    } catch (e) {
      console.error("[mail] No se pudo enviar el correo:", (e as Error).message);
      return false;
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`\n[mail:desarrollo] Para: ${to}\nAsunto: ${subject}\n${text}\n`);
    return true;
  }
  console.warn("[mail] Correo no configurado (RESEND_API_KEY / MAIL_FROM): no se ha enviado el mensaje.");
  return false;
}
