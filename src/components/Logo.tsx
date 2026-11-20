import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1d1a16" />
      <rect x="14" y="22" width="36" height="28" rx="6" fill="#f7f3ec" />
      <path d="M25 22v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" fill="none" stroke="#f7f3ec" strokeWidth="4" />
      <rect x="14" y="31" width="36" height="5" fill="#a5452a" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-lg" aria-label={`${APP_NAME}, ir al inicio`}>
      <LogoMark />
      <span className="font-display text-2xl font-semibold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
