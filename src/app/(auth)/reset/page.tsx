import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "../AuthForms";
import { Notice } from "@/components/Notice";
import { isResetTokenValid } from "@/server/auth";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = token ? await isResetTokenValid(token) : false;
  return (
    <>
      <h1 className="text-3xl font-semibold">Elige una contraseña nueva</h1>
      <div className="mt-8">
        {valid && token ? (
          <ResetForm token={token} />
        ) : (
          <div className="flex flex-col gap-5">
            <Notice tone="error">El enlace no es válido o ha caducado.</Notice>
            <Link href="/forgot" className="btn btn-primary">
              Pedir un enlace nuevo
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
