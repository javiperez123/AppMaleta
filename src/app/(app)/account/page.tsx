import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { requireUser } from "@/server/auth";
import { logoutAction } from "@/app/actions";
import { DeleteAccountForm, ProfileForm } from "./AccountForms";

export const metadata: Metadata = { title: "Tu cuenta" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Tu cuenta" description={user.email} />
      <div className="grid max-w-2xl gap-6">
        <section className="card p-5 sm:p-6" aria-labelledby="profile-h">
          <h2 id="profile-h" className="text-xl font-semibold">
            Perfil
          </h2>
          <ProfileForm name={user.name} />
        </section>
        <section className="card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Sesión</h2>
          <form action={logoutAction} className="mt-4">
            <button type="submit" className="btn btn-secondary">
              <LogOut size={18} aria-hidden="true" /> Cerrar sesión
            </button>
          </form>
        </section>
        <section className="card border-danger/30 p-5 sm:p-6" aria-labelledby="danger-h">
          <h2 id="danger-h" className="text-xl font-semibold text-danger">
            Eliminar cuenta
          </h2>
          <p className="mt-2 text-ink-2">
            Se borrarán para siempre tu cuenta, tus prendas, sus fotos, tus viajes y tus favoritos.
          </p>
          <DeleteAccountForm email={user.email} />
        </section>
      </div>
    </>
  );
}
