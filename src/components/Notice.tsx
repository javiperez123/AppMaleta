import { CircleCheck, Info, TriangleAlert } from "lucide-react";

type Tone = "info" | "success" | "warning" | "error";
const styles: Record<Tone, string> = {
  info: "bg-sea-soft text-sea border-sea/20",
  success: "bg-sea-soft text-sea border-sea/20",
  warning: "bg-sun-soft text-sun border-sun/20",
  error: "bg-danger-soft text-danger border-danger/20",
};
const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: TriangleAlert };

export function Notice({ tone = "info", children, className = "" }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium ${styles[tone]} ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
