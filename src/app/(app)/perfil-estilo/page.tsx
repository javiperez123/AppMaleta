import type { Metadata } from "next";
import { PageHeader } from "@/components/AppShell";
import { requireUser } from "@/server/auth";
import { getUserData } from "@/server/data";
import { CATALOG } from "@/lib/domain/catalog";
import { StyleSwipeClient } from "./StyleSwipeClient";

export const metadata: Metadata = { title: "Tu estilo personal" };

export default async function PerfilEstiloPage() {
  const user = await requireUser();
  const userData = await getUserData(user.id).catch(() => null);
  const profile = userData?.styleProfile;

  // Build initial queue: shuffle all 105 items
  const seenIds = new Set(profile?.likedIds ?? []);
  const queue = [...CATALOG].sort(() => Math.random() - 0.5);

  return (
    <>
      <PageHeader
        eyebrow="Estilo personal"
        title="Define tu estilo"
        description="Desliza para descubrir qué te gusta. Usamos tus preferencias para personalizar los looks."
      />
      <StyleSwipeClient
        initialQueue={queue}
        existingProfile={profile}
        likedCount={profile?.likedIds.length ?? 0}
        swipeCount={profile?.swipeCount ?? 0}
      />
    </>
  );
}
